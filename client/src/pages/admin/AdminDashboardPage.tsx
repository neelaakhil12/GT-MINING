import React, { useState, useEffect } from 'react';
import {
  Users,
  Pickaxe,
  Coins,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-3xl bg-[#0B2516]/80 border border-[#86EFAC]/20" />
          <div className="h-64 rounded-3xl bg-[#0B2516]/80 border border-[#86EFAC]/20" />
          <div className="h-64 rounded-3xl bg-[#0B2516]/80 border border-[#86EFAC]/20" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics;
  const totalUsers = metrics?.totalUsers ?? 0;
  const dailyMiners = metrics?.dailyActiveMinersCount ?? 0;
  const activeUsers = metrics?.activeUsers ?? 0;
  const inactiveUsers = metrics?.inactiveUsers ?? 0;
  const totalGtMined = metrics?.totalCoinsIssued ?? 0;
  const totalClaims = metrics?.totalMiningClaims ?? 0;
  const miningRatio = totalUsers > 0 ? Math.round((dailyMiners / totalUsers) * 100) : 0;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto px-4">
      <AdminNav />

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0B2516] via-[#071F14] to-[#04130C] border border-[#86EFAC]/25 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#86EFAC]">
              <Activity className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Dashboard
              </h1>
              <p className="text-[11px] text-[#A7C9B1]">
                Real-time network miner statistics and GT mining volume metrics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/20 text-[11px] font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>Live Node Ledger Synchronized</span>
          </div>
        </div>
      </div>

      {/* 3 PRIMARY METRIC BOXES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ======================================================== */}
        {/* BOX 1: TOTAL MINERS COUNT */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0B2516] via-[#071F14] to-[#04130C] border border-[#22C55E]/30 shadow-md flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#22C55E]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#22C55E]/20 transition-all" />

          {/* Header */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-black tracking-wider text-[#86EFAC] uppercase block">
                  Total Miners Count
                </span>
                <span className="text-[10px] text-[#A7C9B1]">Registered platform miners</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/30">
              Miners
            </span>
          </div>

          {/* Big Count */}
          <div className="my-3 z-10 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {totalUsers.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#86EFAC]">Total Miners</span>
          </div>

          {/* Bottom Info / Link */}
          <div className="pt-3 border-t border-white/10 z-10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#A7C9B1]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="text-[10px]">Verified Node Accounts</span>
            </div>
            <Link
              to="/admin/users"
              className="text-[10px] font-bold text-[#86EFAC] hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>View Directory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOX 2: DAILY MINING COUNT (WITH ACTIVE & INACTIVE INSIDE) */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#122A1A] via-[#092215] to-[#05160E] border border-[#FBBF24]/30 shadow-md flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#FBBF24]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#FBBF24]/20 transition-all" />

          {/* Header */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/20 border border-[#FBBF24]/40 flex items-center justify-center text-[#FBBF24]">
                <Pickaxe className="w-4 h-4 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <span className="text-[11px] font-black tracking-wider text-[#FCD34D] uppercase block">
                  Daily Mining Count
                </span>
                <span className="text-[10px] text-[#A7C9B1]">Miners active in last 24h</span>
              </div>
            </div>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-pulse" />
              <span>Today</span>
            </span>
          </div>

          {/* Big Daily Count */}
          <div className="my-3 z-10 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {dailyMiners.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#FCD34D]">
              Mining Today ({miningRatio}% of network)
            </span>
          </div>

          {/* SUB-SECTION INSIDE BOX: ACTIVE MINERS COUNT & INACTIVE MINERS COUNT */}
          <div className="p-3 rounded-xl bg-[#05160E]/90 border border-[#FBBF24]/20 z-10 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              {/* Active Miners */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#86EFAC]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
                  <span>Active Miners Count</span>
                </div>
                <div className="text-lg font-black text-white">
                  {activeUsers.toLocaleString()}
                </div>
                <span className="text-[9px] text-[#A7C9B1] block">Mining in active epoch</span>
              </div>

              {/* Inactive Miners */}
              <div className="space-y-0.5 border-l border-white/10 pl-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span>Inactive Miners Count</span>
                </div>
                <div className="text-lg font-black text-white/70">
                  {inactiveUsers.toLocaleString()}
                </div>
                <span className="text-[9px] text-[#A7C9B1] block">Dormant miners</span>
              </div>
            </div>

            {/* Participation Progress Bar */}
            <div className="space-y-1 pt-1.5 border-t border-white/10">
              <div className="flex items-center justify-between text-[9px] text-[#A7C9B1]">
                <span>24h Mining Epoch Participation</span>
                <span className="font-bold text-[#FCD34D]">{dailyMiners} of {totalUsers} Active</span>
              </div>
              <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FBBF24] to-[#22C55E] transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(10, miningRatio))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOX 3: TOTAL GT MINING COUNT */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0B2A1E] via-[#071F14] to-[#04150E] border border-[#10B981]/30 shadow-md flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#10B981]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#10B981]/20 transition-all" />

          {/* Header */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#34D399]">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-black tracking-wider text-[#6EE7B7] uppercase block">
                  Total GT Mining Count
                </span>
                <span className="text-[10px] text-[#A7C9B1]">Cumulative tokens mined</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/20 text-[#6EE7B7] border border-[#10B981]/30">
              Total Mined
            </span>
          </div>

          {/* Amount */}
          <div className="my-3 z-10 space-y-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {Number(totalGtMined).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xl font-black text-[#34D399]">GT</span>
            </div>
            <p className="text-[10px] text-[#A7C9B1]">
              Total GT tokens successfully mined by all network nodes
            </p>
          </div>

          {/* Sub Stats inside Box */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/10 z-10 text-xs">
            <div className="p-2.5 rounded-xl bg-[#05160E]/80 border border-white/10">
              <span className="text-[9px] text-[#A7C9B1] block">Confirmed Claims</span>
              <span className="text-sm font-bold text-[#34D399]">{totalClaims.toLocaleString()}</span>
              <span className="text-[8px] text-[#A7C9B1] block">Completed blocks</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#05160E]/80 border border-white/10">
              <span className="text-[9px] text-[#A7C9B1] block">Block Reward</span>
              <span className="text-sm font-bold text-[#FCD34D]">1.0 GT</span>
              <span className="text-[8px] text-[#A7C9B1] block">Per 4-hour cycle</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
