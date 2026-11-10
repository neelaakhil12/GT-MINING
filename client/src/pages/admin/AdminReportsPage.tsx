import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Users,
  Pickaxe,
  Coins,
  Calendar,
  ArrowUpRight,
  RefreshCw,
  Download,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface DailyReportItem {
  date: string;
  label: string;
  miningAmount: number;
  claimsCount: number;
  newUsers: number;
  cumulativeMining: number;
}

interface DistributionItem {
  name: string;
  value: number;
  color: string;
}

interface ReportsData {
  summary: {
    totalMiningDone: number;
    dailyMiningToday: number;
    dailyMiningClaimsToday: number;
    totalUsers: number;
    dailyNewUsersToday: number;
    dailyActiveMinersToday: number;
    activeUsersCount: number;
    inactiveUsersCount: number;
    totalCoinsIssued: number;
    totalMiningClaimsCount: number;
  };
  dailyHistory: DailyReportItem[];
  tokenDistribution: DistributionItem[];
  userActivityDistribution: DistributionItem[];
}

export const AdminReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7' | '14' | 'all'>('14');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'mining' | 'users'>('mining');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setRefreshing(true);
      const res = await api.getAdminReports();
      if (res.success) {
        setData(res);
      } else {
        showToast('Failed to load reports data', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching analytics reports', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter daily history based on selected time range
  const filteredHistory = useMemo(() => {
    if (!data?.dailyHistory) return [];
    if (timeRange === '7') return data.dailyHistory.slice(-7);
    return data.dailyHistory;
  }, [data, timeRange]);

  // Calculations for bar charts
  const maxMiningValue = useMemo(() => {
    if (!filteredHistory.length) return 1;
    const max = Math.max(...filteredHistory.map((h) => h.miningAmount));
    return max > 0 ? max : 1;
  }, [filteredHistory]);

  const maxUsersValue = useMemo(() => {
    if (!filteredHistory.length) return 1;
    const max = Math.max(...filteredHistory.map((h) => h.newUsers));
    return max > 0 ? max : 1;
  }, [filteredHistory]);

  // Export report to CSV
  const handleExportCSV = () => {
    if (!filteredHistory.length) return;
    const headers = ['Date', 'New Users', 'Claims Count', 'Daily GT Mined', 'Cumulative GT Mined'];
    const rows = filteredHistory.map((row) => [
      row.date,
      row.newUsers,
      row.claimsCount,
      row.miningAmount,
      row.cumulativeMining,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GT_Mining_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report downloaded as CSV successfully! 📊', 'success');
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-[#22C55E] animate-spin" />
        <p className="text-xs font-bold text-[#A7C9B1] tracking-wider uppercase">
          Generating Network Analytics & Reports...
        </p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalMiningDone: 0,
    dailyMiningToday: 0,
    dailyMiningClaimsToday: 0,
    totalUsers: 0,
    dailyNewUsersToday: 0,
    dailyActiveMinersToday: 0,
    activeUsersCount: 0,
    inactiveUsersCount: 0,
    totalCoinsIssued: 0,
    totalMiningClaimsCount: 0,
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B2516] via-[#081F12] to-[#04160E] border-2 border-[#86EFAC]/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-2xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#4ADE80] shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Network Analytics & Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#22C55E]/20 text-[#86EFAC] border border-[#22C55E]/30 uppercase ml-1">
              Live Ledger
            </span>
          </div>
          <p className="text-xs text-[#A7C9B1] max-w-2xl">
            Real-time visualization of daily & cumulative GT tokens mined, registered user growth trends,
            and ecosystem token circulation charts.
          </p>
        </div>

        {/* Action Controls: Refresh & CSV Export */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <div className="flex items-center bg-[#05160E] border border-[#86EFAC]/25 rounded-2xl p-1">
            {(['7', '14'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-[#22C55E] text-[#07130D] shadow-sm'
                    : 'text-[#A7C9B1] hover:text-white'
                }`}
              >
                {r} Days
              </button>
            ))}
          </div>

          <button
            onClick={fetchReports}
            disabled={refreshing}
            className="px-3.5 py-2.5 rounded-2xl bg-[#0F3520] hover:bg-[#16492C] border border-[#86EFAC]/30 text-[#86EFAC] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            title="Refresh Reports"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:brightness-110 text-[#07130D] text-xs font-black flex items-center gap-1.5 shadow-[0_4px_20px_rgba(251,191,36,0.35)] cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Mining Done Till Now */}
        <div className="p-5 rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/25 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-[#22C55E]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#A7C9B1]">
              Total GT Mined (Till Now)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#4ADE80]">
              <Pickaxe className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              <span>{summary.totalMiningDone.toLocaleString()}</span>
              <span className="text-sm font-bold text-[#86EFAC]">GT</span>
            </div>
            <p className="text-[11px] text-[#A7C9B1] mt-1">
              Cumulative from <span className="text-white font-bold">{summary.totalMiningClaimsCount}</span> successful claims
            </p>
          </div>
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-[#86EFAC] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Network Ledger Mined</span>
            </span>
            <span className="text-white/60 font-mono">100% Verified</span>
          </div>
        </div>

        {/* Card 2: Daily Mining Today */}
        <div className="p-5 rounded-3xl bg-[#0B2516]/90 border border-[#FBBF24]/25 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-[#FBBF24]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#A7C9B1]">
              Daily GT Mined (Today)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24]">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              <span>{summary.dailyMiningToday.toLocaleString()}</span>
              <span className="text-sm font-bold text-[#FBBF24]">GT</span>
            </div>
            <p className="text-[11px] text-[#A7C9B1] mt-1">
              <span className="text-white font-bold">{summary.dailyMiningClaimsToday}</span> claims completed in last 24h
            </p>
          </div>
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-[#FBBF24] font-bold flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>Current 24h Epoch</span>
            </span>
            <span className="text-white/60 font-mono">Active</span>
          </div>
        </div>

        {/* Card 3: Total Registered Miners */}
        <div className="p-5 rounded-3xl bg-[#0B2516]/90 border border-[#38BDF8]/25 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-[#38BDF8]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#A7C9B1]">
              Total Platform Users
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              <span>{summary.totalUsers.toLocaleString()}</span>
              <span className="text-sm font-bold text-[#38BDF8]">Miners</span>
            </div>
            <p className="text-[11px] text-[#A7C9B1] mt-1">
              <span className="text-[#4ADE80] font-bold">{summary.activeUsersCount} active</span> ({Math.round((summary.activeUsersCount / Math.max(1, summary.totalUsers)) * 100)}% of network)
            </p>
          </div>
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-[#38BDF8] font-bold flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>Verified Directory</span>
            </span>
            <span className="text-white/60 font-mono">Live</span>
          </div>
        </div>

        {/* Card 4: Daily New Users & Active Miners Today */}
        <div className="p-5 rounded-3xl bg-[#0B2516]/90 border border-[#A855F7]/25 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-[#A855F7]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#A7C9B1]">
              Daily New Users (Today)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#C084FC]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              <span>+{summary.dailyNewUsersToday}</span>
              <span className="text-sm font-bold text-[#C084FC]">Joined</span>
            </div>
            <p className="text-[11px] text-[#A7C9B1] mt-1">
              <span className="text-white font-bold">{summary.dailyActiveMinersToday}</span> miners active today
            </p>
          </div>
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-[#C084FC] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Today's Velocity</span>
            </span>
            <span className="text-white/60 font-mono">24h Growth</span>
          </div>
        </div>
      </div>

      {/* 3. Bar Graphs: Daily Mining Volume vs Daily User Registrations */}
      <div className="p-6 rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/25 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#22C55E]" />
              <h2 className="text-lg font-black text-white">
                Daily Mining & User Trends (Bar Graph)
              </h2>
            </div>
            <p className="text-xs text-[#A7C9B1] mt-1">
              Daily volume for the last {timeRange} days. Hover over any bar to view exact metric details.
            </p>
          </div>

          {/* Toggle Tab: Mining Volume vs User Registrations */}
          <div className="flex items-center gap-1 bg-[#05160E] border border-[#86EFAC]/25 rounded-2xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab('mining')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeChartTab === 'mining'
                  ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-[#07130D] shadow-md'
                  : 'text-[#A7C9B1] hover:text-white'
              }`}
            >
              <Pickaxe className="w-3.5 h-3.5" />
              <span>Daily Mining (GT)</span>
            </button>
            <button
              onClick={() => setActiveChartTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeChartTab === 'users'
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-[#07130D] shadow-md'
                  : 'text-[#A7C9B1] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Daily Users Joined</span>
            </button>
          </div>
        </div>

        {/* The Interactive Responsive Bar Chart */}
        <div className="space-y-3">
          <div className="h-64 sm:h-72 w-full flex items-end gap-2 sm:gap-4 pt-8 pb-2 px-2 sm:px-4 bg-[#05160E]/80 rounded-2xl border border-white/5 relative">
            {/* Background Grid Lines */}
            <div className="absolute inset-x-0 top-6 border-b border-white/5 pointer-events-none" />
            <div className="absolute inset-x-0 top-24 border-b border-white/5 pointer-events-none" />
            <div className="absolute inset-x-0 top-44 border-b border-white/5 pointer-events-none" />

            {filteredHistory.map((item, idx) => {
              const val = activeChartTab === 'mining' ? item.miningAmount : item.newUsers;
              const maxVal = activeChartTab === 'mining' ? maxMiningValue : maxUsersValue;
              const heightPercent = Math.max(6, Math.round((val / maxVal) * 88));
              const isHovered = hoveredBarIndex === idx;

              return (
                <div
                  key={item.date}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-14 z-20 px-3 py-1.5 rounded-xl bg-[#04160E] border border-[#22C55E]/50 text-white text-[11px] font-bold shadow-2xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-[10px] text-[#A7C9B1]">{item.date}</div>
                      {activeChartTab === 'mining' ? (
                        <div className="text-[#4ADE80] font-black">
                          {item.miningAmount} GT ({item.claimsCount} claims)
                        </div>
                      ) : (
                        <div className="text-[#38BDF8] font-black">
                          +{item.newUsers} New Miners
                        </div>
                      )}
                    </div>
                  )}

                  {/* Value label on top of bar */}
                  <span className="text-[10px] font-mono text-white/70 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {val > 0 ? val : ''}
                  </span>

                  {/* Bar Body with Gradient */}
                  <div
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 relative ${
                      activeChartTab === 'mining'
                        ? isHovered
                          ? 'bg-gradient-to-t from-[#22C55E] to-[#FBBF24] shadow-[0_0_20px_rgba(34,197,94,0.6)] scale-x-105'
                          : 'bg-gradient-to-t from-[#16A34A] to-[#22C55E] hover:brightness-110'
                        : isHovered
                        ? 'bg-gradient-to-t from-[#0284C7] to-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.6)] scale-x-105'
                        : 'bg-gradient-to-t from-[#0369A1] to-[#38BDF8] hover:brightness-110'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Date Label on Bottom */}
                  <span className="text-[10px] text-[#A7C9B1] mt-2 font-mono truncate w-full text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#A7C9B1] px-2 pt-1">
            <span>
              Showing {filteredHistory.length} Daily Epoch Records
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
                <span className="text-white font-bold">Mining (GT)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#38BDF8]" />
                <span className="text-white font-bold">New Users</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Pie Charts: Token Circulation Distribution & Miner Activity Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart 1: Token Circulation & Distribution */}
        <div className="p-6 rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/25 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#FBBF24]" />
              <h3 className="text-base font-black text-white">
                GT Token Distribution (Pie Chart)
              </h3>
            </div>
            <span className="text-[11px] text-[#86EFAC] font-mono">By Category</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            {/* SVG Donut / Pie Chart */}
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  const dist = data?.tokenDistribution || [];
                  const total = dist.reduce((sum, d) => sum + d.value, 0) || 1;
                  let cumulativePercent = 0;

                  return dist.map((item, idx) => {
                    const percent = (item.value / total) * 100;
                    const strokeDasharray = `${percent} ${100 - percent}`;
                    const strokeDashoffset = -cumulativePercent;
                    cumulativePercent += percent;

                    return (
                      <circle
                        key={item.name}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500 hover:opacity-85 cursor-pointer"
                      />
                    );
                  });
                })()}
              </svg>
              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-[#A7C9B1]">Total Mined</span>
                <span className="text-lg font-black text-white">{summary.totalMiningDone.toLocaleString()}</span>
                <span className="text-[10px] text-[#86EFAC] font-bold">GT Tokens</span>
              </div>
            </div>

            {/* Legend & Percentages */}
            <div className="space-y-3 w-full max-w-xs">
              {(data?.tokenDistribution || []).map((item) => {
                const total = (data?.tokenDistribution || []).reduce((s, d) => s + d.value, 0) || 1;
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div
                    key={item.name}
                    className="p-2.5 rounded-xl bg-[#05160E] border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-bold text-white">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-white">{item.value.toLocaleString()} GT</span>
                      <span className="text-[10px] text-[#A7C9B1] ml-1.5 font-mono">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pie Chart 2: User Engagement Health Ratio */}
        <div className="p-6 rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/25 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#38BDF8]" />
              <h3 className="text-base font-black text-white">
                Miner Activity Status (Pie Chart)
              </h3>
            </div>
            <span className="text-[11px] text-[#38BDF8] font-mono">Network Health</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            {/* SVG Donut / Pie Chart */}
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  const dist = data?.userActivityDistribution || [];
                  const total = dist.reduce((sum, d) => sum + d.value, 0) || 1;
                  let cumulativePercent = 0;

                  return dist.map((item) => {
                    const percent = (item.value / total) * 100;
                    const strokeDasharray = `${percent} ${100 - percent}`;
                    const strokeDashoffset = -cumulativePercent;
                    cumulativePercent += percent;

                    return (
                      <circle
                        key={item.name}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500 hover:opacity-85 cursor-pointer"
                      />
                    );
                  });
                })()}
              </svg>
              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-[#A7C9B1]">Total Miners</span>
                <span className="text-xl font-black text-white">{summary.totalUsers}</span>
                <span className="text-[10px] text-[#38BDF8] font-bold">Registered</span>
              </div>
            </div>

            {/* Legend & Percentages */}
            <div className="space-y-3 w-full max-w-xs">
              {(data?.userActivityDistribution || []).map((item) => {
                const total = (data?.userActivityDistribution || []).reduce((s, d) => s + d.value, 0) || 1;
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div
                    key={item.name}
                    className="p-2.5 rounded-xl bg-[#05160E] border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-bold text-white">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-white">{item.value.toLocaleString()} Users</span>
                      <span className="text-[10px] text-[#A7C9B1] ml-1.5 font-mono">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-[#A7C9B1]/70 italic pt-1">
                Active miners are nodes that claimed GT mining rewards in the current active threshold.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Detailed Daily Performance Breakdown Ledger Table */}
      <div className="p-6 rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/25 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#22C55E]" />
              <span>Daily Mining & User Ledger Breakdown</span>
            </h3>
            <p className="text-xs text-[#A7C9B1] mt-0.5">
              Comprehensive chronological ledger of GT mined and miner registration velocity per epoch.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-[#0F3520] hover:bg-[#16492C] text-[#86EFAC] text-xs font-bold flex items-center gap-1.5 border border-[#86EFAC]/25 cursor-pointer transition-all"
          >
            <Download className="w-3 h-3" />
            <span>Export Table</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#A7C9B1] uppercase text-[10px] font-black tracking-wider bg-[#05160E]/60">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">New Users Joined</th>
                <th className="py-3 px-4">Daily Claims</th>
                <th className="py-3 px-4">Daily GT Mined</th>
                <th className="py-3 px-4">Cumulative Total GT</th>
                <th className="py-3 px-4 text-right">Epoch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredHistory.map((row) => (
                <tr key={row.date} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#22C55E]" />
                    <span>{row.date}</span>
                  </td>
                  <td className="py-3 px-4">
                    {row.newUsers > 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#38BDF8]/15 text-[#38BDF8] font-black text-[11px] border border-[#38BDF8]/30">
                        +{row.newUsers} Miners
                      </span>
                    ) : (
                      <span className="text-[#A7C9B1]/60 font-mono">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {row.claimsCount} claims
                  </td>
                  <td className="py-3 px-4 font-black text-[#4ADE80]">
                    {row.miningAmount > 0 ? `+${row.miningAmount} GT` : '0 GT'}
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-[#FBBF24]">
                    {row.cumulativeMining} GT
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#86EFAC] text-[10px] font-bold border border-[#22C55E]/30 uppercase">
                      Synchronized
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;

