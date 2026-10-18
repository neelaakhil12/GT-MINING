import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Pickaxe,
  Users,
  Sparkles,
  Layers,
  ArrowRight
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
      description: 'Experience the next-generation GT Titanium network with high-yield proof-of-presence.',
      ctaText: 'Explore Mining',
      ctaLink: '/mining',
      accentColor: '#22C55E',
    },
    {
      id: 2,
      image: '/banners/slide2.jpg',
      tag: 'GLOBAL ALLIANCE',
      title: 'Exclusive Rewards',
      description: 'Invite your circle and multiply your GT mining hashpower across active nodes.',
      ctaText: 'Invite Friends',
      ctaLink: '/referrals',
      accentColor: '#38BDF8',
    },
    {
      id: 3,
      image: '/banners/slide3.jpg',
      tag: 'DECENTRALIZED VAULT',
      title: 'Next-Gen Asset Security',
      description: 'Fair allocation protocol locked by 4-hour cryptographic epoch timestamps.',
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
      
      {/* 1. Header Hero Image Slides Carousel (Replaces old welcome box as requested) */}
      <div className="relative rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(22,101,52,0.14)] border-2 border-white/90 group bg-[#071F14]">
        
        {/* Slides Track */}
        <div className="relative h-[220px] sm:h-[300px] md:h-[360px] w-full overflow-hidden">
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
                <div className="absolute -left-10 -bottom-10 w-96 h-96 bg-[#22C55E]/20 rounded-full blur-3xl pointer-events-none" />

                {/* Slide Foreground Content */}
                <div className="absolute inset-0 p-5 sm:p-10 md:p-12 flex flex-col justify-end text-white max-w-xl space-y-2 sm:space-y-3 z-20">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase w-fit">
                    <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: slide.accentColor }} />
                    <span>{slide.tag}</span>
                  </div>

                  <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                    {slide.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-white/85 line-clamp-2 font-medium max-w-md drop-shadow">
                    {slide.description}
                  </p>

                  <div className="pt-1 sm:pt-2">
                    <Link
                      to={slide.ctaLink}
                      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-black text-xs sm:text-sm shadow-[0_8px_20px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_28px_rgba(34,197,94,0.6)] transition-all transform active:scale-95"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicator Dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                currentSlide === i ? 'w-7 sm:w-8 bg-[#22C55E] shadow-sm' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Horizontal Crypto Asset Rates Track matching user reference video */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1E5E36]">
            Market Overview
          </span>
          <span className="text-[11px] font-bold text-[#15803D]">
            Live UTC Rates
          </span>
        </div>

        {/* Horizontal scroll on mobile, responsive grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          
          {/* Card 1: GT TITANIUM */}
          <div className="min-w-[240px] sm:min-w-0 flex-1 snap-start p-4 sm:p-5 rounded-3xl bg-white/85 border border-white shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#22C55E]/20 to-[#86EFAC]/30 flex items-center justify-center text-[#15803D]">
                <Users className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#22C55E]/15 text-[#15803D]">
                +12.4%
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5E36]">
                GT TITANIUM
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#0A341B]">
                5,200
              </div>
              <div className="text-xs font-semibold text-[#1E5E36]">
                $1,200
              </div>
            </div>
          </div>

          {/* Card 2: BITCOIN */}
          <div className="min-w-[240px] sm:min-w-0 flex-1 snap-start p-4 sm:p-5 rounded-3xl bg-white/85 border border-white shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FCD34D] flex items-center justify-center text-white font-black text-sm shadow-sm">
                ₿
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#22C55E]/15 text-[#15803D]">
                +1.2%
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5E36]">
                BITCOIN
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#0A341B]">
                0.041
              </div>
              <div className="text-xs font-semibold text-[#1E5E36]">
                $2,400
              </div>
            </div>
          </div>

          {/* Card 3: ETHEREUM */}
          <div className="min-w-[240px] sm:min-w-0 flex-1 snap-start p-4 sm:p-5 rounded-3xl bg-white/85 border border-white shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#A5B4FC] flex items-center justify-center text-white font-black text-sm shadow-sm">
                Ξ
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#EF4444]/15 text-[#DC2626]">
                -0.5%
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5E36]">
                ETHEREUM
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#0A341B]">
                1.42
              </div>
              <div className="text-xs font-semibold text-[#1E5E36]">
                $3,100
              </div>
            </div>
          </div>

          {/* Card 4: SOLANA */}
          <div className="min-w-[240px] sm:min-w-0 flex-1 snap-start p-4 sm:p-5 rounded-3xl bg-white/85 border border-white shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#14F195] to-[#9945FF] flex items-center justify-center text-white font-black text-sm shadow-sm">
                ◎
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#22C55E]/15 text-[#15803D]">
                +5.1%
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5E36]">
                SOLANA
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#0A341B]">
                24.5
              </div>
              <div className="text-xs font-semibold text-[#1E5E36]">
                $3,400
              </div>
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

        {/* Exclusive Rewards Referral Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#3B0764]/95 via-[#1E1B4B]/95 to-[#064E3B]/95 text-white shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden border border-white/20">
          <div className="space-y-1 relative z-10">
            <h3 className="text-xl font-black text-white">
              Exclusive Rewards
            </h3>
            <p className="text-xs text-[#E9D5FF] leading-relaxed">
              Refer your friends and earn more GT mining power per hour.
            </p>
          </div>

          <div className="flex items-center justify-center py-2 relative z-10">
            <GtLogo size="md" animated glow />
          </div>

          <div className="relative z-10">
            <Link
              to="/referrals"
              className="w-full py-3 rounded-2xl bg-white/95 hover:bg-white text-[#1E1B4B] font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span>Invite Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
