import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;

// AWS PostgreSQL Connection Pool
export const pool = new Pool({
  host: process.env.DB_HOST || '13.210.13.49',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'gt_mining',
  user: process.env.DB_USER || 'gtadmin',
  password: process.env.DB_PASSWORD || 'GtMiningPass2026!',
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.warn('[PostgreSQL Pool Notice]', err.message);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory lock mechanism to serialize operations per user and prevent race conditions
class AsyncLock {
  constructor() {
    this.locks = new Map();
  }

  async acquire(key) {
    while (this.locks.get(key)) {
      await new Promise(resolve => setTimeout(resolve, 15));
    }
    this.locks.set(key, true);
  }

  release(key) {
    this.locks.delete(key);
  }
}

export const lockManager = new AsyncLock();

// Initial database schema & seed
const getInitialData = () => {
  const adminPasswordHash = bcrypt.hashSync('Admin@123456', 10);
  const demoUserPasswordHash = bcrypt.hashSync('User@123456', 10);
  const now = new Date().toISOString();

  return {
    settings: {
      appName: 'GT Mining',
      websiteUrl: 'http://localhost:5174',
      miningReward: 1.0,
      cooldownSeconds: 14400, // 4 hours
      referralReward: 0.5,
      activeThresholdDays: 7,
      miningEnabled: true,
      maintenanceMode: false,
      termsUrl: '/terms',
      privacyUrl: '/privacy'
    },
    users: [
      {
        id: 'usr_admin_001',
        fullName: 'GT Master Administrator',
        email: 'gtmining2026@gmail.com',
        passwordHash: adminPasswordHash,
        referralCode: 'GTADMIN',
        referredByUserId: null,
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
        emailVerifiedAt: now,
        lastMiningAt: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null
      }
    ],
    wallets: [
      {
        id: 'wal_admin_001',
        userId: 'usr_admin_001',
        availableBalance: 0.0,
        lifetimeEarned: 0.0,
        createdAt: now,
        updatedAt: now
      }
    ],
    walletTransactions: [],
    miningClaims: [],
    referrals: [],
    communityPosts: [
      {
        id: 'post_001',
        title: 'Welcome to GT Mining: Next Phase of Virtual Web3 Hash Power',
        content: 'We are thrilled to officially launch the GT Mining network! Every participant can mine 1 GT coin every 4 hours with zero hardware consumption. Invite friends to multiply network engagement, earn referral bonuses, and secure your place on the global ledger. Check back for frequent node updates and ecosystem milestones.',
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop',
        category: 'Announcement',
        status: 'PUBLISHED',
        isPinned: true,
        authorName: 'GT Foundation',
        createdBy: 'usr_admin_001',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'post_002',
        title: 'Mining Integrity & The 4-Hour Cooldown Protocol',
        content: 'To preserve network fairness, the 4-hour cooldown rule is strictly verified on-chain and through our atomic backend ledger. Timestamps are synchronized in UTC. Double claims or tab tampering are intercepted automatically. Happy mining!',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        category: 'Update',
        status: 'PUBLISHED',
        isPinned: false,
        authorName: 'Tech Lead',
        createdBy: 'usr_admin_001',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'post_003',
        title: 'Referral Rewards Program is Live',
        content: 'Share your custom referral code or one-click invite link across WhatsApp, Telegram, and social channels. Friends who register through your link become part of your mining circle.',
        imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
        category: 'Ecosystem',
        status: 'PUBLISHED',
        isPinned: false,
        authorName: 'Growth Team',
        createdBy: 'usr_admin_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    notifications: [],
    adminAuditLogs: []
  };
};

// Database Read/Write with atomic file replacement
export const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return getInitialData();
  }
};

export const writeDB = (data) => {
  const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(2, 7)}.tmp`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing database atomically:', err);
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch (_) {}
    // Fallback direct write
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  }
};

// Helper generator for unique readable IDs
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
};

// Unique referral code generator (e.g. GT + 6 alphanumeric characters)
export const generateReferralCode = (existingUsers = []) => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  let unique = false;
  while (!unique) {
    code = 'GT';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    unique = !existingUsers.some(u => u.referralCode === code);
  }
  return code;
};
