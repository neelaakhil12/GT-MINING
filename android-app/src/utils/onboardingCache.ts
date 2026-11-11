import { Image } from 'react-native';
import { API_BASE_URL, SERVER_HOST } from '../config/api';
import { appStorage } from './storage';

export interface OnboardingSlide {
  id: string | number;
  title: string;
  description: string;
  image: any;
}

export const CACHE_KEY = '@gt_cached_onboarding_banners';

export const DEFAULT_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Automated 4-Hour Mining Engine',
    description:
      'Activate your mining node with 1 tap. Mine virtual GT coins effortlessly on your mobile device or web browser.',
    image: require('../../assets/onboarding/story_1.jpg'),
  },
  {
    id: 2,
    title: "Recognized by the world's largest stock exchange",
    description:
      'The modern blockchain protocol built for institutional transparency and verifiable distributed ledgers.',
    image: require('../../assets/onboarding/story_2.jpg'),
  },
  {
    id: 3,
    title: 'Autonomous 10% Yield Accrual',
    description:
      'Receive instant lifetime mining commissions whenever your peer network and invited nodes finalize cycles.',
    image: require('../../assets/onboarding/story_3.jpg'),
  },
  {
    id: 4,
    title: 'Powered by Visa & Mastercard',
    description:
      'Global payment cards accepted in more than 150 countries for seamless everyday crypto liquidity.',
    image: require('../../assets/onboarding/story_4.png'),
  },
  {
    id: 5,
    title: 'Instant Direct Wallet Claims',
    description:
      'Accumulate GT coin yields and claim your rewards directly to your personal wallet vault with zero gas fees.',
    image: require('../../assets/onboarding/story_5.jpg'),
  },
];

let memorySlides: OnboardingSlide[] | null = null;
let inFlightPromise: Promise<OnboardingSlide[] | null> | null = null;

function sortBanners(list: any[]): any[] {
  return list
    .filter((b: any) => b && b.isActive !== false)
    .slice()
    .sort((a: any, b: any) => {
      const ordA = Number(a.order !== undefined && a.order !== null ? a.order : a.stepNumber) || 0;
      const ordB = Number(b.order !== undefined && b.order !== null ? b.order : b.stepNumber) || 0;
      return ordA - ordB;
    });
}

function mapBannerToSlide(b: any, idx: number): OnboardingSlide {
  let image: any = DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].image;
  if (b.imageUrl && typeof b.imageUrl === 'string') {
    if (b.imageUrl.startsWith('data:') || b.imageUrl.startsWith('http')) {
      image = { uri: b.imageUrl };
    } else {
      const path = b.imageUrl.startsWith('/') ? b.imageUrl : `/${b.imageUrl}`;
      image = { uri: `${SERVER_HOST}${path}` };
    }
  }
  return {
    id: b.id || b.stepNumber || idx + 1,
    title: b.title || '',
    description: b.description || '',
    image,
  };
}

export function getMemoryOnboardingSlides(): OnboardingSlide[] | null {
  return memorySlides;
}

export async function getCachedOnboardingSlidesFromStorage(): Promise<OnboardingSlide[] | null> {
  try {
    const cached = await appStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const sorted = sortBanners(parsed);
    if (sorted.length === 0) return null;
    const mapped = sorted.map(mapBannerToSlide);
    if (!memorySlides) {
      memorySlides = mapped;
    }
    return mapped;
  } catch {
    return null;
  }
}

export function fetchAndCacheOnboardingBanners(timeoutMs = 5000): Promise<OnboardingSlide[] | null> {
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = (async () => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const res = await fetch(`${API_BASE_URL}/onboarding-banners`, {
        signal: controller ? controller.signal : undefined,
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (timer) clearTimeout(timer);

      const data = await res.json();
      if (data && data.success && Array.isArray(data.banners) && data.banners.length > 0) {
        const sorted = sortBanners(data.banners);
        if (sorted.length > 0) {
          const mapped = sorted.map(mapBannerToSlide);
          memorySlides = mapped;
          appStorage.setItem(CACHE_KEY, JSON.stringify(sorted)).catch(() => {});

          // Pre-warm the first slide image before onboarding renders, without blocking long
          const firstUri = mapped[0]?.image?.uri;
          if (firstUri && typeof firstUri === 'string' && !firstUri.startsWith('data:')) {
            await Promise.race([
              Image.prefetch(firstUri).catch(() => false),
              new Promise((resolve) => setTimeout(resolve, 900)),
            ]);
          }
          return mapped;
        }
      }
      return null;
    } catch {
      if (timer) clearTimeout(timer);
      return null;
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

