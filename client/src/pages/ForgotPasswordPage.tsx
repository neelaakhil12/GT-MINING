import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Lock, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { GtLogo } from '../components/GtLogo';
import { GlassCard } from '../components/GlassCard';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user clicked direct link from email: ?email=...&otp=...
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp');

    if (emailParam) {
      setEmail(emailParam);
      if (otpParam) {
        setOtpCode(otpParam);
        setSubmitted(true);
      }
    }
  }, [searchParams]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.forgotPassword(email.trim());
      setSubmitted(true);
      showToast(res.message || 'Verification code sent to your email!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch email. Please check the address.');
      showToast(err.message || 'Failed to dispatch email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (newPassword.length < 6) {
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
        email: email.trim(),
        newPassword,
        otpCode: otpCode.trim(),
      });
      setResetSuccess(true);
      showToast(res.message || 'Password reset successfully! You can now log in.', 'success');
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Invalid or expired code.');
      showToast(err.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block mb-2">
            <GtLogo size="lg" animated glow />
          </Link>
          <h2 className="text-3xl font-black text-[#0A341B] tracking-tight">Account Recovery</h2>
          <p className="text-sm font-medium text-[#1E5E36]">
            {submitted ? 'Verify OTP code & set new password' : 'Reset your GT Mining account password'}
          </p>
        </div>

        <GlassCard glow className="space-y-6 bg-white/85 shadow-xl border border-white/80">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#F87171]/50 text-xs font-semibold text-[#DC2626]">
              {error}
            </div>
          )}

          {resetSuccess ? (
            /* SUCCESS STATE */
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-[#DCFCE7] border border-[#22C55E]/40 mx-auto flex items-center justify-center text-[#16A34A] shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-[#0A341B]">Password Updated!</h3>
              <p className="text-xs font-medium text-[#1E5E36] max-w-xs mx-auto leading-relaxed">
                Your password has been securely updated. You can now access your GT node with your new credentials.
              </p>
              <Link
                to="/login"
                className="inline-block px-8 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_25px_rgba(34,197,94,0.45)] transition-all"
              >
                Return to Login
              </Link>
            </div>
          ) : !submitted ? (
            /* STEP 1: ENTER EMAIL TO DISPATCH OTP */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E5E36]">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#1E5E36] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm font-medium text-[#0A341B] placeholder:text-[#1E5E36]/40 border border-[#22C55E]/30 bg-white/90"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_25px_rgba(34,197,94,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Dispatching Verification Code...' : 'Send Verification Code (OTP)'}</span>
              </button>
            </form>
          ) : (
            /* STEP 2: ENTER OTP & NEW PASSWORD */
            <form onSubmit={handleReset} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#EAF8EE] border border-[#22C55E]/30 text-xs text-[#1E5E36] leading-relaxed flex items-center justify-between">
                <span>
                  Code sent to <strong className="text-[#0A341B]">{email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-[11px] font-bold text-[#16A34A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Change Email</span>
                </button>
              </div>

              {/* 6-Digit OTP Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E5E36]">6-Digit Email Verification Code</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-base font-mono font-black tracking-widest text-[#0A341B] placeholder:text-[#1E5E36]/30 border border-[#22C55E]/30 bg-white/90 text-center sm:text-left"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E5E36]">New Password (min 6 chars)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#1E5E36] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm font-medium text-[#0A341B] placeholder:text-[#1E5E36]/40 border border-[#22C55E]/30 bg-white/90"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E5E36]">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#1E5E36] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm font-medium text-[#0A341B] placeholder:text-[#1E5E36]/40 border border-[#22C55E]/30 bg-white/90"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_25px_rgba(34,197,94,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Verifying & Updating...' : 'Save New Password'}</span>
              </button>
            </form>
          )}

          <div className="pt-1 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1E5E36] hover:text-[#0A341B] transition-colors py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
