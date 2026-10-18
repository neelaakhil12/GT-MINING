import React, { useState, useEffect } from 'react';
import { Coins, Filter, PlusCircle, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { GlassCard } from '../../components/GlassCard';

export const AdminTransactionsPage: React.FC = () => {
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual adjustment modal
  const [adjustModal, setAdjustModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txRes, usersRes] = await Promise.all([
        api.getAdminTransactions(),
        api.getAdminUsers(),
      ]);

      if (txRes.success) setTransactions(txRes.transactions || []);
      if (usersRes.success) setUsers(usersRes.users || []);
    } catch (err: any) {
      showToast('Failed to load transaction data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      showToast('Please select a target user', 'error');
      return;
    }
    if (!adjustAmount || adjustAmount === 0) {
      showToast('Adjustment amount cannot be zero', 'error');
      return;
    }
    if (!adjustReason.trim()) {
      showToast('Mandatory recorded reason is required', 'error');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.adjustWalletBalance({
        userId: selectedUserId,
        amount: Number(adjustAmount),
        reason: adjustReason.trim(),
      });

      if (res.success) {
        showToast(res.message, 'success');
        setAdjustModal(false);
        setAdjustAmount(0);
        setAdjustReason('');
        await fetchData();
      }
    } catch (err: any) {
      showToast(err.message || 'Adjustment failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <AdminNav />

      {/* Header with Adjustment Trigger */}
      <GlassCard className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#86EFAC]" />
            <span>Global Wallet & Transaction Ledger</span>
          </h2>
          <p className="text-xs text-[#A7C9B1]">
            Every virtual coin credited or debited is auditable and tracked with idempotency
          </p>
        </div>

        <button
          onClick={() => setAdjustModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-[#07130D] bg-[#FBBF24] hover:bg-[#F59E0B] shadow-[0_0_20px_rgba(251,191,36,0.35)] flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Manual Balance Adjustment</span>
        </button>
      </GlassCard>

      {/* Adjustment Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border-[#FBBF24]/40 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#FBBF24]" />
              <span>Manual Wallet Adjustment</span>
            </h3>

            <p className="text-xs text-[#A7C9B1]">
              Execute a safe, atomic balance adjustment. This will generate a formal ledger transaction and an administrative audit record.
            </p>

            <form onSubmit={handleAdjust} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A7C9B1]">Target User</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                >
                  <option value="" className="bg-[#07130D]">Select a registered user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="bg-[#07130D]">
                      {u.fullName} ({u.email}) — Current: {Number(u.walletBalance || 0).toFixed(2)} GT
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A7C9B1]">
                  Adjustment Amount (Use positive or negative, e.g. +5 or -2)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseFloat(e.target.value))}
                  placeholder="e.g. 5.0"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A7C9B1]">
                  Mandatory Recorded Reason
                </label>
                <textarea
                  required
                  rows={2}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Community contest bounty winner verification"
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#A7C9B1] bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#07130D] bg-[#FBBF24] hover:bg-[#F59E0B] disabled:opacity-50"
                >
                  {processing ? 'Applying...' : 'Apply Ledger Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-4">
          <h3 className="text-base font-bold text-white">All System Transactions</h3>
          <span className="text-xs text-[#A7C9B1]">{transactions.length} Records</span>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-[#A7C9B1] py-8 text-center">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#071F14]/70 text-[#A7C9B1] uppercase font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">User</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3 rounded-r-lg text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#86EFAC]/10 text-white">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{tx.userName}</div>
                      <div className="text-[10px] text-[#A7C9B1] font-mono">{tx.userEmail}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 border border-white/10">
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span className={tx.amount >= 0 ? 'text-[#4ADE80]' : 'text-[#F87171]'}>
                        {tx.amount >= 0 ? `+${tx.amount.toFixed(4)}` : tx.amount.toFixed(4)} GT
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-[#A7C9B1] max-w-xs truncate">{tx.description}</td>
                    <td className="p-3 text-[11px] text-[#A7C9B1]">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A]/20 text-[#4ADE80] border border-[#86EFAC]/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
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
