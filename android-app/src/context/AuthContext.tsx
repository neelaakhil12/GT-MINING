import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, MiningStats } from '../types';

interface AuthContextType {
  user: User | null;
  miningStats: MiningStats;
  isMiningActive: boolean;
  startMiningSession: () => void;
  claimCommission: (amount: number) => boolean;
  refreshUserData: () => Promise<void>;
}

const defaultUser: User = {
  id: 'usr_gt_1001',
  fullName: 'Akhil Kumar',
  email: 'user@gtnetwork.org',
  referralCode: 'GT-VIP-889',
  balance: 5200.0,
  totalMined: 1420.5,
  miningRate: 2.5,
  isMining: true,
  miningExpiresAt: Date.now() + 3 * 3600 * 1000 + 42 * 60 * 1000,
};

const defaultMiningStats: MiningStats = {
  hashRate: '2.50 GH/s',
  uptime: '99.94%',
  cycleRemainingSeconds: 13320, // ~3h 42m
  sessionEarned: 18.4,
  todayMined: 42.8,
  nodesOnline: 18452,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultUser);
  const [miningStats, setMiningStats] = useState<MiningStats>(defaultMiningStats);
  const [isMiningActive, setIsMiningActive] = useState<boolean>(true);

  // Mining countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setMiningStats((prev) => {
        if (prev.cycleRemainingSeconds <= 0) {
          setIsMiningActive(false);
          return { ...prev, cycleRemainingSeconds: 0 };
        }
        return {
          ...prev,
          cycleRemainingSeconds: prev.cycleRemainingSeconds - 1,
          sessionEarned: +(prev.sessionEarned + 0.002).toFixed(3),
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startMiningSession = () => {
    setIsMiningActive(true);
    setMiningStats((prev) => ({
      ...prev,
      cycleRemainingSeconds: 4 * 3600, // 4 hours cycle
      sessionEarned: 0,
    }));
    setUser((prev) => (prev ? { ...prev, isMining: true } : null));
  };

  const claimCommission = (amount: number) => {
    if (amount <= 0) return false;
    setUser((prev) =>
      prev ? { ...prev, balance: +(prev.balance + amount).toFixed(2) } : null
    );
    return true;
  };

  const refreshUserData = async () => {
    // Synchronize with backend API when online
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        miningStats,
        isMiningActive,
        startMiningSession,
        claimCommission,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

