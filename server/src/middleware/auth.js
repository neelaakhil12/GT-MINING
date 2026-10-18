import jwt from 'jsonwebtoken';
import { readDB } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'gt-mining-secret-super-key-2026';

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const db = readDB();
    const user = db.users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    if (user.deletedAt || user.accountStatus === 'DELETED') {
      return res.status(403).json({ success: false, message: 'This account has been deleted.' });
    }

    if (user.accountStatus === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'This account has been suspended by an administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
};

export const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    }
  });
};
