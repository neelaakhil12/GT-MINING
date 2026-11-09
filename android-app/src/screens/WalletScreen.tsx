import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowUpRight,
  TrendingUp,
  History,
  ShieldCheck,
  CheckCircle2,
  Coins,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { OrbBackground } from '../components/OrbBackground';
import { AppNavbar } from '../components/AppNavbar';
import { FloatingBottomNav } from '../components/FloatingBottomNav';
import { appStorage } from '../utils/storage';
import { API_BASE_URL } from '../config/api';
import { useAppSafeArea } from '../utils/safeArea';

export const WalletScreen: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const { top, tabContentPaddingBottom } = useAppSafeArea();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletStats, setWalletStats] = useState({
    miningRewardsTotal: 0,
    referralRewardsTotal: 0,
    adminAdjustmentsTotal: 0,
  });

  // Filter tabs - ADMIN ADJUSTMENT removed
  const filterTabs = [
    { key: 'ALL', label: 'All Ledger' },
    { key: 'MINING_REWARD', label: 'MINING REWARD' },
    { key: 'REFERRAL_REWARD', label: 'REFERRAL REWARD' },
    { key: 'TASK_REWARD', label: 'TASK REWARD' },
  ];

  const fetchWallet = async () => {
    try {
      const token = await appStorage.getItem('gt_mobile_token');
      const endpoints = [
        API_BASE_URL,
        'http://localhost:5050/api',
      ];
      for (const base of endpoints) {
        try {
          const res = await fetch(`${base}/wallet`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          const data = await res.json();
          if (data && data.success) {
            if (Array.isArray(data.transactions)) {
              setTransactions(data.transactions);
            }
            if (data.wallet) {
              setWalletStats({
                miningRewardsTotal: Number(data.wallet.miningRewardsTotal || 0),
                referralRewardsTotal: Number(data.wallet.referralRewardsTotal || 0),
                adminAdjustmentsTotal: Number(data.wallet.adminAdjustmentsTotal || 0),
              });
            }
            break;
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to fetch mobile wallet data:', err);
    }
  };

  useEffect(() => {
    refreshUserData();
    fetchWallet();
  }, []);

  const filtered = filterType === 'ALL'
    ? transactions
    : transactions.filter((t) => t.type === filterType);

  // Dynamic real balance values from DB
  const availableBalance = Number(user?.balance ?? 0.0);
  const lifetimeEarned = Number(user?.totalMined ?? user?.balance ?? 0.0);

  return (
    <View style={styles.container}>
      {/* 3D Floating Green Spheres Background */}
      <OrbBackground />

      <View style={[styles.safeArea, { paddingTop: top }]}>
        {/* Universal Top Header with 'Wallet' active pill */}
        <AppNavbar activeTab="Wallet" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabContentPaddingBottom }]}
        >
          {/* 1. Primary Virtual Asset Hero Card (matching screenshot 1) */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <Text style={styles.primaryAssetLabel}>PRIMARY VIRTUAL ASSET</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceMainNumber}>
                  {availableBalance.toFixed(4)}
                </Text>
                <Text style={styles.balanceGtUnit}>GT</Text>
              </View>
              <Text style={styles.syncText}>
                Synchronized with cryptographically validated local ledger
              </Text>
            </View>

            {/* Inner White Card: Lifetime Total Earned */}
            <View style={styles.innerLifetimeCard}>
              <View style={styles.lifetimeLogoBadge}>
                <Image
                  source={require('../../assets/gt-logo.png')}
                  style={styles.lifetimeLogoImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.lifetimeTextCol}>
                <Text style={styles.lifetimeLabel}>LIFETIME TOTAL EARNED</Text>
                <Text style={styles.lifetimeValue}>
                  {lifetimeEarned.toFixed(4)} GT
                </Text>
              </View>
            </View>
          </View>

          {/* 2. Three Metric Breakdown Cards (matching screenshots 1 & 2) */}
          <View style={styles.metricCardsCol}>
            {/* Mining Rewards Total */}
            <View style={styles.metricCard}>
              <View style={styles.metricCardTop}>
                <Text style={styles.metricLabel}>Mining Rewards Total</Text>
                <ArrowUpRight size={16} color="#16A34A" strokeWidth={2.2} />
              </View>
              <Text style={styles.metricAmount}>
                {walletStats.miningRewardsTotal.toFixed(2)} GT
              </Text>
            </View>

            {/* Referral Bonuses Total */}
            <View style={styles.metricCard}>
              <View style={styles.metricCardTop}>
                <Text style={styles.metricLabel}>Referral Bonuses Total</Text>
                <ArrowUpRight size={16} color="#16A34A" strokeWidth={2.2} />
              </View>
              <Text style={styles.metricAmount}>
                {walletStats.referralRewardsTotal.toFixed(2)} GT
              </Text>
            </View>
          </View>

          {/* 3. Transparency & Token Disclaimer Card (matching screenshot 2) */}
          <View style={styles.disclaimerCard}>
            <ShieldCheck size={20} color="#16A34A" strokeWidth={2.2} style={{ marginTop: 1 }} />
            <View style={styles.disclaimerTextCol}>
              <Text style={styles.disclaimerTitle}>
                Transparency & Token Disclaimer:
              </Text>
              <Text style={styles.disclaimerBody}>
                GT is an in-app virtual utility coin utilized within the GT community ecosystem. GT coins cannot be bought, sold, or redeemed for fiat currency on this platform. No investment or monetary return is promised or implied.
              </Text>
            </View>
          </View>

          {/* 4. Transaction History Card (matching screenshots 3 & 4) */}
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <History size={18} color="#16A34A" strokeWidth={2.4} />
              <Text style={styles.historyTitle}>Transaction History</Text>
            </View>

            {/* Filter Pills Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsRow}
            >
              {filterTabs.map((tab) => {
                const isActive = filterType === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setFilterType(tab.key)}
                    style={[
                      styles.filterPill,
                      isActive ? styles.filterPillActive : styles.filterPillInactive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isActive ? styles.filterPillTextActive : styles.filterPillTextInactive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Subtle Progress / Accent Line under filter pills (matching screenshot 3) */}
            <View style={styles.trackLineContainer}>
              <View
                style={[
                  styles.activeIndicatorBar,
                  filterType === 'ALL' && { width: '32%', left: '0%' },
                  filterType === 'MINING_REWARD' && { width: '45%', left: '28%' },
                  filterType === 'REFERRAL_REWARD' && { width: '48%', left: '55%' },
                ]}
              />
            </View>

            {/* Empty State matching screenshots 3 & 4 */}
            {filtered.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyCoinsGraphic}>
                  <Coins size={42} color="rgba(74, 222, 128, 0.75)" strokeWidth={2} />
                </View>
                <Text style={styles.emptyTitle}>No transactions recorded</Text>
                <Text style={styles.emptySubtitle}>
                  New mining rewards and referral credits will appear here.
                </Text>
              </View>
            ) : (
              <View style={styles.txList}>
                {filtered.map((tx, idx) => (
                  <View key={tx.id || idx} style={styles.txItem}>
                    <View style={styles.txLeft}>
                      <View style={styles.txIconBg}>
                        <CheckCircle2 size={15} color="#16A34A" strokeWidth={2.4} />
                      </View>
                      <View style={styles.txTextCol}>
                        <Text style={styles.txTitleText}>{tx.title || tx.description}</Text>
                        <Text style={styles.txDateText}>{tx.date || 'Today'}</Text>
                      </View>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={styles.txAmountText}>{tx.amount}</Text>
                      <View style={styles.completedBadge}>
                        <CheckCircle2 size={10} color="#15803D" strokeWidth={2.2} />
                        <Text style={styles.completedBadgeText}>Completed</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Floating Bottom Navigation Bar (matching all 4 screenshots) */}
        <FloatingBottomNav activeTab="Wallet" />
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
    paddingTop: 12,
    paddingBottom: 120, // generous bottom padding so floating nav doesn't cover content
    gap: 14,
  },
  heroCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 18,
    gap: 16,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  heroTop: {
    gap: 3,
  },
  primaryAssetLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  balanceMainNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.6,
  },
  balanceGtUnit: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16A34A',
  },
  syncText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E5E36',
    marginTop: 3,
    lineHeight: 15,
  },
  innerLifetimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  lifetimeLogoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifetimeLogoImg: {
    width: 28,
    height: 28,
  },
  lifetimeTextCol: {
    gap: 1,
  },
  lifetimeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E5E36',
    letterSpacing: 0.8,
  },
  lifetimeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A341B',
    marginTop: 1,
  },
  metricCardsCol: {
    gap: 10,
  },
  metricCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  metricCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E5E36',
  },
  metricAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.3,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  disclaimerTextCol: {
    flex: 1,
    gap: 3,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A341B',
  },
  disclaimerBody: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#1E5E36',
    lineHeight: 15.5,
  },
  historyCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
    gap: 12,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0A341B',
  },
  filterPillsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
  },
  filterPillActive: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  filterPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  filterPillTextInactive: {
    color: '#1E5E36',
  },
  trackLineContainer: {
    height: 3,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    borderRadius: 2,
    marginTop: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  activeIndicatorBar: {
    height: 3,
    backgroundColor: '#22C55E',
    borderRadius: 2,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyCoinsGraphic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAF8EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
  },
  emptySubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#1E5E36',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 16,
  },
  txList: {
    gap: 10,
    marginTop: 6,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0FDF4',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  txIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTextCol: {
    gap: 2,
    flex: 1,
  },
  txTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A341B',
  },
  txDateText: {
    fontSize: 10,
    color: '#1E5E36',
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  txAmountText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#15803D',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
  },
  completedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  bottomSpacer: {
    height: 12,
  },
});
