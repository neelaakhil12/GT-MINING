import React from 'react';
import { Link } from 'react-router-dom';
import { Pickaxe, ShieldCheck, Users, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { GtLogo } from '../components/GtLogo';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden">
      
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-16 md:pb-24">
        
        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
          
          {/* Pill Badge matching vector theme */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-white text-[#15803D] text-xs font-bold shadow-[0_4px_16px_rgba(22,101,52,0.08)] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Virtual GT Coin Protocol • 4-Hour Mining Engine</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0A341B] leading-[1.15]">
            Mine Virtual <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D]">GT Coins</span> Every 4 Hours
          </h1>

          <p className="text-base sm:text-lg text-[#1E5E36] max-w-2xl mx-auto leading-relaxed font-medium">
            Zero hardware wear. Zero high battery consumption. Claim verified GT coin rewards, track your wallet ledger, and expand your referral network in our green glassmorphic ecosystem.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              to={isAuthenticated ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_10px_25px_rgba(34,197,94,0.4)] hover:shadow-[0_15px_35px_rgba(34,197,94,0.6)] transition-all flex items-center justify-center gap-2 transform active:scale-95 text-sm sm:text-base"
            >
              <Pickaxe className="w-5 h-5 animate-bounce" />
              <span>{isAuthenticated ? 'Open Dashboard' : 'Start Mining Free'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/community"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-[#15803D] bg-white/80 border border-white hover:bg-white hover:shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <span>Explore Community</span>
            </Link>
          </div>

          {/* Hero Showcase Card mirroring the user's uploaded vector reference */}
          <div className="pt-10 pb-4 flex justify-center">
            <div className="relative max-w-xl w-full p-8 rounded-3xl glass-panel text-left space-y-4 border-2 border-white/90 shadow-[0_25px_60px_-15px_rgba(22,101,52,0.18)]">
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-black uppercase tracking-widest text-[#15803D]">
                    GLASS morphism
                  </span>
                  <h3 className="text-2xl font-black text-[#0A341B]">
                    Luminous Green Protocol
                  </h3>
                </div>
                <GtLogo size="md" animated glow />
              </div>

              <p className="text-xs sm:text-sm text-[#1E5E36] leading-relaxed">
                Experience ultra-smooth translucent liquid glass elements, tactile green glow borders, 3D floating visual assets, and authentic 4-hour countdown timers.
              </p>

              {/* Vector-inspired stats indicators */}
              <div className="flex items-center gap-4 pt-2 border-t border-black/5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-white text-xs font-black text-[#15803D] shadow-sm">
                  <span>▲</span>
                  <span>45% Active Hash</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-white text-xs font-bold text-[#1E5E36] shadow-sm">
                  <span>▼</span>
                  <span>36% Power Save</span>
                </div>
                <div className="ml-auto text-xs font-bold text-[#16A34A] uppercase tracking-wider">
                  04:00:00 Cycle
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 relative z-10">
          <GlassCard interactive className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0A341B]">4-Hour Cooldown Protocol</h3>
            <p className="text-xs sm:text-sm text-[#1E5E36] leading-relaxed">
              Every eligible member claims exactly 1 GT per session. Timestamps are strictly verified on the server using UTC.
            </p>
          </GlassCard>

          <GlassCard interactive className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0A341B]">Referral Circle Rewards</h3>
            <p className="text-xs sm:text-sm text-[#1E5E36] leading-relaxed">
              Share your custom invite link across WhatsApp, Telegram, and X. Track active mining companions with instant attribution.
            </p>
          </GlassCard>

          <GlassCard interactive className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0A341B]">Auditable Wallet Ledger</h3>
            <p className="text-xs sm:text-sm text-[#1E5E36] leading-relaxed">
              All GT reward transactions are immutably logged with unique idempotency keys to ensure zero double-credits.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/80 bg-white/70 backdrop-blur-2xl py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#1E5E36]">
          <div className="flex items-center gap-2">
            <GtLogo size="xs" glow={false} />
            <span className="font-bold text-[#0A341B]">GT Mining Network</span>
            <span>© 2026. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-[#0A341B] transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-[#0A341B] transition-colors">Privacy Policy</Link>
            <Link to="/admin/login" className="text-[#D97706] hover:underline transition-colors">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
