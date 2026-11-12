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

export const DEFAULT_HOME_BANNERS: HomeBannerSlide[] = [
  {
    id: 1,
    tag: 'MINING ENGINE',
    title: 'Automated GT Cloud Node',
    description: 'Mine GT Coins automatically every mining cycle directly to your vault.',
    ctaText: 'Go to Mine Node',
    targetRoute: 'Mine',
    gradient: ['#0A2A18', '#05180E'] as const,
    accentColor: '#22C55E',
    imageUrl: '',
  },
  {
    id: 2,
    tag: 'CIRCLE REWARDS',
    title: '10% Team Referral Bonus',
    description: 'Invite friends with your GT Code & earn 10% instant lifetime mining yield.',
    ctaText: 'Invite & Earn',
    targetRoute: 'Referrals',
    gradient: ['#0F291A', '#04140A'] as const,
    accentColor: '#4ADE80',
    imageUrl: '',
  },
  {
    id: 3,
    tag: 'DIRECT LEDGER',
    title: 'Zero Gas Vault Settlement',
    description: 'Guaranteed ledger settlements directly inside your personal wallet ledger.',
    ctaText: 'Open Wallet',
    targetRoute: 'Wallet',
    gradient: ['#052110', '#020F07'] as const,
    accentColor: '#10B981',
    imageUrl: '',
  },
];

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
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const normalized: HomeBannerSlide[] = parsed.map((b: any) => ({
      ...b,
      imageUrl: resolveRemoteImageUrl(b?.imageUrl),
    }));
    if (!memoryHomeBanners) {
      memoryHomeBanners = normalized;
    }
    prefetchHomeBannerImages(normalized, 1200).catch(() => {});
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
      if (data && data.success && Array.isArray(data.banners) && data.banners.length > 0) {
        const active = data.banners
          .filter((b: any) => b && b.isActive !== false)
          .slice()
          .sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0));

        if (active.length > 0) {
          const mapped: HomeBannerSlide[] = active.map((b: any, idx: number) => ({
            id: b.id || b.order || idx + 1,
            tag: b.tag || 'GT ECOSYSTEM',
            title: b.title || '',
            description: b.description || '',
            ctaText: b.ctaText || 'Explore Now',
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
          await prefetchHomeBannerImages(mapped, 2500);
          return mapped;
        }
      }
      return null;
    } catch {
      if (timer) clearTimeout(timer);
      return null;
    } finally {
      inFlightHomePromise = null;
    }
  })();

  return inFlightHomePromise;
}

