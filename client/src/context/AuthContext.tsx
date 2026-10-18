import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken } from '../services/api';
import { User, Wallet } from '../types';

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  googleLogin: (data?: any) => Promise<void>;
  signup: (userData: { fullName: string; email: string; password: string; confirmPassword?: string; referralCode?: string }) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateWalletBalance: (newBalance: number, newLifetime?: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setWallet(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getSession();
      if (res.success && res.user) {
        setUser(res.user);
        setWallet(res.wallet || { availableBalance: 0, lifetimeEarned: 0 });
      } else {
        removeToken();
        setUser(null);
        setWallet(null);
      }
    } catch (err) {
      removeToken();
      setUser(null);
      setWallet(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      await refreshSession();
    }
  };

  const googleLogin = async (data?: any) => {
    const res = await api.googleLogin(data || {});
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      await refreshSession();
    }
  };

  const signup = async (userData: { fullName: string; email: string; password: string; confirmPassword?: string; referralCode?: string }) => {
    const res = await api.signup(userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      await refreshSession();
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setWallet(null);
    api.logout().catch(() => {});
  };

  const updateWalletBalance = (newBalance: number, newLifetime?: number) => {
    setWallet(prev => {
      if (!prev) return { availableBalance: newBalance, lifetimeEarned: newLifetime ?? newBalance };
      return {
        ...prev,
        availableBalance: newBalance,
        lifetimeEarned: newLifetime ?? prev.lifetimeEarned
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        login,
        googleLogin,
        signup,
        logout,
        refreshSession,
        updateWalletBalance
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
