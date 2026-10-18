import express from 'express';
import { readDB } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/referrals/summary
router.get('/summary', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    const settings = db.settings;

    const thresholdDays = Number(settings.activeThresholdDays || 7);
    const thresholdMs = thresholdDays * 86400000;
    const nowMs = Date.now();

    const userReferrals = db.referrals.filter(r => r.referrerUserId === user.id);
    const referredUserIds = userReferrals.map(r => r.referredUserId);
    const referredUsers = db.users.filter(u => referredUserIds.includes(u.id) && !u.deletedAt);

    let activeFriends = 0;
    let inactiveFriends = 0;
    let totalReferralRewardsEarned = 0;

    userReferrals.forEach(ref => {
      const friend = referredUsers.find(u => u.id === ref.referredUserId);
      let isActive = false;
      if (friend && friend.lastMiningAt) {
        const lastMiningMs = new Date(friend.lastMiningAt).getTime();
        isActive = (nowMs - lastMiningMs) <= thresholdMs;
      }
      if (isActive) activeFriends++;
      else inactiveFriends++;

      if (ref.rewardStatus === 'CREDITED') {
        totalReferralRewardsEarned += Number(ref.rewardAmount || 0);
      }
    });

    const baseUrl = settings.websiteUrl || 'http://localhost:5174';
    const referralLink = `${baseUrl}/signup?ref=${user.referralCode}`;

    return res.json({
      success: true,
      referralCode: user.referralCode,
      referralLink,
      statistics: {
        totalReferrals: userReferrals.length,
        activeFriends,
        inactiveFriends,
        totalReferralRewardsEarned: Number(totalReferralRewardsEarned.toFixed(4)),
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
        rewardStatus: ref.rewardStatus,
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

export default router;
