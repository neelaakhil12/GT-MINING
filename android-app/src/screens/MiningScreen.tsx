import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { useIsFocused } from '@react-navigation/native';
import {
  Pickaxe,
  Zap,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  Target,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { OrbBackground } from '../components/OrbBackground';
import { AppNavbar } from '../components/AppNavbar';
import { MiningGlobe3D } from '../components/MiningGlobe3D';
import { useAppSafeArea } from '../utils/safeArea';
import { API_BASE_URL } from '../config/api';
import { appStorage } from '../utils/storage';
import * as Haptics from 'expo-haptics';

export const MiningScreen: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const { top, tabContentPaddingBottom } = useAppSafeArea();
  const isFocused = useIsFocused();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [isFastSpinning, setIsFastSpinning] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Dynamic mining config from server
  const [cycleHours, setCycleHours] = useState<number>(2);
  const [cooldownSec, setCooldownSec] = useState<number>(7200);
  const [rewardAmount, setRewardAmount] = useState<number>(1.0);
  const [userMiningTarget, setUserMiningTarget] = useState<number>(1000);

  // Authoritative session states
  const [nextEligibleAt, setNextEligibleAt] = useState<string | null>(null);
  const [lastMiningAt, setLastMiningAt] = useState<string | null>(null);
  const [countdownSec, setCountdownSec] = useState<number>(0);
  const [isEligible, setIsEligible] = useState<boolean>(true);

  // Non-intrusive notification toast
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Fetch authoritative mining status and config from server
  const fetchStatus = useCallback(async () => {
    try {
      const token = await appStorage.getItem('gt_mobile_token');

      // 1. Fetch public config
      fetch(`${API_BASE_URL}/mining/config`)
        .then((r) => r.json())
        .then((cfg) => {
          if (cfg && cfg.success) {
            if (cfg.cycleHours) setCycleHours(Number(cfg.cycleHours));
            if (cfg.cooldownSeconds) setCooldownSec(Number(cfg.cooldownSeconds));
            if (cfg.miningReward) setRewardAmount(Number(cfg.miningReward));
            if (cfg.userMiningTarget) setUserMiningTarget(Number(cfg.userMiningTarget));
          }
        })
        .catch(() => {});

      // 2. Fetch authenticated mining status
      if (token) {
        const res = await fetch(`${API_BASE_URL}/mining/status`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data && data.success) {
          if (data.cycleHours) setCycleHours(Number(data.cycleHours));
          if (data.cooldownSeconds) setCooldownSec(Number(data.cooldownSeconds));
          if (data.rewardPerClaim) setRewardAmount(Number(data.rewardPerClaim));
          if (data.userMiningTarget) setUserMiningTarget(Number(data.userMiningTarget));

          setLastMiningAt(data.lastMiningAt || null);
          setNextEligibleAt(data.nextEligibleAt || null);

          if (data.nextEligibleAt) {
            const diff = Math.max(
              0,
              Math.ceil((new Date(data.nextEligibleAt).getTime() - Date.now()) / 1000)
            );
            setCountdownSec(diff);
            setIsEligible(diff <= 0 && Boolean(data.isEligible));
            appStorage.setItem('gt_next_eligible_at', data.nextEligibleAt).catch(() => {});
          } else {
            setCountdownSec(0);
            setIsEligible(Boolean(data.isEligible));
          }
        }
      } else {
        // Fallback from local storage if offline/no token
        const cachedNext = await appStorage.getItem('gt_next_eligible_at');
        if (cachedNext) {
          setNextEligibleAt(cachedNext);
          const diff = Math.max(
            0,
            Math.ceil((new Date(cachedNext).getTime() - Date.now()) / 1000)
          );
          setCountdownSec(diff);
          setIsEligible(diff <= 0);
        }
      }
    } catch (e) {
      console.warn('Error fetching mining status:', e);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchStatus();
    }
  }, [isFocused, fetchStatus]);

  // Real-time ticking countdown based on actual timestamp
  useEffect(() => {
    const timer = setInterval(() => {
      if (nextEligibleAt) {
        const diff = Math.max(
          0,
          Math.ceil((new Date(nextEligibleAt).getTime() - Date.now()) / 1000)
        );
        setCountdownSec(diff);
        if (diff <= 0) {
          setIsEligible(true);
        }
      } else {
        setCountdownSec((prev) => {
          if (prev <= 1) {
            setIsEligible(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextEligibleAt]);

  // Auto-dismiss floating toast
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

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

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  };

  const userTotalMined = Number(user?.totalMined ?? user?.balance ?? 0);
  const isTargetCompleted = userTotalMined >= userMiningTarget;

  const handleClaimOrMine = async () => {
    if (claiming) return;

    if (isTargetCompleted) {
      setToastMessage({
        title: 'Mining Target Completed!',
        message: `Maximum lifetime limit of ${userMiningTarget.toLocaleString()} GT reached for this account.`,
      });
      return;
    }

    if (!isEligible || countdownSec > 0) {
      setToastMessage({
        title: 'Mining Cooldown Active',
        message: `Session currently active. Next claim in ${formatCountdown(countdownSec)}.`,
      });
      return;
    }

    // Smoothly scroll to the top where the 3D globe animation is located
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setIsFastSpinning(true);
    setTimeout(() => {
      setIsFastSpinning(false);
    }, 3200);

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (e) {}

    setClaiming(true);
    try {
      const token = await appStorage.getItem('gt_mobile_token');
      if (!token) {
        // Guest / demo claim fallback
        setIsEligible(false);
        setCountdownSec(cooldownSec);
        setToastMessage({
          title: 'Mining Block Verified!',
          message: `+${rewardAmount.toFixed(2)} GT added to your balance.`,
        });
        return;
      }

      const res = await fetch(`${API_BASE_URL}/mining/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data && data.success) {
        setIsEligible(false);
        const rem = data.miningState?.remainingSeconds || cooldownSec;
        setCountdownSec(rem);
        if (data.miningState?.nextEligibleAt) {
          setNextEligibleAt(data.miningState.nextEligibleAt);
          appStorage.setItem('gt_next_eligible_at', data.miningState.nextEligibleAt).catch(() => {});
        }
        setLastMiningAt(new Date().toISOString());

        // Sleek non-intrusive floating toast notification without blocking the globe!
        setToastMessage({
          title: 'Mining Block Verified!',
          message: `+${(data.claimedAmount || rewardAmount).toFixed(2)} GT added to your balance.`,
        });

        // Refresh user wallet data from server
        refreshUserData();
      } else {
        setToastMessage({
          title: 'Claim Notice',
          message: data?.message || 'Cooldown is active. Please wait for cycle to finish.',
        });
      }
    } catch (err: any) {
      setToastMessage({
        title: 'Connection Error',
        message: 'Could not sync claim with server. Please check internet connection.',
      });
    } finally {
      setClaiming(false);
    }
  };

  // Progress percentage (Dynamic cycle duration from backend)
  const totalCycleSec = cooldownSec || 7200;
  const elapsedSec = Math.max(0, totalCycleSec - countdownSec);
  const progressPct = isEligible ? 100 : Math.min(100, Math.max(5, (elapsedSec / totalCycleSec) * 100));

  const sessionStartedTime = lastMiningAt || (user as any)?.lastMiningAt
    ? new Date(lastMiningAt || (user as any)?.lastMiningAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : 'Active';

  const estimatedSettlementTime = nextEligibleAt
    ? new Date(nextEligibleAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : `${cycleHours} Hours from start`;

  return (
    <View style={styles.container}>
      <OrbBackground />

      <View style={[styles.safeArea, { paddingTop: top }]}>
        {/* Universal Top Navbar */}
        <AppNavbar activeTab="App" />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabContentPaddingBottom + 65 }]}
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
                <View style={[styles.smallGreenPulse, isEligible && { backgroundColor: '#FBBF24' }]} />
                <Text style={styles.pillBadgeText}>{isEligible ? 'Claim Ready' : 'Mining Active'}</Text>
              </View>

              <View style={styles.ratePillBadge}>
                <Text style={styles.rateBadgeText}>Rate: +{rewardAmount.toFixed(2)} GT / {cycleHours}h</Text>
              </View>
            </View>

            {/* 3D Segmented Mint-Green Cube Globe matching website */}
            <View style={{ width: '100%', height: 235, marginVertical: -6, alignItems: 'center', justifyContent: 'center' }}>
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

            {/* Account Mining Target Cap Progress */}
            <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Target size={13} color="#F59E0B" />
                  <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#1E5E36', letterSpacing: 0.5 }}>ACCOUNT MINING TARGET</Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: isTargetCompleted ? '#D97706' : '#15803D' }}>
                  {userTotalMined.toFixed(1)} / {userMiningTarget.toLocaleString()} GT
                </Text>
              </View>
              <View style={{ width: '100%', height: 6, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <LinearGradient
                  colors={isTargetCompleted ? ['#F59E0B', '#FBBF24'] : ['#22C55E', '#16A34A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: `${Math.min(100, (userTotalMined / userMiningTarget) * 100)}%`, height: '100%', borderRadius: 3 }}
                />
              </View>
              {isTargetCompleted && (
                <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#D97706', textAlign: 'center', marginTop: 4 }}>
                  Target completed ({userMiningTarget.toLocaleString()} GT limit). Mining locked for this account.
                </Text>
              )}
            </View>
          </View>

          {/* 4. MINING SESSION Card matching website mobile view */}
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeaderRow}>
              <Text style={styles.sessionTitle}>MINING SESSION</Text>
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>
                  {formatCountdown(countdownSec)}
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
              <Text style={styles.cycleRewardBadgeText}>Cycle Reward +{rewardAmount.toFixed(2)} GT</Text>
            </View>

            <View style={styles.dashedDivider} />

            {/* Timestamps */}
            <View style={styles.timestampsGrid}>
              <View style={styles.timestampCol}>
                <Text style={styles.timestampLabel}>SESSION STARTED</Text>
                <Text style={styles.timestampValue}>{sessionStartedTime}</Text>
              </View>
              <View style={styles.timestampCol}>
                <Text style={styles.timestampLabel}>ESTIMATED SETTLEMENT</Text>
                <Text style={styles.timestampValue}>{estimatedSettlementTime}</Text>
              </View>
            </View>
          </View>

          {/* 5. Mining Action Button */}
          <View style={styles.actionBtnSection}>
            <TouchableOpacity
              onPress={handleClaimOrMine}
              disabled={false}
              activeOpacity={0.88}
              style={[
                styles.mainMiningActionBtn,
                !isEligible && !isTargetCompleted && { opacity: 0.75 }
              ]}
            >
              <LinearGradient
                colors={
                  isTargetCompleted
                    ? ['#D97706', '#B45309']
                    : isEligible
                    ? ['#22C55E', '#16A34A']
                    : ['#374151', '#1F2937']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.mainMiningGradient}
              >
                {isTargetCompleted ? (
                  <Lock size={18} color="#FEF3C7" />
                ) : isEligible ? (
                  <Pickaxe size={18} color="#FFFFFF" />
                ) : (
                  <Clock size={18} color="#9CA3AF" />
                )}
                <Text
                  style={[
                    styles.mainMiningBtnText,
                    isTargetCompleted && { color: '#FEF3C7' },
                    !isEligible && !isTargetCompleted && { color: '#E5E7EB' }
                  ]}
                >
                  {isTargetCompleted
                    ? `Target Completed (${userTotalMined.toFixed(0)}/${userMiningTarget.toLocaleString()} GT)`
                    : isEligible
                    ? `Activate ${cycleHours}-Hour Mining (+${rewardAmount.toFixed(1)} GT)`
                    : `Mining Active (${formatCountdown(countdownSec)})`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.actionHintText}>
              {isTargetCompleted
                ? `Mining target reached (${userMiningTarget.toLocaleString()} GT limit). Tap above to view details.`
                : isEligible
                ? `Tap above to activate ${cycleHours}-hour mining session and test live block animation`
                : `Mining session in progress. Next claim unlock in ${formatCountdown(countdownSec)}`}
            </Text>
          </View>
        </ScrollView>

        {/* Non-intrusive Floating Toast Notification (never blocks or covers the 3D globe!) */}
        {toastMessage && (
          <View style={styles.floatingToastWrapper} pointerEvents="none">
            <View style={styles.floatingToastCard}>
              <CheckCircle2 size={18} color="#16A34A" />
              <View style={{ flex: 1 }}>
                <Text style={styles.floatingToastTitle}>{toastMessage.title}</Text>
                <Text style={styles.floatingToastBody}>{toastMessage.message}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
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
  floatingToastWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: 'center',
  },
  floatingToastCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingToastTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0A341B',
  },
  floatingToastBody: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#166534',
    marginTop: 1,
  },
});
