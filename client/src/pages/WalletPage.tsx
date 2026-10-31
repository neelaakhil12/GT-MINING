import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  Coins,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { WalletTransaction } from '../types';
import { GtLogo } from '../components/GtLogo';
import { GlassCard } from '../components/GlassCard';

export const WalletPage: React.FC = () => {
  const { wallet: authWallet, updateWalletBalance } = useAuth();
  const { showToast } = useToast();

  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.getWallet();
      if (res.success) {
        setWalletData(res.wallet);
        setTransactions(res.transactions || []);
        updateWalletBalance(res.wallet.availableBalance, res.wallet.lifetimeEarned);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch wallet ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 rounded-3xl bg-white/60 border border-white" />
        <div className="h-96 rounded-3xl bg-white/60 border border-white" />
      </div>
    );
  }

  const balance = walletData?.availableBalance ?? authWallet?.availableBalance ?? 0;
  const lifetime = walletData?.lifetimeEarned ?? authWallet?.lifetimeEarned ?? 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Wallet Balance Hero Card */}
      <GlassCard glow className="relative overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-black/5 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
              Primary Virtual Asset
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0A341B] flex items-center gap-3">
              <span>{balance.toFixed(4)}</span>
              <span className="text-[#16A34A] text-2xl font-extrabold">GT</span>
            </h1>
            <p className="text-xs text-[#1E5E36] font-medium">
              Synchronized with cryptographically validated local ledger
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-white shadow-sm flex items-center gap-4">
            <GtLogo size="sm" glow animated />
            <div>
              <p className="text-[11px] font-bold text-[#1E5E36] uppercase tracking-wider">Lifetime Total Earned</p>
              <p className="text-xl font-black text-[#0A341B]">{lifetime.toFixed(4)} GT</p>
            </div>
          </div>
        </div>

        {/* 3 Metric Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/80 border border-white shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1E5E36]">
              <span>Mining Rewards Total</span>
              <ArrowUpRight className="w-4 h-4 text-[#16A34A]" />
            </div>
            <p className="text-xl font-black text-[#0A341B]">
              {(walletData?.miningRewardsTotal ?? 0).toFixed(2)} GT
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-white shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1E5E36]">
              <span>Referral Bonuses Total</span>
              <ArrowUpRight className="w-4 h-4 text-[#16A34A]" />
            </div>
            <p className="text-xl font-black text-[#0A341B]">
              {(walletData?.referralRewardsTotal ?? 0).toFixed(2)} GT
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-white shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1E5E36]">
              <span>Admin Adjustments</span>
              <TrendingUp className="w-4 h-4 text-[#D97706]" />
            </div>
            <p className="text-xl font-black text-[#0A341B]">
              {(walletData?.adminAdjustmentsTotal ?? 0).toFixed(2)} GT
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Virtual Currency Transparency Banner */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white shadow-sm flex items-start gap-3.5 text-xs text-[#1E5E36]">
        <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#0A341B] font-bold">Transparency & Token Disclaimer:</strong>
          <p className="leading-relaxed">
            GT is an in-app virtual utility coin utilized within the GT community ecosystem. GT coins cannot be bought, sold, or redeemed for fiat currency on this platform. No investment or monetary return is promised or implied.
          </p>
        </div>
      </div>

      {/* Transaction History Section */}
      <GlassCard className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#16A34A]" />
            <h3 className="text-lg font-black text-[#0A341B]">Transaction History</h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'MINING_REWARD', 'REFERRAL_REWARD', 'ADMIN_ADJUSTMENT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filterType === type
                    ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-md'
                    : 'bg-white/80 text-[#1E5E36] hover:bg-white hover:text-[#0A341B] border border-white shadow-sm'
                }`}
              >
                {type === 'ALL' ? 'All Ledger' : type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Coins className="w-10 h-10 text-[#16A34A]/40 mx-auto" />
            <p className="text-sm font-bold text-[#0A341B]">No transactions recorded</p>
            <p className="text-xs text-[#1E5E36]">New mining rewards and referral credits will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-white/80 border border-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-white transition-all shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0A341B]">{tx.description}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#22C55E]/15 text-[#15803D] border border-[#22C55E]/30">
                      {tx.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[#1E5E36]">
                    <span>ID: <code className="font-mono text-[#16A34A]">{tx.id}</code></span>
                    <span>Date: {new Date(tx.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto">
                  <span className={`font-mono text-base font-black ${
                    tx.amount >= 0 ? 'text-[#15803D]' : 'text-[#DC2626]'
                  }`}>
                    {tx.amount >= 0 ? `+${tx.amount.toFixed(4)}` : tx.amount.toFixed(4)} GT
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#15803D] border border-[#22C55E]/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Completed</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
