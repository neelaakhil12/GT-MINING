import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Send,
  Pickaxe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Sparkles,
  ShieldCheck,
  Zap,
  Flame,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  X,
  BarChart3,
  Plus,
  Trash2,
  Pencil,
  RotateCcw,
  AtSign,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  PrivateNetworkMember,
  PrivateNetworkMessage,
  PrivateNetworkData,
} from '../types';

export interface QuickReply {
  id: string;
  shortcut: string;
  label: string;
  text: string;
  type: 'REMINDER' | 'CHAT';
  isCustom?: boolean;
}

export const PrivateNetworkPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<PrivateNetworkData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'IDLE'>('ALL');
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'CHAT'>('CHAT'); // Mobile tab toggle

  const DEFAULT_QUICK_REPLIES: QuickReply[] = [
    {
      id: '1',
      shortcut: '/reminder',
      label: '⏰ 4h Mining Claim',
      text: '⏰ Reminder: Your 4-hour mining claim is ready! Claim 1 GT now.',
      type: 'REMINDER',
    },
    {
      id: '2',
      shortcut: '/hashrate',
      label: '🔥 Team Hash Rate Boost',
      text: '🔥 Let’s keep our circle hash rate at 100%! Claim your mining cycle today.',
      type: 'REMINDER',
    },
    {
      id: '3',
      shortcut: '/welcome',
      label: '👋 Welcome to Circle',
      text: '👋 Welcome to our private circle! Reach out here if you have any questions.',
      type: 'CHAT',
    },
    {
      id: '4',
      shortcut: '/streak',
      label: '⚡ Daily Streak Alert',
      text: '⚡ Keep your daily streak going! Don’t let your mining bonus reset.',
      type: 'REMINDER',
    },
    {
      id: '5',
      shortcut: '/sync',
      label: '⛏️ Node Sync Check',
      text: '⛏️ Active mining cycle in progress. Sync your node now to maximize team rewards!',
      type: 'REMINDER',
    },
  ];

  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(() => {
    try {
      const saved = localStorage.getItem('gt_circle_quick_replies');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_QUICK_REPLIES;
  });

  const [showQuickMenu, setShowQuickMenu] = useState<boolean>(false);
  const [showMentionMenu, setShowMentionMenu] = useState<boolean>(false);
  const [mentionQuery, setMentionQuery] = useState<string>('');
  const [showAddQuickModal, setShowAddQuickModal] = useState<boolean>(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [newShortcut, setNewShortcut] = useState<string>('');
  const [newLabel, setNewLabel] = useState<string>('');
  const [newText, setNewText] = useState<string>('');
  const [newType, setNewType] = useState<'REMINDER' | 'CHAT'>('REMINDER');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchPrivateNetwork = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.getPrivateNetwork();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load private network data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrivateNetwork();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  const handleSendMessage = async (textToSend?: string, type: 'CHAT' | 'REMINDER' = 'CHAT') => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const res = await api.sendPrivateNetworkMessage({
        text,
        type,
      });

      if (res.success && res.message) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, res.message],
          };
        });
        if (!textToSend) setInputText('');
        showToast(type === 'REMINDER' ? 'Mining reminder posted to circle!' : 'Message sent!', 'success');

        // Trigger confetti for mining alerts
        if (type === 'REMINDER') {
          confetti({
            particleCount: 25,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#22C55E', '#16A34A', '#86EFAC'],
          });
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handlePingMember = async (member: PrivateNetworkMember) => {
    try {
      const res = await api.pingPrivateNetworkMember({
        memberId: member.id,
        memberName: member.name,
      });

      if (res.success && res.message) {
        setData((prev) => {
          if (!prev) return prev;
          const updatedMembers = prev.members.map((m) =>
            m.id === member.id ? { ...m, lastPingedAt: new Date().toISOString() } : m
          );
          return {
            ...prev,
            members: updatedMembers,
            messages: [...prev.messages, res.message],
          };
        });

        showToast(`Mining reminder ping sent to ${member.name}!`, 'success');
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#22C55E', '#10B981'],
        });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to ping member', 'error');
    }
  };

  const handleNudgeAllIdle = async () => {
    const idleCount = data?.stats.idleCount || 0;
    if (idleCount === 0) {
      showToast('All your circle members are currently active miners!', 'info');
      return;
    }

    const broadcastText = `⏰ Network Alert to all ${idleCount} idle miners: Your 4-hour GT mining cycle is ready! Tap 'Mine Now' to claim your 1.00 GT token and boost our circle hash rate!`;
    await handleSendMessage(broadcastText, 'REMINDER');
  };

  const copyInviteLink = () => {
    const code = user?.referralCode || data?.circleHost?.referralCode || 'GTMINING';
    const link = `${window.location.origin}/signup?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast('Invite link copied! Share with friends to add them to your private network.', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const copyCode = () => {
    const code = user?.referralCode || data?.circleHost?.referralCode || 'GTMINING';
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('Referral code copied!', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const filteredMembers = (data?.members || []).filter((m) => {
    if (statusFilter === 'ACTIVE') return m.isMiningActive;
    if (statusFilter === 'IDLE') return !m.isMiningActive;
    return true;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    // Slash command trigger
    if (val.startsWith('/')) {
      setShowQuickMenu(true);
      setShowMentionMenu(false);
    } else if (showQuickMenu && !val) {
      setShowQuickMenu(false);
    }

    // Mention trigger: check if cursor or end of input has @ followed by query without spaces
    const cursor = e.target.selectionStart ?? val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const lastAtMatch = textBeforeCursor.match(/(?:^|\s)@([^\s@]*)$/);

    if (lastAtMatch) {
      setShowMentionMenu(true);
      setMentionQuery(lastAtMatch[1].toLowerCase());
      setShowQuickMenu(false);
    } else {
      setShowMentionMenu(false);
      setMentionQuery('');
    }
  };

  const handleSelectMention = (memberName: string) => {
    const cursor = inputRef.current?.selectionStart ?? inputText.length;
    const textBeforeCursor = inputText.slice(0, cursor);
    const textAfterCursor = inputText.slice(cursor);

    // Replace the trailing @query with @MemberName 
    const updatedBeforeCursor = textBeforeCursor.replace(/(?:^|\s)@([^\s@]*)$/, (match) => {
      const leadingSpace = match.startsWith(' ') ? ' ' : '';
      return `${leadingSpace}@${memberName} `;
    });
    const newText = updatedBeforeCursor + textAfterCursor;
    setInputText(newText);
    setShowMentionMenu(false);
    setMentionQuery('');

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = updatedBeforeCursor.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  const renderMessageText = (text: string, isHost: boolean) => {
    const memberNames = [
      user?.fullName || 'Alex Reynolds',
      ...(data?.members || []).map((m) => m.name),
    ];

    // Split text by tokens starting with @
    const parts = text.split(/(@[a-zA-Z0-9_]+(?:\s+[a-zA-Z0-9_]+)?)/g);

    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('@')) {
            const rawName = part.slice(1).trim().toLowerCase();
            const isMatch = memberNames.some((m) => {
              const lower = m.toLowerCase();
              return lower.startsWith(rawName) || rawName.startsWith(lower) || lower.split(' ')[0] === rawName;
            });

            if (isMatch || rawName.length > 0) {
              return (
                <span
                  key={i}
                  className={`font-black px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 mx-0.5 ${
                    isHost
                      ? 'bg-white/30 text-white shadow-2xs'
                      : 'bg-[#22C55E]/20 text-[#15803D]'
                  }`}
                >
                  <span>{part}</span>
                </span>
              );
            }
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const handleSelectQuickReply = (qr: QuickReply, autoSend = false) => {
    if (autoSend) {
      handleSendMessage(qr.text, qr.type);
      setShowQuickMenu(false);
      setInputText('');
    } else {
      setInputText(qr.text);
      setShowQuickMenu(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleOpenAddQuickReply = () => {
    setEditingReplyId(null);
    setNewShortcut('');
    setNewLabel('');
    setNewText('');
    setNewType('REMINDER');
    setShowAddQuickModal(true);
  };

  const handleOpenEditQuickReply = (qr: QuickReply, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingReplyId(qr.id);
    setNewShortcut(qr.shortcut);
    setNewLabel(qr.label);
    setNewText(qr.text);
    setNewType(qr.type);
    setShowAddQuickModal(true);
  };

  const handleResetQuickReplies = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickReplies(DEFAULT_QUICK_REPLIES);
    try {
      localStorage.removeItem('gt_circle_quick_replies');
    } catch (err) {}
    showToast('Quick replies reset to defaults', 'info');
  };

  const handleSaveCustomQuickReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcut.trim() || !newText.trim()) return;

    let formattedShortcut = newShortcut.trim().toLowerCase();
    if (!formattedShortcut.startsWith('/')) {
      formattedShortcut = `/${formattedShortcut}`;
    }

    if (editingReplyId) {
      // Update existing quick reply
      const updated = quickReplies.map((qr) => {
        if (qr.id === editingReplyId) {
          return {
            ...qr,
            shortcut: formattedShortcut,
            label: newLabel.trim() || formattedShortcut,
            text: newText.trim(),
            type: newType,
          };
        }
        return qr;
      });
      setQuickReplies(updated);
      try {
        localStorage.setItem('gt_circle_quick_replies', JSON.stringify(updated));
      } catch (err) {}
      showToast(`Quick reply ${formattedShortcut} updated!`, 'success');
    } else {
      // Create new quick reply
      const newReply: QuickReply = {
        id: `custom_${Date.now()}`,
        shortcut: formattedShortcut,
        label: newLabel.trim() || formattedShortcut,
        text: newText.trim(),
        type: newType,
        isCustom: true,
      };
      const updated = [...quickReplies, newReply];
      setQuickReplies(updated);
      try {
        localStorage.setItem('gt_circle_quick_replies', JSON.stringify(updated));
      } catch (err) {}
      showToast(`Quick reply ${formattedShortcut} saved!`, 'success');
    }

    setEditingReplyId(null);
    setNewShortcut('');
    setNewLabel('');
    setNewText('');
    setShowAddQuickModal(false);
  };

  const handleDeleteQuickReply = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = quickReplies.filter((qr) => qr.id !== id);
    setQuickReplies(updated);
    try {
      localStorage.setItem('gt_circle_quick_replies', JSON.stringify(updated));
    } catch (err) {}
    showToast('Quick reply deleted', 'info');
  };

  const filterQuery = inputText.startsWith('/') ? inputText.slice(1).toLowerCase().trim() : '';
  const filteredQuickReplies = quickReplies.filter((qr) => {
    if (!filterQuery) return true;
    return (
      qr.shortcut.toLowerCase().includes(filterQuery) ||
      qr.label.toLowerCase().includes(filterQuery) ||
      qr.text.toLowerCase().includes(filterQuery)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse pb-28">
        <div className="h-10 w-48 bg-white/60 rounded-2xl" />
        <div className="h-44 bg-white/60 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-96 bg-white/60 rounded-3xl" />
          <div className="lg:col-span-7 h-96 bg-white/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  const hostName = user?.fullName || data?.circleHost?.fullName || 'Network Host';
  const refCode = user?.referralCode || data?.circleHost?.referralCode || 'GTMINING';
  const totalCount = data?.stats.totalMembers || data?.members.length || 0;
  const activeCount = data?.stats.activeMiningCount || 0;
  const idleCount = data?.stats.idleCount || 0;

  const mentionCandidates = [
    // Include all circle referred members first
    ...(data?.members || []).map((m) => ({
      id: m.id,
      name: m.name,
      maskedId: m.maskedId,
      isMiningActive: m.isMiningActive,
      initials: m.initials,
      avatarColor: m.avatarColor,
      streakDays: m.streakDays,
      isHost: false,
    })),
    // Include Host if different from current user
    ...(hostName !== user?.fullName
      ? [
          {
            id: data?.circleHost?.id || 'host',
            name: hostName,
            maskedId: 'Circle Leader',
            isMiningActive: true,
            initials: hostName.charAt(0).toUpperCase(),
            avatarColor: 'from-[#22C55E] to-[#16A34A]',
            streakDays: 1,
            isHost: true,
          },
        ]
      : []),
  ].filter((m) => {
    if (!mentionQuery) return true;
    return (
      m.name.toLowerCase().includes(mentionQuery) ||
      m.maskedId.toLowerCase().includes(mentionQuery)
    );
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full max-h-full overflow-hidden space-y-2 max-w-7xl w-full mx-auto">
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between gap-2 shrink-0 py-1">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-white/80 border border-white/90 text-[#1E5E36] hover:bg-white hover:text-[#0A341B] transition-all shadow-sm shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer p-1 rounded-2xl hover:bg-white/40 transition-colors"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center text-[#15803D] shrink-0 font-black text-sm relative">
              {hostName.charAt(0).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-2 ring-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-[#0A341B] truncate flex items-center gap-1.5">
                <span>Private Circle Chat</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] font-semibold text-[#15803D] truncate flex items-center gap-1">
                <span>{totalCount} Members</span>
                <span>•</span>
                <span>{activeCount} Mining Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowStatsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-white text-xs font-bold text-[#1E5E36] hover:bg-white hover:text-[#0A341B] transition-all shadow-xs active:scale-95"
            title="View Circle Details & Stats"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Circle Info</span>
          </button>
        </div>
      </div>

      {/* Circle Info & Stats Popup Modal */}
      {showStatsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowStatsModal(false)}
        >
          <div
            className="max-w-md w-full bg-[#EBF8EF] border border-white/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#22C55E]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center text-[#15803D]">
                  <BarChart3 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0A341B]">Circle Details & Stats</h3>
                  <p className="text-[11px] text-[#1E5E36] font-medium">Referred network performance</p>
                </div>
              </div>

              <button
                onClick={() => setShowStatsModal(false)}
                className="w-8 h-8 rounded-full bg-white/80 border border-white flex items-center justify-center text-[#1E5E36] hover:text-[#0A341B] hover:bg-white shadow-sm transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Host Details */}
            <div className="p-4 rounded-2xl bg-white/90 border border-white shadow-sm flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] flex items-center justify-center font-black text-lg text-white shadow-sm shrink-0">
                {hostName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[#0A341B] truncate">{hostName}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#22C55E]/20 text-[#15803D] text-[9px] font-black uppercase">
                    Leader
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#1E5E36] font-medium mt-0.5">
                  <span>Code:</span>
                  <button
                    onClick={copyCode}
                    className="inline-flex items-center gap-1 font-mono font-bold text-[#15803D] bg-white px-1.5 py-0.5 rounded border border-[#22C55E]/30"
                  >
                    <span>{refCode}</span>
                    {copiedCode ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3 text-[#15803D]" />}
                  </button>
                  <span>•</span>
                  <span>{totalCount} Total Miners</span>
                </div>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-2.5 relative z-10">
              <div className="p-3 rounded-2xl bg-white/80 border border-white shadow-sm">
                <span className="text-[10px] font-bold text-[#1E5E36]">Total Circle</span>
                <p className="text-lg font-black text-[#0A341B]">{totalCount}</p>
                <span className="text-[9px] text-[#1E5E36]/80">Members</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#EAF8EE] border border-[#22C55E]/30 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
                  <span className="text-[10px] font-bold text-[#15803D]">Mining</span>
                </div>
                <p className="text-lg font-black text-[#15803D]">{activeCount}</p>
                <span className="text-[9px] text-[#15803D]">Active</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-bold text-amber-800">Idle</span>
                </div>
                <p className="text-lg font-black text-amber-700">{idleCount}</p>
                <span className="text-[9px] text-amber-800">Ready</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1 relative z-10">
              <button
                onClick={() => {
                  handleNudgeAllIdle();
                  setShowStatsModal(false);
                }}
                disabled={idleCount === 0 || sending}
                className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                  idleCount > 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.3)] active:scale-95'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>
                  {idleCount > 0 ? `Nudge All ${idleCount} Idle Miners ⏰` : 'All Miners Active ⚡'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden rounded-xl bg-white/80 p-1 border border-white shadow-2xs shrink-0">
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`flex-1 py-1.5 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'CHAT'
              ? 'bg-[#22C55E] text-white shadow-sm'
              : 'text-[#1E5E36] hover:text-[#0A341B]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`flex-1 py-1.5 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'MEMBERS'
              ? 'bg-[#22C55E] text-white shadow-sm'
              : 'text-[#1E5E36] hover:text-[#0A341B]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Miners Status ({totalCount})</span>
        </button>
      </div>

      {/* 3. Main Workspace: Side-by-side or Tabbed */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-hidden">
        {/* Left Column: Referred Members & Mining Status */}
        <div
          className={`lg:col-span-5 h-full flex flex-col min-h-0 overflow-hidden ${
            activeTab === 'MEMBERS' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex-1 min-h-0 p-4 sm:p-5 rounded-3xl bg-white/85 border border-white shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 shrink-0 border-b border-[#22C55E]/15">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#0A341B] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#16A34A]" />
                  <span>Referred Miners</span>
                </h3>
                <p className="text-[11px] text-[#1E5E36] font-medium">
                  {activeCount} active • {idleCount} idle
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white border border-[#22C55E]/30 text-xs font-black text-[#15803D]">
                {filteredMembers.length}
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EAF8EE] border border-[#22C55E]/20 text-[11px] font-bold my-2.5 shrink-0">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-[#0A341B] shadow-2xs font-black'
                    : 'text-[#1E5E36]'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-white text-[#15803D] shadow-2xs font-black'
                    : 'text-[#1E5E36]'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('IDLE')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  statusFilter === 'IDLE'
                    ? 'bg-white text-amber-700 shadow-2xs font-black'
                    : 'text-[#1E5E36]'
                }`}
              >
                Idle ({idleCount})
              </button>
            </div>

            {/* Member Cards List - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y space-y-2 pr-1">
              {filteredMembers.map((member) => {
                return (
                  <div
                    key={member.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      member.isMiningActive
                        ? 'bg-white/90 border-[#22C55E]/20 hover:border-[#22C55E]/40'
                        : 'bg-amber-50/70 border-amber-200/70 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Member Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${member.avatarColor} text-white font-bold flex items-center justify-center shadow-sm shrink-0 relative`}
                        >
                          <span className="text-xs">{member.initials}</span>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              member.isMiningActive ? 'bg-[#22C55E]' : 'bg-amber-500'
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-[#0A341B] truncate">
                            {member.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#1E5E36] font-medium whitespace-nowrap">
                            <span className="font-mono">{member.maskedId}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 font-bold text-[#15803D]">
                              <Flame className="w-2.5 h-2.5 text-orange-500" />
                              {member.streakDays}d streak
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status / Action Button */}
                      <div className="shrink-0 flex items-center">
                        {member.isMiningActive ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#22C55E]/15 text-[#15803D] text-[10px] font-black">
                              <CheckCircle2 className="w-2.5 h-2.5 text-[#16A34A]" />
                              <span>Mined ⚡</span>
                            </span>
                            <p className="text-[9px] text-[#1E5E36] font-semibold mt-0.5">
                              Cooldown active
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePingMember(member)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-[10px] shadow-xs hover:shadow transition-all active:scale-95 whitespace-nowrap"
                          >
                            <Bell className="w-2.5 h-2.5" />
                            <span>Ping to Mine</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-xs text-[#1E5E36]">
                  No members found matching this filter.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Private Network Chatroom */}
        <div
          className={`lg:col-span-7 h-full flex flex-col min-h-0 overflow-hidden ${
            activeTab === 'CHAT' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex-1 min-h-0 rounded-3xl bg-white/85 border border-white shadow-sm flex flex-col overflow-hidden relative">
            {/* Messages Stream - ONLY THIS SCROLLS! Background & Header stay 100% still */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-3.5 p-3 sm:p-4 touch-pan-y">
              {(data?.messages || []).map((msg) => {
                const isHost = msg.senderRole === 'HOST' || msg.senderId === user?.id;
                const isReminder = msg.type === 'REMINDER';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isHost ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isHost
                          ? 'bg-gradient-to-tr from-[#22C55E] to-[#16A34A] text-white shadow-sm'
                          : 'bg-white border border-[#22C55E]/30 text-[#15803D] shadow-2xs'
                      }`}
                    >
                      {msg.senderAvatar || msg.senderName.charAt(0)}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[82%] sm:max-w-[75%] space-y-1`}>
                      <div
                        className={`flex items-center gap-2 text-[10px] ${
                          isHost ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span className="font-bold text-[#0A341B]">{msg.senderName}</span>
                        {isHost && (
                          <span className="px-1.5 py-0.2 rounded bg-[#22C55E]/20 text-[#15803D] font-black text-[9px]">
                            HOST
                          </span>
                        )}
                        <span className="text-[#1E5E36]/70">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                          isReminder
                            ? 'bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-300 text-[#0A341B] shadow-sm'
                            : isHost
                            ? 'bg-[#15803D] text-white shadow-sm rounded-tr-xs'
                            : 'bg-white text-[#0A341B] border border-white/80 shadow-2xs rounded-tl-xs'
                        }`}
                      >
                        {isReminder && (
                          <div className="flex items-center gap-1.5 text-amber-700 font-black text-[11px] mb-1.5">
                            <Bell className="w-3.5 h-3.5" />
                            <span>MINING ALERT & CYCLE REMINDER</span>
                          </div>
                        )}
                        <div className="leading-relaxed whitespace-pre-wrap break-words">
                          {renderMessageText(msg.text, isHost)}
                        </div>

                        {/* Interactive Mine Now Call to Action inside Reminder bubbles */}
                        {isReminder && (
                          <div className="pt-2.5 mt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-[#1E5E36] font-bold">
                              4-Hour cycle yield: +1.00 GT
                            </span>
                            <Link
                              to="/mining"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-black text-[11px] shadow-sm hover:scale-105 transition-all"
                            >
                              <Pickaxe className="w-3 h-3" />
                              <span>Mine Now</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* WhatsApp Quick Replies Popover (Type / or tap ⚡) */}
            {showQuickMenu && (
              <div
                className="absolute bottom-14 left-2 right-2 sm:left-4 sm:right-4 z-40 bg-white/95 backdrop-blur-xl border border-[#22C55E]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[320px] animate-in fade-in slide-in-from-bottom-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Popover Header */}
                <div className="p-2.5 sm:p-3 bg-[#EAF8EE] border-b border-[#22C55E]/20 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#22C55E] text-white flex items-center justify-center shrink-0">
                      <Zap className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-[#0A341B] truncate flex items-center gap-1.5">
                        <span>Quick Replies</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#15803D] font-mono font-bold">
                          Type /
                        </span>
                      </h4>
                      <p className="text-[10px] text-[#1E5E36] truncate">
                        Select a shortcut to instant send or edit
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleResetQuickReplies}
                      className="p-1 rounded-lg bg-white border border-[#22C55E]/30 text-[#1E5E36] hover:bg-[#22C55E]/10 transition-all"
                      title="Reset to Defaults"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAddQuickReply}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#22C55E]/30 text-[#15803D] hover:bg-[#22C55E]/10 font-bold text-[10px] transition-all shadow-2xs active:scale-95"
                      title="Add Custom Quick Reply"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuickMenu(false)}
                      className="w-6 h-6 rounded-lg bg-white/80 hover:bg-white text-[#1E5E36] flex items-center justify-center transition-all"
                      title="Close"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Templates List */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-1.5 touch-pan-y">
                  {filteredQuickReplies.map((qr) => (
                    <div
                      key={qr.id}
                      onClick={() => handleSelectQuickReply(qr, false)}
                      className="p-2 sm:p-2.5 rounded-xl hover:bg-[#F0FAF3] border border-transparent hover:border-[#22C55E]/20 transition-all flex items-center justify-between gap-2 cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] sm:text-[11px] font-black text-[#15803D] bg-[#22C55E]/15 px-1.5 py-0.5 rounded">
                            {qr.shortcut}
                          </span>
                          <span className="text-xs font-bold text-[#0A341B] truncate">
                            {qr.label}
                          </span>
                          {qr.type === 'REMINDER' && (
                            <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1 rounded">
                              ALERT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#1E5E36]/90 truncate mt-0.5 font-medium">
                          {qr.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Instant Send */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectQuickReply(qr, true);
                          }}
                          className="px-2 py-1 rounded-lg bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs hover:shadow active:scale-95 transition-all"
                          title="Instant Send"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span className="hidden sm:inline">Send</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditQuickReply(qr, e)}
                          className="p-1 rounded-lg text-[#15803D] hover:bg-[#22C55E]/15 bg-white border border-[#22C55E]/20 transition-all active:scale-95 shadow-2xs"
                          title="Edit shortcut"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteQuickReply(qr.id, e)}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 bg-white border border-red-200 transition-all active:scale-95 shadow-2xs"
                          title="Delete shortcut"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredQuickReplies.length === 0 && (
                    <div className="py-6 text-center text-xs text-[#1E5E36]">
                      No shortcuts matching "{filterQuery}". Tap "+ New" to create one!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WhatsApp Member Mention Popover (Type @ or tap @) */}
            {showMentionMenu && (
              <div
                className="absolute bottom-14 left-2 right-2 sm:left-4 sm:right-4 z-40 bg-white/95 backdrop-blur-xl border border-[#22C55E]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[300px] animate-in fade-in slide-in-from-bottom-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Popover Header */}
                <div className="p-2.5 sm:p-3 bg-[#EAF8EE] border-b border-[#22C55E]/20 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#22C55E] text-white flex items-center justify-center shrink-0">
                      <AtSign className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-[#0A341B] truncate flex items-center gap-1.5">
                        <span>Mention Member</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#15803D] font-mono font-bold">
                          Type @
                        </span>
                      </h4>
                      <p className="text-[10px] text-[#1E5E36] truncate">
                        Select a member to tag and ping them in circle
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMentionMenu(false)}
                    className="w-6 h-6 rounded-lg bg-white/80 hover:bg-white text-[#1E5E36] flex items-center justify-center transition-all"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Candidates List */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-1 touch-pan-y">
                  {mentionCandidates.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => handleSelectMention(member.name)}
                      className="p-2 rounded-xl hover:bg-[#F0FAF3] border border-transparent hover:border-[#22C55E]/20 transition-all flex items-center justify-between gap-2.5 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${member.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0 relative`}
                        >
                          <span>{member.initials}</span>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white ${
                              member.isMiningActive ? 'bg-[#22C55E]' : 'bg-amber-500'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[#0A341B] truncate">
                              {member.name}
                            </span>
                            {member.isHost && (
                              <span className="px-1 py-0.2 rounded bg-[#22C55E]/20 text-[#15803D] text-[9px] font-black">
                                HOST
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-[#1E5E36] font-medium">
                            <span className="font-mono">{member.maskedId}</span>
                            <span>•</span>
                            <span
                              className={`font-bold ${
                                member.isMiningActive ? 'text-[#15803D]' : 'text-amber-700'
                              }`}
                            >
                              {member.isMiningActive ? 'Mining Active ⚡' : 'Idle (Ready to Mine) ⏰'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black text-[#15803D] bg-white px-2 py-0.5 rounded-lg border border-[#22C55E]/30">
                          @{member.name.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  ))}

                  {mentionCandidates.length === 0 && (
                    <div className="py-6 text-center text-xs text-[#1E5E36]">
                      No members found matching "@{mentionQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WhatsApp Docked Bottom Input Bar - Permanently docked at bottom of card */}
            <div className="p-2 sm:p-2.5 bg-white border-t border-[#22C55E]/15 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                {/* Quick Reply / Slash Trigger Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(!showQuickMenu);
                    setShowMentionMenu(false);
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    showQuickMenu
                      ? 'bg-[#22C55E] text-white shadow-sm ring-2 ring-[#22C55E]/40'
                      : 'bg-[#F0FAF3] hover:bg-[#E0F5E7] text-[#15803D] border border-[#22C55E]/30'
                  }`}
                  title="Quick Replies (or type '/')"
                >
                  <Zap className="w-4 h-4" />
                </button>

                <div className="relative flex-1 bg-[#F0FAF3] border border-[#22C55E]/30 rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xs flex items-center gap-2 focus-within:ring-2 focus-within:ring-[#22C55E]/50 focus-within:bg-white transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowMentionMenu(false);
                        setShowQuickMenu(false);
                      }
                    }}
                    placeholder="Type a message (type '@' to mention friend)..."
                    className="w-full bg-transparent text-xs text-[#0A341B] placeholder-[#1E5E36]/60 font-medium focus:outline-none"
                  />
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('');
                        setShowQuickMenu(false);
                      }}
                      className="text-[#1E5E36]/60 hover:text-[#0A341B] p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 ml-0.5 text-white" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Custom Quick Reply Shortcut */}
      {showAddQuickModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddQuickModal(false)}
        >
          <div
            className="max-w-md w-full bg-[#EBF8EF] border border-white/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center text-[#15803D]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0A341B]">
                    {editingReplyId ? 'Edit Quick Reply' : 'Create Quick Reply'}
                  </h3>
                  <p className="text-[11px] text-[#1E5E36] font-medium">
                    {editingReplyId ? 'Modify shortcut trigger or message content' : 'Save custom shortcut like in WhatsApp'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddQuickModal(false);
                  setEditingReplyId(null);
                }}
                className="w-8 h-8 rounded-full bg-white/80 border border-white flex items-center justify-center text-[#1E5E36] hover:text-[#0A341B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomQuickReply} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0A341B] mb-1">
                  Shortcut Trigger (e.g. /ping, /reminder)
                </label>
                <input
                  type="text"
                  value={newShortcut}
                  onChange={(e) => setNewShortcut(e.target.value)}
                  placeholder="/reminder"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#22C55E]/30 font-mono text-xs text-[#0A341B] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A341B] mb-1">
                  Shortcut Name / Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. 4h Mining Claim"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#22C55E]/30 text-xs text-[#0A341B] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A341B] mb-1">
                  Message Content
                </label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Type the message to send when using this shortcut..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#22C55E]/30 text-xs text-[#0A341B] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A341B] mb-1">
                  Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('REMINDER')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      newType === 'REMINDER'
                        ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs font-black'
                        : 'bg-white border-[#22C55E]/30 text-[#1E5E36]'
                    }`}
                  >
                    ⏰ Mining Alert Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('CHAT')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      newType === 'CHAT'
                        ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#15803D] shadow-2xs font-black'
                        : 'bg-white border-[#22C55E]/30 text-[#1E5E36]'
                    }`}
                  >
                    💬 Standard Chat
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddQuickModal(false);
                    setEditingReplyId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#1E5E36] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-xs font-black shadow-sm hover:shadow active:scale-95 transition-all"
                >
                  {editingReplyId ? 'Update Shortcut' : 'Save Shortcut'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

