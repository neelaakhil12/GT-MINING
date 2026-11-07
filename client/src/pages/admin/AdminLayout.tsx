import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Sliders,
  ImagePlus,
  Users,
  Pickaxe,
  Coins,
  Settings,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Gift,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navSections = [
    {
      heading: 'ANALYTICS & METRICS',
      items: [
        { label: 'Dashboard & Counts', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      heading: 'CONTENT & BANNERS',
      items: [
        { label: 'Node Posts & News', path: '/admin/community', icon: Globe },
        { label: 'Pre-Open Sliders', path: '/admin/onboarding-banners', icon: Sliders },
        { label: 'Home Page Banners', path: '/admin/home-banners', icon: ImagePlus },
      ],
    },
    {
      heading: 'NETWORK MANAGEMENT',
      items: [
        { label: 'Users Directory', path: '/admin/users', icon: Users },
        { label: 'Mining Settings', path: '/admin/mining-settings', icon: Pickaxe },
        { label: 'Referrals & Dividends', path: '/admin/referrals', icon: Gift },
        { label: 'Transactions Ledger', path: '/admin/transactions', icon: Coins },
      ],
    },
    {
      heading: 'SYSTEM',
      items: [
        { label: 'Global Settings', path: '/admin/settings', icon: Settings },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/dashboard')) return 'Overview & Real-Time Counts';
    if (p.includes('/community')) return 'Node & Social Media Content';
    if (p.includes('/onboarding-banners')) return 'Pre-Opening Slider Banners';
    if (p.includes('/home-banners')) return 'Home Page Carousel Banners';
    if (p.includes('/users')) return 'Users Directory';
    if (p.includes('/mining-settings')) return 'Mining Protocol Settings';
    if (p.includes('/referrals')) return 'Referral Commissions & Dividends';
    if (p.includes('/transactions')) return 'Transactions & Balances';
    if (p.includes('/settings')) return 'Global System Settings';
    if (p.includes('/audit-logs')) return 'Security Audit Trail';
    return 'Admin Control Center';
  };

  return (
    <div className="min-h-screen bg-[#04110A] text-white flex admin-theme">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#06180E] border-r border-[#22C55E]/15 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] p-1 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <img
                  src="/gt-header-logo.png"
                  alt="GT Logo"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-sm text-white tracking-wide">GT NETWORK</h1>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30">
                    ADMIN CONSOLE
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                <span className="text-[10px] font-black tracking-widest text-[#86EFAC]/70 px-3 uppercase block">
                  {sec.heading}
                </span>
                <div className="space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-[#22C55E]/20 to-[#22C55E]/5 text-white border-l-4 border-[#22C55E] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                              : 'text-[#A7C9B1] hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 text-[#86EFAC] shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer: Admin Profile & Exit */}
          <div className="p-4 border-t border-white/10 space-y-3 bg-[#030E07]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center font-black text-xs text-[#4ADE80]">
                {(user?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.fullName || 'GT Administrator'}
                </p>
                <p className="text-[10px] text-[#A7C9B1] truncate">
                  {user?.email || 'admin@gtmining.com'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-bold">
              <NavLink
                to="/dashboard"
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#86EFAC] transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit App</span>
              </NavLink>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#06180E]/90 backdrop-blur-xl border-b border-[#22C55E]/15 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-[#86EFAC] hover:bg-white/10 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#86EFAC] font-mono uppercase">Admin Panel /</span>
                <span className="text-xs sm:text-sm font-black text-white">{getPageTitle()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[11px] font-mono text-[#86EFAC]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>Authority Node Synced</span>
            </div>

            <NavLink
              to="/dashboard"
              className="text-xs font-bold text-[#A7C9B1] hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
              title="Open website dashboard"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </NavLink>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

