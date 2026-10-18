import express from 'express';
import { readDB, writeDB, generateId, lockManager } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper: Calculate mining eligibility from authoritative UTC timestamp
export const calculateMiningState = (user, settings) => {
  const cooldownSeconds = Number(settings.cooldownSeconds || 14400); // 4 hours = 14400s
  const rewardPerClaim = Number(settings.miningReward || 1.0);
  const isMiningEnabled = settings.miningEnabled !== false;

  if (!user.lastMiningAt) {
    return {
      isEligible: isMiningEnabled,
      remainingSeconds: 0,
      nextEligibleAt: null,
      lastMiningAt: null,
      cooldownSeconds,
      rewardPerClaim
    };
  }

  const lastClaimMs = new Date(user.lastMiningAt).getTime();
  const cooldownMs = cooldownSeconds * 1000;
  const nextEligibleMs = lastClaimMs + cooldownMs;
  const nowMs = Date.now();
  const diffMs = nextEligibleMs - nowMs;

  if (diffMs <= 0) {
    return {
      isEligible: isMiningEnabled,
      remainingSeconds: 0,
      nextEligibleAt: new Date(nextEligibleMs).toISOString(),
      lastMiningAt: user.lastMiningAt,
      cooldownSeconds,
      rewardPerClaim
    };
  }

  const remainingSeconds = Math.ceil(diffMs / 1000);
  return {
    isEligible: false,
    remainingSeconds,
    nextEligibleAt: new Date(nextEligibleMs).toISOString(),
    lastMiningAt: user.lastMiningAt,
    cooldownSeconds,
    rewardPerClaim
  };
};

// GET /api/mining/status
router.get('/status', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    const wallet = db.wallets.find(w => w.userId === req.user.id) || { availableBalance: 0.0, lifetimeEarned: 0.0 };
    const miningState = calculateMiningState(user, db.settings);

    return res.json({
      success: true,
      ...miningState,
      availableBalance: wallet.availableBalance,
      lifetimeEarned: wallet.lifetimeEarned,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error fetching mining status:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve mining status.' });
  }
});

// POST /api/mining/claim - Authoritative, atomic, 4-hour cooldown enforcement
router.post('/claim', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const lockKey = `mining_user_${userId}`;

  // Acquire concurrency lock for this user to guarantee race condition prevention
  await lockManager.acquire(lockKey);

  try {
    const db = readDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      lockManager.release(lockKey);
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (db.settings.miningEnabled === false) {
      lockManager.release(lockKey);
      return res.status(400).json({ success: false, message: 'Mining is currently paused by platform administrators.' });
    }

    const cooldownSeconds = Number(db.settings.cooldownSeconds || 14400); // 4 hours
    const rewardAmount = Number(db.settings.miningReward || 1.0);
    const now = new Date();
    const nowMs = now.getTime();

    // Check last mining timestamp
    if (user.lastMiningAt) {
      const lastClaimMs = new Date(user.lastMiningAt).getTime();
      const nextEligibleMs = lastClaimMs + (cooldownSeconds * 1000);

      if (nowMs < nextEligibleMs) {
        const remainingSeconds = Math.ceil((nextEligibleMs - nowMs) / 1000);
        lockManager.release(lockKey);
        return res.status(400).json({
          success: false,
          message: `Cooldown active. Next mining session available in ${Math.floor(remainingSeconds / 3600)}h ${Math.floor((remainingSeconds % 3600) / 60)}m ${remainingSeconds % 60}s.`,
          remainingSeconds,
          nextEligibleAt: new Date(nextEligibleMs).toISOString()
        });
      }
    }

    // Process valid claim atomically
    const claimId = generateId('claim');
    const txId = generateId('tx');
    const nextEligibleAt = new Date(nowMs + cooldownSeconds * 1000).toISOString();
    const claimedAt = now.toISOString();

    // 1. Update user last mining timestamp
    user.lastMiningAt = claimedAt;
    user.updatedAt = claimedAt;

    // 2. Update wallet balance
    let wallet = db.wallets.find(w => w.userId === userId);
    if (!wallet) {
      wallet = {
        id: generateId('wal'),
        userId,
        availableBalance: 0.0,
        lifetimeEarned: 0.0,
        createdAt: claimedAt,
        updatedAt: claimedAt
      };
      db.wallets.push(wallet);
    }

    wallet.availableBalance = Number((wallet.availableBalance + rewardAmount).toFixed(4));
    wallet.lifetimeEarned = Number((wallet.lifetimeEarned + rewardAmount).toFixed(4));
    wallet.updatedAt = claimedAt;

    // 3. Record mining claim
    const miningClaimRecord = {
      id: claimId,
      userId,
      rewardAmount,
      claimedAt,
      nextEligibleAt,
      transactionId: txId,
      status: 'SUCCESS'
    };
    db.miningClaims.push(miningClaimRecord);

    // 4. Record wallet transaction
    const transactionRecord = {
      id: txId,
      userId,
      type: 'MINING_REWARD',
      amount: rewardAmount,
      status: 'COMPLETED',
      idempotencyKey: `idemp_claim_${claimId}`,
      referenceId: claimId,
      description: `4-Hour Mining Reward (+${rewardAmount} GT)`,
      createdAt: claimedAt,
      createdBy: 'SYSTEM'
    };
    db.walletTransactions.push(transactionRecord);

    // 5. In-app notification
    db.notifications.push({
      id: generateId('notif'),
      userId,
      title: 'Mining Claim Successful!',
      message: `You mined +${rewardAmount} GT! Your next mining session opens in 4 hours.`,
      type: 'MINING',
      readAt: null,
      createdAt: claimedAt
    });

    writeDB(db);
    lockManager.release(lockKey);

    return res.status(200).json({
      success: true,
      message: `Successfully mined ${rewardAmount} GT!`,
      rewardAmount,
      claimedAt,
      nextEligibleAt,
      cooldownSeconds,
      remainingSeconds: cooldownSeconds,
      wallet: {
        availableBalance: wallet.availableBalance,
        lifetimeEarned: wallet.lifetimeEarned
      },
      transaction: transactionRecord
    });
  } catch (err) {
    lockManager.release(lockKey);
    console.error('Mining claim error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process mining claim.' });
  }
});

// GET /api/mining/history
router.get('/history', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const claims = db.miningClaims
      .filter(c => c.userId === req.user.id)
      .sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));

    return res.json({
      success: true,
      claims
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve mining history.' });
  }
});

export default router;
