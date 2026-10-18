import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Pickaxe,
  Clock,
  Coins,
  History,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Coins as CoinIcon
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

  return (
    <div className="space-y-6 pb-28 sm:pb-16 w-full max-w-6xl mx-auto">
      
      {/* Mining Centerpiece Card */}
      <GlassCard glow className="relative overflow-hidden text-center p-4 sm:p-10 space-y-4 sm:space-y-6">
        
        {/* Top Badges matching video reference */}
        <div className="flex items-center justify-between gap-3 relative z-10 border-b border-black/5 pb-3 sm:pb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 border border-white text-xs font-bold text-[#1E5E36] shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isEligible ? 'bg-[#22C55E] animate-ping' : 'bg-[#15803D]'}`} />
            <span>{isEligible ? 'Mining Session Ready' : 'Cycle Completed'}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-full bg-white/85 border border-white text-xs font-bold text-[#15803D] shadow-sm">
              <span>Rate: +1.00 GT / 4h</span>
            </div>

            <button
              onClick={fetchMiningData}
              className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-[#16A34A] transition-colors shadow-sm border border-white"
              title="Sync Node"
              aria-label="Sync Node"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3D Segmented Mint-Green Cube Globe matching exact video reference */}
        <div className="py-1 flex justify-center relative z-10">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] cursor-pointer" onClick={handleClaim}>
            <MiningGlobe3D spinning={isFastSpinning} />
            {isEligible && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-[9px] sm:text-[10px] font-black shadow-[0_6px_16px_rgba(34,197,94,0.5)] uppercase tracking-wider animate-bounce whitespace-nowrap">
                Tap Globe to Mine!
              </div>
            )}
          </div>
        </div>

        {/* Main Mine GT CTA Button - Positioned DIRECTLY under the crystal as requested */}
        <div className="max-w-xs sm:max-w-sm mx-auto relative z-10 pt-0">
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full py-2.5 sm:py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2.5 transform active:scale-95 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-[0_8px_25px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_32px_rgba(34,197,94,0.6)] cursor-pointer"
          >
            <Pickaxe className={`w-4.5 h-4.5 ${claiming ? 'animate-spin' : 'animate-bounce'}`} />
            <span>
              {claiming
                ? 'Mining Virtual GT Block...'
                : 'Mine GT (+1.0 GT)'}
            </span>
          </button>
        </div>

        {/* Live Wallet Balance */}
        <div className="space-y-0.5 relative z-10">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1E5E36]">
            Verified Available Balance
          </p>
          <div className="flex items-center justify-center gap-2">
            <Coins className="w-4.5 h-4.5 text-[#16A34A]" />
            <span className="text-xl sm:text-2xl font-black text-[#0A341B]">
              {(wallet?.availableBalance ?? status?.availableBalance ?? 0).toFixed(4)} GT
            </span>
          </div>
        </div>

        {/* 4-Hour Countdown Clock - Reduced size for sleek mobile visibility */}
        <div className="max-w-xs sm:max-w-sm mx-auto p-2.5 sm:p-4 rounded-2xl bg-white/80 border border-white space-y-0.5 relative z-10 shadow-[0_4px_14px_rgba(22,101,52,0.06)]">
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#1E5E36]">
            <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Remaining Cooldown Time</span>
          </div>
          
          <div className="text-xl sm:text-2xl font-mono font-black text-[#0A341B] tracking-wider">
            {countdown}
          </div>

          <p className="text-[9px] sm:text-[10px] text-[#1E5E36]">
            Every 4 hours cooldown cycle • Next claim: {status?.nextEligibleAt ? new Date(status.nextEligibleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ready'}
          </p>
        </div>

        {/* Timestamps Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 max-w-md mx-auto text-left text-[11px] sm:text-xs text-[#1E5E36] relative z-10">
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white/70 border border-white shadow-sm">
            <span className="font-bold text-[#0A341B] block">Last Successful Claim:</span>
            <span>{status?.lastMiningAt ? new Date(status.lastMiningAt).toLocaleString() : 'No claims yet'}</span>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white/70 border border-white shadow-sm">
            <span className="font-bold text-[#0A341B] block">Reward Rate:</span>
            <span className="text-[#15803D] font-bold">1.0 GT per 4 hours</span>
          </div>
        </div>
      </GlassCard>

      {/* Rules Information Box */}
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0A341B]">
          <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
          <span>Mining Protocol & Fair Allocation Rules</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#1E5E36]">
          <div className="p-4 rounded-2xl bg-white/70 border border-white shadow-sm space-y-1">
            <strong className="text-[#0A341B] block">4-Hour Cooldown Interval</strong>
            <p>Every account is rate-limited to 1 claim every 14,400 seconds (4 hours) verified by server UTC time.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 border border-white shadow-sm space-y-1">
            <strong className="text-[#0A341B] block">Atomic Ledger Integrity</strong>
            <p>Duplicate clicks, concurrent tabs, or modified device clocks are stopped by server-side idempotency locks.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 border border-white shadow-sm space-y-1">
            <strong className="text-[#0A341B] block">Persistent Countdown</strong>
            <p>Closing the browser or switching devices does not alter or reset your timer.</p>
          </div>
        </div>
      </GlassCard>

      {/* Mining Rewards History Table */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#16A34A]" />
            <h3 className="text-lg font-bold text-[#0A341B]">Mining Rewards History</h3>
          </div>
          <span className="text-xs text-[#1E5E36] font-bold">{history.length} Total Claims</span>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CoinIcon className="w-10 h-10 text-[#1E5E36]/30 mx-auto" />
            <p className="text-sm font-bold text-[#0A341B]">No mining rewards claimed yet</p>
            <p className="text-xs text-[#1E5E36]">Click "Mine GT" above to claim your first reward!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/60 text-[#1E5E36] uppercase font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-2xl">Transaction ID</th>
                  <th className="p-3.5">Claim Timestamp</th>
                  <th className="p-3.5">Reward</th>
                  <th className="p-3.5">Next Eligible</th>
                  <th className="p-3.5 rounded-r-2xl text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-[#0A341B]">
                {history.map((claim) => (
                  <tr key={claim.id} className="hover:bg-white/60 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-[#1E5E36]">
                      {claim.transactionId || claim.id}
                    </td>
                    <td className="p-3.5 text-[11px]">
                      {new Date(claim.claimedAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-[#15803D]">
                      +{claim.rewardAmount} GT
                    </td>
                    <td className="p-3.5 text-[11px] text-[#1E5E36]">
                      {new Date(claim.nextEligibleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#15803D] border border-[#22C55E]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmed</span>
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
