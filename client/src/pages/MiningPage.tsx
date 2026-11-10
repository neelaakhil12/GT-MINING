import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Pickaxe,
  Play,
  Clock,
  Coins,
  RefreshCw,
  Lock,
  X,
  UserPlus,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { MiningStatus, MiningClaim } from '../types';
import { GtCoin } from '../components/GtCoin';
import { GtLogo } from '../components/GtLogo';
import { GlassCard } from '../components/GlassCard';
import { MiningGlobe3D } from '../components/MiningGlobe3D';

export const MiningPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, updateWalletBalance } = useAuth();
  const { showToast } = useToast();

  const [status, setStatus] = useState<MiningStatus | null>(() => {
    try {
      const cached = localStorage.getItem('gt_cached_mining_status');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });
  const [history, setHistory] = useState<MiningClaim[]>(() => {
    try {
      const cached = localStorage.getItem('gt_cached_mining_history');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('gt_cached_mining_status');
  });
  const [claiming, setClaiming] = useState(false);
  const [countdown, setCountdown] = useState<string>('00:00:00');
  const [showTargetModal, setShowTargetModal] = useState<boolean>(false);
  const [isEligible, setIsEligible] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('gt_cached_mining_status');
      if (cached) {
        const parsed = JSON.parse(cached);
        return Boolean(parsed.isEligible);
      }
    } catch {}
    return false;
  });
  const [isFastSpinning, setIsFastSpinning] = useState<boolean>(false);
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMiningData();
  }, []);

  const fetchMiningData = async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        api.getMiningStatus(),
        api.getMiningHistory(),
      ]);

      if (statusRes.success) {
        setStatus(statusRes);
        setIsEligible(statusRes.isTargetReached ? false : statusRes.isEligible);
        updateWalletBalance(statusRes.availableBalance, statusRes.lifetimeEarned);
        try {
          localStorage.setItem('gt_cached_mining_status', JSON.stringify(statusRes));
        } catch {}
        if (statusRes.cooldownSeconds) {
          const hours = Math.max(1, Math.round(Number(statusRes.cooldownSeconds) / 3600));
          localStorage.setItem('gt_mining_cycle_hours', String(hours));
          window.dispatchEvent(new Event('gt_mining_cycle_changed'));
        }
      }

      if (historyRes.success) {
        setHistory(historyRes.claims || []);
        try {
          localStorage.setItem('gt_cached_mining_history', JSON.stringify(historyRes.claims || []));
        } catch {}
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to sync mining node data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!status?.nextEligibleAt) {
      if (status?.isEligible) {
        setCountdown('00:00:00');
        setIsEligible(true);
      }
      return;
    }

    const targetMs = new Date(status.nextEligibleAt).getTime();

    const updateTimer = () => {
      const nowMs = Date.now();
      const diffMs = targetMs - nowMs;

      if (diffMs <= 0) {
        setCountdown('00:00:00');
        setIsEligible(true);
        api.getMiningStatus()
          .then(res => {
            if (res.success) {
              setStatus(res);
              setIsEligible(res.isEligible);
            }
          })
          .catch(() => {});
      } else {
        setIsEligible(false);
        const totalSec = Math.floor(diffMs / 1000);
        const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        setCountdown(`${h}:${m}:${s}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [status?.nextEligibleAt]);

  const userMiningTarget = Number(status?.userMiningTarget || 1000);
  const userTotalMined = Number(wallet?.lifetimeEarned ?? status?.lifetimeEarned ?? 0);
  const isTargetCompleted = Boolean(status?.isTargetReached || (userTotalMined >= userMiningTarget));

  const handleClaim = async () => {
    if (claiming) return;

    if (isTargetCompleted) {
      setShowTargetModal(true);
      return;
    }

    if (!isEligible) {
      showToast(`Mining cooldown active: ${countdown} remaining`, 'info');
      return;
    }

    // Smoothly scroll to top so the 3D spinning globe is prominently displayed
    if (globeRef.current) {
      globeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setIsFastSpinning(true);
    setClaiming(true);

    try {
      // 1. Authoritative API claim call
      const res = await api.claimMiningReward();
      if (!res || !res.success) {
        throw new Error(res?.message || 'Mining claim failed');
      }

      // 2. Play fast coin rotations (2.2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2200));

      const rewardAmount = res.rewardAmount ?? status?.rewardPerClaim ?? 1.0;
      const currentBal = wallet?.availableBalance ?? status?.availableBalance ?? 0.0;
      const currentLife = wallet?.lifetimeEarned ?? status?.lifetimeEarned ?? 0.0;
      const newBal = Number((currentBal + rewardAmount).toFixed(4));
      const newLife = Number((currentLife + rewardAmount).toFixed(4));

      // Burst celebratory confetti
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#22C55E', '#86EFAC', '#4ADE80', '#16A34A', '#FFFFFF'],
      });

      showToast(`+${rewardAmount} GT mined successfully!`, 'success');

      updateWalletBalance(newBal, newLife);
      const targetReachedNow = Boolean(res.isTargetReached || res.targetReached || newLife >= userMiningTarget);
      setIsEligible(targetReachedNow ? false : false);
      if (targetReachedNow) {
        setShowTargetModal(true);
      }
      setStatus(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isEligible: false,
          isTargetReached: targetReachedNow,
          nextEligibleAt: res.nextEligibleAt || new Date(Date.now() + (prev.cooldownSeconds || 14400) * 1000).toISOString(),
          lastMiningAt: new Date().toISOString(),
          availableBalance: newBal,
          lifetimeEarned: newLife,
        };
      });

      const newClaim: MiningClaim = {
        id: res.transaction?.referenceId || `claim_${Date.now()}`,
        userId: 'current',
        rewardAmount,
        claimedAt: new Date().toISOString(),
        nextEligibleAt: res.nextEligibleAt || new Date(Date.now() + (status?.cooldownSeconds || 14400) * 1000).toISOString(),
        transactionId: res.transaction?.id || `tx_${Date.now()}`,
        status: 'SUCCESS',
      };
      setHistory(prev => [newClaim, ...prev]);
    } catch (err: any) {
      if (err.targetReached || err.message?.includes('target is completed') || err.message?.includes('Target Completed')) {
        setShowTargetModal(true);
      } else {
        showToast(err.message || 'Failed to claim mining reward', 'error');
      }
    } finally {
      setIsFastSpinning(false);
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-96 rounded-3xl bg-white/40 border border-white/60" />
        <div className="h-64 rounded-3xl bg-white/40 border border-white/60" />
      </div>
    );
  }

  const cycleSeconds = Number(status?.cooldownSeconds || 14400);
  const cycleHours = Math.max(1, Math.round(cycleSeconds / 3600));
  const rewardAmount = Number(status?.rewardPerClaim ?? 1.0);
  const cycleTotalMs = cycleSeconds * 1000;
  const diffMs = status?.nextEligibleAt ? Math.max(0, new Date(status.nextEligibleAt).getTime() - Date.now()) : 0;
  const progressPct = isEligible ? 100 : Math.min(100, Math.max(0, ((cycleTotalMs - diffMs) / cycleTotalMs) * 100));

  const sessionStartedTime = status?.lastMiningAt 
    ? new Date(status.lastMiningAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : '05:16:58 PM';

  const estimatedSettlementTime = status?.nextEligibleAt
    ? new Date(status.nextEligibleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : '09:16:58 PM';

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto select-none">
      
      {/* 1. Header Bar: GT NETWORK / ECO LAYER-2 */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="font-black text-sm tracking-wider text-[#0A341B]">GT NETWORK</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#15803D] text-[11px] font-bold tracking-wider">
          ECO LAYER-2
        </div>
      </div>

      {/* 2. Globe Centerpiece Card (No button inside, clean 3D globe with glassy badges) */}
      <div
        ref={globeRef}
        className="relative rounded-[28px] overflow-hidden bg-white/70 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_rgba(22,101,52,0.06)] p-3.5 sm:p-5 scroll-mt-4"
      >
        {/* Top Badges in Glassy Mode - Translucent so animation flows underneath */}
        <div className="flex items-center justify-between w-full relative z-20 px-0.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-[10px] sm:text-[11px] font-bold text-[#0A341B] shadow-[0_2px_8px_rgba(0,0,0,0.03)] whitespace-nowrap">
            <span className={`w-2 h-2 rounded-full ${isEligible ? 'bg-amber-400' : 'bg-[#10B981]'} shadow-[0_0_8px_rgba(16,185,129,0.7)] shrink-0`} />
            <span>{isEligible ? 'Claim Ready' : 'Mining Active'}</span>
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-[10px] sm:text-[11px] font-bold text-[#15803D] shadow-[0_2px_8px_rgba(0,0,0,0.03)] whitespace-nowrap">
            <span>Rate: +{rewardAmount.toFixed(2)} GT / {cycleHours}h</span>
          </div>
        </div>

        {/* 3D Segmented Mint-Green Cube Globe */}
        <div
          className={`-mt-2 sm:-mt-3 flex justify-center relative z-10 ${isEligible ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={isEligible ? handleClaim : () => showToast(`Mining active. Cooldown remaining: ${countdown}`, 'info')}
        >
          <div className="relative w-full max-w-[280px] sm:max-w-[340px]">
            <MiningGlobe3D spinning={isFastSpinning} />
          </div>
        </div>
      </div>

      {/* 3. TOTAL GT BALANCE Card matching reference screenshot */}
      <div className="rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_rgba(22,101,52,0.06)] p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#1E5E36] tracking-wider uppercase font-black text-[11px]">TOTAL GT BALANCE</span>
          <span className="text-[#16A34A] font-semibold text-xs">Confirmed</span>
        </div>

        <div className="text-3xl sm:text-4xl font-black text-[#0A341B] tracking-tight">
          {(wallet?.availableBalance ?? status?.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="text-[#15803D] text-lg sm:text-xl font-bold ml-1.5">GT</span>
        </div>

        <div className="border-b border-black/5 pt-1" />

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <span className="text-xs text-[#1E5E36] font-medium block">Available Balance</span>
            <span className="text-sm sm:text-base font-black text-[#0A341B] block mt-0.5">
              {(wallet?.availableBalance ?? status?.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GT
            </span>
          </div>
          <div>
            <span className="text-xs text-[#1E5E36] font-medium block">Mining Rewards Earned</span>
            <span className="text-sm sm:text-base font-black text-[#15803D] block mt-0.5">
              +{(wallet?.lifetimeEarned ?? status?.lifetimeEarned ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GT
            </span>
          </div>
        </div>

        {/* Account Mining Target Cap Progress */}
        <div className="pt-2 border-t border-black/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#1E5E36] flex items-center gap-1.5 text-[11px]">
              <Target className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>ACCOUNT MINING TARGET</span>
            </span>
            <span className={`text-[11px] font-mono ${isTargetCompleted ? 'text-[#F59E0B] font-black' : 'text-[#15803D]'}`}>
              {userTotalMined.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / {userMiningTarget.toLocaleString()} GT
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isTargetCompleted
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]'
                  : 'bg-gradient-to-r from-[#22C55E] to-[#16A34A]'
              }`}
              style={{ width: `${Math.min(100, (userTotalMined / userMiningTarget) * 100)}%` }}
            />
          </div>
          {isTargetCompleted && (
            <p className="text-[11px] text-[#D97706] font-bold text-center pt-0.5">
              Target limit reached ({userMiningTarget.toLocaleString()} GT). Mining completed for this account.
            </p>
          )}
        </div>
      </div>

      {/* 4. MINING SESSION Card matching reference screenshot */}
      <div className="rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_rgba(22,101,52,0.06)] p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#0A341B] tracking-wider uppercase">MINING SESSION</span>
          <div className="px-3 py-1 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#15803D] font-mono font-black text-sm tracking-wider">
            {countdown}
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2.5 rounded-full bg-black/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Sub-stats row */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#1E5E36] font-medium">
            Progress <strong className="font-black text-[#0A341B]">{progressPct.toFixed(1)}%</strong>
          </span>
          <span className="text-[#15803D] font-bold">Cycle Reward +{rewardAmount.toFixed(2)} GT</span>
        </div>

        <div className="border-t border-dashed border-black/10 pt-2" />

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#1E5E36] tracking-wider uppercase block">SESSION STARTED</span>
            <span className="text-xs sm:text-sm font-black text-[#0A341B] block mt-0.5">
              {sessionStartedTime}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#1E5E36] tracking-wider uppercase block">ESTIMATED SETTLEMENT</span>
            <span className="text-xs sm:text-sm font-black text-[#0A341B] block mt-0.5">
              {estimatedSettlementTime}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Mining Action Button - Disabled during active session or target completion */}
      <div className="space-y-2 pt-1">
        {isTargetCompleted ? (
          <button
            type="button"
            onClick={() => setShowTargetModal(true)}
            className="w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all bg-gradient-to-r from-[#D97706]/20 to-[#B45309]/20 border-2 border-[#F59E0B] text-[#FBBF24] hover:bg-[#D97706]/30 active:scale-95 cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.25)]"
          >
            <Lock className="w-5 h-5 text-[#FBBF24]" />
            <span>Target Completed ({userTotalMined.toFixed(0)}/{userMiningTarget.toLocaleString()} GT)</span>
          </button>
        ) : (
          <button
            onClick={handleClaim}
            disabled={claiming || !isEligible}
            className={`w-full py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all ${
              isEligible
                ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-[0_8px_25px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_32px_rgba(34,197,94,0.6)] active:scale-95 cursor-pointer'
                : 'bg-[#0A341B]/10 border border-[#10B981]/25 text-[#1E5E36]/70 cursor-not-allowed opacity-80 shadow-none'
            }`}
          >
            {claiming ? (
              <>
                <Pickaxe className="w-4 h-4 animate-spin text-white" />
                <span>Mining Virtual Block...</span>
              </>
            ) : isEligible ? (
              <>
                <Pickaxe className="w-4 h-4 animate-bounce text-white" />
                <span>Activate {cycleHours}-Hour Mining (+{rewardAmount.toFixed(1)} GT)</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-[#1E5E36]" />
                <span>Mining Active ({countdown} Remaining)</span>
              </>
            )}
          </button>
        )}
        <p className="text-xs text-[#1E5E36] font-medium text-center">
          {isTargetCompleted
            ? `Target limit reached (${userTotalMined.toFixed(0)}/{userMiningTarget.toLocaleString()} GT). Tap above to view details.`
            : isEligible
            ? `Tap above to start your ${cycleHours}-hour mining session`
            : `Mining session in progress. Next claim unlock in ${countdown}`}
        </p>
      </div>

      {/* Target Completed Popup Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#06180E] border border-[#F59E0B]/40 p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setShowTargetModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#F59E0B] to-[#FDE68A] p-3.5 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] text-[#07130D]">
              <Lock className="w-8 h-8" />
            </div>

            {/* Title & Badge */}
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40">
                Target Limit Reached
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Mining Target Completed!
              </h3>
            </div>

            {/* Message Body */}
            <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/10 text-left">
              <p className="text-xs sm:text-sm text-[#A7C9B1] leading-relaxed">
                Your mining target is completed! You have reached your maximum lifetime mining limit of{' '}
                <strong className="text-[#FBBF24] font-black">{userMiningTarget.toLocaleString()} GT</strong>{' '}
                for this account.
              </p>
              <p className="text-xs text-[#86EFAC] leading-relaxed">
                To continue mining and claiming new rewards, please register again with a new email and new details.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowTargetModal(false);
                  navigate('/signup');
                }}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New Account</span>
              </button>

              <button
                onClick={() => setShowTargetModal(false)}
                className="w-full py-2.5 rounded-xl font-semibold text-xs text-[#A7C9B1] hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
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
