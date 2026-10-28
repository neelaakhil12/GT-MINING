import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Pickaxe,
  Wallet,
  Users,
  Globe,
  Bell,
  User,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = false,
  onClose,
}) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Mining', path: '/mining', icon: Pickaxe, badge: '4h Cycle' },
    { label: 'Wallet', path: '/wallet', icon: Wallet },
    { label: 'My Referrals', path: '/referrals', icon: Users },
    { label: 'Private Network', path: '/private-network', icon: MessageSquare, badge: 'Circle' },
    { label: 'Community News', path: '/community', icon: Globe },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile & Settings', path: '/profile', icon: User },
  ];

  const adminItems = [
    { label: 'Admin Panel', path: '/admin/dashboard', icon: ShieldAlert },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white/70 backdrop-blur-2xl border-r border-white/80 shadow-[4px_0_24px_rgba(22,101,52,0.06)] flex flex-col justify-between py-6 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 space-y-6 overflow-y-auto">
          {/* User quick badge */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-white/80 border border-white/90 shadow-[0_4px_16px_rgba(22,101,52,0.06)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] flex items-center justify-center font-bold text-white shadow-sm">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0A341B] truncate">{user.fullName}</p>
                <p className="text-xs text-[#16A34A] font-bold truncate">Code: {user.referralCode}</p>
              </div>
            </div>
          )}

          {/* Main Navigation Links */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#1E5E36]/80 mb-2">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all group ${
                      isActive
                        ? 'bg-[#22C55E] text-white shadow-[0_8px_20px_rgba(34,197,94,0.35)]'
                        : 'text-[#1E5E36] hover:text-[#0A341B] hover:bg-white/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/30 text-white border border-white/40">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Admin Section if applicable */}
          {isAdmin && (
            <div className="space-y-1 pt-4 border-t border-black/5">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#D97706] mb-2">
                Administration
              </p>
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-[#FBBF24] text-[#07130D] shadow-md'
                          : 'text-[#B45309] hover:bg-[#FEF3C7]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info in sidebar */}
        <div className="px-6 pt-4 border-t border-black/5">
          <div className="flex items-center justify-between text-xs text-[#1E5E36]/70 font-semibold">
            <span>GT Protocol v2.4</span>
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
          </div>
        </div>
      </aside>
    </>
  );
};
