import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, MiningStats } from '../types';
import { appStorage } from '../utils/storage';
import { API_BASE_URL } from '../config/api';

const STORAGE_SESSION_KEY = 'gt_mobile_user_session';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isSessionLoaded: boolean;
  miningStats: MiningStats;
  isMiningActive: boolean;
  login: (credentials: { email: string; password?: string }) => Promise<void>;
  signup: (data: { fullName: string; email: string; password?: string; referralCode?: string }) => Promise<void>;
  googleLogin: (params?: { email?: string; name?: string; isSignup?: boolean }) => Promise<void>;
  logout: () => void;
  startMiningSession: () => void;
  claimCommission: (amount: number) => boolean;
  refreshUserData: () => Promise<void>;
  updateUserAvatar: (newAvatar: string) => Promise<boolean>;
}

const defaultUser: User = {
  id: 'usr_gt_1001',
  fullName: 'GT Pioneer',
  email: 'user@gtnetwork.org',
  referralCode: 'GT-VIP-889',
  balance: 0.0,
  totalMined: 0.0,
  miningRate: 1.0,
  isMining: false,
  miningExpiresAt: 0,
};

const defaultMiningStats: MiningStats = {
  hashRate: '1.00 GH/s',
  uptime: '99.94%',
  cycleRemainingSeconds: 0,
  sessionEarned: 0.0,
  todayMined: 0.0,
  nodesOnline: 18452,
};

// Real database API caller
const callAuthApi = async (path: string, body: any) => {
  const endpoints = [
    `${API_BASE_URL}${path}`,
    `http://localhost:5050/api${path}`,
  ];

  let lastError: any = null;
  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Unable to connect to database server.');
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSessionLoaded, setIsSessionLoaded] = useState<boolean>(false);
  const [miningStats, setMiningStats] = useState<MiningStats>(defaultMiningStats);
  const [isMiningActive, setIsMiningActive] = useState<boolean>(true);

  // Restore authenticated session from persistent storage on app startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await appStorage.getItem(STORAGE_SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            setUser(parsed);
            setIsAuthenticated(true);
            setTimeout(() => {
              refreshUserData();
            }, 100);
          }
        }
      } catch (err) {
        console.warn('Failed to restore mobile session:', err);
      } finally {
        setIsSessionLoaded(true);
      }
    };
    restoreSession();
  }, []);

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

  // Real database verification on login
  const login = async ({ email, password }: { email: string; password?: string }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const result = await callAuthApi('/auth/login', { email: cleanEmail, password });

    if (!result || !result.success) {
      if (result && result.notFound) {
        throw new Error('Account not found. Please sign up first.');
      }
      throw new Error(result?.message || 'Invalid email or password. Please verify credentials.');
    }

    // Success: user verified from database!
    const backendUser = result.user;
    const loggedUser: User = {
      id: backendUser.id || 'usr_gt_1001',
      fullName: backendUser.fullName || 'GT Miner',
      email: backendUser.email || cleanEmail,
      referralCode: backendUser.referralCode || 'GT-VIP-889',
      balance: Number(result.wallet?.availableBalance ?? 0.0),
      totalMined: Number(result.wallet?.lifetimeEarned ?? 0.0),
      miningRate: 1.0,
      isMining: !!backendUser.isMining,
      miningExpiresAt: backendUser.miningExpiresAt || 0,
    };

    setUser(loggedUser);
    setIsAuthenticated(true);
    await appStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(loggedUser));
    if (result.token) {
      await appStorage.setItem('gt_mobile_token', result.token);
    }
  };

  // Real database account registration
  const signup = async (data: { fullName: string; email: string; password?: string; referralCode?: string }) => {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const result = await callAuthApi('/auth/signup', {
      fullName: data.fullName?.trim() || 'GT Pioneer',
      email: cleanEmail,
      password: data.password,
      referralCode: data.referralCode?.trim() || undefined,
    });

    if (!result || !result.success) {
      throw new Error(result?.message || 'Registration failed. Please try again.');
    }

    const backendUser = result.user;
    const newUser: User = {
      id: backendUser.id || `usr_${Date.now()}`,
      fullName: backendUser.fullName || data.fullName,
      email: backendUser.email || cleanEmail,
      referralCode: backendUser.referralCode || `GT-${Math.floor(1000 + Math.random() * 9000)}`,
      balance: Number(result.wallet?.availableBalance ?? 0.0),
      totalMined: Number(result.wallet?.lifetimeEarned ?? 0.0),
      miningRate: 1.0,
      isMining: false,
      miningExpiresAt: 0,
    };

    setUser(newUser);
    setIsAuthenticated(true);
    await appStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newUser));
    if (result.token) {
      await appStorage.setItem('gt_mobile_token', result.token);
    }
  };

  // Google sign in / registration with database check
  const googleLogin = async (params?: { email?: string; name?: string; isSignup?: boolean }) => {
    const email = (params?.email || 'google.miner@gmail.com').trim().toLowerCase();
    const isSignup = params?.isSignup ?? false;

    const result = await callAuthApi('/auth/google', {
      email,
      name: params?.name || 'Google Pioneer',
      isSignup,
    });

    if (!result || !result.success) {
      if (result && (result.notFound || result.notRegistered)) {
        throw new Error('Account not found with this Google email. Please sign up first.');
      }
      throw new Error(result?.message || 'Google authentication failed.');
    }

    const backendUser = result.user;
    const googleUser: User = {
      id: backendUser.id || 'usr_gt_google',
      fullName: backendUser.fullName || 'Google Pioneer',
      email: backendUser.email || email,
      referralCode: backendUser.referralCode || 'GT-VIP-GOOGLE',
      balance: Number(result.wallet?.availableBalance ?? 0.0),
      totalMined: Number(result.wallet?.lifetimeEarned ?? 0.0),
      miningRate: 1.0,
      isMining: false,
      miningExpiresAt: 0,
    };

    setUser(googleUser);
    setIsAuthenticated(true);
    await appStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(googleUser));
    if (result.token) {
      await appStorage.setItem('gt_mobile_token', result.token);
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    await appStorage.removeItem(STORAGE_SESSION_KEY);
    await appStorage.removeItem('gt_mobile_token');
  };

  const startMiningSession = () => {
    setIsMiningActive(true);
    setMiningStats((prev) => ({
      ...prev,
      cycleRemainingSeconds: 4 * 3600, // 4 hours cycle
      sessionEarned: 0,
    }));
    setUser((prev) => {
      const updated = prev ? { ...prev, isMining: true } : null;
      if (updated) {
        appStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated)).catch(() => {});
      }
      return updated;
    });
  };

  const claimCommission = (amount: number) => {
    if (amount <= 0) return false;
    setUser((prev) => {
      const updated = prev ? { ...prev, balance: +(prev.balance + amount).toFixed(2) } : null;
      if (updated) {
        appStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated)).catch(() => {});
      }
      return updated;
    });
    return true;
  };

  const refreshUserData = async () => {
    try {
      const token = await appStorage.getItem('gt_mobile_token');
      const endpoints = [
        `${API_BASE_URL}/auth/session`,
        'http://localhost:5050/api/auth/session',
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          const data = await res.json();
          if (data && data.success && data.user) {
            setUser((prev) => {
              if (!prev) return null;
              const updated = {
                ...prev,
                ...data.user,
                balance: Number(data.wallet?.availableBalance ?? prev.balance ?? 0.0),
                totalMined: Number(data.wallet?.lifetimeEarned ?? prev.totalMined ?? 0.0),
              };
              appStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated)).catch(() => {});
              return updated;
            });
            break;
          }
        } catch {}
      }
    } catch (e) {
      console.warn('Failed to refresh user data:', e);
    }
  };

  const updateUserAvatar = async (newAvatar: string): Promise<boolean> => {
    try {
      setUser((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          avatar: newAvatar,
          profileImage: newAvatar,
          avatarUrl: newAvatar,
        };
        appStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });

      const token = await appStorage.getItem('gt_mobile_token');
      await fetch(`${API_BASE_URL}/profile/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ avatar: newAvatar, avatarUrl: newAvatar }),
      });
      return true;
    } catch (e) {
      console.warn('Failed to update avatar:', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isSessionLoaded,
        miningStats,
        isMiningActive,
        login,
        signup,
        googleLogin,
        logout,
        startMiningSession,
        claimCommission,
        refreshUserData,
        updateUserAvatar,
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
