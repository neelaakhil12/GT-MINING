import React, { useState, useEffect } from 'react';
import { Gift, Users, Save, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { GlassCard } from '../../components/GlassCard';

export const AdminReferralsPage: React.FC = () => {
  const { showToast } = useToast();

  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralReward, setReferralReward] = useState<number>(0.5);
  const [activeThresholdDays, setActiveThresholdDays] = useState<number>(7);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await api.getAdminReferrals();
      if (res.success) {
        setReferrals(res.referrals || []);
        if (res.settings) {
          setReferralReward(Number(res.settings.referralReward || 0));
          setActiveThresholdDays(Number(res.settings.activeThresholdDays || 7));
        }
      }
    } catch (err: any) {
      showToast('Failed to fetch referral relationships', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.updateReferralSettings({
        referralReward: Number(referralReward),
        activeThresholdDays: Number(activeThresholdDays),
        reason: reason.trim() || 'Updated referral configuration and active user threshold',
      });

      if (res.success) {
        showToast('Referral settings updated successfully!', 'success');
        setReason('');
      }
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <AdminNav />

      {/* Referral Settings Card */}
      <GlassCard glow className="space-y-6">
        <div className="border-b border-[#86EFAC]/15 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#86EFAC]" />
            <span>Referral Policy & Activity Configuration</span>
          </h2>
          <p className="text-xs text-[#A7C9B1]">
            Define the reward credited to referrers upon successful registration and define the active miner threshold
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 p-4 rounded-xl bg-[#071F14]/70 border border-[#86EFAC]/20">
              <label className="text-xs font-bold text-white block">
                Bonus Reward per Referred User (GT)
              </label>
              <p className="text-[11px] text-[#A7C9B1]">
                Amount credited to the referring user once the new member completes registration.
              </p>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={referralReward}
                onChange={(e) => setReferralReward(parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono font-bold"
              />
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-[#071F14]/70 border border-[#86EFAC]/20">
              <label className="text-xs font-bold text-white block">
                Active Member Definition Threshold (Days)
              </label>
              <p className="text-[11px] text-[#A7C9B1]">
                A friend is counted as "Active" if they have claimed mining rewards within this number of days.
              </p>
              <input
                type="number"
                step="1"
                min="1"
                max="90"
                required
                value={activeThresholdDays}
                onChange={(e) => setActiveThresholdDays(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#A7C9B1]">
              Audit Reason (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Campaign reward increase"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-bold text-xs text-[#07130D] bg-[#FBBF24] hover:bg-[#F59E0B] shadow-[0_0_20px_rgba(251,191,36,0.35)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Referral Configuration'}</span>
          </button>
        </form>
      </GlassCard>

      {/* Referrals Table */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#86EFAC]" />
            <span>Referral Attribution Ledger</span>
          </h3>
          <span className="text-xs text-[#A7C9B1]">{referrals.length} Relationships</span>
        </div>

        {referrals.length === 0 ? (
          <p className="text-xs text-[#A7C9B1] py-8 text-center">No referral records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#071F14]/70 text-[#A7C9B1] uppercase font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">Referrer</th>
                  <th className="p-3">Referred Friend</th>
                  <th className="p-3">Code Used</th>
                  <th className="p-3">Bonus</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 rounded-r-lg text-right">Reward Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#86EFAC]/10 text-white">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{ref.referrerName}</div>
                      <div className="text-[11px] text-[#A7C9B1] font-mono">{ref.referrerEmail}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#86EFAC]">{ref.referredName}</div>
                      <div className="text-[11px] text-[#A7C9B1] font-mono">{ref.referredEmail}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#22C55E]">{ref.referralCodeUsed}</td>
                    <td className="p-3 font-mono font-bold text-[#4ADE80]">+{ref.rewardAmount} GT</td>
                    <td className="p-3 text-[11px] text-[#A7C9B1]">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A]/20 text-[#4ADE80] border border-[#86EFAC]/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{ref.rewardStatus}</span>
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
