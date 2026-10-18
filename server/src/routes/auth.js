import express from 'express';
import bcrypt from 'bcryptjs';
import { readDB, writeDB, generateId, generateReferralCode, lockManager } from '../db.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to sanitize user object
export const sanitizeUser = (user) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

// Sign Up
router.post('/signup', async (req, res) => {
  const { fullName, email, password, confirmPassword, referralCode } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  await lockManager.acquire('signup_lock');

  try {
    const db = readDB();

    // Check duplicate email
    const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail && !u.deletedAt);
    if (existing) {
      lockManager.release('signup_lock');
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Check referral code if provided
    let referrerUser = null;
    if (referralCode && referralCode.trim()) {
      const code = referralCode.trim().toUpperCase();
      referrerUser = db.users.find(u => u.referralCode === code && !u.deletedAt);
      if (!referrerUser) {
        lockManager.release('signup_lock');
        return res.status(400).json({ success: false, message: 'Invalid referral code provided.' });
      }
    }

    const userId = generateId('usr');
    const userReferralCode = generateReferralCode(db.users);
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const newUser = {
      id: userId,
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash,
      referralCode: userReferralCode,
      referredByUserId: referrerUser ? referrerUser.id : null,
      role: 'USER',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: now,
      lastMiningAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };

    db.users.push(newUser);

    // Create wallet for new user
    const walletId = generateId('wal');
    db.wallets.push({
      id: walletId,
      userId: userId,
      availableBalance: 0.0,
      lifetimeEarned: 0.0,
      createdAt: now,
      updatedAt: now
    });

    // Process referral attribution if referred
    if (referrerUser && referrerUser.id !== userId) {
      const referralId = generateId('ref');
      const refReward = Number(db.settings.referralReward || 0);

      const refRecord = {
        id: referralId,
        referrerUserId: referrerUser.id,
        referredUserId: userId,
        referralCodeUsed: referrerUser.referralCode,
        status: 'ACTIVE',
        rewardAmount: refReward,
        rewardStatus: refReward > 0 ? 'CREDITED' : 'PENDING',
        createdAt: now,
        rewardCreditedAt: refReward > 0 ? now : null
      };
      db.referrals.push(refRecord);

      // If referral reward configured > 0, credit referrer's wallet
      if (refReward > 0) {
        let referrerWallet = db.wallets.find(w => w.userId === referrerUser.id);
        if (!referrerWallet) {
          referrerWallet = {
            id: generateId('wal'),
            userId: referrerUser.id,
            availableBalance: 0.0,
            lifetimeEarned: 0.0,
            createdAt: now,
            updatedAt: now
          };
          db.wallets.push(referrerWallet);
        }
        referrerWallet.availableBalance = Number((referrerWallet.availableBalance + refReward).toFixed(4));
        referrerWallet.lifetimeEarned = Number((referrerWallet.lifetimeEarned + refReward).toFixed(4));
        referrerWallet.updatedAt = now;

        // Add ledger transaction
        db.walletTransactions.push({
          id: generateId('tx'),
          userId: referrerUser.id,
          type: 'REFERRAL_REWARD',
          amount: refReward,
          status: 'COMPLETED',
          idempotencyKey: `idemp_ref_${referralId}`,
          referenceId: referralId,
          description: `Referral bonus: ${newUser.fullName} joined using your code ${referrerUser.referralCode}`,
          createdAt: now,
          createdBy: 'SYSTEM'
        });

        // Notify referrer
        db.notifications.push({
          id: generateId('notif'),
          userId: referrerUser.id,
          title: 'Referral Bonus Credited!',
          message: `Your friend ${newUser.fullName} registered using your referral code. +${refReward} GT has been added to your wallet!`,
          type: 'REFERRAL',
          readAt: null,
          createdAt: now
        });
      }
    }

    // Welcome notification for new user
    db.notifications.push({
      id: generateId('notif'),
      userId: userId,
      title: 'Welcome to GT Mining!',
      message: 'Your account is active. You are now ready to start your first 4-hour mining session!',
      type: 'SYSTEM',
      readAt: null,
      createdAt: now
    });

    writeDB(db);
    lockManager.release('signup_lock');

    const token = generateToken(newUser);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to GT Mining.',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    lockManager.release('signup_lock');
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'An unexpected server error occurred during signup.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail && !u.deletedAt);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (user.accountStatus === 'DELETED') {
    return res.status(403).json({ success: false, message: 'This account was deleted.' });
  }

  if (user.accountStatus === 'SUSPENDED') {
    return res.status(403).json({ success: false, message: 'Your account is suspended. Please contact support.' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  return res.json({
    success: true,
    message: 'Welcome back!',
    token,
    user: sanitizeUser(user)
  });
});

// Google OAuth Login / Simulation
router.post('/google', async (req, res) => {
  const { credential, email, name, googleId } = req.body;
  const targetEmail = (email || 'google_user@gtmining.com').toLowerCase();
  const targetName = name || 'Google Mining User';

  await lockManager.acquire('google_auth_lock');
  try {
    const db = readDB();
    let user = db.users.find(u => u.email.toLowerCase() === targetEmail && !u.deletedAt);

    if (!user) {
      const userId = generateId('usr');
      const userReferralCode = generateReferralCode(db.users);
      const now = new Date().toISOString();

      user = {
        id: userId,
        fullName: targetName,
        email: targetEmail,
        passwordHash: await bcrypt.hash(generateId('g_pass'), 10),
        referralCode: userReferralCode,
        referredByUserId: null,
        role: 'USER',
        accountStatus: 'ACTIVE',
        emailVerifiedAt: now,
        lastMiningAt: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null
      };

      db.users.push(user);
      db.wallets.push({
        id: generateId('wal'),
        userId: userId,
        availableBalance: 0.0,
        lifetimeEarned: 0.0,
        createdAt: now,
        updatedAt: now
      });

      writeDB(db);
    }

    lockManager.release('google_auth_lock');
    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Signed in successfully with Google',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    lockManager.release('google_auth_lock');
    return res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

// Current Authenticated Session
router.get('/session', requireAuth, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  const wallet = db.wallets.find(w => w.userId === req.user.id) || { availableBalance: 0.0, lifetimeEarned: 0.0 };

  return res.json({
    success: true,
    user: sanitizeUser(user),
    wallet: {
      availableBalance: wallet.availableBalance,
      lifetimeEarned: wallet.lifetimeEarned
    }
  });
});

// Forgot Password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please enter your email address.' });
  }

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && !u.deletedAt);

  // Return generic success message for privacy
  return res.json({
    success: true,
    message: 'If an account with that email exists, password reset instructions have been dispatched.'
  });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Valid email and new password (min 6 chars) required.' });
  }

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && !u.deletedAt);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Account not found.' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.updatedAt = new Date().toISOString();
  writeDB(db);

  return res.json({
    success: true,
    message: 'Password successfully updated! You can now log in with your new password.'
  });
});

// Logout
router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
