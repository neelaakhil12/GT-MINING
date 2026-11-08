import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Pickaxe,
  Users,
  Sparkles,
  Layers,
  ArrowRight,
  Gift,
  Zap
} from 'lucide-react';
import { GtLogo } from './GtLogo';
import { GtCoinStream3D } from './GtCoinStream3D';
import { GtCoinOrbitWeb } from './GtCoinOrbitWeb';
import { api } from '../services/api';

export const HomeBanners: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('gt_cached_home_banners');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return [];
  });

  const loadBanners = async () => {
    try {
      const res = await api.getPublicHomeBanners();
      if (res.success && Array.isArray(res.banners)) {
        const mapped = res.banners
          .filter((b: any) => b.isActive !== false)
          .map((b: any) => ({
            id: b.id,
            image: b.imageUrl,
            tag: b.tag || 'GT ECOSYSTEM',
            title: b.title,
            description: b.description,
            ctaText: b.ctaText || 'Explore Now',
            ctaLink: b.targetRoute || '/mining',
            accentColor: b.accentColor || '#22C55E',
          }));
        if (mapped.length > 0) {
          setSlides(mapped);
          try {
            localStorage.setItem('gt_cached_home_banners', JSON.stringify(mapped));
          } catch {}
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadBanners();
    const handleUpdate = () => loadBanners();
    window.addEventListener('gt_db_updated', handleUpdate);
    return () => window.removeEventListener('gt_db_updated', handleUpdate);
  }, []);

  // Auto stream slides (1 image per 1.5 seconds as requested)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="space-y-6">
        <div className="relative rounded-3xl overflow-hidden h-[165px] sm:h-[210px] md:h-[260px] w-full bg-[#071F14] border-2 border-white/40 shadow-[0_14px_35px_rgba(0,0,0,0.12)] animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <img src="/gt-header-logo.png" alt="Loading" className="w-8 h-8 object-contain opacity-50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header Hero Image Slides Carousel (compact size matching client reference) */}
      <div className="relative rounded-3xl overflow-hidden shadow-[0_14px_35px_rgba(0,0,0,0.12)] border-2 border-white/90 group bg-neutral-950">
        
        {/* Slides Track - Reduced size on mobile and desktop views */}
        <div className="relative h-[165px] sm:h-[210px] md:h-[260px] w-full overflow-hidden">
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Clear Background Image without green overlay */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center transition-transform duration-1000 scale-100 hover:scale-105"
                  loading="eager"
                />

                {/* Gentle bottom scrim so title & button are crisp without obscuring the image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                {/* Slide Foreground Content */}
                <div className="absolute inset-0 p-4 sm:p-7 md:p-8 flex flex-col justify-end text-white max-w-xl space-y-1.5 sm:space-y-2.5 z-20">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[10px] font-black tracking-widest uppercase w-fit">
                    <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: slide.accentColor }} />
                    <span>{slide.tag}</span>
                  </div>

                  <h2 className="text-base sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                    {slide.title}
                  </h2>

                  <p className="text-[11px] sm:text-xs text-white/85 line-clamp-1 sm:line-clamp-2 font-medium max-w-md drop-shadow">
                    {slide.description}
                  </p>

                  <div className="pt-1">
                    <Link
                      to={slide.ctaLink}
                      className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-black text-xs sm:text-sm shadow-[0_6px_16px_rgba(34,197,94,0.4)] hover:shadow-[0_10px_24px_rgba(34,197,94,0.6)] transition-all transform active:scale-95"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicator Dots */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === i ? 'w-6 bg-[#22C55E] shadow-sm' : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Horizontal Crypto Asset Rates Track matching user reference image */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1E5E36]">
            Market Overview
          </span>
          <span className="text-[11px] font-bold text-[#15803D]">
            Live UTC Rates
          </span>
        </div>

        {/* 2 cards side-by-side on mobile, responsive grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          
          {/* Card 1: GT with 3D Animated Coin Stream */}
          <div className="relative overflow-hidden w-[calc(50%-6px)] min-w-[145px] sm:w-auto sm:min-w-0 flex-shrink-0 snap-start p-3.5 sm:p-4 rounded-[24px] bg-white/95 border border-white shadow-sm flex flex-col justify-between gap-2.5 group">
            {/* 3D Animated GT Coins Orbit with continuous loop & crystal logo */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <GtCoinOrbitWeb width={150} height={110} />
            </div>

            {/* Subtle ambient corner glow */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#22C55E]/12 rounded-full blur-xl pointer-events-none" />

            {/* Card Content Overlay */}
            <div className="relative z-10 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1E5E36]/90 block">
                GT
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#0A341B] tracking-tight">
                5,200
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-0.5 text-xs">
              <span className="font-semibold text-[#1E5E36]">
                $1,200
              </span>
              <span className="font-bold text-[#16A34A]">
                +12.4%
              </span>
            </div>
          </div>

          {/* Card 2: BITCOIN */}
          <div className="w-[calc(50%-6px)] min-w-[145px] sm:w-auto sm:min-w-0 flex-shrink-0 snap-start p-3.5 sm:p-4 rounded-[24px] bg-white/90 border border-white shadow-sm flex flex-col justify-between gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center text-white font-black text-sm shadow-sm">
              ₿
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1E5E36]/80 block">
                BITCOIN
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#0A341B] tracking-tight">
                0.041
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-xs">
              <span className="font-semibold text-[#1E5E36]">
                $2,400
              </span>
              <span className="font-bold text-[#16A34A]">
                +1.2%
              </span>
            </div>
          </div>

          {/* Card 3: ETHEREUM */}
          <div className="w-[calc(50%-6px)] min-w-[145px] sm:w-auto sm:min-w-0 flex-shrink-0 snap-start p-3.5 sm:p-4 rounded-[24px] bg-white/90 border border-white shadow-sm flex flex-col justify-between gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#6366F1]/15 to-[#A5B4FC]/25 flex items-center justify-center text-[#4F46E5] font-black text-sm">
              Ξ
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1E5E36]/80 block">
                ETHEREUM
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#0A341B] tracking-tight">
                1.42
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-xs">
              <span className="font-semibold text-[#1E5E36]">
                $3,100
              </span>
              <span className="font-bold text-[#DC2626]">
                -0.5%
              </span>
            </div>
          </div>

          {/* Card 4: SOLANA */}
          <div className="w-[calc(50%-6px)] min-w-[145px] sm:w-auto sm:min-w-0 flex-shrink-0 snap-start p-3.5 sm:p-4 rounded-[24px] bg-white/90 border border-white shadow-sm flex flex-col justify-between gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-[#0F172A] flex items-center justify-center text-[#14F195] font-black text-sm shadow-sm">
              ◎
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1E5E36]/80 block">
                SOLANA
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#0A341B] tracking-tight">
                24.5
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-xs">
              <span className="font-semibold text-[#1E5E36]">
                $3,400
              </span>
              <span className="font-bold text-[#16A34A]">
                +5.1%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Cards Row matching video */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Mine $GT Action Card */}
        <div className="p-6 rounded-3xl bg-white/85 border border-white shadow-sm flex items-center justify-between gap-4 relative overflow-hidden group">
          <div className="space-y-2 relative z-10 max-w-[240px]">
            <h3 className="text-xl sm:text-2xl font-black text-[#0A341B]">
              Mine $GT
            </h3>
            <p className="text-xs text-[#1E5E36] font-medium">
              Build the Human Network
            </p>
            <div className="pt-2">
              <Link
                to="/mining"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-black text-xs shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_28px_rgba(34,197,94,0.5)] transition-all transform active:scale-95"
              >
                <span>Mine $GT</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#22C55E]/20 to-[#86EFAC]/30 flex items-center justify-center p-2 shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              <span className="font-black text-2xl text-[#15803D] italic">GT</span>
            </div>
          </div>
        </div>

        {/* Exclusive Rewards Referral Card matching app's sleek design */}
        <div className="relative rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(16,185,129,0.22)] border-2 border-white/90 group bg-[#06180E] select-none p-5 sm:p-6 flex flex-col justify-between min-h-[175px] sm:min-h-[210px]">
          {/* Animated Multi-Color Aurora Mesh Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#071A12] via-[#0A1526] to-[#1A0B2C] pointer-events-none" />

          {/* Flowing animated color orbs */}
          <div className="absolute -top-6 -left-6 w-40 h-40 rounded-full bg-[#10B981]/35 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -right-4 w-48 h-48 rounded-full bg-[#A855F7]/35 blur-2xl pointer-events-none" />
          <div className="absolute top-2 right-12 w-32 h-32 rounded-full bg-[#06B6D4]/25 blur-xl pointer-events-none" />

          {/* Top Badges Row */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/25 text-white shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC] animate-ping" />
              <span className="text-[9.5px] sm:text-[10.5px] font-black tracking-widest uppercase text-[#A7F3D0]">
                REFERRAL BONUS
              </span>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/35 text-white text-[10px] sm:text-xs font-black shadow-sm">
              <Zap className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />
              <span>+10%</span>
            </div>
          </div>

          {/* Content & Orbital Graphic Row */}
          <div className="relative z-10 flex items-center justify-between gap-3 mt-3">
            <div className="flex-1 space-y-1.5 max-w-[230px] sm:max-w-md">
              <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                Exclusive Rewards
              </h3>
              <p className="text-[11px] sm:text-xs text-white/90 line-clamp-2 font-medium">
                Refer your friends and earn 10% more GT mining power per hour.
              </p>
              <div className="pt-1.5">
                <Link
                  to="/referrals"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-white hover:bg-white/95 text-[#0A341B] font-black text-xs shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_20px_rgba(34,197,94,0.35)] transition-all active:scale-95 group/btn"
                >
                  <span>Invite Now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* 3D Glowing Orbital Gift Gem Graphic */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
              {/* Outer Dashed Orbit Ring */}
              <div className="absolute w-[88px] h-[70px] sm:w-[98px] sm:h-[78px] rounded-[36px] border-[1.5px] border-dashed border-[#34D399]/60 -rotate-20 pointer-events-none" />
              
              {/* Inner Violet Orbit Ring */}
              <div className="absolute w-[76px] h-[58px] sm:w-[84px] sm:h-[66px] rounded-[30px] border-[1.5px] border-[#C084FC]/70 rotate-25 pointer-events-none" />

              {/* Glowing Core Gem Orb */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#10B981] via-[#8B5CF6] to-[#EC4899] p-[2px] shadow-[0_0_25px_rgba(139,92,246,0.65)] hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-[14px] bg-[#09151D]/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-[#A7F3D0]" />
                  <span className="text-[8.5px] sm:text-[9.5px] font-black text-[#A7F3D0] tracking-wider mt-0.5">
                    BONUS
                  </span>
                </div>
              </div>

              {/* Sparkle accents */}
              <Sparkles className="absolute -bottom-1 -left-1 w-4 h-4 text-[#FDE047] pointer-events-none" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#38BDF8] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
