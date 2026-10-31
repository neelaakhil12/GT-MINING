import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet as WalletIcon,
  ShieldCheck,
  Clock,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { OrbBackground } from '../components/OrbBackground';
import { useNavigation } from '@react-navigation/native';

export const WalletScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <OrbBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#0A341B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>GT VAULT WALLET</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Main Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {(user?.balance || 5200).toFixed(2)}{' '}
              <Text style={styles.gtText}>GT</Text>
            </Text>
            <Text style={styles.balanceFiat}>≈ $1,200.00 USD</Text>

            {/* Quick Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
                <View style={styles.actionIconBg}>
                  <ArrowUpRight size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.actionBtnText}>Send</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
                <View style={styles.actionIconBg}>
                  <ArrowDownLeft size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.actionBtnText}>Receive</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Recent Transactions */}
          <View style={styles.transactionsCard}>
            <Text style={styles.sectionTitle}>TRANSACTION ACTIVITY</Text>

            {[
              {
                id: 'tx1',
                type: 'Mining Epoch Reward',
                amount: '+18.40 GT',
                date: 'Today, 14:10',
                isPositive: true,
              },
              {
                id: 'tx2',
                type: 'Referral Dividend Claim',
                amount: '+42.80 GT',
                date: 'Today, 11:30',
                isPositive: true,
              },
              {
                id: 'tx3',
                type: 'Task Completion Bonus',
                amount: '+5.00 GT',
                date: 'Yesterday, 19:45',
                isPositive: true,
              },
            ].map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txIcon}>
                  <Clock size={16} color="#15803D" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.txTitle}>{tx.type}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text style={styles.txAmount}>{tx.amount}</Text>
              </View>
            ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A341B',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    borderRadius: 24,
    backgroundColor: '#0A341B',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0A341B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#86EFAC',
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  gtText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#86EFAC',
  },
  balanceFiat: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 30,
    marginTop: 20,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  transactionsCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  txIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A341B',
  },
  txDate: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '900',
    color: '#15803D',
  },
});

