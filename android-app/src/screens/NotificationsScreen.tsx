import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Gift, Zap, ShieldCheck } from 'lucide-react-native';
import { OrbBackground } from '../components/OrbBackground';
import { useNavigation } from '@react-navigation/native';
import { useAppSafeArea } from '../utils/safeArea';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { top, stackContentPaddingBottom } = useAppSafeArea();

  const notifications = [
    {
      id: 'n1',
      title: 'Mining Session Ready',
      desc: 'Your 4-hour cycle is completed. Start a new epoch to claim rewards.',
      time: '10m ago',
      icon: Zap,
    },
    {
      id: 'n2',
      title: 'Referral Dividend Accrued',
      desc: 'Your referred peer earned GT. +10.00 GT added to claimable balance.',
      time: '2h ago',
      icon: Gift,
    },
    {
      id: 'n3',
      title: 'Security Verification Verified',
      desc: 'Protocol Node L1 hardware signature cryptographic check succeeded.',
      time: '1d ago',
      icon: ShieldCheck,
    },
  ];

  return (
    <View style={styles.container}>
      <OrbBackground />

      <View style={[styles.safeArea, { paddingTop: top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#0A341B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: stackContentPaddingBottom }]}
        >
          <View style={styles.listCard}>
            {notifications.map((item) => {
              const IconComp = item.icon;
              return (
                <View key={item.id} style={styles.notifRow}>
                  <View style={styles.iconBox}>
                    <IconComp size={18} color="#15803D" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifDesc}>{item.desc}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
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
  listCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
  },
  notifRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A341B',
  },
  notifDesc: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 16,
    marginTop: 2,
  },
  notifTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

