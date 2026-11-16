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

// Only pre-opening banners uploaded by Admin are shown. No hardcoded fallback slides.
export const DEFAULT_SLIDES: OnboardingSlide[] = [];

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

const BUNDLED_STORY_IMAGES: Record<string, any> = {
  '/onboarding/story_1.jpg': require('../../assets/onboarding/story_1.jpg'),
  '/onboarding/story_2.jpg': require('../../assets/onboarding/story_2.jpg'),
  '/onboarding/story_3.jpg': require('../../assets/onboarding/story_3.jpg'),
  '/onboarding/story_4.png': require('../../assets/onboarding/story_4.png'),
  '/onboarding/story_5.jpg': require('../../assets/onboarding/story_5.jpg'),
};

function mapBannerToSlide(b: any, idx: number): OnboardingSlide {
  let image: any = null;
  if (b.imageUrl && typeof b.imageUrl === 'string') {
    const trimmed = b.imageUrl.trim();
    if (BUNDLED_STORY_IMAGES[trimmed]) {
      // Built-in default slide assets render from app bundle in 0ms without network delay
      image = BUNDLED_STORY_IMAGES[trimmed];
    } else if (trimmed.startsWith('data:') || trimmed.startsWith('http')) {
      image = { uri: trimmed };
    } else {
      const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
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

export async function prefetchOnboardingImages(slides: OnboardingSlide[], maxWaitMs = 3000): Promise<void> {
  const uris = slides
    .map((s) => (typeof s.image === 'object' && s.image && 'uri' in s.image ? s.image.uri : null))
    .filter((u): u is string => typeof u === 'string' && u.startsWith('http'));
  if (uris.length === 0) return;

  // Prefetch slide 1 first with highest priority, then all remaining slides in parallel
  const [firstUri, ...restUris] = uris;
  await Promise.race([
    Promise.allSettled([
      Image.prefetch(firstUri).catch(() => false),
      ...restUris.map((u) => Image.prefetch(u).catch(() => false)),
    ]),
    new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs)),
  ]);
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
    prefetchOnboardingImages(mapped, 1500).catch(() => { });
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
      const res = await fetch(`${API_BASE_URL}/onboarding-banners?t=${Date.now()}`, {
        signal: controller ? controller.signal : undefined,
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      if (timer) clearTimeout(timer);

      const data = await res.json();
      if (data && data.success && Array.isArray(data.banners)) {
        const sorted = sortBanners(data.banners);
        const mapped = sorted.map(mapBannerToSlide);
        memorySlides = mapped;
        if (sorted.length > 0) {
          appStorage.setItem(CACHE_KEY, JSON.stringify(sorted)).catch(() => { });
          await prefetchOnboardingImages(mapped, 3000);
        } else {
          appStorage.removeItem(CACHE_KEY).catch(() => { });
        }
        return mapped;
      }
      return [];
    } catch {
      if (timer) clearTimeout(timer);
      return memorySlides || [];
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

