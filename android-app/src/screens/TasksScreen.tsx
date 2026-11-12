import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Dimensions,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import {
  ArrowLeft,
  Check,
  Play,
  Upload,
  Camera,
  X,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Coins,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { pickImageFromGallery } from '../utils/imagePicker';
import { OrbBackground } from '../components/OrbBackground';
import { AppNavbar } from '../components/AppNavbar';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, SERVER_HOST } from '../config/api';
import { appStorage } from '../utils/storage';
import { useAppSafeArea } from '../utils/safeArea';

const { width } = Dimensions.get('window');

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function buildVideoHtml(rawUrl: string): string {
  const ytId = extractYouTubeId(rawUrl);
  if (ytId) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    iframe { width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <iframe
    src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&controls=1&rel=0&modestbranding=1&enablejsapi=1&origin=https://gtnetwork.in"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</body>
</html>`;
  }

  const directUrl = rawUrl.startsWith('http')
    ? rawUrl
    : rawUrl.startsWith('/')
    ? `${SERVER_HOST}${rawUrl}`
    : `${SERVER_HOST}/${rawUrl}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    video { width: 100%; height: 100%; object-fit: contain; }
  </style>
</head>
<body>
  <video src="${directUrl}" controls autoplay playsinline webkit-playsinline></video>
</body>
</html>`;
}

interface TaskItem {
  id: string;
  category: 'social' | 'video';
  title: string;
  description: string;
  reward: number;
  rewardLabel: string;
  buttonLabel: string;
  url: string;
  duration?: number;
  iconType: 'x' | 'instagram' | 'youtube' | 'telegram' | 'facebook' | 'tiktok' | 'video';
}

const DEFAULT_TASKS_DATA: TaskItem[] = [
  {
    id: 'task_x',
    category: 'social',
    title: 'Follow us on X',
    description: 'Follow the official GT protocol account for instant announcements',
    reward: 1,
    rewardLabel: '+1 GT',
    buttonLabel: 'Follow on X',
    url: 'https://x.com',
    iconType: 'x',
  },
  {
    id: 'task_instagram',
    category: 'social',
    title: 'Follow on Instagram',
    description: 'Join our official global community',
    reward: 2,
    rewardLabel: '+2 GT',
    buttonLabel: 'Follow',
    url: 'https://instagram.com',
    iconType: 'instagram',
  },
  {
    id: 'task_youtube',
    category: 'social',
    title: 'Subscribe on YouTube',
    description: 'Subscribe to the GT channel for node guides',
    reward: 2,
    rewardLabel: '+2 GT',
    buttonLabel: 'Subscribe',
    url: 'https://youtube.com',
    iconType: 'youtube',
  },
  {
    id: 'task_telegram',
    category: 'social',
    title: 'Join Telegram',
    description: 'Join the official GT announcements channel',
    reward: 1,
    rewardLabel: '+1 GT',
    buttonLabel: 'Join',
    url: 'https://t.me',
    iconType: 'telegram',
  },
  {
    id: 'task_facebook',
    category: 'social',
    title: 'Follow on Facebook',
    description: 'Stay updated with GT ecosystem news',
    reward: 1,
    rewardLabel: '+1 GT',
    buttonLabel: 'Follow',
    url: 'https://facebook.com',
    iconType: 'facebook',
  },
  {
    id: 'task_tiktok',
    category: 'social',
    title: 'Follow on TikTok',
    description: 'Discover GT short updates and viral reels',
    reward: 1,
    rewardLabel: '+1 GT',
    buttonLabel: 'Follow',
    url: 'https://tiktok.com',
    iconType: 'tiktok',
  },
  {
    id: 'task_video',
    category: 'video',
    title: 'Watch GT introduction',
    description: 'Watch the assigned video (15 seconds)',
    reward: 2,
    rewardLabel: '+2 GT',
    buttonLabel: 'Watch video',
    url: '#',
    duration: 15,
    iconType: 'video',
  },
];

const TASK_SLIDES = [
  {
    id: 1,
    tag: 'DAILY REWARDS',
    title: 'Complete Tasks, Earn GT',
    description: 'Boost your balance every day by completing verified social quests.',
    accentColor: '#22C55E',
  },
  {
    id: 2,
    tag: 'GLOBAL COMMUNITY',
    title: 'Connect & Multiply',
    description: 'Join official GT channels across X, Telegram, and YouTube.',
    accentColor: '#38BDF8',
  },
  {
    id: 3,
    tag: 'VIDEO REWARDS',
    title: 'Watch & Collect',
    description: 'Explore the latest GT ecosystem updates and claim instant rewards.',
    accentColor: '#A855F7',
  },
];

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, refreshUserData } = useAuth();
  const { top, stackContentPaddingBottom, modalPaddingBottom } = useAppSafeArea();

  const [selectedTab, setSelectedTab] = useState<'all' | 'social' | 'video'>('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Live tasks and backend-tracked submissions
  const [tasksList, setTasksList] = useState<TaskItem[]>(DEFAULT_TASKS_DATA);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Proof Modal state
  const [proofModalTask, setProofModalTask] = useState<TaskItem | null>(null);
  const [proofImage, setProofImage] = useState<string>('');
  const [proofNote, setProofNote] = useState<string>('');
  const [submittingProof, setSubmittingProof] = useState<boolean>(false);

  // Video Watching Quest Player state
  const [activeVideoTask, setActiveVideoTask] = useState<TaskItem | null>(null);
  const [watchingVideoModalTask, setWatchingVideoModalTask] = useState<TaskItem | null>(null);
  const [videoTimer, setVideoTimer] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Auto-cycle hero slider (4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TASK_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live tasks and user submissions from backend API
  const fetchTasksAndSubmissions = async () => {
    try {
      const token = await appStorage.getItem('gt_mobile_token');
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 1. Fetch public tasks
      try {
        const tasksRes = await fetch(`${API_BASE_URL}/tasks`);
        const tasksData = await tasksRes.json();
        if (tasksData && tasksData.success && Array.isArray(tasksData.tasks) && tasksData.tasks.length > 0) {
          setTasksList(tasksData.tasks);
        }
      } catch {}

      // 2. Fetch my submissions
      if (token) {
        try {
          const subsRes = await fetch(`${API_BASE_URL}/tasks/my-submissions`, {
            headers: authHeaders,
          });
          const subsData = await subsRes.json();
          if (subsData && subsData.success && Array.isArray(subsData.submissions)) {
            setSubmissions(subsData.submissions);
          }
        } catch {}
      }
    } catch (err) {
      console.error('Error fetching tasks data in mobile app:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndSubmissions();
    const interval = setInterval(fetchTasksAndSubmissions, 8000);
    return () => clearInterval(interval);
  }, []);

  // Video Countdown Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (activeVideoTask && videoTimer !== null && videoTimer > 0) {
      interval = setInterval(() => {
        setVideoTimer((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            setVideoProgress(100);
            return 0;
          }
          const next = prev - 1;
          const totalSec = (activeVideoTask as any).duration || 15;
          setVideoProgress(Math.round(((totalSec - next) / totalSec) * 100));
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoTimer, activeVideoTask]);

  // Prevent Android hardware back button exit while video watch requirement countdown is active (rewarded ad behavior)
  useEffect(() => {
    if (!watchingVideoModalTask) return;

    const onBackPress = () => {
      if (videoTimer !== null && videoTimer > 0) {
        Alert.alert(
          'Video in Progress',
          `Please finish watching the video to unlock exit and claim your +${watchingVideoModalTask.reward} GT reward! (${videoTimer}s remaining)`,
          [{ text: 'Keep Watching', style: 'default' }]
        );
        return true; // block back navigation
      }
      setWatchingVideoModalTask(null);
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [watchingVideoModalTask, videoTimer]);

  // Pick proof screenshot from phone gallery
  const handlePickProofImage = async () => {
    try {
      const picked = await pickImageFromGallery({
        allowsEditing: false,
        quality: 0.6,
      });

      if (picked.permissionDenied) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access in app permissions to select a verification screenshot.'
        );
        return;
      }

      if (!picked.canceled && picked.dataUri) {
        setProofImage(picked.dataUri);
      }
    } catch (err: any) {
      const msg = err?.message ? ` (${err.message})` : '';
      Alert.alert('Error', `Failed to pick image from photo library.${msg}`);
    }
  };

  // Submit proof to backend API
  const handleSubmitProof = async () => {
    if (!proofModalTask) return;
    if (!proofImage) {
      Alert.alert('Screenshot Required', 'Please select a screenshot showing that you completed the task.');
      return;
    }

    setSubmittingProof(true);
    try {
      const token = await appStorage.getItem('gt_mobile_token');
      const res = await fetch(`${API_BASE_URL}/tasks/submit-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          taskId: proofModalTask.id,
          proofImage,
          proofNote: proofNote.trim(),
        }),
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        data = null;
      }

      if (res.ok && data && data.success) {
        Alert.alert(
          '🎉 Proof Submitted!',
          'Sent to admin for review. Your reward will be credited directly to your wallet upon approval.'
        );
        setProofModalTask(null);
        setProofImage('');
        setProofNote('');
        await fetchTasksAndSubmissions();
        refreshUserData();
      } else {
        throw new Error(data?.message || `Server error (${res.status}). Please try a smaller screenshot.`);
      }
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit task proof');
    } finally {
      setSubmittingProof(false);
    }
  };

  // Handle Action Button on any Task
  const handleTaskAction = (task: TaskItem) => {
    const existingSub = submissions.find((s) => s.taskId === task.id);
    if (existingSub?.status === 'APPROVED') {
      Alert.alert('Completed', 'You have already completed this task and claimed your reward.');
      return;
    }

    if (existingSub?.status === 'PENDING') {
      Alert.alert('Under Review', 'Your proof is already submitted and pending admin review. You can re-upload if needed.');
      setProofModalTask(task);
      setProofImage(existingSub.proofImage || '');
      setProofNote(existingSub.proofNote || '');
      return;
    }

    // Video watch quest
    if (task.category === 'video') {
      const watchSec = (task as any).duration || 15;
      setActiveVideoTask(task);
      setVideoTimer((prev) => (activeVideoTask?.id === task.id && prev !== null ? prev : watchSec));
      setVideoProgress((prev) => (activeVideoTask?.id === task.id ? prev : 0));
      setWatchingVideoModalTask(task);
      return;
    }

    // Social task: open external link then open proof modal
    if (task.url && task.url.startsWith('http')) {
      Linking.openURL(task.url).catch(() => {});
    }

    setProofModalTask(task);
    setProofImage('');
    setProofNote('');
  };

  const filterTabs = [
    { key: 'all', label: 'All tasks' },
    { key: 'social', label: 'Social media' },
    { key: 'video', label: 'Video tasks' },
  ] as const;

  const filteredTasks = tasksList.filter((t) => {
    if (selectedTab === 'all') return true;
    return t.category === selectedTab;
  });

  const completedCount = submissions.filter((s) => s.status === 'APPROVED').length;
  const activeSlideData = TASK_SLIDES[currentSlide];

  // Resolve absolute video URL if hosted on server
  const resolveVideoUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http')) return rawUrl;
    if (rawUrl.startsWith('/')) return `${SERVER_HOST}${rawUrl}`;
    return rawUrl;
  };

  const renderBrandIcon = (iconType: TaskItem['iconType']) => {
    switch (iconType) {
      case 'x':
        return (
          <View style={[styles.brandIconBox, { backgroundColor: '#000000' }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                fill="#FFFFFF"
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </Svg>
          </View>
        );
      case 'instagram':
        return (
          <LinearGradient
            colors={['#FA7E1E', '#D62976', '#962FBF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandIconBox}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Rect width={18} height={18} x={3} y={3} rx={5} ry={5} stroke="#FFFFFF" strokeWidth={2} fill="none" />
              <Circle cx={12} cy={12} r={4} stroke="#FFFFFF" strokeWidth={2} fill="none" />
              <Circle cx={17} cy={7} r={1.2} fill="#FFFFFF" />
            </Svg>
          </LinearGradient>
        );
      case 'youtube':
        return (
          <View style={[styles.brandIconBox, { backgroundColor: '#FF0000' }]}>
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path
                fill="#FFFFFF"
                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
              />
            </Svg>
          </View>
        );
      case 'telegram':
        return (
          <View style={[styles.brandIconBox, { backgroundColor: '#229ED9' }]}>
            <Svg width={20} height={20} viewBox="0 0 32 32">
              <Path
                fill="#FFFFFF"
                d="M23.07 9.42L6.87 15.67c-1.1.44-1.09 1.06-.2 1.33l4.16 1.3 9.63-6.08c.45-.28.87-.13.53.18l-7.81 7.05-.3 4.29c.42 0 .61-.19.85-.42l2.04-1.98 4.24 3.13c.78.43 1.34.21 1.54-.72l2.78-13.11c.29-1.14-.43-1.66-1.46-1.22z"
              />
            </Svg>
          </View>
        );
      case 'facebook':
        return (
          <View style={[styles.brandIconBox, { backgroundColor: '#1877F2' }]}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                fill="#FFFFFF"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </Svg>
          </View>
        );
      case 'tiktok':
        return (
          <View style={[styles.brandIconBox, { backgroundColor: '#000000', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                fill="#FFFFFF"
                d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
              />
            </Svg>
          </View>
        );
      case 'video':
        return (
          <View style={[styles.brandIconBox, { backgroundColor: '#EF4444' }]}>
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>
        );
      default:
        return (
          <View style={[styles.brandIconBox, { backgroundColor: '#14532D' }]}>
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <OrbBackground />

      <View style={[styles.safeArea, { paddingTop: top }]}>
        {/* Universal Top Navbar */}
        <AppNavbar activeTab="App" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: stackContentPaddingBottom }]}
        >
          {/* Breadcrumb Navigation Row matching website */}
          <View style={styles.subHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backRow}
              activeOpacity={0.7}
            >
              <ArrowLeft size={15} color="#1E5E36" strokeWidth={2.4} />
              <Text style={styles.backText}>Back to Dashboard</Text>
            </TouchableOpacity>
            <Text style={styles.stationTitle}>GT TASKS STATION</Text>
          </View>

          {/* 1. Top Hero Slides Carousel matching website */}
          <View style={styles.carouselBannerCard}>
            <LinearGradient
              colors={['#061E12', '#0A2D1B', '#04150C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.carouselInner}
            >
              <View style={styles.carouselGlow} pointerEvents="none" />

              <View style={styles.carouselTagBadge}>
                <View style={[styles.carouselTagDot, { backgroundColor: activeSlideData.accentColor }]} />
                <Text style={styles.carouselTagText}>{activeSlideData.tag}</Text>
              </View>

              <Text style={styles.carouselTitle}>{activeSlideData.title}</Text>
              <Text style={styles.carouselDesc}>{activeSlideData.description}</Text>

              {/* Indicator Dots */}
              <View style={styles.dotsRow}>
                {TASK_SLIDES.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === currentSlide ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* 2. Tasks Rewards Summary Card */}
          <View style={styles.rewardsSummaryCard}>
            <View style={styles.rewardsLeft}>
              <View style={styles.communityRewardsTag}>
                <Text style={styles.communityRewardsText}>COMMUNITY REWARDS</Text>
              </View>
              <Text style={styles.rewardsTitle}>Tasks to Earn GT</Text>
              <Text style={styles.rewardsSubtitle}>
                Complete social tasks, watch videos and grow with the GT community.
              </Text>
              <View style={styles.rewardsEarnedRow}>
                <Text style={styles.rewardsEarnedLabel}>Your task rewards:</Text>
                <Text style={styles.rewardsEarnedValue}>
                  {submissions
                    .filter((s) => s.status === 'APPROVED')
                    .reduce((acc, s) => acc + Number(s.reward || 1), 0)
                    .toFixed(2)}{' '}
                  GT
                </Text>
                <View style={styles.creditedPill}>
                  <Text style={styles.creditedText}>Credited to Wallet</Text>
                </View>
              </View>
            </View>

            <View style={styles.rewardsBadgeRight}>
              <Text style={styles.rewardsBadgeText}>GT</Text>
            </View>
          </View>

          {/* 3. Daily & Social Tasks Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ gap: 2 }}>
                <Text style={styles.sectionTitle}>DAILY & SOCIAL TASKS</Text>
                <Text style={styles.sectionSubtitle}>
                  Complete tasks and upload screenshot proof to collect wallet rewards
                </Text>
              </View>

              <View style={styles.doneBadge}>
                <Text style={styles.doneBadgeText}>
                  {completedCount} / {tasksList.length} DONE
                </Text>
              </View>
            </View>

            {/* Filter Tabs matching website */}
            <View style={styles.tabsRow}>
              {filterTabs.map((tab) => {
                const isActive = selectedTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setSelectedTab(tab.key)}
                    style={[
                      styles.tabPill,
                      isActive ? styles.tabPillActive : styles.tabPillInactive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        isActive ? styles.tabTextActive : styles.tabTextInactive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 4. Tasks List */}
            <View style={styles.tasksList}>
              {filteredTasks.map((task) => {
                const sub = submissions.find((s) => s.taskId === task.id);
                const isApproved = sub?.status === 'APPROVED';
                const isPending = sub?.status === 'PENDING';
                const isRejected = sub?.status === 'REJECTED';
                const isVideoWatching = activeVideoTask?.id === task.id && videoTimer !== null;

                return (
                  <View key={task.id} style={styles.taskCard}>
                    {/* Left: Brand Icon + Title + Description */}
                    <View style={styles.taskLeftRow}>
                      {renderBrandIcon(task.iconType)}

                      <View style={styles.taskInfoCol}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.taskTitle} numberOfLines={1}>
                            {task.title}
                          </Text>
                        </View>
                        <Text style={styles.taskDesc} numberOfLines={1}>
                          {task.description}
                        </Text>

                        {/* Video Progress Bar */}
                        {task.category === 'video' && (
                          <View style={styles.videoProgressTrack}>
                            <View
                              style={[
                                styles.videoProgressBar,
                                {
                                  width: isApproved
                                    ? '100%'
                                    : `${activeVideoTask?.id === task.id ? videoProgress : 0}%`,
                                },
                              ]}
                            />
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Right: Reward Points on Top, Action Button Below */}
                    <View style={styles.taskRightCol}>
                      <Text style={styles.rewardText}>{task.rewardLabel}</Text>

                      {isApproved ? (
                        <View style={styles.completedPill}>
                          <Check size={12} color="#15803D" strokeWidth={3} />
                          <Text style={styles.completedPillText}>Completed</Text>
                        </View>
                      ) : isPending ? (
                        <TouchableOpacity
                          onPress={() => handleTaskAction(task)}
                          style={styles.pendingPill}
                          activeOpacity={0.8}
                        >
                          <Clock size={11} color="#B45309" />
                          <Text style={styles.pendingPillText}>Under Review</Text>
                        </TouchableOpacity>
                      ) : isRejected ? (
                        <TouchableOpacity
                          onPress={() => handleTaskAction(task)}
                          style={styles.rejectedPill}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.rejectedPillText}>Resubmit ↗</Text>
                        </TouchableOpacity>
                      ) : isVideoWatching ? (
                        <TouchableOpacity
                          onPress={() => setWatchingVideoModalTask(task)}
                          style={styles.watchingPill}
                          activeOpacity={0.8}
                        >
                          <View style={styles.pingDot} />
                          <Text style={styles.watchingPillText}>
                            {videoTimer === 0 ? 'Done! Tap' : `${videoTimer}s...`}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleTaskAction(task)}
                          style={styles.taskActionBtn}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.taskActionBtnText}>
                            {task.buttonLabel} ↗
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 5. Reward Security Disclaimer */}
          <View style={styles.securityBox}>
            <Text style={styles.securityText}>
              <Text style={styles.securityTextBold}>Reward Verification: </Text>
              Tasks are verified by administrators via uploaded screenshot proof. Once approved, the reward amount is credited automatically into your wallet balance and lifetime earnings.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      {/* Task Proof Upload Modal */}
      {proofModalTask && (
        <Modal
          visible={!!proofModalTask}
          animationType="fade"
          transparent={true}
          onRequestClose={() => !submittingProof && setProofModalTask(null)}
        >
          <View style={styles.modalBackdrop}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalCenterWrapper}
            >
              <View style={styles.modalCard}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalHeaderTag}>TASK VERIFICATION REQUIRED</Text>
                    <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                      {proofModalTask.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setProofModalTask(null)}
                    disabled={submittingProof}
                    style={styles.modalCloseBtn}
                  >
                    <X size={18} color="#4B5563" />
                  </TouchableOpacity>
                </View>

                {/* Scrollable Form Body */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={[styles.modalScrollBody, { paddingBottom: modalPaddingBottom }]}
                >
                  {/* Reward Pill */}
                  <View style={styles.modalRewardPill}>
                    <Text style={styles.modalRewardLabel}>Completion Reward:</Text>
                    <View style={styles.modalRewardBadge}>
                      <Text style={styles.modalRewardBadgeText}>
                        +{proofModalTask.reward}.00 GT (Credited to Wallet)
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.modalInstructions}>
                    Please upload a screenshot showing that you completed this task (e.g. following, subscribing, or watching). Once reviewed and approved by the admin, your reward will be added directly into your wallet.
                  </Text>

                  {/* Screenshot Picker Card */}
                  <TouchableOpacity
                    onPress={handlePickProofImage}
                    activeOpacity={0.85}
                    style={[
                      styles.screenshotDropArea,
                      proofImage && styles.screenshotDropAreaActive,
                    ]}
                  >
                    {proofImage ? (
                      <View style={{ alignItems: 'center', width: '100%', gap: 8 }}>
                        <Image
                          source={{ uri: proofImage }}
                          style={styles.proofPreviewImg}
                          resizeMode="contain"
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={16} color="#15803D" />
                          <Text style={styles.proofLoadedText}>Screenshot Loaded. Tap to change.</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={{ alignItems: 'center', gap: 6 }}>
                        <View style={styles.cameraIconBox}>
                          <Camera size={22} color="#15803D" />
                        </View>
                        <Text style={styles.uploadPromptTitle}>Upload Screenshot Proof</Text>
                        <Text style={styles.uploadPromptSub}>Tap to pick PNG, JPG from photos</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Username / Handle (Optional) */}
                  <View style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.inputLabel}>Your Social Handle / Username (Optional)</Text>
                      <Text style={styles.inputSubLabel}>for faster verification</Text>
                    </View>
                    <TextInput
                      value={proofNote}
                      onChangeText={setProofNote}
                      placeholder="e.g. @your_username or profile link"
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                    />
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      onPress={() => setProofModalTask(null)}
                      disabled={submittingProof}
                      style={styles.modalCancelBtn}
                    >
                      <Text style={styles.modalCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSubmitProof}
                      disabled={submittingProof || !proofImage}
                      activeOpacity={0.85}
                      style={[
                        styles.modalSubmitBtn,
                        (!proofImage || submittingProof) && { opacity: 0.5 },
                      ]}
                    >
                      {submittingProof ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Upload size={14} color="#FFFFFF" />
                          <Text style={styles.modalSubmitBtnText}>Submit Proof to Admin</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}

      {/* Full-Screen In-App Video Quest Player (Plays Uploaded & YouTube Videos Inside App) */}
      {watchingVideoModalTask && (
        <Modal
          visible={!!watchingVideoModalTask}
          animationType="slide"
          statusBarTranslucent={true}
          onRequestClose={() => {
            if (videoTimer === 0) {
              setWatchingVideoModalTask(null);
            } else {
              Alert.alert(
                'Video in Progress',
                `Please finish watching the video to unlock exit and claim your +${watchingVideoModalTask.reward} GT reward! (${videoTimer}s remaining)`,
                [{ text: 'Keep Watching', style: 'default' }]
              );
            }
          }}
        >
          <View style={[styles.fullScreenVideoContainer, { paddingTop: Math.max(top, 16), paddingBottom: modalPaddingBottom }]}>
            {/* Top Navigation Bar */}
            <View style={styles.fullScreenTopBar}>
              {/* Back button ONLY shows after required watch time completes (Rewarded Ad behavior) */}
              {videoTimer === 0 ? (
                <TouchableOpacity
                  onPress={() => setWatchingVideoModalTask(null)}
                  style={styles.fullScreenBackBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Back to tasks"
                >
                  <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <View style={styles.adCountdownPill}>
                  <Clock size={12} color="#FBBF24" />
                  <Text style={styles.adCountdownPillText}>Exit in {videoTimer}s</Text>
                </View>
              )}

              <View style={{ flex: 1, paddingHorizontal: 8 }}>
                <Text style={styles.fullScreenVideoTag}>GT VIDEO QUEST</Text>
                <Text style={styles.fullScreenVideoTitle} numberOfLines={1}>
                  {watchingVideoModalTask.title}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={styles.fullScreenRewardBadge}>
                  <Coins size={13} color="#22C55E" />
                  <Text style={styles.fullScreenRewardText}>+{watchingVideoModalTask.reward} GT</Text>
                </View>

                {/* Wrong/Close button (✖) ONLY shows after video timer reaches 0 */}
                {videoTimer === 0 && (
                  <TouchableOpacity
                    onPress={() => setWatchingVideoModalTask(null)}
                    style={styles.adCloseXBtn}
                    activeOpacity={0.7}
                    accessibilityLabel="Close Video Quest"
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* In-App Embedded Video Player (WebView for MP4 & YouTube without Error 153) */}
            <View style={styles.fullScreenPlayerBox}>
              <WebView
                key={watchingVideoModalTask.id}
                source={{
                  html: buildVideoHtml(watchingVideoModalTask.url),
                  baseUrl: 'https://gtnetwork.in',
                  headers: {
                    Referer: 'https://gtnetwork.in',
                  },
                }}
                style={styles.fullScreenWebView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                originWhitelist={['*']}
                allowsFullscreenVideo={true}
                mixedContentMode="always"
                userAgent="Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
              />
            </View>

            {/* Scrollable Quest Progress & Details */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.fullScreenDetailsContent}
            >
              {/* Watch Progress Card */}
              <View style={styles.fullScreenProgressCard}>
                <View style={styles.progressHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Clock size={15} color="#FBBF24" />
                    <Text style={styles.fullScreenProgressTitle}>Required Watch Progress</Text>
                  </View>
                  <Text style={styles.fullScreenTimerBadge}>
                    {videoTimer === 0 ? '✓ Requirement Met' : `${videoTimer}s remaining`}
                  </Text>
                </View>

                {/* Progress Bar Track */}
                <View style={styles.fullScreenProgressBarTrack}>
                  <View
                    style={[
                      styles.fullScreenProgressBarFill,
                      { width: `${videoProgress}%` },
                    ]}
                  />
                </View>

                <Text style={styles.fullScreenInstructionText}>
                  {videoTimer === 0
                    ? `🎉 Required watch time completed! Tap "Submit Proof" below to upload screenshot verification and claim +${watchingVideoModalTask.reward} GT.`
                    : `Please watch for at least ${watchingVideoModalTask.duration || 15}s. The countdown is running automatically.`}
                </Text>
              </View>

              {/* Task Details & Description */}
              <View style={styles.fullScreenInfoCard}>
                <Text style={styles.fullScreenInfoTitle}>Task Description</Text>
                <Text style={styles.fullScreenInfoBody}>
                  {watchingVideoModalTask.description || 'Watch the official video to earn GT Coins and boost community rank.'}
                </Text>
              </View>

              {/* Optional: Direct YouTube link fallback */}
              {extractYouTubeId(watchingVideoModalTask.url) && (
                <TouchableOpacity
                  onPress={() => {
                    const ytId = extractYouTubeId(watchingVideoModalTask.url);
                    const appUrl = `vnd.youtube:${ytId}`;
                    const webUrl = `https://www.youtube.com/watch?v=${ytId}`;
                    Linking.openURL(appUrl).catch(() => Linking.openURL(webUrl));
                  }}
                  style={styles.openYtBtn}
                  activeOpacity={0.8}
                >
                  <ExternalLink size={14} color="#EF4444" />
                  <Text style={styles.openYtBtnText}>Open directly in YouTube App ↗</Text>
                </TouchableOpacity>
              )}

              {/* Action Buttons: Close & Submit Proof */}
              <View style={styles.fullScreenActionsRow}>
                {videoTimer === 0 ? (
                  <TouchableOpacity
                    onPress={() => setWatchingVideoModalTask(null)}
                    style={styles.fullScreenCloseBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.fullScreenCloseBtnText}>Close / Back to Tasks</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.lockedExitBar}>
                    <Clock size={13} color="#FBBF24" />
                    <Text style={styles.lockedExitText}>
                      🔒 Watch {videoTimer}s to unlock exit & reward
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  disabled={videoTimer !== 0}
                  onPress={() => {
                    const currentTask = watchingVideoModalTask;
                    setWatchingVideoModalTask(null);
                    setProofModalTask(currentTask);
                    setProofNote('Video completed');
                    setProofImage('');
                  }}
                  style={[
                    styles.fullScreenSubmitBtn,
                    videoTimer === 0
                      ? styles.fullScreenSubmitBtnActive
                      : styles.fullScreenSubmitBtnDisabled,
                  ]}
                  activeOpacity={0.8}
                >
                  <CheckCircle2 size={16} color={videoTimer === 0 ? '#07130D' : '#6B7280'} />
                  <Text
                    style={[
                      styles.fullScreenSubmitBtnText,
                      videoTimer === 0 && styles.fullScreenSubmitBtnActiveText,
                    ]}
                  >
                    {videoTimer === 0 ? 'Submit Proof ↗' : `Wait ${videoTimer}s`}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
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
    gap: 16,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E5E36',
  },
  stationTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#15803D',
    textTransform: 'uppercase',
  },
  carouselBannerCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  carouselInner: {
    padding: 20,
    minHeight: 165,
    justifyContent: 'flex-end',
    position: 'relative',
    gap: 6,
  },
  carouselGlow: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
  },
  carouselTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  carouselTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  carouselTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  carouselDesc: {
    fontSize: 11.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    alignSelf: 'center',
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#22C55E',
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  rewardsSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  rewardsLeft: {
    flex: 1,
    gap: 4,
  },
  communityRewardsTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  communityRewardsText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.3,
  },
  rewardsSubtitle: {
    fontSize: 11,
    color: '#1E5E36',
    fontWeight: '500',
  },
  rewardsEarnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  rewardsEarnedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E5E36',
  },
  rewardsEarnedValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0A341B',
  },
  creditedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  creditedText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  rewardsBadgeRight: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginLeft: 10,
  },
  rewardsBadgeText: {
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#15803D',
  },
  sectionContainer: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#1E5E36',
    fontWeight: '500',
  },
  doneBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doneBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0A341B',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  tabPillActive: {
    backgroundColor: '#14532D',
  },
  tabPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  tabText: {
    fontSize: 11.5,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#1E5E36',
  },
  tasksList: {
    gap: 10,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  taskLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  brandIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  taskInfoCol: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.2,
  },
  taskDesc: {
    fontSize: 11,
    color: 'rgba(30, 94, 54, 0.8)',
    fontWeight: '500',
  },
  videoProgressTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  videoProgressBar: {
    height: '100%',
    backgroundColor: '#22C55E',
  },
  taskRightCol: {
    alignItems: 'flex-end',
    gap: 5,
    flexShrink: 0,
  },
  rewardText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0A341B',
  },
  taskActionBtn: {
    backgroundColor: '#14532D',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
  },
  taskActionBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  completedPillText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#15803D',
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  pendingPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
  },
  rejectedPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  rejectedPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B91C1C',
  },
  watchingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  pingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  watchingPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
  },
  securityBox: {
    backgroundColor: 'rgba(234, 248, 238, 0.85)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.4)',
  },
  securityText: {
    fontSize: 11,
    color: '#1E5E36',
    lineHeight: 16,
  },
  securityTextBold: {
    fontWeight: '800',
    color: '#0A341B',
  },
  bottomSpacer: {
    height: 10,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCenterWrapper: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '88%',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  modalHeaderTag: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.8,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0A341B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalScrollBody: {
    padding: 20,
    gap: 14,
  },
  modalRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAF8EE',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  modalRewardLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0A341B',
  },
  modalRewardBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  modalRewardBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
  },
  modalInstructions: {
    fontSize: 11.5,
    color: '#1E5E36',
    lineHeight: 17,
    fontWeight: '500',
  },
  screenshotDropArea: {
    minHeight: 130,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  screenshotDropAreaActive: {
    borderColor: '#22C55E',
    backgroundColor: 'rgba(234, 248, 238, 0.4)',
    borderStyle: 'solid',
  },
  cameraIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPromptTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0A341B',
  },
  uploadPromptSub: {
    fontSize: 10.5,
    color: 'rgba(30, 94, 54, 0.7)',
  },
  proofPreviewImg: {
    width: '100%',
    height: 160,
    borderRadius: 14,
  },
  proofLoadedText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803D',
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0A341B',
  },
  inputSubLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#0A341B',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  modalSubmitBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // Video Quest Player Modal
  videoPlayerCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#071F14',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    overflow: 'hidden',
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  videoHeaderTag: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#4ADE80',
    letterSpacing: 0.8,
  },
  videoHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  videoCloseBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  videoScreenPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  videoPlayingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  videoPlayingUrl: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },
  externalVideoLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  externalVideoLinkText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#07130D',
  },
  watchProgressCard: {
    backgroundColor: '#0B2A1C',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    gap: 10,
  },
  watchProgressLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#A7C9B1',
  },
  watchTimerValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FBBF24',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  watchProgressBarTrack: {
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  watchProgressBarFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
  },
  videoHintText: {
    fontSize: 11,
    color: '#A7C9B1',
    lineHeight: 16,
  },
  videoSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4ADE80',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  videoSubmitBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#07130D',
  },
  fullScreenVideoContainer: {
    flex: 1,
    backgroundColor: '#07130D',
  },
  fullScreenTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0B2016',
    gap: 10,
  },
  fullScreenBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenVideoTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 0.8,
  },
  fullScreenVideoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  fullScreenRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  fullScreenRewardText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#22C55E',
  },
  fullScreenPlayerBox: {
    width: '100%',
    height: 240,
    backgroundColor: '#000000',
  },
  fullScreenWebView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullScreenDetailsContent: {
    padding: 16,
    gap: 16,
  },
  fullScreenProgressCard: {
    backgroundColor: '#0F291E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    gap: 12,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullScreenProgressTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E5E7EB',
  },
  fullScreenTimerBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FBBF24',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  fullScreenProgressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fullScreenProgressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  fullScreenInstructionText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  fullScreenInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  fullScreenInfoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fullScreenInfoBody: {
    fontSize: 12.5,
    color: '#9CA3AF',
    lineHeight: 19,
  },
  openYtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  openYtBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F87171',
  },
  fullScreenActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  fullScreenCloseBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenCloseBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D1D5DB',
  },
  fullScreenSubmitBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 14,
    borderRadius: 14,
  },
  fullScreenSubmitBtnActive: {
    backgroundColor: '#22C55E',
  },
  fullScreenSubmitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  fullScreenSubmitBtnActiveText: {
    color: '#07130D',
  },
  fullScreenSubmitBtnDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  adCountdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  adCountdownPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FBBF24',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  adCloseXBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedExitBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  lockedExitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
