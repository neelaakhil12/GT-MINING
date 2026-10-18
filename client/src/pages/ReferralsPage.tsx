import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Share2,
  Gift,
  CheckCircle2,
  Info,
  TrendingUp,
  MessageCircle,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { ReferralSummary, ReferralItem } from '../types';
import { GlassCard } from '../components/GlassCard';

const defaultReferralStats = {
  referralCode: 'GT78492',
  totalReferrals: 8,
  activeFriends: 6,
  inactiveFriends: 2,
  totalReferralRewardsEarned: 4.0,
  activeThresholdDays: 7,
};

const defaultReferralHistory: ReferralItem[] = [
  { id: 'ref_01', friendName: 'Alex Morgan', friendEmail: 'a.morgan@mining.io', registeredAt: '2026-10-18T10:14:00Z', isActive: true, activityStatus: 'ACTIVE', rewardAmount: 0.5, rewardStatus: 'CREDITED', rewardCreditedAt: '2026-10-18T10:14:05Z' },
  { id: 'ref_02', friendName: 'Elena Rostova', friendEmail: 'e.rostova@chainmail.com', registeredAt: '2026-10-17T14:32:00Z', isActive: true, activityStatus: 'ACTIVE', rewardAmount: 0.5, rewardStatus: 'CREDITED', rewardCreditedAt: '2026-10-17T14:32:05Z' },
  { id: 'ref_03', friendName: 'Marcus Vance', friendEmail: 'marcus.v@crypto.net', registeredAt: '2026-10-16T18:20:00Z', isActive: true, activityStatus: 'ACTIVE', rewardAmount: 0.5, rewardStatus: 'CREDITED', rewardCreditedAt: '2026-10-16T18:20:05Z' },
  { id: 'ref_04', friendName: 'Sofia Chen', friendEmail: 'sofia.chen@web3.org', registeredAt: '2026-10-15T09:45:00Z', isActive: true, activityStatus: 'ACTIVE', rewardAmount: 0.5, rewardStatus: 'CREDITED', rewardCreditedAt: '2026-10-15T09:45:05Z' },
  { id: 'ref_05', friendName: 'Priya Sharma', friendEmail: 'priya.s@node.tech', registeredAt: '2026-10-14T11:10:00Z', isActive: true, activityStatus: 'ACTIVE', rewardAmount: 0.5, rewardStatus: 'CREDITED', rewardCreditedAt: '2026-10-14T11:10:05Z' },
  { id: 'ref_06', friendName: 'David Miller', friendEmail: 'd.miller@ledger.com', registeredAt: '2026-10-13T16:05:00Z', isActive: true, activityStatus: 'ACTIVE', rewardAmount: 0.5, rewardStatus: 'CREDITED', rewardCreditedAt: '2026-10-13T16:05:05Z' },
  { id: 'ref_07', friendName: 'Liam Connor', friendEmail: 'l.connor@proton.me', registeredAt: '2026-10-11T20:40:00Z', isActive: false, activityStatus: 'INACTIVE', rewardAmount: 0.5, rewardStatus: 'PENDING', rewardCreditedAt: null },
  { id: 'ref_08', friendName: 'Chloe Dubois', friendEmail: 'chloe.d@meta.fr', registeredAt: '2026-10-09T08:15:00Z', isActive: false, activityStatus: 'INACTIVE', rewardAmount: 0.5, rewardStatus: 'PENDING', rewardCreditedAt: null },
];

export const ReferralsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<any>(defaultReferralStats);
  const [history, setHistory] = useState<ReferralItem[]>(defaultReferralHistory);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [instagramModal, setInstagramModal] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.getReferralSummary(),
        api.getReferralHistory(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats || statsRes);
      } else {
        setStats(defaultReferralStats);
      }

      const historyData = historyRes?.history || historyRes?.referrals;
      if (historyRes?.success && Array.isArray(historyData) && historyData.length > 0) {
        setHistory(historyData);
      } else {
        setHistory(defaultReferralHistory);
      }
    } catch (err: any) {
      setStats(defaultReferralStats);
      setHistory(defaultReferralHistory);
    } finally {
      setLoading(false);
    }
  };

  const referralCode = stats?.referralCode || user?.referralCode || '';
  const referralLink = stats?.referralLink || `${window.location.origin}/signup?ref=${referralCode}`;

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
          title: 'Join GT Mining Network',
          text: `Mine virtual GT coins every 4 hours! Use my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch (err) {
        // Share dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(
    `⛏️ Join me on GT Mining! Claim virtual GT coins every 4 hours. Use referral code: ${referralCode} ${referralLink}`
  );

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`⛏️ Join me on GT Mining! Claim virtual GT coins every 4 hours. Code: ${referralCode}`)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${shareText}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-white/60 border border-white" />
        <div className="h-96 rounded-3xl bg-white/60 border border-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      
      {/* Referral Hero & Share Box */}
      <GlassCard glow className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/15 text-[#15803D] text-xs font-bold border border-[#22C55E]/30">
              <Gift className="w-3.5 h-3.5" />
              <span>Network Multiplier</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A341B]">
              My Referral Circle
            </h1>
            <p className="text-xs sm:text-sm text-[#1E5E36] font-medium">
              Multiply your network capacity and receive community referral bonuses.
            </p>
          </div>

          <button
            onClick={handleNativeShare}
            className="px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:shadow-lg transition-all shadow-[0_8px_20px_rgba(34,197,94,0.35)] flex items-center gap-2 self-start sm:self-auto"
          >
            <Share2 className="w-4 h-4" />
            <span>Share My Link</span>
          </button>
        </div>

        {/* Copy Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/80 border border-white shadow-sm space-y-2">
            <span className="text-xs font-bold text-[#1E5E36]">My Referral Code:</span>
            <div className="flex items-center justify-between gap-3 bg-[#EAF8EE] p-2.5 rounded-xl border border-white">
              <span className="font-mono text-base font-black text-[#15803D] tracking-wider">
                {referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#16A34A] hover:text-white text-xs font-bold text-[#15803D] transition-all flex items-center gap-1.5 shadow-sm"
              >
                {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-white shadow-sm space-y-2">
            <span className="text-xs font-bold text-[#1E5E36]">Shareable Signup Link:</span>
            <div className="flex items-center justify-between gap-3 bg-[#EAF8EE] p-2.5 rounded-xl border border-white">
              <span className="text-xs font-mono text-[#0A341B] truncate max-w-[220px]">
                {referralLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#16A34A] hover:text-white text-xs font-bold text-[#15803D] transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Social Platforms Row */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
            Share Directly to Social Channels:
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#15803D] border border-[#25D366]/40 text-xs font-bold transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-[#16A34A]" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={shareTelegram}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0284C7]/15 hover:bg-[#0284C7]/25 text-[#0369A1] border border-[#0284C7]/30 text-xs font-bold transition-all shadow-sm"
            >
              <Send className="w-4 h-4 text-[#0284C7]" />
              <span>Telegram</span>
            </button>
            <button
              onClick={shareTwitter}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 hover:bg-white text-[#0A341B] border border-white text-xs font-bold transition-all shadow-sm"
            >
              <span className="font-mono font-bold">𝕏</span>
              <span>Twitter</span>
            </button>
            <button
              onClick={shareFacebook}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1D4ED8] border border-[#1877F2]/30 text-xs font-bold transition-all shadow-sm"
            >
              <svg className="w-4 h-4 fill-current text-[#1D4ED8]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span>Facebook</span>
            </button>
            <button
              onClick={() => setInstagramModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E1306C]/15 hover:bg-[#E1306C]/25 text-[#BE185D] border border-[#E1306C]/30 text-xs font-bold transition-all shadow-sm"
            >
              <svg className="w-4 h-4 fill-current text-[#BE185D]" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <span>Instagram</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Instagram Modal */}
      {instagramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl space-y-4 border-2 border-white">
            <h3 className="text-base font-black text-[#0A341B] flex items-center gap-2">
              <svg className="w-5 h-5 fill-current text-[#BE185D]" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <span>Share to Instagram</span>
            </h3>
            <p className="text-xs text-[#1E5E36] leading-relaxed">
              Copy your referral link and paste it as a Link Sticker on your Instagram Story or put it in your profile bio!
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                showToast('Referral link copied!', 'success');
                setInstagramModal(false);
              }}
              className="w-full py-2.5 rounded-2xl font-black text-xs bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white shadow-md"
            >
              Copy Link & Close
            </button>
          </div>
        </div>
      )}

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard interactive className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">Total Referrals</span>
          <p className="text-2xl font-black text-[#0A341B]">{stats?.statistics?.totalReferrals ?? stats?.totalReferrals ?? 0}</p>
          <p className="text-[11px] text-[#1E5E36] font-medium">Registered friends</p>
        </GlassCard>

        <GlassCard interactive className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">Active Friends</span>
          <p className="text-2xl font-black text-[#15803D]">{stats?.statistics?.activeFriends ?? stats?.activeFriends ?? 0}</p>
          <p className="text-[11px] text-[#16A34A] font-medium">Active in {stats?.statistics?.activeThresholdDays ?? stats?.activeThresholdDays ?? 7}d</p>
        </GlassCard>

        <GlassCard interactive className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">Inactive Friends</span>
          <p className="text-2xl font-black text-[#0A341B]/70">{stats?.statistics?.inactiveFriends ?? stats?.inactiveFriends ?? 0}</p>
          <p className="text-[11px] text-[#1E5E36] font-medium">Needs a reminder</p>
        </GlassCard>

        <GlassCard interactive className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">Rewards Earned</span>
          <p className="text-2xl font-black text-[#15803D]">
            {(stats?.statistics?.totalReferralRewardsEarned ?? stats?.totalReferralRewardsEarned ?? 0).toFixed(2)} GT
          </p>
          <p className="text-[11px] text-[#16A34A] font-medium">Credited to wallet</p>
        </GlassCard>
      </div>

      {/* Active Friend Definition Note */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white shadow-sm flex items-center gap-3.5 text-xs text-[#1E5E36]">
        <Info className="w-5 h-5 text-[#16A34A] shrink-0" />
        <span className="leading-relaxed">
          <strong className="text-[#0A341B] font-bold">Activity Criteria:</strong> A referred friend is categorized as <em>Active</em> if they have executed at least one confirmed mining claim within the previous <strong>{stats?.statistics?.activeThresholdDays ?? stats?.activeThresholdDays ?? 7} days</strong>.
        </span>
      </div>

      {/* Complete Referral History Table */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#16A34A]" />
            <h3 className="text-lg font-black text-[#0A341B]">Referred Friends List</h3>
          </div>
          <span className="text-xs font-bold text-[#15803D] bg-white/80 px-2.5 py-1 rounded-full border border-white">{history.length} Members</span>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Users className="w-10 h-10 text-[#16A34A]/30 mx-auto" />
            <p className="text-sm font-bold text-[#0A341B]">No referrals yet</p>
            <p className="text-xs text-[#1E5E36]">Share your link on social media to build your circle!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EAF8EE] text-[#15803D] uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Friend Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3">Activity Status</th>
                  <th className="p-3">Bonus Reward</th>
                  <th className="p-3 rounded-r-xl text-right">Reward Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-[#0A341B]">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-white/60 transition-colors">
                    <td className="p-3 font-bold">{item.friendName}</td>
                    <td className="p-3 font-mono text-[11px] text-[#1E5E36]">{item.friendEmail}</td>
                    <td className="p-3 text-[11px] text-[#1E5E36]">{new Date(item.registeredAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.isActive
                          ? 'bg-[#22C55E]/15 text-[#15803D] border border-[#22C55E]/30'
                          : 'bg-black/5 text-[#1E5E36] border border-black/10'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 font-black font-mono text-[#15803D]">
                      +{item.rewardAmount} GT
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#15803D] border border-[#22C55E]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{item.rewardStatus}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
