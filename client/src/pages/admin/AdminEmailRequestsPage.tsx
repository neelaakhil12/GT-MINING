import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  User,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { AdminCard } from '../../components/AdminCard';

type RequestSection = 'email' | 'deletion';

export const AdminEmailRequestsPage: React.FC = () => {
  const { showToast } = useToast();
  const [section, setSection] = useState<RequestSection>('email');

  // Email requests
  const [emailRequests, setEmailRequests] = useState<any[]>([]);
  // Deletion requests
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [emailRes, delRes] = await Promise.all([
        api.getAdminEmailRequests().catch(() => ({ success: false, requests: [] })),
        api.getAdminAccountDeletionRequests().catch(() => ({ success: false, requests: [] })),
      ]);
      if (emailRes.success) setEmailRequests(emailRes.requests || []);
      if (delRes.success) setDeletionRequests(delRes.requests || []);
    } catch (err: any) {
      showToast('Failed to fetch requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEmail = async (reqItem: any) => {
    const confirmMsg = `Are you sure you want to approve email change for ${reqItem.userFullName}?\n\nCurrent: ${reqItem.currentEmail}\nNew: ${reqItem.requestedNewEmail}\n\nOnce approved, user will log in with this new email.`;
    if (!window.confirm(confirmMsg)) return;

    setProcessingId(reqItem.id);
    try {
      const res = await api.approveEmailRequest(reqItem.id);
      if (res.success) {
        showToast(res.message || 'Email change approved successfully!', 'success');
        await fetchAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectEmail = async (reqItem: any) => {
    const reason = window.prompt(`Enter rejection reason for ${reqItem.requestedNewEmail}:`, 'Invalid or unverified email request');
    if (reason === null) return;

    setProcessingId(reqItem.id);
    try {
      const res = await api.rejectEmailRequest(reqItem.id, reason);
      if (res.success) {
        showToast('Email change request rejected', 'success');
        await fetchAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveDeletion = async (reqItem: any) => {
    const confirmMsg = `⚠️ DANGER: Are you sure you want to approve permanent account deletion for ${reqItem.userFullName || reqItem.email}?\n\nUser ID: ${reqItem.userId}\nEmail: ${reqItem.email}\n\nThis will permanently delete the user's account and deactivate login. This action CANNOT be undone!`;
    if (!window.confirm(confirmMsg)) return;

    setProcessingId(reqItem.id);
    try {
      const res = await api.approveAccountDeletionRequest(reqItem.id);
      if (res.success) {
        showToast(res.message || 'Account permanently deleted!', 'success');
        await fetchAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Deletion approval failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDeletion = async (reqItem: any) => {
    const reason = window.prompt(`Enter rejection reason for deletion request from ${reqItem.email}:`, 'Account deletion rejected by administrator');
    if (reason === null) return;

    setProcessingId(reqItem.id);
    try {
      const res = await api.rejectAccountDeletionRequest(reqItem.id, reason);
      if (res.success) {
        showToast('Account deletion request rejected. User account retained.', 'success');
        await fetchAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingEmailCount = emailRequests.filter((r) => r.status === 'PENDING').length;
  const pendingDeletionCount = deletionRequests.filter((r) => r.status === 'PENDING').length;

  const currentList = section === 'email' ? emailRequests : deletionRequests;

  const filtered = currentList.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = (r.userFullName || '').toLowerCase().includes(q);
      const matchOld = (r.currentEmail || r.email || '').toLowerCase().includes(q);
      const matchNew = (r.requestedNewEmail || '').toLowerCase().includes(q);
      return matchName || matchOld || matchNew;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <AdminNav />

      {/* Top Banner / Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#0B2516] to-[#071F14] border border-[#86EFAC]/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#86EFAC]">
            <Bell className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Notifications & Requests</h1>
            <p className="text-xs text-[#A7C9B1]">
              Manage user email change requests and account deletion requests
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 bg-[#05160E] p-1.5 rounded-xl border border-[#86EFAC]/20">
          <button
            onClick={() => {
              setSection('email');
              setStatusFilter('');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              section === 'email'
                ? 'bg-[#22C55E] text-[#05180E] shadow-sm'
                : 'text-[#A7C9B1] hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Requests</span>
            {pendingEmailCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#FBBF24] text-[#07130D]">
                {pendingEmailCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setSection('deletion');
              setStatusFilter('');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              section === 'deletion'
                ? 'bg-[#EF4444] text-white shadow-sm'
                : 'text-[#A7C9B1] hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Account Deletions</span>
            {pendingDeletionCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white text-red-600">
                {pendingDeletionCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <AdminCard className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              section === 'email'
                ? 'Search by name, current email, or requested new email...'
                : 'Search by name, user ID, or email...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white placeholder-[#A7C9B1]/60 text-xs focus:border-[#22C55E] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: '', label: 'All Requests' },
            {
              key: 'PENDING',
              label: `Pending (${section === 'email' ? pendingEmailCount : pendingDeletionCount})`,
            },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st.key
                  ? section === 'email'
                    ? 'bg-[#FBBF24] text-[#07130D] font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'bg-red-500 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-white/5 text-[#A7C9B1] hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
          <button
            onClick={fetchAll}
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
            {section === 'email' ? (
              <>
                <Mail className="w-5 h-5 text-[#86EFAC]" />
                <span>Email Change Requests</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5 text-red-400" />
                <span>Account Deletion Requests</span>
              </>
            )}
            {((section === 'email' && pendingEmailCount > 0) ||
              (section === 'deletion' && pendingDeletionCount > 0)) && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  section === 'email'
                    ? 'bg-[#FBBF24] text-[#07130D]'
                    : 'bg-red-500 text-white'
                } animate-pulse`}
              >
                {section === 'email' ? pendingEmailCount : pendingDeletionCount} Action Required
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
            <p className="text-xs text-[#A7C9B1]">
              No {section === 'email' ? 'email change' : 'account deletion'} requests found.
            </p>
          </div>
        ) : section === 'email' ? (
          /* EMAIL REQUESTS TABLE */
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[620px]">
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
                            onClick={() => handleApproveEmail(item)}
                            disabled={processingId === item.id}
                            className="px-3 py-1.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#07130D] font-black text-xs flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                            title="Approve email change and update user account"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectEmail(item)}
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
        ) : (
          /* DELETION REQUESTS TABLE */
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead className="bg-[#071F14]/70 text-[#A7C9B1] uppercase font-semibold">
                <tr>
                  <th className="p-3.5 rounded-l-lg">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Requested At</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-lg text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#86EFAC]/10 text-white">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-xs">
                          {(item.userFullName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white">{item.userFullName || 'User'}</div>
                          <div className="text-[10px] text-[#A7C9B1]/70 font-mono">ID: {item.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#A7C9B1]">
                      {item.email}
                    </td>
                    <td className="p-3.5 text-[11px] text-[#A7C9B1] font-mono">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          item.status === 'APPROVED'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : item.status === 'REJECTED'
                            ? 'bg-[#16A34A]/20 text-[#4ADE80] border border-[#86EFAC]/20'
                            : 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30'
                        }`}
                      >
                        {item.status === 'APPROVED' && <Trash2 className="w-3 h-3 text-red-400" />}
                        {item.status === 'REJECTED' && <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" />}
                        {item.status === 'PENDING' && <Clock className="w-3 h-3 text-[#FBBF24] animate-spin" />}
                        <span>
                          {item.status === 'APPROVED'
                            ? 'DELETED'
                            : item.status === 'REJECTED'
                            ? 'RETAINED'
                            : 'PENDING APPROVAL'}
                        </span>
                      </span>
                      {item.reason && (
                        <div className="text-[10px] text-[#A7C9B1] mt-1 italic max-w-xs truncate">
                          Reason: {item.reason}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {item.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleApproveDeletion(item)}
                            disabled={processingId === item.id}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                            title="Approve and permanently delete user account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Approve & Delete</span>
                          </button>
                          <button
                            onClick={() => handleRejectDeletion(item)}
                            disabled={processingId === item.id}
                            className="px-3 py-1.5 rounded-xl bg-[#22C55E]/20 hover:bg-[#22C55E] text-[#86EFAC] hover:text-[#07130D] font-bold text-xs flex items-center gap-1 border border-[#22C55E]/30 transition-all cursor-pointer disabled:opacity-50"
                            title="Reject account deletion request (keep account active)"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-white/40 font-mono">
                          Processed: {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'Done'}
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


