// Standalone persistent in-browser database for Vercel live deployments without backend server
export interface MockDatabase {
  users: Array<{
    id: string;
    fullName: string;
    email: string;
    role: 'USER' | 'ADMIN';
    referralCode: string;
    accountStatus: string;
    createdAt: string;
  }>;
  wallets: Record<string, {
    availableBalance: number;
    lifetimeEarned: number;
    lastMiningAt?: string;
    nextEligibleAt?: string;
  }>;
  claims: Array<{
    id: string;
    userId: string;
    rewardAmount: number;
    claimedAt: string;
    nextEligibleAt: string;
    transactionId: string;
    status: string;
  }>;
  transactions: Array<{
    id: string;
    userId: string;
    type: string;
    amount: number;
    status: string;
    description: string;
    createdAt: string;
  }>;
}

const STORAGE_KEY = 'gt_mock_database_v2';

const defaultDb: MockDatabase = {
  users: [
    {
      id: 'usr_admin_001',
      fullName: 'GT Administrator',
      email: 'admin@gtmining.com',
      role: 'ADMIN',
      referralCode: 'GTADMIN',
      accountStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_demo_002',
      fullName: 'Alex Reynolds',
      email: 'demo@gtmining.com',
      role: 'USER',
      referralCode: 'GT88241',
      accountStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ],
  wallets: {
    usr_demo_002: {
      availableBalance: 4.5,
      lifetimeEarned: 4.5,
      lastMiningAt: new Date(Date.now() - 3600000).toISOString(),
      nextEligibleAt: new Date(Date.now() + 10800000).toISOString(),
    },
    usr_admin_001: {
      availableBalance: 12.0,
      lifetimeEarned: 12.0,
    },
  },
  claims: [
    {
      id: 'claim_001',
      userId: 'usr_demo_002',
      rewardAmount: 1.0,
      claimedAt: new Date(Date.now() - 14400000).toISOString(),
      nextEligibleAt: new Date().toISOString(),
      transactionId: 'tx_001',
      status: 'SUCCESS',
    },
  ],
  transactions: [
    {
      id: 'tx_001',
      userId: 'usr_demo_002',
      type: 'MINING_REWARD',
      amount: 1.0,
      status: 'COMPLETED',
      description: '4-Hour Mining Reward (+1 GT)',
      createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'tx_002',
      userId: 'usr_demo_002',
      type: 'REFERRAL_REWARD',
      amount: 0.5,
      status: 'COMPLETED',
      description: 'Referral bonus from invited member',
      createdAt: new Date(Date.now() - 28800000).toISOString(),
    },
  ],
};

export const getMockDb = (): MockDatabase => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDb));
      return defaultDb;
    }
    return JSON.parse(raw);
  } catch {
    return defaultDb;
  }
};

export const saveMockDb = (db: MockDatabase): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {}
};

export const handleMockApi = (endpoint: string, options: RequestInit = {}): any => {
  const method = (options.method || 'GET').toUpperCase();
  const db = getMockDb();
  let body: any = {};
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {}
  }

  const activeUserId = localStorage.getItem('gt_active_user_id') || 'usr_demo_002';
  let currentUser = db.users.find((u) => u.id === activeUserId) || db.users[1];
  let currentWallet = db.wallets[currentUser.id] || {
    availableBalance: 4.5,
    lifetimeEarned: 4.5,
  };

  // Auth: Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const email = (body.email || '').toLowerCase().trim();
    let user = db.users.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      if (email.includes('admin')) {
        user = db.users[0]; // Admin
      } else {
        // Create demo account on the fly
        user = {
          id: `usr_${Date.now()}`,
          fullName: email.split('@')[0].replace('.', ' ').toUpperCase() || 'Demo Miner',
          email,
          role: 'USER',
          referralCode: `GT${Math.floor(10000 + Math.random() * 90000)}`,
          accountStatus: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
        db.wallets[user.id] = { availableBalance: 3.5, lifetimeEarned: 3.5 };
        saveMockDb(db);
      }
    }

    localStorage.setItem('gt_active_user_id', user.id);
    const token = `mock_jwt_${user.id}_${Date.now()}`;
    const wallet = db.wallets[user.id] || { availableBalance: 3.5, lifetimeEarned: 3.5 };

    return {
      success: true,
      message: 'Login successful',
      token,
      user,
      wallet,
    };
  }

  // Auth: Signup
  if (endpoint === '/auth/signup' && method === 'POST') {
    const email = (body.email || '').toLowerCase().trim();
    const newUser = {
      id: `usr_${Date.now()}`,
      fullName: body.fullName || 'New Pioneer',
      email,
      role: 'USER' as const,
      referralCode: `GT${Math.floor(10000 + Math.random() * 90000)}`,
      accountStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    db.wallets[newUser.id] = { availableBalance: 1.0, lifetimeEarned: 1.0 };
    saveMockDb(db);

    localStorage.setItem('gt_active_user_id', newUser.id);
    return {
      success: true,
      message: 'Account created successfully',
      token: `mock_jwt_${newUser.id}`,
      user: newUser,
      wallet: db.wallets[newUser.id],
    };
  }

  // Auth: Session
  if (endpoint === '/auth/session') {
    return {
      success: true,
      user: currentUser,
      wallet: currentWallet,
    };
  }

  // Mining: Status
  if (endpoint === '/mining/status') {
    return {
      success: true,
      isEligible: true,
      availableBalance: currentWallet.availableBalance,
      lifetimeEarned: currentWallet.lifetimeEarned,
      nextEligibleAt: currentWallet.nextEligibleAt || new Date(Date.now() + 14400000).toISOString(),
      lastMiningAt: currentWallet.lastMiningAt || new Date().toISOString(),
      cooldownSeconds: 14400,
      rewardAmount: 1.0,
    };
  }

  // Mining: Claim
  if (endpoint === '/mining/claim' && method === 'POST') {
    const reward = 1.0;
    const newBal = Number((currentWallet.availableBalance + reward).toFixed(4));
    const newLife = Number((currentWallet.lifetimeEarned + reward).toFixed(4));
    const nowIso = new Date().toISOString();
    const nextIso = new Date(Date.now() + 14400000).toISOString();

    db.wallets[currentUser.id] = {
      availableBalance: newBal,
      lifetimeEarned: newLife,
      lastMiningAt: nowIso,
      nextEligibleAt: nextIso,
    };

    const newClaim = {
      id: `claim_${Date.now()}`,
      userId: currentUser.id,
      rewardAmount: reward,
      claimedAt: nowIso,
      nextEligibleAt: nextIso,
      transactionId: `tx_${Date.now()}`,
      status: 'SUCCESS',
    };
    db.claims.unshift(newClaim);

    const newTx = {
      id: `tx_${Date.now()}`,
      userId: currentUser.id,
      type: 'MINING_REWARD',
      amount: reward,
      status: 'COMPLETED',
      description: '4-Hour Mining Reward (+1 GT)',
      createdAt: nowIso,
    };
    db.transactions.unshift(newTx);
    saveMockDb(db);

    return {
      success: true,
      message: '+1.0 GT claimed successfully!',
      rewardAmount: reward,
      availableBalance: newBal,
      lifetimeEarned: newLife,
      nextEligibleAt: nextIso,
      transaction: newTx,
    };
  }

  // Mining: History
  if (endpoint === '/mining/history') {
    return {
      success: true,
      claims: db.claims,
    };
  }

  // Dashboard: Summary
  if (endpoint === '/dashboard/summary') {
    return {
      success: true,
      user: currentUser,
      wallet: currentWallet,
      mining: {
        isEligible: true,
        nextEligibleAt: currentWallet.nextEligibleAt || new Date(Date.now() + 14400000).toISOString(),
        rewardRate: 1.0,
      },
      statistics: {
        totalReferrals: 3,
        activeFriends: 2,
        inactiveFriends: 1,
        totalGtEarned: currentWallet.lifetimeEarned,
      },
      referralData: {
        referralCode: currentUser.referralCode,
        referralLink: `${window.location.origin}/signup?ref=${currentUser.referralCode}`,
        recentReferrals: [
          { id: 'ref_1', friendName: 'Marcus Vance', registeredAt: new Date(Date.now() - 86400000).toISOString(), isActive: true, rewardAmount: 0.5 },
          { id: 'ref_2', friendName: 'Elena Rostova', registeredAt: new Date(Date.now() - 172800000).toISOString(), isActive: true, rewardAmount: 0.5 },
        ],
      },
      latestNews: [
        {
          id: 'news_1',
          title: 'Welcome to GT Mining: Next Phase of Virtual Web3 Hash Power',
          category: 'Announcement',
          createdAt: new Date().toISOString(),
          content: 'The GT Mining protocol is now active. Mine virtual GT blocks every 4 hours.',
        },
      ],
    };
  }

  // Wallet
  if (endpoint === '/wallet') {
    return {
      success: true,
      wallet: currentWallet,
      stats: {
        totalEarned: currentWallet.lifetimeEarned,
        totalClaims: db.claims.length,
      },
    };
  }

  if (endpoint.startsWith('/wallet/transactions')) {
    return {
      success: true,
      transactions: db.transactions,
    };
  }

  // Referrals: Summary
  if (endpoint === '/referrals/summary') {
    return {
      success: true,
      referralCode: currentUser.referralCode,
      referralLink: `${window.location.origin}/signup?ref=${currentUser.referralCode}`,
      totalReferrals: 3,
      activeFriends: 2,
      inactiveFriends: 1,
      totalEarnedFromReferrals: 1.5,
    };
  }

  if (endpoint === '/referrals/history') {
    return {
      success: true,
      referrals: [
        { id: 'ref_1', friendName: 'Marcus Vance', friendEmail: 'm.vance@example.com', registeredAt: new Date(Date.now() - 86400000).toISOString(), isActive: true, rewardAmount: 0.5 },
        { id: 'ref_2', friendName: 'Elena Rostova', friendEmail: 'elena.r@example.com', registeredAt: new Date(Date.now() - 172800000).toISOString(), isActive: true, rewardAmount: 0.5 },
        { id: 'ref_3', friendName: 'Dmitri S.', friendEmail: 'dmitri@example.com', registeredAt: new Date(Date.now() - 345600000).toISOString(), isActive: false, rewardAmount: 0.5 },
      ],
    };
  }

  // Community posts
  if (endpoint.startsWith('/community/posts')) {
    return {
      success: true,
      posts: [
        {
          id: 'post_1',
          title: 'Welcome to GT Mining: Next Phase of Virtual Web3 Hash Power',
          category: 'Announcement',
          authorName: 'GT Foundation',
          isPinned: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          content: 'We are thrilled to unveil the GT Network virtual coin mining application. Registered pioneers can claim 1.0 GT virtual block tokens every 4 hours verified by atomic ledger integrity.',
        },
        {
          id: 'post_2',
          title: 'Global Node Network Upgrade & Epoch Acceleration',
          category: 'Update',
          authorName: 'Core Protocol Team',
          isPinned: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          content: 'Our distributed node network has undergone an algorithmic sync. Claim latency is sub-10ms and cross-border hashpower allocation is live.',
        },
      ],
    };
  }

  // Profile
  if (endpoint === '/profile') {
    return {
      success: true,
      user: currentUser,
      wallet: currentWallet,
    };
  }

  // Default fallback
  return {
    success: true,
    message: 'Operation executed successfully (Cloud Node)',
  };
};
