import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ShieldAlert,
  Mail,
  Lock,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

const MASTER_ADMIN_EMAIL = 'gtmining2026@gmail.com';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: 'LOGIN' | 'FORGOT' | 'RESET'
  const [mode, setMode] = useState<'LOGIN' | 'FORGOT' | 'RESET'>('LOGIN');

  // Form states
  const [email, setEmail] = useState(MASTER_ADMIN_EMAIL);
  const [password, setPassword] = useState('Admin@123456');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check URL query parameters for direct email link clicks (?mode=reset&otp=123456)
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    const urlOtp = searchParams.get('otp') || searchParams.get('token');
    const urlEmail = searchParams.get('email');

    if (urlEmail && urlEmail.toLowerCase() === MASTER_ADMIN_EMAIL) {
      setEmail(MASTER_ADMIN_EMAIL);
    }
    if (urlOtp) {
      setOtpCode(urlOtp);
      setMode('RESET');
      setSuccessMsg('Reset verification code loaded from your email link. Enter your new password below.');
    } else if (urlMode === 'reset') {
      setMode('RESET');
    } else if (urlMode === 'forgot') {
      setMode('FORGOT');
    }
  }, [searchParams]);

  // Handle Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== MASTER_ADMIN_EMAIL) {
      const deniedMsg = `Access Denied: Only Master Admin (${MASTER_ADMIN_EMAIL}) can access this gateway.`;
      setError(deniedMsg);
      showToast(deniedMsg, 'error');
      return;
    }

    setLoading(true);
    try {
      await login({ email: cleanEmail, password });
      showToast('Welcome, Master Administrator!', 'success');
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Admin authentication failed. Please verify your credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Send Password Reset Link & Code to Gmail
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== MASTER_ADMIN_EMAIL) {
      const deniedMsg = `Access Denied: Password reset is strictly restricted to ${MASTER_ADMIN_EMAIL}.`;
      setError(deniedMsg);
      showToast(deniedMsg, 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(cleanEmail, true);
      if (res && res.success) {
        const msg = res.message || `Password reset link and verification code sent to ${cleanEmail}.`;
        setSuccessMsg(msg);
        showToast('Password reset link sent to gtmining2026@gmail.com!', 'success');
        setMode('RESET');
      } else {
        throw new Error(res?.message || 'Failed to dispatch password recovery email.');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to send recovery email. Please check server SMTP configuration.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Confirm New Password with OTP
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit verification code from your email.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        email: MASTER_ADMIN_EMAIL,
        newPassword,
        otpCode: cleanOtp,
      });

      if (res && res.success) {
        showToast('Admin password updated successfully! Please sign in.', 'success');
        setPassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
        setOtpCode('');
        setSuccessMsg('Your master admin password has been updated! You can now sign in with your new password.');
        setMode('LOGIN');
      } else {
        throw new Error(res?.message || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to reset admin password.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = () => {
    setEmail(MASTER_ADMIN_EMAIL);
    setPassword('Admin@123456');
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Header with High-Contrast Typography */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] border-2 border-[#F59E0B] mx-auto flex items-center justify-center text-[#D97706] shadow-[0_8px_20px_rgba(245,158,11,0.25)]">
            {mode === 'LOGIN' ? (
              <ShieldAlert className="w-8 h-8" />
            ) : mode === 'FORGOT' ? (
              <RotateCcw className="w-8 h-8 text-[#D97706]" />
            ) : (
              <KeyRound className="w-8 h-8 text-[#D97706]" />
            )}
          </div>
          <h2 className="text-3xl font-black text-[#0A341B] tracking-tight">
            {mode === 'LOGIN'
              ? 'Admin Gateway'
              : mode === 'FORGOT'
              ? 'Admin Password Recovery'
              : 'Set New Admin Password'}
          </h2>
          <p className="text-sm font-semibold text-[#1E5E36]">
            {mode === 'LOGIN'
              ? 'Restricted access: gtmining2026@gmail.com only'
              : mode === 'FORGOT'
              ? 'Dispatches password reset link to master email'
              : 'Enter verification code and new password'}
          </p>
        </div>

        {/* Unified Cyber Green Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0B2516]/95 border-2 border-[#F59E0B]/50 shadow-2xl space-y-6 text-white backdrop-blur-xl">
          
          {/* Status Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-500/40 flex items-center gap-2.5 text-xs font-semibold text-red-200">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-[#071F14] border border-[#22C55E]/40 flex items-center gap-2.5 text-xs font-semibold text-[#86EFAC]">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. LOGIN MODE */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A7C9B1] uppercase tracking-wider flex justify-between">
                  <span>Master Admin Email</span>
                  <span className="text-[10px] text-[#FBBF24] font-semibold lowercase">authorized only</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#86EFAC] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={MASTER_ADMIN_EMAIL}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#05160E] border border-[#86EFAC]/30 text-white placeholder:text-[#A7C9B1]/40 text-sm font-semibold focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/30 outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#A7C9B1] uppercase tracking-wider">
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMsg(null);
                      setMode('FORGOT');
                    }}
                    className="text-xs font-bold text-[#FBBF24] hover:text-[#F59E0B] transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#86EFAC] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#05160E] border border-[#86EFAC]/30 text-white placeholder:text-[#A7C9B1]/40 text-sm font-semibold focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/30 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#86EFAC] hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-[#0A341B] bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] hover:brightness-105 shadow-[0_8px_20px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
              >
                <ShieldCheck className="w-4 h-4 text-[#0A341B]" />
                <span>{loading ? 'Authenticating Gateway...' : 'Enter Admin Console'}</span>
              </button>
            </form>
          )}

          {/* 2. FORGOT PASSWORD MODE (Request Reset Email) */}
          {mode === 'FORGOT' && (
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#071F14] border border-[#F59E0B]/40 text-xs text-[#FDE68A] leading-relaxed">
                Clicking the button below will dispatch a secure <strong>password reset link</strong> and a <strong>6-digit verification code</strong> via Gmail SMTP to <strong>{MASTER_ADMIN_EMAIL}</strong>.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A7C9B1] uppercase tracking-wider">
                  Master Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#86EFAC] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    readOnly
                    value={MASTER_ADMIN_EMAIL}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-sm font-bold cursor-not-allowed select-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-[#0A341B] bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] hover:brightness-105 shadow-[0_8px_20px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
              >
                <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Dispatching Reset Link...' : 'Send Password Reset Link to Email'}</span>
              </button>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('LOGIN');
                  }}
                  className="text-xs font-bold text-[#86EFAC] hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('RESET');
                  }}
                  className="text-xs font-bold text-[#FBBF24] hover:text-[#F59E0B] cursor-pointer"
                >
                  Already have code?
                </button>
              </div>
            </form>
          )}

          {/* 3. RESET PASSWORD MODE (Enter Code & New Password) */}
          {mode === 'RESET' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A7C9B1] uppercase tracking-wider">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#86EFAC] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 542891"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#05160E] border border-[#86EFAC]/30 text-white placeholder:text-[#A7C9B1]/40 text-base font-black tracking-widest focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/30 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A7C9B1] uppercase tracking-wider">
                  New Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#86EFAC] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter min. 6 characters"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#05160E] border border-[#86EFAC]/30 text-white placeholder:text-[#A7C9B1]/40 text-sm font-semibold focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/30 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#86EFAC] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A7C9B1] uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#86EFAC] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#05160E] border border-[#86EFAC]/30 text-white placeholder:text-[#A7C9B1]/40 text-sm font-semibold focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/30 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-[#0A341B] bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] hover:brightness-105 shadow-[0_8px_20px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0A341B]" />
                <span>{loading ? 'Updating Password...' : 'Save New Master Admin Password'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('LOGIN');
                  }}
                  className="text-xs font-bold text-[#86EFAC] hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Admin Login</span>
                </button>
              </div>
            </form>
          )}

          {/* Master Admin Credentials Callout with 1-click Auto-Fill */}
          <div className="p-3.5 rounded-2xl bg-[#071F14] border border-[#F59E0B]/40 text-center space-y-1.5 shadow-sm">
            <p className="text-xs font-bold text-[#FBBF24] flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>Authorized Master Admin Credentials</span>
            </p>
            <p className="text-xs font-mono font-bold text-[#86EFAC] tracking-wide select-all">
              {MASTER_ADMIN_EMAIL} • Admin@123456
            </p>
            <button
              type="button"
              onClick={handleFillCredentials}
              className="text-[11px] font-bold text-[#FBBF24] hover:text-[#FCD34D] underline cursor-pointer"
            >
              Click to Auto-Fill Master Credentials
            </button>
          </div>

          {/* Return to User Login Link */}
          <div className="text-center pt-1">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#86EFAC] hover:text-white transition-colors py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to User Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
