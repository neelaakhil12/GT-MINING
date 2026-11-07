import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: number;
  title: string;
  description: string;
  image: any;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Automated 4-Hour Mining Engine',
    description:
      'Activate your mining node with 1 tap. Mine virtual GT coins effortlessly on your mobile device or web browser.',
    image: require('../../assets/onboarding/story_1.jpg'),
  },
  {
    id: 2,
    title: "Recognized by the world's largest stock exchange",
    description:
      'The modern blockchain protocol built for institutional transparency and verifiable distributed ledgers.',
    image: require('../../assets/onboarding/story_2.jpg'),
  },
  {
    id: 3,
    title: 'Autonomous 10% Yield Accrual',
    description:
      'Receive instant lifetime mining commissions whenever your peer network and invited nodes finalize cycles.',
    image: require('../../assets/onboarding/story_3.jpg'),
  },
  {
    id: 4,
    title: 'Powered by Visa & Mastercard',
    description:
      'Global payment cards accepted in more than 150 countries for seamless everyday crypto liquidity.',
    image: require('../../assets/onboarding/story_4.png'),
  },
  {
    id: 5,
    title: 'Instant Direct Wallet Claims',
    description:
      'Accumulate GT coin yields and claim your rewards directly to your personal wallet vault with zero gas fees.',
    image: require('../../assets/onboarding/story_5.jpg'),
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuth();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);

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
    if (isHolding || isAuthenticated) return;

    const timer = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          if (currentIdx < SLIDES.length - 1) {
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
  }, [currentIdx, isHolding, navigation, isAuthenticated]);

  const handleNext = () => {
    if (currentIdx < SLIDES.length - 1) {
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

  const activeSlide = SLIDES[currentIdx];

  return (
    <View style={styles.container}>
      {/* Fullscreen Background Image */}
      <Image
        source={activeSlide.image}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* Dark cyber gradient overlay for perfect readability */}
      <View style={styles.darkGradientOverlay} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {/* Top Story Progress Bars */}
        <View style={styles.storyBarsRow}>
          {SLIDES.map((slide, idx) => {
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
