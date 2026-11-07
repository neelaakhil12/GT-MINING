import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Coins,
  TrendingUp,
  Pickaxe,
  CheckCircle2,
  Users,
  ArrowRight,
  ArrowUpRight,
  Zap,
  Gift,
  Sparkles,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { GtCoinOrbit } from '../components/GtCoinOrbit';
import { OrbBackground } from '../components/OrbBackground';
import { AppNavbar } from '../components/AppNavbar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { API_BASE_URL } from '../config/api';

const { width } = Dimensions.get('window');

const DEFAULT_BANNER_SLIDES = [
  {
    id: 1,
    tag: 'GT ECOSYSTEM',
    title: 'Join the Future of Mining',
    description: 'Experience the GT network.',
    ctaText: 'Explore Now',
    targetRoute: 'Mine' as const,
    gradient: ['#0A2A18', '#05180E'] as const,
    accentColor: '#22C55E',
  },
  {
    id: 2,
    tag: 'GLOBAL ALLIANCE',
    title: 'Exclusive Rewards',
    description: 'Invite your circle and multiply your GT mining hashpower.',
    ctaText: 'Invite Friends',
    targetRoute: 'Referrals' as const,
    gradient: ['#07241C', '#041611'] as const,
    accentColor: '#38BDF8',
  },
  {
    id: 3,
    tag: 'DECENTRALIZED VAULT',
    title: 'Next-Gen Asset Security',
    description: 'Fair allocation protocol locked by 4-hour cryptographic epochs.',
    ctaText: 'View Wallet',
    targetRoute: 'Wallet' as const,
    gradient: ['#121829', '#060A14'] as const,
    accentColor: '#A855F7',
  },
];

export const DashboardScreen: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [bannerSlides, setBannerSlides] = useState(DEFAULT_BANNER_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch live home carousel banners from production server
  useEffect(() => {
    let isMounted = true;
    const fetchHomeBanners = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/home-banners`);
        const data = await res.json();
        if (data && data.success && Array.isArray(data.banners) && data.banners.length > 0) {
          const active = data.banners.filter((b: any) => b.isActive !== false);
          if (active.length > 0 && isMounted) {
            setBannerSlides(
              active.map((b: any, idx: number) => ({
                id: b.order || idx + 1,
                tag: b.tag || 'GT ECOSYSTEM',
                title: b.title,
                description: b.description,
                ctaText: b.ctaText || 'Explore Now',
                targetRoute: (b.targetRoute === '/referrals'
                  ? 'Referrals'
                  : b.targetRoute === '/wallet'
                  ? 'Wallet'
                  : 'Mine') as const,
                gradient: [b.gradientStart || '#0A2A18', b.gradientEnd || '#05180E'] as const,
                accentColor: b.accentColor || '#22C55E',
              }))
            );
          }
        }
      } catch {}
    };
    fetchHomeBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  // Refresh user data from backend DB on mount
  useEffect(() => {
    refreshUserData();
  }, []);

  // Auto-sliding banner matching website (3.5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const activeSlide = bannerSlides[currentSlide] || bannerSlides[0] || DEFAULT_BANNER_SLIDES[0];

  const handleBannerCta = (route: string) => {
    if (route === 'Mine') (navigation as any).navigate('MainTabs', { screen: 'Mine' });
    else if (route === 'Referrals') (navigation as any).navigate('MainTabs', { screen: 'Referrals' });
    else if (route === 'Wallet') navigation.navigate('Wallet');
  };

  return (
    <View style={styles.container}>
      <OrbBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Universal Top Navbar matching website mobile view */}
        <AppNavbar activeTab="App" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Dashboard Greeting Header matching website mobile */}
          <View style={styles.greetingHeader}>
            <Text style={styles.brandSubtitle}>GT NETWORK</Text>
            <Text style={styles.greetingTitle}>
              {getGreeting()}!
            </Text>
            <Text style={styles.userNameText}>
              {user?.fullName || 'GT Miner'}
            </Text>
          </View>

          {/* 2. Interactive Slides Carousel Banner matching website HomeBanners */}
          <View style={styles.carouselWrapper}>
            <LinearGradient
              colors={activeSlide.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.carouselCard}
            >
              {/* Subtle ambient glow circle */}
              <View style={styles.carouselGlow} />

              <View style={styles.carouselContent}>
                <View style={styles.carouselTagBadge}>
                  <View
                    style={[
                      styles.carouselTagDot,
                      { backgroundColor: activeSlide.accentColor },
                    ]}
                  />
                  <Text style={styles.carouselTagText}>{activeSlide.tag}</Text>
                </View>

                <Text style={styles.carouselTitle}>{activeSlide.title}</Text>
                <Text style={styles.carouselDesc} numberOfLines={2}>
                  {activeSlide.description}
                </Text>

                <TouchableOpacity
                  onPress={() => handleBannerCta(activeSlide.targetRoute)}
                  style={styles.bannerCtaBtn}
                  activeOpacity={0.88}
                >
                  <Text style={styles.bannerCtaText}>{activeSlide.ctaText}</Text>
                  <ArrowRight size={13} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Indicator Dots */}
              <View style={styles.dotsRow}>
                {bannerSlides.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setCurrentSlide(idx)}
                    activeOpacity={0.7}
                    style={[
                      styles.dot,
                      idx === currentSlide ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* 3. MARKET OVERVIEW Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>MARKET OVERVIEW</Text>
            <Text style={styles.sectionSubtitle}>Live UTC Rates</Text>
          </View>

          {/* Horizontal Crypto Rates Track */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.marketScroll}
          >
            {/* Card 1: GT with 3D Continuous Coin Orbit */}
            <View style={styles.marketCardMain}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTokenLabel}>GT</Text>
                <Text style={styles.cardTokenAmount}>5,200</Text>
              </View>

              {/* Continuous 3D 11-Coin Orbit with GT Logo */}
              <GtCoinOrbit width={138} height={96} />

              <View style={styles.cardFooter}>
                <Text style={styles.cardPriceText}>$1,200</Text>
                <View style={styles.percentBadge}>
                  <Text style={styles.percentText}>+12.4%</Text>
                </View>
              </View>
            </View>

            {/* Card 2: BITCOIN */}
            <View style={styles.marketCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.coinIconBadge, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.coinIconText}>₿</Text>
                </View>
                <Text style={styles.cardTokenLabel}>BITCOIN</Text>
                <Text style={styles.cardTokenAmount}>0.041</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPriceText}>$2,400</Text>
                <Text style={styles.percentPositive}>+1.2%</Text>
              </View>
            </View>

            {/* Card 3: ETHEREUM */}
            <View style={styles.marketCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.coinIconBadge, { backgroundColor: '#4F46E5' }]}>
                  <Text style={styles.coinIconText}>Ξ</Text>
                </View>
                <Text style={styles.cardTokenLabel}>ETHEREUM</Text>
                <Text style={styles.cardTokenAmount}>1.42</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPriceText}>$3,100</Text>
                <Text style={styles.percentNegative}>-0.5%</Text>
              </View>
            </View>

            {/* Card 4: SOLANA */}
            <View style={styles.marketCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.coinIconBadge, { backgroundColor: '#0F172A' }]}>
                  <Text style={[styles.coinIconText, { color: '#14F195' }]}>◎</Text>
                </View>
                <Text style={styles.cardTokenLabel}>SOLANA</Text>
                <Text style={styles.cardTokenAmount}>24.5</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPriceText}>$3,400</Text>
                <Text style={styles.percentPositive}>+5.1%</Text>
              </View>
            </View>
          </ScrollView>

          {/* 4. Action Card: MINE $GT (EXACTLY matching video) */}
          <View style={styles.actionCardWrapper}>
            <View style={styles.mineGtCard}>
              <View style={styles.mineGtLeft}>
                <Text style={styles.mineGtTitle}>Mine $GT</Text>
                <Text style={styles.mineGtDesc}>Build the Human Network</Text>
                <TouchableOpacity
                  onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Mine' })}
                  style={styles.mineGtBtn}
                  activeOpacity={0.88}
                >
                  <Text style={styles.mineGtBtnText}>Mine $GT</Text>
                  <ArrowUpRight size={14} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Large Double Ring GT Coin on the Right */}
              <View style={styles.mineGtRightGraphic}>
                <View style={styles.mineGtOuterRing}>
                  <View style={styles.mineGtInnerCircle}>
                    <Text style={styles.mineGtCoinText}>GT</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 4B. REFERRAL BONUS CARD (EXACTLY matching website design) */}
          <View style={styles.actionCardWrapper}>
            <LinearGradient
              colors={['#071A12', '#0A1526', '#1A0B2C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.referralBonusCard}
            >
              {/* Aurora Glow Orbs */}
              <View style={styles.auroraOrb1} pointerEvents="none" />
              <View style={styles.auroraOrb2} pointerEvents="none" />
              <View style={styles.auroraOrb3} pointerEvents="none" />

              {/* Top Badges Row */}
              <View style={styles.referralBonusTopRow}>
                <View style={styles.referralBonusBadge}>
                  <View style={styles.referralBonusDot} />
                  <Text style={styles.referralBonusBadgeText}>REFERRAL BONUS</Text>
                </View>
                <View style={styles.referralPercentBadge}>
                  <Zap size={11} color="#FBBF24" fill="#FBBF24" />
                  <Text style={styles.referralPercentText}>+10%</Text>
                </View>
              </View>

              {/* Main Content & Orbital Graphic */}
              <View style={styles.referralBonusContentRow}>
                <View style={{ flex: 1, gap: 5, zIndex: 10 }}>
                  <Text style={styles.referralBonusTitle}>Exclusive Rewards</Text>
                  <Text style={styles.referralBonusDesc}>
                    Refer your friends and earn 10% more GT mining power per hour.
                  </Text>
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Referrals' })}
                    style={styles.inviteNowBtn}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.inviteNowText}>Invite Now</Text>
                    <ArrowRight size={13} color="#0A341B" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                {/* 3D Glowing Orbital Gift Gem Graphic */}
                <View style={styles.bonusOrbitalContainer} pointerEvents="none">
                  {/* Outer Dashed Orbit Ring */}
                  <View style={styles.orbitRingOuter} />
                  {/* Inner Violet Orbit Ring */}
                  <View style={styles.orbitRingInner} />

                  {/* Core Gem Orb */}
                  <LinearGradient
                    colors={['#10B981', '#8B5CF6', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bonusCoreGem}
                  >
                    <View style={styles.bonusCoreInner}>
                      <Gift size={20} color="#A7F3D0" />
                      <Text style={styles.bonusCoreLabel}>BONUS</Text>
                    </View>
                  </LinearGradient>

                  {/* Sparkle Accents */}
                  <View style={styles.sparklePosition}>
                    <Sparkles size={14} color="#FDE047" />
                  </View>
                  <View style={styles.cyanDotPosition} />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* 5. Four Platform Statistics Cards in exact 2x2 Grid matching website */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              {/* Wallet Balance */}
              <View style={styles.beamStatCard}>
                <View style={styles.beamCardInner}>
                  <View style={styles.statTopRow}>
                    <Text style={styles.statLabelText}>Wallet Balance</Text>
                    <View style={styles.statIconBadge}>
                      <Coins size={15} color="#16A34A" strokeWidth={2.2} />
                    </View>
                  </View>
                  <Text style={styles.statMainValue}>
                    {Number(user?.balance ?? 0).toFixed(2)} GT
                  </Text>
                  <View style={styles.statSubRow}>
                    <CheckCircle2 size={13} color="#16A34A" strokeWidth={2.4} />
                    <Text style={styles.statSubText}>Verified ledger</Text>
                  </View>
                </View>
              </View>

              {/* Lifetime Mined */}
              <View style={styles.beamStatCard}>
                <View style={styles.beamCardInner}>
                  <View style={styles.statTopRow}>
                    <Text style={styles.statLabelText}>Lifetime Mined</Text>
                    <View style={styles.statIconBadge}>
                      <TrendingUp size={15} color="#16A34A" strokeWidth={2.2} />
                    </View>
                  </View>
                  <Text style={styles.statMainValueDark}>
                    {Number(user?.totalMined ?? user?.balance ?? 0).toFixed(2)} GT
                  </Text>
                  <View style={styles.statSubRow}>
                    <Text style={styles.upArrow}>▲</Text>
                    <Text style={styles.statSubText}>Cumulative Yield</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              {/* Mining Rate */}
              <View style={styles.beamStatCard}>
                <View style={styles.beamCardInner}>
                  <View style={styles.statTopRow}>
                    <Text style={styles.statLabelText}>Mining Rate</Text>
                    <View style={styles.statIconBadge}>
                      <Pickaxe size={15} color="#16A34A" strokeWidth={2.2} />
                    </View>
                  </View>
                  <Text style={styles.statMainValue}>+1.00 GT</Text>
                  <View style={styles.statSubRow}>
                    <Text style={styles.statSubTextMuted}>Per 4-hour cycle</Text>
                  </View>
                </View>
              </View>

              {/* Private Network / Circle Chat */}
              <TouchableOpacity
                onPress={() => navigation.navigate('PrivateNetwork')}
                style={styles.beamStatCard}
                activeOpacity={0.88}
                testID="circle-chat-button"
                accessibilityLabel="Circle Chat Button"
              >
                <View style={styles.beamCardInner}>
                  <View style={styles.statTopRow}>
                    <Text style={styles.statLabelText} numberOfLines={1}>Private Netw...</Text>
                    <View style={styles.statIconBadge}>
                      <Users size={15} color="#16A34A" strokeWidth={2.2} />
                    </View>
                  </View>
                  <Text style={styles.statMainValueDark} numberOfLines={1}>Circle Chat</Text>
                  <View style={styles.statSubRow}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.statSubText} numberOfLines={1}>Open Chat & Mi... →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 6. GT Tasks Action Card matching website */}
          <View style={styles.tasksActionCard}>
            <View style={styles.tasksLeftCol}>
              <Text style={styles.tasksMainTitle}>GT Tasks</Text>
              <Text style={styles.tasksSubTitle}>
                Complete tasks & earn GT
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Tasks')}
                style={styles.tasksButton}
                activeOpacity={0.85}
              >
                <Text style={styles.tasksButtonText}>GT Tasks</Text>
                <ArrowUpRight size={14} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.tasksRightGraphic}>
              <View style={styles.tasksCircleRing}>
                <View style={styles.tasksCircleInner}>
                  <Text style={styles.tasksCoinText}>GT</Text>
                </View>
              </View>
            </View>
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
    paddingTop: 10,
    paddingBottom: 110,
    gap: 16,
  },
  greetingHeader: {
    paddingHorizontal: 4,
    gap: 2,
  },
  brandSubtitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.5,
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E5E36',
  },
  carouselWrapper: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  carouselCard: {
    minHeight: 180,
    padding: 18,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  carouselGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(34, 197, 94, 0.22)',
  },
  carouselContent: {
    gap: 6,
    maxWidth: '92%',
    zIndex: 2,
  },
  carouselTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
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
    letterSpacing: 1.2,
    textTransform: 'uppercase',
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
  bannerCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 6,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerCtaText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
    zIndex: 2,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#22C55E',
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#1E5E36',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  marketScroll: {
    gap: 12,
    paddingVertical: 2,
  },
  marketCardMain: {
    width: 156,
    height: 165,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  marketCard: {
    width: 156,
    height: 165,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    gap: 2,
    zIndex: 2,
  },
  coinIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  coinIconText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardTokenLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E5E36',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTokenAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardPriceText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E5E36',
  },
  percentBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  percentPositive: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  percentNegative: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  actionCardWrapper: {
    width: '100%',
  },
  mineGtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 18,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  mineGtLeft: {
    gap: 4,
    flex: 1,
  },
  mineGtTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.3,
  },
  mineGtDesc: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E5E36',
  },
  mineGtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  mineGtBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  mineGtRightGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mineGtOuterRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(134, 239, 172, 0.4)',
  },
  mineGtInnerCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  mineGtCoinText: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#15803D',
  },
  referralBonusCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  auroraOrb1: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
  },
  auroraOrb2: {
    position: 'absolute',
    bottom: -30,
    right: -10,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(168, 85, 247, 0.38)',
  },
  auroraOrb3: {
    position: 'absolute',
    top: 10,
    right: 25,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(6, 182, 212, 0.22)',
  },
  referralBonusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  referralBonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  referralBonusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C084FC',
  },
  referralBonusBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#A7F3D0',
    letterSpacing: 0.8,
  },
  referralPercentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  referralPercentText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  referralBonusContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  referralBonusTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  referralBonusDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 15.5,
    maxWidth: 215,
  },
  inviteNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  inviteNowText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0A341B',
  },
  bonusOrbitalContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: 8,
  },
  orbitRingOuter: {
    position: 'absolute',
    width: 90,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.55)',
    borderStyle: 'dashed',
    transform: [{ rotate: '-20deg' }],
  },
  orbitRingInner: {
    position: 'absolute',
    width: 78,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.65)',
    transform: [{ rotate: '25deg' }],
  },
  bonusCoreGem: {
    width: 56,
    height: 56,
    borderRadius: 18,
    padding: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 4,
  },
  bonusCoreInner: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(9, 21, 29, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusCoreLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#A7F3D0',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  sparklePosition: {
    position: 'absolute',
    bottom: 2,
    left: 2,
  },
  cyanDotPosition: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
  },
  statsGrid: {
    gap: 12,
    marginVertical: 4,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  beamStatCard: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 114,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  beamCardInner: {
    gap: 6,
    justifyContent: 'space-between',
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabelText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#163D25',
    letterSpacing: -0.1,
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statMainValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: -0.4,
  },
  statMainValueDark: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.4,
  },
  statSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  upArrow: {
    fontSize: 8,
    color: '#15803D',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  statSubText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  statSubTextMuted: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1E5E36',
  },
  tasksActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 18,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  tasksLeftCol: {
    gap: 4,
    flex: 1,
  },
  tasksMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0A341B',
  },
  tasksSubTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E5E36',
  },
  tasksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  tasksButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tasksRightGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksCircleRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksCircleInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksCoinText: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#15803D',
  },
  bottomSpacer: {
    height: 30,
  },
});
