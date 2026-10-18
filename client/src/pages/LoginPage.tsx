import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GtLogo } from '../components/GtLogo';
import { GlassCard } from '../components/GlassCard';

export const LoginPage: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      showToast('Welcome back to GT Mining!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      showToast(err.message || 'Login failed', 'error');
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
      navigate(from, { replace: true });
    } catch (err: any) {
      showToast('Google sign-in error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@gtmining.com');
      setPassword('Admin@123456');
    } else {
      setEmail('demo@gtmining.com');
      setPassword('User@123456');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block mb-2">
            <GtLogo size="lg" animated glow />
          </Link>
          <h2 className="text-3xl font-black text-[#0A341B] tracking-tight">Welcome Back</h2>
          <p className="text-sm font-medium text-[#1E5E36]">Access your GT wallet & 4-hour mining cycle</p>
        </div>

        <GlassCard glow className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#F87171]/40 flex items-center gap-2.5 text-xs text-[#DC2626]">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E5E36]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#1E5E36] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1E5E36]">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#16A34A] hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1E5E36] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_25px_rgba(34,197,94,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to GT'}</span>
            </button>
          </form>

          {/* Google Login */}
          <div className="space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-black/10 w-full" />
              <span className="bg-white/80 px-3 text-[11px] font-bold text-[#1E5E36] absolute rounded-full">OR</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-2xl border border-white/90 bg-white/80 hover:bg-white text-xs font-bold text-[#0A341B] transition-all flex items-center justify-center gap-2.5 shadow-sm"
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
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Quick Demo Credentials Shortcut */}
          <div className="pt-2 border-t border-black/5 space-y-2">
            <p className="text-[11px] font-bold text-[#1E5E36] text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-[#16A34A]" />
              <span>Instant Test Fill:</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('user')}
                className="py-1.5 px-2 rounded-xl bg-white/70 hover:bg-white text-[11px] font-bold text-[#15803D] border border-white text-center shadow-sm"
              >
                Demo Miner
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="py-1.5 px-2 rounded-xl bg-white/70 hover:bg-white text-[11px] font-bold text-[#B45309] border border-white text-center shadow-sm"
              >
                Admin Account
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Footer Link */}
        <p className="text-center text-xs font-semibold text-[#1E5E36]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#16A34A] font-black hover:underline">
            Create Free Account
          </Link>
        </p>
      </div>
    </div>
  );
};
