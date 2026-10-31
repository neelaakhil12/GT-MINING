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
  Globe,
  MessageCircle,
  Users,
  Shield,
  ArrowRight,
  TrendingUp,
} from 'lucide-react-native';
import { OrbBackground } from '../components/OrbBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

export const CommunityScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <OrbBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>GLOBAL NODE NETWORK</Text>
          <Text style={styles.headerSubtitle}>
            Decentralized validation nodes & verified peer network
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Private Network Banner (P2P Chat like WhatsApp) */}
          <TouchableOpacity
            onPress={() => navigation.navigate('PrivateNetwork')}
            style={styles.chatBannerCard}
            activeOpacity={0.88}
          >
            <View style={styles.chatBannerLeft}>
              <View style={styles.chatIconBadge}>
                <MessageCircle size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.chatBannerTitle}>Private Network Chat</Text>
                <Text style={styles.chatBannerDesc}>
                  Encrypted peer-to-peer mobile messaging
                </Text>
              </View>
            </View>
            <View style={styles.arrowCircle}>
              <ArrowRight size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* 2. Global Network Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>NETWORK STATUS</Text>

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statColLabel}>Total Active Nodes</Text>
                <Text style={styles.statColValue}>18,452</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statColLabel}>Global Hashrate</Text>
                <Text style={styles.statColValue}>46.1 TH/s</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statColLabel}>Countries Reached</Text>
                <Text style={styles.statColValue}>114</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statColLabel}>Avg Block Time</Text>
                <Text style={styles.statColValue}>2.4s</Text>
              </View>
            </View>
          </View>

          {/* 3. Top Node Validators */}
          <View style={styles.leaderboardCard}>
            <Text style={styles.sectionTitle}>TOP VALIDATOR NODES</Text>

            {[
              { rank: 1, name: 'Apex-Validator-01', stake: '94,200 GT', uptime: '99.98%' },
              { rank: 2, name: 'Titan-Node-East', stake: '81,500 GT', uptime: '99.95%' },
              { rank: 3, name: 'Genesis-Miner-L1', stake: '72,800 GT', uptime: '99.91%' },
            ].map((node) => (
              <View key={node.rank} style={styles.leaderboardRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{node.rank}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.nodeName}>{node.name}</Text>
                  <Text style={styles.nodeSubtext}>Uptime: {node.uptime}</Text>
                </View>
                <Text style={styles.nodeStake}>{node.stake}</Text>
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
  chatBannerCard: {
    borderRadius: 24,
    backgroundColor: '#0A341B',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#0A341B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  chatBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBannerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  chatBannerDesc: {
    fontSize: 11,
    color: '#86EFAC',
    marginTop: 2,
  },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  statCol: {
    flex: 1,
    backgroundColor: '#F0FAF3',
    borderRadius: 16,
    padding: 12,
  },
  statColLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  statColValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A341B',
    marginTop: 4,
  },
  leaderboardCard: {
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
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
  },
  nodeName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A341B',
  },
  nodeSubtext: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  nodeStake: {
    fontSize: 13,
    fontWeight: '900',
    color: '#15803D',
  },
});

