import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Cpu, Clock, ShieldCheck, Activity } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { OrbBackground } from '../components/OrbBackground';
import * as Haptics from 'expo-haptics';

export const MiningScreen: React.FC = () => {
  const { miningStats, isMiningActive, startMiningSession } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for active mining node
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

    // Slow continuous ring rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      // Haptics fallback
    }
    startMiningSession();
  };

  return (
    <View style={styles.container}>
      <OrbBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PROTOCOL MINING</Text>
          <Text style={styles.headerSubtitle}>
            Continuous PoA hardware-backed 4-hour mining cycle
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Large 3D Mining Node Pulse */}
          <View style={styles.miningHeroCard}>
            <View style={styles.nodeCircleWrapper}>
              {/* Outer rotating decorative ring */}
              <Animated.View
                style={[
                  styles.outerDashedRing,
                  {
                    transform: [{ rotate: spin }],
                  },
                ]}
              />

              {/* Glowing Pulse Ring */}
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#86EFAC', '#22C55E', '#15803D']}
                  style={styles.pulseRingGradient}
                />
              </Animated.View>

              {/* Center Core Coin */}
              <View style={styles.coreNode}>
                <LinearGradient
                  colors={['#0A341B', '#124225']}
                  style={styles.coreNodeGradient}
                >
                  <Text style={styles.gtCoreText}>GT</Text>
                  <Text style={styles.gtNodeText}>NODE L1</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Countdown Timer */}
            <View style={styles.timerContainer}>
              <View style={styles.timerBadge}>
                <Clock size={14} color="#15803D" style={{ marginRight: 6 }} />
                <Text style={styles.timerLabel}>4-HOUR CYCLE TIME LEFT</Text>
              </View>
              <Text style={styles.timerDigits}>
                {formatTime(miningStats.cycleRemainingSeconds)}
              </Text>
            </View>

            {/* Start Mining Action Button */}
            <TouchableOpacity
              onPress={handleStartSession}
              disabled={isMiningActive}
              activeOpacity={0.88}
              style={[
                styles.mineButton,
                isMiningActive && styles.mineButtonActive,
              ]}
            >
              <LinearGradient
                colors={
                  isMiningActive
                    ? ['#15803D', '#0A341B']
                    : ['#22C55E', '#15803D']
                }
                style={styles.mineButtonGradient}
              >
                <Zap
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                  fill={isMiningActive ? '#FFFFFF' : 'none'}
                />
                <Text style={styles.mineButtonText}>
                  {isMiningActive
                    ? 'MINING SESSION ACTIVE'
                    : 'START 4-HOUR SESSION'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 2. Mining Performance Gauges */}
          <View style={styles.gaugesCard}>
            <Text style={styles.sectionTitle}>REAL-TIME METRICS</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Cpu size={16} color="#15803D" />
                <Text style={styles.metricLabel}>Hash Rate</Text>
                <Text style={styles.metricValue}>{miningStats.hashRate}</Text>
              </View>

              <View style={styles.metricBox}>
                <Activity size={16} color="#15803D" />
                <Text style={styles.metricLabel}>Session Earned</Text>
                <Text style={styles.metricValue}>
                  +{miningStats.sessionEarned} GT
                </Text>
              </View>

              <View style={styles.metricBox}>
                <ShieldCheck size={16} color="#15803D" />
                <Text style={styles.metricLabel}>Uptime</Text>
                <Text style={styles.metricValue}>{miningStats.uptime}</Text>
              </View>

              <View style={styles.metricBox}>
                <Zap size={16} color="#15803D" />
                <Text style={styles.metricLabel}>Online Nodes</Text>
                <Text style={styles.metricValue}>
                  {miningStats.nodesOnline.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8EE',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803D',
    marginTop: 3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  miningHeroCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  nodeCircleWrapper: {
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 14,
  },
  outerDashedRing: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    borderStyle: 'dashed',
  },
  pulseRing: {
    position: 'absolute',
    width: 138,
    height: 138,
    borderRadius: 69,
    padding: 3,
  },
  pulseRingGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 69,
    opacity: 0.85,
  },
  coreNode: {
    width: 108,
    height: 108,
    borderRadius: 54,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#0A341B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  coreNodeGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gtCoreText: {
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#86EFAC',
    letterSpacing: -1,
  },
  gtNodeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DCFCE7',
    letterSpacing: 1,
    marginTop: 2,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 6,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  timerDigits: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0A341B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.5,
  },
  mineButton: {
    width: '100%',
    height: 52,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  mineButtonActive: {
    shadowColor: '#15803D',
  },
  mineButtonGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mineButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  gaugesCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#F0FAF3',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCF2E4',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
    marginTop: 2,
  },
});

