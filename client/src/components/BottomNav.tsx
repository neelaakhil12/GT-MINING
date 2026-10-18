import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Globe, Pickaxe, Users, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home, isGt: false },
    { label: 'Node', path: '/community', icon: Globe, isGt: false },
    { label: 'Mine', path: '/mining', icon: Pickaxe, isGt: true },
    { label: 'Referrals', path: '/referrals', icon: Users, isGt: false },
    { label: 'Profile', path: '/profile', icon: User, isGt: false },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-white/90 shadow-[0_-8px_30px_rgba(22,101,52,0.12)] px-2 py-1 safe-area-bottom">
      <div className="flex items-end justify-around max-w-md mx-auto relative h-16 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center relative transition-all duration-300 group"
              aria-label={item.label}
            >
              {isActive ? (
                /* Popped-up elevated green squircle button for the ACTIVE tab */
                <div className="flex flex-col items-center -translate-y-4 transition-transform duration-300">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#15803D] via-[#16A34A] to-[#22C55E] flex items-center justify-center text-white border-2 border-white shadow-[0_12px_28px_rgba(34,197,94,0.55)] ring-4 ring-[#22C55E]/20 animate-in zoom-in-95">
                    {item.isGt ? (
                      <span
                        className="font-black text-xl tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        GT
                      </span>
                    ) : (
                      <Icon className="w-6 h-6 stroke-[2.5]" />
                    )}
                  </div>
                  <span className="text-[10px] font-black text-[#15803D] mt-1 tracking-wider uppercase drop-shadow-sm">
                    {item.label}
                  </span>
                </div>
              ) : (
                /* Normal unpopped tab when INACTIVE */
                <div className="flex flex-col items-center justify-center py-1 px-2 transition-all duration-200 hover:text-[#0A341B] text-[#1E5E36]/70">
                  {item.isGt ? (
                    <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#16A34A]">
                      <span className="font-black text-xs">GT</span>
                    </div>
                  ) : (
                    <Icon className="w-5 h-5 stroke-[2]" />
                  )}
                  <span className="text-[10px] mt-1 font-semibold text-[#1E5E36]/80">
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
