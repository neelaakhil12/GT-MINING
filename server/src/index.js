import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';

import authRouter from './routes/auth.js';
import miningRouter from './routes/mining.js';
import dashboardRouter from './routes/dashboard.js';
import referralsRouter from './routes/referrals.js';
import walletRouter from './routes/wallet.js';
import communityRouter from './routes/community.js';
import profileRouter from './routes/profile.js';
import notificationsRouter from './routes/notifications.js';
import privateNetworkRouter from './routes/privateNetwork.js';
import adminRouter from './routes/admin.js';
import tasksRouter from './routes/tasks.js';
import marketRouter from './routes/market.js';
import { readDB } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Trust reverse proxy (Nginx) for correct rate limiting & client IP detection
app.set('trust proxy', 1);

// Initialize / verify database on boot
readDB();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static uploaded files (videos, proofs, avatars)
const UPLOADS_DIR = path.resolve('uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

// Rate limiter for mining claims
const miningLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, message: 'Too many mining requests. Please wait a moment.' }
});

// Mount Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/mining', miningLimiter, miningRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/community', communityRouter);
app.use('/api/profile', profileRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/private-network', privateNetworkRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/admin', adminRouter);
app.use('/api/market', marketRouter);

// Public Banners Endpoints
app.get('/api/onboarding-banners', (req, res) => {
  const db = readDB();
  const banners = (db.onboardingBanners || []).filter(b => b.isActive !== false);
  return res.json({ success: true, banners });
});

app.get('/api/home-banners', (req, res) => {
  const db = readDB();
  const banners = (db.homeBanners || []).filter(b => b.isActive !== false);
  return res.json({ success: true, banners });
});

// Public Tasks Endpoint
app.get('/api/tasks', (req, res) => {
  const db = readDB();
  const tasks = (db.tasks || []).filter(t => t.isActive !== false);
  return res.json({ success: true, tasks });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GT Mining Backend API'
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred. Please try again later.'
  });
});

app.listen(PORT, () => {
  console.log(`[GT Server] Backend running at http://localhost:${PORT}`);
});
