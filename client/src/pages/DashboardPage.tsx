import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Coins,
  Copy,
  Share2,
  ExternalLink,
  Pickaxe,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  MessageCircle,
  Send,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { GtCoin } from '../components/GtCoin';
import { GtLogo } from '../components/GtLogo';
import { GlassCard } from '../components/GlassCard';
import { HomeBanners } from '../components/HomeBanners';

export const DashboardPage: React.FC = () => {
  const { user, wallet } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdownStr, setCountdownStr] = useState<string>('00:00:00');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [instagramModal, setInstagramModal] = useState(false);

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

  const referralCode = data?.referralData?.referralCode || user?.referralCode || '';
  const referralLink = data?.referralData?.referralLink || `${window.location.origin}/signup?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    showToast(`Referral code ${referralCode} copied!`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on GT Mining',
          text: `Mine free virtual GT coins every 4 hours! Use my referral code ${referralCode}:`,
          url: referralLink,
        });
        showToast('Shared successfully!', 'success');
      } catch (err) {}
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(`Mine virtual GT coins every 4 hours! Join my network using code ${referralCode}:`);
  const shareUrl = encodeURIComponent(referralLink);

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-3xl bg-white/40 border border-white/60" />
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
      
      {/* Dynamic Image Slides Carousel, Market Rates, and Action Cards matching video */}
      <HomeBanners />
      
      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Referrals */}
        <GlassCard interactive className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E5E36]">Total Referrals</span>
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#0A341B]">
            {data?.statistics?.totalReferrals ?? 0}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#15803D]">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Attributed members</span>
          </div>
        </GlassCard>

        {/* Active Friends */}
        <GlassCard interactive className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E5E36]">Active Friends</span>
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#15803D]">
            {data?.statistics?.activeFriends ?? 0}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#15803D]">
            <span className="text-xs">▲</span>
            <span>Mined in last 7d</span>
          </div>
        </GlassCard>

        {/* Inactive Friends */}
        <GlassCard interactive className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E5E36]">Inactive Friends</span>
            <div className="w-8 h-8 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center text-[#1E5E36]">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#0A341B]/70">
            {data?.statistics?.inactiveFriends ?? 0}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1E5E36]">
            <span className="text-xs">▼</span>
            <span>Needs a ping</span>
          </div>
        </GlassCard>

        {/* Total Balance */}
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
          <p className="text-[11px] font-bold text-[#1E5E36]">Verified ledger</p>
        </GlassCard>
      </div>

      {/* Prominent Referral Card: "Invite Friends and Earn GT" */}
      <GlassCard glow className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/15 text-[#15803D] text-xs font-bold border border-[#22C55E]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multiplied Rewards</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A341B] tracking-tight">
              Invite Friends and Earn GT
            </h2>
            <p className="text-xs sm:text-sm text-[#1E5E36]">
              Share your personal referral link or code. Both you and your friend earn GT bonuses!
            </p>
          </div>

          <button
            onClick={handleNativeShare}
            className="self-start md:self-auto px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_6px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_8px_25px_rgba(34,197,94,0.45)] transition-all flex items-center gap-2 transform active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Link</span>
          </button>
        </div>

        {/* Copy Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Referral Code Box */}
          <div className="p-4 rounded-2xl bg-white/70 border border-white/90 space-y-2 shadow-sm">
            <span className="text-xs font-bold text-[#1E5E36]">Your Unique Referral Code:</span>
            <div className="flex items-center justify-between gap-3 bg-white/90 p-2.5 rounded-xl border border-white">
              <span className="font-mono text-base font-black text-[#15803D] tracking-wider">
                {referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-lg bg-[#22C55E]/15 hover:bg-[#22C55E] text-xs font-bold text-[#15803D] hover:text-white transition-all flex items-center gap-1.5"
              >
                {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Referral Link Box */}
          <div className="p-4 rounded-2xl bg-white/70 border border-white/90 space-y-2 shadow-sm">
            <span className="text-xs font-bold text-[#1E5E36]">Shareable Invite Link:</span>
            <div className="flex items-center justify-between gap-3 bg-white/90 p-2.5 rounded-xl border border-white">
              <span className="text-xs font-mono text-[#0A341B] truncate max-w-[220px] sm:max-w-[280px]">
                {referralLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-lg bg-[#22C55E]/15 hover:bg-[#22C55E] text-xs font-bold text-[#15803D] hover:text-white transition-all flex items-center gap-1.5 shrink-0"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Social Platforms Row */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1E5E36]">
            One-Click Social Share:
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-[#25D366] text-[#15803D] hover:text-white border border-white/90 text-xs font-bold transition-all shadow-sm transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-white" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={shareTelegram}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-[#229ED9] text-[#15803D] hover:text-white border border-white/90 text-xs font-bold transition-all shadow-sm transform active:scale-95"
            >
              <Send className="w-4 h-4 text-[#229ED9] group-hover:text-white" />
              <span>Telegram</span>
            </button>

            <button
              onClick={shareTwitter}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-black text-[#0A341B] hover:text-white border border-white/90 text-xs font-bold transition-all shadow-sm transform active:scale-95"
            >
              <span className="font-mono font-bold">𝕏</span>
              <span>Twitter</span>
            </button>

            <button
              onClick={shareFacebook}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-[#1877F2] text-[#15803D] hover:text-white border border-white/90 text-xs font-bold transition-all shadow-sm transform active:scale-95"
            >
              <svg className="w-4 h-4 fill-[#1877F2] group-hover:fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span>Facebook</span>
            </button>

            <button
              onClick={() => setInstagramModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-[#E1306C] text-[#15803D] hover:text-white border border-white/90 text-xs font-bold transition-all shadow-sm transform active:scale-95"
            >
              <svg className="w-4 h-4 fill-[#E1306C] group-hover:fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <span>Instagram</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Instagram Sharing Instructions Modal */}
      {instagramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl space-y-4 bg-white/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E1306C]/15 flex items-center justify-center text-[#E1306C]">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A341B]">Share on Instagram</h3>
                <p className="text-xs text-[#1E5E36]">Story & Bio Link Guide</p>
              </div>
            </div>

            <p className="text-xs text-[#1E5E36] leading-relaxed">
              Instagram does not allow direct URL dispatch from websites. To invite friends:
            </p>
            <ol className="text-xs text-[#0A341B] space-y-2 list-decimal list-inside bg-white/80 p-3 rounded-2xl border border-white">
              <li>Your referral link is copied to your clipboard.</li>
              <li>Paste it into your Instagram Story as a <strong>Link Sticker</strong>.</li>
              <li>Add it to your Instagram bio for instant signups!</li>
            </ol>

            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                showToast('Referral link copied!', 'success');
                setInstagramModal(false);
              }}
              className="w-full py-2.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-md"
            >
              Copy Link & Done
            </button>
          </div>
        </div>
      )}

      {/* Two Column Grid: Mining Preview + Referral History Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mining Status Preview Card */}
        <GlassCard className="space-y-4 flex flex-col justify-between">
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
              Next reward: <strong className="text-[#15803D] font-bold">+1.0 GT</strong> per 4-hour cycle. Verified by UTC timestamp.
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

        {/* Referral History Preview Card */}
        <GlassCard className="space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#0A341B] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#16A34A]" />
              <span>Recent Referral Activity</span>
            </h3>
            <Link to="/referrals" className="text-xs text-[#15803D] hover:underline flex items-center gap-1 font-bold">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 overflow-hidden">
            {(!data?.referralData?.recentReferrals || data.referralData.recentReferrals.length === 0) ? (
              <div className="py-8 text-center space-y-2 bg-white/40 rounded-2xl border border-white/60">
                <Users className="w-8 h-8 text-[#1E5E36]/40 mx-auto" />
                <p className="text-xs font-bold text-[#0A341B]">No friends registered yet.</p>
                <p className="text-[11px] text-[#1E5E36]">Share your invite link above to get started!</p>
              </div>
            ) : (
              data.referralData.recentReferrals.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white/70 border border-white/90 flex items-center justify-between text-xs shadow-sm"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#0A341B]">{item.friendName}</p>
                    <p className="text-[11px] text-[#1E5E36]">
                      Joined: {new Date(item.registeredAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.isActive
                        ? 'bg-[#22C55E]/15 text-[#15803D] border border-[#22C55E]/30'
                        : 'bg-black/5 text-[#1E5E36] border border-black/10'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>

                    <span className="font-mono font-bold text-[#15803D]">
                      +{item.rewardAmount} GT
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/referrals"
            className="w-full py-2.5 rounded-2xl font-bold text-xs text-[#15803D] bg-white/80 border border-white/90 hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Manage Referral Circle</span>
          </Link>
        </GlassCard>
      </div>

      {/* Latest Community Updates Preview */}
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
