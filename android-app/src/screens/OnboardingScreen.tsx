import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  OnboardingSlide as Slide,
  DEFAULT_SLIDES,
  fetchAndCacheOnboardingBanners,
  getCachedOnboardingSlidesFromStorage,
  getMemoryOnboardingSlides,
} from '../utils/onboardingCache';

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated, demoLogin } = useAuth();
  const [loadingDemo, setLoadingDemo] = useState(false);

  // Instant 0ms render from memory cache or bundled default slides
  const [slides, setSlides] = useState<Slide[]>(() => {
    const mem = getMemoryOnboardingSlides();
    if (mem) return mem;
    return DEFAULT_SLIDES;
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);

  // Background sync for admin updated banners (never blocks or delays screen presentation)
  useEffect(() => {
    let isMounted = true;

    const syncBanners = async () => {
      // 1. Fast local storage cache check
      const cached = await getCachedOnboardingSlidesFromStorage();
      if (isMounted && cached !== null) {
        setSlides(cached);
      }

      // 2. Background live network fetch
      const live = await fetchAndCacheOnboardingBanners(3000);
      if (isMounted && live !== null) {
        setSlides(live);
      }
    };

    syncBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  // Preload and prefetch all slide images into memory
  useEffect(() => {
    slides.forEach((s) => {
      if (typeof s.image === 'object' && s.image && 'uri' in s.image && s.image.uri) {
        Image.prefetch(s.image.uri).catch(() => {});
      }
    });
  }, [slides]);

  // If user is already authenticated or if no onboarding slides exist, bypass onboarding
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('MainTabs');
    } else if (slides.length === 0) {
      navigation.replace('Auth');
    }
  }, [isAuthenticated, slides.length, navigation]);

  const proceedToNext = () => {
    if (isAuthenticated) {
      navigation.replace('MainTabs');
    } else {
      navigation.replace('Auth');
    }
  };

  // Auto story progress
  useEffect(() => {
    if (isHolding || isAuthenticated || slides.length === 0) return;

    const timer = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          if (currentIdx < slides.length - 1) {
            setCurrentIdx((c) => c + 1);
            return 0;
          } else {
            clearInterval(timer);
            proceedToNext();
            return 100;
          }
        }
        return prev + 1.25;
      });
    }, 55);

    return () => clearInterval(timer);
  }, [currentIdx, isHolding, navigation, isAuthenticated, slides.length]);

  const handleNext = () => {
    if (currentIdx < slides.length - 1) {
      setCurrentIdx((c) => c + 1);
      setSlideProgress(0);
    } else {
      proceedToNext();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((c) => c - 1);
      setSlideProgress(0);
    } else {
      setSlideProgress(0);
    }
  };

  const handleSkip = () => {
    proceedToNext();
  };

  const handleDemoLogin = async () => {
    if (loadingDemo) return;
    setLoadingDemo(true);
    try {
      await demoLogin();
      navigation.replace('MainTabs');
    } catch {
      proceedToNext();
    } finally {
      setLoadingDemo(false);
    }
  };

  const activeSlide = slides[currentIdx] || slides[0];

  return (
    <View style={styles.container}>
      {/* Emerald gradient base prevents harsh black frame before image decode */}
      <LinearGradient
        colors={['#0B3B22', '#062414', '#03150C']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Fullscreen Background Images - Pre-mounted with fadeDuration={0} to prevent black screen delay */}
      {slides.map((s, idx) => (
        <Image
          key={`bg_${s.id || idx}`}
          source={s.image}
          fadeDuration={0}
          style={[
            styles.bgImage,
            {
              opacity: idx === currentIdx ? 1 : 0,
              zIndex: idx === currentIdx ? 0 : -1,
            },
          ]}
          resizeMode="cover"
        />
      ))}

      {/* Dark cyber gradient overlay for perfect readability */}
      <View style={styles.darkGradientOverlay} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {/* Top Story Progress Bars */}
        <View style={styles.storyBarsRow}>
          {slides.map((slide, idx) => {
            let fillPct = '0%';
            if (idx < currentIdx) fillPct = '100%';
            else if (idx === currentIdx) fillPct = `${slideProgress}%`;

            return (
              <View key={slide.id} style={styles.storyBarTrack}>
                <View style={[styles.storyBarFill, { width: fillPct as any }]} />
              </View>
            );
          })}
        </View>

        {/* Top Header Row with Skip Button on Top-Right */}
        <View style={styles.topBarRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipTopBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipTopBtnText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Tap area left/right for stories navigation */}
        <View style={styles.tapGestureArea}>
          <TouchableWithoutFeedback
            onPress={handlePrev}
            onPressIn={() => setIsHolding(true)}
            onPressOut={() => setIsHolding(false)}
          >
            <View style={styles.tapLeft} />
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback
            onPress={handleNext}
            onPressIn={() => setIsHolding(true)}
            onPressOut={() => setIsHolding(false)}
          >
            <View style={styles.tapRight} />
          </TouchableWithoutFeedback>
        </View>

        {/* Content & Action Buttons at Bottom */}
        <View style={styles.bottomContent}>
          <View style={styles.textStack}>
            <Text style={styles.slideTitle}>{activeSlide.title}</Text>
            <Text style={styles.slideDescription}>{activeSlide.description}</Text>
          </View>

          {/* 1st Action Button: Continue on normal slides, Launch on last slide */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={styles.actionBtnWrapper}
          >
            <LinearGradient
              colors={['#22C55E', '#10B981', '#047857']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.launchGradient}
            >
              {/* Glossy top glass reflection highlight */}
              <View style={styles.glossHighlightEmerald} />
              <View style={styles.launchContentRow}>
                <Text style={styles.launchBtnText}>
                  {currentIdx === slides.length - 1 ? 'Launch' : 'Continue'}
                </Text>
                <ChevronRight size={20} color="#FFFFFF" strokeWidth={3} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* 2nd Action Button: Try Demo Login on normal slides, Preview on last slide */}
          <TouchableOpacity
            onPress={handleDemoLogin}
            activeOpacity={0.85}
            disabled={loadingDemo}
            style={styles.actionBtnWrapper}
          >
            <View style={styles.previewFrostedGlass}>
              {/* Subtle top reflection */}
              <View style={styles.glossHighlightFrosted} />
              <Text style={styles.previewBtnText}>
                {loadingDemo
                  ? 'Logging in...'
                  : currentIdx === slides.length - 1
                  ? 'Preview'
                  : 'Try Demo Login'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04110A',
    position: 'relative',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  darkGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 17, 10, 0.65)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },

  /* Top Bar Row */
  topBarRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    zIndex: 30,
  },
  skipTopBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  skipTopBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  /* Story Bars Row */
  storyBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 8,
    width: '100%',
    zIndex: 20,
  },
  storyBarTrack: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    overflow: 'hidden',
  },
  storyBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  /* Gesture Taps */
  tapGestureArea: {
    flex: 1,
    flexDirection: 'row',
  },
  tapLeft: {
    flex: 1,
    height: '100%',
  },
  tapRight: {
    flex: 2,
    height: '100%',
  },

  /* Bottom Content */
  bottomContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
    zIndex: 20,
  },
  textStack: {
    gap: 10,
    marginBottom: 6,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  slideDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 19,
  },

  actionBtnWrapper: {
    width: '100%',
    borderRadius: 28,
  },
  launchGradient: {
    width: '100%',
    height: 54,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(134, 239, 172, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  glossHighlightEmerald: {
    position: 'absolute',
    top: 2,
    left: 16,
    right: 16,
    height: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  launchContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
  },
  launchBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  previewFrostedGlass: {
    width: '100%',
    height: 52,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.42)',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  glossHighlightFrosted: {
    position: 'absolute',
    top: 2,
    left: 16,
    right: 16,
    height: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  previewBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    zIndex: 2,
  },
});
