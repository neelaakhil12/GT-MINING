import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  Sparkles,
  Lock,
  Clock,
  ShieldCheck,
  CreditCard,
  Building2,
  Coins,
  Zap,
  CheckCircle2,
  AlertCircle,
  Bell,
  Layers,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminWithdrawalsPage: React.FC = () => {
  const { showToast } = useToast();
  const [notifyEmail, setNotifyEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) {
      showToast('Please enter a valid administrator email', 'error');
      return;
    }
    setSubscribed(true);
    showToast('You will be notified as soon as Withdrawals Phase 3 launches! 🚀', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-4">
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B2516] via-[#071F14] to-[#04130C] border-2 border-[#86EFAC]/25 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] flex items-center justify-center text-[#07130D] shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <ArrowUpRight className="w-5 h-5" />
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Withdrawals & Payouts Engine
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30 shadow-sm animate-pulse">
                UPCOMING • PHASE 3
              </span>
            </div>
          </div>
          <p className="text-xs text-[#A7C9B1] max-w-xl">
            Autonomous multi-chain cryptographic distribution, liquidity settlement rails, and direct user wallet withdrawals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[#86EFAC] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FBBF24] animate-ping" />
            <span>Protocol Status: In Development</span>
          </span>
        </div>
      </div>

      {/* 2. MAIN HERO UPCOMING SPOTLIGHT CARD */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F3520] via-[#082214] to-[#04140B] border-2 border-[#22C55E]/40 p-6 sm:p-10 shadow-2xl text-center space-y-6">
        {/* Ambient Decorative Background Orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-72 h-72 bg-[#FBBF24]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Shimmering Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#22C55E]/20 to-[#FBBF24]/20 border border-[#22C55E]/40 text-[#86EFAC] text-xs font-black shadow-lg relative z-10">
          <Sparkles className="w-4 h-4 text-[#FBBF24]" />
          <span>AUTONOMOUS WITHDRAWAL PROTOCOL IS UPCOMING</span>
        </div>

        {/* Large Headline */}
        <div className="space-y-3 max-w-2xl mx-auto relative z-10">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Direct On-Chain & Fiat Payout Engine{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] via-[#86EFAC] to-[#FBBF24]">
              Coming Soon
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#A7C9B1] leading-relaxed">
            The GT Mining decentralized treasury and automated smart contracts are being pre-configured for the upcoming genesis release. Once active, all verified miners will be able to initiate direct withdrawals from their GT coin wallet balance.
          </p>
        </div>

        {/* Simulated Protocol Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 relative z-10">
          <div className="p-4 rounded-2xl bg-[#05160E]/80 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#A7C9B1] block">Min. Withdrawal</span>
            <span className="text-base sm:text-xl font-black text-white font-mono">100.00 GT</span>
            <span className="text-[10px] text-[#22C55E] block font-mono">Configurable in Admin</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#05160E]/80 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#A7C9B1] block">Protocol Gas Fee</span>
            <span className="text-base sm:text-xl font-black text-[#86EFAC] font-mono">0.00%</span>
            <span className="text-[10px] text-[#A7C9B1] block">Network Sponsored</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#05160E]/80 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#A7C9B1] block">Settlement Speed</span>
            <span className="text-base sm:text-xl font-black text-[#FBBF24] font-mono">&lt; 60s</span>
            <span className="text-[10px] text-[#A7C9B1] block">High-Throughput Node</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#05160E]/80 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#A7C9B1] block">Supported Networks</span>
            <span className="text-base sm:text-xl font-black text-white font-mono">EVM & Sol</span>
            <span className="text-[10px] text-[#22C55E] block">Multi-Chain Bridge</span>
          </div>
        </div>

        {/* Email Notification signup */}
        <div className="max-w-md mx-auto pt-4 relative z-10">
          {subscribed ? (
            <div className="p-3.5 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#86EFAC] text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>Notification registered! Admin alerts enabled for Withdrawal Phase 3.</span>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex items-center gap-2">
              <input
                type="email"
                required
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="Enter admin email for launch notification..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs placeholder-[#A7C9B1]/60 focus:border-[#FBBF24] outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-[#07130D] font-black text-xs hover:brightness-110 shadow-lg cursor-pointer whitespace-nowrap active:scale-95"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3. THREE COMING-SOON CAPABILITY PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Web3 Wallet Withdrawals */}
        <div className="p-6 rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/20 shadow-md space-y-3 relative overflow-hidden group hover:border-[#86EFAC]/40 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] group-hover:scale-110 transition-transform">
            <Coins className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white group-hover:text-[#86EFAC] transition-colors">
            1. Non-Custodial Web3 Wallets
          </h3>
          <p className="text-xs text-[#A7C9B1] leading-relaxed">
            Miners will be able to connect MetaMask, TrustWallet, or Phantom to claim GT coin tokens straight into their personal cryptographic decentralized vaults.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[10px] text-[#86EFAC] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            <span>Instant Zero-Gas Batch Claims</span>
          </div>
        </div>

        {/* Pillar 2: Visa & Mastercard Card Top-up */}
        <div className="p-6 rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/20 shadow-md space-y-3 relative overflow-hidden group hover:border-[#86EFAC]/40 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24] group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white group-hover:text-[#FBBF24] transition-colors">
            2. Visa & Mastercard Liquid Rail
          </h3>
          <p className="text-xs text-[#A7C9B1] leading-relaxed">
            Instant liquidity conversion enabling direct payouts to GT Global payment cards accepted worldwide across 150+ countries at retail POS terminals and online ATMs.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[10px] text-[#FBBF24] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
            <span>Direct Everyday Fiat Liquidity</span>
          </div>
        </div>

        {/* Pillar 3: Multi-Sig Escrow Vaults */}
        <div className="p-6 rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/20 shadow-md space-y-3 relative overflow-hidden group hover:border-[#86EFAC]/40 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white group-hover:text-[#3B82F6] transition-colors">
            3. Multi-Sig Escrow & Security
          </h3>
          <p className="text-xs text-[#A7C9B1] leading-relaxed">
            Institutional-grade multi-signature protocol escrow ensuring every withdrawal request is cryptographically verified against completed 4-hour mining cycle ledgers.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[10px] text-[#3B82F6] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            <span>Audited Smart Contract Release</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawalsPage;

