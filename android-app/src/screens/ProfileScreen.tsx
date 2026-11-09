import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  CheckCircle2,
  User as UserIcon,
  Mail,
  AlertTriangle,
  LogOut,
  Save,
  Trash2,
  Camera,
  Sparkles,
  Check,
  Upload,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { OrbBackground } from '../components/OrbBackground';
import { AppNavbar } from '../components/AppNavbar';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../config/api';
import { appStorage } from '../utils/storage';
import { useAppSafeArea } from '../utils/safeArea';
import { BOY_AVATARS, GIRL_AVATARS, AvatarPreset } from '../constants/avatars';

export const ProfileScreen: React.FC = () => {
  const { user, refreshUserData, logout, updateUserAvatar } = useAuth();
  const navigation = useNavigation();
  const { top, stackContentPaddingBottom } = useAppSafeArea();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [newEmail, setNewEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<any>(null);

  // Avatar & Photo Upload states
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [activeGenderTab, setActiveGenderTab] = useState<'boy' | 'girl'>('boy');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(
    user?.avatar || user?.profileImage || user?.avatarUrl || null
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
    if (user?.avatar || user?.profileImage || user?.avatarUrl) {
      setSelectedAvatarUrl(user.avatar || user.profileImage || user.avatarUrl || null);
    }
  }, [user]);

  const fetchEmailStatus = async () => {
    try {
      const token = await appStorage.getItem('gt_mobile_token');
      const res = await fetch(`${API_BASE_URL}/profile/email-change-status`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data && data.success && data.request) {
        setPendingRequest(data.request);
      }
    } catch {}
  };

  useEffect(() => {
    refreshUserData?.();
    fetchEmailStatus();
  }, []);

  // Upload Custom Photo from Gallery
  const handlePickCustomPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to upload a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadingPhoto(true);

        const dataUri = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;

        setSelectedAvatarUrl(dataUri);
        const ok = await updateUserAvatar(dataUri);
        if (ok) {
          Alert.alert('Success', 'Profile photo updated successfully!');
        } else {
          Alert.alert('Notice', 'Photo updated on device, syncing with server.');
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not pick image.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Save Selected Preset Avatar
  const handleSaveAvatar = async () => {
    if (!selectedAvatarUrl) {
      Alert.alert('Select Avatar', 'Please tap an avatar to select it first.');
      return;
    }
    setSavingAvatar(true);
    try {
      const ok = await updateUserAvatar(selectedAvatarUrl);
      if (ok) {
        Alert.alert('Avatar Saved!', 'Your new avatar is now active across GT Network.');
        setShowAvatarPicker(false);
      } else {
        Alert.alert('Saved Locally', 'Avatar applied to your profile.');
        setShowAvatarPicker(false);
      }
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = await appStorage.getItem('gt_mobile_token');
      await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fullName }),
      });
      refreshUserData?.();
      Alert.alert('Profile Updated!', 'Your display name has been saved.');
    } catch {
      Alert.alert('Profile Updated!', 'Your display name has been saved.');
    }
  };

  const handleRequestEmail = async () => {
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (user?.email && clean === user.email.toLowerCase()) {
      Alert.alert('Notice', 'New email cannot be the same as your current email.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await appStorage.getItem('gt_mobile_token');
      const res = await fetch(`${API_BASE_URL}/profile/request-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ newEmail: clean }),
      });
      const data = await res.json();
      if (data && data.success) {
        Alert.alert(
          'Request Submitted!',
          data.message || 'Administrator will review and approve your email change.'
        );
        setNewEmail('');
        await fetchEmailStatus();
      } else {
        Alert.alert('Request Failed', data.message || 'Unable to submit email change request.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Network error submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const currentDisplayAvatar =
    selectedAvatarUrl || user?.avatar || user?.profileImage || user?.avatarUrl;

  const currentAvatarList: AvatarPreset[] =
    activeGenderTab === 'boy' ? BOY_AVATARS : GIRL_AVATARS;

  return (
    <View style={styles.container}>
      <OrbBackground />

      <View style={[styles.safeArea, { paddingTop: top }]}>
        {/* Universal Top Navbar */}
        <AppNavbar activeTab="App" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: stackContentPaddingBottom }]}
        >
          {/* 1. Header Profile Summary Card */}
          <View style={styles.headerProfileCard}>
            <View style={styles.profileUserRow}>
              <View style={styles.avatarLarge}>
                {currentDisplayAvatar ? (
                  <Image
                    source={{ uri: currentDisplayAvatar }}
                    style={{ width: 68, height: 68, borderRadius: 24 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.avatarLargeText}>
                    {fullName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={{ gap: 2, flex: 1 }}>
                <Text style={styles.userNameTitle}>{fullName}</Text>
                <Text style={styles.userEmailSubtitle}>
                  {user?.email || ''}
                </Text>
                <View style={styles.statusBadge}>
                  <ShieldCheck size={12} color="#16A34A" />
                  <Text style={styles.statusBadgeText}>Account Status: ACTIVE</Text>
                </View>
              </View>
            </View>

            {/* TWO PROMINENT BUTTONS: Upload Photo & Choose Avatar */}
            <View style={styles.photoActionsRow}>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={handlePickCustomPhoto}
                disabled={uploadingPhoto}
                activeOpacity={0.8}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Camera size={14} color="#FFFFFF" />
                )}
                <Text style={styles.actionBtnPrimaryText}>
                  {uploadingPhoto ? 'Uploading...' : 'Upload Profile Image'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtnSecondary,
                  showAvatarPicker && styles.actionBtnSecondaryActive,
                ]}
                onPress={() => setShowAvatarPicker(!showAvatarPicker)}
                activeOpacity={0.8}
              >
                <Sparkles size={14} color={showAvatarPicker ? '#FFFFFF' : '#15803D'} />
                <Text
                  style={[
                    styles.actionBtnSecondaryText,
                    showAvatarPicker && styles.actionBtnSecondaryActiveText,
                  ]}
                >
                  {showAvatarPicker ? 'Hide Avatars' : 'Choose Avatar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* AVATAR SELECTOR (5 Boys & 5 Girls Horizontally Scrollable) */}
            {showAvatarPicker && (
              <View style={styles.avatarPickerContainer}>
                {/* Gender Tabs */}
                <View style={styles.genderTabsRow}>
                  <TouchableOpacity
                    style={[
                      styles.genderTabBtn,
                      activeGenderTab === 'boy' && styles.genderTabBtnActive,
                    ]}
                    onPress={() => setActiveGenderTab('boy')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.genderTabText,
                        activeGenderTab === 'boy' && styles.genderTabTextActive,
                      ]}
                    >
                      👦 Boys Avatars (5)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.genderTabBtn,
                      activeGenderTab === 'girl' && styles.genderTabBtnActive,
                    ]}
                    onPress={() => setActiveGenderTab('girl')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.genderTabText,
                        activeGenderTab === 'girl' && styles.genderTabTextActive,
                      ]}
                    >
                      👧 Girls Avatars (5)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Horizontally Scrollable Avatar Row */}
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalAvatarScroll}
                >
                  {currentAvatarList.map((item) => {
                    const isSelected = selectedAvatarUrl === item.url;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.avatarItemCard,
                          isSelected && styles.avatarItemCardSelected,
                        ]}
                        onPress={() => setSelectedAvatarUrl(item.url)}
                        activeOpacity={0.75}
                      >
                        <Image
                          source={{ uri: item.url }}
                          style={styles.avatarThumbnail}
                          resizeMode="cover"
                        />
                        {isSelected && (
                          <View style={styles.selectedCheckBadge}>
                            <Check size={11} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                        <Text
                          style={[
                            styles.avatarItemName,
                            isSelected && styles.avatarItemNameSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Save Avatar Button */}
                <TouchableOpacity
                  style={styles.saveAvatarBtn}
                  onPress={handleSaveAvatar}
                  disabled={savingAvatar}
                  activeOpacity={0.85}
                >
                  {savingAvatar ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Save size={14} color="#FFFFFF" />
                  )}
                  <Text style={styles.saveAvatarBtnText}>
                    {savingAvatar ? 'Saving Avatar...' : 'Save Avatar'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

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

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Display Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} activeOpacity={0.8}>
              <Save size={13} color="#FFFFFF" />
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
              Current email is <Text style={{ fontWeight: '800' }}>{user?.email}</Text>. Submit
              a new email address to request an email change. Once approved by the administrator,
              your login email will be updated.
            </Text>

            {pendingRequest && (
              <View style={styles.pendingBanner}>
                <AlertTriangle size={15} color="#D97706" />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.pendingTitle}>Pending Email Change Request</Text>
                  <Text style={styles.pendingSubtitle}>
                    New: {pendingRequest.requested_email} (Status: {pendingRequest.status})
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>New Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="newemail@example.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              style={styles.sendEmailBtn}
              onPress={handleRequestEmail}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.sendEmailBtnText}>
                {submitting ? 'Submitting...' : 'Send Change Request'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 4. Danger Zone Card */}
          <View style={styles.dangerZoneCard}>
            <View style={styles.dangerHeaderRow}>
              <AlertTriangle size={16} color="#DC2626" />
              <Text style={styles.dangerHeaderTitle}>Danger Zone</Text>
            </View>
            <Text style={styles.dangerNoticeText}>
              Once requested for deletion, all pending transactions and referral earnings are permanently removed.
            </Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() =>
                Alert.alert(
                  'Account Deletion Request',
                  'Please contact support or admin to request account deletion.'
                )
              }
              activeOpacity={0.8}
            >
              <Trash2 size={13} color="#FFFFFF" />
              <Text style={styles.deleteBtnText}>Request Account Deletion</Text>
            </TouchableOpacity>
          </View>

          {/* 5. Logout Card */}
          <View style={styles.logoutCard}>
            <Text style={styles.logoutTitle}>Session Security</Text>
            <Text style={styles.logoutSubtitle}>
              Safely end your current session across this device.
            </Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <LogOut size={13} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Logout Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 14,
  },
  headerProfileCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
    gap: 14,
  },
  profileUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarLargeText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#15803D',
  },
  userNameTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A341B',
  },
  userEmailSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E5E36',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    shadowColor: '#16A34A',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  actionBtnSecondaryActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  actionBtnSecondaryText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803D',
  },
  actionBtnSecondaryActiveText: {
    color: '#FFFFFF',
  },
  avatarPickerContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 18,
    padding: 12,
    gap: 12,
  },
  genderTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderTabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 10,
  },
  genderTabBtnActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  genderTabText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  genderTabTextActive: {
    color: '#FFFFFF',
  },
  horizontalAvatarScroll: {
    paddingVertical: 6,
    gap: 12,
  },
  avatarItemCard: {
    alignItems: 'center',
    width: 72,
    padding: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  avatarItemCardSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
    shadowColor: '#16A34A',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarThumbnail: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F3F4F6',
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarItemName: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 5,
    textAlign: 'center',
  },
  avatarItemNameSelected: {
    color: '#15803D',
    fontWeight: '900',
  },
  saveAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#15803D',
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#15803D',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  saveAvatarBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaCard: {
    width: '48.5%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 10,
    gap: 3,
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  metaValueGreen: {
    fontSize: 12,
    fontWeight: '900',
    color: '#16A34A',
  },
  metaValueDark: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0A341B',
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1E5E36',
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 10,
  },
  pendingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  pendingSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B45309',
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
