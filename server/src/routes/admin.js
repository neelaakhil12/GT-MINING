import express from 'express';
import fs from 'fs';
import path from 'path';
import { readDB, writeDB, generateId, lockManager } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { cleanListSpacing } from '../utils/textFormatter.js';

const router = express.Router();

// Apply requireAdmin to all routes in this file
router.use(requireAdmin);

// Helper to record an audit log
const createAuditLog = (db, adminId, action, entityType, entityId, reason, metadata = {}) => {
  db.adminAuditLogs.push({
    id: generateId('audit'),
    adminUserId: adminId,
    action,
    entityType,
    entityId,
    reason: reason || 'Administrative action executed',
    metadata,
    createdAt: new Date().toISOString()
  });
};

// GET /api/admin/dashboard
router.get('/dashboard', (req, res) => {
  try {
    const db = readDB();
    const settings = db.settings;
    const thresholdDays = Number(settings.activeThresholdDays || 7);
    const thresholdMs = thresholdDays * 86400000;
    const nowMs = Date.now();

    const nonDeletedUsers = db.users.filter(u => !u.deletedAt && u.accountStatus !== 'DELETED');
    const totalUsers = nonDeletedUsers.length;

    let activeUsers = 0;
    let inactiveUsers = 0;

    nonDeletedUsers.forEach(u => {
      if (u.lastMiningAt && (nowMs - new Date(u.lastMiningAt).getTime()) <= thresholdMs) {
        activeUsers++;
      } else {
        inactiveUsers++;
      }
    });

    const totalMiningClaims = db.miningClaims.length;
    let totalCoinsIssued = 0;
    let totalReferralRewardsCredited = 0;

    db.walletTransactions.forEach(tx => {
      if (tx.status === 'COMPLETED') {
        totalCoinsIssued += Number(tx.amount || 0);
        if (tx.type === 'REFERRAL_REWARD') {
          totalReferralRewardsCredited += Number(tx.amount || 0);
        }
      }
    });

    const recentRegistrations = nonDeletedUsers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(u => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        referralCode: u.referralCode,
        accountStatus: u.accountStatus,
        createdAt: u.createdAt
      }));

    const recentMiningActivity = db.miningClaims
      .sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt))
      .slice(0, 5)
      .map(c => {
        const u = db.users.find(usr => usr.id === c.userId);
        return {
          id: c.id,
          userName: u ? u.fullName : 'Unknown User',
          rewardAmount: c.rewardAmount,
          claimedAt: c.claimedAt,
          status: c.status
        };
      });

    const oneDayMs = 24 * 3600 * 1000;
    const dailyActiveMinersCount = nonDeletedUsers.filter(u => u.lastMiningAt && (nowMs - new Date(u.lastMiningAt).getTime()) <= oneDayMs).length;
    const pendingEmailRequestsCount = (db.emailChangeRequests || []).filter(r => r.status === 'PENDING').length;

    return res.json({
      success: true,
      metrics: {
        totalUsers,
        dailyActiveMinersCount,
        activeUsers,
        inactiveUsers,
        totalMiningClaims,
        totalCoinsIssued: Number(totalCoinsIssued.toFixed(4)),
        totalReferralRewardsCredited: Number(totalReferralRewardsCredited.toFixed(4)),
        pendingEmailRequestsCount,
        settings
      },
      recentRegistrations,
      recentMiningActivity
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin dashboard metrics.' });
  }
});

// GET /api/admin/reports - Comprehensive Reports Analytics with Daily/Total Mining & Users Breakdown
router.get('/reports', (req, res) => {
  try {
    const db = readDB();
    const now = new Date();
    const nowMs = now.getTime();
    const oneDayMs = 24 * 3600 * 1000;
    const settings = db.settings || {};
    const thresholdDays = Number(settings.activeThresholdDays || 7);
    const thresholdMs = thresholdDays * 86400000;

    const fakeEmails = new Set([
      'demo@gtmining.com',
      'demo@gtnetwork.io',
      'user@gtmining.com',
      'test@gtmining.com',
      'rahul.varma@gmail.com',
      'priya.sharma@yahoo.com',
      'arjun.reddy@outlook.com',
      'elena.rostova@crypto.net',
      'vikram.patel@hotmail.com',
      'sneha.rao@gmail.com',
      'marcus.vance@tech.co',
      'ananya.das@gmail.com',
      'david.miller@ledger.org',
      'chloe.dubois@paris.fr'
    ]);

    const isDemoUser = (u) => {
      const email = (u.email || '').toLowerCase().trim();
      const name = (u.fullName || '').toLowerCase().trim();
      return (
        fakeEmails.has(email) ||
        email.startsWith('demo@') ||
        name.includes('demo') ||
        u.isDemo === true ||
        u.id === 'usr_demo_002' ||
        u.id === 'usr_demo_miner'
      );
    };

    const users = (db.users || []).filter(u =>
      !u.isDeleted &&
      !u.deletedAt &&
      !isDemoUser(u)
    );
    const userIds = new Set(users.map(u => u.id));

    const miningClaims = (db.miningClaims || []).filter(c => userIds.has(c.userId));
    const transactions = (db.walletTransactions || []).filter(tx => userIds.has(tx.userId));

    const getClaimAmount = (c) => Number(c.rewardAmount !== undefined ? c.rewardAmount : (c.amount || 0));

    // 1. Lifetime Totals
    const totalUsers = users.length;
    let totalMiningDone = 0;
    miningClaims.forEach(c => {
      totalMiningDone += getClaimAmount(c);
    });
    totalMiningDone = Number(totalMiningDone.toFixed(4));

    let totalCoinsIssued = 0;
    let totalReferralRewards = 0;
    transactions.forEach(tx => {
      if (tx.status === 'COMPLETED') {
        const amt = Number(tx.amount || 0);
        if (tx.type === 'REFERRAL_REWARD' || tx.type === 'REFERRAL_COMMISSION' || tx.type === 'REFERRAL_BONUS') {
          totalReferralRewards += amt;
        }
        if (amt > 0) {
          totalCoinsIssued += amt;
        }
      }
    });

    // 2. Today / Daily Metrics (Last 24 Hours & Today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayMs = startOfToday.getTime();

    let dailyMiningToday = 0;
    let dailyMiningClaimsToday = 0;
    miningClaims.forEach(c => {
      const cTime = new Date(c.claimedAt).getTime();
      if (cTime >= startOfTodayMs || (nowMs - cTime) <= oneDayMs) {
        dailyMiningToday += getClaimAmount(c);
        dailyMiningClaimsToday++;
      }
    });
    dailyMiningToday = Number(dailyMiningToday.toFixed(4));

    const dailyNewUsersToday = users.filter(u => {
      const uTime = new Date(u.createdAt).getTime();
      return uTime >= startOfTodayMs || (nowMs - uTime) <= oneDayMs;
    }).length;

    const dailyActiveMinersToday = users.filter(u => {
      if (!u.lastMiningAt) return false;
      return (nowMs - new Date(u.lastMiningAt).getTime()) <= oneDayMs;
    }).length;

    let activeUsersCount = 0;
    let inactiveUsersCount = 0;
    users.forEach(u => {
      if (u.lastMiningAt && (nowMs - new Date(u.lastMiningAt).getTime()) <= thresholdMs) {
        activeUsersCount++;
      } else {
        inactiveUsersCount++;
      }
    });

    // 3. Daily History for Last 14 Days (for Bar Charts & Trend Tables)
    const daysCount = 14;
    const dailyHistory = [];
    let runningCumulativeMining = 0;

    // Calculate baseline before 14 days
    const fourteenDaysAgoMs = nowMs - (14 * oneDayMs);
    miningClaims.forEach(c => {
      if (new Date(c.claimedAt).getTime() < fourteenDaysAgoMs) {
        runningCumulativeMining += getClaimAmount(c);
      }
    });

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      const startMs = dayStart.getTime();
      const endMs = dayEnd.getTime();

      let dayMining = 0;
      let dayClaims = 0;
      miningClaims.forEach(c => {
        const cTime = new Date(c.claimedAt).getTime();
        if (cTime >= startMs && cTime <= endMs) {
          dayMining += getClaimAmount(c);
          dayClaims++;
        }
      });

      let dayUsers = 0;
      users.forEach(u => {
        const uTime = new Date(u.createdAt).getTime();
        if (uTime >= startMs && uTime <= endMs) {
          dayUsers++;
        }
      });

      runningCumulativeMining += dayMining;

      dailyHistory.push({
        date: dateStr,
        label: dayLabel,
        miningAmount: Number(dayMining.toFixed(4)),
        claimsCount: dayClaims,
        newUsers: dayUsers,
        cumulativeMining: Number(runningCumulativeMining.toFixed(4))
      });
    }

    // 4. Pie Chart Distributions
    const tokenDistribution = [
      { name: 'Mining Claims', value: Math.max(0.1, totalMiningDone), color: '#22C55E' },
      { name: 'Referral Rewards', value: Math.max(0.1, Number(totalReferralRewards.toFixed(2))), color: '#FBBF24' },
      { name: 'Network Pool / Bonus', value: Math.max(0.1, Number((totalMiningDone * 0.2).toFixed(2))), color: '#38BDF8' }
    ];

    const userActivityDistribution = [
      { name: 'Active Miners', value: Math.max(activeUsersCount, 1), color: '#22C55E' },
      { name: 'Inactive Miners', value: Math.max(inactiveUsersCount, 0), color: '#64748B' }
    ];

    return res.json({
      success: true,
      summary: {
        totalMiningDone,
        dailyMiningToday,
        dailyMiningClaimsToday,
        totalUsers,
        dailyNewUsersToday,
        dailyActiveMinersToday,
        activeUsersCount,
        inactiveUsersCount,
        totalCoinsIssued: Number(totalCoinsIssued.toFixed(4)),
        totalMiningClaimsCount: miningClaims.length
      },
      dailyHistory,
      tokenDistribution,
      userActivityDistribution
    });
  } catch (err) {
    console.error('Reports endpoint error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reports data.' });
  }
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  try {
    const db = readDB();
    const { search, status } = req.query;

    const fakeEmails = new Set([
      'demo@gtmining.com',
      'rahul.varma@gmail.com',
      'priya.sharma@yahoo.com',
      'arjun.reddy@outlook.com',
      'elena.rostova@crypto.net',
      'vikram.patel@hotmail.com',
      'sneha.rao@gmail.com',
      'marcus.vance@tech.co',
      'ananya.das@gmail.com',
      'david.miller@ledger.org',
      'chloe.dubois@paris.fr'
    ]);

    let users = (db.users || []).filter(u => {
      const email = (u.email || '').toLowerCase().trim();
      const name = (u.fullName || '').toLowerCase().trim();
      const isDemo =
        fakeEmails.has(email) ||
        email.startsWith('demo@') ||
        name.includes('demo miner') ||
        u.isDemo === true ||
        u.id === 'usr_demo_002' ||
        u.id === 'usr_demo_miner';
      return !isDemo && !u.deletedAt && !u.isDeleted;
    });

    if (status) {
      users = users.filter(u => u.accountStatus === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      users = users.filter(u =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.referralCode.toLowerCase().includes(q)
      );
    }

    const result = users.map(u => {
      const wallet = db.wallets.find(w => w.userId === u.id) || { availableBalance: 0, lifetimeEarned: 0 };
      const referralCount = db.referrals.filter(r => r.referrerUserId === u.id).length;
      const claimsCount = db.miningClaims.filter(c => c.userId === u.id).length;

      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        referralCode: u.referralCode,
        role: u.role,
        accountStatus: u.accountStatus,
        lastMiningAt: u.lastMiningAt,
        createdAt: u.createdAt,
        walletBalance: wallet.availableBalance,
        referralCount,
        claimsCount
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      users: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// GET /api/admin/top-miners - All GT miners ranked sequentially by their wallet GT coin balance
router.get('/top-miners', (req, res) => {
  try {
    const db = readDB();
    const dummyEmails = new Set([
      'demo@gtmining.com',
      'demo@gtnetwork.io',
      'user@gtmining.com',
      'test@gtmining.com',
      'testuser@gtmining.com'
    ]);

    let users = (db.users || []).filter(u => {
      const email = (u.email || '').toLowerCase().trim();
      const name = (u.fullName || '').toLowerCase().trim();
      const role = (u.role || '').toUpperCase().trim();
      const isDemo =
        dummyEmails.has(email) ||
        email.startsWith('demo@') ||
        name.includes('demo miner') ||
        u.isDemo === true ||
        u.id === 'usr_demo_002' ||
        u.id === 'usr_demo_miner';

      const isMasterAdmin =
        email === 'gtmining2026@gmail.com' ||
        u.id === 'usr_admin_001';

      return !isDemo && !isMasterAdmin && !u.deletedAt && !u.isDeleted;
    });

    const miners = users.map(u => {
      const wallet = (db.wallets || []).find(w => w.userId === u.id) || { availableBalance: 0, lifetimeEarned: 0 };
      const claims = (db.miningClaims || []).filter(c => c.userId === u.id);
      const totalMinedFromClaims = claims.reduce((acc, c) => acc + Number(c.rewardAmount || c.amount || 0), 0);
      const miningTxTotal = (db.walletTransactions || [])
        .filter(tx => tx.userId === u.id && tx.type === 'MINING_REWARD')
        .reduce((acc, tx) => acc + Number(tx.amount || 0), 0);
      const walletLifetime = Number(wallet.lifetimeEarned || 0);
      const totalMined = Math.max(totalMinedFromClaims, miningTxTotal, walletLifetime);

      const referralCount = (db.referrals || []).filter(r => r.referrerUserId === u.id).length;
      const referralEarnings = (db.walletTransactions || [])
        .filter(tx => tx.userId === u.id && (tx.type === 'REFERRAL' || tx.type === 'DIVIDEND' || tx.type === 'COMMISSION'))
        .reduce((acc, tx) => acc + Number(tx.amount || 0), 0);

      const gtWalletCoins = Number((Number(wallet.availableBalance) || totalMined || 0).toFixed(4));
      const lifetimeEarned = Number(Math.max(walletLifetime, totalMined).toFixed(4));
      const completedCycles = Math.max(
        claims.length,
        (db.walletTransactions || []).filter(tx => tx.userId === u.id && tx.type === 'MINING_REWARD').length
      );

      return {
        id: u.id,
        fullName: u.fullName || 'Anonymous Miner',
        email: u.email,
        phone: u.phone || 'N/A',
        referralCode: u.referralCode || 'N/A',
        accountStatus: u.accountStatus || 'ACTIVE',
        gtWalletCoins,
        totalMined: Number(totalMined.toFixed(4)),
        lifetimeEarned,
        referralEarnings: Number(referralEarnings.toFixed(4)),
        completedCycles,
        referralCount,
        lastMiningAt: u.lastMiningAt || (claims.length > 0 ? claims[claims.length - 1].claimedAt : null),
        createdAt: u.createdAt
      };
    });

    // Sequence order: strictly by GT wallet coins count in descending order!
    miners.sort((a, b) => b.gtWalletCoins - a.gtWalletCoins || b.totalMined - a.totalMined);

    // Assign Rank #1, #2, #3, #4...
    const rankedMiners = miners.map((m, idx) => ({
      ...m,
      rank: idx + 1
    }));

    const totalCoinsInCirculation = Number(rankedMiners.reduce((acc, m) => acc + m.gtWalletCoins, 0).toFixed(4));

    return res.json({
      success: true,
      totalMiners: rankedMiners.length,
      totalCoinsInCirculation,
      topMiners: rankedMiners
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch top miners.' });
  }
});

// PATCH /api/admin/users/:id - Update status (SUSPEND / ACTIVATE)
router.patch('/users/:id', async (req, res) => {
  const { accountStatus, reason } = req.body;
  if (!accountStatus || !['ACTIVE', 'SUSPENDED'].includes(accountStatus)) {
    return res.status(400).json({ success: false, message: 'Valid status (ACTIVE or SUSPENDED) required.' });
  }

  const db = readDB();
  const targetUser = db.users.find(u => u.id === req.params.id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (targetUser.role === 'ADMIN') {
    return res.status(400).json({ success: false, message: 'Cannot modify administrator status.' });
  }

  const previousStatus = targetUser.accountStatus;
  targetUser.accountStatus = accountStatus;
  targetUser.updatedAt = new Date().toISOString();

  createAuditLog(
    db,
    req.user.id,
    'USER_STATUS_CHANGE',
    'USER',
    targetUser.id,
    reason || `Changed account status from ${previousStatus} to ${accountStatus}`,
    { previousStatus, newStatus: accountStatus }
  );

  writeDB(db);

  return res.json({
    success: true,
    message: `User account has been ${accountStatus.toLowerCase()}.`,
    user: targetUser
  });
});

// DELETE /api/admin/users/:id - Delete user permanently
router.delete('/users/:id', async (req, res) => {
  try {
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = db.users[userIndex];
    if (targetUser.role === 'ADMIN' || targetUser.email.toLowerCase() === 'gtmining2026@gmail.com') {
      return res.status(400).json({ success: false, message: 'Cannot delete administrator account.' });
    }

    const deletedEmail = targetUser.email;
    const deletedName = targetUser.fullName;
    const deletedId = targetUser.id;

    // Permanently remove user from users array
    db.users.splice(userIndex, 1);

    // Clean up user's active wallet, mining claims, and associated records
    if (db.wallets) {
      db.wallets = db.wallets.filter(w => w.userId !== deletedId);
    }
    if (db.miningClaims) {
      db.miningClaims = db.miningClaims.filter(c => c.userId !== deletedId);
    }
    if (db.taskSubmissions) {
      db.taskSubmissions = db.taskSubmissions.filter(s => s.userId !== deletedId);
    }
    if (db.emailChangeRequests) {
      db.emailChangeRequests = db.emailChangeRequests.filter(r => r.userId !== deletedId);
    }
    if (db.accountDeletionRequests) {
      db.accountDeletionRequests = db.accountDeletionRequests.filter(r => r.userId !== deletedId);
    }

    createAuditLog(
      db,
      req.user?.id || 'admin',
      'USER_DELETED',
      'USER',
      deletedId,
      `Admin permanently deleted user "${deletedName}" (${deletedEmail})`
    );

    writeDB(db);

    return res.json({
      success: true,
      message: `User ${deletedName} (${deletedEmail}) has been deleted successfully.`
    });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

// GET /api/admin/mining-settings
router.get('/mining-settings', (req, res) => {
  const db = readDB();
  return res.json({
    success: true,
    settings: {
      miningReward: db.settings.miningReward,
      cooldownSeconds: db.settings.cooldownSeconds,
      userMiningTarget: Number(db.settings.userMiningTarget || 1000.0),
      miningEnabled: db.settings.miningEnabled !== false
    }
  });
});

// PATCH /api/admin/mining-settings
router.patch('/mining-settings', (req, res) => {
  const { miningReward, cooldownSeconds, userMiningTarget, miningEnabled, reason } = req.body;
  const db = readDB();

  if (miningReward !== undefined && Number.isFinite(Number(miningReward))) {
    db.settings.miningReward = Math.max(0.01, Number(miningReward));
  }
  if (cooldownSeconds !== undefined && Number.isFinite(Number(cooldownSeconds))) {
    db.settings.cooldownSeconds = Math.max(60, Number(cooldownSeconds));
  }
  if (userMiningTarget !== undefined && Number.isFinite(Number(userMiningTarget))) {
    db.settings.userMiningTarget = Math.max(0.01, Number(userMiningTarget));
  }
  if (miningEnabled !== undefined) db.settings.miningEnabled = Boolean(miningEnabled);

  createAuditLog(
    db,
    req.user.id,
    'UPDATE_MINING_SETTINGS',
    'SETTINGS',
    'mining',
    reason || 'Updated mining reward and target configuration',
    {
      miningReward: db.settings.miningReward,
      cooldownSeconds: db.settings.cooldownSeconds,
      userMiningTarget: db.settings.userMiningTarget,
      miningEnabled: db.settings.miningEnabled
    }
  );

  writeDB(db);

  return res.json({
    success: true,
    message: 'Mining settings updated successfully.',
    settings: {
      miningReward: db.settings.miningReward,
      cooldownSeconds: db.settings.cooldownSeconds,
      userMiningTarget: Number(db.settings.userMiningTarget || 1000.0),
      miningEnabled: db.settings.miningEnabled
    }
  });
});

// GET /api/admin/referrals
router.get('/referrals', (req, res) => {
  const db = readDB();
  const referrals = db.referrals.map(ref => {
    const referrer = db.users.find(u => u.id === ref.referrerUserId);
    const referred = db.users.find(u => u.id === ref.referredUserId);
    return {
      id: ref.id,
      referrerName: referrer ? referrer.fullName : 'Unknown',
      referrerEmail: referrer ? referrer.email : 'Unknown',
      referredName: referred ? referred.fullName : 'Unknown',
      referredEmail: referred ? referred.email : 'Unknown',
      referralCodeUsed: ref.referralCodeUsed,
      rewardAmount: ref.rewardAmount,
      rewardStatus: ref.rewardStatus,
      status: ref.status,
      createdAt: ref.createdAt,
      rewardCreditedAt: ref.rewardCreditedAt
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({
    success: true,
    referrals,
    settings: {
      referralReward: db.settings.referralReward,
      activeThresholdDays: db.settings.activeThresholdDays
    }
  });
});

// PATCH /api/admin/referral-settings
router.patch('/referral-settings', (req, res) => {
  const { referralReward, activeThresholdDays, reason } = req.body;
  const db = readDB();

  if (referralReward !== undefined) db.settings.referralReward = Math.max(0, Number(referralReward));
  if (activeThresholdDays !== undefined) db.settings.activeThresholdDays = Math.max(1, Number(activeThresholdDays));

  createAuditLog(
    db,
    req.user.id,
    'UPDATE_REFERRAL_SETTINGS',
    'SETTINGS',
    'referrals',
    reason || 'Updated referral reward and active user threshold',
    { referralReward: db.settings.referralReward, activeThresholdDays: db.settings.activeThresholdDays }
  );

  writeDB(db);

  return res.json({
    success: true,
    message: 'Referral configuration updated successfully.',
    settings: {
      referralReward: db.settings.referralReward,
      activeThresholdDays: db.settings.activeThresholdDays
    }
  });
});

// GET /api/admin/transactions
router.get('/transactions', (req, res) => {
  const db = readDB();
  const transactions = db.walletTransactions.map(tx => {
    const user = db.users.find(u => u.id === tx.userId);
    return {
      ...tx,
      userName: user ? user.fullName : 'Deleted User',
      userEmail: user ? user.email : 'anonymized'
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({
    success: true,
    transactions
  });
});

// POST /api/admin/transactions/adjust - Safe Ledger-based Manual Wallet Adjustment
router.post('/transactions/adjust', async (req, res) => {
  const { userId, amount, reason } = req.body;

  if (!userId || amount === undefined || isNaN(Number(amount)) || Number(amount) === 0) {
    return res.status(400).json({ success: false, message: 'Target userId and non-zero amount are required.' });
  }

  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, message: 'A recorded reason is mandatory for manual balance adjustments.' });
  }

  const numAmount = Number(amount);
  await lockManager.acquire(`wallet_adj_${userId}`);

  try {
    const db = readDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      lockManager.release(`wallet_adj_${userId}`);
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let wallet = db.wallets.find(w => w.userId === userId);
    if (!wallet) {
      wallet = {
        id: generateId('wal'),
        userId,
        availableBalance: 0.0,
        lifetimeEarned: 0.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.wallets.push(wallet);
    }

    const previousBalance = wallet.availableBalance;
    const newBalance = Number((previousBalance + numAmount).toFixed(4));

    if (newBalance < 0) {
      lockManager.release(`wallet_adj_${userId}`);
      return res.status(400).json({ success: false, message: 'Adjustment would result in negative wallet balance.' });
    }

    const now = new Date().toISOString();
    wallet.availableBalance = newBalance;
    if (numAmount > 0) {
      wallet.lifetimeEarned = Number((wallet.lifetimeEarned + numAmount).toFixed(4));
    }
    wallet.updatedAt = now;

    // Create ledger transaction
    const txId = generateId('tx');
    const transaction = {
      id: txId,
      userId,
      type: 'ADMIN_ADJUSTMENT',
      amount: numAmount,
      status: 'COMPLETED',
      idempotencyKey: `idemp_adj_${txId}`,
      referenceId: null,
      description: `Manual adjustment by administrator: ${reason.trim()}`,
      createdAt: now,
      createdBy: req.user.email
    };
    db.walletTransactions.push(transaction);

    // Notify user
    db.notifications.push({
      id: generateId('notif'),
      userId,
      title: 'Wallet Adjustment Notice',
      message: `Your balance was adjusted by ${numAmount >= 0 ? '+' : ''}${numAmount} GT. Reason: ${reason.trim()}`,
      type: 'SYSTEM',
      readAt: null,
      createdAt: now
    });

    createAuditLog(
      db,
      req.user.id,
      'MANUAL_WALLET_ADJUSTMENT',
      'WALLET',
      wallet.id,
      reason.trim(),
      { userId, userEmail: user.email, previousBalance, newBalance, adjustmentAmount: numAmount }
    );

    writeDB(db);
    lockManager.release(`wallet_adj_${userId}`);

    return res.json({
      success: true,
      message: `Successfully adjusted balance by ${numAmount >= 0 ? '+' : ''}${numAmount} GT.`,
      wallet: {
        availableBalance: wallet.availableBalance,
        lifetimeEarned: wallet.lifetimeEarned
      },
      transaction
    });
  } catch (err) {
    lockManager.release(`wallet_adj_${userId}`);
    return res.status(500).json({ success: false, message: 'Adjustment failed.' });
  }
});

// Community Management Routes
router.get('/community/posts', (req, res) => {
  try {
    const db = readDB();
    const rawPosts = Array.isArray(db.communityPosts) ? db.communityPosts : [];
    const posts = [...rawPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, posts });
  } catch (err) {
    console.error('Error fetching admin community posts:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch posts', posts: [] });
  }
});

router.post('/community/posts', (req, res) => {
  const { title, content, imageUrl, category, status, isPinned, viewsCount, likesCount } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required.' });
  }

  const db = readDB();
  const now = new Date().toISOString();
  const parsedViews = viewsCount !== undefined && !isNaN(Number(viewsCount)) ? Math.max(0, parseInt(viewsCount, 10)) : 0;
  const parsedLikes = likesCount !== undefined && !isNaN(Number(likesCount)) ? Math.max(0, parseInt(likesCount, 10)) : 0;

  const newPost = {
    id: generateId('post'),
    title: title.trim(),
    content: cleanListSpacing(content.trim()),
    imageUrl: imageUrl || null,
    category: category || 'Announcement',
    status: status || 'PUBLISHED',
    isPinned: Boolean(isPinned),
    authorName: req.user.fullName || 'Admin',
    createdBy: req.user.id,
    viewsCount: parsedViews,
    likesCount: parsedLikes,
    likedBy: [],
    commentsCount: 0,
    createdAt: now,
    updatedAt: now
  };

  db.communityPosts.push(newPost);
  createAuditLog(db, req.user.id, 'CREATE_COMMUNITY_POST', 'COMMUNITY_POST', newPost.id, `Created post "${newPost.title}"`);
  writeDB(db);

  return res.status(201).json({
    success: true,
    message: 'Post created successfully!',
    post: newPost
  });
});

router.patch('/community/posts/:id', (req, res) => {
  const { title, content, imageUrl, category, status, isPinned, viewsCount, likesCount } = req.body;
  const db = readDB();
  const post = db.communityPosts.find(p => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found.' });
  }

  if (title !== undefined) post.title = title.trim();
  if (content !== undefined) post.content = cleanListSpacing(content.trim());
  if (imageUrl !== undefined) post.imageUrl = imageUrl;
  if (category !== undefined) post.category = category;
  if (status !== undefined) post.status = status;
  if (isPinned !== undefined) post.isPinned = Boolean(isPinned);
  if (viewsCount !== undefined && !isNaN(Number(viewsCount))) {
    post.viewsCount = Math.max(0, parseInt(viewsCount, 10));
  }
  if (likesCount !== undefined && !isNaN(Number(likesCount))) {
    post.likesCount = Math.max(0, parseInt(likesCount, 10));
  }
  post.updatedAt = new Date().toISOString();

  createAuditLog(db, req.user.id, 'UPDATE_COMMUNITY_POST', 'COMMUNITY_POST', post.id, `Updated post "${post.title}"`);
  writeDB(db);

  return res.json({
    success: true,
    message: 'Post updated successfully.',
    post
  });
});

router.delete('/community/posts/:id', (req, res) => {
  const db = readDB();
  if (!Array.isArray(db.communityPosts)) db.communityPosts = [];
  const index = db.communityPosts.findIndex(p => p.id === req.params.id);

  if (index !== -1) {
    const deleted = db.communityPosts.splice(index, 1)[0];
    if (Array.isArray(db.communityComments)) {
      db.communityComments = db.communityComments.filter(c => c.postId !== req.params.id);
    }
    createAuditLog(db, req.user?.id || 'usr_admin_001', 'DELETE_COMMUNITY_POST', 'COMMUNITY_POST', deleted.id, `Deleted post "${deleted.title}"`);
    writeDB(db);
  }

  return res.json({
    success: true,
    message: 'Post deleted successfully.'
  });
});

// GET /api/admin/settings
router.get('/settings', (req, res) => {
  const db = readDB();
  return res.json({ success: true, settings: db.settings });
});

// PATCH /api/admin/settings
router.patch('/settings', (req, res) => {
  const db = readDB();
  const updates = req.body;

  Object.keys(updates).forEach(key => {
    if (key !== 'reason' && key in db.settings) {
      db.settings[key] = updates[key];
    }
  });

  createAuditLog(db, req.user.id, 'UPDATE_GLOBAL_SETTINGS', 'SETTINGS', 'global', updates.reason || 'Updated global platform settings', updates);
  writeDB(db);

  return res.json({
    success: true,
    message: 'Settings updated successfully.',
    settings: db.settings
  });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (req, res) => {
  const db = readDB();
  const usersMap = new Map((db.users || []).map(u => [u.id, u]));
  const logs = [...(db.adminAuditLogs || [])]
    .filter(log => log.id !== 'audit_001') // Exclude dummy initialization record
    .map(log => {
      const admin = usersMap.get(log.adminUserId);
      return {
        ...log,
        adminName: admin ? admin.fullName : 'GT Administrator',
        adminEmail: admin ? admin.email : (log.adminUserId || 'admin')
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({ success: true, logs });
});

// GET /api/admin/all-sliders (Unified instant fetch for all 4 slider categories)
router.get('/all-sliders', (req, res) => {
  try {
    const db = readDB();
    const home = (db.homeBanners || []).slice().sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    const onboarding = (db.onboardingBanners || []).slice().sort((a, b) => {
      const ordA = Number(a.order !== undefined && a.order !== null ? a.order : a.stepNumber) || 0;
      const ordB = Number(b.order !== undefined && b.order !== null ? b.order : b.stepNumber) || 0;
      return ordA - ordB;
    });
    const referrals = (db.referralBanners || []).slice().sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    const tasks = (db.taskBanners || []).slice().sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return res.json({
      success: true,
      home,
      onboarding,
      referrals,
      tasks,
    });
  } catch (err) {
    console.error('Error fetching all sliders:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch sliders' });
  }
});

// GET /api/admin/onboarding-banners
router.get('/onboarding-banners', (req, res) => {
  const db = readDB();
  const banners = (db.onboardingBanners || [])
    .slice()
    .sort((a, b) => {
      const ordA = Number(a.order !== undefined && a.order !== null ? a.order : a.stepNumber) || 0;
      const ordB = Number(b.order !== undefined && b.order !== null ? b.order : b.stepNumber) || 0;
      return ordA - ordB;
    });
  return res.json({ success: true, banners });
});

// POST /api/admin/onboarding-banners
router.post('/onboarding-banners', (req, res) => {
  const db = readDB();
  if (!db.onboardingBanners) db.onboardingBanners = [];
  const newBanner = {
    id: generateId('ob'),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  db.onboardingBanners.push(newBanner);
  createAuditLog(db, req.user?.id || 'admin', 'CREATE_ONBOARDING_BANNER', 'ONBOARDING_BANNER', newBanner.id, `Created pre-opening banner "${newBanner.title || 'Banner'}"`);
  writeDB(db);
  return res.status(201).json({ success: true, banner: newBanner, message: 'Pre-opening banner added.' });
});

// PATCH & PUT /api/admin/onboarding-banners/:id
const updateOnboardingBannerHandler = (req, res) => {
  const db = readDB();
  if (!db.onboardingBanners) db.onboardingBanners = [];
  const idx = db.onboardingBanners.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Banner not found' });
  
  const updateData = { ...req.body };
  if (updateData.imageUrl && updateData.imageUrl.trim().startsWith('/api/')) {
    delete updateData.imageUrl;
  }
  db.onboardingBanners[idx] = { ...db.onboardingBanners[idx], ...updateData, updatedAt: new Date().toISOString() };
  createAuditLog(db, req.user?.id || 'admin', 'UPDATE_ONBOARDING_BANNER', 'ONBOARDING_BANNER', req.params.id, `Updated pre-opening banner "${db.onboardingBanners[idx].title || 'Banner'}"`);
  writeDB(db);
  return res.json({ success: true, banner: db.onboardingBanners[idx], message: 'Banner updated.' });
};
router.patch('/onboarding-banners/:id', updateOnboardingBannerHandler);
router.put('/onboarding-banners/:id', updateOnboardingBannerHandler);

// DELETE /api/admin/onboarding-banners/:id
router.delete('/onboarding-banners/:id', (req, res) => {
  const db = readDB();
  if (!db.onboardingBanners) db.onboardingBanners = [];
  const banner = db.onboardingBanners.find(b => b.id === req.params.id);
  db.onboardingBanners = db.onboardingBanners.filter(b => b.id !== req.params.id);
  createAuditLog(db, req.user?.id || 'admin', 'DELETE_ONBOARDING_BANNER', 'ONBOARDING_BANNER', req.params.id, `Deleted pre-opening banner "${banner?.title || req.params.id}"`);
  writeDB(db);
  return res.json({ success: true, message: 'Banner deleted.' });
});

// GET /api/admin/home-banners
router.get('/home-banners', (req, res) => {
  const db = readDB();
  return res.json({ success: true, banners: db.homeBanners || [] });
});

// POST /api/admin/home-banners
router.post('/home-banners', (req, res) => {
  const db = readDB();
  if (!db.homeBanners) db.homeBanners = [];
  const newBanner = {
    id: generateId('hb'),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  db.homeBanners.push(newBanner);
  createAuditLog(db, req.user?.id || 'admin', 'CREATE_HOME_BANNER', 'HOME_BANNER', newBanner.id, `Created home banner "${newBanner.title || 'Banner'}"`);
  writeDB(db);
  return res.status(201).json({ success: true, banner: newBanner, message: 'Home banner added.' });
});

// PATCH & PUT /api/admin/home-banners/:id
const updateHomeBannerHandler = (req, res) => {
  const db = readDB();
  if (!db.homeBanners) db.homeBanners = [];
  const idx = db.homeBanners.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Banner not found' });
  
  const updateData = { ...req.body };
  if (updateData.imageUrl && updateData.imageUrl.trim().startsWith('/api/')) {
    delete updateData.imageUrl;
  }
  db.homeBanners[idx] = { ...db.homeBanners[idx], ...updateData, updatedAt: new Date().toISOString() };
  createAuditLog(db, req.user?.id || 'admin', 'UPDATE_HOME_BANNER', 'HOME_BANNER', req.params.id, `Updated home banner "${db.homeBanners[idx].title || 'Banner'}"`);
  writeDB(db);
  return res.json({ success: true, banner: db.homeBanners[idx], message: 'Home banner updated.' });
};
router.patch('/home-banners/:id', updateHomeBannerHandler);
router.put('/home-banners/:id', updateHomeBannerHandler);

// DELETE /api/admin/home-banners/:id
router.delete('/home-banners/:id', (req, res) => {
  const db = readDB();
  if (!db.homeBanners) db.homeBanners = [];
  const banner = db.homeBanners.find(b => b.id === req.params.id);
  db.homeBanners = db.homeBanners.filter(b => b.id !== req.params.id);
  createAuditLog(db, req.user?.id || 'admin', 'DELETE_HOME_BANNER', 'HOME_BANNER', req.params.id, `Deleted home banner "${banner?.title || req.params.id}"`);
  writeDB(db);
  return res.json({ success: true, message: 'Home banner deleted.' });
});

// ==========================================
// REFERRAL SLIDES / BANNERS ADMIN CRUD
// ==========================================

// GET /api/admin/referral-banners
router.get('/referral-banners', (req, res) => {
  const db = readDB();
  const banners = (db.referralBanners || []).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  return res.json({ success: true, banners });
});

// POST /api/admin/referral-banners
router.post('/referral-banners', (req, res) => {
  const db = readDB();
  if (!db.referralBanners) db.referralBanners = [];
  const newBanner = {
    id: generateId('rb'),
    tag: req.body.tag || 'PROTOCOL DIVIDEND',
    title: req.body.title || 'New Referral Slide',
    description: req.body.description || '',
    imageUrl: req.body.imageUrl || '',
    ctaText: req.body.ctaText || 'Invite Miners',
    targetRoute: req.body.targetRoute || '/referrals',
    accentColor: req.body.accentColor || '#22C55E',
    gradientStart: req.body.gradientStart || '#064E3B',
    gradientEnd: req.body.gradientEnd || '#022C17',
    order: Number(req.body.order) || (db.referralBanners.length + 1),
    isActive: req.body.isActive !== false,
    createdAt: new Date().toISOString()
  };
  db.referralBanners.push(newBanner);
  createAuditLog(db, req.user?.id || 'admin', 'CREATE_REFERRAL_BANNER', 'REFERRAL_BANNER', newBanner.id, `Created referral banner "${newBanner.title}"`);
  writeDB(db);
  return res.status(201).json({ success: true, banner: newBanner, message: 'Referral slide created successfully.' });
});

// PATCH & PUT /api/admin/referral-banners/:id
const updateReferralBannerHandler = (req, res) => {
  const db = readDB();
  if (!db.referralBanners) db.referralBanners = [];
  const idx = db.referralBanners.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Referral slide not found' });
  
  const updateData = { ...req.body };
  if (updateData.imageUrl && updateData.imageUrl.trim().startsWith('/api/')) {
    delete updateData.imageUrl;
  }
  db.referralBanners[idx] = {
    ...db.referralBanners[idx],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  createAuditLog(db, req.user?.id || 'admin', 'UPDATE_REFERRAL_BANNER', 'REFERRAL_BANNER', req.params.id, `Updated referral banner "${db.referralBanners[idx].title || 'Banner'}"`);
  writeDB(db);
  return res.json({ success: true, banner: db.referralBanners[idx], message: 'Referral slide updated.' });
};
router.patch('/referral-banners/:id', updateReferralBannerHandler);
router.put('/referral-banners/:id', updateReferralBannerHandler);

// DELETE /api/admin/referral-banners/:id
router.delete('/referral-banners/:id', (req, res) => {
  const db = readDB();
  if (!db.referralBanners) db.referralBanners = [];
  const banner = db.referralBanners.find(b => b.id === req.params.id);
  db.referralBanners = db.referralBanners.filter(b => b.id !== req.params.id);
  createAuditLog(db, req.user?.id || 'admin', 'DELETE_REFERRAL_BANNER', 'REFERRAL_BANNER', req.params.id, `Deleted referral banner "${banner?.title || req.params.id}"`);
  writeDB(db);
  return res.json({ success: true, message: 'Referral slide deleted successfully.' });
});

// Helper: Save base64 direct video upload to disk to keep database.json lightweight
function processVideoUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('data:video/')) return url;
  try {
    const matches = url.match(/^data:video\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) return url;
    const ext = matches[1] === 'quicktime' ? 'mov' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const videosDir = path.resolve('uploads', 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true, mode: 0o755 });
    }
    const filename = `quest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(videosDir, filename);
    fs.writeFileSync(filePath, buffer, { mode: 0o644 });
    try { fs.chmodSync(filePath, 0o644); } catch {}
    return `/uploads/videos/${filename}`;
  } catch (err) {
    console.error('Error saving video upload to disk:', err);
    return url;
  }
}

// Tasks & Video Quests Management
// GET /api/admin/tasks
router.get('/tasks', (req, res) => {
  const db = readDB();
  return res.json({ success: true, tasks: db.tasks || [] });
});

// POST /api/admin/tasks
router.post('/tasks', (req, res) => {
  const db = readDB();
  if (!db.tasks) db.tasks = [];
  const rewardNum = parseFloat(req.body.reward) || 2;
  const processedUrl = processVideoUrl(req.body.url);
  const newTask = {
    id: generateId('task'),
    category: req.body.category || 'video',
    title: req.body.title || 'New Task',
    description: req.body.description || '',
    reward: rewardNum,
    rewardLabel: req.body.rewardLabel || `+${rewardNum} GT`,
    buttonLabel: req.body.buttonLabel || (req.body.category === 'video' ? 'Watch video' : 'Follow'),
    url: processedUrl || '#',
    duration: parseInt(req.body.duration, 10) || (req.body.category === 'video' ? 15 : 0),
    iconType: req.body.iconType || (req.body.category === 'video' ? 'video' : 'x'),
    isActive: req.body.isActive !== false,
    createdAt: new Date().toISOString()
  };
  db.tasks.push(newTask);
  createAuditLog(db, req.user?.id || 'admin', 'CREATE_TASK', 'TASK', newTask.id, `Created task "${newTask.title}"`);
  writeDB(db);
  return res.status(201).json({ success: true, task: newTask, message: 'Task created successfully.' });
});

// PATCH /api/admin/tasks/:id
router.patch('/tasks/:id', (req, res) => {
  const db = readDB();
  if (!db.tasks) db.tasks = [];
  const idx = db.tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Task not found' });
  const updateData = { ...req.body };
  if (updateData.url && updateData.url.startsWith('data:video/')) {
    updateData.url = processVideoUrl(updateData.url);
  }
  db.tasks[idx] = { ...db.tasks[idx], ...updateData, updatedAt: new Date().toISOString() };
  createAuditLog(db, req.user?.id || 'admin', 'UPDATE_TASK', 'TASK', db.tasks[idx].id, `Updated task "${db.tasks[idx].title}"`);
  writeDB(db);
  return res.json({ success: true, task: db.tasks[idx], message: 'Task updated successfully.' });
});

// DELETE /api/admin/tasks/:id
router.delete('/tasks/:id', (req, res) => {
  const db = readDB();
  if (!db.tasks) db.tasks = [];
  const deleted = db.tasks.find(t => t.id === req.params.id);
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  if (deleted) {
    createAuditLog(db, req.user?.id || 'admin', 'DELETE_TASK', 'TASK', deleted.id, `Deleted task "${deleted.title}"`);
  }
  writeDB(db);
  return res.json({ success: true, message: 'Task deleted successfully.' });
});

// ---------------------------------------------------------------------------
// TASK SUBMISSIONS & VERIFICATION MANAGEMENT
// ---------------------------------------------------------------------------
// GET /api/admin/task-submissions
router.get('/task-submissions', (req, res) => {
  const db = readDB();
  const { status } = req.query;
  const submissions = (db.taskSubmissions || []).slice().reverse();
  const pendingCount = submissions.filter(s => s.status === 'PENDING').length;

  let filtered = submissions;
  if (status && status !== 'all') {
    filtered = filtered.filter(s => s.status === status.toUpperCase());
  }

  return res.json({
    success: true,
    submissions: filtered,
    pendingCount
  });
});

// POST /api/admin/task-submissions/:id/approve
router.post('/task-submissions/:id/approve', (req, res) => {
  const db = readDB();
  if (!db.taskSubmissions) db.taskSubmissions = [];

  const submission = db.taskSubmissions.find(s => s.id === req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Task submission not found.' });
  }

  if (submission.status === 'APPROVED') {
    return res.status(400).json({ success: false, message: 'This submission has already been approved.' });
  }

  const now = new Date().toISOString();
  const rewardAmount = Number(submission.reward || 1);

  submission.status = 'APPROVED';
  submission.reviewedAt = now;
  submission.reviewedBy = req.user?.email || 'Admin';

  // 1. Credit User's Wallet directly
  if (!db.wallets) db.wallets = [];
  let wallet = db.wallets.find(w => w.userId === submission.userId);
  if (!wallet) {
    wallet = {
      id: generateId('wal'),
      userId: submission.userId,
      availableBalance: 0.0,
      lifetimeEarned: 0.0,
      createdAt: now,
      updatedAt: now
    };
    db.wallets.push(wallet);
  }

  wallet.availableBalance = Number((Number(wallet.availableBalance || 0) + rewardAmount).toFixed(4));
  wallet.lifetimeEarned = Number((Number(wallet.lifetimeEarned || 0) + rewardAmount).toFixed(4));
  wallet.updatedAt = now;

  // 2. Record Wallet Transaction
  if (!db.walletTransactions) db.walletTransactions = [];
  const tx = {
    id: generateId('tx'),
    userId: submission.userId,
    type: 'TASK_REWARD',
    amount: rewardAmount,
    status: 'COMPLETED',
    idempotencyKey: `task_sub_${submission.id}`,
    referenceId: submission.id,
    description: `Task Reward: ${submission.taskTitle}`,
    createdAt: now,
    userName: submission.userName,
    userEmail: submission.userEmail
  };
  db.walletTransactions.push(tx);

  // 3. User Notification
  if (!db.notifications) db.notifications = [];
  db.notifications.push({
    id: generateId('notif'),
    userId: submission.userId,
    title: 'Task Quest Approved! 🎉',
    message: `Your proof for task "${submission.taskTitle}" was verified! +${rewardAmount}.00 GT has been credited directly to your wallet available balance.`,
    type: 'TASK',
    readAt: null,
    createdAt: now
  });

  createAuditLog(
    db,
    req.user?.id || 'admin',
    'APPROVE_TASK_SUBMISSION',
    'TASK_SUBMISSION',
    submission.id,
    `Approved task "${submission.taskTitle}" for user ${submission.userEmail} (+${rewardAmount} GT)`
  );

  writeDB(db);

  return res.json({
    success: true,
    message: `Task submission approved! +${rewardAmount}.00 GT credited to user wallet.`,
    submission
  });
});

// POST /api/admin/task-submissions/:id/reject
router.post('/task-submissions/:id/reject', (req, res) => {
  const db = readDB();
  if (!db.taskSubmissions) db.taskSubmissions = [];

  const submission = db.taskSubmissions.find(s => s.id === req.params.id);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Task submission not found.' });
  }

  const reason = (req.body.reason || 'Screenshot proof could not be verified or was invalid.').trim();
  const now = new Date().toISOString();

  submission.status = 'REJECTED';
  submission.adminComment = reason;
  submission.reviewedAt = now;
  submission.reviewedBy = req.user?.email || 'Admin';

  if (!db.notifications) db.notifications = [];
  db.notifications.push({
    id: generateId('notif'),
    userId: submission.userId,
    title: 'Task Verification Notice',
    message: `Your submission for task "${submission.taskTitle}" was rejected: "${reason}". Please tap and resubmit with clear proof.`,
    type: 'TASK',
    readAt: null,
    createdAt: now
  });

  createAuditLog(
    db,
    req.user?.id || 'admin',
    'REJECT_TASK_SUBMISSION',
    'TASK_SUBMISSION',
    submission.id,
    `Rejected task "${submission.taskTitle}" for user ${submission.userEmail} (Reason: ${reason})`
  );

  writeDB(db);

  return res.json({
    success: true,
    message: 'Task submission rejected.',
    submission
  });
});

// ---------------------------------------------------------------------------
// EMAIL CHANGE REQUESTS MANAGEMENT
// ---------------------------------------------------------------------------
// GET /api/admin/email-change-requests
router.get('/email-change-requests', (req, res) => {
  const db = readDB();
  const requests = (db.emailChangeRequests || []).slice().reverse();
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  return res.json({ success: true, requests, pendingCount });
});

// POST /api/admin/email-change-requests/:id/approve
router.post('/email-change-requests/:id/approve', (req, res) => {
  const db = readDB();
  if (!db.emailChangeRequests) db.emailChangeRequests = [];
  const request = db.emailChangeRequests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  if (request.status !== 'PENDING') {
    return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
  }

  const targetUser = db.users.find(u => u.id === request.userId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'Associated user account not found' });
  }

  const requestedClean = request.requestedNewEmail.toLowerCase();
  const emailConflict = db.users.find(u => u.id !== targetUser.id && u.email.toLowerCase() === requestedClean && !u.deletedAt);
  if (emailConflict) {
    return res.status(400).json({ success: false, message: 'Requested email is already registered to another account' });
  }

  const oldEmail = targetUser.email;
  targetUser.email = requestedClean;
  targetUser.emailVerifiedAt = new Date().toISOString();
  targetUser.updatedAt = new Date().toISOString();

  request.status = 'APPROVED';
  request.reviewedAt = new Date().toISOString();
  request.reviewedBy = req.user ? req.user.email : 'Master Admin';

  createAuditLog(db, req.user?.id || 'usr_admin_001', 'APPROVE_EMAIL_CHANGE', 'USER', targetUser.id, `Email changed from ${oldEmail} to ${targetUser.email}`);

  writeDB(db);

  return res.json({
    success: true,
    message: `Email change approved! User will now log in with ${targetUser.email}`,
    request,
    user: { id: targetUser.id, email: targetUser.email }
  });
});

// POST /api/admin/email-change-requests/:id/reject
router.post('/email-change-requests/:id/reject', (req, res) => {
  const db = readDB();
  if (!db.emailChangeRequests) db.emailChangeRequests = [];
  const request = db.emailChangeRequests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  if (request.status !== 'PENDING') {
    return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
  }

  request.status = 'REJECTED';
  request.reason = req.body.reason || 'Rejected by administrator';
  request.reviewedAt = new Date().toISOString();
  request.reviewedBy = req.user ? req.user.email : 'Master Admin';

  createAuditLog(db, req.user?.id || 'usr_admin_001', 'REJECT_EMAIL_CHANGE', 'USER', request.userId, `Email change request for ${request.requestedNewEmail} rejected: ${request.reason}`);

  writeDB(db);

  return res.json({
    success: true,
    message: 'Email change request rejected',
    request
  });
});

// ---------------------------------------------------------------------------
// TASK BANNERS / SLIDERS MANAGEMENT FOR ADMIN
// ---------------------------------------------------------------------------

// GET /api/admin/task-banners
router.get('/task-banners', (req, res) => {
  const db = readDB();
  const banners = db.taskBanners || [];
  return res.json({ success: true, banners });
});

// POST /api/admin/task-banners
router.post('/task-banners', (req, res) => {
  const { title, description, tag, imageUrl, ctaText, targetRoute, accentColor, gradientStart, gradientEnd, order, isActive } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const db = readDB();
  if (!db.taskBanners) db.taskBanners = [];

  const newBanner = {
    id: generateId('tb'),
    title: title.trim(),
    description: (description || '').trim(),
    tag: (tag || '').trim(),
    imageUrl: (imageUrl || '').trim(),
    ctaText: (ctaText || '').trim(),
    targetRoute: (targetRoute || '').trim(),
    accentColor: accentColor || '#22C55E',
    gradientStart: gradientStart || '#18181B',
    gradientEnd: gradientEnd || '#09090B',
    order: Number(order) || (db.taskBanners.length + 1),
    isActive: isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.taskBanners.push(newBanner);
  writeDB(db);

  return res.json({ success: true, banner: newBanner, message: 'Task banner created successfully' });
});

// PATCH & PUT /api/admin/task-banners/:id
const updateTaskBannerHandler = (req, res) => {
  const db = readDB();
  if (!db.taskBanners) db.taskBanners = [];
  const banner = db.taskBanners.find(b => b.id === req.params.id);
  if (!banner) {
    return res.status(404).json({ success: false, message: 'Task banner not found' });
  }

  const { title, description, tag, imageUrl, ctaText, targetRoute, accentColor, gradientStart, gradientEnd, order, isActive } = req.body;

  if (title !== undefined) banner.title = title.trim();
  if (description !== undefined) banner.description = description.trim();
  if (tag !== undefined) banner.tag = tag.trim();
  if (imageUrl !== undefined && !imageUrl.trim().startsWith('/api/')) {
    banner.imageUrl = imageUrl.trim();
  }
  if (ctaText !== undefined) banner.ctaText = ctaText.trim();
  if (targetRoute !== undefined) banner.targetRoute = targetRoute.trim();
  if (accentColor !== undefined) banner.accentColor = accentColor;
  if (gradientStart !== undefined) banner.gradientStart = gradientStart;
  if (gradientEnd !== undefined) banner.gradientEnd = gradientEnd;
  if (order !== undefined) banner.order = Number(order);
  if (isActive !== undefined) banner.isActive = isActive;
  banner.updatedAt = new Date().toISOString();

  writeDB(db);
  return res.json({ success: true, banner, message: 'Task banner updated successfully' });
};
router.patch('/task-banners/:id', updateTaskBannerHandler);
router.put('/task-banners/:id', updateTaskBannerHandler);

// DELETE /api/admin/task-banners/:id
router.delete('/task-banners/:id', (req, res) => {
  const db = readDB();
  if (!db.taskBanners) db.taskBanners = [];
  const index = db.taskBanners.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task banner not found' });
  }

  db.taskBanners.splice(index, 1);
  writeDB(db);
  return res.json({ success: true, message: 'Task banner deleted successfully' });
});

// ---------------------------------------------------------------------------
// ACCOUNT DELETION REQUESTS MANAGEMENT FOR ADMIN
// ---------------------------------------------------------------------------

// GET /api/admin/account-deletion-requests
router.get('/account-deletion-requests', (req, res) => {
  const db = readDB();
  const requests = (db.accountDeletionRequests || []).slice().reverse();
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  return res.json({ success: true, requests, pendingCount });
});

// POST /api/admin/account-deletion-requests/:id/approve
router.post('/account-deletion-requests/:id/approve', (req, res) => {
  const db = readDB();
  if (!db.accountDeletionRequests) db.accountDeletionRequests = [];
  const request = db.accountDeletionRequests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Deletion request not found' });
  }
  if (request.status !== 'PENDING') {
    return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
  }

  const targetUser = db.users.find(u => u.id === request.userId);
  if (!targetUser) {
    request.status = 'APPROVED';
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = req.user ? req.user.email : 'Master Admin';
    writeDB(db);
    return res.json({ success: true, message: 'User was already deleted or not found. Request marked approved.' });
  }

  if (targetUser.role === 'ADMIN') {
    return res.status(400).json({ success: false, message: 'Administrator accounts cannot be deleted.' });
  }

  const now = new Date().toISOString();
  targetUser.accountStatus = 'DELETED';
  targetUser.isDeleted = true;
  targetUser.deletedAt = now;
  targetUser.status = 'DELETED';
  targetUser.fullName = `Deleted User (${targetUser.id.substring(4, 9)})`;
  targetUser.email = `deleted_${targetUser.id}@anonymized.gtnetwork.io`;
  targetUser.updatedAt = now;

  request.status = 'APPROVED';
  request.reviewedAt = now;
  request.reviewedBy = req.user ? req.user.email : 'Master Admin';

  if (!db.adminAuditLogs) db.adminAuditLogs = [];
  db.adminAuditLogs.push({
    id: generateId('audit'),
    adminUserId: req.user?.id || 'usr_admin_001',
    action: 'APPROVE_ACCOUNT_DELETION',
    entityType: 'USER',
    entityId: targetUser.id,
    reason: `Account deletion approved by administrator. Requested reason: ${request.reason}`,
    metadata: { deletedAt: now },
    createdAt: now
  });

  writeDB(db);

  return res.json({
    success: true,
    message: `Account deletion approved. User account for ${request.email} has been permanently deleted.`,
    request
  });
});

// POST /api/admin/account-deletion-requests/:id/reject
router.post('/account-deletion-requests/:id/reject', (req, res) => {
  const db = readDB();
  if (!db.accountDeletionRequests) db.accountDeletionRequests = [];
  const request = db.accountDeletionRequests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Deletion request not found' });
  }
  if (request.status !== 'PENDING') {
    return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
  }

  const now = new Date().toISOString();
  request.status = 'REJECTED';
  request.rejectionReason = req.body.reason || 'Rejected by Administrator';
  request.reviewedAt = now;
  request.reviewedBy = req.user ? req.user.email : 'Master Admin';

  if (!db.adminAuditLogs) db.adminAuditLogs = [];
  db.adminAuditLogs.push({
    id: generateId('audit'),
    adminUserId: req.user?.id || 'usr_admin_001',
    action: 'REJECT_ACCOUNT_DELETION',
    entityType: 'USER',
    entityId: request.userId,
    reason: `Account deletion rejected: ${request.rejectionReason}`,
    metadata: { reviewedAt: now },
    createdAt: now
  });

  writeDB(db);

  return res.json({
    success: true,
    message: 'Account deletion request rejected. User account remains active.',
    request
  });
});

// ==========================================
// PRIVATE ROOMS & CHATS MANAGEMENT FOR ADMIN
// ==========================================

// GET /api/admin/private-rooms (List all private rooms / circles)
router.get('/private-rooms', (req, res) => {
  try {
    const db = readDB();
    if (!db.privateNetworks) db.privateNetworks = {};
    if (!db.referrals) db.referrals = [];
    if (!db.users) db.users = [];

    const search = (req.query.search || '').trim().toLowerCase();

    // Identify all hosts
    const hostIdSet = new Set();
    Object.keys(db.privateNetworks).forEach(id => hostIdSet.add(id));
    db.referrals.forEach(r => {
      if (r.referrerUserId) hostIdSet.add(r.referrerUserId);
    });

    const now = Date.now();
    const cooldownMs = 14400 * 1000; // 4 hours
    const rooms = [];

    hostIdSet.forEach(hostId => {
      const hostUser = db.users.find(u => u.id === hostId && !u.deletedAt && u.accountStatus !== 'DELETED');
      if (!hostUser) return;

      // Exclude Demo Miner room from admin panel view
      if (
        hostId === 'demo-miner' ||
        (hostUser.email && hostUser.email.toLowerCase() === 'demo@gtnetwork.io') ||
        (hostUser.fullName && hostUser.fullName.toLowerCase() === 'demo miner') ||
        hostUser.isDemo
      ) {
        return;
      }

      const circleData = db.privateNetworks[hostId] || { messages: [] };
      const rawMessages = circleData.messages || [];

      // Calculate members
      const referredEntries = db.referrals.filter(r => r.referrerUserId === hostId);
      const referredUserIds = referredEntries.map(r => r.referredUserId);
      const members = [];

      referredUserIds.forEach(mId => {
        const mUser = db.users.find(u => u.id === mId && !u.deletedAt);
        if (mUser) {
          const lastClaimMs = mUser.lastMiningAt ? new Date(mUser.lastMiningAt).getTime() : 0;
          const isMiningActive = (lastClaimMs + cooldownMs) > now && lastClaimMs > 0;
          members.push({
            id: mUser.id,
            fullName: mUser.fullName,
            email: mUser.email,
            referralCode: mUser.referralCode,
            isMiningActive,
            avatar: mUser.avatar || mUser.profileImage || null
          });
        }
      });

      const hostLastClaim = hostUser.lastMiningAt ? new Date(hostUser.lastMiningAt).getTime() : 0;
      const isHostMining = (hostLastClaim + cooldownMs) > now && hostLastClaim > 0;
      const totalMembers = members.length + 1; // including host
      const activeMiningCount = members.filter(m => m.isMiningActive).length + (isHostMining ? 1 : 0);

      const lastMessage = rawMessages.length > 0 ? rawMessages[rawMessages.length - 1] : null;

      // Filter by search query if provided
      if (search) {
        const matchesHost =
          (hostUser.fullName && hostUser.fullName.toLowerCase().includes(search)) ||
          (hostUser.email && hostUser.email.toLowerCase().includes(search)) ||
          (hostUser.referralCode && hostUser.referralCode.toLowerCase().includes(search));
        const matchesMember = members.some(m =>
          (m.fullName && m.fullName.toLowerCase().includes(search)) ||
          (m.email && m.email.toLowerCase().includes(search))
        );
        const matchesMessage = rawMessages.some(m =>
          m.text && m.text.toLowerCase().includes(search)
        );

        if (!matchesHost && !matchesMember && !matchesMessage) {
          return;
        }
      }

      rooms.push({
        circleHostId: hostId,
        host: {
          id: hostUser.id,
          fullName: hostUser.fullName,
          email: hostUser.email,
          referralCode: hostUser.referralCode,
          avatar: hostUser.avatar || hostUser.profileImage || null,
          accountStatus: hostUser.accountStatus,
          createdAt: hostUser.createdAt
        },
        stats: {
          totalMembers,
          activeMiningCount,
          totalMessages: rawMessages.length
        },
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          senderName: lastMessage.senderName,
          senderRole: lastMessage.senderRole,
          text: lastMessage.text,
          createdAt: lastMessage.createdAt
        } : null,
        updatedAt: lastMessage?.createdAt || circleData.createdAt || hostUser.createdAt
      });
    });

    // Sort by latest activity (lastMessage or updated date)
    rooms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return res.json({
      success: true,
      totalRooms: rooms.length,
      rooms
    });
  } catch (err) {
    console.error('Error fetching admin private rooms:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch private rooms' });
  }
});

// GET /api/admin/private-rooms/:circleHostId (Get full chat & members for a specific room)
router.get('/private-rooms/:circleHostId', (req, res) => {
  try {
    const db = readDB();
    const { circleHostId } = req.params;

    const hostUser = (db.users || []).find(u => u.id === circleHostId && !u.deletedAt);
    if (!hostUser) {
      return res.status(404).json({ success: false, message: 'Private room host not found' });
    }

    const circleData = (db.privateNetworks && db.privateNetworks[circleHostId]) || { messages: [] };
    const rawMessages = circleData.messages || [];

    const now = Date.now();
    const cooldownMs = 14400 * 1000;

    // Members list
    const referredEntries = (db.referrals || []).filter(r => r.referrerUserId === circleHostId);
    const members = [];

    // Add Host
    const hostLastClaim = hostUser.lastMiningAt ? new Date(hostUser.lastMiningAt).getTime() : 0;
    const isHostMining = (hostLastClaim + cooldownMs) > now && hostLastClaim > 0;
    members.push({
      id: hostUser.id,
      fullName: hostUser.fullName,
      email: hostUser.email,
      referralCode: hostUser.referralCode,
      role: 'HOST',
      isHost: true,
      isMiningActive: isHostMining,
      lastMiningAt: hostUser.lastMiningAt || null,
      avatar: hostUser.avatar || hostUser.profileImage || null
    });

    referredEntries.forEach(r => {
      const mUser = (db.users || []).find(u => u.id === r.referredUserId && !u.deletedAt);
      if (mUser) {
        const lastClaimMs = mUser.lastMiningAt ? new Date(mUser.lastMiningAt).getTime() : 0;
        const isMining = (lastClaimMs + cooldownMs) > now && lastClaimMs > 0;
        members.push({
          id: mUser.id,
          fullName: mUser.fullName,
          email: mUser.email,
          referralCode: mUser.referralCode,
          role: 'MEMBER',
          isHost: false,
          isMiningActive: isMining,
          lastMiningAt: mUser.lastMiningAt || null,
          avatar: mUser.avatar || mUser.profileImage || null,
          rewardEarned: Number(r.rewardAmount || 0)
        });
      }
    });

    return res.json({
      success: true,
      circleHostId,
      host: members[0],
      members,
      messages: rawMessages,
      stats: {
        totalMembers: members.length,
        activeMiningCount: members.filter(m => m.isMiningActive).length,
        totalMessages: rawMessages.length
      }
    });
  } catch (err) {
    console.error('Error fetching admin private room detail:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch private room details' });
  }
});

// DELETE /api/admin/private-rooms/:circleHostId/messages/:messageId (Moderation: delete message)
router.delete('/private-rooms/:circleHostId/messages/:messageId', (req, res) => {
  try {
    const db = readDB();
    const { circleHostId, messageId } = req.params;

    if (!db.privateNetworks || !db.privateNetworks[circleHostId]) {
      return res.status(404).json({ success: false, message: 'Private room not found' });
    }

    const messages = db.privateNetworks[circleHostId].messages || [];
    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const [deletedMessage] = messages.splice(index, 1);
    db.privateNetworks[circleHostId].messages = messages;

    createAuditLog(
      db,
      req.user?.id || 'usr_admin_001',
      'DELETE_PRIVATE_ROOM_MESSAGE',
      'MESSAGE',
      messageId,
      `Deleted message by ${deletedMessage.senderName || deletedMessage.senderId} from room ${circleHostId}`,
      { circleHostId, text: deletedMessage.text }
    );

    writeDB(db);

    return res.json({
      success: true,
      message: 'Message deleted successfully',
      deletedMessageId: messageId
    });
  } catch (err) {
    console.error('Error deleting message:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
});

export default router;
