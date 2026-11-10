import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Search,
  Download,
  RefreshCw,
  Coins,
  Pickaxe,
  Users,
  Zap,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Flame,
  Sparkles,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface MinerRank {
  rank: number;
  id: string;
  fullName: string;
  email: string;
  phone: string;
  referralCode: string;
  accountStatus: string;
  gtWalletCoins: number;
  totalMined: number;
  lifetimeEarned: number;
  referralEarnings: number;
  completedCycles: number;
  referralCount: number;
  lastMiningAt: string | null;
  createdAt: string;
}

export const AdminTopMinersPage: React.FC = () => {
  const { showToast } = useToast();
  const [miners, setMiners] = useState<MinerRank[]>([]);
  const [totalMiners, setTotalMiners] = useState<number>(0);
  const [totalCirculation, setTotalCirculation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedMiner, setSelectedMiner] = useState<MinerRank | null>(null);

  useEffect(() => {
    fetchTopMiners();
  }, []);

  const fetchTopMiners = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminTopMiners();
      if (res && res.success && Array.isArray(res.topMiners)) {
        setMiners(res.topMiners);
        setTotalMiners(res.totalMiners || res.topMiners.length);
        setTotalCirculation(res.totalCoinsInCirculation || 0);
      } else {
        setMiners([]);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch top miners data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredMiners = miners.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone && m.phone.toLowerCase().includes(q)) ||
      (m.referralCode && m.referralCode.toLowerCase().includes(q)) ||
      String(m.rank) === q
    );
  });

  const top1 = miners[0];
  const top2 = miners[1];
  const top3 = miners[2];

  const avgWalletCoins =
    totalMiners > 0 ? (totalCirculation / totalMiners).toFixed(2) : '0.00';

  const handleExportCSV = () => {
    if (miners.length === 0) {
      showToast('No miners to export', 'info');
      return;
    }

    const headers = [
      'Rank',
      'Full Name',
      'Email',
      'Phone',
      'Referral Code',
      'GT Wallet Coins',
      'Total Mined Coins',
      'Lifetime Earned',
      'Referral Yield',
      'Completed Cycles',
      'Referral Count',
      'Status',
      'Joined Date',
    ];

    const rows = miners.map((m) => [
      m.rank,
      `"${m.fullName.replace(/"/g, '""')}"`,
      `"${m.email}"`,
      `"${m.phone}"`,
      `"${m.referralCode}"`,
      m.gtWalletCoins,
      m.totalMined,
      m.lifetimeEarned,
      m.referralEarnings,
      m.completedCycles,
      m.referralCount,
      m.accountStatus,
      new Date(m.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `gt_top_miners_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Top Miners Leaderboard CSV exported!', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-4">
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B2516] via-[#071F14] to-[#04130C] border-2 border-[#86EFAC]/25 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FBBF24] to-[#F59E0B] flex items-center justify-center text-[#07130D] shadow-[0_0_15px_rgba(251,191,36,0.4)]">
              <Trophy className="w-5 h-5 fill-current" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Top Miners Leaderboard
            </h1>
          </div>
          <p className="text-xs text-[#A7C9B1] max-w-xl">
            Live sequential ranking of all miners and users sorted strictly by their current{' '}
            <span className="text-[#86EFAC] font-bold">GT wallet coin balance</span> in descending order.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchTopMiners}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer active:scale-95"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#22C55E] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:brightness-110 text-[#07130D] text-xs font-black flex items-center gap-2 shadow-lg shadow-[#22C55E]/20 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B2516]/90 border border-[#86EFAC]/20 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#A7C9B1] block">
              🏆 Top #1 Miner
            </span>
            <div className="text-base sm:text-lg font-black text-[#FBBF24] truncate max-w-[140px] sm:max-w-[180px]">
              {top1 ? top1.fullName : 'N/A'}
            </div>
            <span className="text-[10px] text-[#86EFAC] font-mono">
              {top1 ? `${top1.gtWalletCoins.toLocaleString()} GT` : '0 GT'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24]">
            <Crown className="w-5 h-5 fill-current" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B2516]/90 border border-[#86EFAC]/20 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#A7C9B1] block">
              💎 Total Wallet Balance
            </span>
            <div className="text-base sm:text-xl font-black text-white">
              {totalCirculation.toLocaleString()} <span className="text-xs text-[#22C55E]">GT</span>
            </div>
            <span className="text-[10px] text-[#A7C9B1]/80">Across all miners</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B2516]/90 border border-[#86EFAC]/20 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#A7C9B1] block">
              👥 Registered Miners
            </span>
            <div className="text-base sm:text-xl font-black text-white">
              {totalMiners.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#86EFAC]">Ranked sequentially</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B2516]/90 border border-[#86EFAC]/20 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#A7C9B1] block">
              ⚡ Avg Wallet Coins
            </span>
            <div className="text-base sm:text-xl font-black text-white">
              {avgWalletCoins} <span className="text-xs text-[#22C55E]">GT</span>
            </div>
            <span className="text-[10px] text-[#A7C9B1]/80">Per active miner</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. TOP 3 PODIUM SPOTLIGHT */}
      {miners.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* #2 Silver */}
          {top2 && (
            <div
              onClick={() => setSelectedMiner(top2)}
              className="p-5 rounded-3xl bg-gradient-to-b from-[#0F2F1C]/90 to-[#07180E] border border-slate-300/30 hover:border-slate-300/60 shadow-lg relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] group order-2 md:order-1"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center gap-1.5 shadow-sm">
                  <Medal className="w-3.5 h-3.5" />
                  <span>RANK #2 • SILVER</span>
                </span>
                <span className="text-[11px] text-[#A7C9B1] font-mono">
                  {top2.referralCode}
                </span>
              </div>

              <div className="pt-4 space-y-1">
                <p className="text-base font-black text-white group-hover:text-[#86EFAC] transition-colors truncate">
                  {top2.fullName}
                </p>
                <p className="text-xs text-[#A7C9B1] truncate">{top2.email}</p>
                <div className="pt-3">
                  <span className="text-[10px] text-[#A7C9B1] font-bold uppercase tracking-wider block">
                    GT Wallet Balance
                  </span>
                  <div className="text-2xl font-black text-white flex items-center gap-1.5">
                    <span>{top2.gtWalletCoins.toLocaleString()}</span>
                    <span className="text-xs text-[#22C55E]">GT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* #1 Gold Champion */}
          {top1 && (
            <div
              onClick={() => setSelectedMiner(top1)}
              className="p-5 rounded-3xl bg-gradient-to-b from-[#1C3A24] to-[#0A2214] border-2 border-[#FBBF24] shadow-[0_0_30px_rgba(251,191,36,0.25)] relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group order-1 md:order-2"
            >
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#FBBF24]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-[#FBBF24]/30 relative z-10">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FBBF24] text-[#07130D] flex items-center gap-1.5 shadow-md">
                  <Crown className="w-4 h-4 fill-current" />
                  <span>CHAMPION #1 • GOLD</span>
                </span>
                <span className="text-xs text-[#FBBF24] font-mono font-bold">
                  {top1.referralCode}
                </span>
              </div>

              <div className="pt-4 space-y-1 relative z-10">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black text-white truncate">{top1.fullName}</p>
                  <Sparkles className="w-4 h-4 text-[#FBBF24] animate-pulse" />
                </div>
                <p className="text-xs text-[#A7C9B1] truncate">{top1.email}</p>
                <div className="pt-3">
                  <span className="text-[10px] text-[#FBBF24] font-bold uppercase tracking-wider block">
                    Highest GT Wallet Balance
                  </span>
                  <div className="text-3xl font-black text-[#FBBF24] flex items-center gap-2 drop-shadow">
                    <span>{top1.gtWalletCoins.toLocaleString()}</span>
                    <span className="text-sm font-bold text-white">GT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* #3 Bronze */}
          {top3 && (
            <div
              onClick={() => setSelectedMiner(top3)}
              className="p-5 rounded-3xl bg-gradient-to-b from-[#0F2F1C]/90 to-[#07180E] border border-amber-600/30 hover:border-amber-600/60 shadow-lg relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] group order-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-700/20 text-amber-300 border border-amber-600/40 flex items-center gap-1.5 shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  <span>RANK #3 • BRONZE</span>
                </span>
                <span className="text-[11px] text-[#A7C9B1] font-mono">
                  {top3.referralCode}
                </span>
              </div>

              <div className="pt-4 space-y-1">
                <p className="text-base font-black text-white group-hover:text-[#86EFAC] transition-colors truncate">
                  {top3.fullName}
                </p>
                <p className="text-xs text-[#A7C9B1] truncate">{top3.email}</p>
                <div className="pt-3">
                  <span className="text-[10px] text-[#A7C9B1] font-bold uppercase tracking-wider block">
                    GT Wallet Balance
                  </span>
                  <div className="text-2xl font-black text-white flex items-center gap-1.5">
                    <span>{top3.gtWalletCoins.toLocaleString()}</span>
                    <span className="text-xs text-[#22C55E]">GT</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SEARCH & FILTER BAR */}
      <div className="p-4 rounded-2xl bg-[#0B2516]/80 border border-[#86EFAC]/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search miner by name, email, referral code, or rank #..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white text-xs placeholder-[#A7C9B1]/60 focus:border-[#FBBF24] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#A7C9B1] w-full sm:w-auto justify-between sm:justify-end">
          <span>Showing <strong className="text-white">{filteredMiners.length}</strong> of {totalMiners} miners</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[11px] text-[#22C55E] hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 5. SEQUENTIAL LEADERBOARD TABLE */}
      <div className="rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#05160E] text-[11px] uppercase tracking-wider text-[#A7C9B1] font-black font-mono">
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Miner Details</th>
                <th className="py-3.5 px-4 text-right">GT Wallet Coins (Ranked)</th>
                <th className="py-3.5 px-4 text-right">Total Mined</th>
                <th className="py-3.5 px-4 text-right">Referral Yield</th>
                <th className="py-3.5 px-4 text-center">4H Cycles</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm font-bold text-[#A7C9B1]">
                    <div className="flex items-center justify-center gap-2.5">
                      <RefreshCw className="w-4 h-4 text-[#22C55E] animate-spin" />
                      <span>Loading sequential miner rankings...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMiners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm font-bold text-[#A7C9B1]">
                    No miners found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMiners.map((m) => {
                  const isTop1 = m.rank === 1;
                  const isTop2 = m.rank === 2;
                  const isTop3 = m.rank === 3;

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMiner(m)}
                      className={`hover:bg-white/5 transition-colors cursor-pointer group ${
                        isTop1 ? 'bg-[#FBBF24]/5' : isTop2 ? 'bg-slate-300/5' : isTop3 ? 'bg-amber-600/5' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 px-4 text-center">
                        {isTop1 ? (
                          <span className="w-7 h-7 mx-auto rounded-full bg-[#FBBF24] text-[#07130D] font-black text-xs flex items-center justify-center shadow-md">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="w-7 h-7 mx-auto rounded-full bg-slate-300 text-[#07130D] font-black text-xs flex items-center justify-center shadow-md">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="w-7 h-7 mx-auto rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                            3
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-[#A7C9B1] group-hover:text-white">
                            #{m.rank}
                          </span>
                        )}
                      </td>

                      {/* Miner Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                            isTop1
                              ? 'bg-[#FBBF24] text-[#07130D]'
                              : isTop2
                              ? 'bg-slate-300 text-[#07130D]'
                              : isTop3
                              ? 'bg-amber-600 text-white'
                              : 'bg-[#22C55E]/20 text-[#86EFAC] border border-[#22C55E]/30'
                          }`}>
                            {m.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-[#86EFAC] transition-colors leading-tight">
                              {m.fullName}
                            </p>
                            <p className="text-[11px] text-[#A7C9B1] font-mono leading-tight">
                              {m.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* GT Wallet Coins (Primary Rank Sort) */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-sm font-black text-[#86EFAC] font-mono">
                          {m.gtWalletCoins.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </span>
                        <span className="text-[10px] text-[#22C55E] font-bold ml-1">GT</span>
                      </td>

                      {/* Total Mined */}
                      <td className="py-3.5 px-4 text-right font-mono text-white/90">
                        {m.totalMined.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Referral Yield */}
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                        +{m.referralEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Completed Cycles */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/80 border border-white/10 text-[11px]">
                          {m.completedCycles}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.accountStatus === 'ACTIVE'
                              ? 'bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {m.accountStatus}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-right text-[11px] text-[#A7C9B1]">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MINER PROFILE DETAILS MODAL */}
      {selectedMiner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[#092215] border-2 border-[#86EFAC]/40 p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] text-[#07130D] font-black text-sm flex items-center justify-center shadow-md">
                  #{selectedMiner.rank}
                </span>
                <div>
                  <h3 className="text-base font-black text-white">{selectedMiner.fullName}</h3>
                  <p className="text-xs text-[#A7C9B1] font-mono">{selectedMiner.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMiner(null)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#05160E] border border-white/10 space-y-1">
                <span className="text-[10px] text-[#A7C9B1] uppercase font-bold">GT Wallet Coins</span>
                <p className="text-xl font-black text-[#86EFAC] font-mono">
                  {selectedMiner.gtWalletCoins.toLocaleString()} <span className="text-xs">GT</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#05160E] border border-white/10 space-y-1">
                <span className="text-[10px] text-[#A7C9B1] uppercase font-bold">Total Mined</span>
                <p className="text-xl font-black text-white font-mono">
                  {selectedMiner.totalMined.toLocaleString()} <span className="text-xs text-[#22C55E]">GT</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#05160E] border border-white/10 space-y-1">
                <span className="text-[10px] text-[#A7C9B1] uppercase font-bold">Referral Commission</span>
                <p className="text-lg font-black text-emerald-400 font-mono">
                  +{selectedMiner.referralEarnings.toLocaleString()} GT
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#05160E] border border-white/10 space-y-1">
                <span className="text-[10px] text-[#A7C9B1] uppercase font-bold">Completed Cycles</span>
                <p className="text-lg font-black text-white font-mono">
                  {selectedMiner.completedCycles} <span className="text-xs text-[#A7C9B1]">epochs</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#05160E] border border-white/10 space-y-1">
                <span className="text-[10px] text-[#A7C9B1] uppercase font-bold">Phone</span>
                <p className="text-xs font-mono font-bold text-white truncate">{selectedMiner.phone}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#05160E] border border-white/10 space-y-1">
                <span className="text-[10px] text-[#A7C9B1] uppercase font-bold">Referral Code</span>
                <p className="text-xs font-mono font-bold text-[#FBBF24]">{selectedMiner.referralCode}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-[#A7C9B1]">
              <span>Joined: {new Date(selectedMiner.createdAt).toLocaleDateString()}</span>
              <button
                onClick={() => setSelectedMiner(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTopMinersPage;
