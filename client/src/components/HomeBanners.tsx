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

export const HomeBanners: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/banners/slide1.jpg',
      tag: 'GT ECOSYSTEM',
      title: 'Join the Future of Mining',
      description: 'Experience the GT Titanium network.',
      ctaText: 'Explore Now',
      ctaLink: '/mining',
      accentColor: '#22C55E',
    },
    {
      id: 2,
      image: '/banners/slide2.jpg',
      tag: 'GLOBAL ALLIANCE',
      title: 'Exclusive Rewards',
      description: 'Invite your circle and multiply your GT mining hashpower.',
      ctaText: 'Invite Friends',
      ctaLink: '/referrals',
      accentColor: '#38BDF8',
    },
    {
      id: 3,
      image: '/banners/slide3.jpg',
      tag: 'DECENTRALIZED VAULT',
      title: 'Next-Gen Asset Security',
      description: 'Fair allocation protocol locked by 4-hour cryptographic epochs.',
      ctaText: 'View Wallet',
      ctaLink: '/wallet',
      accentColor: '#A855F7',
    },
  ];

  // Auto stream slides (1 image per 1.5 seconds as requested)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header Hero Image Slides Carousel (compact size matching client reference) */}
      <div className="relative rounded-3xl overflow-hidden shadow-[0_14px_35px_rgba(22,101,52,0.12)] border-2 border-white/90 group bg-[#071F14]">
        
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
                {/* Background Image with Ambient Glass Gradient Overlays */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.08] transition-transform duration-1000 scale-100 hover:scale-105"
                  loading="eager"
                />

                {/* Multi-layered cinematic gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-[#22C55E]/20 rounded-full blur-3xl pointer-events-none" />

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
          
          {/* Card 1: GT TITANIUM */}
          <div className="w-[calc(50%-6px)] min-w-[145px] sm:w-auto sm:min-w-0 flex-shrink-0 snap-start p-3.5 sm:p-4 rounded-[24px] bg-white/90 border border-white shadow-sm flex flex-col justify-between gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#22C55E]/15 to-[#86EFAC]/25 flex items-center justify-center text-[#15803D]">
              <Users className="w-4.5 h-4.5" />
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1E5E36]/80 block">
                GT TITANIUM
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#0A341B] tracking-tight">
                5,200
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-xs">
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

        {/* Exclusive Rewards Referral Card matching homepage slider size */}
        <div className="relative h-[165px] sm:h-[210px] md:h-[260px] rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(16,185,129,0.22)] border-2 border-white/90 group bg-[#06180E] select-none">
          {/* Animated Multi-Color Aurora Mesh Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#05160E] via-[#0B1528] to-[#180B2B] pointer-events-none" />

          {/* Flowing animated color orbs */}
          {/* Emerald / Mint Neon Aurora */}
          <div className="absolute -top-12 -left-10 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-br from-[#10B981] via-[#22C55E] to-[#4ADE80] rounded-full blur-[55px] sm:blur-[70px] opacity-80 animate-aurora-1 pointer-events-none" />

          {/* Electric Violet / Fuchsia Aurora */}
          <div className="absolute -bottom-10 right-0 sm:right-16 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-tl from-[#7C3AED] via-[#A855F7] to-[#EC4899] rounded-full blur-[50px] sm:blur-[65px] opacity-75 animate-aurora-2 pointer-events-none" />

          {/* Cyber Cyan / Aqua Glow */}
          <div className="absolute top-4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-[#06B6D4] via-[#0EA5E9] to-[#3B82F6] rounded-full blur-[45px] sm:blur-[60px] opacity-65 animate-aurora-3 pointer-events-none" />

          {/* Golden Sunburst Sparkle Glow */}
          <div className="absolute -top-6 right-8 w-36 h-36 sm:w-48 sm:h-48 bg-gradient-to-bl from-[#F59E0B] via-[#FBBF24] to-transparent rounded-full blur-[40px] opacity-50 animate-pulse-glow pointer-events-none" />

          {/* Futuristic subtle grid matrix */}
          <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* Light Sweep Shimmer Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none animate-aurora-sweep" />

          {/* Contrast vignette for maximum legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

          {/* Right Side: Animated 3D Reward Orb & Orbital Rings */}
          <div className="absolute right-3 sm:right-8 md:right-12 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 scale-[0.75] sm:scale-100 origin-right">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex items-center justify-center animate-float-gentle">
              {/* Outer Cyan/Emerald Orbital Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#34D399]/60 animate-orbit-ring" />
              
              {/* Inner Violet/Magenta Orbital Ring */}
              <div className="absolute inset-2 sm:inset-3 rounded-full border-2 border-[#C084FC]/70 animate-orbit-ring-rev" />

              {/* Glowing Core Gem Orb */}
              <div className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 rounded-2xl bg-gradient-to-tr from-[#10B981] via-[#8B5CF6] to-[#EC4899] p-[2px] shadow-[0_0_35px_rgba(139,92,246,0.65)] group-hover:scale-110 transition-transform duration-500">
                <div className="w-full h-full rounded-2xl bg-[#09151D]/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
                  <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-[#A7F3D0] animate-bounce" />
                  <span className="text-[9px] sm:text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#A7F3D0] to-[#E9D5FF] tracking-wider mt-0.5">
                    BONUS
                  </span>
                </div>
              </div>

              {/* Floating +10% Boost Chip */}
              <div className="absolute -top-1 -right-1 sm:top-0 sm:right-0 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-lg text-[9px] sm:text-[11px] font-black text-white flex items-center gap-1 animate-pulse">
                <Zap className="w-2.5 h-2.5 text-[#FBBF24] fill-[#FBBF24]" />
                <span>+10%</span>
              </div>

              {/* Sparkle accents */}
              <Sparkles className="absolute -bottom-1 -left-1 w-4 h-4 text-[#FDE047] animate-pulse" />
              <div className="absolute top-3 left-1 w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping" />
            </div>
          </div>

          {/* Slide Foreground Content */}
          <div className="absolute inset-0 p-4 sm:p-7 md:p-8 flex flex-col justify-end text-white max-w-[220px] sm:max-w-xl space-y-1.5 sm:space-y-2 z-20">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-white text-[9px] sm:text-[10px] font-black tracking-widest uppercase w-fit shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC] animate-ping" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A7F3D0] via-[#DDD6FE] to-white font-extrabold">
                REFERRAL BONUS
              </span>
            </div>

            <h3 className="text-base sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md leading-tight">
              Exclusive Rewards
            </h3>

            <p className="text-[11px] sm:text-xs text-white/90 line-clamp-2 font-medium max-w-[210px] sm:max-w-md drop-shadow">
              Refer your friends and earn 10% more GT mining power per hour.
            </p>

            <div className="pt-1">
              <Link
                to="/referrals"
                className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-white via-white/95 to-[#E0F2FE] hover:from-white hover:to-white text-[#0A341B] font-black text-xs sm:text-sm shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_10px_28px_rgba(34,197,94,0.4)] transition-all active:scale-95 group/btn"
              >
                <span>Invite Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
