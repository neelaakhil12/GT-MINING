import React, { useState, useEffect } from 'react';
import { ShieldCheck, History, Calendar, User, Search } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { AdminCard } from '../../components/AdminCard';

export const AdminAuditLogsPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredLogs = logs.filter((l) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.action?.toLowerCase().includes(q) ||
      l.entityType?.toLowerCase().includes(q) ||
      l.entityId?.toLowerCase().includes(q) ||
      l.reason?.toLowerCase().includes(q) ||
      l.adminName?.toLowerCase().includes(q) ||
      l.adminEmail?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <AdminNav />

      <AdminCard className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#86EFAC]/15 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FBBF24]" />
              <span>Administrative Audit Trail</span>
            </h2>
            <p className="text-xs text-[#A7C9B1] mt-0.5">
              Immutable security record of all administrative actions and parameter modifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#86EFAC] font-mono font-bold bg-[#0B2516] px-3 py-1.5 rounded-xl border border-[#22C55E]/30">
              {filteredLogs.length} Audit Entries
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A7C9B1] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit actions, administrator, or entity..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#071F14] border border-[#86EFAC]/20 text-white text-xs placeholder-[#A7C9B1]/60 focus:border-[#FBBF24] outline-none"
          />
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse py-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl bg-[#0B2516]/80 border border-[#86EFAC]/20" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <ShieldCheck className="w-8 h-8 text-[#A7C9B1]/40 mx-auto" />
            <p className="text-xs text-[#A7C9B1] font-medium">No audit records match your query.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-[#071F14]/70 border border-[#86EFAC]/15 text-xs space-y-2 transition-all hover:border-[#86EFAC]/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-[#FBBF24] uppercase tracking-wide">
                      {log.action}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/15 text-[#86EFAC] border border-[#22C55E]/20">
                      {log.entityType}: {log.entityId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#A7C9B1]">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <User className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>{log.adminName || 'Administrator'}</span>
                    </div>
                    <span>•</span>
                    <span className="font-mono text-[#A7C9B1]/80">
                      {new Date(log.createdAt).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-white font-medium text-xs leading-relaxed">{log.reason}</p>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="p-2.5 rounded-lg bg-[#05160E] border border-white/5 text-[10px] font-mono text-[#86EFAC] overflow-x-auto leading-relaxed">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
};
