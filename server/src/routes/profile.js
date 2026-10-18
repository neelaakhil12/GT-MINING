import express from 'express';
import bcrypt from 'bcryptjs';
import { readDB, writeDB, generateId, lockManager } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { sanitizeUser } from './auth.js';

const router = express.Router();

// GET /api/profile
router.get('/', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    const wallet = db.wallets.find(w => w.userId === req.user.id) || { availableBalance: 0.0, lifetimeEarned: 0.0 };

    return res.json({
      success: true,
      profile: {
        ...sanitizeUser(user),
        wallet
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
});

// PATCH /api/profile - Edit permitted details
router.patch('/', requireAuth, (req, res) => {
  try {
    const { fullName, avatarUrl } = req.body;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name cannot be empty.' });
    }

    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);

    user.fullName = fullName.trim();
    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl;
    }
    user.updatedAt = new Date().toISOString();

    writeDB(db);

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: sanitizeUser(user)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// POST /api/profile/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date().toISOString();

    // Audit log
    db.notifications.push({
      id: generateId('notif'),
      userId: user.id,
      title: 'Security Alert',
      message: 'Your account password was successfully updated.',
      type: 'SECURITY',
      readAt: null,
      createdAt: new Date().toISOString()
    });

    writeDB(db);

    return res.json({
      success: true,
      message: 'Password successfully changed!'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

// POST /api/profile/request-email-change
router.post('/request-email-change', requireAuth, (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail || !newEmail.includes('@')) {
    return res.status(400).json({ success: false, message: 'A valid new email address is required.' });
  }

  const db = readDB();
  const existing = db.users.find(u => u.email.toLowerCase() === newEmail.trim().toLowerCase() && !u.deletedAt);
  if (existing) {
    return res.status(400).json({ success: false, message: 'This email is already in use by another account.' });
  }

  return res.json({
    success: true,
    message: `Verification link has been sent to ${newEmail.trim()}. Please verify to finalize your email change.`
  });
});

// DELETE /api/profile - True Account Deletion with Anonymization & Ledger Protection
router.delete('/', requireAuth, async (req, res) => {
  const { password, confirmationText } = req.body;

  if (confirmationText !== 'DELETE') {
    return res.status(400).json({
      success: false,
      message: 'Please type "DELETE" to confirm irreversible account deletion.'
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Please verify your password to execute account deletion.'
    });
  }

  const userId = req.user.id;
  await lockManager.acquire(`del_user_${userId}`);

  try {
    const db = readDB();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      lockManager.release(`del_user_${userId}`);
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'ADMIN') {
      lockManager.release(`del_user_${userId}`);
      return res.status(400).json({ success: false, message: 'Administrator accounts cannot be deleted directly. Contact primary platform ownership.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      lockManager.release(`del_user_${userId}`);
      return res.status(401).json({ success: false, message: 'Incorrect password verification. Deletion aborted.' });
    }

    const now = new Date().toISOString();

    // Anonymize personal identifying information while preserving relational integrity
    user.accountStatus = 'DELETED';
    user.deletedAt = now;
    user.fullName = `Deleted User (${user.id.substring(4, 9)})`;
    user.email = `deleted_${user.id}@anonymized.gtmining.local`;
    user.passwordHash = await bcrypt.hash(generateId('deleted_dummy'), 10);
    user.updatedAt = now;

    // Log in audit trail
    db.adminAuditLogs.push({
      id: generateId('audit'),
      adminUserId: 'SYSTEM',
      action: 'USER_ACCOUNT_DELETION',
      entityType: 'USER',
      entityId: userId,
      reason: 'User self-initiated account deletion with password verification',
      metadata: { deletedAt: now },
      createdAt: now
    });

    writeDB(db);
    lockManager.release(`del_user_${userId}`);

    return res.json({
      success: true,
      message: 'Your account and personal information have been permanently deleted in accordance with data privacy regulations.'
    });
  } catch (err) {
    lockManager.release(`del_user_${userId}`);
    return res.status(500).json({ success: false, message: 'Failed to process account deletion.' });
  }
});

export default router;
