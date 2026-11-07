import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  User as UserIcon,
  Mail,
  AlertTriangle,
  LogOut,
  Save,
  Trash2,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { OrbBackground } from '../components/OrbBackground';
import { AppNavbar } from '../components/AppNavbar';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [fullName, setFullName] = useState(user?.fullName || '');

  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
  }, [user]);
  const [newEmail, setNewEmail] = useState('');

  const handleSaveProfile = () => {
    Alert.alert('Profile Updated!', 'Your display name has been saved.');
  };

  const handleRequestEmail = () => {
    Alert.alert('Verification Sent!', `Link sent to ${newEmail || 'new email'}.`);
    setNewEmail('');
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const handleDelete = () => {
    Alert.alert('Warning', 'Account deletion requires administrator approval.');
  };

  return (
    <View style={styles.container}>
      <OrbBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Universal Top Navbar */}
        <AppNavbar activeTab="App" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Header Profile Summary Card matching video */}
          <View style={styles.headerProfileCard}>
            <View style={styles.profileUserRow}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ gap: 2 }}>
                <Text style={styles.userNameTitle}>{fullName}</Text>
                <Text style={styles.userEmailSubtitle}>
                  {user?.email || 'demo@gtmining.com'}
                </Text>
                <View style={styles.statusBadge}>
                  <ShieldCheck size={12} color="#16A34A" />
                  <Text style={styles.statusBadgeText}>Account Status: ACTIVE</Text>
                </View>
              </View>
            </View>

            {/* 2x2 Account Details Metadata Grid */}
            <View style={styles.metaGrid}>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>REFERRAL CODE</Text>
                <Text style={styles.metaValueGreen}>
                  {user?.referralCode || 'GT88241'}
                </Text>
              </View>

              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>ACCOUNT ROLE</Text>
                <Text style={styles.metaValueDark}>USER</Text>
              </View>

              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>JOINED DATE</Text>
                <Text style={styles.metaValueDark}>21/10/2026</Text>
              </View>

              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>EMAIL VERIFICATION</Text>
                <View style={styles.verifiedRow}>
                  <CheckCircle2 size={13} color="#15803D" />
                  <Text style={styles.metaValueGreen}>Verified</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 2. Edit Personal Details Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <UserIcon size={16} color="#16A34A" />
              <Text style={styles.sectionHeaderTitle}>Edit Personal Details</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={styles.textInput}
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveProfile}
              style={styles.saveBtn}
              activeOpacity={0.85}
            >
              <Save size={14} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Profile Changes</Text>
            </TouchableOpacity>
          </View>

          {/* 3. Request Email Change Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Mail size={16} color="#16A34A" />
              <Text style={styles.sectionHeaderTitle}>Request Email Change</Text>
            </View>

            <Text style={styles.emailNoticeText}>
              Current email is <Text style={{ fontWeight: '800' }}>{user?.email || 'demo@gtmining.com'}</Text>. Entering a new email sends a verification link to confirm ownership.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Email Address</Text>
              <TextInput
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="newemail@example.com"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              onPress={handleRequestEmail}
              style={styles.sendEmailBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.sendEmailBtnText}>Send Verification Request</Text>
            </TouchableOpacity>
          </View>

          {/* 5. Danger Zone: Account Deletion */}
          <View style={styles.dangerZoneCard}>
            <View style={styles.dangerHeaderRow}>
              <AlertTriangle size={17} color="#DC2626" />
              <Text style={styles.dangerHeaderTitle}>
                Danger Zone: Irreversible Account Deletion
              </Text>
            </View>
            <Text style={styles.dangerNoticeText}>
              Permanently delete your GT account and anonymize all personal identifying data in accordance with data privacy regulations. Active sessions will be revoked and this account cannot be recovered.
            </Text>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteBtn}
              activeOpacity={0.85}
            >
              <Trash2 size={14} color="#FFFFFF" />
              <Text style={styles.deleteBtnText}>Delete Account Permanently</Text>
            </TouchableOpacity>
          </View>

          {/* 6. Session & Security Logout */}
          <View style={styles.logoutCard}>
            <View style={{ gap: 2, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <LogOut size={16} color="#DC2626" />
                <Text style={styles.logoutTitle}>Session & Security</Text>
              </View>
              <Text style={styles.logoutSubtitle}>
                Safely log out of your active GT Pioneer session on this device.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutBtn}
              activeOpacity={0.85}
            >
              <LogOut size={13} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Log Out of Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FAF3',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
    gap: 14,
  },
  headerProfileCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 18,
    gap: 16,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  profileUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    paddingBottom: 14,
  },
  avatarLarge: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarLargeText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userNameTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A341B',
  },
  userEmailSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E5E36',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  metaCard: {
    width: '48%',
    backgroundColor: 'rgba(240, 250, 243, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCF2E4',
    padding: 10,
    gap: 2,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1E5E36',
    letterSpacing: 0.8,
  },
  metaValueGreen: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#15803D',
  },
  metaValueDark: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0A341B',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adminBannerBtn: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  adminIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#92400E',
  },
  adminSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B45309',
  },
  sectionCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
    gap: 12,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E5E36',
  },
  textInput: {
    backgroundColor: 'rgba(240, 250, 243, 0.7)',
    borderWidth: 1,
    borderColor: '#DCF2E4',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0A341B',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  emailNoticeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E5E36',
    lineHeight: 16,
  },
  sendEmailBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  sendEmailBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803D',
  },
  dangerZoneCard: {
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    padding: 16,
    gap: 10,
  },
  dangerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dangerHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#DC2626',
  },
  dangerNoticeText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#991B1B',
    lineHeight: 15,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 2,
  },
  deleteBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  logoutCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  logoutTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0A341B',
  },
  logoutSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E5E36',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  logoutBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#DC2626',
  },
  bottomSpacer: {
    height: 30,
  },
});
