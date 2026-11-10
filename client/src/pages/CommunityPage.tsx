import React, { useState, useEffect } from 'react';
import {
  Globe,
  Pin,
  Calendar,
  User,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Heart,
  Share2,
  Send,
  MessageCircle,
  Eye,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { CommunityPost } from '../types';
import { GlassCard } from '../components/GlassCard';
import { cleanListSpacing } from '../utils/textFormatter';

interface PostComment {
  id: string;
  author: string;
  text: string;
  time: string;
}

export const CommunityPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const cached = localStorage.getItem('gt_cached_community_posts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string, boolean>>({});

  // Interactive Social Actions (Like, Comment, Share) stored persistently on AWS server
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Latest'];

  const isWithin24Hours = (dateStr?: string) => {
    if (!dateStr) return false;
    const t = new Date(dateStr).getTime();
    if (isNaN(t)) return false;
    return (Date.now() - t) <= 24 * 60 * 60 * 1000;
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => {
      fetchPosts(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedCategory, user?.id, user?.email]);

  const fetchPosts = async (isBackground = false) => {
    if (!isBackground && posts.length === 0) setLoading(true);
    try {
      const res = await api.getCommunityPosts();
      if (res.success && res.posts) {
        try {
          localStorage.setItem('gt_cached_community_posts', JSON.stringify(res.posts));
        } catch {}
        let loaded = res.posts;
        if (selectedCategory === 'Latest') {
          const recent = loaded.filter((p: CommunityPost) => isWithin24Hours(p.createdAt || p.updatedAt));
          loaded = recent.length > 0 ? recent : loaded;
          loaded = [...loaded].sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.createdAt).getTime();
            const timeB = new Date(b.updatedAt || b.createdAt).getTime();
            return timeB - timeA;
          });
        }
        setPosts(loaded);

        // Sync real likes and likesCount from server database
        const userIdentifier = user?.id || user?.email || '';
        const serverLikes: Record<string, boolean> = {};
        const serverCounts: Record<string, number> = {};
        loaded.forEach((p: CommunityPost) => {
          serverCounts[p.id] = Number(p.likesCount || 0);
          if (userIdentifier && Array.isArray(p.likedBy) && p.likedBy.includes(userIdentifier)) {
            serverLikes[p.id] = true;
          }
        });
        setLikesCount(serverCounts);
        setLikedPostIds(serverLikes);
      }
    } catch (err: any) {
      console.warn('Failed to fetch community posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedPostIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleLike = async (postId: string) => {
    const userIdentifier = user?.id || user?.email || 'miner_guest';
    const isCurrentlyLiked = !!likedPostIds[postId];
    const newLikedStatus = !isCurrentlyLiked;
    
    // Optimistic UI update
    setLikedPostIds(prev => ({ ...prev, [postId]: newLikedStatus }));
    setLikesCount(prev => {
      const base = prev[postId] !== undefined ? prev[postId] : Number(posts.find(p => p.id === postId)?.likesCount || 0);
      return {
        ...prev,
        [postId]: Math.max(0, base + (newLikedStatus ? 1 : -1)),
      };
    });

    try {
      const res = await api.likeCommunityPost(postId, { userId: userIdentifier });
      if (res.success) {
        setLikedPostIds(prev => ({ ...prev, [postId]: !!res.isLiked }));
        setLikesCount(prev => ({ ...prev, [postId]: Number(res.likesCount || 0) }));
        if (res.isLiked) {
          showToast('Liked post! ❤️', 'success');
        }
      }
    } catch (err: any) {
      // Revert if request failed
      setLikedPostIds(prev => ({ ...prev, [postId]: isCurrentlyLiked }));
      showToast('Failed to update like status', 'error');
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (openCommentPostId === postId) {
      setOpenCommentPostId(null);
      return;
    }

    setOpenCommentPostId(postId);
    setLoadingComments(prev => ({ ...prev, [postId]: true }));

    try {
      const res = await api.getCommunityComments(postId);
      if (res.success && Array.isArray(res.comments)) {
        const loadedComments: PostComment[] = res.comments.map((c: any) => ({
          id: c.id,
          author: c.userName || c.author || 'GT Miner',
          text: c.content || c.text || '',
          time: c.createdAt ? new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now',
        }));
        setComments(prev => ({ ...prev, [postId]: loadedComments }));
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleShare = async (post: CommunityPost) => {
    const shareUrl = `${window.location.origin}/community#${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out this GT Node update: ${post.title}`,
          url: shareUrl,
        });
        return;
      } catch {}
    }

    navigator.clipboard.writeText(shareUrl);
    showToast('Post link copied to clipboard!', 'success');
  };

  const handleAddComment = async (postId: string) => {
    const text = (commentInput[postId] || '').trim();
    if (!text) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const userName = user?.fullName || 'GT Miner';
      const userId = user?.id || user?.email || 'miner_guest';

      const res = await api.addCommunityComment(postId, {
        content: text,
        userName,
        userId,
      });

      if (res.success && res.comment) {
        const created = res.comment;
        const newComment: PostComment = {
          id: created.id,
          author: created.userName || userName,
          text: created.content,
          time: 'Just now',
        };

        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment],
        }));

        // Increment comments count on post
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: (Number(p.commentsCount) || 0) + 1 } : p));
        setCommentInput(prev => ({ ...prev, [postId]: '' }));
        showToast('Comment saved to server!', 'success');
      } else {
        showToast(res.message || 'Could not post comment.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to post comment to server.', 'error');
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      
      {/* Header Banner matching DashboardPage */}
      <GlassCard glow className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/15 text-[#15803D] text-xs font-bold border border-[#22C55E]/30">
          <Globe className="w-3.5 h-3.5" />
          <span>Official Node Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0A341B]">
          GT Node & Ecosystem Feed
        </h1>
        <p className="text-xs sm:text-sm text-[#1E5E36] font-medium">
          Read the latest network node updates, core protocol upgrades, and mining milestones.
        </p>
      </GlassCard>

      {/* Category Pills: Only All and Latest */}
      <div className="flex items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-md scale-[1.02]'
                : 'bg-white/80 border border-white text-[#1E5E36] hover:bg-white hover:text-[#0A341B] shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline Feed */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-white/60 border border-white" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center space-y-3 glass-panel rounded-3xl border-2 border-white">
          <MessageSquare className="w-12 h-12 text-[#16A34A]/30 mx-auto" />
          <h3 className="text-base font-bold text-[#0A341B]">No announcements found</h3>
          <p className="text-xs text-[#1E5E36]">No updates available in this category.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const isExpanded = expandedPostIds[post.id];
            const isLong = post.content.length > 280;
            const isLiked = !!likedPostIds[post.id];
            const currentLikes = likesCount[post.id] !== undefined ? likesCount[post.id] : Number(post.likesCount || 0);
            const postCommentsList = comments[post.id] || [];
            const isCommentsOpen = openCommentPostId === post.id;

            return (
              <GlassCard
                key={post.id}
                className={`space-y-4 transition-all duration-300 ${
                  post.isPinned ? 'border-[#22C55E]/50 shadow-[0_12px_35px_rgba(34,197,94,0.18)]' : ''
                }`}
              >
                {/* Post Header with Pinned & Category */}
                <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] flex items-center justify-center font-black text-xs text-white shadow-sm">
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#0A341B] block">{post.authorName}</span>
                      <span className="text-[10px] font-bold text-[#15803D]">Verified Publisher</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                        <Pin className="w-3 h-3 fill-current text-[#D97706]" />
                        <span>Pinned</span>
                      </span>
                    )}
                    {isWithin24Hours(post.createdAt || post.updatedAt) ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#15803D] border border-[#22C55E]/40 uppercase flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#16A34A]" />
                        <span>LATEST (24H)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E2E8F0] text-[#475569] border border-[#CBD5E1] uppercase">
                        NODE POST
                      </span>
                    )}
                  </div>
                </div>

                {/* Post Title */}
                <h2 className="text-lg sm:text-xl font-black text-[#0A341B] tracking-tight">
                  {post.title}
                </h2>

                {/* Optional Media Image */}
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden max-h-80 border border-white shadow-sm">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Post Content with Pointwise & Paragraph Formatting */}
                {(() => {
                  const cleanedText = cleanListSpacing(post.content);
                  const isTextLong = cleanedText.length > 280;
                  return (
                    <div className="text-xs sm:text-sm text-[#1E5E36] leading-relaxed font-medium">
                      <div className="whitespace-pre-wrap break-words leading-relaxed">
                        {isTextLong && !isExpanded
                          ? `${cleanedText.slice(0, 280)}...`
                          : cleanedText}
                      </div>

                      {isTextLong && (
                        <button
                          onClick={() => toggleExpand(post.id)}
                          className="text-xs font-bold text-[#16A34A] hover:underline flex items-center gap-1 pt-2 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Interactive Twitter-style Engagement Bar */}
                <div className="flex items-center justify-between border-t border-b border-black/5 py-2.5 text-xs text-[#1E5E36] flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#22C55E]/10 text-[#15803D] font-bold text-xs" title="Views Count">
                    <Eye className="w-4 h-4 text-[#16A34A]" />
                    <span>{Number(post.viewsCount || 0).toLocaleString()} views</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Like Button */}
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-bold cursor-pointer ${
                        isLiked
                          ? 'text-rose-600 bg-rose-50'
                          : 'hover:text-rose-600 hover:bg-rose-50/50'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          isLiked ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                      <span>{currentLikes}</span>
                    </button>

                    {/* Comment Button */}
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-bold cursor-pointer ${
                        isCommentsOpen
                          ? 'text-[#16A34A] bg-[#22C55E]/15'
                          : 'hover:text-[#16A34A] hover:bg-[#22C55E]/10'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{comments[post.id]?.length !== undefined ? comments[post.id].length : Number(post.commentsCount || 0)}</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-bold hover:text-[#16A34A] hover:bg-[#22C55E]/10 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  </div>
                </div>

                {/* Inline Comment Section Drawer */}
                {isCommentsOpen && (
                  <div className="space-y-3 pt-1 animate-fadeIn border-t border-black/5">
                    {/* Existing Comments */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {loadingComments[post.id] ? (
                        <div className="text-center py-3 text-xs text-[#1E5E36]/70">
                          Loading comments from server...
                        </div>
                      ) : postCommentsList.length === 0 ? (
                        <div className="text-center py-3 text-xs text-[#1E5E36]/70 italic">
                          No comments yet. Be the first to start the discussion!
                        </div>
                      ) : (
                        postCommentsList.map(c => (
                          <div key={c.id} className="p-2.5 rounded-xl bg-white/70 border border-white/90 text-xs space-y-1">
                            <div className="flex items-center justify-between font-bold text-[#0A341B]">
                              <span>{c.author}</span>
                              <span className="text-[10px] text-[#1E5E36]/70 font-normal">{c.time}</span>
                            </div>
                            <p className="text-[#1E5E36]">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* New Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput[post.id] || ''}
                        onChange={(e) => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && !submittingComment[post.id] && handleAddComment(post.id)}
                        placeholder="Write a comment..."
                        disabled={submittingComment[post.id]}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white/90 border border-white text-xs text-[#0A341B] placeholder-[#1E5E36]/60 focus:outline-none focus:ring-2 focus:ring-[#22C55E] disabled:opacity-60"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={submittingComment[post.id] || !(commentInput[post.id] || '').trim()}
                        className="p-2 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-sm hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
                        title="Send comment"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Post Footer Timestamp */}
                <div className="flex items-center justify-between text-[11px] text-[#1E5E36] pt-1 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#15803D]">GT Official Protocol</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
