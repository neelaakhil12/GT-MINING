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

  const [deletionRequest, setDeletionRequest] = useState<any>(null);

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
      if (res.success) {
        setPendingRequest(res.request || null);
      }
    } catch {}
  };

  const fetchDeletionStatus = async () => {
    try {
      const res = await api.getAccountDeletionStatus();
      if (res.success) {
        setDeletionRequest(res.request || null);
      }
    } catch {}
  };

  useEffect(() => {
    fetchEmailStatus();
    fetchDeletionStatus();
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

  const handleRequestDeletion = async () => {
    const ok = window.confirm(
      'Are you sure you want to request account deletion?\n\nThis will send a deletion request to the Administrator in the Notifications panel. Once the administrator approves it, your account will be deleted permanently.'
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await api.requestAccountDeletion();
      if (res.success) {
        showToast(res.message || 'Account deletion request submitted for admin approval.', 'success');
        await fetchDeletionStatus();
      } else {
        showToast(res.message || 'Failed to submit deletion request', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting deletion request', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    if (!window.confirm('Cancel your account deletion request?')) return;
    try {
      const res = await api.cancelAccountDeletionRequest();
      if (res.success) {
        showToast('Account deletion request cancelled.', 'info');
        await fetchDeletionStatus();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel request', 'error');
    }
  };

  return (
    <div className="space-y-5 w-full max-w-xl mx-auto pb-32 sm:pb-36 px-2 sm:px-0">
      
      {/* Header Profile Summary matching Dashboard theme */}
      <GlassCard glow className="space-y-5">
        <div className="flex items-center gap-4 border-b border-black/5 pb-5">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] flex items-center justify-center font-black text-2xl text-white shadow-[0_8px_25px_rgba(34,197,94,0.35)] overflow-hidden shrink-0 border-2 border-white">
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
          <div className="space-y-0.5 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#0A341B] truncate">{user?.fullName}</h1>
            <p className="text-xs font-semibold text-[#1E5E36] truncate">{user?.email}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#15803D] border border-[#22C55E]/30 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Account Status: {user?.accountStatus || 'ACTIVE'}</span>
            </div>
          </div>
        </div>

        {/* Account Details Metadata (Matching App's 4-card grid) */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/80 border border-white space-y-1 shadow-sm">
            <span className="text-[#1E5E36] font-bold block text-[10.5px] uppercase tracking-wider">Referral Code</span>
            <span className="font-mono font-black text-sm text-[#15803D]">{user?.referralCode}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/80 border border-white space-y-1 shadow-sm">
            <span className="text-[#1E5E36] font-bold block text-[10.5px] uppercase tracking-wider">Account Role</span>
            <span className="font-black text-sm text-[#0A341B]">{user?.role}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/80 border border-white space-y-1 shadow-sm">
            <span className="text-[#1E5E36] font-bold block text-[10.5px] uppercase tracking-wider">Joined Date</span>
            <span className="font-semibold text-sm text-[#0A341B]">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/80 border border-white space-y-1 shadow-sm">
            <span className="text-[#1E5E36] font-bold block text-[10.5px] uppercase tracking-wider">Email Verification</span>
            <span className="font-black text-sm text-[#15803D] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Profile Picture Card */}
      <GlassCard className="space-y-5">
        <div>
          <h2 className="text-base font-black text-[#0A341B] flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#16A34A]" />
            <span>Profile Photo</span>
          </h2>
          <p className="text-xs text-[#1E5E36] font-medium mt-1">
            Upload your custom profile photo from device.
          </p>
        </div>

        {/* Live Preview & Buttons */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/90 shadow-sm flex flex-col sm:flex-row items-center gap-5">
          {/* Active Preview */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] flex items-center justify-center font-black text-2xl text-white shadow-[0_8px_25px_rgba(34,197,94,0.35)] overflow-hidden border-2 border-white">
              {selectedAvatar ? (
                <img
                  src={selectedAvatar}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Action Details & Buttons */}
          <div className="space-y-2.5 text-center sm:text-left flex-1">
            <div>
              <span className="text-xs font-bold text-[#0A341B] block">Current Photo Status</span>
              <span className="text-[11px] text-[#1E5E36] font-semibold">
                {selectedAvatar
                  ? selectedAvatar.includes('dicebear') || selectedAvatar.startsWith('data:image/svg+xml')
                    ? 'Preset Selected'
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

              {/* Upload Profile Image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#16A34A] hover:bg-[#15803D] shadow-[0_4px_14px_rgba(22,163,74,0.35)] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Profile Image</span>
              </button>

              {/* Choose Preset */}
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
                <span>{showAvatarPicker ? 'Hide Presets' : 'Choose Preset'}</span>
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

        {pendingRequest && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
              pendingRequest.status === 'APPROVED'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : pendingRequest.status === 'REJECTED'
                ? 'bg-red-50 border-red-300 text-red-800'
                : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}
          >
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <span>Email Change Request:</span>
                <span className="font-mono text-[11px] underline">
                  {pendingRequest.requestedNewEmail || pendingRequest.requested_email}
                </span>
              </div>
              <p className="text-[11px] mt-0.5 opacity-80">
                {pendingRequest.status === 'APPROVED'
                  ? 'Request has been approved by Administrator.'
                  : pendingRequest.status === 'REJECTED'
                  ? `Request was rejected by Administrator.${pendingRequest.reason ? ' Reason: ' + pendingRequest.reason : ''}`
                  : 'Awaiting Administrator review in Admin Notifications.'}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                pendingRequest.status === 'APPROVED'
                  ? 'bg-emerald-200 text-emerald-900'
                  : pendingRequest.status === 'REJECTED'
                  ? 'bg-red-200 text-red-900'
                  : 'bg-amber-200 text-amber-900 animate-pulse'
              }`}
            >
              {pendingRequest.status}
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

      {/* Danger Zone: Account Deletion Request */}
      <div className="rounded-3xl border-2 border-red-200 bg-red-50/60 p-6 space-y-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[#DC2626]">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-base font-black">Danger Zone: Account Deletion Request</h2>
        </div>

        <p className="text-xs text-[#991B1B] leading-relaxed max-w-2xl font-medium">
          Once requested, an account deletion request will be submitted to the Administrator under the Notifications tab. Only upon admin approval will your account and associated records be permanently erased.
        </p>

        {deletionRequest && deletionRequest.status === 'PENDING' ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-bold flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 uppercase">
                  PENDING APPROVAL
                </span>
                <span>Deletion Request Sent to Administrator</span>
              </div>
              <p className="text-[11px] text-amber-800/80">
                Awaiting administrator review in Notifications panel. Your account remains active until approved.
              </p>
            </div>
            <button
              onClick={handleCancelDeletion}
              className="px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 transition-colors cursor-pointer self-start sm:self-auto"
            >
              Cancel Request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {deletionRequest && deletionRequest.status === 'REJECTED' && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium">
                Previous account deletion request was rejected by Administrator. Your account remains active.
              </div>
            )}
            <button
              onClick={handleRequestDeletion}
              disabled={deleting}
              className="px-5 py-2.5 rounded-2xl font-bold text-xs text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{deleting ? 'Submitting Request...' : 'Request Account Deletion'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full py-3.5 rounded-2xl text-xs font-black text-[#DC2626] bg-[#FEE2E2]/90 border border-[#FCA5A5] hover:bg-[#FEE2E2] hover:shadow-md transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#DC2626]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
