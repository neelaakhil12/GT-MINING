import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, Pin, Edit, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';
import { GlassCard } from '../../components/GlassCard';

export const AdminCommunityPage: React.FC = () => {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Announcement');
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
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
    setCategory('Announcement');
    setIsPinned(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (post: any) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.imageUrl || '');
    setCategory(post.category);
    setIsPinned(Boolean(post.isPinned));
    setModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingPost) {
        const res = await api.updateAdminPost(editingPost.id, {
          title: title.trim(),
          content: content.trim(),
          imageUrl: imageUrl.trim() || null,
          category,
          isPinned,
        });
        if (res.success) {
          showToast('Post updated successfully!', 'success');
        }
      } else {
        const res = await api.createAdminPost({
          title: title.trim(),
          content: content.trim(),
          imageUrl: imageUrl.trim() || null,
          category,
          isPinned,
          status: 'PUBLISHED',
        });
        if (res.success) {
          showToast('Announcement published to user feed!', 'success');
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const res = await api.deleteAdminPost(id);
      if (res.success) {
        showToast('Post deleted', 'success');
        setPosts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err: any) {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <AdminNav />

      {/* Header */}
      <GlassCard className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#86EFAC]" />
            <span>Community Feed Publishing & Announcements</span>
          </h2>
          <p className="text-xs text-[#A7C9B1]">
            Publish project news that immediately displays on all user Community feeds
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-[#07130D] bg-[#FBBF24] hover:bg-[#F59E0B] shadow-[0_0_20px_rgba(251,191,36,0.35)] flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </GlassCard>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <GlassCard key={post.id} className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#86EFAC]/15 pb-2">
              <div className="flex items-center gap-2">
                {post.isPinned && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30 flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-current" />
                    <span>Pinned</span>
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16A34A]/20 text-[#86EFAC] border border-[#86EFAC]/25 uppercase">
                  {post.category}
                </span>
                <span className="text-xs text-[#A7C9B1]">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(post)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#86EFAC]"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F87171]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold text-white">{post.title}</h3>
            <p className="text-xs text-[#A7C9B1] line-clamp-3">{post.content}</p>
          </GlassCard>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border-[#FBBF24]/40 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingPost ? 'Edit Announcement' : 'Publish Announcement'}
            </h3>

            <form onSubmit={handleSavePost} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A7C9B1]">Post Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Major Ecosystem Update"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#A7C9B1]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-[#07130D]"
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Update">Update</option>
                    <option value="Ecosystem">Ecosystem</option>
                    <option value="Guide">Guide</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#A7C9B1]">Pin Announcement</label>
                  <div className="pt-1.5">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-white">
                      <input
                        type="checkbox"
                        checked={isPinned}
                        onChange={(e) => setIsPinned(e.target.checked)}
                        className="rounded accent-[#22C55E]"
                      />
                      <span>Pin to top of feed</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A7C9B1]">Banner Image URL (Optional)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A7C9B1]">Post Content</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write full announcement content here..."
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#A7C9B1] bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#07130D] bg-[#FBBF24] hover:bg-[#F59E0B] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingPost ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
