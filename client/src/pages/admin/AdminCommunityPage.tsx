import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  Pin,
  Edit,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  MessageSquare,
  Heart,
  Share2,
  Sparkles,
  Eye,
  X,
  Upload,
  ListOrdered,
  List,
  Wand2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { cleanListSpacing, formatAsNumberedList, formatAsBulletList } from '../../utils/textFormatter';

export const AdminCommunityPage: React.FC = () => {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'All' | 'Latest'>('All');

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [authorName, setAuthorName] = useState('GT Foundation');
  const [authorRole, setAuthorRole] = useState('Verified Publisher');
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit. Please choose a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        showToast('Image uploaded successfully!', 'success');
      }
    };
    reader.onerror = () => {
      showToast('Failed to read image file', 'error');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchPosts();
    const handleUpdate = () => fetchPosts();
    window.addEventListener('gt_db_updated', handleUpdate);
    return () => window.removeEventListener('gt_db_updated', handleUpdate);
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.getAdminPosts();
      if (res.success) setPosts(res.posts || []);
    } catch (err: any) {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle('');
    setContent('');
    setImageUrl('');
    setAuthorName('GT Foundation');
    setAuthorRole('Verified Publisher');
    setIsPinned(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (post: any) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.imageUrl || '');
    setAuthorName(post.authorName || 'GT Foundation');
    setAuthorRole(post.authorRole || 'Verified Publisher');
    setIsPinned(Boolean(post.isPinned));
    setModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    const cleanedContent = cleanListSpacing(content.trim());

    setSaving(true);
    try {
      if (editingPost) {
        const res = await api.updateAdminPost(editingPost.id, {
          title: title.trim(),
          content: cleanedContent,
          imageUrl: imageUrl.trim() || null,
          category: 'Announcement',
          authorName,
          authorRole,
          isPinned,
        });
        if (res.success) {
          showToast('Node post updated successfully!', 'success');
        }
      } else {
        const res = await api.createAdminPost({
          title: title.trim(),
          content: cleanedContent,
          imageUrl: imageUrl.trim() || null,
          category: 'Announcement',
          authorName,
          authorRole,
          isPinned,
          status: 'PUBLISHED',
        });
        if (res.success) {
          showToast('New post published to Node community feed!', 'success');
        }
      }

      setModalOpen(false);
      await fetchPosts();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleContentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text/plain');
    if (!pastedText) return;

    // Clean extra blank lines between list items
    const cleaned = cleanListSpacing(pastedText);

    if (cleaned !== pastedText) {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const nextVal = val.substring(0, start) + cleaned + val.substring(end);
      setContent(nextVal);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + cleaned.length;
      }, 0);
      showToast('Pasted points cleaned without extra spaces! ✨', 'info');
    }
  };

  const handleAutoCleanSpacing = () => {
    if (!content.trim()) return;
    const cleaned = cleanListSpacing(content);
    setContent(cleaned);
    showToast('Cleaned unwanted gaps between points! ✨', 'success');
  };

  const handleApplyNumberedList = () => {
    if (!content.trim()) return;
    const formatted = formatAsNumberedList(content);
    setContent(formatted);
    showToast('Formatted into Numbered List (1, 2, 3...)! 🔢', 'success');
  };

  const handleApplyBulletList = () => {
    if (!content.trim()) return;
    const formatted = formatAsBulletList(content);
    setContent(formatted);
    showToast('Formatted into Bullet Points (•)! 🔘', 'success');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post from the Node page?')) return;

    try {
      const res = await api.deleteAdminPost(id);
      if (res.success) {
        showToast('Node post removed successfully', 'success');
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err: any) {
      showToast('Delete failed', 'error');
    }
  };

  const isWithin24Hours = (dateStr: string) => {
    const t = new Date(dateStr).getTime();
    return !isNaN(t) && (Date.now() - t) <= 24 * 60 * 60 * 1000;
  };

  const filteredPosts =
    filterTab === 'Latest'
      ? posts.filter((p) => isWithin24Hours(p.createdAt))
      : posts;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto px-4">
      <AdminNav />

      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B2516] to-[#04160E] border-2 border-[#86EFAC]/25 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#4ADE80]">
              <Globe className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Node & Social Posts Management
            </h2>
          </div>
          <p className="text-xs text-[#A7C9B1] mt-1.5">
            Post news, announcements, updates, and ecosystem content directly to the user Node feed (<span className="text-[#86EFAC] font-mono">/community</span>). Edit or delete anytime.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl font-black text-xs text-[#07130D] bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:brightness-110 shadow-[0_4px_20px_rgba(251,191,36,0.35)] flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Node Post</span>
        </button>
      </div>

      {/* Filter Tabs: All vs Latest (Last 24 Hours) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Latest'] as const).map((tab) => {
          const count = tab === 'All' ? posts.length : posts.filter((p) => isWithin24Hours(p.createdAt)).length;
          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterTab === tab
                  ? 'bg-[#22C55E] text-[#07130D] shadow-sm'
                  : 'bg-[#0B2516]/60 text-[#A7C9B1] border border-[#86EFAC]/15 hover:text-white'
              }`}
            >
              {tab === 'Latest' ? 'Latest (24 Hours)' : 'All Posts'} ({count})
            </button>
          );
        })}
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-3xl bg-[#0B2516]/40 border border-white/5">
            <Globe className="w-10 h-10 text-[#A7C9B1] mx-auto mb-3 opacity-40" />
            <p className="text-sm font-bold text-white">
              {filterTab === 'Latest' ? 'No posts published in the last 24 hours.' : 'No posts published yet.'}
            </p>
            <p className="text-xs text-[#A7C9B1] mt-1">Tap "+ Create New Node Post" to publish one.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/20 p-5 flex flex-col justify-between gap-4 shadow-md hover:border-[#86EFAC]/40 transition-all group"
            >
              <div className="space-y-3">
                {/* Post Top Badges & Actions */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.isPinned && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30 flex items-center gap-1">
                        <Pin className="w-3 h-3 fill-current" />
                        <span>PINNED</span>
                      </span>
                    )}
                    {isWithin24Hours(post.createdAt) ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 uppercase">
                        LATEST (24H)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/5 text-[#A7C9B1] border border-white/10 uppercase">
                        NODE FEED
                      </span>
                    )}
                    <span className="text-[11px] text-[#A7C9B1]">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(post)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-[#22C55E]/20 text-[#86EFAC] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="Edit Post"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center text-[#07130D] font-black text-xs shadow-sm">
                    {(post.authorName || 'G').charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{post.authorName || 'GT Foundation'}</p>
                    <p className="text-[10px] text-[#86EFAC]">{post.authorRole || 'Official Publisher'}</p>
                  </div>
                </div>

                {/* Title & Content */}
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-[#86EFAC] transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#A7C9B1] mt-2 line-clamp-3 leading-relaxed whitespace-pre-wrap break-words">
                    {cleanListSpacing(post.content)}
                  </p>
                </div>

                {/* Image Preview (if any) */}
                {post.imageUrl && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                )}
              </div>

              {/* Footer Social Stats preview */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#A7C9B1]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-400" />
                    <span>{Number(post.likesCount || 0)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#86EFAC]" />
                    <span>{Number(post.commentsCount || 0)} comments</span>
                  </span>
                </div>
                <span className="text-[10px] text-[#86EFAC] font-mono">Status: Live on Node Feed</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl p-6 sm:p-7 rounded-3xl bg-[#092215] border-2 border-[#FBBF24]/50 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#FBBF24]/20 text-[#FBBF24] flex items-center justify-center font-bold">
                  {editingPost ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
                <h3 className="text-lg font-black text-white">
                  {editingPost ? 'Edit Node Post' : 'Create New Node Post'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1]">Post Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Node 2.0 Genesis: High-Throughput Protocol Launched"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                />
              </div>

              {/* Author Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1]">Author Title</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. GT Foundation, Tech Lead"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                />
              </div>

              {/* Cover Image Upload & URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#A7C9B1] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Cover Image (Optional)</span>
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Main Image Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl bg-[#0F3520] hover:bg-[#16492C] border-2 border-dashed border-[#22C55E]/50 hover:border-[#22C55E] text-[#86EFAC] text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md group"
                >
                  <Upload className="w-4 h-4 text-[#22C55E] group-hover:scale-110 transition-transform" />
                  <span>Choose Image to Upload</span>
                  <span className="text-[10px] text-[#A7C9B1] font-normal font-mono">(PNG, JPG, WebP up to 5MB)</span>
                </button>

                {/* Or Paste Link Input */}
                <div className="relative">
                  <input
                    type="url"
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste an image web link (https://...)"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#05160E] border border-[#86EFAC]/25 text-white text-xs focus:border-[#FBBF24] outline-none font-mono text-[11px]"
                  />
                  {imageUrl.startsWith('data:') && (
                    <span className="absolute right-3 top-2 text-[10px] text-[#22C55E] font-bold">
                      ✓ Uploaded from Device
                    </span>
                  )}
                </div>

                {/* Image Live Preview */}
                {imageUrl && (
                  <div className="w-full h-40 rounded-xl overflow-hidden bg-black/70 border-2 border-[#22C55E]/50 mt-2 relative shadow-lg">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-[#86EFAC] font-mono border border-white/10">
                      Live Image Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content Body with Smart List Formatter Toolbar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-[#A7C9B1]">Post Body / Description *</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleAutoCleanSpacing}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[#86EFAC] text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 cursor-pointer transition-all"
                      title="Remove unwanted extra blank lines between points automatically"
                    >
                      <Wand2 className="w-3 h-3 text-[#4ADE80]" />
                      <span>Auto-Fix Spacing</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyNumberedList}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#A7C9B1] hover:text-white text-[10px] font-bold border border-white/10 flex items-center gap-1 cursor-pointer transition-all"
                      title="Format points into 1. 2. 3. numbered list"
                    >
                      <ListOrdered className="w-3 h-3" />
                      <span>1, 2, 3 Numbers</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyBulletList}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#A7C9B1] hover:text-white text-[10px] font-bold border border-white/10 flex items-center gap-1 cursor-pointer transition-all"
                      title="Format points into • bullet list"
                    >
                      <List className="w-3 h-3" />
                      <span>• Dot Points</span>
                    </button>
                  </div>
                </div>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handleContentPaste}
                  placeholder="Write or copy-paste story, news, bullet points (•) or numbered list (1, 2, 3...)..."
                  className="w-full min-h-[220px] sm:min-h-[260px] px-4 py-3 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs sm:text-sm focus:border-[#FBBF24] outline-none resize-y leading-relaxed shadow-inner font-normal"
                />
                <div className="flex items-center justify-between text-[10px] text-[#A7C9B1]/70">
                  <span>Pasting from ChatGPT or Gemini auto-cleans unnecessary gap lines between points</span>
                  <span>Drag corner to expand</span>
                </div>
              </div>

              {/* Pin Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FBBF24] focus:ring-0 cursor-pointer accent-[#FBBF24]"
                />
                <label htmlFor="pinCheck" className="text-xs font-bold text-white cursor-pointer select-none">
                  Pin this post to the top of the Node feed
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
                  {saving ? 'Saving...' : editingPost ? 'Update Post' : 'Publish to Node Feed 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
