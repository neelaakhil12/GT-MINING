import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

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

// Instant module-level image cache priming for 0ms transitions
if (typeof window !== 'undefined') {
  [
    '/gt-header-logo.png',
    '/onboarding/story_1.jpg',
    '/onboarding/story_2.jpg',
    '/onboarding/story_3.jpg',
    '/onboarding/story_4.png',
    '/onboarding/story_5.jpg',
  ].forEach((src) => {
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
  const { isAuthenticated } = useAuth();
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

  // Story status progress (0 to 100% per slide, auto-advances like WhatsApp status)
  const [slideProgress, setSlideProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const handleProceedToLogin = () => {
    navigate('/login', { replace: true });
  };

  const handleProceedFromSplash = () => {
    if (isAuthenticated && !isTourRequested) {
      navigate('/dashboard', { replace: true });
    } else {
      setStage('onboarding');
    }
  };

  const loadOnboardingBanners = async () => {
    try {
      const res = await api.getPublicOnboardingBanners();
      if (res.success && res.banners && res.banners.length > 0) {
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
          image: b.imageUrl || '/onboarding/story_1.jpg',
          theme: 'dark' as const,
          order: Number(b.order !== undefined && b.order !== null ? b.order : b.stepNumber) || (idx + 1),
        }));
        if (mapped.length > 0) {
          setSlides(mapped);
          try {
            localStorage.setItem('gt_cached_onboarding_banners', JSON.stringify(mapped));
          } catch { }
          mapped.forEach((m: any) => {
            if (m.image) {
              const img = new Image();
              img.src = m.image;
            }
          });
        }
      }
    } catch { } finally {
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

  // Splash Screen Timer & Fast Progress Animation: only transition when banners are ready
  useEffect(() => {
    if (stage !== 'splash') return;

    if (isAuthenticated && !isTourRequested) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const interval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          // If banners are ready or max progress reached, transition cleanly
          if (bannersReady || prev >= 120) {
            clearInterval(interval);
            handleProceedFromSplash();
            return 100;
          }
          return prev + 5; // hold smoothly at 100% until ready
        }
        return prev + 25;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [stage, isAuthenticated, isTourRequested, navigate, bannersReady]);

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
    if (stage !== 'onboarding' || isHolding) return;

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
        className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-[#051B0D] via-[#0A2E18] to-[#04160A] text-white cursor-pointer select-none overflow-hidden"
      >
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22C55E]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#16A34A]/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top brand row (Skip button on right) */}
        <div className="w-full flex justify-end items-center z-10 pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProceedToLogin();
            }}
            className="text-xs font-bold text-neutral-400 hover:text-white px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-colors"
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
  const slide = slides[currentSlide] || slides[0];

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] flex items-center justify-center bg-black overflow-hidden select-none">
      {/* Centered Story Frame */}
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between overflow-hidden shadow-2xl bg-black">
        {/* Background Pre-rendered Slide Images */}
        <div className="absolute inset-0 z-0">
          {slides.map((s, idx) => (
            <img
              key={s.id || idx}
              src={s.image}
              alt={s.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-150 ${
                idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
              }`}
            />
          ))}

          {/* Vignette Overlay for Crisp Contrast */}
          <div
            className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
              slide.theme === 'light'
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

        {/* Bottom Action Area: Continue / Get Started & Skip */}
        <div className="relative z-20 px-6 pb-8 pt-4 flex flex-col items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleNextSlide}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:brightness-110 text-white text-base font-black shadow-[0_10px_25px_rgba(34,197,94,0.4)] active:scale-[0.98] transition-all cursor-pointer border border-[#86EFAC]/30"
          >
            {currentSlide === slides.length - 1 ? 'Get Started & Mine Now 🚀' : 'Continue'}
          </button>

          <button
            type="button"
            onClick={handleProceedToLogin}
            className="text-sm font-semibold py-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            Skip to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
