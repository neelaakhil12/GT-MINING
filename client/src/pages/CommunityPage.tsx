import React, { useState, useEffect } from 'react';
import {
  Globe,
  Pin,
  Search,
  Calendar,
  User,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CommunityPost } from '../types';
import { GlassCard } from '../components/GlassCard';

const hardcodedNodePosts: CommunityPost[] = [
  {
    id: 'post_001',
    title: 'Welcome to GT Mining: Next Phase of Virtual Web3 Hash Power',
    content: 'We are thrilled to officially launch the GT Mining network! Every participant can mine 1 GT coin every 4 hours with zero hardware consumption. Invite friends to multiply network engagement, earn referral bonuses, and secure your place on the global ledger. Check back for frequent node updates and ecosystem milestones.',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop',
    category: 'Announcement',
    status: 'PUBLISHED',
    isPinned: true,
    authorName: 'GT Foundation',
    createdAt: '2026-10-15T11:12:45.081Z',
    updatedAt: '2026-10-15T11:12:45.081Z',
  },
  {
    id: 'post_002',
    title: 'Mining Integrity & The 4-Hour Cooldown Protocol',
    content: 'To preserve network fairness, the 4-hour cooldown rule is strictly verified on-chain and through our atomic backend ledger. Timestamps are synchronized in UTC. Double claims or tab tampering are intercepted automatically. Happy mining!',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    category: 'Update',
    status: 'PUBLISHED',
    isPinned: false,
    authorName: 'Tech Lead',
    createdAt: '2026-10-17T11:12:45.081Z',
    updatedAt: '2026-10-17T11:12:45.081Z',
  },
  {
    id: 'post_003',
    title: 'Referral Rewards Program is Live',
    content: 'Share your custom referral code or one-click invite link across WhatsApp, Telegram, and social channels. Friends who register through your link become part of your mining circle.',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
    category: 'Ecosystem',
    status: 'PUBLISHED',
    isPinned: false,
    authorName: 'Growth Team',
    createdAt: '2026-10-18T11:12:45.081Z',
    updatedAt: '2026-10-18T11:12:45.081Z',
  },
];

export const CommunityPage: React.FC = () => {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>(hardcodedNodePosts);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Announcement', 'Update', 'Ecosystem', 'Guide'];

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery]);

  const fetchPosts = async () => {
    try {
      const res = await api.getCommunityPosts(
        selectedCategory === 'All' ? undefined : selectedCategory,
        searchQuery.trim() || undefined
      );
      if (res.success && res.posts && res.posts.length > 0) {
        setPosts(res.posts);
      }
    } catch (err: any) {
      // Keep hardcodedNodePosts on fallback
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedPostIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-16 w-full max-w-5xl mx-auto">
      
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-md'
                  : 'bg-white/80 border border-white text-[#1E5E36] hover:bg-white hover:text-[#0A341B] shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#16A34A] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search updates..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 border border-white text-xs font-medium text-[#0A341B] placeholder-[#1E5E36]/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
          />
        </div>
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
          <p className="text-xs text-[#1E5E36]">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const isExpanded = expandedPostIds[post.id];
            const isLong = post.content.length > 280;

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
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#15803D] border border-[#22C55E]/30 uppercase">
                      {post.category}
                    </span>
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

                {/* Post Content */}
                <div className="text-xs sm:text-sm text-[#1E5E36] leading-relaxed space-y-2 whitespace-pre-line font-medium">
                  <p>
                    {isLong && !isExpanded
                      ? `${post.content.slice(0, 280)}...`
                      : post.content}
                  </p>

                  {isLong && (
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="text-xs font-bold text-[#16A34A] hover:underline flex items-center gap-1 pt-1"
                    >
                      <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Post Footer Timestamp */}
                <div className="flex items-center justify-between text-[11px] text-[#1E5E36] pt-2 border-t border-black/5 font-medium">
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
