import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Pickaxe,
  Zap,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { OrbBackground } from '../components/OrbBackground';
import { AppNavbar } from '../components/AppNavbar';
import { MiningGlobe3D } from '../components/MiningGlobe3D';
import * as Haptics from 'expo-haptics';

export const MiningScreen: React.FC = () => {
  const { user, miningStats, isMiningActive, startMiningSession } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [isFastSpinning, setIsFastSpinning] = useState(false);

  useEffect(() => {
    // Pulse animation for active mining node
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    // Slow continuous ring rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  };

  const isEligible = !isMiningActive || miningStats.cycleRemainingSeconds <= 0;

  const handleClaimOrMine = () => {
    if (!isEligible) {
      Alert.alert(
        'Mining Cooldown Active',
        `Your mining session is currently active. Next claim available in ${formatCountdown(
          miningStats.cycleRemainingSeconds
        )}.`
      );
      return;
    }

    // Smoothly scroll to the top where the globe animation is located
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setIsFastSpinning(true);
    setTimeout(() => {
      setIsFastSpinning(false);
    }, 3000);

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (e) {}

    startMiningSession();
    Alert.alert('Mining Block Verified!', '+1.00 GT added to your balance.');
  };

  // Progress percentage (4 hours = 14400s)
  const totalCycleSec = 14400;
  const elapsedSec = Math.max(0, totalCycleSec - miningStats.cycleRemainingSeconds);
  const progressPct = Math.min(100, Math.max(5, (elapsedSec / totalCycleSec) * 100));

  return (
    <View style={styles.container}>
      <OrbBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Universal Top Navbar */}
        <AppNavbar activeTab="App" />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Header Bar: GT NETWORK / ECO LAYER-2 matching website */}
          <View style={styles.networkSubHeader}>
            <View style={styles.brandRow}>
              <View style={styles.emeraldGlowDot} />
              <Text style={styles.brandText}>GT NETWORK</Text>
            </View>
            <View style={styles.layerBadge}>
              <Text style={styles.layerText}>ECO LAYER-2</Text>
            </View>
          </View>

          {/* 2. Globe / Node Centerpiece Card matching website */}
          <View style={styles.centerpieceCard}>
            {/* Top Badges in Glassy Mode */}
            <View style={styles.topBadgesRow}>
              <View style={styles.activePillBadge}>
                <View style={styles.smallGreenPulse} />
                <Text style={styles.pillBadgeText}>Mining Active</Text>
              </View>

              <View style={styles.ratePillBadge}>
                <Text style={styles.rateBadgeText}>Rate: +24.00 GT / 4h</Text>
              </View>
            </View>

            {/* 3D Segmented Mint-Green Cube Globe matching video */}
            <View style={{ marginVertical: -10, alignItems: 'center', justifyContent: 'center' }}>
              <MiningGlobe3D spinning={isFastSpinning} />
            </View>
          </View>

          {/* 3. TOTAL GT BALANCE Card matching website */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeaderRow}>
              <Text style={styles.balanceCardTitle}>TOTAL GT BALANCE</Text>
              <View style={styles.confirmedBadge}>
                <CheckCircle2 size={12} color="#16A34A" />
                <Text style={styles.confirmedText}>Confirmed</Text>
              </View>
            </View>

            <View style={styles.balanceAmountRow}>
              <Text style={styles.balanceAmountNumber}>
                {Number(user?.balance ?? 0.0).toFixed(2)}
              </Text>
              <Text style={styles.gtUnit}>GT</Text>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.balanceSplitRow}>
              <View style={styles.balanceSplitCol}>
                <Text style={styles.splitLabel}>Available Balance</Text>
                <Text style={styles.splitValueDark}>
                  {Number(user?.balance ?? 0.0).toFixed(2)} GT
                </Text>
              </View>
              <View style={styles.balanceSplitCol}>
                <Text style={styles.splitLabel}>Mining Rewards Earned</Text>
                <Text style={styles.splitValueGreen}>
                  +{Number(user?.totalMined ?? user?.balance ?? 0.0).toFixed(2)} GT
                </Text>
              </View>
            </View>
          </View>

          {/* 4. MINING SESSION Card matching website mobile view */}
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeaderRow}>
              <Text style={styles.sessionTitle}>MINING SESSION</Text>
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>
                  {formatCountdown(miningStats.cycleRemainingSeconds)}
                </Text>
              </View>
            </View>

            {/* Progress Track */}
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={['#22C55E', '#16A34A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${progressPct}%` }]}
              />
            </View>

            {/* Sub-stats row */}
            <View style={styles.cycleSubRow}>
              <Text style={styles.progressPercentText}>
                Progress <Text style={styles.boldPercentText}>{progressPct.toFixed(1)}%</Text>
              </Text>
              <Text style={styles.cycleRewardBadgeText}>Cycle Reward +24.00 GT</Text>
            </View>

            <View style={styles.dashedDivider} />

            {/* Timestamps */}
            <View style={styles.timestampsGrid}>
              <View style={styles.timestampCol}>
                <Text style={styles.timestampLabel}>SESSION STARTED</Text>
                <Text style={styles.timestampValue}>05:16:58 PM</Text>
              </View>
              <View style={styles.timestampCol}>
                <Text style={styles.timestampLabel}>ESTIMATED SETTLEMENT</Text>
                <Text style={styles.timestampValue}>09:16:58 PM</Text>
              </View>
            </View>
          </View>

          {/* 5. Mining Action Button */}
          <View style={styles.actionBtnSection}>
            <TouchableOpacity
              onPress={handleClaimOrMine}
              disabled={!isEligible}
              activeOpacity={isEligible ? 0.88 : 1}
              style={[
                styles.mainMiningActionBtn,
                !isEligible && { opacity: 0.75 }
              ]}
            >
              <LinearGradient
                colors={
                  isEligible
                    ? ['#22C55E', '#16A34A']
                    : ['#374151', '#1F2937']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.mainMiningGradient}
              >
                {isEligible ? (
                  <Pickaxe size={18} color="#FFFFFF" />
                ) : (
                  <Clock size={18} color="#9CA3AF" />
                )}
                <Text
                  style={[
                    styles.mainMiningBtnText,
                    !isEligible && { color: '#E5E7EB' }
                  ]}
                >
                  {isEligible
                    ? 'Activate 4-Hour Mining (+1.0 GT)'
                    : `Mining Active (${formatCountdown(miningStats.cycleRemainingSeconds)})`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.actionHintText}>
              {isEligible
                ? 'Tap above to activate mining session and test live block animation'
                : `Mining session in progress. Next claim unlock in ${formatCountdown(miningStats.cycleRemainingSeconds)}`}
            </Text>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  networkSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emeraldGlowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 3,
  },
  brandText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
  },
  layerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  layerText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.6,
  },

  // Centerpiece Card
  centerpieceCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  topBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  activePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  smallGreenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  pillBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0A341B',
  },
  ratePillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  rateBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  nodeWrapper: {
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  ambientHalo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(34, 197, 94, 0.22)',
  },
  outerRotatingRing: {
    position: 'absolute',
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(34, 197, 94, 0.55)',
  },
  pulsingCore: {
    width: 114,
    height: 114,
    borderRadius: 57,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  coreGradient: {
    width: 114,
    height: 114,
    borderRadius: 57,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#071F13',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLogo: {
    width: 60,
    height: 60,
  },
  nodeSubCaption: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E5E36',
    marginTop: 4,
  },

  // Total GT Balance Card
  balanceCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceCardTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1E5E36',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confirmedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 6,
  },
  balanceAmountNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.5,
  },
  gtUnit: {
    fontSize: 18,
    fontWeight: '900',
    color: '#15803D',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 10,
  },
  balanceSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceSplitCol: {
    flex: 1,
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E5E36',
  },
  splitValueDark: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
    marginTop: 2,
  },
  splitValueGreen: {
    fontSize: 14,
    fontWeight: '900',
    color: '#15803D',
    marginTop: 2,
  },

  // Mining Session Card
  sessionCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
  },
  countdownBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#15803D',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.8,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  cycleSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressPercentText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E5E36',
  },
  boldPercentText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A341B',
  },
  cycleRewardBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803D',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  timestampsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timestampCol: {
    flex: 1,
  },
  timestampLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1E5E36',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  timestampValue: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0A341B',
    marginTop: 2,
  },
  actionBtnSection: {
    gap: 8,
    marginBottom: 16,
  },
  mainMiningActionBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  mainMiningGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
  },
  mainMiningBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  actionHintText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E5E36',
    textAlign: 'center',
  },
});
