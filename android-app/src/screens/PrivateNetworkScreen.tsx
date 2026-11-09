import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Clipboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Users,
  BarChart3,
  Bell,
  Flame,
  CheckCircle2,
  Zap,
  X,
  Plus,
  Trash2,
  Pencil,
  RotateCcw,
  Copy,
  Check,
  Pickaxe,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AppNavbar } from '../components/AppNavbar';
import { OrbBackground } from '../components/OrbBackground';
import { useAuth } from '../context/AuthContext';
import { appStorage } from '../utils/storage';
import { useAppSafeArea } from '../utils/safeArea';
import { API_BASE_URL } from '../config/api';

interface ChatMsg {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'HOST' | 'MEMBER';
  senderAvatar: string;
  text: string;
  type: 'CHAT' | 'REMINDER';
  time: string;
}

interface MemberItem {
  id: string;
  name: string;
  maskedId: string;
  initials: string;
  avatarBg: string;
  isMiningActive: boolean;
  streakDays: number;
}

interface QuickReplyItem {
  id: string;
  shortcut: string;
  label: string;
  text: string;
  type: 'REMINDER' | 'CHAT';
}

const DEFAULT_QUICK_REPLIES: QuickReplyItem[] = [
  {
    id: 'qr_1',
    shortcut: '/reminder',
    label: '⏰ 4h Mining Claim',
    text: '⏰ Reminder: Your 4-hour mining claim is ready! Claim 1 GT now.',
    type: 'REMINDER',
  },
  {
    id: 'qr_2',
    shortcut: '/hashrate',
    label: '🔥 Team Hash Rate Boost',
    text: '🔥 Let’s keep our circle hash rate at 100%! Claim your mining cycle today.',
    type: 'REMINDER',
  },
  {
    id: 'qr_3',
    shortcut: '/welcome',
    label: '👋 Welcome to Circle',
    text: '👋 Welcome to our private circle! Reach out here if you have any questions.',
    type: 'CHAT',
  },
  {
    id: 'qr_4',
    shortcut: '/streak',
    label: '⚡ Daily Streak Alert',
    text: '⚡ Keep your daily streak going! Don’t let your mining bonus reset.',
    type: 'REMINDER',
  },
];

export const PrivateNetworkScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { top, stackContentPaddingBottom } = useAppSafeArea();

  const [activeTab, setActiveTab] = useState<'CHAT' | 'STATUS'>('CHAT');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'IDLE'>('ALL');

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReplyItem[]>(DEFAULT_QUICK_REPLIES);
  const [circleHost, setCircleHost] = useState<{
    id: string;
    fullName: string;
    email?: string;
    referralCode?: string;
    isCurrentUserHost?: boolean;
  } | null>(null);

  const [cycleHours, setCycleHours] = useState<number>(4);
  const [miningReward, setMiningReward] = useState<number>(1.0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/mining/config`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          if (data.cycleHours) setCycleHours(Number(data.cycleHours));
          if (data.miningReward) setMiningReward(Number(data.miningReward));
        }
      })
      .catch(() => {});
  }, []);

  const [inputText, setInputText] = useState('');
  const [showQuickSheet, setShowQuickSheet] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // Load real circle data from Backend API
  const fetchCircleData = async () => {
    try {
      const token = await appStorage.getItem('gt_mobile_token');
      const res = await fetch(`${API_BASE_URL}/private-network`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (json && json.success) {
        if (json.circleHost) {
          setCircleHost(json.circleHost);
        }
        if (Array.isArray(json.members)) {
          setMembers(
            json.members.map((m: any) => ({
              id: m.id,
              name: m.name,
              maskedId: m.maskedId,
              initials: m.initials,
              avatarBg: m.avatarBg || '#10B981',
              isMiningActive: !!m.isMiningActive,
              streakDays: m.streakDays || 0,
            }))
          );
        }
        if (Array.isArray(json.messages)) {
          setMessages(
            json.messages.map((msg: any) => {
              const date = msg.createdAt ? new Date(msg.createdAt) : new Date();
              const hours = date.getHours();
              const minutes = date.getMinutes();
              const ampm = hours >= 12 ? 'pm' : 'am';
              const fHours = hours % 12 ? hours % 12 : 12;
              const fMins = minutes < 10 ? `0${minutes}` : minutes;
              const timeStr = `${fHours < 10 ? `0${fHours}` : fHours}:${fMins} ${ampm}`;
              return {
                id: msg.id,
                senderId: msg.senderId,
                senderName: msg.senderName,
                senderRole: msg.senderRole || 'MEMBER',
                senderAvatar: msg.senderAvatar || 'M',
                text: msg.text,
                type: msg.type || 'CHAT',
                time: timeStr,
              };
            })
          );
        }
      }
    } catch (e) {
      console.warn('Failed to fetch private circle data:', e);
    }
  };

  useEffect(() => {
    fetchCircleData();
    const interval = setInterval(() => {
      fetchCircleData();
    }, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const totalMembersCount = members.length;
  const activeMembersCount = members.filter((m) => m.isMiningActive).length;
  const idleMembersCount = totalMembersCount - activeMembersCount;

  const filteredMembers = members.filter((m) => {
    if (statusFilter === 'ACTIVE') return m.isMiningActive;
    if (statusFilter === 'IDLE') return !m.isMiningActive;
    return true;
  });

  const handleSend = async (textToSend?: string, type: 'CHAT' | 'REMINDER' = 'CHAT') => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const isCurrentUserHost = circleHost?.isCurrentUserHost !== false;
    const myRole = isCurrentUserHost ? 'HOST' : 'MEMBER';
    const senderName = user?.fullName || (isCurrentUserHost ? 'Circle Host' : 'Miner');
    const senderAvatar = user?.avatar || user?.profileImage || senderName.charAt(0).toUpperCase();

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 ? hours % 12 : 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${formattedHours < 10 ? `0${formattedHours}` : formattedHours}:${formattedMinutes} ${ampm}`;

    const newMsg: ChatMsg = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || 'usr_me',
      senderName,
      senderRole: myRole,
      senderAvatar,
      text,
      type,
      time: timeStr,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');
    setShowQuickSheet(false);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Persist to backend API directly
    try {
      const token = await appStorage.getItem('gt_mobile_token');
      await fetch(`${API_BASE_URL}/private-network/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text, type }),
      });
    } catch (err) {
      console.warn('Failed to send message:', err);
    }
  };

  const handlePingMember = async (member: MemberItem) => {
    const isCurrentUserHost = circleHost?.isCurrentUserHost !== false;
    const myRole = isCurrentUserHost ? 'HOST' : 'MEMBER';
    const senderName = user?.fullName || (isCurrentUserHost ? 'Circle Host' : 'Miner');
    const senderAvatar = user?.avatar || user?.profileImage || senderName.charAt(0).toUpperCase();

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 ? hours % 12 : 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${formattedHours < 10 ? `0${formattedHours}` : formattedHours}:${formattedMinutes} ${ampm}`;

    const pingText = `🔔 @${member.name} Mining Reminder: Your ${cycleHours}-hour GT cycle is ready to claim! Tap 'Mine Now' to collect ${miningReward.toFixed(2)} GT.`;

    const pingMsg: ChatMsg = {
      id: `msg_ping_${Date.now()}`,
      senderId: user?.id || 'usr_me',
      senderName,
      senderRole: myRole,
      senderAvatar,
      text: pingText,
      type: 'REMINDER',
      time: timeStr,
    };

    setMessages((prev) => [...prev, pingMsg]);
    setActiveTab('CHAT');

    try {
      const token = await appStorage.getItem('gt_mobile_token');
      const endpoints = [
        `${API_BASE_URL}/private-network/ping-member`,
        'http://localhost:5050/api/private-network/ping-member',
      ];
      for (const url of endpoints) {
        try {
          await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ memberId: member.id, memberName: member.name }),
          });
          break;
        } catch {}
      }
    } catch {}
  };

  const handleNudgeAllIdle = () => {
    if (idleMembersCount === 0) return;
    const text = `⏰ Network Alert to all ${idleMembersCount} idle miners: Your ${cycleHours}-hour GT mining cycle is ready! Tap 'Mine Now' to claim your ${miningReward.toFixed(2)} GT and boost our circle hash rate!`;
    handleSend(text, 'REMINDER');
    setShowStatsModal(false);
    setActiveTab('CHAT');
  };

  const copyReferralCode = () => {
    const code = circleHost?.referralCode || user?.referralCode || 'GTMINING';
    Clipboard.setString(code);
    setCopiedCode(true);
    Alert.alert('Referral Code Copied!', code);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <View style={styles.container}>
      <OrbBackground />

      <View style={[styles.safeArea, { paddingTop: top }]}>
        {/* 1. Universal Top Navbar */}
        <AppNavbar activeTab="App" />

        {/* 2. Subheader: Back, Leader Avatar, Title & Subtitle, Circle Info Button */}
        <View style={styles.subHeader}>
          <View style={styles.subHeaderLeft}>
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('MainTabs');
                }
              }}
              style={styles.backButton}
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ArrowLeft size={18} color="#1E5E36" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowStatsModal(true)}
              style={styles.circleInfoTrigger}
              activeOpacity={0.85}
            >
              <View style={styles.leaderAvatarBox}>
                <Text style={styles.leaderAvatarText}>
                  {(circleHost?.fullName || user?.fullName || 'H').charAt(0).toUpperCase()}
                </Text>
                <View style={styles.onlineBadgeRing} />
              </View>

              <View style={styles.titleCol}>
                <Text style={styles.mainTitle} numberOfLines={1}>
                  Private Circle Chat
                </Text>
                <Text style={styles.subTitle} numberOfLines={1}>
                  {totalMembersCount} Members • {activeMembersCount} Mining Active
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setShowStatsModal(true)}
            style={styles.circleInfoBtn}
            activeOpacity={0.85}
          >
            <BarChart3 size={14} color="#16A34A" />
            <Text style={styles.circleInfoBtnText}>Circle Info</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Dual Tab Switcher: Chat vs Miners Status (10) */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              onPress={() => setActiveTab('CHAT')}
              testID="chat-tab"
              accessibilityLabel="Chat Tab"
              style={[
                styles.tabBtn,
                activeTab === 'CHAT' && styles.tabBtnActive,
              ]}
              activeOpacity={0.88}
            >
              <MessageSquare
                size={14}
                color={activeTab === 'CHAT' ? '#FFFFFF' : '#1E5E36'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'CHAT' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('STATUS')}
              testID="miners-status-tab"
              accessibilityLabel="Miners Status Tab"
              style={[
                styles.tabBtn,
                activeTab === 'STATUS' && styles.tabBtnActive,
              ]}
              activeOpacity={0.88}
            >
              <Users
                size={14}
                color={activeTab === 'STATUS' ? '#FFFFFF' : '#1E5E36'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'STATUS' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Miners Status ({totalMembersCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. CONTENT AREA: TAB 1: CHAT */}
        {activeTab === 'CHAT' ? (
          <KeyboardAvoidingView
            style={styles.chatAreaContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.messagesList,
                messages.length === 0 && { flex: 1, justifyContent: 'center' },
              ]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyMessagesBox}>
                  <View style={styles.emptyMessagesIcon}>
                    <MessageSquare size={26} color="#16A34A" />
                  </View>
                  <Text style={styles.emptyMessagesTitle}>No circle messages yet</Text>
                  <Text style={styles.emptyMessagesText}>
                    Welcome to your Private Circle Chat. Send a message or broadcast a mining reminder to your team below!
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isMyMessage = item.senderId === user?.id;
                const isReminder = item.type === 'REMINDER';

                return (
                  <View
                    style={[
                      styles.messageRow,
                      isMyMessage ? styles.messageRowHost : styles.messageRowMember,
                    ]}
                  >
                    {/* Other Member Avatar on Left */}
                    {!isMyMessage && (
                      <View style={styles.memberAvatarBox}>
                        <Text style={styles.memberAvatarText}>
                          {item.senderAvatar || (item.senderName ? item.senderName.charAt(0).toUpperCase() : 'M')}
                        </Text>
                      </View>
                    )}

                    {/* Bubble Content Stack */}
                    <View
                      style={[
                        styles.bubbleWrapper,
                        isMyMessage ? styles.bubbleWrapperHost : styles.bubbleWrapperMember,
                      ]}
                    >
                      {/* Name + Time Row */}
                      <View
                        style={[
                          styles.bubbleHeaderRow,
                          isMyMessage ? styles.bubbleHeaderHost : styles.bubbleHeaderMember,
                        ]}
                      >
                        <Text style={styles.senderNameText}>{item.senderName}</Text>
                        {item.senderRole === 'HOST' && (
                          <View style={styles.hostBadge}>
                            <Text style={styles.hostBadgeText}>HOST</Text>
                          </View>
                        )}
                        <Text style={styles.messageTimeText}>{item.time}</Text>
                      </View>

                      {/* Bubble Box */}
                      <View
                        style={[
                          styles.bubbleBox,
                          isMyMessage ? styles.bubbleBoxHost : styles.bubbleBoxMember,
                          isReminder && styles.bubbleBoxReminder,
                        ]}
                      >
                        {isReminder && (
                          <View style={styles.reminderHeader}>
                            <Bell size={13} color="#B45309" />
                            <Text style={styles.reminderHeaderText}>
                              MINING ALERT & CYCLE REMINDER
                            </Text>
                          </View>
                        )}

                        <Text
                          style={[
                            styles.bubbleText,
                            isMyMessage ? styles.bubbleTextHost : styles.bubbleTextMember,
                          ]}
                        >
                          {item.text}
                        </Text>

                        {/* Interactive Mine Now Call to Action inside Reminder bubbles */}
                        {isReminder && (
                          <View style={styles.reminderActionRow}>
                            <Text style={styles.reminderYieldText}>
                              {cycleHours}-Hour cycle yield: +{miningReward.toFixed(2)} GT
                            </Text>
                            <TouchableOpacity
                              onPress={() => navigation.navigate('MainTabs', { screen: 'Mine' })}
                              style={styles.reminderMineBtn}
                              activeOpacity={0.85}
                            >
                              <Pickaxe size={12} color="#FFFFFF" />
                              <Text style={styles.reminderMineBtnText}>Mine Now</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* My Avatar on Right */}
                    {isMyMessage && (
                      <View style={styles.hostAvatarBox}>
                        <Text style={styles.hostAvatarText}>
                          {item.senderAvatar || (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              }}
            />

            {/* Bottom Chat Input Bar */}
            <View style={styles.inputBar}>
              <TouchableOpacity
                onPress={() => setShowQuickSheet((prev) => !prev)}
                style={styles.quickReplyBtn}
                activeOpacity={0.8}
              >
                <Zap size={18} color="#16A34A" />
              </TouchableOpacity>

              <TextInput
                style={styles.chatInput}
                placeholder="Type a message (type '@' to mention friend)..."
                placeholderTextColor="#6B7280"
                value={inputText}
                onChangeText={(text) => {
                  setInputText(text);
                  if (text.startsWith('/')) {
                    setShowQuickSheet(true);
                  }
                }}
              />

              <TouchableOpacity
                onPress={() => handleSend()}
                style={styles.sendBtn}
                activeOpacity={0.85}
              >
                <Send size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        ) : (
          /* 5. CONTENT AREA: TAB 2: MINERS STATUS */
          <ScrollView
            style={styles.minersAreaContainer}
            contentContainerStyle={styles.minersContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.minersCard}>
              {/* Header: Referred Miners, active/idle count, total badge */}
              <View style={styles.minersHeaderRow}>
                <View>
                  <View style={styles.minersTitleRow}>
                    <Users size={16} color="#16A34A" />
                    <Text style={styles.minersTitleText}>Referred Miners</Text>
                  </View>
                  <Text style={styles.minersSubtitleText}>
                    {activeMembersCount} active • {idleMembersCount} idle
                  </Text>
                </View>

                <View style={styles.minersCountBadge}>
                  <Text style={styles.minersCountBadgeText}>
                    {filteredMembers.length}
                  </Text>
                </View>
              </View>

              {/* 3 Filter Pills: All, Active, Idle */}
              <View style={styles.filterPillsRow}>
                <TouchableOpacity
                  onPress={() => setStatusFilter('ALL')}
                  style={[
                    styles.filterPill,
                    statusFilter === 'ALL' && styles.filterPillActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      statusFilter === 'ALL' && styles.filterPillTextActive,
                    ]}
                  >
                    All ({totalMembersCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStatusFilter('ACTIVE')}
                  style={[
                    styles.filterPill,
                    statusFilter === 'ACTIVE' && styles.filterPillActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      statusFilter === 'ACTIVE' && styles.filterPillTextActive,
                    ]}
                  >
                    Active ({activeMembersCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStatusFilter('IDLE')}
                  testID="filter-idle-pill"
                  accessibilityLabel="Filter Idle"
                  style={[
                    styles.filterPill,
                    statusFilter === 'IDLE' && styles.filterPillActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      statusFilter === 'IDLE' && styles.filterPillTextActive,
                    ]}
                  >
                    Idle ({idleMembersCount})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Miners List */}
              <View style={styles.minersList}>
                {filteredMembers.length === 0 ? (
                  <View style={styles.emptyMinersBox}>
                    <View style={styles.emptyMinersIcon}>
                      <Users size={28} color="#16A34A" />
                    </View>
                    <Text style={styles.emptyMinersTitle}>No miners in circle</Text>
                    <Text style={styles.emptyMinersText}>
                      {totalMembersCount === 0
                        ? "You don't have any referred miners in your circle yet. Share your referral code to invite miners and build your team!"
                        : "No miners match the selected status filter."}
                    </Text>
                    {totalMembersCount === 0 && (
                      <TouchableOpacity
                        onPress={copyReferralCode}
                        style={styles.emptyInviteBtn}
                        activeOpacity={0.85}
                      >
                        <Copy size={13} color="#FFFFFF" />
                        <Text style={styles.emptyInviteBtnText}>
                          {copiedCode ? 'Code Copied!' : 'Copy Referral Code'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  filteredMembers.map((member) => (
                    <View
                      key={member.id}
                      style={[
                        styles.minerItemCard,
                        !member.isMiningActive && styles.minerItemCardIdle,
                      ]}
                    >
                      {/* Left: Avatar with Status Dot */}
                      <View
                        style={[
                          styles.minerAvatarBox,
                          { backgroundColor: member.avatarBg },
                        ]}
                      >
                        <Text style={styles.minerAvatarInitials}>
                          {member.initials}
                        </Text>
                        <View
                          style={[
                            styles.minerStatusDot,
                            member.isMiningActive
                              ? styles.minerStatusDotActive
                              : styles.minerStatusDotIdle,
                          ]}
                        />
                      </View>

                      {/* Middle: Name & streak */}
                      <View style={styles.minerInfoCol}>
                        <Text style={styles.minerNameText} numberOfLines={1}>
                          {member.name}
                        </Text>
                        <View style={styles.minerMetaRow}>
                          <Text style={styles.minerMaskedCode}>
                            {member.maskedId}
                          </Text>
                          <Text style={styles.dotDivider}>•</Text>
                          <View style={styles.streakRow}>
                            <Flame size={12} color="#F97316" />
                            <Text style={styles.streakText}>
                              {member.streakDays}d streak
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Right: Mined ⚡ Badge or Ping to Mine Button */}
                      <View style={styles.minerActionCol}>
                        {member.isMiningActive ? (
                          <View style={styles.minedBadgeCol}>
                            <View style={styles.minedBadge}>
                              <CheckCircle2 size={12} color="#16A34A" />
                              <Text style={styles.minedBadgeText}>Mined ⚡</Text>
                            </View>
                            <Text style={styles.cooldownText}>Cooldown active</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => handlePingMember(member)}
                            style={styles.pingBtn}
                            activeOpacity={0.85}
                          >
                            <Bell size={12} color="#FFFFFF" />
                            <Text style={styles.pingBtnText}>Ping to Mine</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        )}

        {/* 6. QUICK REPLIES POPOVER SHEET (Image 4) */}
        {showQuickSheet && (
          <View style={styles.quickRepliesSheet}>
            {/* Sheet Header */}
            <View style={styles.quickHeader}>
              <View style={styles.quickHeaderLeft}>
                <View style={styles.zapIconBox}>
                  <Zap size={14} color="#FFFFFF" />
                </View>
                <View>
                  <View style={styles.quickTitleRow}>
                    <Text style={styles.quickTitle}>Quick Replies</Text>
                    <View style={styles.typeSlashBadge}>
                      <Text style={styles.typeSlashText}>Type /</Text>
                    </View>
                  </View>
                  <Text style={styles.quickSubTitle} numberOfLines={1}>
                    Select a shortcut to instant send
                  </Text>
                </View>
              </View>

              <View style={styles.quickHeaderActions}>
                <TouchableOpacity
                  onPress={() => setQuickReplies(DEFAULT_QUICK_REPLIES)}
                  style={styles.quickActionIconBtn}
                >
                  <RotateCcw size={14} color="#1E5E36" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const newQR: QuickReplyItem = {
                      id: `qr_${Date.now()}`,
                      shortcut: '/custom',
                      label: '⚡ Custom Boost',
                      text: '⚡ Keep mining daily to maximize hash rate dividend!',
                      type: 'CHAT',
                    };
                    setQuickReplies((prev) => [...prev, newQR]);
                  }}
                  style={styles.quickNewBtn}
                >
                  <Plus size={12} color="#15803D" />
                  <Text style={styles.quickNewBtnText}>New</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowQuickSheet(false)}
                  style={styles.quickCloseBtn}
                >
                  <X size={14} color="#1E5E36" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Shortcuts List */}
            <ScrollView
              style={styles.quickListScroll}
              showsVerticalScrollIndicator={false}
            >
              {quickReplies.map((qr) => (
                <TouchableOpacity
                  key={qr.id}
                  onPress={() => handleSend(qr.text, qr.type)}
                  style={styles.quickItemRow}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickItemLeft}>
                    <View style={styles.quickTagRow}>
                      <View style={styles.shortcutBadge}>
                        <Text style={styles.shortcutText}>{qr.shortcut}</Text>
                      </View>
                      <Text style={styles.qrLabelText} numberOfLines={1}>
                        {qr.label}
                      </Text>
                      {qr.type === 'REMINDER' && (
                        <View style={styles.alertBadge}>
                          <Text style={styles.alertBadgeText}>ALERT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.qrMessagePreview} numberOfLines={1}>
                      {qr.text}
                    </Text>
                  </View>

                  <View style={styles.quickItemActions}>
                    <TouchableOpacity
                      onPress={() => handleSend(qr.text, qr.type)}
                      style={styles.sendShortcutBtn}
                    >
                      <Send size={13} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setInputText(qr.text);
                        setShowQuickSheet(false);
                      }}
                      style={styles.editShortcutBtn}
                    >
                      <Pencil size={13} color="#059669" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setQuickReplies((prev) => prev.filter((q) => q.id !== qr.id));
                      }}
                      style={styles.deleteShortcutBtn}
                    >
                      <Trash2 size={13} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 7. CIRCLE INFO & STATS POPUP MODAL */}
        <Modal
          visible={showStatsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowStatsModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              {/* Modal Header */}
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalHeaderLeft}>
                  <View style={styles.modalBarChartBox}>
                    <BarChart3 size={18} color="#15803D" />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Circle Details & Stats</Text>
                    <Text style={styles.modalSubTitle}>
                      Referred network performance
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setShowStatsModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={16} color="#1E5E36" />
                </TouchableOpacity>
              </View>

              {/* Host Summary Card */}
              <View style={styles.modalHostCard}>
                <View style={styles.modalHostAvatar}>
                  <Text style={styles.modalHostAvatarText}>
                    {(circleHost?.fullName || user?.fullName || 'H').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.modalHostInfo}>
                  <View style={styles.modalHostNameRow}>
                    <Text style={styles.modalHostName}>
                      {circleHost?.fullName || user?.fullName || 'Circle Host'}
                    </Text>
                    <View style={styles.modalLeaderBadge}>
                      <Text style={styles.modalLeaderBadgeText}>Leader</Text>
                    </View>
                  </View>
                  <View style={styles.modalCodeRow}>
                    <Text style={styles.modalCodeLabel}>Code:</Text>
                    <TouchableOpacity
                      onPress={copyReferralCode}
                      style={styles.modalCodeBox}
                    >
                      <Text style={styles.modalCodeText}>
                        {circleHost?.referralCode || user?.referralCode || 'GTMINING'}
                      </Text>
                      {copiedCode ? (
                        <Check size={11} color="#16A34A" />
                      ) : (
                        <Copy size={11} color="#15803D" />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.dotDivider}>•</Text>
                    <Text style={styles.modalMinersText}>
                      {totalMembersCount} Total Miners
                    </Text>
                  </View>
                </View>
              </View>

              {/* 3 Metric Summary Boxes */}
              <View style={styles.modalStatsGrid}>
                <View style={styles.modalStatBox}>
                  <Text style={styles.modalStatBoxLabel}>Total Circle</Text>
                  <Text style={styles.modalStatBoxVal}>{totalMembersCount}</Text>
                  <Text style={styles.modalStatBoxSub}>Members</Text>
                </View>

                <View style={[styles.modalStatBox, styles.modalStatBoxActive]}>
                  <Text style={styles.modalStatBoxLabelActive}>Mining</Text>
                  <Text style={styles.modalStatBoxValActive}>{activeMembersCount}</Text>
                  <Text style={styles.modalStatBoxSubActive}>Active</Text>
                </View>

                <View style={[styles.modalStatBox, styles.modalStatBoxIdle]}>
                  <Text style={styles.modalStatBoxLabelIdle}>Idle</Text>
                  <Text style={styles.modalStatBoxValIdle}>{idleMembersCount}</Text>
                  <Text style={styles.modalStatBoxSubIdle}>Ready</Text>
                </View>
              </View>

              {/* Nudge All Idle Button */}
              <TouchableOpacity
                onPress={handleNudgeAllIdle}
                style={[
                  styles.nudgeAllBtn,
                  idleMembersCount === 0 && styles.nudgeAllBtnDisabled,
                ]}
                activeOpacity={0.88}
                disabled={idleMembersCount === 0}
              >
                <Bell size={15} color="#FFFFFF" />
                <Text style={styles.nudgeAllBtnText}>
                  {idleMembersCount > 0
                    ? `Nudge All ${idleMembersCount} Idle Miners ⏰`
                    : 'All Miners Active ⚡'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    zIndex: 10,
  },

  /* 2. Subheader */
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
    zIndex: 20,
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  circleInfoTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  leaderAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  leaderAvatarText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#15803D',
  },
  onlineBadgeRing: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  titleCol: {
    flex: 1,
    gap: 1,
  },
  mainTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0A341B',
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  circleInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  circleInfoBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0A341B',
  },

  /* 3. Dual Tabs */
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: '#22C55E',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#1E5E36',
  },

  /* 4. Chat Area */
  chatAreaContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  },
  messageRowHost: {
    justifyContent: 'flex-end',
  },
  messageRowMember: {
    justifyContent: 'flex-start',
  },
  memberAvatarBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  memberAvatarText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
  },
  hostAvatarBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  hostAvatarText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bubbleWrapper: {
    maxWidth: '82%',
    gap: 4,
  },
  bubbleWrapperHost: {
    alignItems: 'flex-end',
  },
  bubbleWrapperMember: {
    alignItems: 'flex-start',
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bubbleHeaderHost: {
    justifyContent: 'flex-end',
  },
  bubbleHeaderMember: {
    justifyContent: 'flex-start',
  },
  senderNameText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A341B',
  },
  hostBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hostBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
  },
  messageTimeText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  bubbleBox: {
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  bubbleBoxHost: {
    backgroundColor: '#14532D',
    borderTopRightRadius: 4,
  },
  bubbleBoxMember: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  bubbleBoxReminder: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  reminderHeaderText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#B45309',
  },
  bubbleText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  bubbleTextHost: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bubbleTextMember: {
    color: '#0A341B',
    fontWeight: '500',
  },
  reminderActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.3)',
  },
  reminderYieldText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E5E36',
  },
  reminderMineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#22C55E',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  reminderMineBtnText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  /* Input Bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 197, 94, 0.2)',
    gap: 8,
  },
  quickReplyBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF8EE',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    fontSize: 12.5,
    color: '#0A341B',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  /* 5. Miners Status Area */
  minersAreaContainer: {
    flex: 1,
  },
  minersContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  minersCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    gap: 12,
  },
  minersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(34, 197, 94, 0.15)',
  },
  minersTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  minersTitleText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0A341B',
  },
  minersSubtitleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E5E36',
    marginTop: 2,
  },
  minersCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  minersCountBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#15803D',
  },

  /* Filter Pills */
  filterPillsRow: {
    flexDirection: 'row',
    backgroundColor: '#EAF8EE',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    gap: 4,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E5E36',
  },
  filterPillTextActive: {
    fontWeight: '900',
    color: '#0A341B',
  },

  /* Miners List */
  minersList: {
    gap: 10,
  },
  minerItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    gap: 10,
  },
  minerItemCardIdle: {
    backgroundColor: '#FFFBEB',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  minerAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  minerAvatarInitials: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  minerStatusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  minerStatusDotActive: {
    backgroundColor: '#22C55E',
  },
  minerStatusDotIdle: {
    backgroundColor: '#F59E0B',
  },
  minerInfoCol: {
    flex: 1,
    gap: 2,
  },
  minerNameText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0A341B',
  },
  minerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  minerMaskedCode: {
    fontSize: 10.5,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  dotDivider: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  minerActionCol: {
    alignItems: 'flex-end',
  },
  minedBadgeCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  minedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  minedBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#15803D',
  },
  cooldownText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1E5E36',
  },
  pingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  pingBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* 6. Quick Replies Sheet */
  quickRepliesSheet: {
    position: 'absolute',
    bottom: 60,
    left: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 290,
    overflow: 'hidden',
  },
  quickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#EAF8EE',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(34, 197, 94, 0.2)',
  },
  quickHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  zapIconBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A341B',
  },
  typeSlashBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  typeSlashText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  quickSubTitle: {
    fontSize: 9.5,
    color: '#1E5E36',
  },
  quickHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickActionIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  quickNewBtnText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  quickCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickListScroll: {
    padding: 8,
  },
  quickItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quickItemLeft: {
    flex: 1,
    gap: 2,
  },
  quickTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  shortcutBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  shortcutText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#15803D',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  qrLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A341B',
    maxWidth: 130,
  },
  alertBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  alertBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#B45309',
  },
  qrMessagePreview: {
    fontSize: 10,
    color: '#4B5563',
  },
  quickItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 6,
  },
  sendShortcutBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editShortcutBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#EAF8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteShortcutBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 7. Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#EBF8EF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    gap: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalBarChartBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0A341B',
  },
  modalSubTitle: {
    fontSize: 10.5,
    color: '#1E5E36',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  modalHostAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHostAvatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalHostInfo: {
    flex: 1,
    gap: 2,
  },
  modalHostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modalHostName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0A341B',
  },
  modalLeaderBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  modalLeaderBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
  },
  modalCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalCodeLabel: {
    fontSize: 10.5,
    color: '#6B7280',
  },
  modalCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  modalCodeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#15803D',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalMinersText: {
    fontSize: 10,
    color: '#1E5E36',
  },
  modalStatsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  modalStatBox: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    gap: 1,
  },
  modalStatBoxLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1E5E36',
  },
  modalStatBoxVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A341B',
  },
  modalStatBoxSub: {
    fontSize: 8.5,
    color: '#6B7280',
  },
  modalStatBoxActive: {
    backgroundColor: '#EAF8EE',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  modalStatBoxLabelActive: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  modalStatBoxValActive: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15803D',
  },
  modalStatBoxSubActive: {
    fontSize: 8.5,
    color: '#15803D',
  },
  modalStatBoxIdle: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  modalStatBoxLabelIdle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  modalStatBoxValIdle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#B45309',
  },
  modalStatBoxSubIdle: {
    fontSize: 8.5,
    color: '#B45309',
  },
  nudgeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nudgeAllBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  nudgeAllBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  emptyMessagesBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 8,
  },
  emptyMessagesIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#EBFBF0',
    borderWidth: 1,
    borderColor: '#C2F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyMessagesTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
  },
  emptyMessagesText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 260,
  },
  emptyMinersBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyMinersIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#EBFBF0',
    borderWidth: 1,
    borderColor: '#C2F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyMinersTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
  },
  emptyMinersText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  emptyInviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    marginTop: 6,
  },
  emptyInviteBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
