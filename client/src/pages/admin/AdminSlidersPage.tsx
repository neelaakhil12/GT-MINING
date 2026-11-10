import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  ImagePlus,
  Gift,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  Smartphone,
  Eye,
  X,
  Upload,
  Layers,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';

type SliderCategory = 'home' | 'onboarding' | 'referrals';

export const AdminSlidersPage: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state: 'home' | 'onboarding' | 'referrals'
  const initialTab = (searchParams.get('tab') as SliderCategory) || 'home';
  const [activeTab, setActiveTab] = useState<SliderCategory>(initialTab);

  // Data states
  const [homeBanners, setHomeBanners] = useState<any[]>([]);
  const [onboardingBanners, setOnboardingBanners] = useState<any[]>([]);
  const [referralBanners, setReferralBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Common Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('Explore Now');
  const [targetRoute, setTargetRoute] = useState('/mining');
  const [accentColor, setAccentColor] = useState('#22C55E');
  const [gradientStart, setGradientStart] = useState('#064E3B');
  const [gradientEnd, setGradientEnd] = useState('#022C17');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAllSliders();
    const handleUpdate = () => fetchAllSliders();
    window.addEventListener('gt_db_updated', handleUpdate);
    return () => window.removeEventListener('gt_db_updated', handleUpdate);
  }, []);

  const fetchAllSliders = async () => {
    try {
      const [hRes, oRes, rRes] = await Promise.all([
        api.getAdminHomeBanners().catch(() => ({ success: false, banners: [] })),
        api.getAdminOnboardingBanners().catch(() => ({ success: false, banners: [] })),
        api.getAdminReferralBanners().catch(() => ({ success: false, banners: [] })),
      ]);

      if (hRes.success) setHomeBanners(hRes.banners || []);
      if (oRes.success) setOnboardingBanners(oRes.banners || []);
      if (rRes.success) setReferralBanners(rRes.banners || []);
    } catch (err: any) {
      showToast('Failed to load sliders data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: SliderCategory) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

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
        showToast('Image loaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setImageUrl('');
    setIsActive(true);

    if (activeTab === 'home') {
      setTag('GT ECOSYSTEM');
      setTitle('');
      setSubtitle('');
      setDescription('');
      setCtaText('Explore Now');
      setTargetRoute('/mining');
      setAccentColor('#22C55E');
      setGradientStart('#0A2A18');
      setGradientEnd('#05180E');
      setOrder(homeBanners.length + 1);
    } else if (activeTab === 'onboarding') {
      setTag('STEP ' + (onboardingBanners.length + 1));
      setTitle('');
      setSubtitle('Zero hardware wear, zero battery drain');
      setDescription('');
      setCtaText('Next Step →');
      setTargetRoute('/tour');
      setAccentColor('#22C55E');
      setGradientStart('#0B2516');
      setGradientEnd('#04160E');
      setOrder(onboardingBanners.length + 1);
    } else {
      setTag('PROTOCOL DIVIDEND');
      setTitle('');
      setSubtitle('');
      setDescription('');
      setCtaText('Invite Miners');
      setTargetRoute('/referrals');
      setAccentColor('#22C55E');
      setGradientStart('#064E3B');
      setGradientEnd('#022C17');
      setOrder(referralBanners.length + 1);
    }

    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setTag(item.tag || item.badgeText || (activeTab === 'referrals' ? 'PROTOCOL DIVIDEND' : 'GT ECOSYSTEM'));
    setTitle(item.title || '');
    setSubtitle(item.subtitle || '');
    setDescription(item.description || '');
    setCtaText(item.ctaText || (activeTab === 'referrals' ? 'Invite Miners' : 'Explore Now'));
    setTargetRoute(item.targetRoute || item.ctaLink || '/mining');
    setAccentColor(item.accentColor || '#22C55E');
    setGradientStart(item.gradientStart || '#064E3B');
    setGradientEnd(item.gradientEnd || '#022C17');
    setImageUrl(item.imageUrl || '');
    setOrder(item.order || item.stepNumber || 1);
    setIsActive(item.isActive !== false);
    setModalOpen(true);
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) return;
    try {
      let res;
      if (activeTab === 'home') {
        res = await api.deleteAdminHomeBanner(id);
      } else if (activeTab === 'onboarding') {
        res = await api.deleteAdminOnboardingBanner(id);
      } else {
        res = await api.deleteAdminReferralBanner(id);
      }

      if (res.success) {
        showToast('Slider deleted successfully', 'success');
        fetchAllSliders();
      } else {
        showToast(res.message || 'Failed to delete slider', 'error');
      }
    } catch (err: any) {
      showToast('Error deleting slider', 'error');
    }
  };

  // Toggle Active Handler
  const handleToggleActive = async (item: any) => {
    try {
      let res;
      const newStatus = item.isActive === false;
      if (activeTab === 'home') {
        res = await api.updateAdminHomeBanner(item.id, { isActive: newStatus });
      } else if (activeTab === 'onboarding') {
        res = await api.updateAdminOnboardingBanner(item.id, { isActive: newStatus });
      } else {
        res = await api.updateAdminReferralBanner(item.id, { isActive: newStatus });
      }

      if (res.success) {
        showToast(`Slider ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        fetchAllSliders();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Save (Create / Update) Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Slider title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        ctaText: ctaText.trim(),
        targetRoute: targetRoute.trim(),
        accentColor,
        gradientStart,
        gradientEnd,
        order: Number(order) || 1,
        isActive,
      };

      if (activeTab === 'onboarding') {
        payload.subtitle = subtitle.trim();
        payload.stepNumber = Number(order) || 1;
        payload.badgeText = tag.trim() || 'STEP';
        payload.ctaLink = targetRoute.trim();
      } else {
        payload.tag = tag.trim();
      }

      let res;
      if (editingItem) {
        if (activeTab === 'home') {
          res = await api.updateAdminHomeBanner(editingItem.id, payload);
        } else if (activeTab === 'onboarding') {
          res = await api.updateAdminOnboardingBanner(editingItem.id, payload);
        } else {
          res = await api.updateAdminReferralBanner(editingItem.id, payload);
        }
      } else {
        if (activeTab === 'home') {
          res = await api.createAdminHomeBanner(payload);
        } else if (activeTab === 'onboarding') {
          res = await api.createAdminOnboardingBanner(payload);
        } else {
          res = await api.createAdminReferralBanner(payload);
        }
      }

      if (res.success) {
        showToast(editingItem ? 'Slider updated successfully!' : 'Slider created successfully!', 'success');
        setModalOpen(false);
        try {
          localStorage.removeItem('gt_cached_onboarding_banners');
          localStorage.removeItem('gt_cached_home_banners');
          localStorage.removeItem('gt_cached_referral_banners');
          window.dispatchEvent(new Event('gt_db_updated'));
        } catch { }
        fetchAllSliders();
      } else {
        showToast(res.message || 'Operation failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save slider', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentList =
    activeTab === 'home'
      ? homeBanners
      : activeTab === 'onboarding'
      ? onboardingBanners
      : referralBanners;

  const activeCount = currentList.filter((b) => b.isActive !== false).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-4">
      <AdminNav />

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0B2516] via-[#071F14] to-[#04130C] border border-[#86EFAC]/25 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#86EFAC]">
              <Sliders className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Sliders
              </h1>
              <p className="text-xs text-[#A7C9B1]">
                Centralized slider management for Home Banners, Pre-Open Sliders, and Referral Slides
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/20 text-xs font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>{activeCount} Active in this category</span>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {activeTab === 'home' ? 'Home Banner' : activeTab === 'onboarding' ? 'Pre-Open Slide' : 'Referral Slide'}</span>
          </button>
        </div>
      </div>

      {/* 3 CATEGORY TABS */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#071F14] border border-[#86EFAC]/20 overflow-x-auto scrollbar-none">
        <button
          onClick={() => switchTab('home')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
            activeTab === 'home'
              ? 'bg-[#22C55E] text-[#05180E] shadow-md'
              : 'text-[#A7C9B1] hover:text-white hover:bg-white/5'
          }`}
        >
          <ImagePlus className="w-4 h-4" />
          <span>Home Banners ({homeBanners.length})</span>
        </button>

        <button
          onClick={() => switchTab('onboarding')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
            activeTab === 'onboarding'
              ? 'bg-[#22C55E] text-[#05180E] shadow-md'
              : 'text-[#A7C9B1] hover:text-white hover:bg-white/5'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Pre-Open Sliders ({onboardingBanners.length})</span>
        </button>

        <button
          onClick={() => switchTab('referrals')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
            activeTab === 'referrals'
              ? 'bg-[#22C55E] text-[#05180E] shadow-md'
              : 'text-[#A7C9B1] hover:text-white hover:bg-white/5'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Referral Slides ({referralBanners.length})</span>
        </button>
      </div>

      {/* SLIDER CARDS GRID */}
      {loading ? (
        <div className="py-20 text-center text-sm font-bold text-[#A7C9B1]">
          Loading sliders...
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#071F14]/50 border border-[#86EFAC]/15 space-y-3">
          <Sliders className="w-10 h-10 text-[#86EFAC]/40 mx-auto" />
          <h3 className="text-base font-bold text-white">No Sliders Found In This Category</h3>
          <p className="text-xs text-[#A7C9B1] max-w-sm mx-auto">
            Click "Add New" above to create your first slide in this section.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentList.map((item) => (
            <div
              key={item.id}
              className={`relative rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
                item.isActive !== false
                  ? 'bg-[#071F14] border-[#86EFAC]/25 shadow-lg'
                  : 'bg-[#05160E]/70 border-white/10 opacity-75'
              }`}
            >
              {/* Preview Box */}
              <div
                className="relative h-44 w-full p-4 flex flex-col justify-between overflow-hidden"
                style={{
                  background: item.imageUrl
                    ? `linear-gradient(135deg, rgba(6,78,59,0.88), rgba(2,44,23,0.92)), url(${item.imageUrl}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${item.gradientStart || '#064E3B'}, ${item.gradientEnd || '#022C17'})`,
                }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 pointer-events-none"
                  />
                )}

                {/* Top Badge & Order */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black uppercase tracking-wider text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                    {item.tag || item.badgeText || (activeTab === 'referrals' ? 'PROTOCOL DIVIDEND' : 'GT ECOSYSTEM')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 text-[10px] font-mono text-white/80">
                    Order #{item.order || item.stepNumber || 1}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-1">
                  <h3 className="text-base font-black text-white tracking-tight line-clamp-1 drop-shadow-md">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-white/85 line-clamp-2 leading-relaxed drop-shadow">
                    {item.description || item.subtitle || 'No description entered.'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 bg-[#05160E] border-t border-[#86EFAC]/15 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                    item.isActive !== false
                      ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#86EFAC]'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  {item.isActive !== false ? '● Active' : '○ Inactive'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#86EFAC] transition-colors"
                    title="Edit slider"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete slider"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 p-6 rounded-2xl bg-[#071F14] border border-[#86EFAC]/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#86EFAC]" />
                <h2 className="text-lg font-bold text-white">
                  {editingItem ? 'Edit Slider' : `Add New ${activeTab === 'home' ? 'Home Banner' : activeTab === 'onboarding' ? 'Pre-Open Slide' : 'Referral Slide'}`}
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
              {/* Tag / Badge */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1] block">
                  Slide Tag / Badge
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PROTOCOL DIVIDEND, GT ECOSYSTEM, STEP 1"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white text-xs font-bold focus:border-[#22C55E] outline-none"
                />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1] block">
                  Headline Title
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

              {/* Subtitle (for Onboarding) */}
              {activeTab === 'onboarding' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1] block">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zero hardware wear, zero battery drain"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white text-xs focus:border-[#22C55E] outline-none"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1] block">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter detailed description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white text-xs focus:border-[#22C55E] outline-none resize-none"
                />
              </div>

              {/* Slide Image: Upload or URL */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/20">
                <label className="text-xs font-bold text-[#A7C9B1] block flex items-center justify-between">
                  <span>Slide Background Image (Optional)</span>
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
                    Status
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
                      Active (Visible)
                    </label>
                  </div>
                </div>
              </div>

              {/* Buttons */}
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
                      <span>{editingItem ? 'Update Slider' : 'Create Slider'}</span>
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

export default AdminSlidersPage;
