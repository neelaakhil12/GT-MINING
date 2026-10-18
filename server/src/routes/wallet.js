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
    let adminAdjustmentsTotal = 0;

    transactions.forEach(tx => {
      if (tx.status === 'COMPLETED') {
        if (tx.type === 'MINING_REWARD') miningRewardsTotal += Number(tx.amount || 0);
        else if (tx.type === 'REFERRAL_REWARD') referralRewardsTotal += Number(tx.amount || 0);
        else if (tx.type === 'ADMIN_ADJUSTMENT') adminAdjustmentsTotal += Number(tx.amount || 0);
      }
    });

    return res.json({
      success: true,
      wallet: {
        availableBalance: wallet.availableBalance,
        lifetimeEarned: wallet.lifetimeEarned,
        miningRewardsTotal: Number(miningRewardsTotal.toFixed(4)),
        referralRewardsTotal: Number(referralRewardsTotal.toFixed(4)),
        adminAdjustmentsTotal: Number(adminAdjustmentsTotal.toFixed(4))
      },
      transactions: transactions.slice(0, 20)
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

    return res.json({
      success: true,
      transactions: transactions.slice(0, parseInt(limit, 10))
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
});

export default router;
