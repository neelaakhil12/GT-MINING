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

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated, isSessionLoaded } = useAuth();

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING NODE...');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulse & slow rotation animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
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

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 25000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const proceedNavigation = () => {
    if (isAuthenticated) {
      // User is already logged in -> go straight to main app dashboard
      navigation.replace('MainTabs');
    } else {
      // User is not logged in -> show onboarding tour slides
      navigation.replace('Onboarding');
    }
  };

  // Smooth loading progression from 0 to 100%
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            proceedNavigation();
          }, 250);
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
  }, [navigation, isAuthenticated, isSessionLoaded]);

  const handleSkip = () => {
    proceedNavigation();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleSkip}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {/* Top Header Row (Skip Button on top right, V2.6 protocol removed) */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.75}>
            <Text style={styles.skipBtnText}>Skip ›</Text>
          </TouchableOpacity>
        </View>

        {/* Center: Glowing 3D Crystal Logo with Holographic Radar Rings */}
        <View style={styles.centerContainer}>
          {/* Subtle Ambient Radial Glow */}
          <View style={styles.ambientGlow} />

          {/* Holographic Radar Concentric Rings */}
          <Animated.View style={[styles.radarRingOuter, { transform: [{ rotate: spin }] }]} />
          <View style={styles.radarRingMid} />
          <View style={styles.radarRingInner} />

          {/* Central Animated Crystal Logo */}
          <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <Image
              source={require('../../assets/gt-logo.png')}
              style={styles.crystalLogo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Main Titles */}
          <View style={styles.titleWrapper}>
            <Text style={styles.titleWhite}>GT MINING</Text>
            <Text style={styles.titleGreen}>NETWORK</Text>
            <Text style={styles.tagline}>
              AUTONOMOUS DECENTRALIZED CLOUD PROTOCOL
            </Text>
          </View>
        </View>

        {/* Bottom Loading Progress Bar */}
        <View style={styles.bottomContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.statusText}>{statusText}</Text>
            <Text style={styles.percentText}>{progress}%</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.tapPrompt}>Tap anywhere to continue</Text>
        </View>
      </SafeAreaView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021308',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#86EFAC',
  },

  /* Center */
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 'auto',
  },
  ambientGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  radarRingOuter: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
    borderStyle: 'dashed',
  },
  radarRingMid: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.20)',
  },
  radarRingInner: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  logoWrapper: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  crystalLogo: {
    width: '100%',
    height: '100%',
  },
  titleWrapper: {
    alignItems: 'center',
    marginTop: 24,
    zIndex: 10,
  },
  titleWhite: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    lineHeight: 32,
  },
  titleGreen: {
    fontSize: 30,
    fontWeight: '900',
    color: '#22C55E',
    letterSpacing: 3,
    lineHeight: 36,
  },
  tagline: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 1.2,
    marginTop: 8,
    textAlign: 'center',
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
    marginBottom: 8,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  percentText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#4ADE80',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  tapPrompt: {
    fontSize: 11,
    color: '#4ADE80',
    opacity: 0.65,
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '600',
  },
});
