import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  TrendingUp,
  Pickaxe,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Globe,
  Zap,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { GlassCard } from '../components/GlassCard';
import { HomeBanners } from '../components/HomeBanners';

export const DashboardPage: React.FC = () => {
  const { user, wallet } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdownStr, setCountdownStr] = useState<string>('00:00:00');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboardSummary();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data?.mining?.nextEligibleAt) {
      setCountdownStr('Ready to Mine');
      return;
    }

    const interval = setInterval(() => {
      const nextMs = new Date(data.mining.nextEligibleAt!).getTime();
      const nowMs = Date.now();
      const diffMs = nextMs - nowMs;

      if (diffMs <= 0) {
        setCountdownStr('Ready to Mine');
        clearInterval(interval);
      } else {
        const totalSec = Math.floor(diffMs / 1000);
        const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        setCountdownStr(`${h}:${m}:${s}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.mining?.nextEligibleAt]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-white/40 border border-white/60" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-white/40 border border-white/60" />
          ))}
        </div>
      </div>
    );
  }

  const isEligible = data?.mining?.isEligible ?? true;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6">
      
      {/* 0. Dashboard Greeting Header matching client reference */}
      <div className="space-y-1">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#15803D]">
          GT NETWORK
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A341B] tracking-tight">
          {getGreeting()}!
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#1E5E36]">
          {user?.fullName || 'User'}
        </p>
      </div>

      {/* 1. Dynamic Image Slides Carousel, Market Rates, and Action Cards matching video */}
      <HomeBanners />
      
      {/* 2. Four Platform Statistics Cards with Streaming Green Border Beam - All 4 Equal Size */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 auto-rows-fr items-stretch">
        
        {/* Wallet Balance */}
        <div className="border-beam-card group cursor-pointer h-full">
          <div className="border-beam-inner p-4 sm:p-5 flex flex-col justify-between h-full space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-[#1E5E36] truncate">Wallet Balance</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A] shrink-0 group-hover:scale-110 transition-transform">
                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#15803D] tracking-tight truncate">
              {(data?.wallet?.availableBalance ?? wallet?.availableBalance ?? 0).toFixed(2)} GT
            </p>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#15803D] truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <span className="truncate">Verified ledger</span>
            </div>
          </div>
        </div>

        {/* Lifetime Mined */}
        <div className="border-beam-card border-beam-card-delay-1 group cursor-pointer h-full">
          <div className="border-beam-inner p-4 sm:p-5 flex flex-col justify-between h-full space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-[#1E5E36] truncate">Lifetime Mined</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A] shrink-0 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#0A341B] tracking-tight truncate">
              {(data?.statistics?.totalGtEarned ?? wallet?.lifetimeEarned ?? 0).toFixed(2)} GT
            </p>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#15803D] truncate">
              <span className="text-xs shrink-0">▲</span>
              <span className="truncate">Cumulative Yield</span>
            </div>
          </div>
        </div>

        {/* Mining Epoch Rate */}
        <div className="border-beam-card border-beam-card-delay-2 group cursor-pointer h-full">
          <div className="border-beam-inner p-4 sm:p-5 flex flex-col justify-between h-full space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-[#1E5E36] truncate">Mining Rate</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A] shrink-0 group-hover:scale-110 transition-transform">
                <Pickaxe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#15803D] tracking-tight truncate">
              +1.00 GT
            </p>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-[#1E5E36] truncate">
              <span className="truncate">Per 4-hour cycle</span>
            </div>
          </div>
        </div>

        {/* Private Network Button / Circle Chat */}
        <Link
          to="/private-network"
          id="private-network-button"
          className="border-beam-card border-beam-card-delay-3 group cursor-pointer h-full block text-left"
          title="Open Private Network"
        >
          <div className="border-beam-inner p-4 sm:p-5 flex flex-col justify-between h-full space-y-1.5 sm:space-y-2 group-hover:bg-[#EAF8EE]/60 transition-colors">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-[#1E5E36] truncate">Private Network</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A] shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#0A341B] tracking-tight truncate">
              Circle Chat
            </p>
            <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] font-bold text-[#15803D] truncate">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
                <span className="truncate">Open Chat & Mining</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#16A34A] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          </div>
        </Link>
      </div>

      {/* 3. GT Tasks Action Card matching Screenshot 5 */}
      <div className="p-6 rounded-3xl bg-white/85 border border-white shadow-sm flex items-center justify-between gap-4 relative overflow-hidden group">
        <div className="space-y-2 relative z-10 max-w-[260px]">
          <h3 className="text-xl sm:text-2xl font-black text-[#0A341B]">
            GT Tasks
          </h3>
          <p className="text-xs text-[#1E5E36] font-medium">
            Complete tasks & earn GT
          </p>
          <div className="pt-2">
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-black text-xs shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_28px_rgba(34,197,94,0.5)] transition-all transform active:scale-95"
            >
              <span>GT Tasks</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#22C55E]/20 to-[#86EFAC]/30 flex items-center justify-center p-2 shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
            <span className="font-black text-2xl text-[#15803D] italic">GT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
