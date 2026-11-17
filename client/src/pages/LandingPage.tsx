import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ChevronRight } from 'lucide-react';

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  theme: 'dark' | 'light';
}

const onboardingSlides: OnboardingSlide[] = [];

// Instant module-level image cache priming for 0ms transitions
if (typeof window !== 'undefined') {
  ['/gt-header-logo.png'].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

const getInitialSlides = (): OnboardingSlide[] => {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('gt_cached_onboarding_banners');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice().sort((a: any, b: any) => {
            const ordA = Number(a.order !== undefined && a.order !== null ? a.order : a.stepNumber) || 0;
            const ordB = Number(b.order !== undefined && b.order !== null ? b.order : b.stepNumber) || 0;
            return ordA - ordB;
          });
        }
      }
    } catch { }
  }
  return onboardingSlides;
};

export const LandingPage: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isTourRequested =
    searchParams.get('tour') === 'true' ||
    location.pathname === '/onboarding' ||
    location.pathname === '/tour';

  const [stage, setStage] = useState<'splash' | 'onboarding'>(
    isTourRequested ? 'onboarding' : 'splash'
  );

  const [slides, setSlides] = useState<OnboardingSlide[]>(getInitialSlides);
  const [bannersReady, setBannersReady] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [splashProgress, setSplashProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING NODE...');

  // If onboarding is active but no slides exist in DB, immediately redirect to login
  useEffect(() => {
    if (stage === 'onboarding' && bannersReady && slides.length === 0) {
      navigate('/login', { replace: true });
    }
  }, [stage, bannersReady, slides.length, navigate]);

  // Story status progress (0 to 100% per slide, auto-advances like WhatsApp status)
  const [slideProgress, setSlideProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const handleProceedToLogin = () => {
    navigate('/login', { replace: true });
  };

  const handleDemoLogin = async () => {
    if (loadingDemo) return;
    setLoadingDemo(true);
    try {
      await demoLogin();
      navigate('/mining', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleProceedFromSplash = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gt_token') : null;
    if ((isAuthenticated || token) && !isTourRequested) {
      navigate('/dashboard', { replace: true });
    } else if (slides.length > 0) {
      setStage('onboarding');
    } else {
      navigate('/login', { replace: true });
    }
  };

  const loadOnboardingBanners = async () => {
    try {
      const res = await api.getPublicOnboardingBanners();
      if (res.success && Array.isArray(res.banners)) {
        const sorted = res.banners
          .filter((b: any) => b.isActive !== false)
          .sort((a: any, b: any) => {
            const ordA = Number(a.order !== undefined && a.order !== null ? a.order : a.stepNumber) || 0;
            const ordB = Number(b.order !== undefined && b.order !== null ? b.order : b.stepNumber) || 0;
            return ordA - ordB;
          });
        const mapped = sorted.map((b: any, idx: number) => ({
          id: b.id || idx + 1,
          title: b.title,
          subtitle: b.subtitle || '',
          description: b.description,
          image: b.imageUrl,
          theme: 'dark' as const,
          order: Number(b.order !== undefined && b.order !== null ? b.order : b.stepNumber) || (idx + 1),
        }));
        setSlides(mapped);
        try {
          if (mapped.length > 0) {
            localStorage.setItem('gt_cached_onboarding_banners', JSON.stringify(mapped));
          } else {
            localStorage.removeItem('gt_cached_onboarding_banners');
          }
        } catch { }
        setBannersReady(true);
        return;
      }
      setSlides([]);
    } catch {
      setSlides([]);
    } finally {
      setBannersReady(true);
    }
  };

  useEffect(() => {
    slides.forEach((s) => {
      if (s.image) {
        const img = new Image();
        img.src = s.image;
      }
    });
  }, [slides]);

  useEffect(() => {
    loadOnboardingBanners();
    const handleUpdate = () => loadOnboardingBanners();
    window.addEventListener('gt_db_updated', handleUpdate);
    return () => window.removeEventListener('gt_db_updated', handleUpdate);
  }, []);

  // Splash Screen Timer & Fast Progress Animation: wait for bannersReady before advancing
  useEffect(() => {
    if (stage !== 'splash') return;

    if (isAuthenticated && !isTourRequested) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const interval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 3;
        if (next > 30 && next < 60) setStatusText('CONNECTING NODES & PEERS...');
        else if (next >= 60 && next < 85) setStatusText('SYNCING 4H EPOCH LEDGER...');
        else if (next >= 85) setStatusText('PROTOCOL ACTIVE & READY');
        return next > 100 ? 100 : next;
      });
    }, 45);

    const maxWait = setTimeout(() => {
      setSlides((prev) => (prev.length > 0 ? prev : onboardingSlides));
      setBannersReady(true);
      handleProceedFromSplash();
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(maxWait);
    };
  }, [stage, isAuthenticated, isTourRequested, navigate]);

  // Hard safety timeout: unconditionally dismiss splash after 2.5s
  useEffect(() => {
    if (stage !== 'splash') return;
    const safetyTimer = setTimeout(() => {
      handleProceedFromSplash();
    }, 2500);
    return () => clearTimeout(safetyTimer);
  }, [stage, isAuthenticated, isTourRequested, slides.length]);

  useEffect(() => {
    if (stage === 'splash' && splashProgress >= 100) {
      handleProceedFromSplash();
    }
  }, [stage, splashProgress]);

  // Handle slide transitions & auto-advance timer
  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setSlideProgress(0);
    } else {
      // Completed all onboarding slides -> Go to /login!
      handleProceedToLogin();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setSlideProgress(0);
    }
  };

  // WhatsApp/Instagram-style story auto-progress timer (5 seconds per slide)
  useEffect(() => {
    if (stage !== 'onboarding' || isHolding || slides.length === 0) return;

    const DURATION_MS = 5000;
    const TICK_MS = 50;
    const INCREMENT = (TICK_MS / DURATION_MS) * 100;

    const interval = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          if (currentSlide < slides.length - 1) {
            setCurrentSlide((curr) => curr + 1);
            return 0;
          } else {
            clearInterval(interval);
            handleProceedToLogin();
            return 100;
          }
        }
        return prev + INCREMENT;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [stage, currentSlide, slides.length, isHolding]);

  // ==========================================
  // 1. SPLASH SCREEN (STAGE === 'splash')
  // ==========================================
  if (stage === 'splash') {
    return (
      <div
        onClick={handleProceedFromSplash}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 text-[#0A341B] cursor-pointer select-none overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #E6F8EB 0%, #D8F5E0 50%, #ECFBF1 100%)' }}
      >
        {/* Soft Ambient Corner Glows (Clean website aesthetic - no concentric rings) */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-emerald-400/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none" />

        {/* Top Header Row (Frosted Glass Skip Button) */}
        <div className="w-full flex justify-end items-center z-10 pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProceedToLogin();
            }}
            className="text-xs font-extrabold text-[#065F46] hover:text-[#0A341B] px-4 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-white/95 shadow-sm transition-all hover:bg-white"
          >
            Skip ›
          </button>
        </div>

        {/* Center: Glowing 3D Crystal Logo & GT NETWORK Title */}
        <div className="flex flex-col items-center text-center space-y-6 z-10 my-auto">
          {/* Animated 3D Logo with Ambient Glow */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl scale-125 pointer-events-none" />
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
              <img
                src="/gt-header-logo.png"
                alt="GT Network Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(10,52,27,0.18)] animate-pulse"
                style={{ animationDuration: '3s' }}
              />
            </div>
          </div>

          {/* Clean Brand Title: GT NETWORK */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0A341B] drop-shadow-sm flex items-center justify-center gap-3">
              GT <span className="text-[#16A34A] tracking-wider">NETWORK</span>
            </h1>
          </div>
        </div>

        {/* Bottom Loading Progress Indicator (Frosted Glass Website Aesthetic) */}
        <div className="w-full max-w-xs space-y-2.5 z-10 pb-6">
          <div className="flex justify-between items-center text-[10.5px] font-black text-[#0A341B] uppercase tracking-wide">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>{statusText}</span>
            </div>
            <span className="text-[#16A34A] font-extrabold">{splashProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-900/10 overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] transition-all duration-100 rounded-full shadow-sm"
              style={{ width: `${splashProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-center text-[#1E5E36]/80 font-bold pt-1">
            Tap anywhere to continue
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. ONBOARDING SLIDES (STAGE === 'onboarding')
  // ==========================================
  if (slides.length === 0) {
    handleProceedToLogin();
    return null;
  }

  const slide = slides[currentSlide] || slides[0];

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] flex items-center justify-center bg-[#031107] overflow-hidden select-none">
      {/* Centered Story Frame */}
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between overflow-hidden shadow-2xl bg-[#04160A]">
        {/* Instant Ambient Gradient & Glow (Prevents black void during image load) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#051B0D] via-[#0A2E18] to-[#04160A] -z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#22C55E]/15 rounded-full blur-[90px] pointer-events-none -z-10" />

        {/* Background Pre-rendered Slide Images */}
        <div className="absolute inset-0 z-0">
          {slides.map((s, idx) => (
            <img
              key={s.id || idx}
              src={s.image}
              alt={s.title}
              loading="eager"
              decoding="async"
              onError={(e) => {
                const fallbackImg = onboardingSlides[idx % onboardingSlides.length]?.image || '/onboarding/story_1.jpg';
                if ((e.target as HTMLImageElement).src !== fallbackImg) {
                  (e.target as HTMLImageElement).src = fallbackImg;
                }
              }}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-150 ${idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
                }`}
            />
          ))}

          {/* Vignette Overlay for Crisp Contrast */}
          <div
            className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${slide.theme === 'light'
              ? 'bg-gradient-to-t from-black/80 via-black/25 to-black/70'
              : 'bg-gradient-to-t from-black/95 via-black/40 to-black/80'
              }`}
          />
        </div>

        {/* Tap Interaction Zones (Left: Previous, Right: Next, Hold: Pause) */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-[35%] h-[78%] cursor-pointer"
            onClick={handlePrevSlide}
            onMouseDown={() => setIsHolding(true)}
            onMouseUp={() => setIsHolding(false)}
            onTouchStart={() => setIsHolding(true)}
            onTouchEnd={() => setIsHolding(false)}
            aria-label="Previous slide"
          />
          <div
            className="w-[65%] h-[78%] cursor-pointer"
            onClick={handleNextSlide}
            onMouseDown={() => setIsHolding(true)}
            onMouseUp={() => setIsHolding(false)}
            onTouchStart={() => setIsHolding(true)}
            onTouchEnd={() => setIsHolding(false)}
            aria-label="Next slide"
          />
        </div>

        {/* Top Segmented Story Progress Bars */}
        <div className="relative z-20 pt-3 px-4 flex items-center gap-1.5 shrink-0">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden cursor-pointer"
              onClick={() => {
                setCurrentSlide(idx);
                setSlideProgress(0);
              }}
            >
              <div
                className="h-full bg-white transition-all duration-75 rounded-full"
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

        {/* Slide Title & Subtitle Info */}
        <div className="relative z-20 px-6 pt-5 flex flex-col justify-start shrink-0">
          <div className="space-y-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4ADE80] font-mono block">
              {slide.subtitle}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm font-normal leading-relaxed text-neutral-200 pt-1">
              {slide.description}
            </p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 pointer-events-none" />

        {/* Bottom Action Area: Continue / Launch & Try Demo Login / Preview */}
        <div className="relative z-20 px-6 pb-8 pt-4 flex flex-col items-center gap-3 shrink-0">
          {/* Button 1: Emerald Glass Capsule */}
          <button
            type="button"
            onClick={handleNextSlide}
            className="group relative w-full h-[54px] rounded-full overflow-hidden flex items-center justify-center gap-2 text-white font-extrabold text-base tracking-wide transition-all duration-200 active:scale-[0.98] cursor-pointer border-[1.5px] border-[#86EFAC]/80 bg-gradient-to-b from-[#22C55E] via-[#10B981] to-[#047857]"
            style={{
              boxShadow: '0 8px 32px rgba(34,197,94,0.45), inset 0 1px 2px rgba(255,255,255,0.7), inset 0 -2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {/* Glossy top glass reflection highlight */}
            <div className="absolute inset-x-3 top-0.5 h-[45%] rounded-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
            <span className="relative z-10 drop-shadow-sm font-black text-[17px]">
              {currentSlide === slides.length - 1 ? 'Launch' : 'Continue'}
            </span>
            <ChevronRight className="relative z-10 w-5 h-5 text-white stroke-[3] transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>

          {/* Button 2: Frosted Glass Capsule */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loadingDemo}
            className="group relative w-full h-[52px] rounded-full overflow-hidden flex items-center justify-center gap-2 text-white font-extrabold text-base tracking-wide transition-all duration-200 active:scale-[0.98] cursor-pointer border-[1.5px] border-white/40 bg-black/45 backdrop-blur-md"
            style={{
              boxShadow: '0 6px 20px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.4)',
            }}
          >
            {/* Subtle top reflection */}
            <div className="absolute inset-x-3 top-0.5 h-[45%] rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <span className="relative z-10 drop-shadow-sm font-black text-[16px]">
              {loadingDemo
                ? 'Logging in...'
                : currentSlide === slides.length - 1
                ? 'Preview'
                : 'Try Demo Login'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
