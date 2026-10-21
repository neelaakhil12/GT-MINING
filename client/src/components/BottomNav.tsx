import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users } from 'lucide-react';

/**
 * Universally recognized World Earth Globe icon with continents.
 * Standardized Material/Public world map projection that is instantly
 * identifiable as a global Earth map.
 */
const EarthGlobeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const isHomeActive = location.pathname === '/dashboard';
  const isNodeActive = location.pathname === '/community';
  const isMineActive = location.pathname === '/mining';
  const isReferralActive = location.pathname === '/referrals';

  return (
    <nav className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[340px] pointer-events-none safe-area-bottom">
      <div className="w-full bg-[#EBF8EF]/90 backdrop-blur-2xl rounded-full border border-white/95 shadow-[0_12px_36px_rgba(22,101,52,0.18)] px-3 py-2 flex items-center justify-around pointer-events-auto">
        
        {/* 1. Home Button */}
        <NavLink
          to="/dashboard"
          className="flex items-center justify-center focus:outline-none"
          aria-label="Home"
        >
          {isHomeActive ? (
            /* Active: Elevated Forest Green Box / Squircle */
            <div className="w-13 h-13 -translate-y-3.5 rounded-2xl bg-gradient-to-b from-[#236840] via-[#1B5734] to-[#124225] border-2 border-white flex items-center justify-center text-white shadow-[0_12px_24px_rgba(18,66,37,0.45)] ring-4 ring-[#22C55E]/20 transition-all duration-300">
              <Home className="w-6 h-6 stroke-[2.4] text-white drop-shadow-sm" />
            </div>
          ) : (
            /* Inactive: Soft Circular Button */
            <div className="w-11 h-11 translate-y-0 rounded-full bg-white/70 border border-white flex items-center justify-center text-[#1E5E36] shadow-sm hover:bg-white hover:text-[#0A341B] transition-all duration-300">
              <Home className="w-5 h-5 stroke-[2.2]" />
            </div>
          )}
        </NavLink>

        {/* 2. Node Button (Identifiable World Globe) */}
        <NavLink
          to="/community"
          className="flex items-center justify-center focus:outline-none"
          aria-label="Node"
        >
          {isNodeActive ? (
            /* Active: Elevated Forest Green Box / Squircle */
            <div className="w-13 h-13 -translate-y-3.5 rounded-2xl bg-gradient-to-b from-[#236840] via-[#1B5734] to-[#124225] border-2 border-white flex items-center justify-center text-white shadow-[0_12px_24px_rgba(18,66,37,0.45)] ring-4 ring-[#22C55E]/20 transition-all duration-300">
              <EarthGlobeIcon className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          ) : (
            /* Inactive: Soft Circular Button */
            <div className="w-11 h-11 translate-y-0 rounded-full bg-white/70 border border-white flex items-center justify-center text-[#1E5E36] shadow-sm hover:bg-white hover:text-[#0A341B] transition-all duration-300">
              <EarthGlobeIcon className="w-5.5 h-5.5 text-[#1E5E36]" />
            </div>
          )}
        </NavLink>

        {/* 3. GT Mine Button */}
        <NavLink
          to="/mining"
          className="flex items-center justify-center focus:outline-none"
          aria-label="Mine GT"
        >
          {isMineActive ? (
            /* Active: Elevated Forest Green Box with Coin */
            <div className="w-13 h-13 -translate-y-3.5 rounded-2xl bg-gradient-to-b from-[#236840] via-[#1B5734] to-[#124225] border-2 border-white flex items-center justify-center shadow-[0_12px_24px_rgba(18,66,37,0.45)] ring-4 ring-[#22C55E]/20 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D6F4DF] to-white flex items-center justify-center shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.8),0_2px_5px_rgba(0,0,0,0.18)] border border-white/60">
                <span
                  className="font-black italic text-xs tracking-tight text-[#124225]"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  GT
                </span>
              </div>
            </div>
          ) : (
            /* Inactive: Soft Circular Button */
            <div className="w-11 h-11 translate-y-0 rounded-full bg-white/70 border border-white flex items-center justify-center text-[#1E5E36] shadow-sm hover:bg-white transition-all duration-300">
              <div className="w-7 h-7 rounded-full bg-[#EBF8EF] border border-[#22C55E]/40 flex items-center justify-center text-[#15803D]">
                <span
                  className="font-black italic text-[11px] tracking-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  GT
                </span>
              </div>
            </div>
          )}
        </NavLink>

        {/* 4. Referrals Button */}
        <NavLink
          to="/referrals"
          className="flex items-center justify-center focus:outline-none"
          aria-label="Referrals"
        >
          {isReferralActive ? (
            /* Active: Elevated Forest Green Box / Squircle */
            <div className="w-13 h-13 -translate-y-3.5 rounded-2xl bg-gradient-to-b from-[#236840] via-[#1B5734] to-[#124225] border-2 border-white flex items-center justify-center text-white shadow-[0_12px_24px_rgba(18,66,37,0.45)] ring-4 ring-[#22C55E]/20 transition-all duration-300">
              <Users className="w-6 h-6 stroke-[2.4] text-white drop-shadow-sm" />
            </div>
          ) : (
            /* Inactive: Soft Circular Button */
            <div className="w-11 h-11 translate-y-0 rounded-full bg-white/70 border border-white flex items-center justify-center text-[#1E5E36] shadow-sm hover:bg-white hover:text-[#0A341B] transition-all duration-300">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
          )}
        </NavLink>

      </div>
    </nav>
  );
};
