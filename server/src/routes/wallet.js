import express from 'express';
import { readDB } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wallet
router.get('/', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const userId = req.user.id;
    const wallet = db.wallets.find(w => w.userId === userId) || { availableBalance: 0.0, lifetimeEarned: 0.0 };

    const transactions = db.walletTransactions
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let miningRewardsTotal = 0;
    let referralRewardsTotal = 0;
    let taskRewardsTotal = 0;
    let adminAdjustmentsTotal = 0;

    transactions.forEach(tx => {
      if (tx.status === 'COMPLETED') {
        if (tx.type === 'MINING_REWARD') miningRewardsTotal += Number(tx.amount || 0);
        else if (tx.type === 'REFERRAL_REWARD') referralRewardsTotal += Number(tx.amount || 0);
        else if (tx.type === 'TASK_REWARD') taskRewardsTotal += Number(tx.amount || 0);
        else if (tx.type === 'ADMIN_ADJUSTMENT') adminAdjustmentsTotal += Number(tx.amount || 0);
      }
    });

    const cooldownSeconds = Number(db.settings?.cooldownSeconds || 7200);
    const cycleHours = Math.max(1, Math.round(cooldownSeconds / 3600));

    const formattedTransactions = transactions.map(tx => {
      if (tx.type === 'MINING_REWARD' && typeof tx.description === 'string') {
        const desc = tx.description.replace(/\d+-Hour Mining Reward/i, `${cycleHours}-Hour Mining Reward`);
        return { ...tx, description: desc };
      }
      return tx;
    });

    return res.json({
      success: true,
      wallet: {
        availableBalance: wallet.availableBalance,
        lifetimeEarned: wallet.lifetimeEarned,
        miningRewardsTotal: Number(miningRewardsTotal.toFixed(4)),
        referralRewardsTotal: Number(referralRewardsTotal.toFixed(4)),
        taskRewardsTotal: Number(taskRewardsTotal.toFixed(4)),
        adminAdjustmentsTotal: Number(adminAdjustmentsTotal.toFixed(4))
      },
      transactions: formattedTransactions.slice(0, 20)
    });
  } catch (err) {
    console.error('Wallet error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve wallet information.' });
  }
});

// GET /api/wallet/transactions
router.get('/transactions', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const userId = req.user.id;
    const { type, limit = 50 } = req.query;

    let transactions = db.walletTransactions.filter(tx => tx.userId === userId);

    if (type) {
      transactions = transactions.filter(tx => tx.type === type);
    }

    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const cooldownSeconds = Number(db.settings?.cooldownSeconds || 7200);
    const cycleHours = Math.max(1, Math.round(cooldownSeconds / 3600));

    const formattedTransactions = transactions.map(tx => {
      if (tx.type === 'MINING_REWARD' && typeof tx.description === 'string') {
        const desc = tx.description.replace(/\d+-Hour Mining Reward/i, `${cycleHours}-Hour Mining Reward`);
        return { ...tx, description: desc };
      }
      return tx;
    });

    return res.json({
      success: true,
      transactions: formattedTransactions.slice(0, parseInt(limit, 10))
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
});

export default router;
