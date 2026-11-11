import React, { useState, useEffect } from 'react';
import { Pickaxe, Clock, ShieldCheck, Save, ToggleLeft, ToggleRight, Sparkles, Target } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { AdminCard } from '../../components/AdminCard';

export const AdminMiningPage: React.FC = () => {
  const { showToast } = useToast();

  const [miningReward, setMiningReward] = useState<string>('1');
  const [cooldownHours, setCooldownHours] = useState<string>('4');
  const [userMiningTarget, setUserMiningTarget] = useState<string>('1000');
  const [miningEnabled, setMiningEnabled] = useState<boolean>(true);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.getMiningSettings();
      if (res.success && res.settings) {
        setMiningReward(String(Number(res.settings.miningReward || 1.0)));
        setCooldownHours(String(Math.round((Number(res.settings.cooldownSeconds || 14400) / 3600) * 100) / 100));
        setUserMiningTarget(String(Number(res.settings.userMiningTarget || 1000)));
        setMiningEnabled(res.settings.miningEnabled !== false);
      }
    } catch (err: any) {
      showToast('Failed to load mining parameters', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedReward = Number(miningReward);
    const parsedHours = Number(cooldownHours);
    const parsedTarget = Number(userMiningTarget);

    if (!Number.isFinite(parsedReward) || parsedReward <= 0) {
      showToast('Enter a valid positive mining reward', 'error');
      return;
    }
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      showToast('Enter a valid positive cooldown in hours', 'error');
      return;
    }
    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      showToast('Enter a valid positive mining target limit', 'error');
      return;
    }

    setSaving(true);

    try {
      const res = await api.updateMiningSettings({
        miningReward: parsedReward,
        cooldownSeconds: Math.round(parsedHours * 3600),
        userMiningTarget: parsedTarget,
        miningEnabled,
        reason: reason.trim() || 'Updated mining reward, cooldown, and target parameters',
      });

      if (res.success) {
        showToast('Mining configuration updated successfully!', 'success');
        setReason('');
        localStorage.setItem('gt_mining_cycle_hours', String(parsedHours));
        window.dispatchEvent(new Event('gt_mining_cycle_changed'));
      }
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto pb-16">
        <div className="h-20 rounded-2xl bg-white/5" />
        <div className="h-96 rounded-2xl bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <AdminNav />

      <AdminCard glow className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Pickaxe className="w-5 h-5 text-[#22C55E]" />
              <span>Mining Parameters</span>
            </h2>
            <p className="text-xs text-[#A7C9B1]">
              Controls authoritative global mining reward allocation and cycle cooldowns
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Reward per claim */}
            <div className="space-y-2 p-4 rounded-xl bg-[#071F14]/70 border border-[#86EFAC]/20">
              <label className="text-xs font-bold text-white block">
                Reward per Successful Claim (GT)
              </label>
              <p className="text-[11px] text-[#A7C9B1]">
                Default is 1.0 GT. Every successful claim credits this exact amount.
              </p>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={miningReward}
                onChange={(e) => setMiningReward(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white font-mono font-bold text-sm focus:border-[#FBBF24] outline-none"
              />
            </div>

            {/* Cooldown duration */}
            <div className="space-y-2 p-4 rounded-xl bg-[#071F14]/70 border border-[#86EFAC]/20">
              <label className="text-xs font-bold text-white block">
                Cycle Cooldown (Hours)
              </label>
              <p className="text-[11px] text-[#A7C9B1]">
                Default is 4 hours (14,400s). Select or enter 4, 5, 6 or custom hours.
              </p>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={cooldownHours}
                onChange={(e) => setCooldownHours(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white font-mono font-bold text-sm focus:border-[#FBBF24] outline-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[4, 5, 6, 8, 12, 24].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setCooldownHours(String(h))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      Number(cooldownHours) === h
                        ? 'bg-[#22C55E] text-[#07130D] shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                        : 'bg-white/5 text-[#A7C9B1] hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* User Mining Target Limit */}
            <div className="space-y-2 p-4 rounded-xl bg-[#071F14]/70 border border-[#86EFAC]/20 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#FBBF24]" />
                  <span>User Maximum Mining Target / Limit (GT)</span>
                </label>
                <span className="text-[11px] font-mono font-bold text-[#FBBF24] bg-[#FBBF24]/10 px-2.5 py-0.5 rounded-full border border-[#FBBF24]/20">
                  Account Cap: {(Number(userMiningTarget) || 0).toLocaleString()} GT
                </span>
              </div>
              <p className="text-[11px] text-[#A7C9B1]">
                Maximum total GT a single user account can mine. Once this target is reached, the mine button becomes locked with a completion popup on both App and Website. Users must register again with new details to continue mining.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-1">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={userMiningTarget}
                  onChange={(e) => setUserMiningTarget(e.target.value)}
                  placeholder="e.g. 1000, 2000"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white font-mono font-bold text-sm focus:border-[#FBBF24] outline-none"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[500, 1000, 2000, 3000, 5000].map((tgt) => (
                    <button
                      key={tgt}
                      type="button"
                      onClick={() => setUserMiningTarget(String(tgt))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        Number(userMiningTarget) === tgt
                          ? 'bg-[#FBBF24] text-[#07130D] shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                          : 'bg-white/5 text-[#A7C9B1] hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {tgt.toLocaleString()} GT
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Global Mining Toggle */}
          <div className="p-4 rounded-xl bg-[#071F14]/70 border border-[#86EFAC]/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-white block">Global Mining Network Status</span>
              <span className="text-xs text-[#A7C9B1]">
                When disabled, all mining claims are globally paused across the application.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMiningEnabled(!miningEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                miningEnabled
                  ? 'bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/40'
                  : 'bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/40'
              }`}
            >
              {miningEnabled ? 'Mining Active (Enabled)' : 'Mining Paused (Disabled)'}
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-bold text-xs text-[#07130D] bg-[#FBBF24] hover:bg-[#F59E0B] shadow-[0_0_20px_rgba(251,191,36,0.35)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Mining Parameters'}</span>
          </button>
        </form>
      </AdminCard>
    </div>
  );
};
