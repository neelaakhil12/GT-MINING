import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Gift, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GtCoin } from '../components/GtCoin';
import { GlassCard } from '../components/GlassCard';

export const SignupPage: React.FC = () => {
  const { signup, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signup({
        fullName,
        email,
        password,
        confirmPassword,
        referralCode: referralCode.trim() || undefined,
      });
      showToast('Account created! Welcome to GT Mining!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
      showToast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await googleLogin({
        email: 'google_user@gtmining.com',
        name: 'Google Verified Miner',
      });
      showToast('Signed in with Google successfully!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      showToast('Google sign-in error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block mb-2">
            <GtCoin size="lg" animated glow />
          </Link>
          <h2 className="text-3xl font-black text-white tracking-tight">Create Free Account</h2>
          <p className="text-sm text-[#A7C9B1]">Join the decentralized GT virtual mining network</p>
        </div>

        <GlassCard glow className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#2A0D0D]/90 border border-[#F87171]/40 flex items-center gap-2.5 text-xs text-[#FEE2E2]">
              <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A7C9B1]">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Reynolds"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7C9B1]">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7C9B1]">Confirm</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A7C9B1] flex items-center justify-between">
                <span>Referral Code (Optional)</span>
                {referralCode && <span className="text-[#4ADE80] text-[10px]">Attributed</span>}
              </label>
              <div className="relative">
                <Gift className="w-4 h-4 text-[#22C55E] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GT88241"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm font-mono uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Register & Start Mining'}</span>
            </button>
          </form>

          {/* Google Login */}
          <div className="space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#86EFAC]/15 w-full" />
              <span className="bg-[#0B2516] px-3 text-[11px] font-semibold text-[#A7C9B1] absolute">OR</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-[#86EFAC]/25 bg-[#071F14]/70 hover:bg-[#071F14] text-xs font-bold text-[#F0FDF4] transition-all flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.15C3.25 21.37 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.27 6.61l4 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>Sign Up with Google</span>
            </button>
          </div>
        </GlassCard>

        <p className="text-center text-xs text-[#A7C9B1]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#4ADE80] font-bold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
