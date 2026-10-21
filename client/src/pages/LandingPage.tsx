import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Pickaxe,
  ArrowRight,
  ChevronRight,
  Mail,
  Lock,
  User,
  Gift,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Coins,
  Repeat,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface OnboardingSlide {
  id: number;
  badge: string;
  badgeIcon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    badge: '4-HOUR MINING ENGINE',
    badgeIcon: Pickaxe,
    title: 'Automated Cloud Mining Cycle',
    subtitle: 'Mine virtual GT coins every 4 hours',
    description:
      'Activate your mining node with 1 tap. Zero hardware wear and zero battery drain on your mobile or desktop device.',
    image: '/onboarding/slide1.jpg',
  },
  {
    id: 2,
    badge: 'PROTOCOL DIVIDENDS',
    badgeIcon: Zap,
    title: 'Autonomous 10% Yield Accrual',
    subtitle: 'Earn pro-rata commissions from peers',
    description:
      'Receive instant 10% lifetime mining commission whenever your referred friends and peer nodes complete their mining cycle.',
    image: '/onboarding/slide2.jpg',
  },
  {
    id: 3,
    badge: 'GLOBAL CONSENSUS',
    badgeIcon: Globe,
    title: 'Transparent Real-Time Ledgers',
    subtitle: 'Live on-chain verifiable records',
    description:
      'All transactions and reward claims are cryptographically synchronized with transparent ledger proofs and zero platform gas fees.',
    image: '/onboarding/slide3.jpg',
  },
  {
    id: 4,
    badge: 'NETWORK MULTIPLIERS',
    badgeIcon: Gift,
    title: 'Build Your Referral Circle',
    subtitle: 'Tiered milestone reward crates',
    description:
      'Share your personal cryptographic connection token across WhatsApp, Telegram, and 𝕏 to unlock exclusive VIP node bonuses.',
    image: '/onboarding/slide4.jpg',
  },
  {
    id: 5,
    badge: 'LIQUIDITY & VAULT',
    badgeIcon: Coins,
    title: 'Instant Direct Wallet Claims',
    subtitle: 'Non-custodial cryptographic access',
    description:
      'Accumulate GT coin yields and claim your rewards directly to your personal wallet with instant cryptographic execution.',
    image: '/onboarding/slide5.jpg',
  },
];

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated, login, signup, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isTourRequested =
    searchParams.get('tour') === 'true' ||
    location.pathname === '/onboarding' ||
    location.pathname === '/tour';

  // If already authenticated and NOT explicitly viewing tour, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !isTourRequested) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isTourRequested, navigate]);

  // Stages: 'splash' | 'onboarding' | 'auth'
  const [stage, setStage] = useState<'splash' | 'onboarding' | 'auth'>('splash');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [splashProgress, setSplashProgress] = useState(0);

  // Auth form states
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Splash Screen Timer & Progress Animation (1.8s)
  useEffect(() => {
    if (stage !== 'splash') return;

    const interval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStage('onboarding');
          return 100;
        }
        return prev + 5;
      });
    }, 85);

    return () => clearInterval(interval);
  }, [stage]);

  const handleNextSlide = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setStage('auth');
    }
  };

  const handleSkipToAuth = () => {
    setStage('auth');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      showToast('Welcome back to GT Mining!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
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

  // ==========================================
  // 1. SPLASH SCREEN (STAGE === 'splash')
  // ==========================================
  if (stage === 'splash') {
    return (
      <div
        onClick={() => setStage('onboarding')}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-[#051B0D] via-[#0A2E18] to-[#04160A] text-white cursor-pointer select-none overflow-hidden"
      >
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22C55E]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#16A34A]/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top brand tag */}
        <div className="w-full flex justify-between items-center z-10 pt-4">
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#22C55E] uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            v2.6 PROTOCOL
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStage('onboarding');
            }}
            className="text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          >
            Skip ›
          </button>
        </div>

        {/* Center: 3D Animated Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-6 z-10 my-auto">
          {/* Animated 3D Logo with Glowing Rings */}
          <div className="relative flex items-center justify-center">
            {/* Pulsing Aura Rings */}
            <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-[#22C55E]/30 animate-ping opacity-60 pointer-events-none" />
            <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#22C55E]/20 blur-xl animate-pulse" />

            {/* Core Crystal Logo */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
              <img
                src="/gt-header-logo.png"
                alt="GT Mining Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_35px_rgba(34,197,94,0.7)] animate-bounce"
                style={{ animationDuration: '2.5s' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
              GT MINING <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#4ADE80]">NETWORK</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#86EFAC] tracking-wider uppercase font-mono">
              Autonomous Decentralized Cloud Protocol
            </p>
          </div>
        </div>

        {/* Bottom Loading Progress Indicator */}
        <div className="w-full max-w-xs space-y-2 z-10 pb-4">
          <div className="flex justify-between text-[11px] font-mono text-neutral-400">
            <span>INITIALIZING NODE...</span>
            <span className="text-[#22C55E] font-bold">{splashProgress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] transition-all duration-150 rounded-full shadow-[0_0_12px_#22C55E]"
              style={{ width: `${splashProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-center text-neutral-400/80 pt-1">
            Tap anywhere to continue
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. ONBOARDING SLIDES (STAGE === 'onboarding')
  // ==========================================
  if (stage === 'onboarding') {
    const slide = onboardingSlides[currentSlide];
    const BadgeIcon = slide.badgeIcon;
    const isLastSlide = currentSlide === onboardingSlides.length - 1;

    return (
      <div className="min-h-screen w-full flex items-center justify-center py-4 sm:py-8 px-3 sm:px-6 relative">
        {/* Onboarding Container (Centered Card on Desktop, Full Mobile Experience) */}
        <div className="w-full max-w-lg bg-white/85 backdrop-blur-2xl rounded-[32px] border border-white/95 shadow-[0_20px_50px_rgba(22,101,52,0.15)] p-5 sm:p-7 flex flex-col justify-between space-y-5 relative overflow-hidden">

          {/* Top Bar: Brand, Counter & Skip Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/gt-header-logo.png"
                alt="GT Logo"
                className="w-7 h-7 object-contain drop-shadow-sm"
              />
              <span className="text-xs font-black tracking-wider text-[#0A341B]">
                GT MINING
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-[#15803D] bg-[#15803D]/10 px-2.5 py-0.5 rounded-full">
                {currentSlide + 1} of {onboardingSlides.length}
              </span>

              <button
                onClick={handleSkipToAuth}
                className="text-xs font-bold text-neutral-500 hover:text-[#0A341B] transition-colors py-1 px-2 rounded-lg hover:bg-neutral-100/70"
              >
                Skip
              </button>
            </div>
          </div>

          {/* Feature Showcase Image */}
          <div className="relative w-full aspect-square max-h-[300px] sm:max-h-[340px] rounded-[24px] overflow-hidden bg-neutral-900 border-2 border-white shadow-md group">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Pill Tag inside image */}
            <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#4ADE80] border border-white/20">
              <BadgeIcon className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>{slide.badge}</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-1.5 text-center px-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#0A341B] tracking-tight leading-snug">
              {slide.title}
            </h2>
            <p className="text-xs font-bold text-[#15803D]">
              {slide.subtitle}
            </p>
            <p className="text-xs sm:text-sm text-[#1E5E36] leading-relaxed pt-1 max-w-md mx-auto">
              {slide.description}
            </p>
          </div>

          {/* Bottom Navigation & Indicator Controls */}
          <div className="space-y-4 pt-1">
            {/* 5 Dots Indicator */}
            <div className="flex items-center justify-center gap-1.5">
              {onboardingSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === idx
                      ? 'w-7 h-2 bg-[#15803D]'
                      : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {currentSlide > 0 && (
                <button
                  onClick={() => setCurrentSlide((prev) => prev - 1)}
                  className="px-4 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-[#0A341B] text-xs font-bold transition-all active:scale-95"
                >
                  Back
                </button>
              )}

              <button
                onClick={handleNextSlide}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#15803D] hover:shadow-lg text-white text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(34,197,94,0.35)] active:scale-95"
              >
                <span>{isLastSlide ? 'Get Started & Login' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. AUTHENTICATION (STAGE === 'auth')
  // ==========================================
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 px-3 sm:px-6 relative">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[32px] border border-white shadow-[0_20px_50px_rgba(22,101,52,0.15)] p-6 sm:p-8 space-y-6 relative">

        {/* Back to Tour Button */}
        <button
          onClick={() => {
            setStage('onboarding');
            setCurrentSlide(0);
          }}
          className="text-xs font-bold text-[#15803D] hover:underline flex items-center gap-1"
        >
          <span>‹ Back to Intro Tour</span>
        </button>

        {/* Logo & Headline */}
        <div className="text-center space-y-2">
          <div className="inline-block">
            <img
              src="/gt-header-logo.png"
              alt="GT Mining"
              className="w-14 h-14 object-contain mx-auto filter drop-shadow-[0_8px_20px_rgba(34,197,94,0.3)]"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A341B] tracking-tight">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-[#1E5E36] font-medium">
            {authMode === 'login'
              ? 'Access your GT coin wallet & 4-hour mining node'
              : 'Join the decentralized GT mining peer network'}
          </p>
        </div>

        {/* Toggle Login / Sign Up Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-100/80 border border-neutral-200/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              authMode === 'login'
                ? 'bg-white text-[#0A341B] shadow-sm font-black'
                : 'text-neutral-500 hover:text-[#0A341B]'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              authMode === 'signup'
                ? 'bg-white text-[#0A341B] shadow-sm font-black'
                : 'text-neutral-500 hover:text-[#0A341B]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#15803D]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="miner@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-neutral-200 text-xs sm:text-sm text-[#0A341B] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#15803D]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-neutral-200 text-xs sm:text-sm text-[#0A341B] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#15803D] hover:shadow-lg text-white font-black text-xs sm:text-sm shadow-[0_8px_20px_rgba(34,197,94,0.35)] transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
            </button>

            {/* 1-Tap Quick Demo Credentials */}
            <div className="p-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between text-[11px]">
              <span className="text-neutral-500 font-medium">Quick Demo:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('user')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 font-bold text-[#15803D] hover:bg-neutral-100"
                >
                  Demo Miner
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 font-bold text-[#D97706] hover:bg-neutral-100"
                >
                  Admin
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#15803D]">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Arjun Reddy"
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-neutral-200 text-xs sm:text-sm text-[#0A341B] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#15803D]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="miner@example.com"
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-neutral-200 text-xs sm:text-sm text-[#0A341B] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#15803D]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white border border-neutral-200 text-xs text-[#0A341B] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#15803D]">
                  Confirm
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white border border-neutral-200 text-xs text-[#0A341B] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#15803D]">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Gift className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="GT-VIP-779"
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-neutral-200 font-mono text-xs text-[#0A341B] uppercase focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#15803D] hover:shadow-lg text-white font-black text-xs sm:text-sm shadow-[0_8px_20px_rgba(34,197,94,0.35)] transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating Node...' : 'Register Mining Account'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest absolute">
            OR
          </span>
        </div>

        {/* Sign in with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl bg-white border border-neutral-200/90 hover:bg-neutral-50 active:scale-95 transition-all text-xs font-bold text-neutral-700 flex items-center justify-center gap-3 shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* Footer switch prompt */}
        <div className="text-center text-xs text-neutral-500 pt-1">
          {authMode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError(null);
                }}
                className="font-bold text-[#15803D] hover:underline"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className="font-bold text-[#15803D] hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
