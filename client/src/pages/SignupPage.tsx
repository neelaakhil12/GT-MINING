import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Gift, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GtLogo } from '../components/GtLogo';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';
import { triggerGoogleSignIn, checkGoogleRedirectResponse } from '../services/googleAuth';

type SignupStep = 'DETAILS' | 'OTP' | 'PASSWORD';

export const SignupPage: React.FC = () => {
  const { completeSignup, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Multi-step state
  const [step, setStep] = useState<SignupStep>('DETAILS');

  // Step 1: Details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Step 2: OTP
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Step 3: Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setUnlocked(true), 350);
    const handleTouch = () => setUnlocked(true);
    window.addEventListener('click', handleTouch, { once: true });
    window.addEventListener('keydown', handleTouch, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleTouch);
      window.removeEventListener('keydown', handleTouch);
    };
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (step === 'OTP' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, countdown]);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
    }

    // Handle return from Google OAuth redirect flow
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
          });
          showToast('Welcome to GT Mining! Account created with Google.', 'success');
          navigate('/dashboard', { replace: true });
        }
      } catch (err: any) {
        showToast(err.message || 'Google registration failed', 'error');
      } finally {
        setLoading(false);
      }
    };
    checkRedirect();
  }, [searchParams]);

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendSignupOtp({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        referralCode: referralCode.trim() || undefined,
      });

      if (res.success) {
        showToast(`Verification code sent to ${email.trim()}!`, 'success');
        setStep('OTP');
        setCountdown(60);
        setCanResend(false);
        setOtpCode('');
      } else {
        setError(res.message || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
      showToast(err.message || 'Error sending OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.sendSignupOtp({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        referralCode: referralCode.trim() || undefined,
      });

      if (res.success) {
        showToast('New verification code sent! Check your inbox.', 'success');
        setCountdown(60);
        setCanResend(false);
        setOtpCode('');
      } else {
        setError(res.message || 'Could not resend code.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifySignupOtp({
        email: email.trim().toLowerCase(),
        otpCode: cleanCode,
      });

      if (res.success) {
        showToast('Email verified successfully! Now set your password.', 'success');
        setStep('PASSWORD');
      } else {
        setError(res.message || 'Invalid verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your code.');
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set Password and complete signup
  const handleCompleteSignup = async (e: React.FormEvent) => {
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
      await completeSignup({
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });

      showToast('Registration complete! Welcome to GT Mining!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Signup completion failed.');
      showToast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await triggerGoogleSignIn(true);
      if (profile && profile.email) {
        await googleLogin({
          email: profile.email,
          name: profile.name,
          googleId: profile.sub,
          isSignup: true,
        });
        showToast('Welcome to GT Mining! Account created with Google.', 'success');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('canceled') && !err.message.includes('closed')) {
        showToast(err.message || 'Google registration error', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative">
      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block mb-1">
            <GtLogo size="lg" animated glow />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A341B] tracking-tight">Create Free Account</h2>
          <p className="text-xs sm:text-sm font-medium text-[#1E5E36]">
            {step === 'DETAILS' && 'Step 1 of 3: Enter your profile details'}
            {step === 'OTP' && 'Step 2 of 3: Verify email with 6-digit OTP'}
            {step === 'PASSWORD' && 'Step 3 of 3: Create your account password'}
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center justify-between gap-2 px-2">
          <div className={`flex-1 h-2 rounded-full transition-all ${step === 'DETAILS' || step === 'OTP' || step === 'PASSWORD' ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'}`} />
          <div className={`flex-1 h-2 rounded-full transition-all ${step === 'OTP' || step === 'PASSWORD' ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'}`} />
          <div className={`flex-1 h-2 rounded-full transition-all ${step === 'PASSWORD' ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'}`} />
        </div>

        <GlassCard glow className="space-y-5 bg-white/90 shadow-xl border border-white/80 p-5 sm:p-7">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#F87171]/50 flex items-center gap-2.5 text-xs font-semibold text-[#DC2626]">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 1: DETAILS (Name, Email, Phone, Referral) */}
          {/* ============================================================ */}
          {step === 'DETAILS' && (
            <form onSubmit={handleSendOtp} autoComplete="off" className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E5E36]">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#16A34A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm font-medium text-[#0A341B] placeholder:text-[#1E5E36]/40 border border-[#22C55E]/30 bg-white/90"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E5E36]">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#16A34A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm font-medium text-[#0A341B] placeholder:text-[#1E5E36]/40 border border-[#22C55E]/30 bg-white/90"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E5E36]">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#16A34A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm font-medium text-[#0A341B] placeholder:text-[#1E5E36]/40 border border-[#22C55E]/30 bg-white/90"
                  />
                </div>
              </div>

              {/* Referral Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E5E36] flex items-center justify-between">
                  <span>Referral Code (Optional)</span>
                  {referralCode && <span className="text-[#16A34A] font-bold text-[11px]">✓ Attributed</span>}
                </label>
                <div className="relative">
                  <Gift className="w-4 h-4 text-[#16A34A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. GT88241"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm font-mono font-bold uppercase text-[#0A341B] placeholder:text-[#1E5E36]/40 border border-[#22C55E]/30 bg-white/90"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_25px_rgba(34,197,94,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-3 text-sm cursor-pointer"
              >
                <span>{loading ? 'Sending OTP Code...' : 'Send Verification Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Google Login Option */}
              <div className="space-y-3 pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-black/10 w-full" />
                  <span className="bg-white/80 px-3 text-[11px] font-bold text-[#1E5E36] absolute rounded-full">OR</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 rounded-2xl border border-white/90 bg-white/80 hover:bg-white text-xs font-bold text-[#0A341B] transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
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
            </form>
          )}

          {/* ============================================================ */}
          {/* STEP 2: OTP VERIFICATION */}
          {/* ============================================================ */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1.5 pb-1">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EAF8EE] border border-[#22C55E]/40 flex items-center justify-center text-[#16A34A] shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-[#0A341B]">Verify Your Email</h3>
                <p className="text-xs text-[#1E5E36] leading-relaxed">
                  We sent a 6-digit verification code to<br />
                  <span className="font-bold text-[#0A341B]">{email}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E5E36] text-center block">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full py-3.5 px-4 rounded-2xl text-center text-2xl font-mono font-black tracking-[10px] text-[#0A341B] border-2 border-[#22C55E]/40 focus:border-[#22C55E] bg-white shadow-inner focus:outline-none"
                />
              </div>

              {/* Countdown / Resend Button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep('DETAILS');
                  }}
                  className="flex items-center gap-1 font-bold text-[#1E5E36] hover:text-[#0A341B] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="flex items-center gap-1 font-black text-[#16A34A] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Code</span>
                  </button>
                ) : (
                  <span className="text-[#1E5E36]/70 font-semibold">
                    Resend code in <strong className="text-[#0A341B] font-mono">{countdown}s</strong>
                  </span>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_25px_rgba(34,197,94,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Verifying Code...' : 'Verify Code & Continue'}</span>
              </button>
            </form>
          )}

          {/* ============================================================ */}
          {/* STEP 3: CREATE PASSWORD */}
          {/* ============================================================ */}
          {step === 'PASSWORD' && (
            <form onSubmit={handleCompleteSignup} autoComplete="off" className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EAF8EE] border border-[#22C55E]/40 flex items-center justify-center text-[#16A34A] shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-[#0A341B]">Create Your Password</h3>
                <p className="text-xs text-[#1E5E36]">
                  Email <span className="font-bold text-[#16A34A]">✓ Verified</span>! Set a secure password to activate your account.
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E5E36]">Password (min. 6 characters)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#16A34A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl glass-input text-sm font-medium text-[#0A341B] placeholder:text-[#1E5E36]/40 border border-[#22C55E]/30 bg-white/90"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#16A34A] hover:text-[#0A341B] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E5E36]">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#16A34A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl glass-input text-sm font-medium text-[#0A341B] placeholder:text-[#1E5E36]/40 border border-[#22C55E]/30 bg-white/90"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-[#16A34A] hover:text-[#0A341B] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password checks */}
              <div className="text-[11px] space-y-1 text-[#1E5E36] bg-[#EAF8EE]/60 p-2.5 rounded-xl border border-[#22C55E]/20">
                <div className={`flex items-center gap-1.5 ${password.length >= 6 ? 'text-[#16A34A] font-bold' : 'text-[#1E5E36]/70'}`}>
                  <span>{password.length >= 6 ? '✓' : '○'}</span>
                  <span>At least 6 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${password && password === confirmPassword ? 'text-[#16A34A] font-bold' : 'text-[#1E5E36]/70'}`}>
                  <span>{password && password === confirmPassword ? '✓' : '○'}</span>
                  <span>Passwords match</span>
                </div>
              </div>

              {/* Complete Signup Button */}
              <button
                type="submit"
                disabled={loading || password.length < 6 || password !== confirmPassword}
                className="w-full py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_25px_rgba(34,197,94,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Complete Registration & Start Mining'}</span>
              </button>
            </form>
          )}
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
