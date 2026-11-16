import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { useAppSafeArea } from '../utils/safeArea';
import {
  fetchAndCacheOnboardingBanners,
  getCachedOnboardingSlidesFromStorage,
  getMemoryOnboardingSlides,
} from '../utils/onboardingCache';
import {
  fetchAndCacheHomeBanners,
  getCachedHomeBannersFromStorage,
} from '../utils/homeBannerCache';

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated, isSessionLoaded } = useAuth();
  const { top, bottom } = useAppSafeArea();

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING NODE...');
  const [bannersReady, setBannersReady] = useState<boolean>(() => Boolean(getMemoryOnboardingSlides()?.length));

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const navigatedRef = useRef(false);

  // Pulse floating animation + preload live onboarding banners
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    let active = true;
    // Prime both onboarding sliders & home carousel banners + prefetch their images during Splash
    getCachedOnboardingSlidesFromStorage().catch(() => null);
    getCachedHomeBannersFromStorage().catch(() => null);

    Promise.allSettled([
      fetchAndCacheOnboardingBanners(4500),
      fetchAndCacheHomeBanners(4500),
    ]).finally(() => {
      if (active) setBannersReady(true);
    });

    // Safety fallback so Splash never blocks longer than 5s if completely offline
    const fallbackTimer = setTimeout(() => {
      if (active) setBannersReady(true);
    }, 5000);

    return () => {
      active = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  const proceedNavigation = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    if (isAuthenticated) {
      // User is already logged in -> go straight to main app dashboard
      navigation.replace('MainTabs');
    } else {
      // User is not logged in -> show onboarding tour slides
      navigation.replace('Onboarding');
    }
  };

  // Smooth loading progression from 0 to 100%, holding at 100% until banners & session resolve
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        const next = prev + 3;
        if (next > 30 && next < 60) setStatusText('CONNECTING NODES & PEERS...');
        else if (next >= 60 && next < 85) setStatusText('SYNCING 4H EPOCH LEDGER...');
        else if (next >= 85) setStatusText('PROTOCOL ACTIVE & READY');
        return next > 100 ? 100 : next;
      });
    }, 65);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100 && bannersReady && isSessionLoaded) {
      const t = setTimeout(() => {
        proceedNavigation();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [progress, bannersReady, isSessionLoaded, isAuthenticated, navigation]);

  const handleSkip = () => {
    if (bannersReady || isAuthenticated) {
      proceedNavigation();
    } else {
      // Finish live fetch quickly before showing Onboarding so hardcoded slides never flash
      Promise.race([
        fetchAndCacheOnboardingBanners(2500),
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]).finally(() => {
        proceedNavigation();
      });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleSkip}
      style={styles.container}
    >
      {/* Website Mint Ambient Corner Glows (Clean aesthetic - no circular radar lines) */}
      <View style={styles.ambientTopGlow} pointerEvents="none" />
      <View style={styles.ambientBottomGlow} pointerEvents="none" />

      <View style={[styles.safeArea, { paddingTop: top, paddingBottom: bottom + 16 }]}>
        {/* Top Header Row (Frosted Glass Skip Button) */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.75}>
            <Text style={styles.skipBtnText}>Skip ›</Text>
          </TouchableOpacity>
        </View>

        {/* Center: Glowing 3D Crystal Logo with GT NETWORK Branding */}
        <View style={styles.centerContainer}>
          {/* Subtle Ambient Radial Glow */}
          <View style={styles.ambientLogoGlow} />

          {/* Central Animated Crystal Logo */}
          <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <Image
              source={require('../../assets/gt-logo.png')}
              style={styles.crystalLogo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Main Title: GT NETWORK (Clean brand title matching website) */}
          <View style={styles.titleWrapper}>
            <View style={styles.titleRow}>
              <Text style={styles.titleDark}>GT </Text>
              <Text style={styles.titleGreen}>NETWORK</Text>
            </View>
          </View>
        </View>

        {/* Bottom Loading Progress Bar (Frosted Glass Website Aesthetic) */}
        <View style={styles.bottomContainer}>
          <View style={styles.progressLabelRow}>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
            <Text style={styles.percentText}>{progress}%</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.tapPrompt}>Tap anywhere to continue</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8EE',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientTopGlow: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(74, 222, 128, 0.28)',
  },
  ambientBottomGlow: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(134, 239, 172, 0.32)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    zIndex: 1,
  },

  /* Top Row */
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingTop: 6,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#005232',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  skipBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },

  /* Center */
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 'auto',
  },
  ambientLogoGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
  },
  logoWrapper: {
    width: 115,
    height: 115,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#0A341B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
  },
  crystalLogo: {
    width: '100%',
    height: '100%',
  },
  titleWrapper: {
    alignItems: 'center',
    marginTop: 22,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleDark: {
    fontSize: 27,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 2,
  },
  titleGreen: {
    fontSize: 27,
    fontWeight: '900',
    color: '#16A34A',
    letterSpacing: 2.5,
  },

  /* Bottom Container */
  bottomContainer: {
    width: '100%',
    paddingBottom: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0A341B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  percentText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#16A34A',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(22, 101, 52, 0.12)',
    padding: 1,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 3,
  },
  tapPrompt: {
    fontSize: 11.5,
    color: '#1E5E36',
    opacity: 0.75,
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '700',
  },
});
