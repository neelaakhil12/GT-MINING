import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Pickaxe,
  Wallet as WalletIcon,
  Users,
  Globe,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Mining', path: '/mining', icon: Pickaxe, badge: '4h Cycle' },
    { label: 'Wallet', path: '/wallet', icon: WalletIcon },
    { label: 'Referrals', path: '/referrals', icon: Users },
    { label: 'Node', path: '/community', icon: Globe },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin/dashboard', icon: ShieldAlert }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/80 bg-white/85 backdrop-blur-2xl shadow-[0_4px_30px_rgba(22,101,52,0.08)]">
      <div className="relative w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Transparent Background Crystal Logo without text */}
        <div className="flex items-center shrink-0">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center group" aria-label="GT Home">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center shrink-0">
              <img
                src="/gt-header-logo.png"
                alt="GT Crystal Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(34,197,94,0.35)] transition-transform duration-300 group-hover:scale-105"
                loading="eager"
              />
            </div>
          </Link>
        </div>

        {/* Mobile View: Centered App & Wallet Switch */}
        {user && (
          <div className="flex lg:hidden items-center p-1 rounded-full bg-white/80 border border-white shadow-sm backdrop-blur-md absolute left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
            <Link
              to="/dashboard"
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                location.pathname !== '/wallet'
                  ? 'bg-white text-[#0A341B] shadow-sm'
                  : 'text-[#1E5E36] hover:text-[#0A341B]'
              }`}
            >
              App
            </Link>
            <Link
              to="/wallet"
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                location.pathname === '/wallet'
                  ? 'bg-white text-[#0A341B] shadow-sm'
                  : 'text-[#1E5E36] hover:text-[#0A341B]'
              }`}
            >
              Wallet
            </Link>
          </div>
        )}

        {/* Center: Desktop Header Navigation Buttons */}
        {user && (
          <nav className="hidden lg:flex items-center gap-2 p-1.5 rounded-2xl bg-white/70 border border-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${
                      isActive
                        ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-[0_6px_16px_rgba(34,197,94,0.38)]'
                        : 'text-[#1E5E36] hover:text-[#0A341B] hover:bg-white/90'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#22C55E]/20 text-[#15803D] border border-[#22C55E]/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        )}

        {/* Right Side: Quick Mine (desktop only to prevent mobile congestion), Profile Icon (Circle), Logout */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            
            {/* Quick Mine Action Pill - Hidden on mobile view */}
            <Link
              to="/mining"
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-xs font-black shadow-[0_8px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_28px_rgba(34,197,94,0.5)] transition-all transform active:scale-95 uppercase tracking-wider"
            >
              <Pickaxe className="w-4 h-4 animate-pulse" />
              <span>Mine</span>
            </Link>

            {/* Profile Icon button to directly open profile page (Circle Type) */}
            <Link
              to="/profile"
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border transition-all flex items-center justify-center shadow-sm group shrink-0 ${
                location.pathname === '/profile'
                  ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white border-[#22C55E] shadow-[0_4px_14px_rgba(34,197,94,0.4)]'
                  : 'bg-white/85 hover:bg-white text-[#16A34A] hover:text-[#0A341B] border-white hover:shadow-md'
              }`}
              title="Open Profile Page"
              aria-label="Profile"
            >
              <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>

            {/* Quick Logout Button */}
            <button
              onClick={handleLogout}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/70 hover:bg-[#FEE2E2] text-[#DC2626] border border-white shadow-sm transition-all flex items-center justify-center group shrink-0"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Mobile Hamburger Toggle for header buttons */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#1E5E36] hover:bg-white/60 transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-[#166534] hover:text-[#0A341B] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:shadow-[0_4px_16px_rgba(34,197,94,0.4)] transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Header Dropdown Menu (when opened) */}
      {user && mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/80 bg-white/95 backdrop-blur-2xl px-4 py-3 space-y-1.5 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-md'
                      : 'text-[#1E5E36] hover:bg-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/20 text-current">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
          
          <div className="pt-2 border-t border-black/5 flex items-center justify-between px-2">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs font-bold text-[#16A34A]"
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile & Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-[#DC2626]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
