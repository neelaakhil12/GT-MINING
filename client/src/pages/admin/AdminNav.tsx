import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Pickaxe,
  Gift,
  Coins,
  Globe,
  Settings,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export const AdminNav: React.FC = () => {
  const links = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Mining Settings', path: '/admin/mining-settings', icon: Pickaxe },
    { label: 'Referrals', path: '/admin/referrals', icon: Gift },
    { label: 'Transactions', path: '/admin/transactions', icon: Coins },
    { label: 'Community', path: '/admin/community', icon: Globe },
    { label: 'Global Settings', path: '/admin/settings', icon: Settings },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#FBBF24]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/20 border border-[#FBBF24]/40 flex items-center justify-center text-[#FBBF24]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">GT Admin Control Center</h1>
            <p className="text-xs text-[#A7C9B1]">Authoritative platform & database operations</p>
          </div>
        </div>

        <NavLink
          to="/dashboard"
          className="text-xs font-semibold text-[#86EFAC] hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>User Dashboard</span>
        </NavLink>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#FBBF24] text-[#07130D] font-bold shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'bg-[#0B2516]/60 border border-[#86EFAC]/20 text-[#A7C9B1] hover:text-white'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
