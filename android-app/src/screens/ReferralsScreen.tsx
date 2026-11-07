import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
  Share,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  Copy,
  Check,
  Info,
  Coins,
  Link as LinkIcon,
  ChevronRight,
  Sparkles,
  Share2,
} from 'lucide-react-native';
import Svg, { Path, Circle, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { OrbBackground } from '../components/OrbBackground';
import { AppNavbar } from '../components/AppNavbar';
import * as Haptics from 'expo-haptics';
import { appStorage } from '../utils/storage';
import { API_BASE_URL } from '../config/api';

const { width } = Dimensions.get('window');

const dividendSlides = [
  {
    tag: 'PROTOCOL DIVIDEND',
    title: 'Autonomous 10% Yield Accrual',
    desc: 'Instant smart ledger execution with zero platform transaction...',
  },
  {
    tag: 'TIER MULTIPLIER',
    title: 'Secondary Node Expansion',
    desc: 'Deep multi-tier connectivity distributing block rewards continuously.',
  },
  {
    tag: 'CONSENSUS BENEFIT',
    title: 'Zero Latency Distribution',
    desc: 'Earn pro-rata commissions each time peer nodes finalize 4-hour mining cycles.',
  },
];

export const ReferralsScreen: React.FC = () => {
  const { user } = useAuth();
  const [claimableAmount, setClaimableAmount] = useState<number>(0.0);
  const [claimedTotal, setClaimedTotal] = useState<number>(0.0);
  const [totalEarned, setTotalEarned] = useState<number>(0.0);
  const [hasCopiedCode, setHasCopiedCode] = useState<boolean>(false);
  const [hasCopiedLink, setHasCopiedLink] = useState<boolean>(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Dynamic Referral Statistics loaded from backend DB
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeFriends: 0,
    inactiveFriends: 0,
    totalReferralRewardsEarned: 0,
  });
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const referralCode = user?.referralCode || '';
  const referralLink = `https://gtnetwork.in/signup?ref=${referralCode}`;

  useEffect(() => {
    let isMounted = true;
    const loadReferrals = async () => {
      try {
        const token = await appStorage.getItem('gt_mobile_token');
        const endpoints = [
          API_BASE_URL,
          'http://localhost:5050/api',
        ];
        for (const base of endpoints) {
          try {
            const [sumRes, histRes] = await Promise.all([
              fetch(`${base}/referrals/summary`, {
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              }),
              fetch(`${base}/referrals/history`, {
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              }),
            ]);
            const sumData = await sumRes.json();
            const histData = await histRes.json();
            if (sumData && sumData.success && isMounted) {
              const s = sumData.statistics || sumData;
              setStats({
                totalReferrals: Number(s.totalReferrals || 0),
                activeFriends: Number(s.activeFriends || 0),
                inactiveFriends: Number(s.inactiveFriends || 0),
                totalReferralRewardsEarned: Number(s.totalReferralRewardsEarned || 0),
              });
              setTotalEarned(Number(s.totalReferralRewardsEarned || 0));
            }
            if (histData && histData.success && Array.isArray(histData.referrals) && isMounted) {
              setFriendsList(histData.referrals);
            }
            break;
          } catch {}
        }
      } catch (err) {
        console.warn('Failed to load mobile referral data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadReferrals();
    return () => { isMounted = false; };
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % dividendSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    setHasCopiedCode(true);
    Alert.alert('Referral Code Copied!', referralCode);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    Clipboard.setString(referralLink);
    setHasCopiedLink(true);
    Alert.alert('Referral Link Copied!', referralLink);
    setTimeout(() => setHasCopiedLink(false), 2000);
  };

  const handleClaim = () => {
    if (claimableAmount <= 0) return;
    setClaimedTotal((prev) => +(prev + claimableAmount).toFixed(2));
    setClaimableAmount(0);
    Alert.alert('Commission Claimed!', `+${claimableAmount} GT added to your balance.`);
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `Mine virtual GT coins every 4 hours! Use referral code: ${referralCode} - ${referralLink}`,
      });
    } catch (e) {}
  };

  const currentSlideData = dividendSlides[activeSlide];

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
          {/* 1. TOP PROTOCOL DIVIDEND BANNER CAROUSEL matching real_web_referrals.png */}
          <View style={styles.carouselBannerCard}>
            <View style={styles.carouselHeaderRow}>
              <View style={styles.dividendTagPill}>
                <View style={styles.pulsingGreenDot} />
                <Text style={styles.dividendTagText}>{currentSlideData.tag}</Text>
              </View>

              <View style={styles.dotsRow}>
                {dividendSlides.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      activeSlide === idx ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            </View>

            <Text style={styles.carouselTitle}>{currentSlideData.title}</Text>
            <Text style={styles.carouselDesc}>{currentSlideData.desc}</Text>
          </View>

          {/* 2. GROW YOUR NETWORK & 2x2 STATS GRID matching website */}
          <View style={styles.growSection}>
            <View style={styles.growTextHeader}>
              <Text style={styles.growTitle}>Grow Your Network</Text>
              <Text style={styles.growSubtitle}>Your network. Your rewards.</Text>
            </View>

            <View style={styles.statsRowsContainer}>
              {/* Row 1 */}
              <View style={styles.statsRow}>
                {/* Card 1: TOTAL REFERRALS */}
                <View style={styles.stat2x2Card}>
                  <View style={styles.stat2x2Top}>
                    <Text style={styles.stat2x2Label}>TOTAL REFERRALS</Text>
                    <Users size={16} color="#15803D" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.stat2x2Number}>{stats.totalReferrals}</Text>
                  <Text style={styles.stat2x2Desc}>Registered peer nodes</Text>
                </View>

                {/* Card 2: ACTIVE FRIENDS */}
                <View style={styles.stat2x2Card}>
                  <View style={styles.stat2x2Top}>
                    <Text style={styles.stat2x2Label}>ACTIVE FRIENDS</Text>
                    <View style={styles.activeGreenCircle} />
                  </View>
                  <Text style={styles.stat2x2Number}>{stats.activeFriends}</Text>
                  <Text style={styles.stat2x2Desc}>Confirmed mining cycle</Text>
                </View>
              </View>

              {/* Row 2 */}
              <View style={styles.statsRow}>
                {/* Card 3: INACTIVE FRIENDS */}
                <View style={styles.stat2x2Card}>
                  <View style={styles.stat2x2Top}>
                    <Text style={styles.stat2x2Label}>INACTIVE FRIENDS</Text>
                    <View style={styles.inactiveGreyCircle} />
                  </View>
                  <Text style={styles.stat2x2Number}>{stats.inactiveFriends}</Text>
                  <Text style={styles.stat2x2Desc}>Standby allocation</Text>
                </View>

                {/* Card 4: TOTAL GT EARNED */}
                <View style={styles.stat2x2Card}>
                  <View style={styles.stat2x2Top}>
                    <Text style={styles.stat2x2Label}>TOTAL GT EARNED</Text>
                    <Coins size={16} color="#15803D" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.stat2x2Number}>{stats.totalReferralRewardsEarned.toFixed(2)}</Text>
                  <Text style={styles.stat2x2Desc}>Accumulated net yield</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 3. PERSONAL CONNECTION TOKEN Card matching real_web_referrals.png */}
          <View style={styles.tokenCard}>
            <View style={styles.tokenHeaderRow}>
              <Text style={styles.tokenTitle}>PERSONAL CONNECTION TOKEN</Text>
              <View style={styles.cryptoIdBadge}>
                <Text style={styles.cryptoIdText}>Cryptographic ID</Text>
              </View>
            </View>

            {/* Link Box */}
            <View style={styles.linkBox}>
              <View style={styles.linkBoxLeft}>
                <LinkIcon size={14} color="#15803D" />
                <Text style={styles.linkUrlText} numberOfLines={1}>
                  {referralLink}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCopyLink}
                style={styles.copySquareBtn}
                activeOpacity={0.8}
              >
                {hasCopiedLink ? (
                  <Check size={14} color="#15803D" />
                ) : (
                  <Copy size={14} color="#374151" />
                )}
              </TouchableOpacity>
            </View>

            {/* Referral Code Row */}
            <View style={styles.codeRow}>
              <View style={styles.codeRowLeft}>
                <Text style={styles.codePromptText}>Referral Code:</Text>
                <Text style={styles.codeValueText}>{referralCode}</Text>
              </View>
              <TouchableOpacity
                onPress={handleCopyCode}
                style={styles.copyCodeBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.copyCodeBtnText}>
                  {hasCopiedCode ? 'Code Copied!' : 'Copy Code'}
                </Text>
                <ChevronRight size={13} color="#15803D" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. DIRECT TRANSMISSION (SOCIAL SHARING) matching real_web_referrals.png */}
          <View style={styles.directSection}>
            <View style={styles.directHeaderRow}>
              <Text style={styles.directTitle}>DIRECT TRANSMISSION</Text>
              <Text style={styles.directSubtitle}>Verified Endpoints</Text>
            </View>

            <View style={styles.socialButtonsRow}>
              {/* WhatsApp */}
              <TouchableOpacity
                onPress={handleNativeShare}
                style={styles.socialBtn}
                activeOpacity={0.8}
              >
                <Svg width={24} height={24} viewBox="0 0 32 32">
                  <Path
                    fill="#25D366"
                    d="M16 2C8.28 2 2 8.28 2 16c0 2.65.74 5.13 2.03 7.25L2.3 29.7l6.63-1.71A13.9 13.9 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2z"
                  />
                  <Path
                    fill="#FFFFFF"
                    d="M23.1 19.34c-.39-.2-2.31-1.14-2.67-1.27-.36-.13-.62-.2-.88.2s-1.01 1.27-1.24 1.53-.46.3-.85.1a10.66 10.66 0 01-3.15-1.95 11.75 11.75 0 01-2.18-2.72c-.23-.39-.02-.6.17-.8.18-.18.39-.46.59-.69.2-.23.26-.39.39-.65.13-.26.07-.49-.03-.69s-.88-2.12-1.21-2.91c-.32-.76-.64-.66-.88-.67-.23-.01-.49-.02-.75-.02s-.69.1-1.05.49c-.36.39-1.37 1.34-1.37 3.27s1.4 3.8 1.6 4.06c.2.26 2.76 4.21 6.69 5.91.93.4 1.66.64 2.23.82.94.3 1.8.26 2.47.16.76-.11 2.31-.94 2.64-1.85.33-.91.33-1.69.23-1.85-.1-.16-.36-.26-.75-.46z"
                  />
                </Svg>
              </TouchableOpacity>

              {/* Telegram */}
              <TouchableOpacity
                onPress={handleNativeShare}
                style={styles.socialBtn}
                activeOpacity={0.8}
              >
                <Svg width={24} height={24} viewBox="0 0 32 32">
                  <Circle cx="16" cy="16" r="14" fill="#229ED9" />
                  <Path
                    fill="#FFFFFF"
                    d="M23.07 9.42L6.87 15.67c-1.1.44-1.09 1.06-.2 1.33l4.16 1.3 9.63-6.08c.45-.28.87-.13.53.18l-7.81 7.05-.3 4.29c.42 0 .61-.19.85-.42l2.04-1.98 4.24 3.13c.78.43 1.34.21 1.54-.72l2.78-13.11c.29-1.14-.43-1.66-1.46-1.22z"
                  />
                </Svg>
              </TouchableOpacity>

              {/* Twitter / X */}
              <TouchableOpacity
                onPress={handleNativeShare}
                style={styles.socialBtn}
                activeOpacity={0.8}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24">
                  <Path
                    fill="#000000"
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </Svg>
              </TouchableOpacity>

              {/* Instagram */}
              <TouchableOpacity
                onPress={handleNativeShare}
                style={styles.socialBtn}
                activeOpacity={0.8}
              >
                <Svg width={24} height={24} viewBox="0 0 32 32">
                  <Defs>
                    <RadialGradient id="igRadGradApp" cx="30%" cy="105%" r="120%">
                      <Stop offset="0%" stopColor="#fdf497" />
                      <Stop offset="10%" stopColor="#fdf497" />
                      <Stop offset="35%" stopColor="#fd5949" />
                      <Stop offset="60%" stopColor="#d6249f" />
                      <Stop offset="100%" stopColor="#285AEB" />
                    </RadialGradient>
                  </Defs>
                  <Rect x="2" y="2" width="28" height="28" rx="8" fill="url(#igRadGradApp)" />
                  <Circle cx="16" cy="16" r="6" stroke="#FFFFFF" strokeWidth="2.2" fill="none" />
                  <Circle cx="22.5" cy="9.5" r="1.5" fill="#FFFFFF" />
                </Svg>
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity
                onPress={handleNativeShare}
                style={styles.socialBtn}
                activeOpacity={0.8}
              >
                <Share2 size={18} color="#1F2937" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. PROTOCOL DIVIDEND - REWARDS & COMMISSION Card */}
          <View style={styles.dividendCard}>
            <View style={styles.dividendHeader}>
              <View style={styles.dividendPillRow}>
                <View style={styles.protocolBadge}>
                  <Text style={styles.protocolBadgeText}>PROTOCOL DIVIDEND</Text>
                </View>
                <View style={styles.yieldRatioBadge}>
                  <Text style={styles.yieldRatioText}>10% Mining Pro-Rata</Text>
                </View>
              </View>
              <Text style={styles.dividendTitle}>Rewards & Commission</Text>
            </View>

            {/* Breakdown Rows */}
            <View style={styles.dividendTable}>
              <View style={styles.dividendRow}>
                <Text style={styles.dividendRowLabel}>Invited Verified Peer</Text>
                <Text style={styles.dividendRowValueDark}>+2.00 GT per node</Text>
              </View>
              <View style={styles.dividendRow}>
                <Text style={styles.dividendRowLabel}>Mining Yield Ratio</Text>
                <Text style={styles.dividendRowValueGreen}>10% Confirmed Output</Text>
              </View>
              <View style={styles.dividendRow}>
                <Text style={styles.dividendRowLabel}>Total Commission Earned</Text>
                <Text style={styles.dividendRowValueDark}>+{totalEarned.toFixed(2)} GT</Text>
              </View>
              <View style={[styles.dividendRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.dividendRowLabel}>Total Commission Claimed</Text>
                <Text style={styles.dividendRowValueMuted}>{claimedTotal.toFixed(2)} GT</Text>
              </View>
            </View>

            <View style={styles.dividendDivider} />

            {/* Claim Section */}
            <View style={styles.claimRow}>
              <View>
                <Text style={styles.availableLabel}>Available to Claim</Text>
                <Text style={styles.cryptoProofText}>Cryptographic proof ready</Text>
              </View>

              <View style={styles.claimRightCol}>
                <Text style={styles.claimAmount}>
                  {claimableAmount.toFixed(2)} <Text style={styles.claimUnit}>GT</Text>
                </Text>

                <TouchableOpacity
                  onPress={handleClaim}
                  disabled={claimableAmount <= 0}
                  style={styles.claimBtnPill}
                  activeOpacity={0.85}
                >
                  <Sparkles size={13} color="#86EFAC" />
                  <Text style={styles.claimBtnText}>CLAIM</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Protocol Notice */}
            <View style={styles.noticeBox}>
              <Info size={14} color="#15803D" style={{ marginTop: 1 }} />
              <Text style={styles.noticeText}>
                <Text style={{ fontWeight: '800' }}>Protocol Rule:</Text> "If your referred friend mines 100 GT, you earn 10 GT in commission."
              </Text>
            </View>
          </View>

          {/* 6. REFERRAL FRIENDS List matching real_web_referrals.png */}
          <View style={styles.friendsSection}>
            <View style={styles.friendsHeaderRow}>
              <View>
                <Text style={styles.friendsSectionTitle}>REFERRAL FRIENDS</Text>
                <Text style={styles.friendsSectionSubtitle}>Live on-chain records</Text>
              </View>
              <View style={styles.showingPill}>
                <Text style={styles.showingPillText}>
                  Showing {friendsList.length} of {stats.totalReferrals}
                </Text>
              </View>
            </View>

            {friendsList.length === 0 ? (
              <View style={styles.emptyFriendsCard}>
                <View style={styles.emptyIconBadge}>
                  <Users size={22} color="#16A34A" />
                </View>
                <Text style={styles.emptyTitle}>No referrals yet</Text>
                <Text style={styles.emptySubtitle}>
                  Share your personal invitation code or link to expand your mining circle and earn GT dividends together.
                </Text>
                <TouchableOpacity
                  onPress={handleCopyLink}
                  style={styles.emptyCopyBtn}
                  activeOpacity={0.8}
                >
                  <Copy size={13} color="#FFFFFF" />
                  <Text style={styles.emptyCopyBtnText}>Copy Invite Link</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.friendsList}>
                {friendsList.map((friend) => {
                  const name = friend.friendName || 'GT Miner';
                  const initials = name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  const isFriendActive = friend.activityStatus === 'ACTIVE' || friend.isActive;
                  const dateStr = friend.registeredAt
                    ? new Date(friend.registeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : 'Recent';
                  return (
                    <View key={friend.id} style={styles.friendCard}>
                      <View style={styles.friendLeft}>
                        <View style={styles.friendInitialsBadge}>
                          <Text style={styles.friendInitialsText}>{initials}</Text>
                        </View>
                        <View style={{ gap: 2 }}>
                          <Text style={styles.friendNameText}>{name}</Text>
                          <Text style={styles.friendMaskedText}>
                            {friend.friendEmail || 'Peer Node'} • {dateStr}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.friendRight}>
                        <Text style={[styles.friendEarnedText, !isFriendActive && { color: '#9CA3AF' }]}>
                          {friend.rewardAmount ? `+${Number(friend.rewardAmount).toFixed(2)} GT` : '0.00 GT'}
                        </Text>
                        <View style={styles.statusRow}>
                          <View
                            style={[
                              styles.friendDot,
                              { backgroundColor: isFriendActive ? '#22C55E' : '#D1D5DB' },
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              { color: isFriendActive ? '#15803D' : '#9CA3AF' },
                            ]}
                          >
                            {friend.activityStatus || (isFriendActive ? 'ACTIVE' : 'INACTIVE')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
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
    gap: 16,
  },
  carouselBannerCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 18,
    gap: 8,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  carouselHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dividendTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    backgroundColor: 'rgba(21, 128, 61, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.2)',
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  dividendTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 16,
    backgroundColor: '#15803D',
  },
  dotInactive: {
    width: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.3,
  },
  carouselDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E5E36',
    lineHeight: 18,
  },
  growSection: {
    gap: 10,
  },
  growTextHeader: {
    paddingHorizontal: 2,
    gap: 2,
  },
  growTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.3,
  },
  growSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  statsRowsContainer: {
    gap: 12,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  stat2x2Card: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 15,
    paddingVertical: 14,
    minHeight: 110,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  stat2x2Top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat2x2Label: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.8,
  },
  stat2x2Number: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.5,
    marginVertical: 2,
  },
  stat2x2Desc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#15803D',
  },
  activeGreenCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  inactiveGreyCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  tokenCard: {
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
  tokenHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
  },
  cryptoIdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(21, 128, 61, 0.1)',
  },
  cryptoIdText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FAF3',
    borderWidth: 1,
    borderColor: '#DCF2E4',
    borderRadius: 14,
    padding: 8,
    paddingLeft: 10,
  },
  linkBoxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  linkUrlText: {
    fontSize: 11.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#0A341B',
    flex: 1,
  },
  copySquareBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codePromptText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#6B7280',
  },
  codeValueText: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#0A341B',
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  copyCodeBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803D',
  },
  directSection: {
    gap: 8,
    paddingHorizontal: 2,
  },
  directHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  directTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
  },
  directSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  dividendCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 18,
    gap: 12,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dividendHeader: {
    gap: 4,
  },
  dividendPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  protocolBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(21, 128, 61, 0.1)',
  },
  protocolBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#15803D',
  },
  yieldRatioBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#E8F8EE',
  },
  yieldRatioText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  dividendTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0A341B',
    marginTop: 2,
  },
  dividendTable: {
    gap: 8,
  },
  dividendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  dividendRowLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#6B7280',
  },
  dividendRowValueDark: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A341B',
  },
  dividendRowValueGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  dividendRowValueMuted: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  dividendDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  claimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availableLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A341B',
  },
  cryptoProofText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#15803D',
  },
  claimRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  claimAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.5,
  },
  claimUnit: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
  },
  claimBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0A341B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  claimBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FAF3',
    borderWidth: 1,
    borderColor: '#DCF2E4',
    borderRadius: 14,
    padding: 10,
  },
  noticeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E5E36',
    flex: 1,
    lineHeight: 16,
  },
  friendsSection: {
    gap: 10,
  },
  friendsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  friendsSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
  },
  friendsSectionSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#15803D',
  },
  showingPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  showingPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  friendsList: {
    gap: 8,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 13,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendInitialsBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendInitialsText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#374151',
  },
  friendNameText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
  },
  friendMaskedText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  friendRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  friendEarnedText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bottomSpacer: {
    height: 30,
  },
  emptyFriendsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EBFBF0',
    borderWidth: 1,
    borderColor: '#C2F3D0',
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
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  emptyCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    marginTop: 6,
  },
  emptyCopyBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
