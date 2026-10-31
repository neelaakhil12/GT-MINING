import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  Copy,
  Check,
  Info,
  Gift,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { OrbBackground } from '../components/OrbBackground';
import { ClaimRotatingButton } from '../components/ClaimRotatingButton';
import { SocialShareRow } from '../components/SocialShareRow';
import * as Haptics from 'expo-haptics';

interface ReferralFriend {
  id: string;
  name: string;
  initials: string;
  maskedId: string;
  date: string;
  earnedGT: string;
  isActive: boolean;
}

const mockFriends: ReferralFriend[] = [
  {
    id: 'f1',
    name: 'Arjun Reddy',
    initials: 'AR',
    maskedId: 'GT-90****12',
    date: 'Oct 28',
    earnedGT: '+10.00 GT',
    isActive: true,
  },
  {
    id: 'f2',
    name: 'Priya Sharma',
    initials: 'PS',
    maskedId: 'GT-44****89',
    date: 'Oct 25',
    earnedGT: '+5.00 GT',
    isActive: true,
  },
  {
    id: 'f3',
    name: 'Rahul Kumar',
    initials: 'RK',
    maskedId: 'GT-12****77',
    date: 'Oct 20',
    earnedGT: '+15.00 GT',
    isActive: true,
  },
  {
    id: 'f4',
    name: 'Vikram Joshi',
    initials: 'VJ',
    maskedId: 'GT-88****33',
    date: 'Oct 14',
    earnedGT: '+12.80 GT',
    isActive: false,
  },
];

export const ReferralsScreen: React.FC = () => {
  const { user, claimCommission } = useAuth();
  const [claimableAmount, setClaimableAmount] = useState<number>(42.8);
  const [claimedTotal, setClaimedTotal] = useState<number>(141.7);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  const referralCode = user?.referralCode || 'GT-VIP-889';
  const referralLink = `https://gtnetwork.org/join?ref=${referralCode}`;

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    setHasCopied(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Haptics fallback
    }
    Alert.alert('Copied!', 'Referral code copied to clipboard.');
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleClaim = () => {
    if (claimableAmount <= 0) return;
    setIsClaiming(true);
    setTimeout(() => {
      claimCommission(claimableAmount);
      setClaimedTotal((prev) => +(prev + claimableAmount).toFixed(2));
      setClaimableAmount(0);
      setIsClaiming(false);
      Alert.alert(
        'Commission Claimed!',
        `Successfully transferred +${claimableAmount.toFixed(2)} GT into your wallet.`
      );
    }, 600);
  };

  return (
    <View style={styles.container}>
      <OrbBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>REFERRALS & REWARDS</Text>
          <Text style={styles.headerSubtitle}>
            Grow the protocol network & earn 10% lifetime dividend
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Protocol Dividend / Claim Card (MATCHING WEB EXACTLY) */}
          <View style={styles.claimCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.iconTag}>
                <Gift size={16} color="#15803D" />
                <Text style={styles.iconTagText}>Protocol Dividend</Text>
              </View>
              <View style={styles.tierBadge}>
                <Text style={styles.tierBadgeText}>Tier 1 (10%)</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>Total Commission Claimed</Text>
                <Text style={styles.statMutedValue}>
                  {claimedTotal.toFixed(2)} GT
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Available to Claim Row */}
            <View style={styles.claimActionRow}>
              <View>
                <Text style={styles.availableTitle}>Available to Claim</Text>
                <Text style={styles.proofReadyText}>Cryptographic proof ready</Text>
              </View>

              <View style={styles.claimAmountAndButtonRow}>
                <Text style={styles.claimAmountText}>
                  {claimableAmount.toFixed(2)}{' '}
                  <Text style={styles.gtUnitText}>GT</Text>
                </Text>

                {/* THE CLAIM BUTTON WITH ROTATING LINE ANIMATION */}
                <ClaimRotatingButton
                  onPress={handleClaim}
                  disabled={claimableAmount <= 0}
                  isLoading={isClaiming}
                  label="Claim"
                />
              </View>
            </View>

            {/* Protocol Rule Callout */}
            <View style={styles.ruleBox}>
              <Info size={15} color="#15803D" style={{ marginTop: 2 }} />
              <Text style={styles.ruleText}>
                <Text style={{ fontWeight: '800' }}>Protocol Rule: </Text>
                "If your referred friend mines 100 GT, you earn 10 GT in
                commission."
              </Text>
            </View>
          </View>

          {/* 2. Referral Code & Sharing Card */}
          <View style={styles.shareCard}>
            <Text style={styles.cardSectionLabel}>YOUR REFERRAL CODE</Text>

            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{referralCode}</Text>
              <TouchableOpacity
                onPress={handleCopyCode}
                style={styles.copyBtn}
                activeOpacity={0.8}
              >
                {hasCopied ? (
                  <Check size={16} color="#15803D" />
                ) : (
                  <Copy size={16} color="#0A341B" />
                )}
                <Text style={styles.copyBtnText}>
                  {hasCopied ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Official Social Sharing Buttons (WhatsApp, Telegram, X, Instagram, Share) */}
            <Text style={styles.quickShareLabel}>QUICK SOCIAL SHARE</Text>
            <SocialShareRow referralCode={referralCode} />
          </View>

          {/* 3. Referral Friends List */}
          <View style={styles.friendsSection}>
            <View style={styles.friendsHeaderRow}>
              <Text style={styles.cardSectionLabel}>REFERRAL FRIENDS</Text>
              <Text style={styles.friendCountBadge}>
                {mockFriends.length} Active Nodes
              </Text>
            </View>

            {mockFriends.map((friend) => (
              <View key={friend.id} style={styles.friendItem}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.avatarText}>{friend.initials}</Text>
                </View>

                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendMaskedId}>{friend.maskedId}</Text>
                </View>

                <View style={styles.friendEarnedBox}>
                  <Text style={styles.friendEarnedText}>{friend.earnedGT}</Text>
                  <View
                    style={[
                      styles.friendStatusDot,
                      {
                        backgroundColor: friend.isActive ? '#22C55E' : '#9CA3AF',
                      },
                    ]}
                  />
                </View>
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
  claimCard: {
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
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconTagText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A341B',
  },
  tierBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  statsRow: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  statMutedValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A341B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 12,
  },
  claimActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  availableTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A341B',
  },
  proofReadyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 2,
  },
  claimAmountAndButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  claimAmountText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A341B',
  },
  gtUnitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  ruleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FAF3',
    borderRadius: 14,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#DCF2E4',
  },
  ruleText: {
    flex: 1,
    fontSize: 11,
    color: '#1E5E36',
    lineHeight: 16,
  },
  shareCard: {
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
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FAF3',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCF2E4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A341B',
  },
  quickShareLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  friendsSection: {
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
  friendsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  friendCountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  friendAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#15803D',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A341B',
  },
  friendMaskedId: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  friendEarnedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  friendEarnedText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  friendStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});

