import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GtCoin } from '../../components/GtCoin';
import { GlassCard } from '../../components/GlassCard';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@gtmining.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      showToast('Welcome, Administrator!', 'success');
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      showToast(err.message || 'Admin authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#FBBF24]/20 border border-[#FBBF24]/40 mx-auto flex items-center justify-center text-[#FBBF24] shadow-[0_0_25px_rgba(251,191,36,0.3)]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Admin Gateway</h2>
          <p className="text-xs text-[#A7C9B1]">Restricted access for platform management</p>
        </div>

        <GlassCard glow className="border-[#FBBF24]/30 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A7C9B1]">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A7C9B1]">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-[#07130D] bg-[#FBBF24] hover:bg-[#F59E0B] shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Enter Admin Console'}</span>
            </button>
          </form>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
            <p className="text-[11px] font-semibold text-[#86EFAC] flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FBBF24]" />
              <span>Default Master Admin Credentials</span>
            </p>
            <p className="text-[11px] font-mono text-[#A7C9B1]">
              admin@gtmining.com • Admin@123456
            </p>
          </div>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[#A7C9B1] hover:text-white">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to User Login</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
