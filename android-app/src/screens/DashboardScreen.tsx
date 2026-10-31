import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  User as UserIcon,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Gift,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { GtCoinOrbit } from '../components/GtCoinOrbit';
import { OrbBackground } from '../components/OrbBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const { user, miningStats, isMiningActive } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <OrbBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* 1. Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.brandTitle}>GT NETWORK</Text>
            {/* Live user greeting as updated in web */}
            <Text style={styles.userGreeting}>
              {user?.fullName || 'Welcome Back'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={styles.iconCircle}
              activeOpacity={0.8}
            >
              <Bell size={19} color={Colors.forestGreen} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarCircle}
              activeOpacity={0.8}
            >
              <UserIcon size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 2. MARKET OVERVIEW */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MARKET OVERVIEW</Text>
          </View>

          <View style={styles.marketCardsRow}>
            {/* GT Main Card with 3D 11-Coin Orbit */}
            <View style={styles.gtCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTokenLabel}>GT</Text>
                <Text style={styles.cardTokenAmount}>5,200</Text>
              </View>

              {/* 3D 11-Coin Cross-Horizontal Orbit */}
              <GtCoinOrbit width={140} height={105} />

              <View style={styles.cardFooter}>
                <Text style={styles.cardPriceText}>$1,200</Text>
                <View style={styles.percentBadge}>
                  <Text style={styles.percentText}>+12.4%</Text>
                </View>
              </View>
            </View>

            {/* Bitcoin Secondary Card */}
            <View style={styles.secondaryCard}>
              <View style={styles.secondaryHeader}>
                <View style={styles.btcIcon}>
                  <Text style={styles.btcText}>₿</Text>
                </View>
                <Text style={styles.secondaryLabel}>BITCOIN</Text>
                <Text style={styles.secondaryAmount}>0.041</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPriceText}>$2,400</Text>
                <Text style={styles.percentPositive}>+3.1%</Text>
              </View>
            </View>
          </View>

          {/* 3. GT TASKS CARD */}
          <View style={styles.tasksCard}>
            <View style={styles.tasksCardLeft}>
              <Text style={styles.tasksCardTitle}>GT Tasks</Text>
              <Text style={styles.tasksCardSubtitle}>
                Complete tasks & earn GT
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Tasks')}
                style={styles.tasksButton}
                activeOpacity={0.85}
              >
                <Text style={styles.tasksButtonText}>GT Tasks</Text>
                <ArrowUpRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.tasksCoinRing}>
              <View style={styles.tasksCoinBadge}>
                <Text style={styles.tasksCoinText}>GT</Text>
              </View>
            </View>
          </View>

          {/* 4. ACTIVE MINING OVERVIEW */}
          <View style={styles.miningWidget}>
            <View style={styles.miningWidgetHeader}>
              <View style={styles.liveIndicatorRow}>
                <View
                  style={[
                    styles.liveDot,
                    { backgroundColor: isMiningActive ? '#22C55E' : '#9CA3AF' },
                  ]}
                />
                <Text style={styles.miningStatusText}>
                  {isMiningActive ? 'ACTIVE PROTOCOL MINING' : 'MINING PAUSED'}
                </Text>
              </View>
              <Text style={styles.hashRateText}>{miningStats.hashRate}</Text>
            </View>

            <View style={styles.statGrid}>
              <View style={styles.statBox}>
                <Cpu size={16} color={Colors.emeraldMid} style={{ marginBottom: 4 }} />
                <Text style={styles.statLabel}>Session Mined</Text>
                <Text style={styles.statValue}>{miningStats.sessionEarned} GT</Text>
              </View>

              <View style={styles.statBox}>
                <ShieldCheck size={16} color={Colors.emeraldMid} style={{ marginBottom: 4 }} />
                <Text style={styles.statLabel}>Node Status</Text>
                <Text style={styles.statValue}>Verified (L1)</Text>
              </View>

              <View style={styles.statBox}>
                <Zap size={16} color={Colors.emeraldMid} style={{ marginBottom: 4 }} />
                <Text style={styles.statLabel}>Uptime</Text>
                <Text style={styles.statValue}>{miningStats.uptime}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.5,
  },
  userGreeting: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0A341B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A341B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110, // Avoid overlap with floating bottom nav
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  marketCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gtCard: {
    flex: 1.15,
    height: 146,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  secondaryCard: {
    flex: 0.85,
    height: 146,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    zIndex: 10,
  },
  cardTokenLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A341B',
  },
  cardTokenAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  secondaryHeader: {
    zIndex: 10,
  },
  btcIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  btcText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  secondaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A341B',
  },
  secondaryAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A341B',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  cardPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A341B',
  },
  percentBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  percentPositive: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  tasksCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  tasksCardLeft: {
    flex: 1,
  },
  tasksCardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0A341B',
  },
  tasksCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803D',
    marginTop: 3,
    marginBottom: 12,
  },
  tasksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
    gap: 4,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tasksButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  tasksCoinRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksCoinBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tasksCoinText: {
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#15803D',
  },
  miningWidget: {
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
  miningWidgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    paddingBottom: 10,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miningStatusText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.5,
  },
  hashRateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F0FAF3',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A341B',
  },
});

