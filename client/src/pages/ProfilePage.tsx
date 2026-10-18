import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  KeyRound,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Save,
  Trash2,
  Lock,
  LogOut,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';

export const ProfilePage: React.FC = () => {
  const { user, refreshSession, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [requestingEmail, setRequestingEmail] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSavingProfile(true);
    try {
      const res = await api.updateProfile({ fullName: fullName.trim() });
      if (res.success) {
        await refreshSession();
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      showToast(err.message || 'Password update failed', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === user?.email) {
      showToast('Please enter a different valid email address', 'error');
      return;
    }

    setRequestingEmail(true);
    try {
      const res = await api.requestEmailChange(newEmail.trim());
      if (res.success) {
        showToast(res.message || 'Verification link sent to new email.', 'success');
        setNewEmail('');
      }
    } catch (err: any) {
      showToast(err.message || 'Email change request failed', 'error');
    } finally {
      setRequestingEmail(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Please type DELETE in capital letters to confirm', 'error');
      return;
    }
    if (!deletePassword) {
      showToast('Please enter your password for verification', 'error');
      return;
    }

    setDeleting(true);
    try {
      const res = await api.deleteAccount({
        confirmationText: deleteConfirmText,
        password: deletePassword,
      });

      if (res.success) {
        showToast('Your account has been permanently deleted.', 'info');
        logout();
        navigate('/');
      }
    } catch (err: any) {
      showToast(err.message || 'Account deletion failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 w-full max-w-5xl mx-auto">
      
      {/* Header Profile Summary matching Dashboard theme */}
      <GlassCard glow className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-black/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] flex items-center justify-center font-black text-2xl text-white shadow-[0_8px_25px_rgba(34,197,94,0.35)]">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#0A341B]">{user?.fullName}</h1>
              <p className="text-xs font-semibold text-[#1E5E36]">{user?.email}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#15803D] border border-[#22C55E]/30 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Account Status: {user?.accountStatus || 'ACTIVE'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-[#DC2626] bg-[#FEE2E2]/80 border border-[#FCA5A5] hover:bg-[#FEE2E2] transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Account Details Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/80 border border-white space-y-1 shadow-sm">
            <span className="text-[#1E5E36] font-bold block text-[11px] uppercase tracking-wider">Referral Code</span>
            <span className="font-mono font-black text-sm text-[#15803D]">{user?.referralCode}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 border border-white space-y-1 shadow-sm">
            <span className="text-[#1E5E36] font-bold block text-[11px] uppercase tracking-wider">Account Role</span>
            <span className="font-black text-sm text-[#0A341B]">{user?.role}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 border border-white space-y-1 shadow-sm">
            <span className="text-[#1E5E36] font-bold block text-[11px] uppercase tracking-wider">Joined Date</span>
            <span className="font-semibold text-sm text-[#0A341B]">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 border border-white space-y-1 shadow-sm">
            <span className="text-[#1E5E36] font-bold block text-[11px] uppercase tracking-wider">Email Verification</span>
            <span className="font-black text-sm text-[#15803D] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Edit Profile Form */}
      <GlassCard className="space-y-4">
        <h2 className="text-base font-black text-[#0A341B] flex items-center gap-2">
          <User className="w-4.5 h-4.5 text-[#16A34A]" />
          <span>Edit Personal Details</span>
        </h2>

        <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E5E36]">Display Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-white text-sm font-semibold text-[#0A341B] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_6px_20px_rgba(34,197,94,0.35)] hover:shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </GlassCard>

      {/* Security: Change Password */}
      <GlassCard className="space-y-4">
        <h2 className="text-base font-black text-[#0A341B] flex items-center gap-2">
          <KeyRound className="w-4.5 h-4.5 text-[#16A34A]" />
          <span>Change Account Password</span>
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E5E36]">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-white text-sm font-semibold text-[#0A341B] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E5E36]">New Password (min 6 chars)</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-white text-sm font-semibold text-[#0A341B] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E5E36]">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-white text-sm font-semibold text-[#0A341B] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_6px_20px_rgba(34,197,94,0.35)] hover:shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </GlassCard>

      {/* Email Change with Verification */}
      <GlassCard className="space-y-4">
        <h2 className="text-base font-black text-[#0A341B] flex items-center gap-2">
          <Mail className="w-4.5 h-4.5 text-[#16A34A]" />
          <span>Request Email Change</span>
        </h2>
        <p className="text-xs text-[#1E5E36] font-medium leading-relaxed">
          Current email is <strong className="text-[#0A341B]">{user?.email}</strong>. Entering a new email sends a verification link to confirm ownership.
        </p>

        <form onSubmit={handleRequestEmailChange} className="space-y-3.5 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E5E36]">New Email Address</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="newemail@example.com"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-white text-sm font-semibold text-[#0A341B] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>

          <button
            type="submit"
            disabled={requestingEmail}
            className="px-6 py-3 rounded-2xl font-bold text-xs text-[#15803D] bg-white hover:bg-white/80 border border-white shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{requestingEmail ? 'Sending...' : 'Send Verification Request'}</span>
          </button>
        </form>
      </GlassCard>

      {/* Danger Zone: Mandatory Account Deletion */}
      <div className="rounded-3xl border-2 border-red-200 bg-red-50/60 p-6 space-y-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[#DC2626]">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-base font-black">Danger Zone: Irreversible Account Deletion</h2>
        </div>

        <p className="text-xs text-[#991B1B] leading-relaxed max-w-2xl font-medium">
          Permanently delete your GT account and anonymize all personal identifying data in accordance with data privacy regulations. Active sessions will be revoked and this account cannot be recovered.
        </p>

        <button
          onClick={() => setDeleteModal(true)}
          className="px-5 py-2.5 rounded-2xl font-bold text-xs text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account Permanently</span>
        </button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border-2 border-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#DC2626]">
              <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#0A341B]">Confirm Account Deletion</h3>
                <p className="text-xs text-[#DC2626] font-bold">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#1E5E36] leading-relaxed font-medium">
              Your profile, personal details, and sessions will be immediately erased. To protect against accidental actions, please verify your credentials below:
            </p>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E5E36]">
                  Type <strong className="font-mono text-[#DC2626]">DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-white text-xs font-mono font-bold text-[#0A341B] shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E5E36]">Account Password:</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-white text-xs font-medium text-[#0A341B] shadow-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-[#1E5E36] bg-white hover:bg-white/80 border border-white shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE' || !deletePassword}
                className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 transition-all shadow-md"
              >
                {deleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
