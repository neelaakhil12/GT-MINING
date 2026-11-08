import express from 'express';
import { readDB, writeDB, generateId, lockManager } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/referrals/summary
router.get('/summary', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const settings = db.settings;

    const thresholdDays = Number(settings.activeThresholdDays || 7);
    const thresholdMs = thresholdDays * 86400000;
    const nowMs = Date.now();

    const userReferrals = db.referrals.filter(r => r.referrerUserId === user.id);
    const referredUserIds = userReferrals.map(r => r.referredUserId);
    const referredUsers = db.users.filter(u => referredUserIds.includes(u.id) && !u.deletedAt);

    let activeFriends = 0;
    let inactiveFriends = 0;
    let availableToClaim = 0;
    let totalCommissionClaimed = 0;
    let totalCommissionEarned = 0;

    userReferrals.forEach(ref => {
      const friend = referredUsers.find(u => u.id === ref.referredUserId);
      let isActive = false;
      if (friend && friend.lastMiningAt) {
        const lastMiningMs = new Date(friend.lastMiningAt).getTime();
        isActive = (nowMs - lastMiningMs) <= thresholdMs;
      }
      if (isActive) activeFriends++;
      else inactiveFriends++;

      const reward = Number(ref.rewardAmount || 0);
      totalCommissionEarned += reward;

      if (ref.rewardStatus === 'PENDING_CLAIM' || ref.rewardStatus === 'PENDING') {
        availableToClaim += reward;
      } else if (ref.rewardStatus === 'CLAIMED' || ref.rewardStatus === 'CREDITED') {
        totalCommissionClaimed += reward;
      }
    });

    const baseUrl = settings.websiteUrl || 'https://gtnetwork.in';
    const referralLink = `${baseUrl}/signup?ref=${user.referralCode}`;

    return res.json({
      success: true,
      referralCode: user.referralCode,
      referralLink,
      statistics: {
        totalReferrals: userReferrals.length,
        activeFriends,
        inactiveFriends,
        totalReferralRewardsEarned: Number(totalCommissionEarned.toFixed(4)),
        totalCommissionEarned: Number(totalCommissionEarned.toFixed(4)),
        availableToClaim: Number(availableToClaim.toFixed(4)),
        totalCommissionClaimed: Number(totalCommissionClaimed.toFixed(4)),
        activeThresholdDays: thresholdDays
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve referral summary.' });
  }
});

// GET /api/referrals/history
router.get('/history', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const settings = db.settings;

    const thresholdDays = Number(settings.activeThresholdDays || 7);
    const thresholdMs = thresholdDays * 86400000;
    const nowMs = Date.now();

    const userReferrals = db.referrals.filter(r => r.referrerUserId === user.id);
    const referredUserIds = userReferrals.map(r => r.referredUserId);
    const referredUsers = db.users.filter(u => referredUserIds.includes(u.id));

    const history = userReferrals.map(ref => {
      const friend = referredUsers.find(u => u.id === ref.referredUserId);
      let isActive = false;

      if (friend && friend.lastMiningAt && !friend.deletedAt) {
        const lastMiningMs = new Date(friend.lastMiningAt).getTime();
        isActive = (nowMs - lastMiningMs) <= thresholdMs;
      }

      return {
        id: ref.id,
        friendName: friend ? friend.fullName : 'Account Deleted',
        friendEmail: friend ? friend.email.replace(/(.{2})(.*)(?=@)/, '$1***') : '***@***.com',
        registeredAt: ref.createdAt,
        isActive,
        activityStatus: friend?.deletedAt ? 'DELETED' : (isActive ? 'ACTIVE' : 'INACTIVE'),
        rewardAmount: ref.rewardAmount,
        rewardStatus: (ref.rewardStatus === 'CREDITED' || ref.rewardStatus === 'CLAIMED') ? 'CLAIMED' : 'PENDING_CLAIM',
        rewardCreditedAt: ref.rewardCreditedAt
      };
    }).sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    return res.json({
      success: true,
      referrals: history
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve referral history.' });
  }
});

// POST /api/referrals/claim - Claim pending referral bonuses into wallet
router.post('/claim', requireAuth, async (req, res) => {
  await lockManager.acquire(`ref_claim_${req.user.id}`);
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      lockManager.release(`ref_claim_${req.user.id}`);
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Find all pending referrals with reward > 0
    const pendingRefs = db.referrals.filter(
      r => r.referrerUserId === user.id &&
           (r.rewardStatus === 'PENDING_CLAIM' || r.rewardStatus === 'PENDING') &&
           Number(r.rewardAmount || 0) > 0
    );

    if (pendingRefs.length === 0) {
      lockManager.release(`ref_claim_${req.user.id}`);
      return res.status(400).json({
        success: false,
        message: 'No referral commissions currently available to claim.'
      });
    }

    const totalClaimAmount = Number(
      pendingRefs.reduce((acc, r) => acc + Number(r.rewardAmount || 0), 0).toFixed(4)
    );

    if (totalClaimAmount <= 0) {
      lockManager.release(`ref_claim_${req.user.id}`);
      return res.status(400).json({
        success: false,
        message: 'Claimable referral amount must be greater than zero.'
      });
    }

    const now = new Date().toISOString();

    // Mark pending referrals as CLAIMED
    pendingRefs.forEach(ref => {
      ref.rewardStatus = 'CLAIMED';
      ref.rewardCreditedAt = now;
    });

    // Credit user's wallet
    let wallet = db.wallets.find(w => w.userId === user.id);
    if (!wallet) {
      wallet = {
        id: generateId('wal'),
        userId: user.id,
        availableBalance: 0.0,
        lifetimeEarned: 0.0,
        createdAt: now,
        updatedAt: now
      };
      db.wallets.push(wallet);
    }
    wallet.availableBalance = Number((wallet.availableBalance + totalClaimAmount).toFixed(4));
    wallet.lifetimeEarned = Number((wallet.lifetimeEarned + totalClaimAmount).toFixed(4));
    wallet.updatedAt = now;

    // Record in wallet transactions ledger
    const txId = generateId('tx');
    db.walletTransactions.push({
      id: txId,
      userId: user.id,
      type: 'REFERRAL_REWARD',
      amount: totalClaimAmount,
      status: 'COMPLETED',
      idempotencyKey: `idemp_claim_${user.id}_${Date.now()}`,
      referenceId: pendingRefs.map(r => r.id).join(','),
      description: `Referral commission claimed (${pendingRefs.length} referral${pendingRefs.length > 1 ? 's' : ''})`,
      createdAt: now,
      createdBy: user.id
    });

    // Notify user
    db.notifications.push({
      id: generateId('notif'),
      userId: user.id,
      title: 'Referral Rewards Claimed!',
      message: `Successfully claimed +${totalClaimAmount.toFixed(2)} GT referral bonus directly into your wallet.`,
      type: 'REFERRAL',
      readAt: null,
      createdAt: now
    });

    writeDB(db);
    lockManager.release(`ref_claim_${req.user.id}`);

    return res.json({
      success: true,
      message: `Successfully claimed +${totalClaimAmount.toFixed(2)} GT to wallet!`,
      claimedAmount: totalClaimAmount,
      wallet: {
        availableBalance: wallet.availableBalance,
        lifetimeEarned: wallet.lifetimeEarned
      }
    });
  } catch (err) {
    lockManager.release(`ref_claim_${req.user.id}`);
    return res.status(500).json({ success: false, message: 'Failed to claim referral reward: ' + err.message });
  }
});

export default router;
