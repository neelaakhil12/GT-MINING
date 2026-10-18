import express from 'express';
import { readDB } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { calculateMiningState } from './mining.js';

const router = express.Router();

router.get('/summary', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    const wallet = db.wallets.find(w => w.userId === req.user.id) || { availableBalance: 0.0, lifetimeEarned: 0.0 };
    const settings = db.settings;

    // Active friend threshold (e.g. last 7 days)
    const thresholdDays = Number(settings.activeThresholdDays || 7);
    const thresholdMs = thresholdDays * 86400000;
    const nowMs = Date.now();

    // Find referred users
    const userReferrals = db.referrals.filter(r => r.referrerUserId === user.id);
    const referredUserIds = userReferrals.map(r => r.referredUserId);
    const referredUsers = db.users.filter(u => referredUserIds.includes(u.id) && !u.deletedAt);

    let activeFriends = 0;
    let inactiveFriends = 0;

    const detailedReferrals = userReferrals.map(ref => {
      const friend = referredUsers.find(u => u.id === ref.referredUserId);
      let isActive = false;

      if (friend && friend.lastMiningAt) {
        const lastMiningMs = new Date(friend.lastMiningAt).getTime();
        isActive = (nowMs - lastMiningMs) <= thresholdMs;
      }

      if (isActive) {
        activeFriends++;
      } else {
        inactiveFriends++;
      }

      return {
        id: ref.id,
        friendName: friend ? friend.fullName : 'GT Miner',
        friendEmail: friend ? friend.email.replace(/(.{2})(.*)(?=@)/, '$1***') : '***@***.com',
        registeredAt: ref.createdAt,
        isActive,
        activityStatus: isActive ? 'ACTIVE' : 'INACTIVE',
        rewardAmount: ref.rewardAmount,
        rewardStatus: ref.rewardStatus,
        rewardCreditedAt: ref.rewardCreditedAt
      };
    }).sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    const miningState = calculateMiningState(user, settings);

    // Recent transactions
    const recentTransactions = db.walletTransactions
      .filter(tx => tx.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Latest community news
    const latestNews = db.communityPosts
      .filter(p => p.status === 'PUBLISHED')
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    // Unread notifications count
    const unreadNotificationsCount = db.notifications.filter(n => n.userId === user.id && !n.readAt).length;

    const baseUrl = settings.websiteUrl || 'http://localhost:5174';
    const referralLink = `${baseUrl}/signup?ref=${user.referralCode}`;

    return res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        referralCode: user.referralCode,
        role: user.role
      },
      wallet: {
        availableBalance: wallet.availableBalance,
        lifetimeEarned: wallet.lifetimeEarned
      },
      statistics: {
        totalReferrals: userReferrals.length,
        activeFriends,
        inactiveFriends,
        totalGtEarned: wallet.lifetimeEarned
      },
      referralData: {
        referralCode: user.referralCode,
        referralLink,
        recentReferrals: detailedReferrals.slice(0, 5)
      },
      mining: miningState,
      recentTransactions,
      latestNews,
      unreadNotificationsCount
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard summary.' });
  }
});

export default router;
