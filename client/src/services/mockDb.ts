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
    const summaryData = {
      referralCode: currentUser.referralCode || 'GT78492',
      referralLink: `${window.location.origin}/signup?ref=${currentUser.referralCode || 'GT78492'}`,
      totalReferrals: 8,
      activeFriends: 6,
      inactiveFriends: 2,
      totalReferralRewardsEarned: 4.0,
      activeThresholdDays: 7,
    };
    return {
      success: true,
      stats: summaryData,
      ...summaryData,
    };
  }

  if (endpoint === '/referrals/history') {
    const list = [
      { id: 'ref_01', friendName: 'Alex Morgan', friendEmail: 'a.morgan@mining.io', registeredAt: new Date(Date.now() - 43200000).toISOString(), isActive: true, rewardAmount: 0.5, rewardStatus: 'CREDITED' },
      { id: 'ref_02', friendName: 'Elena Rostova', friendEmail: 'e.rostova@chainmail.com', registeredAt: new Date(Date.now() - 86400000).toISOString(), isActive: true, rewardAmount: 0.5, rewardStatus: 'CREDITED' },
      { id: 'ref_03', friendName: 'Marcus Vance', friendEmail: 'marcus.v@crypto.net', registeredAt: new Date(Date.now() - 172800000).toISOString(), isActive: true, rewardAmount: 0.5, rewardStatus: 'CREDITED' },
      { id: 'ref_04', friendName: 'Sofia Chen', friendEmail: 'sofia.chen@web3.org', registeredAt: new Date(Date.now() - 259200000).toISOString(), isActive: true, rewardAmount: 0.5, rewardStatus: 'CREDITED' },
      { id: 'ref_05', friendName: 'Priya Sharma', friendEmail: 'priya.s@node.tech', registeredAt: new Date(Date.now() - 345600000).toISOString(), isActive: true, rewardAmount: 0.5, rewardStatus: 'CREDITED' },
      { id: 'ref_06', friendName: 'David Miller', friendEmail: 'd.miller@ledger.com', registeredAt: new Date(Date.now() - 432000000).toISOString(), isActive: true, rewardAmount: 0.5, rewardStatus: 'CREDITED' },
      { id: 'ref_07', friendName: 'Liam Connor', friendEmail: 'l.connor@proton.me', registeredAt: new Date(Date.now() - 604800000).toISOString(), isActive: false, rewardAmount: 0.5, rewardStatus: 'PENDING' },
      { id: 'ref_08', friendName: 'Chloe Dubois', friendEmail: 'chloe.d@meta.fr', registeredAt: new Date(Date.now() - 777600000).toISOString(), isActive: false, rewardAmount: 0.5, rewardStatus: 'PENDING' },
    ];
    return {
      success: true,
      history: list,
      referrals: list,
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
          imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop',
          isPinned: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          content: 'We are thrilled to unveil the GT Network virtual coin mining application. Registered pioneers can claim 1.0 GT virtual block tokens every 4 hours verified by atomic ledger integrity.',
        },
        {
          id: 'post_2',
          title: 'Mining Integrity & The 4-Hour Cooldown Protocol',
          category: 'Update',
          authorName: 'Tech Lead',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
          isPinned: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          content: 'To preserve network fairness, the 4-hour cooldown rule is strictly verified on-chain and through our atomic backend ledger. Timestamps are synchronized in UTC. Double claims or tab tampering are intercepted automatically.',
        },
        {
          id: 'post_3',
          title: 'Referral Rewards Program is Live',
          category: 'Ecosystem',
          authorName: 'Growth Team',
          imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
          isPinned: false,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          content: 'Share your custom referral code or one-click invite link across WhatsApp, Telegram, and social channels. Friends who register through your link become part of your mining circle.',
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

  // Private Network Handlers
  if (endpoint === '/private-network') {
    const rawStored = localStorage.getItem('gt_mock_private_network_v1');
    if (rawStored) {
      try {
        return JSON.parse(rawStored);
      } catch (_) {}
    }

    const defaultCircleData = {
      success: true,
      circleHost: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        referralCode: currentUser.referralCode,
        totalReferrals: 10,
      },
      stats: {
        totalMembers: 10,
        activeMiningCount: 6,
        idleCount: 4,
      },
      members: [
        { id: 'pn_1', name: 'Rahul Varma', maskedId: 'GT-91****24', email: 'ra***@gmail.com', initials: 'RV', avatarColor: 'from-[#3B82F6] to-[#60A5FA]', isMiningActive: true, lastMiningAt: new Date(Date.now() - 45 * 60000).toISOString(), nextEligibleAt: new Date(Date.now() + (240 - 45) * 60000).toISOString(), totalMined: 24.0, streakDays: 6, activityStatus: 'MINING' },
        { id: 'pn_2', name: 'Priya Sharma', maskedId: 'GT-44****89', email: 'pr***@yahoo.com', initials: 'PS', avatarColor: 'from-[#EC4899] to-[#F472B6]', isMiningActive: false, lastMiningAt: new Date(Date.now() - 310 * 60000).toISOString(), nextEligibleAt: new Date(Date.now() - 70 * 60000).toISOString(), totalMined: 18.0, streakDays: 3, activityStatus: 'IDLE' },
        { id: 'pn_3', name: 'Arjun Reddy', maskedId: 'GT-77****12', email: 'ar***@outlook.com', initials: 'AR', avatarColor: 'from-[#10B981] to-[#34D399]', isMiningActive: true, lastMiningAt: new Date(Date.now() - 110 * 60000).toISOString(), nextEligibleAt: new Date(Date.now() + (240 - 110) * 60000).toISOString(), totalMined: 42.0, streakDays: 14, activityStatus: 'MINING' },
        { id: 'pn_4', name: 'Kavya Nair', maskedId: 'GT-55****67', email: 'ka***@gmail.com', initials: 'KN', avatarColor: 'from-[#8B5CF6] to-[#A78BFA]', isMiningActive: false, lastMiningAt: new Date(Date.now() - 480 * 60000).toISOString(), nextEligibleAt: new Date(Date.now() - 240 * 60000).toISOString(), totalMined: 8.0, streakDays: 1, activityStatus: 'IDLE' },
        { id: 'pn_5', name: 'Sneha Rao', maskedId: 'GT-23****45', email: 'sn***@gmail.com', initials: 'SR', avatarColor: 'from-[#F59E0B] to-[#FBBF24]', isMiningActive: true, lastMiningAt: new Date(Date.now() - 30 * 60000).toISOString(), nextEligibleAt: new Date(Date.now() + (240 - 30) * 60000).toISOString(), totalMined: 31.0, streakDays: 9, activityStatus: 'MINING' },
        { id: 'pn_6', name: 'Vikram Patel', maskedId: 'GT-88****31', email: 'vi***@hotmail.com', initials: 'VP', avatarColor: 'from-[#14B8A6] to-[#2DD4BF]', isMiningActive: false, lastMiningAt: new Date(Date.now() - 380 * 60000).toISOString(), nextEligibleAt: new Date(Date.now() - 140 * 60000).toISOString(), totalMined: 15.0, streakDays: 4, activityStatus: 'IDLE' },
        { id: 'pn_7', name: 'Elena Rostova', maskedId: 'GT-66****90', email: 'el***@crypto.net', initials: 'ER', avatarColor: 'from-[#06B6D4] to-[#22D3EE]', isMiningActive: true, lastMiningAt: new Date(Date.now() - 95 * 60000).toISOString(), nextEligibleAt: new Date(Date.now() + (240 - 95) * 60000).toISOString(), totalMined: 55.0, streakDays: 18, activityStatus: 'MINING' },
        { id: 'pn_8', name: 'Deepak Gupta', maskedId: 'GT-33****58', email: 'de***@gmail.com', initials: 'DG', avatarColor: 'from-[#6366F1] to-[#818CF8]', isMiningActive: false, lastMiningAt: new Date(Date.now() - 620 * 60000).toISOString(), nextEligibleAt: new Date(Date.now() - 380 * 60000).toISOString(), totalMined: 5.0, streakDays: 1, activityStatus: 'IDLE' },
        { id: 'pn_9', name: 'Ananya Das', maskedId: 'GT-19****73', email: 'an***@gmail.com', initials: 'AD', avatarColor: 'from-[#D946EF] to-[#F0ABFC]', isMiningActive: true, lastMiningAt: new Date(Date.now() - 15 * 60000).toISOString(), nextEligibleAt: new Date(Date.now() + (240 - 15) * 60000).toISOString(), totalMined: 29.0, streakDays: 8, activityStatus: 'MINING' },
        { id: 'pn_10', name: 'Rohit Verma', maskedId: 'GT-48****16', email: 'ro***@yahoo.com', initials: 'RV', avatarColor: 'from-[#84CC16] to-[#A3E635]', isMiningActive: true, lastMiningAt: new Date(Date.now() - 180 * 60000).toISOString(), nextEligibleAt: new Date(Date.now() + (240 - 180) * 60000).toISOString(), totalMined: 20.0, streakDays: 5, activityStatus: 'MINING' },
      ],
      messages: [
        {
          id: 'msg_1',
          circleId: currentUser.id,
          senderId: currentUser.id,
          senderName: currentUser.fullName,
          senderRole: 'HOST',
          senderAvatar: currentUser.fullName.charAt(0).toUpperCase(),
          text: '👋 Welcome team to our Private Mining Circle! Let\'s keep our hash power at 100% by claiming every 4 hours.',
          type: 'CHAT',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'msg_2',
          circleId: currentUser.id,
          senderId: 'pn_1',
          senderName: 'Rahul Varma',
          senderRole: 'MEMBER',
          senderAvatar: 'RV',
          text: 'Thanks for the invite bro! Just claimed my +1 GT ⛏️',
          type: 'CHAT',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'msg_3',
          circleId: currentUser.id,
          senderId: 'pn_3',
          senderName: 'Arjun Reddy',
          senderRole: 'MEMBER',
          senderAvatar: 'AR',
          text: 'Epoch synced! Ready for next mining window.',
          type: 'CHAT',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    };

    localStorage.setItem('gt_mock_private_network_v1', JSON.stringify(defaultCircleData));
    return defaultCircleData;
  }

  if (endpoint === '/private-network/messages' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const rawStored = localStorage.getItem('gt_mock_private_network_v1');
    const circle = rawStored ? JSON.parse(rawStored) : { messages: [] };

    const newMsg = {
      id: `msg_${Date.now()}`,
      circleId: currentUser.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: 'HOST',
      senderAvatar: currentUser.fullName.charAt(0).toUpperCase(),
      text: body.text || '',
      type: body.type || 'CHAT',
      targetMemberId: body.targetMemberId || null,
      targetMemberName: body.targetMemberName || null,
      createdAt: new Date().toISOString(),
    };

    circle.messages.push(newMsg);
    localStorage.setItem('gt_mock_private_network_v1', JSON.stringify(circle));
    return { success: true, message: newMsg };
  }

  if (endpoint === '/private-network/ping-member' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const rawStored = localStorage.getItem('gt_mock_private_network_v1');
    const circle = rawStored ? JSON.parse(rawStored) : { messages: [], members: [] };

    const targetMember = circle.members?.find((m: any) => m.id === body.memberId);
    if (targetMember) {
      targetMember.lastPingedAt = new Date().toISOString();
    }

    const newMsg = {
      id: `msg_ping_${Date.now()}`,
      circleId: currentUser.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: 'HOST',
      senderAvatar: currentUser.fullName.charAt(0).toUpperCase(),
      text: `⏰ @${body.memberName || 'Member'}, your 4-Hour GT Mining session is ready! Tap 'Mine Now' to claim your 1.00 GT reward and keep our circle streak alive.`,
      type: 'REMINDER',
      targetMemberId: body.memberId,
      targetMemberName: body.memberName,
      createdAt: new Date().toISOString(),
    };

    circle.messages.push(newMsg);
    localStorage.setItem('gt_mock_private_network_v1', JSON.stringify(circle));
    return { success: true, message: newMsg, member: targetMember };
  }

  // Default fallback
  return {
    success: true,
    message: 'Operation executed successfully (Cloud Node)',
  };
};
