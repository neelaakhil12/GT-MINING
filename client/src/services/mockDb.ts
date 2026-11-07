// Standalone persistent in-browser database for GT Network Admin and Client Operations
export interface CommunityPostItem {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorRole?: string;
  imageUrl?: string;
  likesCount?: number;
  commentsCount?: number;
  isPinned: boolean;
  status: 'PUBLISHED' | 'DRAFT';
  createdAt: string;
  updatedAt?: string;
}

export interface OnboardingBannerItem {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  badgeText?: string;
  isActive: boolean;
  createdAt: string;
}

export interface HomeBannerItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  ctaText: string;
  targetRoute: string;
  accentColor: string;
  gradientStart: string;
  gradientEnd: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface MockDatabase {
  users: Array<{
    id: string;
    fullName: string;
    email: string;
    role: 'USER' | 'ADMIN';
    referralCode: string;
    accountStatus: string;
    lastMiningAt?: string;
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
  posts: CommunityPostItem[];
  onboardingBanners: OnboardingBannerItem[];
  homeBanners: HomeBannerItem[];
  privateNetworks?: Record<string, any>;
  referrals?: Array<any>;
}

const STORAGE_KEY = 'gt_mock_database_v3';

const now = Date.now();
const hour = 3600000;
const day = 86400000;

const defaultDb: MockDatabase = {
  users: [
    {
      id: 'usr_admin_001',
      fullName: 'GT Master Administrator',
      email: 'gtmining2026@gmail.com',
      role: 'ADMIN',
      referralCode: 'GTADMIN',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - hour * 2).toISOString(),
      createdAt: new Date(now - day * 30).toISOString(),
    },
    {
      id: 'usr_demo_002',
      fullName: 'Akhil Kumar',
      email: 'demo@gtmining.com',
      role: 'USER',
      referralCode: 'GT88241',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - hour * 1).toISOString(),
      createdAt: new Date(now - day * 14).toISOString(),
    },
    {
      id: 'usr_003',
      fullName: 'Rahul Varma',
      email: 'rahul.varma@gmail.com',
      role: 'USER',
      referralCode: 'GT55291',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - hour * 3).toISOString(),
      createdAt: new Date(now - day * 10).toISOString(),
    },
    {
      id: 'usr_004',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@yahoo.com',
      role: 'USER',
      referralCode: 'GT44182',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - hour * 5).toISOString(),
      createdAt: new Date(now - day * 9).toISOString(),
    },
    {
      id: 'usr_005',
      fullName: 'Arjun Reddy',
      email: 'arjun.reddy@outlook.com',
      role: 'USER',
      referralCode: 'GT77312',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - hour * 2).toISOString(),
      createdAt: new Date(now - day * 8).toISOString(),
    },
    {
      id: 'usr_006',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@crypto.net',
      role: 'USER',
      referralCode: 'GT66901',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - hour * 4).toISOString(),
      createdAt: new Date(now - day * 7).toISOString(),
    },
    {
      id: 'usr_007',
      fullName: 'Vikram Patel',
      email: 'vikram.patel@hotmail.com',
      role: 'USER',
      referralCode: 'GT88134',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - hour * 6).toISOString(),
      createdAt: new Date(now - day * 6).toISOString(),
    },
    {
      id: 'usr_008',
      fullName: 'Sneha Rao',
      email: 'sneha.rao@gmail.com',
      role: 'USER',
      referralCode: 'GT23445',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - hour * 8).toISOString(),
      createdAt: new Date(now - day * 5).toISOString(),
    },
    {
      id: 'usr_009',
      fullName: 'Marcus Vance',
      email: 'marcus.vance@tech.co',
      role: 'USER',
      referralCode: 'GT99182',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - hour * 12).toISOString(),
      createdAt: new Date(now - day * 4).toISOString(),
    },
    {
      id: 'usr_010',
      fullName: 'Ananya Das',
      email: 'ananya.das@gmail.com',
      role: 'USER',
      referralCode: 'GT19773',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - hour * 16).toISOString(),
      createdAt: new Date(now - day * 3).toISOString(),
    },
    {
      id: 'usr_011',
      fullName: 'David Miller',
      email: 'david.miller@ledger.org',
      role: 'USER',
      referralCode: 'GT33190',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - day * 3).toISOString(),
      createdAt: new Date(now - day * 12).toISOString(),
    },
    {
      id: 'usr_012',
      fullName: 'Chloe Dubois',
      email: 'chloe.dubois@meta.fr',
      role: 'USER',
      referralCode: 'GT88201',
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date(now - day * 10).toISOString(),
      createdAt: new Date(now - day * 20).toISOString(),
    },
  ],
  wallets: {
    usr_demo_002: {
      availableBalance: 0.0,
      lifetimeEarned: 0.0,
      lastMiningAt: new Date(now - hour * 1).toISOString(),
      nextEligibleAt: new Date(now + hour * 3).toISOString(),
    },
    usr_admin_001: {
      availableBalance: 5200.0,
      lifetimeEarned: 5200.0,
    },
  },
  claims: [
    {
      id: 'claim_101',
      userId: 'usr_demo_002',
      rewardAmount: 1.0,
      claimedAt: new Date(now - hour * 1).toISOString(),
      nextEligibleAt: new Date(now + hour * 3).toISOString(),
      transactionId: 'tx_101',
      status: 'SUCCESS',
    },
    {
      id: 'claim_102',
      userId: 'usr_003',
      rewardAmount: 1.0,
      claimedAt: new Date(now - hour * 3).toISOString(),
      nextEligibleAt: new Date(now + hour * 1).toISOString(),
      transactionId: 'tx_102',
      status: 'SUCCESS',
    },
    {
      id: 'claim_103',
      userId: 'usr_005',
      rewardAmount: 1.0,
      claimedAt: new Date(now - hour * 2).toISOString(),
      nextEligibleAt: new Date(now + hour * 2).toISOString(),
      transactionId: 'tx_103',
      status: 'SUCCESS',
    },
    {
      id: 'claim_104',
      userId: 'usr_006',
      rewardAmount: 1.0,
      claimedAt: new Date(now - hour * 4).toISOString(),
      nextEligibleAt: new Date(now).toISOString(),
      transactionId: 'tx_104',
      status: 'SUCCESS',
    },
    {
      id: 'claim_105',
      userId: 'usr_008',
      rewardAmount: 1.0,
      claimedAt: new Date(now - hour * 8).toISOString(),
      nextEligibleAt: new Date(now - hour * 4).toISOString(),
      transactionId: 'tx_105',
      status: 'SUCCESS',
    },
    {
      id: 'claim_106',
      userId: 'usr_010',
      rewardAmount: 1.0,
      claimedAt: new Date(now - hour * 16).toISOString(),
      nextEligibleAt: new Date(now - hour * 12).toISOString(),
      transactionId: 'tx_106',
      status: 'SUCCESS',
    },
  ],
  transactions: [
    {
      id: 'tx_101',
      userId: 'usr_demo_002',
      type: 'MINING_REWARD',
      amount: 1.0,
      status: 'COMPLETED',
      description: '4-Hour Mining Reward (+1 GT)',
      createdAt: new Date(now - hour * 1).toISOString(),
    },
    {
      id: 'tx_102',
      userId: 'usr_demo_002',
      type: 'REFERRAL_REWARD',
      amount: 0.5,
      status: 'COMPLETED',
      description: 'Referral commission (+0.5 GT)',
      createdAt: new Date(now - day * 1).toISOString(),
    },
  ],
  posts: [
    {
      id: "post_live_004",
      title: "esrdhjkl",
      content: "Once upon a time, there was a small village surrounded by beautiful green forests. A young boy named Rahul lived in that village. Rahul was a kind and curious boy who loved exploring nature. Every evening, he went for a walk near the forest. One day, he discovered a strange tree with magic green crystals.\n\nRahul learned that true happiness comes from helping people.\n\nAnd he lived happily ever after.",
      imageUrl: "/gt-logo.png",
      category: "Announcement",
      status: "PUBLISHED",
      isPinned: false,
      authorName: "GT Foundation",
      authorRole: "Verified Publisher",
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  onboardingBanners: [
    {
      id: 'ob_001',
      stepNumber: 1,
      title: 'Automated 4-Hour Mining Engine',
      subtitle: 'Zero hardware wear, zero battery drain',
      description:
        'Activate your mining node with 1 tap. Mine virtual GT coins effortlessly on your mobile device or web browser.',
      imageUrl: '/onboarding/story_1.jpg',
      ctaText: 'Next Step →',
      ctaLink: '/tour',
      badgeText: 'DECENTRALIZED VIRTUAL MINING',
      isActive: true,
      createdAt: new Date(now - day * 20).toISOString(),
    },
    {
      id: 'ob_002',
      stepNumber: 2,
      title: "Recognized by the world's largest stock exchange",
      subtitle: 'The only blockchain company invited by the NYSE',
      description:
        'The modern blockchain protocol built for institutional transparency and verifiable distributed ledgers.',
      imageUrl: '/onboarding/story_2.jpg',
      ctaText: 'Next Step →',
      ctaLink: '/tour',
      badgeText: 'INSTITUTIONAL TRUST',
      isActive: true,
      createdAt: new Date(now - day * 20).toISOString(),
    },
    {
      id: 'ob_003',
      stepNumber: 3,
      title: 'Autonomous 10% Yield Accrual',
      subtitle: 'Protocol dividend distribution',
      description:
        'Receive instant lifetime mining commissions whenever your peer network and invited nodes finalize cycles.',
      imageUrl: '/onboarding/story_3.jpg',
      ctaText: 'Get Started Now 🚀',
      ctaLink: '/signup',
      badgeText: '10% LIFETIME REWARD',
      isActive: true,
      createdAt: new Date(now - day * 20).toISOString(),
    },
  ],
  homeBanners: [
    {
      id: 'hb_001',
      tag: 'GT ECOSYSTEM',
      title: 'Join the Future of Mining',
      description: 'Experience the next-generation autonomous GT network.',
      ctaText: 'Explore Now',
      targetRoute: '/mining',
      accentColor: '#22C55E',
      gradientStart: '#0A2A18',
      gradientEnd: '#05180E',
      imageUrl: '/banners/slide1.jpg',
      isActive: true,
      order: 1,
      createdAt: new Date(now - day * 15).toISOString(),
    },
    {
      id: 'hb_002',
      tag: 'GLOBAL ALLIANCE',
      title: 'Exclusive Rewards',
      description: 'Invite your circle and multiply your GT mining hashpower.',
      ctaText: 'Invite Friends',
      targetRoute: '/referrals',
      accentColor: '#38BDF8',
      gradientStart: '#07241C',
      gradientEnd: '#041611',
      imageUrl: '/banners/slide2.jpg',
      isActive: true,
      order: 2,
      createdAt: new Date(now - day * 15).toISOString(),
    },
    {
      id: 'hb_003',
      tag: 'DECENTRALIZED VAULT',
      title: 'Next-Gen Asset Security',
      description: 'Fair allocation protocol locked by 4-hour cryptographic epochs.',
      ctaText: 'View Wallet',
      targetRoute: '/wallet',
      accentColor: '#A855F7',
      gradientStart: '#121829',
      gradientEnd: '#060A14',
      imageUrl: '/banners/slide3.jpg',
      isActive: true,
      order: 3,
      createdAt: new Date(now - day * 15).toISOString(),
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
    const parsed = JSON.parse(raw);
    // Ensure all new collections exist
    if (!parsed.posts) parsed.posts = defaultDb.posts;
    if (!parsed.onboardingBanners) parsed.onboardingBanners = defaultDb.onboardingBanners;
    if (!parsed.homeBanners) parsed.homeBanners = defaultDb.homeBanners;
    return parsed;
  } catch {
    return defaultDb;
  }
};

export const saveMockDb = (db: MockDatabase): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    // Dispatch a storage event so active pages refresh in real time
    window.dispatchEvent(new Event('gt_db_updated'));
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
    availableBalance: 0.0,
    lifetimeEarned: 0.0,
  };

  // ---------------------------------------------------------------------------
  // 1. ADMIN DASHBOARD & METRICS
  // ---------------------------------------------------------------------------
  if (endpoint === '/admin/dashboard') {
    const nowMs = Date.now();
    const oneDayMs = 24 * 3600 * 1000;
    const sevenDaysMs = 7 * 24 * 3600 * 1000;

    const totalUsers = db.users.length;

    // Daily active miners count: users who mined within the last 24 hours
    const dailyActiveMiners = db.users.filter((u) => {
      if (!u.lastMiningAt) return false;
      return nowMs - new Date(u.lastMiningAt).getTime() <= oneDayMs;
    });
    const dailyActiveMinersCount = dailyActiveMiners.length;

    // Active within 7 days
    const activeUsers = db.users.filter((u) => {
      if (!u.lastMiningAt) return false;
      return nowMs - new Date(u.lastMiningAt).getTime() <= sevenDaysMs;
    }).length;

    const inactiveUsers = totalUsers - activeUsers;

    // Total claims & coins
    const totalMiningClaims = db.claims.length;
    let totalCoinsIssued = 0;
    Object.values(db.wallets).forEach((w) => {
      totalCoinsIssued += Number(w.availableBalance || 0);
    });

    const recentRegistrations = [...db.users]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
      .map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        referralCode: u.referralCode,
        accountStatus: u.accountStatus,
        createdAt: u.createdAt,
      }));

    const recentMiningActivity = [...db.claims]
      .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime())
      .slice(0, 6)
      .map((c) => {
        const u = db.users.find((usr) => usr.id === c.userId);
        return {
          id: c.id,
          userName: u ? u.fullName : 'Active Pioneer',
          rewardAmount: c.rewardAmount,
          claimedAt: c.claimedAt,
          status: c.status,
        };
      });

    return {
      success: true,
      metrics: {
        totalUsers,
        dailyActiveMinersCount,
        activeUsers,
        inactiveUsers,
        totalMiningClaims,
        totalCoinsIssued,
        totalReferralRewardsCredited: (db.referrals || [])
          .filter((r: any) => r.rewardStatus === 'CREDITED')
          .reduce((sum: number, r: any) => sum + Number(r.rewardAmount || 0), 0),
        todayMiningClaimsCount: db.claims.filter(
          (c) => nowMs - new Date(c.claimedAt).getTime() <= oneDayMs
        ).length,
      },
      recentRegistrations,
      recentMiningActivity,
    };
  }

  // ---------------------------------------------------------------------------
  // 2. ADMIN COMMUNITY / NODE POSTS CRUD
  // ---------------------------------------------------------------------------
  if (endpoint.startsWith('/admin/community/posts')) {
    const parts = endpoint.split('/');
    const postId = parts[4]; // e.g. /admin/community/posts/:id

    // DELETE Post
    if (method === 'DELETE' && postId) {
      db.posts = db.posts.filter((p) => p.id !== postId);
      saveMockDb(db);
      return { success: true, message: 'Node post deleted successfully' };
    }

    // UPDATE / EDIT Post
    if (method === 'PATCH' && postId) {
      const idx = db.posts.findIndex((p) => p.id === postId);
      if (idx !== -1) {
        db.posts[idx] = {
          ...db.posts[idx],
          ...body,
          updatedAt: new Date().toISOString(),
        };
        saveMockDb(db);
        return { success: true, post: db.posts[idx], message: 'Node post updated successfully' };
      }
      return { success: false, message: 'Post not found' };
    }

    // CREATE New Post
    if (method === 'POST') {
      const newPost: CommunityPostItem = {
        id: `post_${Date.now()}`,
        title: body.title || 'Untitled Post',
        content: body.content || '',
        category: body.category || 'Announcement',
        authorName: body.authorName || 'GT Foundation',
        authorRole: body.authorRole || 'Verified Publisher',
        imageUrl: body.imageUrl || null,
        likesCount: 0,
        commentsCount: 0,
        isPinned: Boolean(body.isPinned),
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (newPost.isPinned) {
        db.posts.unshift(newPost);
      } else {
        db.posts.splice(1, 0, newPost);
      }
      saveMockDb(db);
      return { success: true, post: newPost, message: 'Node post published successfully!' };
    }

    // GET Posts (Admin)
    return {
      success: true,
      posts: db.posts,
    };
  }

  // PUBLIC Community / Node Posts Feed (Used by /community)
  if (endpoint.startsWith('/community/posts')) {
    const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
    const category = urlParams.get('category');
    let filtered = db.posts;
    if (category && category !== 'All' && category !== 'Latest') {
      filtered = db.posts.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    return {
      success: true,
      posts: filtered,
    };
  }

  // ---------------------------------------------------------------------------
  // 3. ADMIN PRE-OPENING / ONBOARDING SLIDERS BANNERS CRUD
  // ---------------------------------------------------------------------------
  if (endpoint.startsWith('/admin/onboarding-banners') || endpoint === '/onboarding-banners') {
    const parts = endpoint.split('/');
    const bannerId = parts[3];

    // DELETE Slider Banner
    if (method === 'DELETE' && bannerId) {
      db.onboardingBanners = db.onboardingBanners.filter((b) => b.id !== bannerId);
      saveMockDb(db);
      return { success: true, message: 'Pre-opening banner deleted successfully' };
    }

    // UPDATE / EDIT Slider Banner
    if (method === 'PATCH' && bannerId) {
      const idx = db.onboardingBanners.findIndex((b) => b.id === bannerId);
      if (idx !== -1) {
        db.onboardingBanners[idx] = {
          ...db.onboardingBanners[idx],
          ...body,
        };
        saveMockDb(db);
        return {
          success: true,
          banner: db.onboardingBanners[idx],
          message: 'Pre-opening banner updated successfully',
        };
      }
      return { success: false, message: 'Banner not found' };
    }

    // CREATE New Slider Banner
    if (method === 'POST') {
      const newBanner: OnboardingBannerItem = {
        id: `ob_${Date.now()}`,
        stepNumber: body.stepNumber || db.onboardingBanners.length + 1,
        title: body.title || 'Welcome to GT Network',
        subtitle: body.subtitle || 'Autonomous Web3 Hash Power',
        description: body.description || '',
        imageUrl: body.imageUrl || '/onboarding/story_1.jpg',
        ctaText: body.ctaText || 'Get Started →',
        ctaLink: body.ctaLink || '/signup',
        badgeText: body.badgeText || 'GT PROTOCOL',
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        createdAt: new Date().toISOString(),
      };
      db.onboardingBanners.push(newBanner);
      saveMockDb(db);
      return {
        success: true,
        banner: newBanner,
        message: 'Pre-opening banner added successfully!',
      };
    }

    // GET Onboarding Banners
    return {
      success: true,
      banners: db.onboardingBanners,
    };
  }

  // ---------------------------------------------------------------------------
  // 4. ADMIN HOME PAGE BANNERS CRUD
  // ---------------------------------------------------------------------------
  if (endpoint.startsWith('/admin/home-banners') || endpoint === '/home-banners') {
    const parts = endpoint.split('/');
    const bannerId = parts[3];

    // DELETE Home Banner
    if (method === 'DELETE' && bannerId) {
      db.homeBanners = db.homeBanners.filter((b) => b.id !== bannerId);
      saveMockDb(db);
      return { success: true, message: 'Home page banner deleted successfully' };
    }

    // UPDATE / EDIT Home Banner
    if (method === 'PATCH' && bannerId) {
      const idx = db.homeBanners.findIndex((b) => b.id === bannerId);
      if (idx !== -1) {
        db.homeBanners[idx] = {
          ...db.homeBanners[idx],
          ...body,
        };
        saveMockDb(db);
        return {
          success: true,
          banner: db.homeBanners[idx],
          message: 'Home page banner updated successfully',
        };
      }
      return { success: false, message: 'Banner not found' };
    }

    // CREATE New Home Banner
    if (method === 'POST') {
      const newBanner: HomeBannerItem = {
        id: `hb_${Date.now()}`,
        tag: body.tag || 'GT ECOSYSTEM',
        title: body.title || 'New Innovation',
        description: body.description || '',
        ctaText: body.ctaText || 'Explore Now',
        targetRoute: body.targetRoute || '/mining',
        accentColor: body.accentColor || '#22C55E',
        gradientStart: body.gradientStart || '#0A2A18',
        gradientEnd: body.gradientEnd || '#05180E',
        imageUrl: body.imageUrl || '/banners/slide1.jpg',
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        order: body.order || db.homeBanners.length + 1,
        createdAt: new Date().toISOString(),
      };
      db.homeBanners.push(newBanner);
      saveMockDb(db);
      return {
        success: true,
        banner: newBanner,
        message: 'Home page banner added successfully!',
      };
    }

    // GET Home Banners
    return {
      success: true,
      banners: db.homeBanners,
    };
  }

  // ---------------------------------------------------------------------------
  // 5. ADMIN USERS DIRECTORY
  // ---------------------------------------------------------------------------
  if (endpoint.startsWith('/admin/users')) {
    return {
      success: true,
      users: db.users.map((u) => ({
        ...u,
        wallet: db.wallets[u.id] || { availableBalance: 0, lifetimeEarned: 0 },
      })),
      total: db.users.length,
    };
  }

  // ---------------------------------------------------------------------------
  // 6. CLIENT AUTH & SESSION
  // ---------------------------------------------------------------------------
  if (endpoint === '/auth/login' && method === 'POST') {
    const email = (body.email || '').toLowerCase().trim();
    let user = db.users.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      if (email === 'gtmining2026@gmail.com' || email.includes('admin')) {
        user = db.users[0]; // Admin
      } else {
        return {
          success: false,
          message: 'Account not found. Please sign up first.',
          notFound: true,
        };
      }
    }

    localStorage.setItem('gt_active_user_id', user.id);
    const token = `mock_jwt_${user.id}_${Date.now()}`;
    const wallet = db.wallets[user.id] || { availableBalance: 0.0, lifetimeEarned: 0.0 };

    return {
      success: true,
      message: 'Login successful',
      token,
      user,
      wallet,
    };
  }

  if (endpoint === '/auth/google' && method === 'POST') {
    const email = (body.email || '').toLowerCase().trim();
    let user = db.users.find((u) => u.email.toLowerCase() === email);

    // If user is trying to login but not registered:
    if (!user && !body.isSignup) {
      return {
        success: false,
        message: 'No account registered with this Google email. Please sign up first.',
        notFound: true,
      };
    }

    // If user is registering via Google:
    if (!user && body.isSignup) {
      user = {
        id: `usr_${Date.now()}`,
        fullName: body.name || email.split('@')[0].toUpperCase(),
        email,
        role: 'USER' as const,
        referralCode: `GT${Math.floor(10000 + Math.random() * 90000)}`,
        accountStatus: 'ACTIVE',
        lastMiningAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      db.wallets[user.id] = { availableBalance: 0.0, lifetimeEarned: 0.0 };
      saveMockDb(db);
    }

    if (user) {
      localStorage.setItem('gt_active_user_id', user.id);
      return {
        success: true,
        message: 'Google login successful',
        token: `mock_jwt_${user.id}_${Date.now()}`,
        user,
        wallet: db.wallets[user.id] || { availableBalance: 0.0, lifetimeEarned: 0.0 },
      };
    }
  }

  if (endpoint === '/auth/signup' && method === 'POST') {
    const email = (body.email || '').toLowerCase().trim();
    const newUser = {
      id: `usr_${Date.now()}`,
      fullName: body.fullName || 'New Pioneer',
      email,
      role: 'USER' as const,
      referralCode: `GT${Math.floor(10000 + Math.random() * 90000)}`,
      accountStatus: 'ACTIVE',
      lastMiningAt: new Date().toISOString(),
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

  if (endpoint === '/auth/session') {
    return {
      success: true,
      user: currentUser,
      wallet: currentWallet,
    };
  }

  // Mining Status
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

  // Mining Claim
  if (endpoint === '/mining/claim' && method === 'POST') {
    const reward = 1.0;
    const newBal = Number((currentWallet.availableBalance + reward).toFixed(4));
    const newLife = Number((currentWallet.lifetimeEarned + reward).toFixed(4));
    const nowIso = new Date().toISOString();
    const nextIso = new Date(Date.now() + 14400000).toISOString();

    currentUser.lastMiningAt = nowIso;
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

  if (endpoint === '/mining/history') {
    return {
      success: true,
      claims: db.claims,
    };
  }

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
        totalReferrals: (db.referrals || []).filter((r: any) => r.referrerUserId === currentUser.id).length,
        activeFriends: 0,
        inactiveFriends: 0,
        totalGtEarned: currentWallet.lifetimeEarned,
      },
      referralData: {
        referralCode: currentUser.referralCode,
        referralLink: `${window.location.origin}/signup?ref=${currentUser.referralCode}`,
        recentReferrals: (db.referrals || []).filter((r: any) => r.referrerUserId === currentUser.id).slice(0, 5),
      },
      latestNews: db.posts.slice(0, 3),
    };
  }

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

  if (endpoint === '/referrals/summary') {
    const userReferrals = (db.referrals || []).filter((r: any) => r.referrerUserId === currentUser.id);
    let activeFriends = 0;
    let inactiveFriends = 0;
    let totalRewards = 0;
    userReferrals.forEach((r: any) => {
      const friend = db.users.find((u: any) => u.id === r.referredUserId);
      if (friend && friend.accountStatus === 'ACTIVE') activeFriends++;
      else inactiveFriends++;
      if (r.rewardStatus === 'CREDITED') totalRewards += Number(r.rewardAmount || 0);
    });

    const summaryData = {
      referralCode: currentUser.referralCode || '',
      referralLink: `${window.location.origin}/signup?ref=${currentUser.referralCode || ''}`,
      totalReferrals: userReferrals.length,
      activeFriends,
      inactiveFriends,
      totalReferralRewardsEarned: totalRewards,
      activeThresholdDays: 7,
    };
    return {
      success: true,
      statistics: summaryData,
      stats: summaryData,
      ...summaryData,
    };
  }

  if (endpoint === '/referrals/history') {
    const userReferrals = (db.referrals || []).filter((r: any) => r.referrerUserId === currentUser.id);
    const history = userReferrals.map((ref: any) => {
      const friend = db.users.find((u: any) => u.id === ref.referredUserId);
      return {
        id: ref.id,
        friendName: friend ? friend.fullName : 'Account Deleted',
        friendEmail: friend ? friend.email.replace(/(.{2})(.*)(?=@)/, '$1***') : '***@***.com',
        registeredAt: ref.createdAt,
        isActive: friend?.accountStatus === 'ACTIVE',
        activityStatus: friend?.accountStatus || 'INACTIVE',
        rewardAmount: ref.rewardAmount,
        rewardStatus: ref.rewardStatus,
        rewardCreditedAt: ref.rewardCreditedAt
      };
    });
    return {
      success: true,
      referrals: history,
    };
  }

  // Private Network / Circle
  if (endpoint === '/private-network') {
    const userReferrals = (db.referrals || []).filter((r: any) => r.referrerUserId === currentUser.id);
    const now = Date.now();
    const cooldownMs = 14400 * 1000;

    const dynamicMembers = userReferrals.map((ref: any, idx: number) => {
      const friend = db.users.find((u: any) => u.id === ref.referredUserId);
      const lastClaimMs = friend && friend.lastMiningAt ? new Date(friend.lastMiningAt).getTime() : 0;
      const nextEligibleMs = lastClaimMs > 0 ? lastClaimMs + cooldownMs : 0;
      const isEligible = nextEligibleMs <= now;
      const name = friend ? friend.fullName : 'GT Miner';
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

      return {
        id: `mem_${idx + 1}`,
        name,
        maskedId: friend?.referralCode || `GT-${ref.id.slice(-4)}`,
        initials,
        avatarColor: 'from-[#10B981] to-[#059669]',
        isMiningActive: !isEligible && lastClaimMs > 0,
        lastMiningAt: friend?.lastMiningAt || null,
        nextEligibleAt: nextEligibleMs > 0 ? new Date(nextEligibleMs).toISOString() : null,
        totalMined: Number(ref.rewardAmount || 0),
        streakDays: lastClaimMs > 0 ? 1 : 0,
        activityStatus: (!isEligible && lastClaimMs > 0) ? 'MINING' : 'IDLE',
        lastPingedAt: null,
      };
    });

    if (!db.privateNetworks) db.privateNetworks = {};
    if (!db.privateNetworks[currentUser.id]) {
      db.privateNetworks[currentUser.id] = {
        members: dynamicMembers,
        messages: [],
      };
      saveMockDb(db);
    }

    const circle = db.privateNetworks[currentUser.id];
    const members = dynamicMembers;
    const messages = circle.messages || [];
    const activeMiningCount = members.filter((m: any) => m.isMiningActive).length;
    const idleCount = members.length - activeMiningCount;

    return {
      success: true,
      circleHost: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        referralCode: currentUser.referralCode,
        totalReferrals: members.length,
      },
      members,
      messages,
      stats: {
        totalMembers: members.length,
        activeMiningCount,
        idleCount,
      },
    };
  }

  if (endpoint === '/private-network/messages' && method === 'POST') {
    if (!db.privateNetworks) db.privateNetworks = {};
    if (!db.privateNetworks[currentUser.id]) {
      db.privateNetworks[currentUser.id] = { members: [], messages: [] };
    }
    const newMessage = {
      id: `msg_${Date.now()}`,
      circleId: currentUser.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName || 'Host',
      senderRole: 'HOST',
      senderAvatar: (currentUser.fullName || 'H').charAt(0).toUpperCase(),
      text: body.text || '',
      type: body.type || 'CHAT',
      createdAt: new Date().toISOString(),
    };
    db.privateNetworks[currentUser.id].messages = [
      ...(db.privateNetworks[currentUser.id].messages || []),
      newMessage,
    ];
    saveMockDb(db);
    return {
      success: true,
      message: newMessage,
    };
  }

  if (endpoint === '/private-network/ping-member' && method === 'POST') {
    if (!db.privateNetworks) db.privateNetworks = {};
    if (!db.privateNetworks[currentUser.id]) {
      db.privateNetworks[currentUser.id] = { members: [], messages: [] };
    }
    const memberName = body.memberName || 'Member';
    const pingMessage = {
      id: `msg_ping_${Date.now()}`,
      circleId: currentUser.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName || 'Host',
      senderRole: 'HOST',
      senderAvatar: (currentUser.fullName || 'H').charAt(0).toUpperCase(),
      text: `🔔 @${memberName} Mining Reminder: Your 4-hour GT cycle is ready to claim! Tap 'Mine Now' to collect 1 GT.`,
      type: 'REMINDER',
      createdAt: new Date().toISOString(),
    };
    db.privateNetworks[currentUser.id].messages = [
      ...(db.privateNetworks[currentUser.id].messages || []),
      pingMessage,
    ];
    saveMockDb(db);
    return {
      success: true,
      message: pingMessage,
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

  // Fallback
  return {
    success: true,
    message: 'Operation executed successfully (Cloud Node)',
  };
};
