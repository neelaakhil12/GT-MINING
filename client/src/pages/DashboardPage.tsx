import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  TrendingUp,
  Pickaxe,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Globe,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { GlassCard } from '../components/GlassCard';
import { HomeBanners } from '../components/HomeBanners';

export const DashboardPage: React.FC = () => {
  const { wallet } = useAuth();
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

  return (
    <div className="space-y-8 pb-28 sm:pb-16">
      
      {/* 1. Dynamic Image Slides Carousel, Market Rates, and Action Cards matching video */}
      <HomeBanners />
      
      {/* 2. Four Platform Statistics Cards (Cleaned: Non-referral data as requested) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Wallet Balance */}
        <GlassCard interactive className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E5E36]">Wallet Balance</span>
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A]">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#15803D]">
            {(data?.wallet?.availableBalance ?? wallet?.availableBalance ?? 0).toFixed(2)} GT
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#15803D]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Verified ledger balance</span>
          </div>
        </GlassCard>

        {/* Lifetime Mined */}
        <GlassCard interactive className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E5E36]">Lifetime Mined</span>
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#0A341B]">
            {(data?.statistics?.totalGtEarned ?? wallet?.lifetimeEarned ?? 0).toFixed(2)} GT
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#15803D]">
            <span className="text-xs">▲</span>
            <span>Cumulative Epoch Yield</span>
          </div>
        </GlassCard>

        {/* Mining Epoch Rate */}
        <GlassCard interactive className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E5E36]">Mining Epoch Rate</span>
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A]">
              <Pickaxe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#15803D]">
            +1.00 GT
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1E5E36]">
            <span>Per 4-hour cycle interval</span>
          </div>
        </GlassCard>

        {/* Network Node Status */}
        <GlassCard interactive className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E5E36]">Network Status</span>
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A]">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#0A341B]">
            Node Online
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#15803D]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
            <span>Epoch Synchronized</span>
          </div>
        </GlassCard>
      </div>

      {/* 3. Mining Status Card */}
      <GlassCard className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#0A341B] flex items-center gap-2">
              <Pickaxe className="w-5 h-5 text-[#16A34A]" />
              <span>4-Hour Mining Engine</span>
            </h3>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              isEligible
                ? 'bg-[#22C55E]/15 text-[#15803D] border border-[#22C55E]/30'
                : 'bg-[#FBBF24]/20 text-[#B45309] border border-[#FBBF24]/40'
            }`}>
              {isEligible ? 'Claim Ready' : 'Cooldown Active'}
            </span>
          </div>

          <p className="text-xs text-[#1E5E36]">
            Claim reward: <strong className="text-[#15803D] font-bold">+1.0 GT</strong> per 4-hour cycle. Verified by atomic ledger timestamps.
          </p>
        </div>

        <div className="py-6 flex flex-col items-center justify-center space-y-3 bg-white/70 rounded-2xl border border-white/90 shadow-sm">
          <Clock className="w-8 h-8 text-[#16A34A] animate-pulse" />
          <div className="text-3xl sm:text-4xl font-mono font-black text-[#0A341B] tracking-widest">
            {countdownStr}
          </div>
          <p className="text-[11px] font-bold text-[#1E5E36] uppercase tracking-wider">
            {isEligible ? 'Tap below to claim reward' : 'Time until next mining claim'}
          </p>
        </div>

        <Link
          to="/mining"
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_6px_20px_rgba(34,197,94,0.35)] transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Pickaxe className="w-4 h-4" />
          <span>Open Full Mining Station</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </GlassCard>

      {/* 4. Latest Community Announcements */}
      {data?.latestNews && data.latestNews.length > 0 && (
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h3 className="text-lg font-bold text-[#0A341B] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#16A34A]" />
              <span>Latest Community Announcements</span>
            </h3>
            <Link to="/community" className="text-xs text-[#15803D] hover:underline flex items-center gap-1 font-bold">
              <span>All News</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.latestNews.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-white/70 border border-white/90 space-y-2 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-black text-[#15803D] uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="text-[#1E5E36]">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0A341B] line-clamp-1">{post.title}</h4>
                  <p className="text-xs text-[#1E5E36] line-clamp-2">{post.content}</p>
                </div>
                <Link
                  to="/community"
                  className="text-[11px] font-bold text-[#15803D] hover:underline flex items-center gap-1 pt-2"
                >
                  <span>Read update</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
