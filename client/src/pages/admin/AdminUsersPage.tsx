import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  ShieldAlert,
  Coins,
  History,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { GlassCard } from '../../components/GlassCard';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status Modal
  const [modalUser, setModalUser] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter]);

  const fetchUsers = async () => {
    try {
      const res = await api.getAdminUsers(search.trim() || undefined, statusFilter || undefined);
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err: any) {
      showToast('Failed to fetch user list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('A recorded reason is mandatory for status change', 'error');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.updateUserStatus(modalUser.id, {
        accountStatus: newStatus,
        reason: reason.trim(),
      });

      if (res.success) {
        showToast(res.message, 'success');
        setUsers(prev => prev.map(u => (u.id === modalUser.id ? { ...u, accountStatus: newStatus } : u)));
        setModalUser(null);
        setReason('');
      }
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <AdminNav />

      {/* Search and Filters */}
      <GlassCard className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, or referral code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {['', 'ACTIVE', 'SUSPENDED', 'DELETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#FBBF24] text-[#07130D] font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-white/5 text-[#A7C9B1] hover:text-white'
              }`}
            >
              {st === '' ? 'All Accounts' : st}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Users Table */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#86EFAC]" />
            <span>Registered User Accounts</span>
          </h2>
          <span className="text-xs text-[#A7C9B1]">{users.length} Total</span>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse py-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 rounded-xl bg-white/5" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-xs text-[#A7C9B1] py-8 text-center">No matching users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#071F14]/70 text-[#A7C9B1] uppercase font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">User</th>
                  <th className="p-3">Referral Code</th>
                  <th className="p-3">Wallet</th>
                  <th className="p-3">Referrals</th>
                  <th className="p-3">Claims</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#86EFAC]/10 text-white">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{u.fullName}</div>
                      <div className="text-[11px] text-[#A7C9B1] font-mono">{u.email}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#86EFAC]">{u.referralCode}</td>
                    <td className="p-3 font-bold font-mono text-white">
                      {Number(u.walletBalance || 0).toFixed(2)} GT
                    </td>
                    <td className="p-3">{u.referralCount}</td>
                    <td className="p-3">{u.claimsCount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.accountStatus === 'ACTIVE'
                          ? 'bg-[#16A34A]/20 text-[#4ADE80] border border-[#86EFAC]/20'
                          : u.accountStatus === 'SUSPENDED'
                          ? 'bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/30'
                          : 'bg-white/5 text-[#A7C9B1] border border-white/10'
                      }`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'ADMIN' && u.accountStatus !== 'DELETED' && (
                        <button
                          onClick={() => {
                            setModalUser(u);
                            setNewStatus(u.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
                            setReason('');
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            u.accountStatus === 'ACTIVE'
                              ? 'bg-[#F87171]/15 text-[#F87171] hover:bg-[#F87171] hover:text-white'
                              : 'bg-[#22C55E]/15 text-[#4ADE80] hover:bg-[#22C55E] hover:text-[#07130D]'
                          }`}
                        >
                          {u.accountStatus === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Suspend / Reactivate Reason Modal */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border-[#FBBF24]/40 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#FBBF24]" />
              <span>Modify Account Status: {modalUser.fullName}</span>
            </h3>

            <p className="text-xs text-[#A7C9B1]">
              Target status: <strong className="text-white">{newStatus}</strong>. This administrative action will be recorded in the security audit trail.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7C9B1]">
                  Mandatory Audit Reason
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Account suspended due to detected automated multi-accounting scripts."
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalUser(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#A7C9B1] bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !reason.trim()}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#07130D] bg-[#FBBF24] hover:bg-[#F59E0B] disabled:opacity-50"
                >
                  {processing ? 'Applying...' : `Confirm ${newStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
