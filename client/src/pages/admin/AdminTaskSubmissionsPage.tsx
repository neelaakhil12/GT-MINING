import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  Eye,
  AlertCircle,
  ShieldCheck,
  Coins,
  User,
  Mail,
  RefreshCw,
  Image as ImageIcon,
  Check,
  X,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface TaskSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  taskId: string;
  taskTitle: string;
  taskCategory: string;
  reward: number;
  proofImage: string;
  proofNote?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminComment?: string;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
}

export const AdminTaskSubmissionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  // Proof Lightbox Modal
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; user: string } | null>(null);

  // Rejection Dialog State
  const [rejectingSub, setRejectingSub] = useState<TaskSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState('Screenshot proof could not be verified or was invalid.');

  const fetchSubmissions = async () => {
    try {
      const res = await api.getAdminTaskSubmissions(statusFilter);
      if (res && res.success) {
        setSubmissions(res.submissions || []);
        if (typeof res.pendingCount === 'number') {
          setPendingCount(res.pendingCount);
        }
      }
    } catch (err: any) {
      console.error('Fetch task submissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSubmissions();
    const timer = setInterval(fetchSubmissions, 6000);
    return () => clearInterval(timer);
  }, [statusFilter]);

  // Handle Approve
  const handleApprove = async (sub: TaskSubmission) => {
    setActionLoadingId(sub.id);
    try {
      const res = await api.approveTaskSubmission(sub.id);
      if (res && res.success) {
        showToast(`✓ Approved! +${sub.reward}.00 GT credited to ${sub.userName}'s wallet.`, 'success');
        await fetchSubmissions();
      } else {
        throw new Error(res?.message || 'Approval failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to approve submission', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject
  const handleConfirmReject = async () => {
    if (!rejectingSub) return;
    setActionLoadingId(rejectingSub.id);
    try {
      const res = await api.rejectTaskSubmission(rejectingSub.id, rejectReason);
      if (res && res.success) {
        showToast(`Submission rejected. Notice sent to ${rejectingSub.userName}.`, 'info');
        setRejectingSub(null);
        await fetchSubmissions();
      } else {
        throw new Error(res?.message || 'Rejection failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reject submission', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered by Search Term
  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      sub.userName?.toLowerCase().includes(term) ||
      sub.userEmail?.toLowerCase().includes(term) ||
      sub.taskTitle?.toLowerCase().includes(term) ||
      sub.proofNote?.toLowerCase().includes(term)
    );
  });

  const totalCount = submissions.length;
  const approvedCount = submissions.filter((s) => s.status === 'APPROVED').length;
  const rejectedCount = submissions.filter((s) => s.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Live Refresh Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#86EFAC]">
            ADMIN PANEL / Task Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Task Proof Submissions</span>
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#F59E0B] text-black animate-pulse">
                {pendingCount} Pending Review
              </span>
            )}
          </h1>
          <p className="text-xs text-[#A7C9B1] mt-1 font-medium">
            Review user task completion screenshots. Approved tasks credit GT coins directly into the user's wallet.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchSubmissions();
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0B2516] border border-[#22C55E]/30 text-xs font-bold text-[#86EFAC] hover:bg-[#0E321E] transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-[#0B2516] border border-[#22C55E]/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A7C9B1] font-bold">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-black text-[#FBBF24]">{pendingCount}</div>
          <div className="text-[10px] text-[#A7C9B1]/70">Awaiting admin verification</div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0B2516] border border-[#22C55E]/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A7C9B1] font-bold">
            <span>Approved Quests</span>
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-[#22C55E]">{approvedCount}</div>
          <div className="text-[10px] text-[#A7C9B1]/70">Wallet rewards credited</div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0B2516] border border-[#22C55E]/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A7C9B1] font-bold">
            <span>Rejected Proofs</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{rejectedCount}</div>
          <div className="text-[10px] text-[#A7C9B1]/70">Invalid screenshots</div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0B2516] border border-[#22C55E]/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#A7C9B1] font-bold">
            <span>Total Submissions</span>
            <Coins className="w-4 h-4 text-[#86EFAC]" />
          </div>
          <div className="text-2xl font-black text-white">{totalCount}</div>
          <div className="text-[10px] text-[#A7C9B1]/70">All recorded quests</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-3xl bg-[#0B2516] border border-[#22C55E]/20 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { key: 'PENDING', label: `Pending (${pendingCount})` },
            { key: 'all', label: 'All Submissions' },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-black shadow-md'
                  : 'bg-[#05180E] text-[#A7C9B1] hover:text-white hover:bg-[#072414] border border-[#22C55E]/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#86EFAC] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user or task..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#05180E] border border-[#22C55E]/20 text-xs font-medium text-white placeholder:text-[#A7C9B1]/40 focus:outline-none focus:border-[#22C55E]"
          />
        </div>
      </div>

      {/* Submissions List Table / Cards */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-[#0B2516] border border-[#22C55E]/20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#22C55E] animate-spin mx-auto" />
          <p className="text-xs text-[#A7C9B1] font-bold">Loading task proof submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#0B2516] border border-[#22C55E]/20 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-[#22C55E]/40 mx-auto" />
          <h3 className="text-base font-black text-white">No Task Submissions Found</h3>
          <p className="text-xs text-[#A7C9B1] max-w-sm mx-auto">
            {statusFilter === 'PENDING'
              ? 'Great job! All pending task submissions have been reviewed and verified.'
              : 'No submissions match the current filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => {
            const isActing = actionLoadingId === sub.id;

            return (
              <div
                key={sub.id}
                className="p-5 rounded-3xl bg-[#0B2516] border border-[#22C55E]/20 hover:border-[#22C55E]/40 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 text-xs text-white"
              >
                {/* Left: Task & User info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Proof Thumbnail */}
                  <div
                    onClick={() =>
                      sub.proofImage &&
                      setPreviewImage({
                        url: sub.proofImage,
                        title: sub.taskTitle,
                        user: `${sub.userName} (${sub.userEmail})`,
                      })
                    }
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#05180E] border-2 border-[#22C55E]/40 overflow-hidden shrink-0 cursor-pointer group relative flex items-center justify-center hover:border-[#22C55E] transition-all shadow-sm"
                    title="Click to view full screenshot proof"
                  >
                    {sub.proofImage ? (
                      <>
                        <img
                          src={sub.proofImage}
                          alt="Task Proof Thumbnail"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </>
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#A7C9B1]" />
                    )}
                  </div>

                  {/* Task & Submitter Details */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-sm sm:text-base text-white truncate">
                        {sub.taskTitle}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#22C55E]/20 text-[#86EFAC] border border-[#22C55E]/30">
                        +{sub.reward}.00 GT Reward
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#A7C9B1]">
                      <span className="flex items-center gap-1 font-bold text-white">
                        <User className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>{sub.userName}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[#86EFAC]">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{sub.userEmail}</span>
                      </span>
                      <span className="text-[#A7C9B1]/60">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </span>
                    </div>

                    {/* User's Handle / Note if provided */}
                    {sub.proofNote && (
                      <div className="p-2 rounded-xl bg-[#05180E] border border-[#22C55E]/15 text-[11px] text-[#E2E8F0] max-w-lg">
                        <span className="font-bold text-[#86EFAC]">User Note / Handle: </span>
                        <span>{sub.proofNote}</span>
                      </div>
                    )}

                    {/* Admin Rejection comment if rejected */}
                    {sub.status === 'REJECTED' && sub.adminComment && (
                      <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/30 text-[11px] text-red-200 max-w-lg">
                        <span className="font-bold text-red-300">Rejection Reason: </span>
                        <span>{sub.adminComment}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status Badge & Actions */}
                <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                  {sub.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={isActing}
                        onClick={() => handleApprove(sub)}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:brightness-110 text-black font-black text-xs flex items-center gap-1.5 shadow-[0_4px_14px_rgba(34,197,94,0.3)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{isActing ? 'Approving...' : 'Approve & Credit'}</span>
                      </button>

                      <button
                        disabled={isActing}
                        onClick={() => {
                          setRejectingSub(sub);
                          setRejectReason('Screenshot proof could not be verified or was incomplete.');
                        }}
                        className="px-3.5 py-2.5 rounded-2xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : sub.status === 'APPROVED' ? (
                    <div className="px-4 py-2 rounded-2xl bg-[#05180E] border border-[#22C55E]/40 text-xs font-black text-[#86EFAC] flex items-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      <span>Approved (+{sub.reward} GT Credited)</span>
                    </div>
                  ) : (
                    <div className="px-4 py-2 rounded-2xl bg-red-950/60 border border-red-500/30 text-xs font-black text-red-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      <span>Rejected</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Screenshot Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-[#0B2516] border border-[#22C55E]/40 rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-[#22C55E]/20 pb-3">
              <div>
                <h3 className="font-black text-sm text-white">{previewImage.title}</h3>
                <p className="text-[11px] text-[#A7C9B1]">{previewImage.user}</p>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[68vh] overflow-auto rounded-2xl bg-[#05180E] border border-black/40 flex items-center justify-center">
              <img
                src={previewImage.url}
                alt="Full Proof Screenshot"
                className="max-w-full max-h-[64vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingSub && (
        <div
          onClick={() => setRejectingSub(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-[#0B2516] border border-red-500/40 rounded-3xl p-6 space-y-4 text-white shadow-2xl"
          >
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-black text-base text-white">Reject Task Submission</h3>
            </div>

            <p className="text-xs text-[#A7C9B1] leading-relaxed">
              Specify the reason for rejecting <strong>{rejectingSub.userName}</strong>'s proof for "<strong>{rejectingSub.taskTitle}</strong>". This feedback will be sent as an in-app notice.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#A7C9B1] uppercase tracking-wider">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Screenshot does not show following status"
                className="w-full p-3 rounded-2xl bg-[#05180E] border border-red-500/30 text-xs text-white placeholder:text-[#A7C9B1]/40 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectingSub(null)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoadingId === rejectingSub.id || !rejectReason.trim()}
                onClick={handleConfirmReject}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === rejectingSub.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

