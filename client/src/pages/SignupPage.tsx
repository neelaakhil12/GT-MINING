import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Gift, AlertCircle, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';
import { triggerGoogleSignIn, checkGoogleRedirectResponse } from '../services/googleAuth';

export const SignupPage: React.FC = () => {
  const { signup, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form Fields (Split into First Name & Last Name as in design)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format seconds to mm:ss format (e.g. 00:26)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Read referral code from URL query param ?ref=...
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
    }
  }, [searchParams]);

  // Handle return from Google OAuth redirect flow
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await checkGoogleRedirectResponse();
        if (result && result.profile) {
          setLoading(true);
          await googleLogin({
            email: result.profile.email,
            name: result.profile.name,
            googleId: result.profile.sub,
            isSignup: true,
            referralCode: referralCode.trim() || undefined,
          });
          showToast('Signed up with Google successfully! Welcome to GT Mining!', 'success');
          navigate('/dashboard', { replace: true });
        }
      } catch (err: any) {
        showToast(err.message || 'Google sign up failed.', 'error');
      } finally {
        setLoading(false);
      }
    };
    checkRedirect();
  }, [referralCode]);

  // Validation helpers for right-side checkmarks
  const isFirstNameValid = firstName.trim().length >= 2;
  const isLastNameValid = lastName.trim().length >= 1;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Auto-verify OTP when 6 digits are entered
  useEffect(() => {
    const cleanOtp = otpCode.trim();
    if (cleanOtp.length === 6 && otpSent && !otpVerified && !otpVerifying) {
      handleVerifyOtp(cleanOtp);
    }
  }, [otpCode, otpSent, otpVerified]);

  // Send OTP to email
  const handleSendOtp = async () => {
    if (countdown > 0 || otpSending) return;
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isEmailValid) {
      setError('Please enter a valid email address first.');
      return;
    }

    setOtpSending(true);
    try {
      const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Miner';
      const res = await api.sendSignupOtp({
        fullName: combinedName,
        email: cleanEmail,
        referralCode: referralCode.trim() || undefined,
      });

      if (res.success) {
        setOtpSent(true);
        setOtpVerified(false);
        setCountdown(60);
        showToast(`Verification code sent to ${cleanEmail}! Please check inbox/spam.`, 'success');
      } else {
        setError(res.message || 'Could not send verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP code
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const targetCode = (codeToVerify || otpCode).trim();
    if (!targetCode || targetCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setOtpVerifying(true);
    try {
      const res = await api.verifySignupOtp({
        email: email.trim().toLowerCase(),
        otpCode: targetCode,
      });

      if (res.success) {
        setOtpVerified(true);
        setError(null);
        showToast('Email verified successfully!', 'success');
      } else {
        setError(res.message || 'Invalid verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await triggerGoogleSignIn(false);
      if (profile && profile.email) {
        await googleLogin({
          email: profile.email,
          name: profile.name,
          googleId: profile.sub,
          isSignup: true,
          referralCode: referralCode.trim() || undefined,
        });
        showToast('Signed up with Google successfully! Welcome to GT Mining!', 'success');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('canceled') && !err.message.includes('closed')) {
        showToast(err.message || 'Google sign up failed.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit complete single-page registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError('Please enter your First Name.');
      return;
    }

    if (!email.trim() || !isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

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
      const combinedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await signup({
        fullName: combinedFullName,
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        referralCode: referralCode.trim() || undefined,
        otpCode: otpCode.trim(),
      });

      showToast('Registration complete! Welcome to GT Mining!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please check your verification code.');
      showToast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Top Back Button & Logo Header */}
        <div className="text-center relative">
          <Link
            to="/login"
            className="absolute left-0 top-1 p-2 rounded-full bg-white/80 border border-[#22C55E]/30 text-[#0A341B] hover:bg-white transition-all shadow-sm flex items-center justify-center"
            title="Back to Sign In"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <Link to="/" className="inline-block mb-1">
            <img src="/gt-auth-logo.png" alt="GT Logo" className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto" />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A341B] tracking-tight">Create Account</h2>
          <p className="text-xs sm:text-sm font-medium text-[#1E5E36]">
            Join GT Network and start your earning journey
          </p>
        </div>

        <GlassCard glow className="space-y-4 bg-white/95 shadow-xl border border-white/80 p-5 sm:p-6">
          {error && (
            <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#F87171]/50 flex items-center gap-2.5 text-xs font-semibold text-[#DC2626]">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3">
            {/* Row 1: First Name & Last Name (Side by side) */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* First Name Field */}
              <div className="rounded-2xl border border-[#22C55E]/30 bg-white/90 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]/20 transition-all px-3 py-2 flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#16A34A] shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-bold text-[#1E5E36] block leading-tight">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full bg-transparent text-sm font-semibold text-[#0A341B] placeholder:text-[#1E5E36]/30 outline-none p-0 border-none leading-tight"
                  />
                </div>
                {isFirstNameValid && (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                )}
              </div>

              {/* Last Name Field */}
              <div className="rounded-2xl border border-[#22C55E]/30 bg-white/90 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]/20 transition-all px-3 py-2 flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#16A34A] shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-bold text-[#1E5E36] block leading-tight">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full bg-transparent text-sm font-semibold text-[#0A341B] placeholder:text-[#1E5E36]/30 outline-none p-0 border-none leading-tight"
                  />
                </div>
                {isLastNameValid && (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                )}
              </div>
            </div>

            {/* Row 2: Email Address Field */}
            <div className="rounded-2xl border border-[#22C55E]/30 bg-white/90 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]/20 transition-all px-3.5 py-2 flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#16A34A] shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-bold text-[#1E5E36] block leading-tight">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (otpVerified) setOtpVerified(false);
                  }}
                  placeholder="name@example.com"
                  className="w-full bg-transparent text-sm font-semibold text-[#0A341B] placeholder:text-[#1E5E36]/30 outline-none p-0 border-none leading-tight"
                />
              </div>
              {isEmailValid && (
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              )}
            </div>

            {/* Row 3: OTP Field with Countdown & Status Badge / Button */}
            <div className="rounded-2xl border border-[#22C55E]/30 bg-white/90 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]/20 transition-all px-3.5 py-2 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-bold text-[#1E5E36] block leading-tight">OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-transparent text-sm font-mono font-bold tracking-wider text-[#0A341B] placeholder:text-[#1E5E36]/30 outline-none p-0 border-none leading-tight"
                />
              </div>

              {/* Right Side: Timer & Action Badge / Button */}
              <div className="flex items-center gap-2 shrink-0">
                {countdown > 0 && (
                  <span className="text-xs font-mono font-bold text-[#1E5E36]">
                    {formatTimer(countdown)}
                  </span>
                )}

                {otpVerified ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-sm flex items-center gap-1">
                    Verified ✓
                  </span>
                ) : otpSent ? (
                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={otpVerifying || otpCode.length !== 6}
                    className="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:opacity-95 disabled:opacity-40 transition-all shadow-sm cursor-pointer"
                  >
                    {otpVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending || countdown > 0 || !isEmailValid}
                    className="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:opacity-95 disabled:opacity-40 transition-all shadow-sm cursor-pointer"
                  >
                    {otpSending ? 'Sending...' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>

            {/* Row 4: Password Field */}
            <div className="rounded-2xl border border-[#22C55E]/30 bg-white/90 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]/20 transition-all px-3.5 py-2 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#16A34A] shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-bold text-[#1E5E36] block leading-tight">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm font-semibold text-[#0A341B] placeholder:text-[#1E5E36]/30 outline-none p-0 border-none leading-tight"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#16A34A] hover:text-[#0A341B] cursor-pointer p-0.5 shrink-0"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Row 5: Confirm Password Field */}
            <div className="rounded-2xl border border-[#22C55E]/30 bg-white/90 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]/20 transition-all px-3.5 py-2 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#16A34A] shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-bold text-[#1E5E36] block leading-tight">Confirm Password</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm font-semibold text-[#0A341B] placeholder:text-[#1E5E36]/30 outline-none p-0 border-none leading-tight"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-[#16A34A] hover:text-[#0A341B] cursor-pointer p-0.5 shrink-0"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Row 6: Referral Code (Optional) */}
            <div className="rounded-2xl border border-[#22C55E]/30 bg-white/90 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]/20 transition-all px-3.5 py-2 flex items-center gap-2.5">
              <Gift className="w-4 h-4 text-[#16A34A] shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-bold text-[#1E5E36] block leading-tight">Referral Code (Optional)</label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GT88241"
                  className="w-full bg-transparent text-sm font-mono font-bold uppercase text-[#0A341B] placeholder:text-[#1E5E36]/30 outline-none p-0 border-none leading-tight"
                />
              </div>
              {referralCode.trim().length >= 4 && (
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              )}
            </div>

            {/* Create Account Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_25px_rgba(34,197,94,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm cursor-pointer"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          {/* Google Sign Up */}
          <div className="space-y-3 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-black/10 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-[#1E5E36] absolute rounded-full">OR</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 rounded-2xl border border-white/90 bg-white hover:bg-white/90 text-xs font-bold text-[#0A341B] transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
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
        </GlassCard>

        {/* Footer Link */}
        <p className="text-center text-xs font-semibold text-[#1E5E36]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#16A34A] font-black hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
