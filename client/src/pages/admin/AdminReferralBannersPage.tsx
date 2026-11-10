import React, { useState, useEffect, useRef } from 'react';
import {
  Gift,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
  Sparkles,
  Eye,
  CheckCircle2,
  X,
  Upload,
  Image as ImageIcon,
  Sliders,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';

export const AdminReferralBannersPage: React.FC = () => {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [tag, setTag] = useState('PROTOCOL DIVIDEND');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('Invite Miners');
  const [targetRoute, setTargetRoute] = useState('/referrals');
  const [accentColor, setAccentColor] = useState('#22C55E');
  const [gradientStart, setGradientStart] = useState('#064E3B');
  const [gradientEnd, setGradientEnd] = useState('#022C17');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
    const handleUpdate = () => fetchBanners();
    window.addEventListener('gt_db_updated', handleUpdate);
    return () => window.removeEventListener('gt_db_updated', handleUpdate);
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        showToast('Referral slide image loaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchBanners = async () => {
    try {
      const res = await api.getAdminReferralBanners();
      if (res.success) {
        setBanners(res.banners || []);
        if (Array.isArray(res.banners)) {
          localStorage.setItem('gt_cached_referral_banners', JSON.stringify(res.banners));
        }
      }
    } catch (err: any) {
      showToast('Failed to load referral page slides', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTag('PROTOCOL DIVIDEND');
    setTitle('');
    setDescription('');
    setCtaText('Invite Miners');
    setTargetRoute('/referrals');
    setAccentColor('#22C55E');
    setGradientStart('#064E3B');
    setGradientEnd('#022C17');
    setImageUrl('');
    setOrder(banners.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setEditingBanner(b);
    setTag(b.tag || 'PROTOCOL DIVIDEND');
    setTitle(b.title || '');
    setDescription(b.description || '');
    setCtaText(b.ctaText || 'Invite Miners');
    setTargetRoute(b.targetRoute || '/referrals');
    setAccentColor(b.accentColor || '#22C55E');
    setGradientStart(b.gradientStart || '#064E3B');
    setGradientEnd(b.gradientEnd || '#022C17');
    setImageUrl(b.imageUrl || '');
    setOrder(b.order || 1);
    setIsActive(b.isActive !== false);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this referral slide?')) return;
    try {
      const res = await api.deleteAdminReferralBanner(id);
      if (res.success) {
        showToast('Referral slide deleted successfully', 'success');
        fetchBanners();
      } else {
        showToast(res.message || 'Failed to delete slide', 'error');
      }
    } catch (err: any) {
      showToast('Error deleting slide', 'error');
    }
  };

  const handleToggleActive = async (b: any) => {
    try {
      const res = await api.updateAdminReferralBanner(b.id, { isActive: !b.isActive });
      if (res.success) {
        showToast(`Slide ${!b.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
        fetchBanners();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Slide title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        tag: tag.trim() || 'PROTOCOL DIVIDEND',
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        ctaText: ctaText.trim() || 'Invite Miners',
        targetRoute: targetRoute.trim() || '/referrals',
        accentColor,
        gradientStart,
        gradientEnd,
        order: Number(order) || 1,
        isActive,
      };

      if (editingBanner) {
        const res = await api.updateAdminReferralBanner(editingBanner.id, payload);
        if (res.success) {
          showToast('Referral slide updated successfully!', 'success');
          setModalOpen(false);
          fetchBanners();
        } else {
          showToast(res.message || 'Failed to update', 'error');
        }
      } else {
        const res = await api.createAdminReferralBanner(payload);
        if (res.success) {
          showToast('New referral slide added successfully!', 'success');
          setModalOpen(false);
          fetchBanners();
        } else {
          showToast(res.message || 'Failed to add', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save slide', 'error');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = banners.filter((b) => b.isActive !== false).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <AdminNav />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#071F14]/80 border border-[#86EFAC]/20 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#86EFAC]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Referral Page Sliders
              </h1>
              <p className="text-xs text-[#A7C9B1]">
                Manage the top carousel slides on the Referral Page in both the website and mobile app
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/20 text-xs font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>{activeCount} Active Slides</span>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Slide</span>
          </button>
        </div>
      </div>

      {/* Slide Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm font-bold text-[#A7C9B1]">
          Loading referral slides...
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#071F14]/50 border border-[#86EFAC]/15 space-y-3">
          <Gift className="w-10 h-10 text-[#86EFAC]/40 mx-auto" />
          <h3 className="text-base font-bold text-white">No Referral Slides Found</h3>
          <p className="text-xs text-[#A7C9B1] max-w-sm mx-auto">
            Click "Add New Slide" above to create your first referral banner slide for web & mobile app.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`relative rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
                b.isActive !== false
                  ? 'bg-[#071F14] border-[#86EFAC]/25 shadow-lg'
                  : 'bg-[#05160E]/70 border-white/10 opacity-75'
              }`}
            >
              {/* Slide Preview Box */}
              <div
                className="relative h-44 w-full p-4 flex flex-col justify-between overflow-hidden"
                style={{
                  background: b.imageUrl
                    ? `linear-gradient(135deg, rgba(6,78,59,0.88), rgba(2,44,23,0.92)), url(${b.imageUrl}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${b.gradientStart || '#064E3B'}, ${b.gradientEnd || '#022C17'})`,
                }}
              >
                {b.imageUrl && (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 pointer-events-none"
                  />
                )}

                {/* Top Row: Pill Tag & Order */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black uppercase tracking-wider text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                    {b.tag || 'PROTOCOL DIVIDEND'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 text-[10px] font-mono text-white/80">
                    Order #{b.order || 1}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-1">
                  <h3 className="text-base font-black text-white tracking-tight line-clamp-1 drop-shadow-md">
                    {b.title}
                  </h3>
                  <p className="text-[11px] text-white/85 line-clamp-2 leading-relaxed drop-shadow">
                    {b.description || 'No description entered.'}
                  </p>
                </div>
              </div>

              {/* Card Controls */}
              <div className="p-4 bg-[#05160E] border-t border-[#86EFAC]/15 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                    b.isActive !== false
                      ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#86EFAC]'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  {b.isActive !== false ? '● Active' : '○ Inactive'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#86EFAC] transition-colors"
                    title="Edit slide"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 p-6 rounded-2xl bg-[#071F14] border border-[#86EFAC]/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#86EFAC]" />
                <h2 className="text-lg font-bold text-white">
                  {editingBanner ? 'Edit Referral Slide' : 'Add New Referral Slide'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#A7C9B1] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Tag Pill */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1] block">
                  Slide Tag / Badge (Upper Pill)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PROTOCOL DIVIDEND, TIER MULTIPLIER, CONSENSUS BENEFIT"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white text-xs font-bold focus:border-[#22C55E] outline-none"
                />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1] block">
                  Main Headline Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous 10% Yield Accrual"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white text-sm font-bold focus:border-[#22C55E] outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1] block">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Instant smart ledger execution with zero platform transaction fees on peer cycles."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white text-xs focus:border-[#22C55E] outline-none resize-none"
                />
              </div>

              {/* Slide Image: Upload or URL */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/20">
                <label className="text-xs font-bold text-[#A7C9B1] block flex items-center justify-between">
                  <span>Banner Slide Image (Optional)</span>
                  <span className="text-[10px] text-white/50">PNG, JPG up to 5MB</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... image URL or upload below"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#071F14] border border-[#86EFAC]/20 text-white text-xs outline-none focus:border-[#22C55E]"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>

                {imageUrl ? (
                  <div className="relative mt-2 h-24 rounded-lg overflow-hidden border border-[#86EFAC]/30">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/90"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Order & Active Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1] block">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white font-mono text-xs focus:border-[#22C55E] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1] block">
                    Slide Status
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="slideActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22C55E] focus:ring-0 bg-[#05160E] border-[#86EFAC]/30"
                    />
                    <label htmlFor="slideActive" className="text-xs font-bold text-white cursor-pointer">
                      Active (Visible to users)
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#86EFAC]/15">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingBanner ? 'Update Slide' : 'Create Slide'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReferralBannersPage;

