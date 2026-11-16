import { Image } from 'react-native';
import { API_BASE_URL, SERVER_HOST } from '../config/api';
import { appStorage } from './storage';

export interface TaskBannerSlide {
  id: string | number;
  tag?: string;
  badgeText?: string;
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

export const TASK_BANNERS_CACHE_KEY = 'gt_cached_mobile_task_banners';

let memoryTaskBanners: TaskBannerSlide[] | null = null;
let inFlightTaskPromise: Promise<TaskBannerSlide[] | null> | null = null;

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

export function getMemoryTaskBanners(): TaskBannerSlide[] | null {
  return memoryTaskBanners;
}

export async function prefetchTaskBannerImages(slides: TaskBannerSlide[], maxWaitMs = 2500): Promise<void> {
  const uris = slides
    .map((s) => s.imageUrl)
    .filter((u): u is string => typeof u === 'string' && u.startsWith('http'));
  if (uris.length === 0) return;

  await Promise.race([
    Promise.allSettled(uris.map((uri) => Image.prefetch(uri).catch(() => false))),
    new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs)),
  ]);
}

export async function getCachedTaskBannersFromStorage(): Promise<TaskBannerSlide[] | null> {
  try {
    const cached = await appStorage.getItem(TASK_BANNERS_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (!Array.isArray(parsed)) return null;
    const normalized: TaskBannerSlide[] = parsed.map((b: any) => ({
      ...b,
      imageUrl: resolveRemoteImageUrl(b?.imageUrl),
    }));
    memoryTaskBanners = normalized;
    if (normalized.length > 0) {
      prefetchTaskBannerImages(normalized, 1200).catch(() => {});
    }
    return normalized;
  } catch {
    return null;
  }
}

export function fetchAndCacheTaskBanners(timeoutMs = 4500): Promise<TaskBannerSlide[] | null> {
  if (inFlightTaskPromise) return inFlightTaskPromise;

  inFlightTaskPromise = (async () => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const res = await fetch(`${API_BASE_URL}/task-banners?t=${Date.now()}`, {
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

        const mapped: TaskBannerSlide[] = active.map((b: any, idx: number) => ({
          id: b.id || idx + 1,
          tag: b.tag || b.badgeText || '',
          badgeText: b.badgeText || b.tag || '',
          title: b.title || '',
          description: b.description || '',
          ctaText: b.ctaText || '',
          targetRoute: b.targetRoute || '',
          gradientStart: b.gradientStart || '#18181B',
          gradientEnd: b.gradientEnd || '#09090B',
          accentColor: b.accentColor || '#22C55E',
          imageUrl: resolveRemoteImageUrl(b.imageUrl),
        }));

        memoryTaskBanners = mapped;
        appStorage.setItem(TASK_BANNERS_CACHE_KEY, JSON.stringify(mapped)).catch(() => {});
        if (mapped.length > 0) {
          await prefetchTaskBannerImages(mapped, 2500);
        }
        return mapped;
      }
      return [];
    } catch {
      if (timer) clearTimeout(timer);
      return memoryTaskBanners || [];
    } finally {
      inFlightTaskPromise = null;
    }
  })();

  return inFlightTaskPromise;
}
