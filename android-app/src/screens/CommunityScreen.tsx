import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Globe,
  Pin,
  Heart,
  MessageSquare,
  Share2,
  Sparkles,
  Send,
  X,
} from 'lucide-react-native';
import { OrbBackground } from '../components/OrbBackground';
import { AppNavbar } from '../components/AppNavbar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { cleanListSpacing } from '../utils/textFormatter';
import { useAppSafeArea } from '../utils/safeArea';

interface PostItem {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  category?: string;
  isPinned?: boolean;
  author: string;
  dateStr: string;
  createdAt?: string;
  likes: number;
  comments: number;
  likedBy?: string[];
}

interface CommentItem {
  id: string;
  author: string;
  text: string;
  time: string;
}

const defaultCommunityPosts: PostItem[] = [
  {
    id: 'post_live_004',
    title: 'Node 2.0 Genesis Update',
    content:
      'Welcome to the official GT Node network! Tap like or leave comments below to engage with fellow miners.',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop',
    isPinned: false,
    author: 'GT Foundation',
    dateStr: '7 Nov 2026, 03:17 pm',
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: 0,
    likedBy: [],
  },
];

const categories = ['All', 'Latest'] as const;

export const CommunityScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { top, tabContentPaddingBottom } = useAppSafeArea();
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Latest'>('All');
  const [posts, setPosts] = useState<PostItem[]>(defaultCommunityPosts);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});

  // Comments Modal State
  const [activeCommentPost, setActiveCommentPost] = useState<PostItem | null>(null);
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const isWithin24Hours = (dateStr?: string) => {
    if (!dateStr) return false;
    const t = new Date(dateStr).getTime();
    if (isNaN(t)) return false;
    return (Date.now() - t) <= 24 * 60 * 60 * 1000;
  };

  useEffect(() => {
    const fetchLivePosts = async () => {
      const endpoints = [
        `${API_BASE_URL}/community/posts`,
        'http://localhost:5050/api/community/posts',
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data && data.success && Array.isArray(data.posts) && data.posts.length > 0) {
            const mapped: PostItem[] = data.posts.map((p: any) => ({
              id: p.id,
              title: p.title,
              content: p.content,
              imageUrl: p.imageUrl || '',
              isPinned: !!p.isPinned,
              author: p.authorName || 'GT Team',
              dateStr: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent',
              createdAt: p.createdAt,
              likes: Number(p.likesCount ?? 0),
              comments: Number(p.commentsCount ?? 0),
              likedBy: Array.isArray(p.likedBy) ? p.likedBy : [],
            }));
            setPosts(mapped);

            // Sync user like status from server database
            const userIdentifier = user?.id || user?.email || '';
            const initialLikes: Record<string, boolean> = {};
            const initialCounts: Record<string, number> = {};
            mapped.forEach(p => {
              initialCounts[p.id] = p.likes;
              if (userIdentifier && p.likedBy?.includes(userIdentifier)) {
                initialLikes[p.id] = true;
              }
            });
            setLikesCount(initialCounts);
            setLikedPosts(initialLikes);
            break;
          }
        } catch {}
      }
    };
    fetchLivePosts();
    const interval = setInterval(() => {
      fetchLivePosts();
    }, 4000);
    return () => clearInterval(interval);
  }, [user?.id, user?.email]);

  const displayedPosts = (() => {
    if (selectedCategory === 'Latest') {
      const recent = posts.filter(p => isWithin24Hours(p.createdAt || p.dateStr));
      const list = recent.length > 0 ? recent : posts;
      return [...list].sort((a, b) => {
        const timeA = new Date(a.createdAt || a.dateStr).getTime() || 0;
        const timeB = new Date(b.createdAt || b.dateStr).getTime() || 0;
        return timeB - timeA;
      });
    }
    return posts;
  })();

  const toggleLike = async (id: string) => {
    const isCurrentlyLiked = !!likedPosts[id];
    const newLiked = !isCurrentlyLiked;
    const userIdentifier = user?.id || user?.email || 'miner_guest';

    // Optimistic UI update
    setLikedPosts((prev) => ({ ...prev, [id]: newLiked }));
    setLikesCount((prev) => {
      const base = prev[id] !== undefined ? prev[id] : Number(posts.find((p) => p.id === id)?.likes || 0);
      return {
        ...prev,
        [id]: Math.max(0, base + (newLiked ? 1 : -1)),
      };
    });

    try {
      const endpoints = [
        `${API_BASE_URL}/community/posts/${id}/like`,
        `http://localhost:5050/api/community/posts/${id}/like`,
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userIdentifier }),
          });
          const data = await res.json();
          if (data && data.success) {
            setLikedPosts(prev => ({ ...prev, [id]: !!data.isLiked }));
            setLikesCount(prev => ({ ...prev, [id]: Number(data.likesCount || 0) }));
            break;
          }
        } catch {}
      }
    } catch {
      // Revert if failed
      setLikedPosts((prev) => ({ ...prev, [id]: isCurrentlyLiked }));
    }
  };

  const openComments = async (post: PostItem) => {
    setActiveCommentPost(post);
    setCommentsList([]);
    setLoadingComments(true);
    setCommentInput('');

    try {
      const endpoints = [
        `${API_BASE_URL}/community/posts/${post.id}/comments`,
        `http://localhost:5050/api/community/posts/${post.id}/comments`,
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data && data.success && Array.isArray(data.comments)) {
            const mappedComments: CommentItem[] = data.comments.map((c: any) => ({
              id: c.id,
              author: c.userName || c.author || 'GT Miner',
              text: c.content || c.text || '',
              time: c.createdAt ? new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now',
            }));
            setCommentsList(mappedComments);
            break;
          }
        } catch {}
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentInput.trim() || !activeCommentPost) return;

    setSubmittingComment(true);
    const content = commentInput.trim();
    const userName = user?.fullName || 'GT Miner';
    const userId = user?.id || user?.email || 'miner_guest';

    try {
      const endpoints = [
        `${API_BASE_URL}/community/posts/${activeCommentPost.id}/comments`,
        `http://localhost:5050/api/community/posts/${activeCommentPost.id}/comments`,
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, userName, userId }),
          });
          const data = await res.json();
          if (data && data.success && data.comment) {
            const c = data.comment;
            const newComment: CommentItem = {
              id: c.id,
              author: c.userName || userName,
              text: c.content,
              time: 'Just now',
            };
            setCommentsList(prev => [...prev, newComment]);
            setCommentInput('');

            // Increment post comments count in state
            setPosts(prev =>
              prev.map(p =>
                p.id === activeCommentPost.id
                  ? { ...p, comments: (p.comments || 0) + 1 }
                  : p
              )
            );
            setActiveCommentPost(prev => prev ? { ...prev, comments: (prev.comments || 0) + 1 } : null);
            break;
          }
        } catch {}
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async (title: string) => {
    try {
      await Share.share({
        message: `${title} - Read more on GT Network: https://gtnetwork.in/community`,
      });
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <OrbBackground />

      <View style={[styles.safeArea, { paddingTop: top }]}>
        {/* Universal Top Navbar */}
        <AppNavbar activeTab="App" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabContentPaddingBottom }]}
        >
          {/* 1. Header Banner matching video */}
          <View style={styles.headerCard}>
            <View style={styles.officialPillBadge}>
              <Globe size={13} color="#15803D" />
              <Text style={styles.officialPillText}>Official Node Network</Text>
            </View>

            <Text style={styles.feedMainTitle}>GT Node & Ecosystem Feed</Text>

            <Text style={styles.feedSubDesc}>
              Read the latest network node updates, core protocol upgrades, and mining milestones.
            </Text>
          </View>

          {/* 2. Category Filter Pills: ONLY All and Latest */}
          <View style={styles.categoriesRow}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.catPill,
                    isActive ? styles.catPillActive : styles.catPillInactive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.catPillText,
                      isActive ? styles.catPillTextActive : styles.catPillTextInactive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3. Community Feed Posts matching video */}
          <View style={styles.postsList}>
            {displayedPosts.map((post) => {
              const isLiked = !!likedPosts[post.id];
              const count = likesCount[post.id] !== undefined ? likesCount[post.id] : Number(post.likes ?? 0);

              return (
                <View
                  key={post.id}
                  style={[
                    styles.postCard,
                    post.isPinned && styles.pinnedBorderGlow,
                  ]}
                >
                  {/* Post Top Header */}
                  <View style={styles.postHeader}>
                    <View style={styles.authorRow}>
                      <View style={styles.authorAvatar}>
                        <Text style={styles.authorInitial}>
                          {post.author.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.authorName}>{post.author}</Text>
                        <Text style={styles.verifiedText}>Verified Publisher</Text>
                      </View>
                    </View>

                    <View style={styles.headerBadgesRight}>
                      {post.isPinned && (
                        <View style={styles.pinnedPill}>
                          <Pin size={10} color="#B45309" />
                          <Text style={styles.pinnedPillText}>Pinned</Text>
                        </View>
                      )}
                      {isWithin24Hours(post.createdAt || post.dateStr) ? (
                        <View style={styles.latestPill}>
                          <Sparkles size={9} color="#15803D" />
                          <Text style={styles.latestPillText}>LATEST (24H)</Text>
                        </View>
                      ) : (
                        <View style={styles.nodePill}>
                          <Text style={styles.nodePillText}>NODE POST</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Post Title */}
                  <Text style={styles.postTitle}>{post.title}</Text>

                  {/* Post Image matching video */}
                  {post.imageUrl && (
                    <View style={styles.postImgWrapper}>
                      <Image
                        source={{ uri: post.imageUrl }}
                        style={styles.postImg}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  {/* Post Body */}
                  <Text style={styles.postBody}>{cleanListSpacing(post.content)}</Text>

                  {/* Action Bar */}
                  <View style={styles.postActionsBar}>
                    <TouchableOpacity
                      onPress={() => toggleLike(post.id)}
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                    >
                      <Heart
                        size={15}
                        color={isLiked ? '#EF4444' : '#1E5E36'}
                        fill={isLiked ? '#EF4444' : 'transparent'}
                      />
                      <Text
                        style={[
                          styles.actionBtnText,
                          isLiked && { color: '#EF4444', fontWeight: '800' },
                        ]}
                      >
                        {count}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => openComments(post)}
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                    >
                      <MessageSquare size={15} color="#1E5E36" />
                      <Text style={styles.actionBtnText}>{post.comments}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleShare(post.title)}
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                    >
                      <Share2 size={15} color="#1E5E36" />
                    </TouchableOpacity>
                  </View>

                  {/* Footer Row matching video */}
                  <View style={styles.postFooterRow}>
                    <Text style={styles.dateText}>{post.dateStr}</Text>
                    <Text style={styles.protocolText}>GT Official Protocol</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      {/* Comments Drawer Modal */}
      <Modal
        visible={!!activeCommentPost}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveCommentPost(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <MessageSquare size={18} color="#15803D" />
                <Text style={styles.modalTitle}>
                  Comments ({activeCommentPost?.comments || 0})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveCommentPost(null)}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <X size={20} color="#1E5E36" />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <ScrollView
              style={styles.commentsListScroll}
              contentContainerStyle={styles.commentsListContent}
              showsVerticalScrollIndicator={false}
            >
              {loadingComments ? (
                <View style={styles.commentLoadingContainer}>
                  <ActivityIndicator size="small" color="#22C55E" />
                  <Text style={styles.commentLoadingText}>Loading comments...</Text>
                </View>
              ) : commentsList.length === 0 ? (
                <View style={styles.commentEmptyContainer}>
                  <Text style={styles.commentEmptyText}>
                    No comments yet. Start the conversation!
                  </Text>
                </View>
              ) : (
                commentsList.map((c) => (
                  <View key={c.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{c.author}</Text>
                      <Text style={styles.commentTime}>{c.time}</Text>
                    </View>
                    <Text style={styles.commentBody}>{c.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Comment Input Bar */}
            <View style={styles.inputBarContainer}>
              <TextInput
                value={commentInput}
                onChangeText={setCommentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#6B7280"
                style={styles.commentTextInput}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={handleSendComment}
              />
              <TouchableOpacity
                onPress={handleSendComment}
                disabled={submittingComment || !commentInput.trim()}
                style={[
                  styles.sendBtn,
                  (!commentInput.trim() || submittingComment) && styles.sendBtnDisabled,
                ]}
                activeOpacity={0.8}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Send size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FAF3',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
    gap: 16,
  },
  headerCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 18,
    gap: 8,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  officialPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  officialPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  feedMainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.3,
  },
  feedSubDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E5E36',
    lineHeight: 18,
  },
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  catPillActive: {
    backgroundColor: '#22C55E',
    borderColor: '#16A34A',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  catPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: '#FFFFFF',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  catPillTextInactive: {
    color: '#1E5E36',
  },
  postsList: {
    gap: 14,
  },
  postCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
    gap: 10,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  pinnedBorderGlow: {
    borderColor: 'rgba(34, 197, 94, 0.5)',
    shadowColor: '#22C55E',
    shadowOpacity: 0.16,
    shadowRadius: 14,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    paddingBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
  },
  authorName: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0A341B',
  },
  verifiedText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  headerBadgesRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinnedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pinnedPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  latestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  latestPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  nodePill: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  nodePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 0.5,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0A341B',
    lineHeight: 21,
  },
  postImgWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  postImg: {
    width: '100%',
    height: '100%',
  },
  postBody: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E5E36',
    lineHeight: 18,
  },
  postActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E5E36',
  },
  postFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  protocolText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  bottomSpacer: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    minHeight: 360,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A341B',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  commentsListScroll: {
    flex: 1,
  },
  commentsListContent: {
    padding: 20,
    gap: 12,
  },
  commentLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  commentLoadingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  commentEmptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentEmptyText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  commentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0A341B',
  },
  commentTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  commentBody: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 18,
  },
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0A341B',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
});
