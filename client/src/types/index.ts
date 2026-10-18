export interface User {
  id: string;
  fullName: string;
  email: string;
  referralCode: string;
  role: 'USER' | 'ADMIN';
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  avatarUrl?: string;
  emailVerifiedAt?: string | null;
  lastMiningAt?: string | null;
  createdAt: string;
  updatedAt: string;
  wallet?: Wallet;
}

export interface Wallet {
  availableBalance: number;
  lifetimeEarned: number;
  miningRewardsTotal?: number;
  referralRewardsTotal?: number;
  adminAdjustmentsTotal?: number;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'MINING_REWARD' | 'REFERRAL_REWARD' | 'ADMIN_ADJUSTMENT' | 'REVERSAL';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  idempotencyKey: string;
  referenceId?: string | null;
  description: string;
  createdAt: string;
  createdBy?: string;
  userName?: string;
  userEmail?: string;
}

export interface MiningClaim {
  id: string;
  userId: string;
  rewardAmount: number;
  claimedAt: string;
  nextEligibleAt: string;
  transactionId: string;
  status: 'SUCCESS' | 'FAILED';
  userName?: string;
}

export interface MiningStatus {
  isEligible: boolean;
  remainingSeconds: number;
  nextEligibleAt: string | null;
  lastMiningAt: string | null;
  cooldownSeconds: number;
  rewardPerClaim: number;
  availableBalance: number;
  lifetimeEarned: number;
  serverTime: string;
}

export interface ReferralItem {
  id: string;
  friendName: string;
  friendEmail: string;
  registeredAt: string;
  isActive: boolean;
  activityStatus: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  rewardAmount: number;
  rewardStatus: 'PENDING' | 'CREDITED' | 'REJECTED';
  rewardCreditedAt: string | null;
}

export interface ReferralSummary {
  referralCode: string;
  referralLink: string;
  statistics: {
    totalReferrals: number;
    activeFriends: number;
    inactiveFriends: number;
    totalReferralRewardsEarned: number;
    activeThresholdDays: number;
  };
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  category: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isPinned: boolean;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'MINING' | 'REFERRAL' | 'SYSTEM' | 'SECURITY';
  readAt: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  user: {
    id: string;
    fullName: string;
    email: string;
    referralCode: string;
    role: 'USER' | 'ADMIN';
  };
  wallet: {
    availableBalance: number;
    lifetimeEarned: number;
  };
  statistics: {
    totalReferrals: number;
    activeFriends: number;
    inactiveFriends: number;
    totalGtEarned: number;
  };
  referralData: {
    referralCode: string;
    referralLink: string;
    recentReferrals: ReferralItem[];
  };
  mining: {
    isEligible: boolean;
    remainingSeconds: number;
    nextEligibleAt: string | null;
    lastMiningAt: string | null;
    cooldownSeconds: number;
    rewardPerClaim: number;
  };
  recentTransactions: WalletTransaction[];
  latestNews: CommunityPost[];
  unreadNotificationsCount: number;
}
