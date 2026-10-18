import express from 'express';
import { readDB, writeDB, generateId, lockManager } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

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

    return res.json({
      success: true,
      metrics: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalMiningClaims,
        totalCoinsIssued: Number(totalCoinsIssued.toFixed(4)),
        totalReferralRewardsCredited: Number(totalReferralRewardsCredited.toFixed(4)),
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

// GET /api/admin/users
router.get('/users', (req, res) => {
  try {
    const db = readDB();
    const { search, status } = req.query;

    let users = db.users;

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

// GET /api/admin/mining-settings
router.get('/mining-settings', (req, res) => {
  const db = readDB();
  return res.json({
    success: true,
    settings: {
      miningReward: db.settings.miningReward,
      cooldownSeconds: db.settings.cooldownSeconds,
      miningEnabled: db.settings.miningEnabled !== false
    }
  });
});

// PATCH /api/admin/mining-settings
router.patch('/mining-settings', (req, res) => {
  const { miningReward, cooldownSeconds, miningEnabled, reason } = req.body;
  const db = readDB();

  if (miningReward !== undefined) db.settings.miningReward = Math.max(0.1, Number(miningReward));
  if (cooldownSeconds !== undefined) db.settings.cooldownSeconds = Math.max(60, Number(cooldownSeconds));
  if (miningEnabled !== undefined) db.settings.miningEnabled = Boolean(miningEnabled);

  createAuditLog(
    db,
    req.user.id,
    'UPDATE_MINING_SETTINGS',
    'SETTINGS',
    'mining',
    reason || 'Updated mining reward configuration',
    { miningReward: db.settings.miningReward, cooldownSeconds: db.settings.cooldownSeconds, miningEnabled: db.settings.miningEnabled }
  );

  writeDB(db);

  return res.json({
    success: true,
    message: 'Mining settings updated successfully.',
    settings: {
      miningReward: db.settings.miningReward,
      cooldownSeconds: db.settings.cooldownSeconds,
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
  const db = readDB();
  const posts = [...db.communityPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ success: true, posts });
});

router.post('/community/posts', (req, res) => {
  const { title, content, imageUrl, category, status, isPinned } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required.' });
  }

  const db = readDB();
  const now = new Date().toISOString();
  const newPost = {
    id: generateId('post'),
    title: title.trim(),
    content: content.trim(),
    imageUrl: imageUrl || null,
    category: category || 'Announcement',
    status: status || 'PUBLISHED',
    isPinned: Boolean(isPinned),
    authorName: req.user.fullName || 'Admin',
    createdBy: req.user.id,
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
  const { title, content, imageUrl, category, status, isPinned } = req.body;
  const db = readDB();
  const post = db.communityPosts.find(p => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found.' });
  }

  if (title !== undefined) post.title = title.trim();
  if (content !== undefined) post.content = content.trim();
  if (imageUrl !== undefined) post.imageUrl = imageUrl;
  if (category !== undefined) post.category = category;
  if (status !== undefined) post.status = status;
  if (isPinned !== undefined) post.isPinned = Boolean(isPinned);
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
  const index = db.communityPosts.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Post not found.' });
  }

  const deleted = db.communityPosts.splice(index, 1)[0];
  createAuditLog(db, req.user.id, 'DELETE_COMMUNITY_POST', 'COMMUNITY_POST', deleted.id, `Deleted post "${deleted.title}"`);
  writeDB(db);

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
  const logs = [...db.adminAuditLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ success: true, logs });
});

export default router;
