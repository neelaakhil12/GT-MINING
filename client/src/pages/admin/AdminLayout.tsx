import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Sliders,
  ImagePlus,
  Users,
  Pickaxe,
  Coins,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Gift,
  ShieldAlert,
  Video,
  Mail,
  Bell,
  CheckSquare,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingEmailCount, setPendingEmailCount] = useState<number>(0);
  const [pendingTaskCount, setPendingTaskCount] = useState<number>(0);

  // Poll for pending email change requests & task submissions count
  useEffect(() => {
    let isMounted = true;
    const fetchPendingCount = async () => {
      try {
        const res = await api.getAdminEmailRequests();
        if (res && res.success && isMounted) {
          if (typeof res.pendingCount === 'number') {
            setPendingEmailCount(res.pendingCount);
          } else if (Array.isArray(res.requests)) {
            const count = res.requests.filter((r: any) => r.status === 'PENDING').length;
            setPendingEmailCount(count);
          }
        }

        const taskRes = await api.getAdminTaskSubmissions('PENDING');
        if (taskRes && taskRes.success && isMounted) {
          if (typeof taskRes.pendingCount === 'number') {
            setPendingTaskCount(taskRes.pendingCount);
          } else if (Array.isArray(taskRes.submissions)) {
            setPendingTaskCount(taskRes.submissions.length);
          }
        }
      } catch (err) {
        // Background poll - silent catch
      }
    };

    fetchPendingCount();
    const timer = setInterval(fetchPendingCount, 8000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Node', path: '/admin/community', icon: Globe },
    { label: 'Sliders', path: '/admin/sliders', icon: Sliders },
    { label: 'Tasks', path: '/admin/tasks', icon: Video },
    {
      label: 'Submissions',
      path: '/admin/task-submissions',
      icon: CheckSquare,
      badge: pendingTaskCount,
    },
    { label: 'Users', path: '/admin/users', icon: Users },
    {
      label: 'Notifications',
      path: '/admin/email-requests',
      icon: Bell,
      badge: pendingEmailCount,
    },
    { label: 'Parameters', path: '/admin/mining-settings', icon: Pickaxe },
    { label: 'Referrals & Dividends', path: '/admin/referrals', icon: Gift },
    { label: 'Transactions Ledger', path: '/admin/transactions', icon: Coins },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/dashboard')) return 'Dashboard';
    if (p.includes('/community')) return 'Node';
    if (p.includes('/sliders') || p.includes('/onboarding-banners') || p.includes('/home-banners') || p.includes('/referral-banners')) return 'Sliders';
    if (p.includes('/task-submissions')) return 'Submissions';
    if (p.includes('/tasks')) return 'Tasks';
    if (p.includes('/users')) return 'Users';
    if (p.includes('/email-requests')) {
      return pendingEmailCount > 0
        ? `Notifications (${pendingEmailCount} Pending)`
        : 'Notifications';
    }
    if (p.includes('/mining-settings')) return 'Parameters';
    if (p.includes('/referrals')) return 'Referral Commissions & Dividends';
    if (p.includes('/transactions')) return 'Transactions & Balances';
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
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const badge = (item as any).badge;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#22C55E]/20 to-[#22C55E]/5 text-white border-l-4 border-[#22C55E] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                        : 'text-[#A7C9B1] hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0 truncate">
                    <Icon className="w-4 h-4 text-[#86EFAC] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {typeof badge === 'number' && badge > 0 && (
                    <span
                      title={`${badge} pending email change request${badge > 1 ? 's' : ''}`}
                      className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EF4444] text-white shadow-md shadow-red-500/50 flex items-center justify-center shrink-0 min-w-[20px] animate-pulse"
                    >
                      {badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
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
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#06180E]/90 backdrop-blur-xl border-b border-[#22C55E]/15 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 w-full">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-[#86EFAC] hover:bg-white/10 cursor-pointer shrink-0"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="hidden sm:inline text-[10px] text-[#86EFAC] font-mono uppercase shrink-0">Admin Panel /</span>
                <span className="text-xs sm:text-sm font-black text-white truncate">{getPageTitle()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[11px] font-mono text-[#86EFAC]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>Authority Node Synced</span>
            </div>

            <NavLink
              to="/dashboard"
              className="text-xs font-bold text-[#A7C9B1] hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 shrink-0"
              title="Open website dashboard"
            >
              <span className="hidden xs:inline">View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

