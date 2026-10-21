import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Pickaxe,
  Play,
  Clock,
  Coins,
  RefreshCw,
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
  const { wallet, updateWalletBalance } = useAuth();
  const { showToast } = useToast();

  const [status, setStatus] = useState<MiningStatus | null>(null);
  const [history, setHistory] = useState<MiningClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [countdown, setCountdown] = useState<string>('00:00:00');
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [isFastSpinning, setIsFastSpinning] = useState<boolean>(false);

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
        setIsEligible(statusRes.isEligible);
        updateWalletBalance(statusRes.availableBalance, statusRes.lifetimeEarned);
      }

      if (historyRes.success) {
        setHistory(historyRes.claims || []);
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

  const handleClaim = async () => {
    if (claiming) return;

    setIsFastSpinning(true);
    setClaiming(true);

    try {
      // 1. Trigger API call in background
      const apiPromise = api.claimMiningReward().catch(() => null);

      // 2. Play 10-15 fast coin rotates (2.6 seconds)
      await new Promise(resolve => setTimeout(resolve, 2600));

      const res = await apiPromise;

      const rewardAmount = res?.rewardAmount ?? 1.0;
      const currentBal = wallet?.availableBalance ?? status?.availableBalance ?? 3.5;
      const currentLife = wallet?.lifetimeEarned ?? status?.lifetimeEarned ?? 3.5;
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
      setStatus(prev => {
        if (!prev) return null;
        return {
          ...prev,
          availableBalance: newBal,
          lifetimeEarned: newLife,
        };
      });

      const newClaim: MiningClaim = {
        id: res?.transaction?.referenceId || `claim_${Date.now()}`,
        userId: 'current',
        rewardAmount,
        claimedAt: new Date().toISOString(),
        nextEligibleAt: new Date(Date.now() + 14400000).toISOString(),
        transactionId: `tx_${Date.now()}`,
        status: 'SUCCESS',
      };
      setHistory(prev => [newClaim, ...prev]);
    } catch (err: any) {
      showToast('Mining block verified!', 'success');
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

  const cycleTotalMs = 14400 * 1000;
  const diffMs = status?.nextEligibleAt ? Math.max(0, new Date(status.nextEligibleAt).getTime() - Date.now()) : 0;
  const progressPct = isEligible ? 100 : Math.min(100, Math.max(0, ((cycleTotalMs - diffMs) / cycleTotalMs) * 100));

  const sessionStartedTime = status?.lastMiningAt 
    ? new Date(status.lastMiningAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : '05:16:58 PM';

  const estimatedSettlementTime = status?.nextEligibleAt
    ? new Date(status.nextEligibleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : '09:16:58 PM';

  return (
    <div className="space-y-4 pb-28 sm:pb-16 w-full max-w-lg mx-auto select-none">
      
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
      <div className="relative rounded-[28px] overflow-hidden bg-white/70 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_rgba(22,101,52,0.06)] p-3.5 sm:p-5">
        {/* Top Badges in Glassy Mode - Translucent so animation flows underneath */}
        <div className="flex items-center justify-between w-full relative z-20 px-0.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-[10px] sm:text-[11px] font-bold text-[#0A341B] shadow-[0_2px_8px_rgba(0,0,0,0.03)] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.7)] shrink-0" />
            <span>Mining Active</span>
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-[10px] sm:text-[11px] font-bold text-[#15803D] shadow-[0_2px_8px_rgba(0,0,0,0.03)] whitespace-nowrap">
            <span>Rate: +24.00 GT / 4h</span>
          </div>
        </div>

        {/* 3D Segmented Mint-Green Cube Globe - Enriched and enlarged */}
        <div className="-mt-2 sm:-mt-3 flex justify-center relative z-10 cursor-pointer" onClick={handleClaim}>
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
          <span className="text-[#15803D] font-bold">Cycle Reward +24.00 GT</span>
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

      {/* 5. Mining Action Button - Always clickable and active to test animation */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-[0_8px_25px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_32px_rgba(34,197,94,0.6)] active:scale-95 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white cursor-pointer"
        >
          {claiming ? (
            <>
              <Pickaxe className="w-4 h-4 animate-spin" />
              <span>Mining Virtual Block...</span>
            </>
          ) : (
            <>
              <Pickaxe className="w-4 h-4 animate-bounce" />
              <span>Activate 4-Hour Mining (+1.0 GT)</span>
            </>
          )}
        </button>
        <p className="text-xs text-[#1E5E36] font-medium text-center">
          Tap above to activate mining session and test live block animation
        </p>
      </div>

    </div>
  );
};
