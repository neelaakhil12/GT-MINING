import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Smartphone,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';

const DEFAULT_ONBOARDING_SLIDES = [
  {
    id: 'ob_001',
    stepNumber: 1,
    title: 'Automated 4-Hour Mining Engine',
    subtitle: 'Zero hardware wear, zero battery drain',
    description: 'Activate your mining node with 1 tap. Mine virtual GT coins effortlessly on your mobile device or web browser.',
    imageUrl: '/onboarding/story_1.jpg',
    ctaText: 'Next Step →',
    ctaLink: '/tour',
    badgeText: 'DECENTRALIZED VIRTUAL MINING',
    isActive: true,
  },
  {
    id: 'ob_002',
    stepNumber: 2,
    title: "Recognized by the world's largest stock exchange",
    subtitle: 'The only blockchain company invited by the NYSE',
    description: 'The modern blockchain protocol built for institutional transparency and verifiable distributed ledgers.',
    imageUrl: '/onboarding/story_2.jpg',
    ctaText: 'Next Step →',
    ctaLink: '/tour',
    badgeText: 'INSTITUTIONAL TRUST',
    isActive: true,
  },
  {
    id: 'ob_003',
    stepNumber: 3,
    title: 'Autonomous 10% Yield Accrual',
    subtitle: 'Protocol dividend distribution',
    description: 'Receive instant lifetime mining commissions whenever your peer network and invited nodes finalize cycles.',
    imageUrl: '/onboarding/story_3.jpg',
    ctaText: 'Next Step →',
    ctaLink: '/tour',
    badgeText: '10% LIFETIME REWARD',
    isActive: true,
  },
  {
    id: 'ob_004',
    stepNumber: 4,
    title: 'Powered by Visa & Mastercard',
    subtitle: 'Accepted in 150+ countries worldwide',
    description: 'Global payment cards accepted in more than 150 countries for seamless everyday crypto liquidity.',
    imageUrl: '/onboarding/story_4.png',
    ctaText: 'Next Step →',
    ctaLink: '/tour',
    badgeText: 'GLOBAL CARD ACCESS',
    isActive: true,
  },
  {
    id: 'ob_005',
    stepNumber: 5,
    title: 'Instant Direct Wallet Claims',
    subtitle: 'Zero gas fees, direct ledger deposits',
    description: 'Accumulate GT coin yields and claim your rewards directly to your personal wallet vault with zero gas fees.',
    imageUrl: '/onboarding/story_5.jpg',
    ctaText: 'Get Started Now 🚀',
    ctaLink: '/signup',
    badgeText: 'ZERO GAS VAULT',
    isActive: true,
  },
];

const ONBOARDING_SAMPLE_IMAGES = [
  { name: 'Slide 1 (Mining Engine)', url: '/onboarding/story_1.jpg' },
  { name: 'Slide 2 (NYSE Exchange)', url: '/onboarding/story_2.jpg' },
  { name: 'Slide 3 (Yield & Commission)', url: '/onboarding/story_3.jpg' },
  { name: 'Slide 4 (Visa & Mastercard)', url: '/onboarding/story_4.png' },
  { name: 'Slide 5 (Wallet Claims)', url: '/onboarding/story_5.jpg' },
];

export const AdminOnboardingBannersPage: React.FC = () => {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Phone Preview active slide
  const [previewIndex, setPreviewIndex] = useState(0);

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badgeText, setBadgeText] = useState('GT PROTOCOL');
  const [ctaText, setCtaText] = useState('Next Step →');
  const [ctaLink, setCtaLink] = useState('/signup');
  const [stepNumber, setStepNumber] = useState(1);
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
      const res = await api.getAdminOnboardingBanners();
      if (res.success && Array.isArray(res.banners) && res.banners.length > 0) {
        setBanners(res.banners);
      } else {
        setBanners(DEFAULT_ONBOARDING_SLIDES);
      }
    } catch (err: any) {
      setBanners(DEFAULT_ONBOARDING_SLIDES);
    } finally {
      setLoading(false);
    }
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
        showToast('Image selected successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setImageUrl(ONBOARDING_SAMPLE_IMAGES[0].url);
    setBadgeText('GT PROTOCOL');
    setCtaText('Next Step →');
    setCtaLink('/signup');
    setStepNumber(banners.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (banner: any) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setDescription(banner.description);
    setImageUrl(banner.imageUrl);
    setBadgeText(banner.badgeText || 'GT PROTOCOL');
    setCtaText(banner.ctaText || 'Get Started →');
    setCtaLink(banner.ctaLink || '/signup');
    setStepNumber(banner.stepNumber || 1);
    setIsActive(banner.isActive !== false);
    setModalOpen(true);
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
        const res = await api.updateAdminOnboardingBanner(editingBanner.id, {
          title: title.trim(),
          subtitle: subtitle.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim(),
          badgeText: badgeText.trim(),
          ctaText: ctaText.trim(),
          ctaLink: ctaLink.trim(),
          stepNumber: Number(stepNumber),
          isActive,
        });
        if (res.success) {
          showToast('Pre-opening banner updated successfully!', 'success');
        }
      } else {
        const res = await api.createAdminOnboardingBanner({
          title: title.trim(),
          subtitle: subtitle.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim(),
          badgeText: badgeText.trim(),
          ctaText: ctaText.trim(),
          ctaLink: ctaLink.trim(),
          stepNumber: Number(stepNumber),
          isActive,
        });
        if (res.success) {
          showToast('New pre-opening banner added successfully!', 'success');
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
    if (!window.confirm('Are you sure you want to delete this pre-opening slider banner?')) return;

    try {
      const res = await api.deleteAdminOnboardingBanner(id);
      if (res.success) {
        showToast('Slider banner deleted successfully', 'success');
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err: any) {
      showToast('Delete failed', 'error');
    }
  };

  const activeBanners = banners.filter((b) => b.isActive !== false);
  const currentPreview = activeBanners[previewIndex] || banners[0];

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto px-4">
      <AdminNav />

      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B2516] to-[#04160E] border-2 border-[#86EFAC]/25 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#4ADE80]">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Pre-Opening Sliders & Welcome Banners
            </h2>
          </div>
          <p className="text-xs text-[#A7C9B1] mt-1.5">
            Manage the carousel slider banners presented to users <strong>before opening the app or website</strong>. Add, edit, reorder, or delete slides.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl font-black text-xs text-[#07130D] bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:brightness-110 shadow-[0_4px_20px_rgba(251,191,36,0.35)] flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Slider Banner</span>
        </button>
      </div>

      {/* Main Grid: Left Banners List (2 Cols), Right Live Mobile Phone Preview (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Manage Banners (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Configured Welcome Slides</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/30">
                {banners.length} Slides
              </span>
            </h3>
            <span className="text-[11px] text-[#A7C9B1]">Sorted by Step Number</span>
          </div>

          <div className="space-y-4">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className="p-5 rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/20 shadow-md hover:border-[#86EFAC]/40 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group"
              >
                {/* Thumbnail & Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-20 h-24 rounded-2xl overflow-hidden bg-black/50 border border-white/10 shrink-0 relative">
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-black/70 text-[#FBBF24]">
                      #{b.stepNumber || idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 uppercase">
                        {b.badgeText || 'GT PROTOCOL'}
                      </span>
                      {b.isActive === false && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          Inactive
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-white group-hover:text-[#86EFAC] transition-colors leading-snug truncate">
                      {b.title}
                    </h4>
                    {b.subtitle && (
                      <p className="text-[11px] text-[#86EFAC] font-medium leading-tight">
                        {b.subtitle}
                      </p>
                    )}
                    <p className="text-[11px] text-[#A7C9B1] line-clamp-2 leading-relaxed">
                      {b.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[10px] text-[#A7C9B1]">
                      <span>CTA: <strong className="text-white">{b.ctaText}</strong></span>
                      <span>Link: <strong className="text-[#86EFAC]">{b.ctaLink}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#22C55E]/20 text-[#86EFAC] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Phone Simulator Preview */}
        <div className="sticky top-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[#86EFAC] tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Live Mobile Pre-Open View</span>
            </span>
            <span className="text-[10px] text-[#A7C9B1]">Exact User View</span>
          </div>

          {/* Phone Frame */}
          <div className="w-full max-w-[320px] mx-auto rounded-[36px] bg-[#030B07] border-4 border-[#1E3A2B] shadow-2xl overflow-hidden relative aspect-[9/18.5] flex flex-col justify-between text-white p-4">
            
            {/* Top Phone Notch / Dynamic Island */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto z-20" />

            {/* Slide Image Background */}
            {currentPreview && (
              <div className="absolute inset-0 z-0">
                <img
                  src={currentPreview.imageUrl}
                  alt={currentPreview.title}
                  className="w-full h-full object-cover brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030B07] via-[#030B07]/60 to-black/40" />
              </div>
            )}

            {/* Slide Header Progress Bars */}
            <div className="z-10 flex items-center gap-1.5 pt-2">
              {activeBanners.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    previewIndex === i ? 'bg-[#22C55E]' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Slide Content */}
            {currentPreview ? (
              <div className="z-10 space-y-3 pb-4">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#22C55E]/30 text-[#86EFAC] border border-[#22C55E]/40 uppercase">
                  {currentPreview.badgeText || 'GT PROTOCOL'}
                </span>

                <h3 className="text-xl font-black leading-tight text-white drop-shadow">
                  {currentPreview.title}
                </h3>

                {currentPreview.subtitle && (
                  <p className="text-xs font-bold text-[#86EFAC]">
                    {currentPreview.subtitle}
                  </p>
                )}

                <p className="text-[11px] text-white/80 leading-relaxed line-clamp-3">
                  {currentPreview.description}
                </p>

                {/* Simulated CTA Button */}
                <div className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-black text-xs text-center shadow-lg flex items-center justify-center gap-1.5 mt-2">
                  <span>{currentPreview.ctaText || 'Get Started →'}</span>
                </div>

                {/* Slider Navigation controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() =>
                      setPreviewIndex((prev) => (prev > 0 ? prev - 1 : activeBanners.length - 1))
                    }
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-white/60">
                    Slide {previewIndex + 1} of {activeBanners.length}
                  </span>
                  <button
                    onClick={() =>
                      setPreviewIndex((prev) => (prev + 1) % activeBanners.length)
                    }
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

      </div>

      {/* CREATE / EDIT SLIDER BANNER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-[#092215] border-2 border-[#FBBF24]/50 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#FBBF24]/20 text-[#FBBF24] flex items-center justify-center font-bold">
                  {editingBanner ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
                <h3 className="text-lg font-black text-white">
                  {editingBanner ? 'Edit Pre-Opening Banner' : 'Add New Pre-Opening Banner'}
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
              {/* Title & Subtitle */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1]">Slide Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Automated 4-Hour Mining Engine"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1]">Subtitle (Highlight)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Zero hardware wear, zero battery drain"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                />
              </div>

              {/* Step number & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1]">Step Number / Order</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={stepNumber}
                    onChange={(e) => setStepNumber(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1]">Badge Text</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. DECENTRALIZED PROTOCOL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                  />
                </div>
              </div>

              {/* Image URL & Sample presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#A7C9B1]">Slide Background Image URL</label>
                  <span className="text-[10px] text-[#86EFAC]">Pick sample or paste URL</span>
                </div>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/onboarding/story_1.jpg or https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none font-mono text-[11px]"
                />

                {/* Upload File button & presets */}
                <div className="flex items-center gap-2 pt-1">
                  <label className="px-3 py-1.5 rounded-xl bg-[#22C55E]/20 hover:bg-[#22C55E]/30 text-[#86EFAC] text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-[#22C55E]/40 transition-all">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Upload Custom Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  {imageUrl && (
                    <span className="text-[10px] text-[#86EFAC] truncate max-w-[240px]">
                      Selected: {imageUrl.startsWith('data:') ? 'Custom Uploaded' : imageUrl}
                    </span>
                  )}
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {ONBOARDING_SAMPLE_IMAGES.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        imageUrl === preset.url
                          ? 'bg-[#22C55E]/30 text-[#86EFAC] border-[#22C55E]'
                          : 'bg-white/5 text-[#A7C9B1] border-white/10 hover:border-white/30'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1]">Description Body *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain this feature or benefit to new visitors..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none resize-none leading-relaxed"
                />
              </div>

              {/* CTA Button Text & Link */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1]">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Next Step →"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1]">CTA Target Link</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="e.g. /signup or /tour"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FBBF24] focus:ring-0 cursor-pointer accent-[#FBBF24]"
                />
                <label htmlFor="activeCheck" className="text-xs font-bold text-white cursor-pointer select-none">
                  Active (show this banner in pre-open carousel)
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

