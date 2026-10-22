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
  title: string;
  subtitle: string;
  description: string;
  image: string;
  theme: 'dark' | 'light';
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Automated 4-Hour Mining Engine',
    subtitle: 'Zero hardware wear, zero battery drain',
    description:
      'Activate your mining node with 1 tap. Mine virtual GT coins effortlessly on your mobile device.',
    image: '/onboarding/story_1.jpg',
    theme: 'dark',
  },
  {
    id: 2,
    title: "Recognized by the world's largest stock exchange",
    subtitle: 'The only blockchain company invited by the NYSE',
    description:
      'The modern blockchain protocol built for institutional transparency and verifiable distributed ledgers.',
    image: '/onboarding/story_2.jpg',
    theme: 'dark',
  },
  {
    id: 3,
    title: 'Autonomous 10% Yield Accrual',
    subtitle: 'Protocol dividend distribution',
    description:
      'Receive instant lifetime mining commissions whenever your peer network and invited nodes finalize cycles.',
    image: '/onboarding/story_3.jpg',
    theme: 'dark',
  },
  {
    id: 4,
    title: 'Powered by Visa & Mastercard',
    subtitle: 'Global payment cards',
    description:
      'Global payment cards accepted in more than 150 countries for seamless everyday crypto liquidity.',
    image: '/onboarding/story_4.png',
    theme: 'light',
  },
  {
    id: 5,
    title: 'Instant Direct Wallet Claims',
    subtitle: 'Non-custodial cryptographic access',
    description:
      'Accumulate GT coin yields and claim your rewards directly to your personal wallet vault with zero gas fees.',
    image: '/onboarding/story_5.jpg',
    theme: 'dark',
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
  const [stage, setStage] = useState<'splash' | 'onboarding' | 'auth'>(
    isTourRequested ? 'onboarding' : 'splash'
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [splashProgress, setSplashProgress] = useState(0);

  // Story status progress (0 to 100% per slide, auto-advances like WhatsApp status)
  const [slideProgress, setSlideProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

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

  // Splash Screen Timer & Progress Animation (1.5s)
  useEffect(() => {
    if (stage !== 'splash') return;

    const interval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStage('onboarding');
          return 100;
        }
        return prev + 6;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [stage]);

  // WhatsApp / Instagram Status auto-advance timer (~5.5s per slide)
  useEffect(() => {
    if (stage !== 'onboarding') return;
    if (isHolding) return;

    const interval = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          if (currentSlide < onboardingSlides.length - 1) {
            setCurrentSlide((curr) => curr + 1);
            return 0;
          } else {
            clearInterval(interval);
            setStage('auth');
            return 100;
          }
        }
        return prev + 1;
      });
    }, 55);

    return () => clearInterval(interval);
  }, [stage, currentSlide, isHolding]);

  // Swipe gesture detection for mobile onboarding
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHolding(true);
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsHolding(false);
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      handleNextSlide();
    } else if (diff < -50) {
      handlePrevSlide();
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setSlideProgress(0);
    } else {
      setStage('auth');
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setSlideProgress(0);
    } else {
      setSlideProgress(0);
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

    return (
      <div
        className="fixed inset-0 z-50 w-full h-[100dvh] flex items-center justify-center bg-black overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Onboarding Container: Full screen mobile view, Centered Phone Frame on Desktop */}
        <div className="relative w-full h-full sm:max-w-[430px] sm:h-[880px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[6px] sm:border-neutral-800/80 sm:shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between bg-black">
          
          {/* Background Visual Layer */}
          <div className="absolute inset-0 z-0">
            <img
              key={slide.image}
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transition-all duration-500 scale-100"
            />
            {/* Ambient Gradient Overlay for text and button legibility */}
            <div
              className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
                slide.theme === 'light'
                  ? 'bg-gradient-to-b from-white/95 via-white/10 to-white/90'
                  : 'bg-gradient-to-b from-black/85 via-black/20 to-black/95'
              }`}
            />
          </div>

          {/* Interactive Invisible Tap Zones (Left 40% goes Back, Right 60% goes Forward) */}
          <div className="absolute inset-0 z-10 flex">
            <div
              className="w-[40%] h-[78%] cursor-pointer"
              onClick={handlePrevSlide}
              onMouseDown={() => setIsHolding(true)}
              onMouseUp={() => setIsHolding(false)}
              aria-label="Previous slide"
              title="Tap left to go back"
            />
            <div
              className="w-[60%] h-[78%] cursor-pointer"
              onClick={handleNextSlide}
              onMouseDown={() => setIsHolding(true)}
              onMouseUp={() => setIsHolding(false)}
              aria-label="Next slide"
              title="Tap right to go forward"
            />
          </div>

          {/* Top Bar: WhatsApp/Instagram Story Segmented Progress Bars & Text */}
          <div className="relative z-20 pt-3 sm:pt-4 px-4 sm:px-5 space-y-3 shrink-0">
            {/* 5 Segmented Story Progress Bars */}
            <div className="flex items-center gap-1.5 w-full">
              {onboardingSlides.map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-1 rounded-full overflow-hidden cursor-pointer ${
                    slide.theme === 'light' ? 'bg-black/15' : 'bg-white/25'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                    setSlideProgress(0);
                  }}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      slide.theme === 'light' ? 'bg-black' : 'bg-white'
                    }`}
                    style={{
                      width:
                        idx < currentSlide
                          ? '100%'
                          : idx === currentSlide
                          ? `${slideProgress}%`
                          : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Headline and Description (Directly below progress bars, matching reference) */}
            <div className="pt-3 px-1 space-y-1.5">
              <h1
                className={`text-2xl sm:text-[28px] font-bold tracking-tight leading-tight transition-colors duration-300 ${
                  slide.theme === 'light' ? 'text-[#0A1A2F]' : 'text-white'
                }`}
              >
                {slide.title}
              </h1>
              <p
                className={`text-xs sm:text-sm font-normal leading-relaxed max-w-sm transition-colors duration-300 ${
                  slide.theme === 'light' ? 'text-neutral-600' : 'text-neutral-300'
                }`}
              >
                {slide.description}
              </p>
            </div>
          </div>

          {/* Spacer in middle for visuals */}
          <div className="flex-1 pointer-events-none" />

          {/* Bottom Action Area: Continue & Skip (Matching reference image) */}
          <div className="relative z-20 px-6 pb-8 pt-4 flex flex-col items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleNextSlide}
              className="w-full py-4 rounded-full bg-[#0B1528] sm:bg-[#0F172A] hover:bg-black text-white text-base font-bold shadow-2xl active:scale-[0.98] transition-all cursor-pointer border border-white/10"
            >
              Continue
            </button>

            <button
              type="button"
              onClick={handleSkipToAuth}
              className={`text-sm font-semibold py-1 transition-colors cursor-pointer ${
                slide.theme === 'light'
                  ? 'text-neutral-600 hover:text-black'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Skip
            </button>
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
