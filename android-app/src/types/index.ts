export interface User {
  id: string;
  fullName: string;
  email: string;
  referralCode: string;
  balance: number;
  totalMined: number;
  miningRate: number;
  isMining: boolean;
  miningExpiresAt: number | null;
}

export interface MiningStats {
  hashRate: string;
  uptime: string;
  cycleRemainingSeconds: number;
  sessionEarned: number;
  todayMined: number;
  nodesOnline: number;
}

export interface ReferralFriend {
  id: string;
  name: string;
  initials: string;
  maskedId: string;
  date: string;
  earnedGT: string;
  isActive: boolean;
}

export type RootTabParamList = {
  Home: undefined;
  Node: undefined;
  Mine: undefined;
  Referrals: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Wallet: undefined;
  Tasks: undefined;
  Profile: undefined;
  Notifications: undefined;
  PrivateNetwork: undefined;
};

