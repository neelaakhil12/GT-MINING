import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { GtCoin } from '../components/GtCoin';
import { GlassCard } from '../components/GlassCard';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.forgotPassword(email);
      setSubmitted(true);
      showToast('Password reset instructions generated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to request reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.resetPassword({ email, newPassword });
      setResetSuccess(true);
      showToast('Password reset successfully! You can now log in.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block mb-2">
            <GtCoin size="lg" glow />
          </Link>
          <h2 className="text-3xl font-black text-white tracking-tight">Account Recovery</h2>
          <p className="text-sm text-[#A7C9B1]">Reset your GT Mining account password</p>
        </div>

        <GlassCard glow className="space-y-6">
          {resetSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-[#16A34A]/20 border border-[#4ADE80]/30 mx-auto flex items-center justify-center text-[#4ADE80]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Password Updated!</h3>
              <p className="text-xs text-[#A7C9B1]">
                Your new password has been saved securely. You can now access your dashboard.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#16A34A] to-[#22C55E]"
              >
                Return to Login
              </Link>
            </div>
          ) : !submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7C9B1]">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#16A34A] to-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Processing...' : 'Continue to Reset'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#16A34A]/10 border border-[#86EFAC]/20 text-xs text-[#86EFAC]">
                Enter a new password for <strong className="text-white">{email}</strong>:
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7C9B1]">New Password (min 6 chars)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#16A34A] to-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-[#A7C9B1] hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
