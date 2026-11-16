import { Image } from 'react-native';
import { API_BASE_URL, SERVER_HOST } from '../config/api';
import { appStorage } from './storage';

export interface ReferralBannerSlide {
  id: string | number;
  tag?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  targetRoute?: string;
  gradientStart?: string;
  gradientEnd?: string;
  accentColor?: string;
  imageUrl?: string;
  isActive?: boolean;
  order?: number;
}

export const REFERRAL_BANNERS_CACHE_KEY = 'gt_cached_referral_banners';

let memoryReferralBanners: ReferralBannerSlide[] | null = null;
let inFlightReferralPromise: Promise<ReferralBannerSlide[] | null> | null = null;

export function resolveRemoteImageUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${SERVER_HOST}${path}`;
}

export function getMemoryReferralBanners(): ReferralBannerSlide[] | null {
  return memoryReferralBanners;
}

export async function prefetchReferralBannerImages(slides: ReferralBannerSlide[], maxWaitMs = 2500): Promise<void> {
  const uris = slides
    .map((s) => s.imageUrl)
    .filter((u): u is string => typeof u === 'string' && u.startsWith('http'));
  if (uris.length === 0) return;

  await Promise.race([
    Promise.allSettled(uris.map((uri) => Image.prefetch(uri).catch(() => false))),
    new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs)),
  ]);
}

export async function getCachedReferralBannersFromStorage(): Promise<ReferralBannerSlide[] | null> {
  try {
    const cached = await appStorage.getItem(REFERRAL_BANNERS_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (!Array.isArray(parsed)) return null;
    const normalized: ReferralBannerSlide[] = parsed.map((b: any) => ({
      ...b,
      imageUrl: resolveRemoteImageUrl(b?.imageUrl),
    }));
    memoryReferralBanners = normalized;
    if (normalized.length > 0) {
      prefetchReferralBannerImages(normalized, 1200).catch(() => {});
    }
    return normalized;
  } catch {
    return null;
  }
}

export function fetchAndCacheReferralBanners(timeoutMs = 4500): Promise<ReferralBannerSlide[] | null> {
  if (inFlightReferralPromise) return inFlightReferralPromise;

  inFlightReferralPromise = (async () => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const res = await fetch(`${API_BASE_URL}/referral-banners?t=${Date.now()}`, {
        signal: controller ? controller.signal : undefined,
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      if (timer) clearTimeout(timer);

      const data = await res.json();
      if (data && data.success && Array.isArray(data.banners)) {
        const active = data.banners
          .filter((b: any) => b && b.isActive !== false)
          .slice()
          .sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0));

        const mapped: ReferralBannerSlide[] = active.map((b: any, idx: number) => ({
          id: b.id || idx + 1,
          tag: b.tag || 'PROTOCOL DIVIDEND',
          title: b.title || '',
          description: b.description || '',
          ctaText: b.ctaText || '',
          targetRoute: b.targetRoute || '/referrals',
          gradientStart: b.gradientStart || '#0A2A18',
          gradientEnd: b.gradientEnd || '#05180E',
          accentColor: b.accentColor || '#22C55E',
          imageUrl: resolveRemoteImageUrl(b.imageUrl),
        }));

        memoryReferralBanners = mapped;
        appStorage.setItem(REFERRAL_BANNERS_CACHE_KEY, JSON.stringify(mapped)).catch(() => {});
        if (mapped.length > 0) {
          await prefetchReferralBannerImages(mapped, 2500);
        }
        return mapped;
      }
      return [];
    } catch {
      if (timer) clearTimeout(timer);
      return memoryReferralBanners || [];
    } finally {
      inFlightReferralPromise = null;
    }
  })();

  return inFlightReferralPromise;
}
