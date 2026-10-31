import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  Loader2,
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
    <div className="space-y-6 max-w-xl mx-auto px-1 sm:px-0">

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
            className="h-12 rounded-[18px] bg-white border border-neutral-200/80 shadow-xs hover:bg-neutral-50 active:scale-95 flex items-center justify-center transition-all"
            aria-label="Share on WhatsApp"
          >
            <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
              <path
                fill="#25D366"
                d="M16 2C8.28 2 2 8.28 2 16c0 2.65.74 5.13 2.03 7.25L2.3 29.7l6.63-1.71A13.9 13.9 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2z"
              />
              <path
                fill="#FFFFFF"
                d="M23.1 19.34c-.39-.2-2.31-1.14-2.67-1.27-.36-.13-.62-.2-.88.2s-1.01 1.27-1.24 1.53-.46.3-.85.1a10.66 10.66 0 01-3.15-1.95 11.75 11.75 0 01-2.18-2.72c-.23-.39-.02-.6.17-.8.18-.18.39-.46.59-.69.2-.23.26-.39.39-.65.13-.26.07-.49-.03-.69s-.88-2.12-1.21-2.91c-.32-.76-.64-.66-.88-.67-.23-.01-.49-.02-.75-.02s-.69.1-1.05.49c-.36.39-1.37 1.34-1.37 3.27s1.4 3.8 1.6 4.06c.2.26 2.76 4.21 6.69 5.91.93.4 1.66.64 2.23.82.94.3 1.8.26 2.47.16.76-.11 2.31-.94 2.64-1.85.33-.91.33-1.69.23-1.85-.1-.16-.36-.26-.75-.46z"
              />
            </svg>
          </button>

          {/* Telegram */}
          <button
            onClick={shareTelegram}
            className="h-12 rounded-[18px] bg-white border border-neutral-200/80 shadow-xs hover:bg-neutral-50 active:scale-95 flex items-center justify-center transition-all"
            aria-label="Share on Telegram"
          >
            <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#229ED9" />
              <path
                fill="#FFFFFF"
                d="M23.07 9.42L6.87 15.67c-1.1.44-1.09 1.06-.2 1.33l4.16 1.3 9.63-6.08c.45-.28.87-.13.53.18l-7.81 7.05-.3 4.29c.42 0 .61-.19.85-.42l2.04-1.98 4.24 3.13c.78.43 1.34.21 1.54-.72l2.78-13.11c.29-1.14-.43-1.66-1.46-1.22z"
              />
            </svg>
          </button>

          {/* Twitter / 𝕏 */}
          <button
            onClick={shareTwitter}
            className="h-12 rounded-[18px] bg-white border border-neutral-200/80 shadow-xs hover:bg-neutral-50 active:scale-95 flex items-center justify-center transition-all"
            aria-label="Share on Twitter"
          >
            <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>

          {/* Instagram */}
          <button
            onClick={() => setInstagramModal(true)}
            className="h-12 rounded-[18px] bg-white border border-neutral-200/80 shadow-xs hover:bg-neutral-50 active:scale-95 flex items-center justify-center transition-all"
            aria-label="Share on Instagram"
          >
            <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
              <defs>
                <radialGradient id="igRadGrad" cx="30%" cy="105%" r="120%">
                  <stop offset="0%" stopColor="#fdf497" />
                  <stop offset="10%" stopColor="#fdf497" />
                  <stop offset="35%" stopColor="#fd5949" />
                  <stop offset="60%" stopColor="#d6249f" />
                  <stop offset="100%" stopColor="#285AEB" />
                </radialGradient>
              </defs>
              <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#igRadGrad)" />
              <circle cx="16" cy="16" r="6" stroke="#FFFFFF" strokeWidth="2.2" />
              <circle cx="22.5" cy="9.5" r="1.5" fill="#FFFFFF" />
            </svg>
          </button>

          {/* Share */}
          <button
            onClick={handleNativeShare}
            className="h-12 rounded-[18px] bg-white border border-neutral-200/80 shadow-xs hover:bg-neutral-50 active:scale-95 flex items-center justify-center transition-all"
            aria-label="Share Referral Link"
          >
            <Share2 className="w-5 h-5 text-neutral-800 stroke-[2.2]" />
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
              <span className="text-2xl font-black text-[#0A341B] font-mono whitespace-nowrap">
                {claimableAmount.toFixed(2)} <span className="text-sm font-bold text-neutral-600">GT</span>
              </span>

              {/* Claim Button with Rotating Line Animation */}
              <div className="relative p-[2px] rounded-full overflow-hidden inline-flex items-center justify-center shrink-0 shadow-md shadow-[#22C55E]/20">
                {/* Rotating line / border beam */}
                <span
                  className="absolute inset-[-150%] animate-[border-beam-spin_2.5s_linear_infinite] pointer-events-none"
                  style={{
                    background:
                      'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(34,197,94,0.3) 300deg, #22C55E 335deg, #86EFAC 352deg, #FFFFFF 360deg)',
                  }}
                />
                {/* Neon blur glow layer */}
                <span
                  className="absolute inset-[-150%] animate-[border-beam-spin_2.5s_linear_infinite] blur-[3px] pointer-events-none"
                  style={{
                    background:
                      'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 290deg, #22C55E 340deg, #86EFAC 355deg, #FFFFFF 360deg)',
                  }}
                />
                <button
                  onClick={handleClaimCommission}
                  disabled={isClaiming || claimableAmount <= 0}
                  className="relative z-10 px-4 py-2 rounded-full bg-[#0A341B] hover:bg-[#15803D] active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-inner"
                  aria-label="Claim commission"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Claiming</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#86EFAC] animate-pulse" />
                      <span>Claim</span>
                    </>
                  )}
                </button>
              </div>
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
              <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                <defs>
                  <radialGradient id="igModalGrad" cx="30%" cy="105%" r="120%">
                    <stop offset="0%" stopColor="#fdf497" />
                    <stop offset="10%" stopColor="#fdf497" />
                    <stop offset="35%" stopColor="#fd5949" />
                    <stop offset="60%" stopColor="#d6249f" />
                    <stop offset="100%" stopColor="#285AEB" />
                  </radialGradient>
                </defs>
                <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#igModalGrad)" />
                <circle cx="16" cy="16" r="6" stroke="#FFFFFF" strokeWidth="2.2" />
                <circle cx="22.5" cy="9.5" r="1.5" fill="#FFFFFF" />
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
