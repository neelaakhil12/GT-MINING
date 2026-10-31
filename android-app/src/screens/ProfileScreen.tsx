import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  User as UserIcon,
  ShieldCheck,
  Key,
  LogOut,
  HelpCircle,
  FileText,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { OrbBackground } from '../components/OrbBackground';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen: React.FC = () => {
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
          <Text style={styles.headerTitle}>PROFILE & SECURITY</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* User Card */}
          <View style={styles.userCard}>
            <View style={styles.avatarLarge}>
              <UserIcon size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.userName}>{user?.fullName || 'Akhil Kumar'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@gtnetwork.org'}</Text>
            <View style={styles.kycBadge}>
              <ShieldCheck size={13} color="#15803D" style={{ marginRight: 4 }} />
              <Text style={styles.kycText}>Level 1 Verified</Text>
            </View>
          </View>

          {/* Account Details */}
          <View style={styles.menuCard}>
            <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>User ID</Text>
              <Text style={styles.detailValue}>{user?.id || 'usr_gt_1001'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Referral Code</Text>
              <Text style={styles.detailValue}>
                {user?.referralCode || 'GT-VIP-889'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total GT Balance</Text>
              <Text style={[styles.detailValue, { color: '#15803D' }]}>
                {(user?.balance || 5200).toFixed(2)} GT
              </Text>
            </View>
          </View>

          {/* Settings & Links */}
          <View style={styles.menuCard}>
            <Text style={styles.sectionTitle}>SECURITY & PRIVACY</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Security', '2FA is currently enabled.')}
            >
              <Key size={18} color="#0A341B" />
              <Text style={styles.menuItemText}>Two-Factor Authentication</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Terms', 'GT Network protocol v2.4')}
            >
              <FileText size={18} color="#0A341B" />
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert('Support', 'Contact official Telegram @gtnetwork_support')
              }
            >
              <HelpCircle size={18} color="#0A341B" />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </TouchableOpacity>
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
  userCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0A341B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A341B',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  kycText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  menuCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A341B',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    gap: 12,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A341B',
  },
});

