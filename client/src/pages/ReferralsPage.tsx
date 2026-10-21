import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  ArrowRight,
  Coins,
  Info,
  ChevronRight,
  Link2,
  MessageCircle,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ReferralFriendRecord {
  id: string;
  name: string;
  initials: string;
  maskedId: string;
  date: string;
  earnedGT: string;
  isActive: boolean;
}

const defaultFriendsList: ReferralFriendRecord[] = [
  {
    id: 'f1',
    name: 'Arjun Reddy',
    initials: 'AR',
    maskedId: 'GT-90****12',
    date: 'Mar 12',
    earnedGT: '+10.00 GT',
    isActive: true,
  },
  {
    id: 'f2',
    name: 'Priya Sharma',
    initials: 'PS',
    maskedId: 'GT-44****89',
    date: 'Mar 10',
    earnedGT: '+5.00 GT',
    isActive: true,
  },
  {
    id: 'f3',
    name: 'Rahul Kumar',
    initials: 'RK',
    maskedId: 'GT-12****43',
    date: 'Feb 28',
    earnedGT: '0.00 GT',
    isActive: false,
  },
  {
    id: 'f4',
    name: 'Elena Rostova',
    initials: 'ER',
    maskedId: 'GT-77****91',
    date: 'Feb 24',
    earnedGT: '+34.50 GT',
    isActive: true,
  },
];

const dividendSlides = [
  {
    tag: 'PROTOCOL DIVIDEND',
    title: 'Autonomous 10% Yield Accrual',
    desc: 'Instant smart ledger execution with zero platform transaction...',
  },
  {
    tag: 'TIER MULTIPLIER',
    title: 'Secondary Node Expansion',
    desc: 'Deep multi-tier connectivity distributing block rewards continuously.',
  },
  {
    tag: 'CONSENSUS BENEFIT',
    title: 'Zero Latency Distribution',
    desc: 'Earn pro-rata commissions each time peer nodes finalize 4-hour mining cycles.',
  },
];

export const ReferralsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeSlide, setActiveSlide] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [instagramModal, setInstagramModal] = useState(false);

  // Commission claim state
  const [claimableAmount, setClaimableAmount] = useState<number>(42.8);
  const [claimedAmount, setClaimedAmount] = useState<number>(225.7);
  const [totalEarned, setTotalEarned] = useState<number>(268.5);
  const [isClaiming, setIsClaiming] = useState(false);

  // Auto-cycle top dividend slides every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % dividendSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const referralCode = user?.referralCode || 'GT-VIP-779';
  const referralLink = `https://gtnetwork.app/invite/${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    showToast(`Referral code ${referralCode} copied!`, 'success');
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleClaimCommission = () => {
    if (claimableAmount <= 0) {
      showToast('No commission currently pending to claim.', 'info');
      return;
    }
    setIsClaiming(true);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22C55E', '#16A34A', '#FACC15', '#15803D'],
      });
    } catch (e) {
      // Confetti fallback
    }

    setTimeout(() => {
      setClaimedAmount((prev) => +(prev + claimableAmount).toFixed(2));
      showToast(`Successfully claimed +${claimableAmount.toFixed(2)} GT to wallet!`, 'success');
      setClaimableAmount(0);
      setIsClaiming(false);
    }, 400);
  };

  const shareText = encodeURIComponent(
    `⛏️ Join me on GT Mining! Mine virtual GT coins every 4 hours. Use referral code: ${referralCode} ${referralLink}`
  );

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
        `⛏️ Join me on GT Mining! Code: ${referralCode}`
      )}`,
      '_blank'
    );
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${shareText}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GT Mining Network',
          text: `Mine virtual GT coins every 4 hours! Code: ${referralCode}`,
          url: referralLink,
        });
      } catch (e) {
        // Share dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-xl mx-auto px-1 sm:px-0">

      {/* 1. TOP PROTOCOL DIVIDEND CAROUSEL BANNER */}
      <div className="relative overflow-hidden rounded-[26px] p-5 sm:p-6 bg-gradient-to-br from-[#E8F8EE] via-[#F4FBF6] to-white border border-white/90 shadow-[0_8px_25px_rgba(34,197,94,0.08)]">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <span>{dividendSlides[activeSlide].tag}</span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {dividendSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  activeSlide === idx
                    ? 'w-5 h-1.5 bg-[#15803D]'
                    : 'w-1.5 h-1.5 bg-black/20 hover:bg-black/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-3.5 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#0A341B] tracking-tight">
            {dividendSlides[activeSlide].title}
          </h2>
          <p className="text-xs sm:text-sm text-[#1E5E36] font-medium leading-relaxed">
            {dividendSlides[activeSlide].desc}
          </p>
        </div>
      </div>

      {/* 2. GROW YOUR NETWORK & 2x2 STATS GRID */}
      <div className="space-y-3">
        <div className="px-1">
          <h1 className="text-2xl font-black text-[#0A341B] tracking-tight">
            Grow Your Network
          </h1>
          <p className="text-xs text-[#15803D] font-medium">
            Your network. Your rewards.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 1: TOTAL REFERRALS */}
          <div className="rounded-[24px] p-5 bg-white border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#15803D]">
              <span>TOTAL REFERRALS</span>
              <Users className="w-4 h-4 text-[#15803D]" />
            </div>
            <div className="text-3xl font-black text-[#0A341B] tracking-tight">
              28
            </div>
            <div className="text-xs text-[#15803D] font-medium">
              Registered peer nodes
            </div>
          </div>

          {/* Card 2: ACTIVE FRIENDS */}
          <div className="rounded-[24px] p-5 bg-white border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#15803D]">
              <span>ACTIVE FRIENDS</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
            </div>
            <div className="text-3xl font-black text-[#0A341B] tracking-tight">
              22
            </div>
            <div className="text-xs text-[#15803D] font-medium">
              Confirmed mining cycle
            </div>
          </div>

          {/* Card 3: INACTIVE FRIENDS */}
          <div className="rounded-[24px] p-5 bg-white border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#15803D]">
              <span>INACTIVE FRIENDS</span>
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
            </div>
            <div className="text-3xl font-black text-[#0A341B] tracking-tight">
              6
            </div>
            <div className="text-xs text-[#15803D] font-medium">
              Standby allocation
            </div>
          </div>

          {/* Card 4: TOTAL GT EARNED */}
          <div className="rounded-[24px] p-5 bg-white border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#15803D]">
              <span>TOTAL GT EARNED</span>
              <Coins className="w-4 h-4 text-[#15803D]" />
            </div>
            <div className="text-3xl font-black text-[#0A341B] tracking-tight">
              324.50
            </div>
            <div className="text-xs text-[#15803D] font-medium">
              Accumulated net yield
            </div>
          </div>
        </div>
      </div>

      {/* 3. PERSONAL CONNECTION TOKEN */}
      <div className="rounded-[24px] p-5 bg-white border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black tracking-wider uppercase text-[#0A341B]">
            PERSONAL CONNECTION TOKEN
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/15">
            Cryptographic ID
          </span>
        </div>

        {/* Link Box */}
        <div className="p-2 sm:p-2.5 rounded-2xl bg-[#F0FAF3] border border-[#DCF2E4] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 pl-2 overflow-hidden">
            <Link2 className="w-4 h-4 text-[#15803D] shrink-0" />
            <span className="font-mono text-xs text-[#0A341B] truncate select-all">
              {referralLink}
            </span>
          </div>
          <button
            onClick={handleCopyLink}
            className="w-9 h-9 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200/80 shadow-xs flex items-center justify-center text-neutral-700 transition-all shrink-0 active:scale-95"
            aria-label="Copy Referral Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#15803D]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Code Row */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 font-medium">Referral Code:</span>
            <span className="font-mono font-black text-[#0A341B] tracking-wide">
              {referralCode}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="font-bold text-[#15803D] hover:underline flex items-center gap-0.5"
          >
            <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. DIRECT TRANSMISSION (SOCIAL SHARING - CLEAN ICONS ONLY, NO NAMES, NO COLORS) */}
      <div className="space-y-2.5 px-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black tracking-wider uppercase text-[#0A341B]">
            DIRECT TRANSMISSION
          </span>
          <span className="text-[10px] font-bold text-[#15803D]">
            Verified Endpoints
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2.5">
          {/* WhatsApp */}
          <button
            onClick={shareWhatsApp}
            className="h-12 rounded-[18px] bg-white border border-neutral-200/80 shadow-xs hover:bg-neutral-50 active:scale-95 flex items-center justify-center text-neutral-800 transition-all"
            aria-label="Share on WhatsApp"
          >
            <MessageCircle className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Telegram */}
          <button
            onClick={shareTelegram}
            className="h-12 rounded-[18px] bg-white border border-neutral-200/80 shadow-xs hover:bg-neutral-50 active:scale-95 flex items-center justify-center text-neutral-800 transition-all"
            aria-label="Share on Telegram"
          >
            <Send className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Twitter / 𝕏 */}
          <button
            onClick={shareTwitter}
            className="h-12 rounded-[18px] bg-white border border-neutral-200/80 shadow-xs hover:bg-neutral-50 active:scale-95 flex items-center justify-center text-neutral-800 transition-all"
            aria-label="Share on Twitter"
          >
            <span className="font-mono font-black text-base leading-none">𝕏</span>
          </button>

          {/* Instagram */}
          <button
            onClick={() => setInstagramModal(true)}
            className="h-12 rounded-[18px] bg-white border border-neutral-200/80 shadow-xs hover:bg-neutral-50 active:scale-95 flex items-center justify-center text-neutral-800 transition-all"
            aria-label="Share on Instagram"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </button>

          {/* Share */}
          <button
            onClick={handleNativeShare}
            className="h-12 rounded-[18px] bg-white border border-neutral-200/80 shadow-xs hover:bg-neutral-50 active:scale-95 flex items-center justify-center text-neutral-800 transition-all"
            aria-label="Share Referral Link"
          >
            <Share2 className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* 5. PROTOCOL DIVIDEND - REWARDS & COMMISSION CARD */}
      <div className="rounded-[26px] p-5 sm:p-6 bg-white border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20">
              PROTOCOL DIVIDEND
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8EE] text-[#15803D] border border-[#22C55E]/30">
              10% Mining Pro-Rata
            </span>
          </div>
          <h3 className="text-xl font-black text-[#0A341B] pt-1">
            Rewards & Commission
          </h3>
        </div>

        {/* Rows */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-black/5">
            <span className="text-neutral-500 font-medium">Invited Verified Peer</span>
            <span className="font-bold text-[#0A341B]">+2.00 GT per node</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-black/5">
            <span className="text-neutral-500 font-medium">Mining Yield Ratio</span>
            <span className="font-bold text-[#15803D]">10% Confirmed Output</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-black/5">
            <span className="text-neutral-500 font-medium">Total Commission Earned</span>
            <span className="font-black text-[#0A341B] font-mono">+{totalEarned.toFixed(2)} GT</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-500 font-medium">Total Commission Claimed</span>
            <span className="font-bold text-neutral-600 font-mono">{claimedAmount.toFixed(2)} GT</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-black/10 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-[#0A341B]">Available to Claim</div>
              <div className="text-[11px] text-[#15803D] font-medium">
                Cryptographic proof ready
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-[#0A341B] font-mono">
                {claimableAmount.toFixed(2)} <span className="text-sm font-bold text-neutral-600">GT</span>
              </span>
              <button
                onClick={handleClaimCommission}
                disabled={isClaiming || claimableAmount <= 0}
                className="w-10 h-10 rounded-full bg-[#0A341B] hover:bg-[#15803D] active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center transition-all shadow-md"
                aria-label="Claim commission"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Protocol Rule Callout */}
        <div className="p-3.5 rounded-2xl bg-[#F0FAF3] border border-[#DCF2E4] flex items-start gap-2.5 text-xs text-[#1E5E36] font-medium leading-relaxed">
          <Info className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
          <span>
            <strong>Protocol Rule:</strong> "If your referred friend mines 100 GT, you earn 10 GT in commission."
          </span>
        </div>
      </div>

      {/* 6. REFERRAL FRIENDS (SCREENSHOT 4) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0A341B]">
              REFERRAL FRIENDS
            </h3>
            <p className="text-[11px] text-[#15803D] font-medium">
              Live on-chain records
            </p>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-bold text-[#15803D] bg-white border border-[#22C55E]/30 shadow-xs">
            Showing 4 of 28
          </div>
        </div>

        {/* Friend Cards List */}
        <div className="space-y-2.5">
          {defaultFriendsList.map((friend) => (
            <div
              key={friend.id}
              className="p-4 rounded-2xl bg-white border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all hover:bg-neutral-50/50"
            >
              {/* Left Side: Avatar + Details */}
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-neutral-100 border border-neutral-200/70 flex items-center justify-center text-xs font-black text-neutral-700 shrink-0">
                  {friend.initials}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0A341B]">
                    {friend.name}
                  </h4>
                  <p className="text-xs text-neutral-400 font-mono tracking-tight">
                    {friend.maskedId} • {friend.date}
                  </p>
                </div>
              </div>

              {/* Right Side: Amount + Status */}
              <div className="text-right space-y-0.5">
                <div
                  className={`text-sm font-black font-mono ${
                    friend.isActive ? 'text-[#0A341B]' : 'text-neutral-400'
                  }`}
                >
                  {friend.earnedGT}
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      friend.isActive ? 'bg-[#22C55E]' : 'bg-neutral-300'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-black tracking-wider uppercase ${
                      friend.isActive ? 'text-[#15803D]' : 'text-neutral-400'
                    }`}
                  >
                    {friend.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram Story Share Modal */}
      {instagramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white p-6 rounded-3xl space-y-4 border border-neutral-200 shadow-2xl">
            <h3 className="text-base font-black text-[#0A341B] flex items-center gap-2">
              <svg className="w-5 h-5 fill-current text-neutral-800" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.449-1.44z"/>
              </svg>
              <span>Share to Instagram</span>
            </h3>
            <p className="text-xs text-[#1E5E36] leading-relaxed">
              Copy your referral link and paste it as a Link Sticker on your Instagram Story or in your bio!
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                showToast('Referral link copied!', 'success');
                setInstagramModal(false);
              }}
              className="w-full py-2.5 rounded-2xl font-black text-xs bg-[#0A341B] hover:bg-[#15803D] text-white shadow-md active:scale-95 transition-transform"
            >
              Copy Link & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
