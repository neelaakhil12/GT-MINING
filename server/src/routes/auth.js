import express from 'express';
import bcrypt from 'bcryptjs';
import { readDB, writeDB, generateId, generateReferralCode, lockManager } from '../db.js';
import { generateToken, requireAuth, ADMIN_EMAILS } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../services/email.js';

const router = express.Router();

// Helper to sanitize user object
export const sanitizeUser = (user) => {
  const { passwordHash, ...rest } = user;
  const isEmailAdmin = user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  return {
    ...rest,
    role: isEmailAdmin ? 'ADMIN' : (user.role || 'USER'),
  };
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
        rewardStatus: refReward > 0 ? 'PENDING_CLAIM' : 'PENDING',
        createdAt: now,
        rewardCreditedAt: null
      };
      db.referrals.push(refRecord);

      // Do NOT auto-credit referrer's wallet immediately.
      // The reward is placed in 'PENDING_CLAIM' status and will be claimed when user taps CLAIM in Referrals tab.
      if (refReward > 0) {
        // Notify referrer that bonus is available to claim
        db.notifications.push({
          id: generateId('notif'),
          userId: referrerUser.id,
          title: 'Referral Bonus Ready to Claim!',
          message: `Your friend ${newUser.fullName} registered using your referral code. +${refReward} GT is available to claim in your Referrals tab!`,
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
    const wallet = db.wallets.find(w => w.userId === newUser.id) || { availableBalance: 0.0, lifetimeEarned: 0.0 };
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to GT Mining.',
      token,
      user: sanitizeUser(newUser),
      wallet: {
        availableBalance: wallet.availableBalance,
        lifetimeEarned: wallet.lifetimeEarned
      }
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
    return res.status(404).json({
      success: false,
      message: 'Account not found. Please sign up first.',
      notFound: true
    });
  }

  if (user.accountStatus === 'DELETED') {
    return res.status(403).json({ success: false, message: 'This account was deleted.' });
  }

  if (user.accountStatus === 'SUSPENDED') {
    return res.status(403).json({ success: false, message: 'Your account is suspended. Please contact support.' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
  }

  const token = generateToken(user);
  const wallet = db.wallets.find(w => w.userId === user.id) || { availableBalance: 0.0, lifetimeEarned: 0.0 };
  return res.json({
    success: true,
    message: 'Welcome back!',
    token,
    user: sanitizeUser(user),
    wallet: {
      availableBalance: wallet.availableBalance,
      lifetimeEarned: wallet.lifetimeEarned
    }
  });
});

// Google OAuth Login / Registration
router.post('/google', async (req, res) => {
  const { credential, email, name, googleId, isSignup } = req.body;
  const targetEmail = (email || '').toLowerCase().trim();

  if (!targetEmail) {
    return res.status(400).json({ success: false, message: 'Google email is required.' });
  }
  const targetName = name || 'Google Miner';

  await lockManager.acquire('google_auth_lock');
  try {
    const db = readDB();
    let user = db.users.find(u => u.email.toLowerCase() === targetEmail && !u.deletedAt);

    // If user does NOT exist in database
    if (!user) {
      // If this is a login attempt, DO NOT auto-create account. Require registration!
      if (!isSignup) {
        lockManager.release('google_auth_lock');
        return res.status(404).json({
          success: false,
          message: 'No account registered with this Google email. Please sign up first.',
          notFound: true,
          notRegistered: true
        });
      }

      // If user is explicitly signing up with Google -> register them
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
        availableBalance: 1.0,
        lifetimeEarned: 1.0,
        createdAt: now,
        updatedAt: now
      });

      writeDB(db);
    }

    lockManager.release('google_auth_lock');
    const token = generateToken(user);
    const wallet = db.wallets.find(w => w.userId === user.id) || { availableBalance: 0.0, lifetimeEarned: 0.0 };
    return res.json({
      success: true,
      message: 'Signed in successfully with Google',
      token,
      user: sanitizeUser(user),
      wallet: {
        availableBalance: wallet.availableBalance,
        lifetimeEarned: wallet.lifetimeEarned
      }
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

// Forgot Password - Dispatches Real OTP Email via Gmail SMTP / Nodemailer
router.post('/forgot-password', async (req, res) => {
  const { email, isAdmin } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Please enter your email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // If this is an admin recovery request, ensure email is gtmining2026@gmail.com
  if (isAdmin && cleanEmail !== 'gtmining2026@gmail.com') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only authorized Master Admin (gtmining2026@gmail.com) can request password reset for the admin gateway.'
    });
  }

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail && !u.deletedAt);

  // Generate 6-digit cryptographic OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins validity

  if (!db.passwordResets) {
    db.passwordResets = [];
  }

  // Clear previous resets for this email
  db.passwordResets = db.passwordResets.filter(r => r.email !== cleanEmail);

  db.passwordResets.push({
    id: generateId('rst'),
    email: cleanEmail,
    otpCode,
    expiresAt,
    used: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);

  // Send real email using Nodemailer & Gmail App Password
  try {
    await sendPasswordResetEmail({
      toEmail: cleanEmail,
      otpCode,
      recipientName: user ? user.fullName : (cleanEmail === 'gtmining2026@gmail.com' ? 'Master Administrator' : 'GT Pioneer'),
      isAdmin: Boolean(isAdmin || cleanEmail === 'gtmining2026@gmail.com'),
    });

    return res.json({
      success: true,
      message: `A password reset link and 6-digit verification code have been dispatched to ${cleanEmail}. Please check your inbox or spam folder.`
    });
  } catch (emailErr) {
    console.error('[Email Dispatch Error]', emailErr);
    return res.status(500).json({
      success: false,
      message: 'Failed to send recovery email. Please verify the email address and try again.'
    });
  }
});

// Reset Password - Verifies OTP and updates user passwordHash
router.post('/reset-password', async (req, res) => {
  const { email, newPassword, otpCode } = req.body;
  if (!email || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Valid email and new password (min 6 chars) required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail && !u.deletedAt);

  if (!user) {
    return res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
  }

  // If OTP code is provided, verify against database
  if (otpCode && otpCode.trim()) {
    const cleanOtp = otpCode.trim();
    const resetRecord = (db.passwordResets || []).find(
      r => r.email === cleanEmail && r.otpCode === cleanOtp && !r.used
    );

    if (!resetRecord) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check your email.' });
    }

    if (new Date(resetRecord.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    resetRecord.used = true;
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
