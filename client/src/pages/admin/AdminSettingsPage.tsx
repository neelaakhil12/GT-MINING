import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { AdminCard } from '../../components/AdminCard';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [appName, setAppName] = useState('GT Mining');
  const [websiteUrl, setWebsiteUrl] = useState('http://localhost:5174');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.getAdminSettings();
      if (res.success && res.settings) {
        setAppName(res.settings.appName || 'GT Mining');
        setWebsiteUrl(res.settings.websiteUrl || 'http://localhost:5174');
        setMaintenanceMode(Boolean(res.settings.maintenanceMode));
      }
    } catch (err: any) {
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.updateAdminSettings({
        appName,
        websiteUrl,
        maintenanceMode,
        reason: reason.trim() || 'Updated global settings',
      });

      if (res.success) {
        showToast('Settings saved successfully!', 'success');
        setReason('');
      }
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <AdminNav />

      <AdminCard glow className="space-y-6">
        <div className="border-b border-[#86EFAC]/15 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#86EFAC]" />
            <span>Global Platform Settings</span>
          </h2>
          <p className="text-xs text-[#A7C9B1]">
            Application branding, public host URL, and maintenance status
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A7C9B1]">Application Brand Name</label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white text-sm focus:border-[#FBBF24] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A7C9B1]">Public Website Domain / URL</label>
              <input
                type="url"
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white text-sm font-mono focus:border-[#FBBF24] outline-none"
              />
              <p className="text-[11px] text-[#A7C9B1]">
                Used for constructing shareable referral URLs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#071F14]/70 border border-[#86EFAC]/20 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">Maintenance Mode</span>
                <span className="text-xs text-[#A7C9B1]">Temporary notice mode for deployments</span>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                  maintenanceMode ? 'bg-[#F87171] text-white' : 'bg-white/10 text-[#A7C9B1]'
                }`}
              >
                {maintenanceMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-bold text-xs text-[#07130D] bg-[#FBBF24] hover:bg-[#F59E0B] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Global Settings'}</span>
          </button>
        </form>
      </AdminCard>
    </div>
  );
};
