import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Pickaxe,
  Coins,
  Gift,
  History,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { GlassCard } from '../../components/GlassCard';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
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
      <div className="space-y-6 animate-pulse max-w-6xl mx-auto pb-16">
        <div className="h-20 rounded-2xl bg-white/5 border border-white/10" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 border border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <AdminNav />

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <GlassCard className="space-y-2 border-[#86EFAC]/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7C9B1]">Total Registered</span>
            <Users className="w-5 h-5 text-[#86EFAC]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{metrics?.totalUsers ?? 0}</p>
          <p className="text-[11px] text-[#A7C9B1]">Active database accounts</p>
        </GlassCard>

        <GlassCard className="space-y-2 border-[#22C55E]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7C9B1]">Active Users</span>
            <UserCheck className="w-5 h-5 text-[#4ADE80]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#4ADE80]">{metrics?.activeUsers ?? 0}</p>
          <p className="text-[11px] text-[#22C55E]">Mined within 7 days</p>
        </GlassCard>

        <GlassCard className="space-y-2 border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7C9B1]">Inactive Users</span>
            <UserX className="w-5 h-5 text-[#A7C9B1]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white/70">{metrics?.inactiveUsers ?? 0}</p>
          <p className="text-[11px] text-[#A7C9B1]">Over 7 days dormant</p>
        </GlassCard>

        <GlassCard className="space-y-2 border-[#86EFAC]/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7C9B1]">Total Claims</span>
            <Pickaxe className="w-5 h-5 text-[#22C55E]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{metrics?.totalMiningClaims ?? 0}</p>
          <p className="text-[11px] text-[#A7C9B1]">Confirmed 4h cycles</p>
        </GlassCard>

        <GlassCard className="space-y-2 border-[#86EFAC]/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7C9B1]">Total GT Issued</span>
            <Coins className="w-5 h-5 text-[#86EFAC]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#86EFAC]">
            {(metrics?.totalCoinsIssued ?? 0).toFixed(2)} GT
          </p>
          <p className="text-[11px] text-[#A7C9B1]">Ledger circulating supply</p>
        </GlassCard>

        <GlassCard className="space-y-2 border-[#FBBF24]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7C9B1]">Referral Bonuses</span>
            <Gift className="w-5 h-5 text-[#FBBF24]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#FBBF24]">
            {(metrics?.totalReferralRewardsCredited ?? 0).toFixed(2)} GT
          </p>
          <p className="text-[11px] text-[#A7C9B1]">Network expansion rewards</p>
        </GlassCard>
      </div>

      {/* Two Columns: Recent Registrations & Recent Mining Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Registrations */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#86EFAC]" />
              <span>Recent Registrations</span>
            </h3>
            <span className="text-xs text-[#A7C9B1]">Live Users</span>
          </div>

          <div className="space-y-2.5">
            {(!data?.recentRegistrations || data.recentRegistrations.length === 0) ? (
              <p className="text-xs text-[#A7C9B1] py-4 text-center">No recent registrations.</p>
            ) : (
              data.recentRegistrations.map((u: any) => (
                <div
                  key={u.id}
                  className="p-3 rounded-xl bg-[#071F14]/70 border border-[#86EFAC]/15 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{u.fullName}</p>
                    <p className="text-[11px] text-[#A7C9B1]">{u.email}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="font-mono text-[10px] text-[#86EFAC] block">Code: {u.referralCode}</span>
                    <span className="text-[10px] text-[#A7C9B1]">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Recent Mining Activity */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Pickaxe className="w-4 h-4 text-[#22C55E]" />
              <span>Recent Mining Claims</span>
            </h3>
            <span className="text-xs text-[#A7C9B1]">Authoritative Claims</span>
          </div>

          <div className="space-y-2.5">
            {(!data?.recentMiningActivity || data.recentMiningActivity.length === 0) ? (
              <p className="text-xs text-[#A7C9B1] py-4 text-center">No mining activity recorded yet.</p>
            ) : (
              data.recentMiningActivity.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[#071F14]/70 border border-[#86EFAC]/15 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{c.userName}</p>
                    <p className="text-[11px] text-[#A7C9B1]">{new Date(c.claimedAt).toLocaleString()}</p>
                  </div>
                  <span className="font-mono font-bold text-[#4ADE80]">
                    +{c.rewardAmount} GT
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
