import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { isAuthenticated } = useAuth();

  const [slides, setSlides] = useState<Slide[]>(() => getMemoryOnboardingSlides() || []);
  const [isLoadingSlides, setIsLoadingSlides] = useState<boolean>(
    () => !(getMemoryOnboardingSlides() && getMemoryOnboardingSlides()!.length > 0)
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);

  // Synchronize live pre-opening banners from server in strict admin order (never flash hardcoded first)
  useEffect(() => {
    let isMounted = true;

    const loadOrderedBanners = async () => {
      let hasResolvedSlides = Boolean(getMemoryOnboardingSlides()?.length);

      if (!hasResolvedSlides) {
        const cached = await getCachedOnboardingSlidesFromStorage();
        if (isMounted && cached && cached.length > 0) {
          setSlides(cached);
          setIsLoadingSlides(false);
          hasResolvedSlides = true;
        }
      }

      const live = await fetchAndCacheOnboardingBanners(4500);
      if (!isMounted) return;

      if (live && live.length > 0) {
        setSlides(live);
        setIsLoadingSlides(false);
        hasResolvedSlides = true;
      } else if (!hasResolvedSlides) {
        // Offline with zero cache fallback
        setSlides(DEFAULT_SLIDES);
        setIsLoadingSlides(false);
      }
    };

    loadOrderedBanners();
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

  // If user is already authenticated, bypass onboarding and go directly to main app
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('MainTabs');
    }
  }, [isAuthenticated, navigation]);

  const proceedToNext = () => {
    if (isAuthenticated) {
      navigation.replace('MainTabs');
    } else {
      navigation.replace('Auth');
    }
  };

  // Auto story progress
  useEffect(() => {
    if (isHolding || isAuthenticated || isLoadingSlides || slides.length === 0) return;

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
  }, [currentIdx, isHolding, navigation, isAuthenticated, isLoadingSlides, slides.length]);

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

  if (isLoadingSlides || slides.length === 0) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  const activeSlide = slides[currentIdx] || slides[0];

  return (
    <View style={styles.container}>
      {/* Fullscreen Background Images - Pre-mounted to prevent black screen delay */}
      {slides.map((s, idx) => (
        <Image
          key={`bg_${s.id || idx}`}
          source={s.image}
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

          {/* Continue Action Button */}
          <TouchableOpacity
            onPress={handleNext}
            style={styles.continueBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.skipBtnText}>Skip</Text>
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

  continueBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 26,
    backgroundColor: '#091520',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  skipBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  skipBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
