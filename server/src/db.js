import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

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
        fullName: 'GT Administrator',
        email: 'admin@gtmining.com',
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
      },
      {
        id: 'usr_demo_002',
        fullName: 'Alex Reynolds',
        email: 'demo@gtmining.com',
        passwordHash: demoUserPasswordHash,
        referralCode: 'GT88241',
        referredByUserId: 'usr_admin_001',
        role: 'USER',
        accountStatus: 'ACTIVE',
        emailVerifiedAt: now,
        lastMiningAt: null,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: now,
        deletedAt: null
      }
    ],
    wallets: [
      {
        id: 'wal_admin_001',
        userId: 'usr_admin_001',
        availableBalance: 10.0,
        lifetimeEarned: 10.0,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'wal_demo_002',
        userId: 'usr_demo_002',
        availableBalance: 2.5,
        lifetimeEarned: 2.5,
        createdAt: now,
        updatedAt: now
      }
    ],
    walletTransactions: [
      {
        id: 'tx_seed_001',
        userId: 'usr_demo_002',
        type: 'MINING_REWARD',
        amount: 1.0,
        status: 'COMPLETED',
        idempotencyKey: 'idemp_seed_001',
        referenceId: 'claim_seed_001',
        description: 'First successful 4h mining claim',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        createdBy: 'SYSTEM'
      },
      {
        id: 'tx_seed_002',
        userId: 'usr_demo_002',
        type: 'MINING_REWARD',
        amount: 1.0,
        status: 'COMPLETED',
        idempotencyKey: 'idemp_seed_002',
        referenceId: 'claim_seed_002',
        description: 'Second successful 4h mining claim',
        createdAt: new Date(Date.now() - 3600000 * 25).toISOString(),
        createdBy: 'SYSTEM'
      },
      {
        id: 'tx_seed_003',
        userId: 'usr_demo_002',
        type: 'REFERRAL_REWARD',
        amount: 0.5,
        status: 'COMPLETED',
        idempotencyKey: 'idemp_seed_003',
        referenceId: 'ref_seed_001',
        description: 'Referral reward from community friend registration',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'SYSTEM'
      }
    ],
    miningClaims: [
      {
        id: 'claim_seed_001',
        userId: 'usr_demo_002',
        rewardAmount: 1.0,
        claimedAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago (eligible now!)
        nextEligibleAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        transactionId: 'tx_seed_001',
        status: 'SUCCESS'
      }
    ],
    referrals: [
      {
        id: 'ref_seed_001',
        referrerUserId: 'usr_admin_001',
        referredUserId: 'usr_demo_002',
        referralCodeUsed: 'GTADMIN',
        status: 'ACTIVE',
        rewardAmount: 0.5,
        rewardStatus: 'CREDITED',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        rewardCreditedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
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
    notifications: [
      {
        id: 'notif_001',
        userId: 'usr_demo_002',
        title: 'Welcome to GT Network',
        message: 'Your GT wallet has been created with a unique referral link. Start your first mining cycle now!',
        type: 'SYSTEM',
        readAt: null,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'notif_002',
        userId: 'usr_demo_002',
        title: 'Mining Claim Confirmed',
        message: 'You successfully claimed +1.0 GT coin! Your 4-hour cooldown is active.',
        type: 'MINING',
        readAt: null,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ],
    adminAuditLogs: [
      {
        id: 'audit_001',
        adminUserId: 'usr_admin_001',
        action: 'SYSTEM_INITIALIZATION',
        entityType: 'SYSTEM',
        entityId: 'global',
        reason: 'Initial platform setup with default mining cooldown of 4 hours',
        metadata: { miningReward: 1.0, cooldownSeconds: 14400 },
        createdAt: now
      }
    ]
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
