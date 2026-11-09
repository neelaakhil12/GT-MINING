import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Save,
  Trash2,
  LogOut,
  Sparkles,
  CheckCircle2,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { BOY_AVATARS, GIRL_AVATARS, ALL_AVATARS } from '../constants/avatars';

export const ProfilePage: React.FC = () => {
  const { user, refreshSession, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [newEmail, setNewEmail] = useState('');
  const [pendingRequest, setPendingRequest] = useState<any>(null);

  // Avatar and photo states
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [activeGenderTab, setActiveGenderTab] = useState<'boy' | 'girl'>('boy');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    user?.avatar || user?.profileImage || user?.avatarUrl || null
  );
  const [savingAvatar, setSavingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [requestingEmail, setRequestingEmail] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setSelectedAvatar(user.avatar || user.profileImage || user.avatarUrl || null);
    }
  }, [user]);

  const fetchEmailStatus = async () => {
    try {
      const res = await api.getEmailChangeStatus();
      if (res.success && res.request) {
        setPendingRequest(res.request);
      }
    } catch {}
  };

  useEffect(() => {
    fetchEmailStatus();
  }, []);

  // Handle Photo File Upload with Canvas Center Crop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image size exceeds 8MB. Please select a smaller photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetSize = 256;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setSelectedAvatar(dataUrl);
          showToast('Image loaded! Tap "Save Profile Photo" to persist permanently.', 'info');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save Avatar / Profile Photo to Database
  const handleSaveAvatar = async (avatarToSave?: string) => {
    const target = avatarToSave || selectedAvatar;
    if (!target) {
      showToast('Please choose an avatar or upload a picture first.', 'error');
      return;
    }

    setSavingAvatar(true);
    try {
      const res = await api.updateProfile({
        avatar: target,
        profileImage: target,
        avatarUrl: target,
      });

      if (res.success) {
        await refreshSession();
        showToast('Profile photo saved permanently to database!', 'success');
      } else {
        throw new Error(res.message || 'Failed to save profile image');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save profile picture', 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

  // Remove Avatar / Revert to Initial
  const handleRemoveAvatar = async () => {
    setSavingAvatar(true);
    try {
      const res = await api.updateProfile({
        avatar: '',
        profileImage: '',
        avatarUrl: '',
      });

      if (res.success) {
        setSelectedAvatar(null);
        await refreshSession();
        showToast('Profile photo cleared. Default initial restored.', 'info');
      } else {
        throw new Error(res.message || 'Failed to clear profile image');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to clear avatar', 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

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
        showToast(res.message || 'Email change request submitted! Admin will review and approve.', 'success');
        setNewEmail('');
        await fetchEmailStatus();
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
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      
      {/* Header Profile Summary matching Dashboard theme */}
      <GlassCard glow className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-black/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] flex items-center justify-center font-black text-2xl text-white shadow-[0_8px_25px_rgba(34,197,94,0.35)] overflow-hidden shrink-0 border-2 border-white">
              {user?.avatar || user?.profileImage || user?.avatarUrl ? (
                <img
                  src={user.avatar || user.profileImage || user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.fullName.charAt(0).toUpperCase()
              )}
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

      {/* Profile Picture & Avatar Selection Card */}
      <GlassCard className="space-y-6">
        <div>
          <h2 className="text-base font-black text-[#0A341B] flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#16A34A]" />
            <span>Profile Photo & Avatar</span>
          </h2>
          <p className="text-xs text-[#1E5E36] font-medium mt-1">
            Upload your custom profile photo from device or select an exclusive Boy / Girl avatar.
          </p>
        </div>

        {/* Live Preview & Two Main Buttons */}
        <div className="p-5 rounded-3xl bg-white/80 border border-white/90 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          {/* Active Preview */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] flex items-center justify-center font-black text-3xl text-white shadow-[0_8px_25px_rgba(34,197,94,0.35)] overflow-hidden border-2 border-white">
              {selectedAvatar ? (
                <img
                  src={selectedAvatar}
                  alt="Profile Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Action Details & The Two Main Buttons */}
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div>
              <span className="text-xs font-bold text-[#0A341B] block">Current Photo Status</span>
              <span className="text-[11px] text-[#1E5E36] font-semibold">
                {selectedAvatar
                  ? selectedAvatar.includes('dicebear') || selectedAvatar.startsWith('data:image/svg+xml')
                    ? 'Avatar Preset Selected'
                    : 'Custom Image Uploaded'
                  : 'Using Default Letter Initial'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />

              {/* BUTTON 1: Upload Profile Image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#16A34A] hover:bg-[#15803D] shadow-[0_4px_14px_rgba(22,163,74,0.35)] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Profile Image</span>
              </button>

              {/* BUTTON 2: Choose Avatar */}
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs border shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  showAvatarPicker
                    ? 'bg-[#059669] text-white border-[#059669]'
                    : 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] hover:bg-[#BBF7D0]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showAvatarPicker ? 'Hide Avatars' : 'Choose Avatar'}</span>
              </button>

              {/* Remove / Reset Button */}
              {selectedAvatar && (
                <button
                  type="button"
                  disabled={savingAvatar}
                  onClick={handleRemoveAvatar}
                  className="px-3 py-2.5 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 border border-red-200 transition-all flex items-center gap-1 cursor-pointer"
                  title="Remove avatar and restore default initial"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AVATAR PICKER (5 Boys & 5 Girls Horizontally Scrollable) */}
        {showAvatarPicker && (
          <div className="p-5 rounded-3xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-4">
            {/* Gender Switch Tabs */}
            <div className="flex gap-2 max-w-xs">
              <button
                type="button"
                onClick={() => setActiveGenderTab('boy')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeGenderTab === 'boy'
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : 'bg-white text-[#166534] border border-[#DCFCE7] hover:bg-white/90'
                }`}
              >
                👦 Boys Avatars (3)
              </button>
              <button
                type="button"
                onClick={() => setActiveGenderTab('girl')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeGenderTab === 'girl'
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : 'bg-white text-[#166534] border border-[#DCFCE7] hover:bg-white/90'
                }`}
              >
                👧 Girls Avatars (3)
              </button>
            </div>

            {/* Horizontally Scrollable Row */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-green-300">
              {(activeGenderTab === 'boy' ? BOY_AVATARS : GIRL_AVATARS).map((av) => {
                const isSelected = selectedAvatar === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`shrink-0 w-24 p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#DCFCE7] border-[#16A34A] shadow-[0_4px_18px_rgba(34,197,94,0.3)] ring-2 ring-[#22C55E]/50'
                        : 'bg-white border-[#E5E7EB] hover:border-[#16A34A]/50 shadow-xs'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xs border border-white/60">
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-[10.5px] font-bold text-center truncate w-full ${isSelected ? 'text-[#15803D]' : 'text-[#4B5563]'}`}>
                      {av.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Save Avatar Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={savingAvatar || !selectedAvatar}
                onClick={() => handleSaveAvatar()}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#16A34A] to-[#15803D] shadow-[0_4px_14px_rgba(22,163,74,0.35)] hover:shadow-md flex items-center gap-2 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingAvatar ? 'Saving Avatar...' : 'Save Avatar'}</span>
              </button>
            </div>
          </div>
        )}
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

      {/* Email Change with Verification */}
      <GlassCard className="space-y-4">
        <h2 className="text-base font-black text-[#0A341B] flex items-center gap-2">
          <Mail className="w-4.5 h-4.5 text-[#16A34A]" />
          <span>Request Email Change</span>
        </h2>
        <p className="text-xs text-[#1E5E36] font-medium leading-relaxed">
          Current registered email is <strong className="text-[#0A341B]">{user?.email}</strong>. Submit a new email address to request an account email change. Once approved by the administrator, your login email will be updated.
        </p>

        {pendingRequest && pendingRequest.status === 'PENDING' && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-800 flex items-center justify-between">
            <div>
              <span className="font-bold block text-amber-900">Pending Admin Approval</span>
              <span className="text-[11px] font-mono">Requested: {pendingRequest.requestedNewEmail}</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
              Under Review
            </span>
          </div>
        )}

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
            className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_6px_20px_rgba(34,197,94,0.35)] hover:shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{requestingEmail ? 'Submitting Request...' : 'Send Change Request'}</span>
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

      {/* Account Session Logout Section (At the end of Profile Page) */}
      <div className="rounded-3xl border border-white/80 bg-white/70 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#0A341B]">
            <LogOut className="w-5 h-5 text-[#DC2626]" />
            <h3 className="text-sm font-black text-[#0A341B]">Session & Security</h3>
          </div>
          <p className="text-xs text-[#1E5E36] font-medium">
            Safely log out of your active GT Pioneer session on this device.
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="px-6 py-3 rounded-2xl text-xs font-black text-[#DC2626] bg-[#FEE2E2]/90 border border-[#FCA5A5] hover:bg-[#FEE2E2] hover:shadow-md transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of Account</span>
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
