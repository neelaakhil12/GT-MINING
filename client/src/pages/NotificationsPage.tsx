import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, CheckCircle2, ShieldCheck, Gift, Pickaxe, Info } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { NotificationItem } from '../types';
import { GlassCard } from '../components/GlassCard';

export const NotificationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err: any) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      const now = new Date().toISOString();
      setNotifications(prev => prev.map(n => ({ ...n, readAt: now })));
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed to update notifications', 'error');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'MINING':
        return <Pickaxe className="w-5 h-5 text-[#16A34A]" />;
      case 'REFERRAL':
        return <Gift className="w-5 h-5 text-[#15803D]" />;
      case 'SECURITY':
        return <ShieldCheck className="w-5 h-5 text-[#DC2626]" />;
      default:
        return <Info className="w-5 h-5 text-[#16A34A]" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <GlassCard glow className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0A341B] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#16A34A]" />
            <span>Activity Notifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#1E5E36] font-medium">
            Real-time notifications for mining rewards, referrals, and protocol news
          </p>
        </div>

        {notifications.some(n => !n.readAt) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-[#15803D] bg-white/80 border border-white hover:bg-white transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-[#16A34A]" />
            <span>Mark All as Read</span>
          </button>
        )}
      </GlassCard>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-3xl bg-white/60 border border-white" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center space-y-2 glass-panel rounded-3xl border-2 border-white">
          <Bell className="w-10 h-10 text-[#16A34A]/30 mx-auto" />
          <p className="text-sm font-bold text-[#0A341B]">No notifications yet</p>
          <p className="text-xs text-[#1E5E36]">When you mine or invite friends, updates will arrive here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isUnread = !notif.readAt;

            return (
              <div
                key={notif.id}
                onClick={() => isUnread && handleMarkRead(notif.id)}
                className={`p-4 rounded-3xl backdrop-blur-xl border transition-all cursor-pointer flex items-start gap-4 shadow-sm ${
                  isUnread
                    ? 'bg-white/95 border-[#22C55E]/40 shadow-[0_8px_25px_rgba(34,197,94,0.12)]'
                    : 'bg-white/70 border-white/80 hover:bg-white/90'
                }`}
              >
                <div className="p-2.5 rounded-2xl bg-[#EAF8EE] border border-white shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-bold ${isUnread ? 'text-[#0A341B] font-extrabold' : 'text-[#0A341B]/80'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-[#1E5E36] font-medium">
                      {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-[#1E5E36] leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {isUnread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shrink-0 mt-1.5 shadow-[0_0_8px_#22C55E]" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
