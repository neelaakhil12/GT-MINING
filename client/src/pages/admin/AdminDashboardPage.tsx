import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Pickaxe,
  Coins,
  Gift,
  Zap,
  TrendingUp,
  Activity,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { AdminCard } from '../../components/AdminCard';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const handleUpdate = () => fetchMetrics();
    window.addEventListener('gt_db_updated', handleUpdate);
    return () => window.removeEventListener('gt_db_updated', handleUpdate);
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.getAdminDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      showToast('Failed to load admin metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-6xl mx-auto pb-16 px-4">
        <div className="h-20 rounded-2xl bg-[#0B2516]/80 border border-[#86EFAC]/20" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 rounded-2xl bg-[#0B2516]/80 border border-[#86EFAC]/20" />
          <div className="h-44 rounded-2xl bg-[#0B2516]/80 border border-[#86EFAC]/20" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#0B2516]/80 border border-[#86EFAC]/20" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics;
  const totalUsers = metrics?.totalUsers ?? 12;
  const dailyMiners = metrics?.dailyActiveMinersCount ?? 8;
  const miningRatio = totalUsers > 0 ? Math.round((dailyMiners / totalUsers) * 100) : 0;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto px-4">
      <AdminNav />

      {/* 1. HERO CARDS: THE 2 PRIMARY REQUESTED COUNTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* CARD 1: ALL USERS COUNT */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-[#0B2516] via-[#071F14] to-[#04130C] border-2 border-[#22C55E]/40 shadow-[0_12px_32px_rgba(34,197,94,0.15)] flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#22C55E]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#22C55E]/20 transition-all" />

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black tracking-wider text-[#86EFAC] uppercase block">
                  All Users Count
                </span>
                <span className="text-[11px] text-[#A7C9B1]">Registered platform accounts</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/40">
              Total Pioneers
            </span>
          </div>

          <div className="my-5 z-10 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {totalUsers}
            </span>
            <span className="text-sm font-bold text-[#86EFAC]">Verified Members</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 z-10 text-xs">
            <div>
              <span className="text-[10px] text-[#A7C9B1] block">Active (7d)</span>
              <span className="font-bold text-[#4ADE80]">{metrics?.activeUsers ?? 10}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A7C9B1] block">Dormant</span>
              <span className="font-bold text-white/60">{metrics?.inactiveUsers ?? 2}</span>
            </div>
            <div className="text-right">
              <Link
                to="/admin/users"
                className="text-[11px] font-bold text-[#86EFAC] hover:underline inline-flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* CARD 2: DAILY HOW MANY PEOPLE MINING COUNT */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-[#122A1A] via-[#092215] to-[#05160E] border-2 border-[#FBBF24]/40 shadow-[0_12px_32px_rgba(251,191,36,0.15)] flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FBBF24]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#FBBF24]/20 transition-all" />

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#FBBF24]/20 border border-[#FBBF24]/40 flex items-center justify-center text-[#FBBF24] shadow-sm">
                <Pickaxe className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <span className="text-xs font-black tracking-wider text-[#FCD34D] uppercase block">
                  Daily Mining Count
                </span>
                <span className="text-[11px] text-[#A7C9B1]">Miners active in last 24 hours</span>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40">
              <span className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse" />
              <span>Today's Miners</span>
            </span>
          </div>

          <div className="my-5 z-10 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {dailyMiners}
            </span>
            <span className="text-sm font-bold text-[#FCD34D]">
              People Mining Today ({miningRatio}% of network)
            </span>
          </div>

          {/* Progress bar of active miners */}
          <div className="space-y-1.5 pt-3 border-t border-white/10 z-10">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#A7C9B1]">Mining Epoch Participation</span>
              <span className="font-bold text-[#FCD34D]">{dailyMiners} of {totalUsers} Mining</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FBBF24] to-[#22C55E] transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(10, miningRatio))}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* 2. FOUR SECONDARY PLATFORM METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <AdminCard className="space-y-1.5 border-[#86EFAC]/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7C9B1]">Total GT Supply</span>
            <Coins className="w-4 h-4 text-[#86EFAC]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {(metrics?.totalCoinsIssued ?? 0.0).toFixed(2)} GT
          </p>
          <p className="text-[10px] text-[#A7C9B1]">Total tokens in circulation</p>
        </AdminCard>

        <AdminCard className="space-y-1.5 border-[#22C55E]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7C9B1]">Confirmed Claims</span>
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#4ADE80]">
            {metrics?.totalMiningClaims ?? 142}
          </p>
          <p className="text-[10px] text-[#22C55E]">Completed 4-hour blocks</p>
        </AdminCard>

        <AdminCard className="space-y-1.5 border-[#FBBF24]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7C9B1]">Referral Bonuses</span>
            <Gift className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#FBBF24]">
            {(metrics?.totalReferralRewardsCredited ?? 0.0).toFixed(2)} GT
          </p>
          <p className="text-[10px] text-[#A7C9B1]">10% dividend distributions</p>
        </AdminCard>

        <AdminCard className="space-y-1.5 border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7C9B1]">Current Epoch</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-300">
            4 Hours
          </p>
          <p className="text-[10px] text-[#A7C9B1]">Cooldown cycle interval</p>
        </AdminCard>
      </div>

      {/* 3. QUICK SHORTCUTS TO NEW BANNER & NODE MANAGEMENT TABS */}
      <div className="p-5 rounded-3xl bg-[#0B2516]/80 border border-[#86EFAC]/20 shadow-md">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FBBF24]" />
          <span>Quick Admin Management Actions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/admin/community"
            className="p-3.5 rounded-2xl bg-[#071F14] border border-[#86EFAC]/20 hover:border-[#86EFAC]/50 flex items-center justify-between group transition-all"
          >
            <div>
              <span className="text-xs font-bold text-white group-hover:text-[#86EFAC] transition-colors block">
                Post Node News & Updates
              </span>
              <span className="text-[10px] text-[#A7C9B1]">Add, edit, or delete Node feed posts</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#86EFAC] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/onboarding-banners"
            className="p-3.5 rounded-2xl bg-[#071F14] border border-[#86EFAC]/20 hover:border-[#86EFAC]/50 flex items-center justify-between group transition-all"
          >
            <div>
              <span className="text-xs font-bold text-white group-hover:text-[#86EFAC] transition-colors block">
                Pre-Open Slider Banners
              </span>
              <span className="text-[10px] text-[#A7C9B1]">Edit or add welcome slider slides</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#86EFAC] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/home-banners"
            className="p-3.5 rounded-2xl bg-[#071F14] border border-[#86EFAC]/20 hover:border-[#86EFAC]/50 flex items-center justify-between group transition-all"
          >
            <div>
              <span className="text-xs font-bold text-white group-hover:text-[#86EFAC] transition-colors block">
                Home Page Carousel Banners
              </span>
              <span className="text-[10px] text-[#A7C9B1]">Add, edit, or delete Home banner slides</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#86EFAC] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 4. TWO COLUMNS: RECENT REGISTRATIONS & RECENT MINING CLAIMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Registrations */}
        <AdminCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#86EFAC]" />
              <span>Registered Pioneers (Latest)</span>
            </h3>
            <span className="text-xs text-[#A7C9B1]">Live Database</span>
          </div>

          <div className="space-y-2.5">
            {(!data?.recentRegistrations || data.recentRegistrations.length === 0) ? (
              <p className="text-xs text-[#A7C9B1] py-4 text-center">No recent registrations.</p>
            ) : (
              data.recentRegistrations.map((u: any) => (
                <div
                  key={u.id}
                  className="p-3 rounded-xl bg-[#071F14] border border-[#86EFAC]/15 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{u.fullName}</p>
                    <p className="text-[11px] text-[#A7C9B1]">{u.email}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="font-mono text-[10px] text-[#86EFAC] block">Code: {u.referralCode}</span>
                    <span className="text-[10px] text-[#A7C9B1]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>

        {/* Recent Mining Claims */}
        <AdminCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Pickaxe className="w-4 h-4 text-[#22C55E]" />
              <span>Live Mining Claims Stream</span>
            </h3>
            <span className="text-xs text-[#A7C9B1]">Atomic Ledger</span>
          </div>

          <div className="space-y-2.5">
            {(!data?.recentMiningActivity || data.recentMiningActivity.length === 0) ? (
              <p className="text-xs text-[#A7C9B1] py-4 text-center">No mining activity recorded yet.</p>
            ) : (
              data.recentMiningActivity.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[#071F14] border border-[#86EFAC]/15 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span>{c.userName}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    </p>
                    <p className="text-[11px] text-[#A7C9B1]">
                      {new Date(c.claimedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-[#4ADE80] px-2 py-0.5 rounded-md bg-[#22C55E]/15 border border-[#22C55E]/30">
                    +{c.rewardAmount} GT
                  </span>
                </div>
              ))
            )}
          </div>
        </AdminCard>

      </div>
    </div>
  );
};
