import React, { useState, useEffect } from 'react';
import {
  ImagePlus,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
  Sparkles,
  Eye,
  CheckCircle2,
  X,
  Palette,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';

const COLOR_PRESETS = [
  { name: 'Emerald Green', accent: '#22C55E', start: '#0A2A18', end: '#05180E' },
  { name: 'Cyan Sky', accent: '#38BDF8', start: '#07241C', end: '#041611' },
  { name: 'Royal Purple', accent: '#A855F7', start: '#121829', end: '#060A14' },
  { name: 'Amber Gold', accent: '#F59E0B', start: '#2A1A07', end: '#140D04' },
  { name: 'Rose Red', accent: '#F43F5E', start: '#2A0A12', end: '#140509' },
];

export const AdminHomeBannersPage: React.FC = () => {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [tag, setTag] = useState('GT ECOSYSTEM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('Explore Now');
  const [targetRoute, setTargetRoute] = useState('/mining');
  const [accentColor, setAccentColor] = useState('#22C55E');
  const [gradientStart, setGradientStart] = useState('#0A2A18');
  const [gradientEnd, setGradientEnd] = useState('#05180E');
  const [imageUrl, setImageUrl] = useState('/banners/slide1.jpg');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBanners();
    const handleUpdate = () => fetchBanners();
    window.addEventListener('gt_db_updated', handleUpdate);
    return () => window.removeEventListener('gt_db_updated', handleUpdate);
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.getAdminHomeBanners();
      if (res.success) {
        setBanners(res.banners || []);
      }
    } catch (err: any) {
      showToast('Failed to load home page banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTag('GT ECOSYSTEM');
    setTitle('');
    setDescription('');
    setCtaText('Explore Now');
    setTargetRoute('/mining');
    setAccentColor('#22C55E');
    setGradientStart('#0A2A18');
    setGradientEnd('#05180E');
    setImageUrl('/banners/slide1.jpg');
    setOrder(banners.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (banner: any) => {
    setEditingBanner(banner);
    setTag(banner.tag || 'GT ECOSYSTEM');
    setTitle(banner.title);
    setDescription(banner.description);
    setCtaText(banner.ctaText || 'Explore Now');
    setTargetRoute(banner.targetRoute || '/mining');
    setAccentColor(banner.accentColor || '#22C55E');
    setGradientStart(banner.gradientStart || '#0A2A18');
    setGradientEnd(banner.gradientEnd || '#05180E');
    setImageUrl(banner.imageUrl || '/banners/slide1.jpg');
    setOrder(banner.order || 1);
    setIsActive(banner.isActive !== false);
    setModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setAccentColor(preset.accent);
    setGradientStart(preset.start);
    setGradientEnd(preset.end);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Title and description are required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingBanner) {
        const res = await api.updateAdminHomeBanner(editingBanner.id, {
          tag: tag.trim(),
          title: title.trim(),
          description: description.trim(),
          ctaText: ctaText.trim(),
          targetRoute: targetRoute.trim(),
          accentColor,
          gradientStart,
          gradientEnd,
          imageUrl,
          order: Number(order),
          isActive,
        });
        if (res.success) {
          showToast('Home page banner updated successfully!', 'success');
        }
      } else {
        const res = await api.createAdminHomeBanner({
          tag: tag.trim(),
          title: title.trim(),
          description: description.trim(),
          ctaText: ctaText.trim(),
          targetRoute: targetRoute.trim(),
          accentColor,
          gradientStart,
          gradientEnd,
          imageUrl,
          order: Number(order),
          isActive,
        });
        if (res.success) {
          showToast('New home page banner created successfully!', 'success');
        }
      }

      setModalOpen(false);
      await fetchBanners();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Home page banner?')) return;

    try {
      const res = await api.deleteAdminHomeBanner(id);
      if (res.success) {
        showToast('Home banner deleted successfully', 'success');
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err: any) {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto px-4">
      <AdminNav />

      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B2516] to-[#04160E] border-2 border-[#86EFAC]/25 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#4ADE80]">
              <ImagePlus className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Home Page Carousel Banners Management
            </h2>
          </div>
          <p className="text-xs text-[#A7C9B1] mt-1.5">
            Manage the top dynamic rotating carousel cards shown on the user <strong>Dashboard / Home Page</strong>. Add new slides, customize color accents, links, and text.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl font-black text-xs text-[#07130D] bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:brightness-110 shadow-[0_4px_20px_rgba(251,191,36,0.35)] flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Home Banner</span>
        </button>
      </div>

      {/* Banners Grid with Live Card Previews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Live Home Banners Carousel</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/30">
              {banners.length} Active Slides
            </span>
          </h3>
          <span className="text-[11px] text-[#A7C9B1]">Sorted by Display Order</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((b, idx) => (
            <div
              key={b.id}
              className="rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/20 p-5 flex flex-col justify-between gap-4 shadow-lg hover:border-[#86EFAC]/40 transition-all group"
            >
              {/* Live Preview of the Slide Card */}
              <div
                className="relative overflow-hidden p-5 rounded-2xl border border-white/10 shadow-inner flex flex-col justify-between min-h-[160px]"
                style={{
                  background: `linear-gradient(135deg, ${b.gradientStart || '#0A2A18'} 0%, ${b.gradientEnd || '#05180E'} 100%)`,
                }}
              >
                {/* Glow circle */}
                <div
                  className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-xl pointer-events-none opacity-40"
                  style={{ backgroundColor: b.accentColor || '#22C55E' }}
                />

                <div className="z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[9px] font-black tracking-wider text-white">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: b.accentColor || '#22C55E' }}
                      />
                      <span>{b.tag}</span>
                    </div>
                    <span className="text-[10px] text-white/50 font-mono">
                      Order #{b.order || idx + 1}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white leading-tight drop-shadow">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-white/70 line-clamp-2 leading-relaxed">
                    {b.description}
                  </p>
                </div>

                <div className="z-10 flex items-center justify-between pt-3">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white font-black text-[11px] shadow-md"
                    style={{
                      background: `linear-gradient(to right, ${b.accentColor || '#22C55E'}, #16A34A)`,
                    }}
                  >
                    <span>{b.ctaText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] text-white/60 font-mono">{b.targetRoute}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <span className="text-[10px] text-[#A7C9B1]">
                  Status:{' '}
                  <strong className={b.isActive !== false ? 'text-[#4ADE80]' : 'text-red-400'}>
                    {b.isActive !== false ? 'Active' : 'Draft / Inactive'}
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#22C55E]/20 text-[#86EFAC] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE / EDIT HOME BANNER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-[#092215] border-2 border-[#FBBF24]/50 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#FBBF24]/20 text-[#FBBF24] flex items-center justify-center font-bold">
                  {editingBanner ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
                <h3 className="text-lg font-black text-white">
                  {editingBanner ? 'Edit Home Page Banner' : 'Add New Home Page Banner'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              {/* Tag & Display Order */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1]">Tag Badge *</label>
                  <input
                    type="text"
                    required
                    value={tag}
                    onChange={(e) => setTag(e.target.value.toUpperCase())}
                    placeholder="e.g. GT ECOSYSTEM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1]">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1]">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Join the Future of Mining"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1]">Description Body *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Experience the next-generation autonomous GT layer-2 protocol..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none resize-none leading-relaxed"
                />
              </div>

              {/* CTA Text & Target Route */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1]">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Explore Now"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1]">Target App Route</label>
                  <select
                    value={targetRoute}
                    onChange={(e) => setTargetRoute(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                  >
                    <option value="/mining">Mining Screen (/mining)</option>
                    <option value="/referrals">Referrals Screen (/referrals)</option>
                    <option value="/wallet">Wallet Screen (/wallet)</option>
                    <option value="/community">Node Feed (/community)</option>
                    <option value="/tasks">Tasks Station (/tasks)</option>
                  </select>
                </div>
              </div>

              {/* Color Themes & Palette Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#A7C9B1] flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#FBBF24]" />
                    <span>Card Color Theme Presets</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {COLOR_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        accentColor === p.accent
                          ? 'border-white bg-white/10 ring-2 ring-[#22C55E]'
                          : 'border-white/10 bg-black/30 hover:border-white/30'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full mx-auto mb-1 border border-white/20"
                        style={{ backgroundColor: p.accent }}
                      />
                      <span className="text-[10px] font-bold text-white block truncate">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheckHome"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FBBF24] focus:ring-0 cursor-pointer accent-[#FBBF24]"
                />
                <label htmlFor="activeCheckHome" className="text-xs font-bold text-white cursor-pointer select-none">
                  Active (show this banner in Home carousel)
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-[#07130D] bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:brightness-110 shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingBanner ? 'Update Banner' : 'Add Banner 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

