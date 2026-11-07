import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import {
  ArrowLeft,
  Check,
  Play,
} from 'lucide-react-native';
import { OrbBackground } from '../components/OrbBackground';
import { AppNavbar } from '../components/AppNavbar';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

interface TaskItem {
  id: string;
  category: 'social' | 'video';
  title: string;
  description: string;
  rewardLabel: string;
  buttonLabel: string;
  url: string;
  iconType: 'x' | 'instagram' | 'youtube' | 'telegram' | 'facebook' | 'tiktok' | 'video';
}

const TASKS_DATA: TaskItem[] = [
  {
    id: 'task_x',
    category: 'social',
    title: 'Follow us on X',
    description: 'Follow the official GT...',
    rewardLabel: '+2 GT',
    buttonLabel: 'Follow on X',
    url: 'https://x.com',
    iconType: 'x',
  },
  {
    id: 'task_instagram',
    category: 'social',
    title: 'Follow on Instagram',
    description: 'Join our official community',
    rewardLabel: '+2 GT',
    buttonLabel: 'Follow',
    url: 'https://instagram.com',
    iconType: 'instagram',
  },
  {
    id: 'task_youtube',
    category: 'social',
    title: 'Subscribe on You...',
    description: 'Subscribe to the GT ch...',
    rewardLabel: '+2 GT',
    buttonLabel: 'Subscribe',
    url: 'https://youtube.com',
    iconType: 'youtube',
  },
  {
    id: 'task_telegram',
    category: 'social',
    title: 'Join Telegram',
    description: 'Join the official GT channel',
    rewardLabel: '+1 GT',
    buttonLabel: 'Join',
    url: 'https://t.me',
    iconType: 'telegram',
  },
  {
    id: 'task_facebook',
    category: 'social',
    title: 'Follow on Facebook',
    description: 'Stay updated with GT news',
    rewardLabel: '+1 GT',
    buttonLabel: 'Follow',
    url: 'https://facebook.com',
    iconType: 'facebook',
  },
  {
    id: 'task_tiktok',
    category: 'social',
    title: 'Follow on TikTok',
    description: 'Discover GT short videos',
    rewardLabel: '+1 GT',
    buttonLabel: 'Follow',
    url: 'https://tiktok.com',
    iconType: 'tiktok',
  },
  {
    id: 'task_video',
    category: 'video',
    title: 'Watch GT intr...',
    description: 'Watch the assigned ...',
    rewardLabel: '+2 GT',
    buttonLabel: 'Watch video',
    url: '#',
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
    description: 'Join official GT channels across X, Telegram, and...',
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
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'all' | 'social' | 'video'>('all');
  const [currentSlide, setCurrentSlide] = useState(1);
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});
  const [taskRewards, setTaskRewards] = useState<number>(0);
  const [tasksList, setTasksList] = useState<TaskItem[]>(TASKS_DATA);

  // Auto-cycle slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TASK_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live tasks from backend API
  useEffect(() => {
    const fetchLiveTasks = async () => {
      const endpoints = [
        `${API_BASE_URL}/tasks`,
        'http://localhost:5050/api/tasks',
      ];
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint);
          const data = await res.json();
          if (data && data.success && Array.isArray(data.tasks) && data.tasks.length > 0) {
            setTasksList(data.tasks);
            break;
          }
        } catch {}
      }
    };
    fetchLiveTasks();
  }, []);

  const filterTabs = [
    { key: 'all', label: 'All tasks' },
    { key: 'social', label: 'Social media' },
    { key: 'video', label: 'Video tasks' },
  ] as const;

  const handleTaskAction = (task: TaskItem) => {
    if (task.url && task.url.startsWith('http')) {
      Linking.openURL(task.url).catch(() => {});
    }
    const rewardVal = task.rewardLabel.includes('+2') ? 2 : 1;
    setCompletedTaskIds((prev) => ({ ...prev, [task.id]: true }));
    setTaskRewards((prev) => prev + rewardVal);
    Alert.alert('Task Completed!', `${task.rewardLabel} added to your task rewards.`);
  };

  const filteredTasks = tasksList.filter((t) => {
    if (selectedTab === 'all') return true;
    return t.category === selectedTab;
  });

  const completedCount = Object.keys(completedTaskIds).length;
  const activeSlideData = TASK_SLIDES[currentSlide];

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
          <View style={[styles.brandIconBox, { backgroundColor: '#000000' }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                fill="#FFFFFF"
                d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.6a8.28 8.28 0 0 0 5.2 1.87v-3.78a4.84 4.84 0 0 1-1.3-.0z"
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
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <OrbBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Universal Top Navbar */}
        <AppNavbar activeTab="App" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
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
              {/* Subtle ambient network glow */}
              <View style={styles.carouselGlow} pointerEvents="none" />

              <View style={styles.carouselTagBadge}>
                <View style={[styles.carouselTagDot, { backgroundColor: activeSlideData.accentColor }]} />
                <Text style={styles.carouselTagText}>{activeSlideData.tag}</Text>
              </View>

              <Text style={styles.carouselTitle}>{activeSlideData.title}</Text>
              <Text style={styles.carouselDesc} numberOfLines={2}>
                {activeSlideData.description}
              </Text>

              {/* Indicator Dots at bottom */}
              <View style={styles.dotsRow}>
                {TASK_SLIDES.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setCurrentSlide(idx)}
                    activeOpacity={0.7}
                    style={[
                      styles.dot,
                      currentSlide === idx ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* 2. Tasks Rewards Summary Card matching website */}
          <View style={styles.rewardsCard}>
            <View style={styles.rewardsAmbientGlow} pointerEvents="none" />

            <View style={styles.rewardsContentRow}>
              <View style={styles.rewardsLeftCol}>
                <View style={styles.rewardsBadge}>
                  <Text style={styles.rewardsBadgeText}>COMMUNITY REWARDS</Text>
                </View>

                <Text style={styles.rewardsTitle}>Tasks to Earn GT</Text>
                <Text style={styles.rewardsDesc} numberOfLines={1}>
                  Complete social tasks, watch videos and...
                </Text>

                <View style={styles.taskRewardsRow}>
                  <Text style={styles.taskRewardsLabel}>Your task rewards:</Text>
                  <Text style={styles.taskRewardsValue}>{taskRewards.toFixed(2)} GT</Text>
                </View>
              </View>

              {/* Right GT Brand Emblem */}
              <View style={styles.rewardsRightEmblem}>
                <Text style={styles.rewardsGtText}>GT</Text>
              </View>
            </View>
          </View>

          {/* 3. Daily & Social Tasks Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ gap: 2 }}>
                <Text style={styles.sectionTitle}>DAILY & SOCIAL TASKS</Text>
                <Text style={styles.sectionSubtitle}>
                  Complete tasks and collect rewards
                </Text>
              </View>

              <View style={styles.doneBadge}>
                <Text style={styles.doneBadgeText}>{completedCount} / 7 DONE</Text>
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

            {/* 4. Tasks List (Single compact horizontal card matching website) */}
            <View style={styles.tasksList}>
              {filteredTasks.map((task) => {
                const isCompleted = !!completedTaskIds[task.id];

                return (
                  <View key={task.id} style={styles.taskCard}>
                    {/* Left: Brand Icon + Title + Description */}
                    <View style={styles.taskLeftRow}>
                      {renderBrandIcon(task.iconType)}

                      <View style={styles.taskInfoCol}>
                        <Text style={styles.taskTitle} numberOfLines={1}>
                          {task.title}
                        </Text>
                        <Text style={styles.taskDesc} numberOfLines={1}>
                          {task.description}
                        </Text>
                      </View>
                    </View>

                    {/* Right: Reward Points on Top, Action Button Below */}
                    <View style={styles.taskRightCol}>
                      <Text style={styles.rewardText}>{task.rewardLabel}</Text>

                      {isCompleted ? (
                        <View style={styles.completedPill}>
                          <Check size={12} color="#15803D" strokeWidth={3} />
                          <Text style={styles.completedPillText}>Completed</Text>
                        </View>
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

          {/* 5. Reward Security Disclaimer matching website */}
          <View style={styles.securityBox}>
            <Text style={styles.securityText}>
              <Text style={styles.securityTextBold}>Reward security: </Text>
              This HTML is a front-end demo. A production app must verify follows, subscriptions, memberships and video completion with a trusted backend before crediting GT. Returning to this page alone is not proof of completion.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
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
    paddingTop: 8,
    paddingBottom: 110,
    gap: 14,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E5E36',
  },
  stationTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.8,
  },
  carouselBannerCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  carouselInner: {
    padding: 18,
    minHeight: 155,
    justifyContent: 'flex-end',
    position: 'relative',
    gap: 4,
  },
  carouselGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  carouselTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  carouselTagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  carouselTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  carouselTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  carouselDesc: {
    fontSize: 11.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 16,
    marginBottom: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#22C55E',
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  rewardsCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  rewardsAmbientGlow: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#DCFCE7',
  },
  rewardsContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  rewardsLeftCol: {
    flex: 1,
    gap: 3,
    paddingRight: 10,
  },
  rewardsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  rewardsBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.8,
  },
  rewardsTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.3,
  },
  rewardsDesc: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#1E5E36',
  },
  taskRewardsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  taskRewardsLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E5E36',
  },
  taskRewardsValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
  },
  rewardsRightEmblem: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  rewardsGtText: {
    fontSize: 22,
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
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E5E36',
  },
  doneBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  doneBadgeText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0A341B',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 7.5,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: '#14532D',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  tabPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabText: {
    fontSize: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  taskLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  brandIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  taskInfoCol: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  taskTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.2,
  },
  taskDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  taskRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
  },
  rewardText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0A341B',
  },
  taskActionBtn: {
    backgroundColor: '#14532D',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  taskActionBtnText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  completedPillText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#15803D',
  },
  securityBox: {
    borderRadius: 20,
    backgroundColor: '#F0FAF3',
    borderWidth: 1,
    borderColor: '#DCF2E4',
    padding: 14,
    marginTop: 4,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E5E36',
    lineHeight: 16,
  },
  securityTextBold: {
    fontWeight: '800',
    color: '#0A341B',
  },
  bottomSpacer: {
    height: 30,
  },
});
