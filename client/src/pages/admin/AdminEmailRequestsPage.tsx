import React, { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  User,
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { AdminCard } from '../../components/AdminCard';

export const AdminEmailRequestsPage: React.FC = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminEmailRequests();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err: any) {
      showToast('Failed to fetch email change requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reqItem: any) => {
    const confirmMsg = `Are you sure you want to approve email change for ${reqItem.userFullName}?\n\nCurrent: ${reqItem.currentEmail}\nNew: ${reqItem.requestedNewEmail}\n\nOnce approved, user will log in with this new email.`;
    if (!window.confirm(confirmMsg)) return;

    setProcessingId(reqItem.id);
    try {
      const res = await api.approveEmailRequest(reqItem.id);
      if (res.success) {
        showToast(res.message || 'Email change approved successfully!', 'success');
        await fetchRequests();
      }
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reqItem: any) => {
    const reason = window.prompt(`Enter rejection reason for ${reqItem.requestedNewEmail}:`, 'Invalid or unverified email request');
    if (reason === null) return; // Cancelled

    setProcessingId(reqItem.id);
    try {
      const res = await api.rejectEmailRequest(reqItem.id, reason);
      if (res.success) {
        showToast('Email change request rejected', 'success');
        await fetchRequests();
      }
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = (r.userFullName || '').toLowerCase().includes(q);
      const matchOld = (r.currentEmail || '').toLowerCase().includes(q);
      const matchNew = (r.requestedNewEmail || '').toLowerCase().includes(q);
      return matchName || matchOld || matchNew;
    }
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <AdminNav />

      {/* Header and Controls */}
      <AdminCard className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, current email, or requested new email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white placeholder-[#A7C9B1]/60 text-xs focus:border-[#FBBF24] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: '', label: 'All Requests' },
            { key: 'PENDING', label: `Pending (${pendingCount})` },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st.key
                  ? 'bg-[#FBBF24] text-[#07130D] font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-white/5 text-[#A7C9B1] hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
          <button
            onClick={fetchRequests}
            title="Refresh requests"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#86EFAC] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </AdminCard>

      {/* Main Table Card */}
      <AdminCard className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#86EFAC]" />
            <span>User Email Change Requests</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBBF24] text-[#07130D] animate-pulse">
                {pendingCount} Action Required
              </span>
            )}
          </h2>
          <span className="text-xs text-[#A7C9B1]">{filtered.length} Total</span>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse py-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-[#A7C9B1]/40 mx-auto" />
            <p className="text-xs text-[#A7C9B1]">No email change requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#071F14]/70 text-[#A7C9B1] uppercase font-semibold">
                <tr>
                  <th className="p-3.5 rounded-l-lg">User</th>
                  <th className="p-3.5">Current Email</th>
                  <th className="p-3.5">Requested New Email</th>
                  <th className="p-3.5">Requested At</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#86EFAC]/10 text-white">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#22C55E]/20 text-[#86EFAC] font-bold flex items-center justify-center text-xs">
                          {(item.userFullName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white">{item.userFullName || 'User'}</div>
                          <div className="text-[10px] text-[#A7C9B1]/70 font-mono">ID: {item.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#A7C9B1]">
                      {item.currentEmail}
                    </td>
                    <td className="p-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#4ADE80] font-mono text-[11px] font-bold">
                        <ArrowRight className="w-3 h-3 text-[#22C55E]" />
                        <span>{item.requestedNewEmail}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-[11px] text-[#A7C9B1] font-mono">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          item.status === 'APPROVED'
                            ? 'bg-[#16A34A]/20 text-[#4ADE80] border border-[#86EFAC]/20'
                            : item.status === 'REJECTED'
                            ? 'bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/30'
                            : 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30'
                        }`}
                      >
                        {item.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" />}
                        {item.status === 'REJECTED' && <XCircle className="w-3 h-3 text-[#F87171]" />}
                        {item.status === 'PENDING' && <Clock className="w-3 h-3 text-[#FBBF24] animate-spin" />}
                        <span>{item.status}</span>
                      </span>
                      {item.reason && (
                        <div className="text-[10px] text-red-400 mt-1 italic max-w-xs truncate">
                          Reason: {item.reason}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {item.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={processingId === item.id}
                            className="px-3 py-1.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#07130D] font-black text-xs flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                            title="Approve email change and update user account"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            disabled={processingId === item.id}
                            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-bold text-xs flex items-center gap-1 border border-red-500/30 transition-all cursor-pointer disabled:opacity-50"
                            title="Reject email change request"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-white/40 font-mono">
                          Reviewed: {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'Done'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
};
