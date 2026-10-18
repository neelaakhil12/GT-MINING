import React, { useState, useEffect } from 'react';
import { ShieldCheck, History, Calendar, User } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { GlassCard } from '../../components/GlassCard';

export const AdminAuditLogsPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.getAdminAuditLogs();
      if (res.success) setLogs(res.logs || []);
    } catch (err: any) {
      showToast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <AdminNav />

      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FBBF24]" />
            <span>Administrative Audit Trail</span>
          </h2>
          <span className="text-xs text-[#A7C9B1]">{logs.length} Audit Entries</span>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse py-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-white/5" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-[#A7C9B1] py-8 text-center">No audit records logged.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-[#071F14]/70 border border-[#86EFAC]/15 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#FBBF24] uppercase">
                      {log.action}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-[#A7C9B1]">
                      {log.entityType}: {log.entityId}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A7C9B1]">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-white font-medium">{log.reason}</p>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="p-2 rounded-lg bg-[#0B2516] text-[10px] font-mono text-[#86EFAC] overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
