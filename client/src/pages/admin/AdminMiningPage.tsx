import React, { useState, useEffect } from 'react';
import { Pickaxe, Clock, ShieldCheck, Save, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { AdminCard } from '../../components/AdminCard';

export const AdminMiningPage: React.FC = () => {
  const { showToast } = useToast();

  const [miningReward, setMiningReward] = useState<number>(1.0);
  const [cooldownHours, setCooldownHours] = useState<number>(4);
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
        setMiningReward(Number(res.settings.miningReward || 1.0));
        setCooldownHours(Math.round(Number(res.settings.cooldownSeconds || 14400) / 3600));
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
    setSaving(true);

    try {
      const res = await api.updateMiningSettings({
        miningReward: Number(miningReward),
        cooldownSeconds: Number(cooldownHours) * 3600,
        miningEnabled,
        reason: reason.trim() || 'Updated mining reward and cooldown parameters',
      });

      if (res.success) {
        showToast('Mining configuration updated successfully!', 'success');
        setReason('');
        localStorage.setItem('gt_mining_cycle_hours', String(cooldownHours));
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
              <span>Mining Protocol Configuration</span>
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
                step="0.1"
                min="0.1"
                required
                value={miningReward}
                onChange={(e) => setMiningReward(parseFloat(e.target.value))}
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
                step="1"
                min="1"
                max="72"
                required
                value={cooldownHours}
                onChange={(e) => setCooldownHours(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white font-mono font-bold text-sm focus:border-[#FBBF24] outline-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[4, 5, 6, 8, 12, 24].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setCooldownHours(h)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      cooldownHours === h
                        ? 'bg-[#22C55E] text-[#07130D] shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                        : 'bg-white/5 text-[#A7C9B1] hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
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
