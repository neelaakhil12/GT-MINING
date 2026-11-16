import { Image } from 'react-native';
import { API_BASE_URL, SERVER_HOST } from '../config/api';
import { appStorage } from './storage';

export interface HomeBannerSlide {
  id: string | number;
  tag: string;
  title: string;
  description: string;
  ctaText: string;
  targetRoute: 'Referrals' | 'Wallet' | 'Mine';
  gradient: readonly [string, string];
  accentColor: string;
  imageUrl: string;
}

export const HOME_BANNERS_CACHE_KEY = 'gt_cached_mobile_home_banners';

// Only banners uploaded in Admin Panel are displayed. No hardcoded fallback banners.
export const DEFAULT_HOME_BANNERS: HomeBannerSlide[] = [];

let memoryHomeBanners: HomeBannerSlide[] | null = null;
let inFlightHomePromise: Promise<HomeBannerSlide[] | null> | null = null;

function resolveRemoteImageUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${SERVER_HOST}${path}`;
}

export function getMemoryHomeBanners(): HomeBannerSlide[] | null {
  return memoryHomeBanners;
}

export async function prefetchHomeBannerImages(slides: HomeBannerSlide[], maxWaitMs = 2500): Promise<void> {
  const uris = slides
    .map((s) => s.imageUrl)
    .filter((u): u is string => typeof u === 'string' && u.startsWith('http'));
  if (uris.length === 0) return;

  await Promise.race([
    Promise.allSettled(uris.map((uri) => Image.prefetch(uri).catch(() => false))),
    new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs)),
  ]);
}

export async function getCachedHomeBannersFromStorage(): Promise<HomeBannerSlide[] | null> {
  try {
    const cached = await appStorage.getItem(HOME_BANNERS_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (!Array.isArray(parsed)) return null;
    const normalized: HomeBannerSlide[] = parsed.map((b: any) => ({
      ...b,
      imageUrl: resolveRemoteImageUrl(b?.imageUrl),
    }));
    memoryHomeBanners = normalized;
    if (normalized.length > 0) {
      prefetchHomeBannerImages(normalized, 1200).catch(() => {});
    }
    return normalized;
  } catch {
    return null;
  }
}

export function fetchAndCacheHomeBanners(timeoutMs = 4500): Promise<HomeBannerSlide[] | null> {
  if (inFlightHomePromise) return inFlightHomePromise;

  inFlightHomePromise = (async () => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const res = await fetch(`${API_BASE_URL}/home-banners`, {
        signal: controller ? controller.signal : undefined,
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (timer) clearTimeout(timer);

      const data = await res.json();
      if (data && data.success && Array.isArray(data.banners)) {
        const active = data.banners
          .filter((b: any) => b && b.isActive !== false)
          .slice()
          .sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0));

        const mapped: HomeBannerSlide[] = active.map((b: any, idx: number) => ({
          id: b.id || b.order || idx + 1,
          tag: b.tag || '',
          title: b.title || '',
          description: b.description || '',
          ctaText: b.ctaText || '',
          targetRoute: (b.targetRoute === '/referrals'
            ? 'Referrals'
            : b.targetRoute === '/wallet'
              ? 'Wallet'
              : 'Mine') as 'Referrals' | 'Wallet' | 'Mine',
          gradient: [b.gradientStart || '#0A2A18', b.gradientEnd || '#05180E'] as const,
          accentColor: b.accentColor || '#22C55E',
          imageUrl: resolveRemoteImageUrl(b.imageUrl),
        }));

        memoryHomeBanners = mapped;
        appStorage.setItem(HOME_BANNERS_CACHE_KEY, JSON.stringify(mapped)).catch(() => {});
        if (mapped.length > 0) {
          await prefetchHomeBannerImages(mapped, 2500);
        }
        return mapped;
      }
      return [];
    } catch {
      if (timer) clearTimeout(timer);
      return memoryHomeBanners || [];
    } finally {
      inFlightHomePromise = null;
    }
  })();

  return inFlightHomePromise;
}

