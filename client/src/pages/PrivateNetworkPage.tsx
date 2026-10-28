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

export const PrivateNetworkPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<PrivateNetworkData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'IDLE'>('ALL');
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'CHAT'>('CHAT'); // Mobile tab toggle

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const quickPrompts = [
    { label: '⏰ 4h Mining Reminder', text: '⏰ Reminder: Your 4-hour mining claim is ready! Claim 1 GT now.' },
    { label: '🔥 Team Hash Rate Alert', text: '🔥 Let’s keep our circle hash rate at 100%! Claim your mining cycle today.' },
    { label: '👋 Welcome Team', text: '👋 Welcome to our private circle! Reach out here if you have any questions.' },
  ];

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

  return (
    <div className="space-y-6 pb-28 sm:pb-16 max-w-7xl mx-auto">
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-white/90 text-xs font-bold text-[#1E5E36] hover:bg-white hover:text-[#0A341B] transition-all shadow-sm group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Dashboard</span>
            </Link>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[11px] font-black text-[#15803D]">
              <ShieldCheck className="w-3 h-3 text-[#16A34A]" />
              <span>PRIVATE CIRCLE</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0A341B] tracking-tight">
            Private Network
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#1E5E36]">
            Encrypted chatroom strictly between you ({hostName}) and your directly referred miners.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPrivateNetwork(true)}
            disabled={refreshing}
            className="p-2.5 rounded-2xl bg-white/80 border border-white/90 text-[#1E5E36] hover:text-[#0A341B] hover:bg-white transition-all shadow-sm"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={copyInviteLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-bold text-xs shadow-[0_8px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_12px_28px_rgba(34,197,94,0.45)] transition-all transform active:scale-95"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>Invite More Friends</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary & Host Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/85 border border-white shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#22C55E]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#22C55E] to-[#86EFAC] flex items-center justify-center font-black text-xl text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] shrink-0">
              {hostName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-[#0A341B]">{hostName}</span>
                <span className="px-2 py-0.5 rounded-md bg-[#22C55E]/20 text-[#15803D] text-[10px] font-black uppercase tracking-wider">
                  Circle Leader
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#1E5E36] font-medium mt-0.5">
                <span>Referral Code:</span>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-1 font-mono font-bold text-[#15803D] bg-white/90 px-2 py-0.5 rounded-lg border border-[#22C55E]/30 hover:bg-[#22C55E]/10 transition-colors"
                >
                  <span>{refCode}</span>
                  {copiedCode ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3 text-[#15803D]" />}
                </button>
                <span className="hidden sm:inline">•</span>
                <span>{totalCount} Total Referred Miners</span>
              </div>
            </div>
          </div>

          {/* Quick Broadcast Action */}
          <button
            onClick={handleNudgeAllIdle}
            disabled={idleCount === 0 || sending}
            className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all shadow-sm ${
              idleCount > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_8px_20px_rgba(245,158,11,0.3)] active:scale-95'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>
              {idleCount > 0 ? `Nudge All ${idleCount} Idle Miners ⏰` : 'All Miners Active ⚡'}
            </span>
          </button>
        </div>

        {/* 3 Overview Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-2">
          <div className="p-3 sm:p-4 rounded-2xl bg-white/80 border border-white/90 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-[#1E5E36]">Total Circle</span>
            <p className="text-xl sm:text-2xl font-black text-[#0A341B]">{totalCount}</p>
            <span className="text-[10px] text-[#1E5E36]/80 font-medium">Referred Members</span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#EAF8EE] border border-[#22C55E]/30 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
              <span className="text-[10px] sm:text-xs font-bold text-[#15803D]">Mining Active</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-[#15803D]">{activeCount}</p>
            <span className="text-[10px] text-[#15803D] font-medium">In 4h cooldown</span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[10px] sm:text-xs font-bold text-amber-800">Mining Idle</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-700">{idleCount}</p>
            <span className="text-[10px] text-amber-800 font-medium">Ready for reminder</span>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden rounded-2xl bg-white/80 p-1 border border-white shadow-sm">
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
            activeTab === 'CHAT'
              ? 'bg-[#22C55E] text-white shadow-md'
              : 'text-[#1E5E36] hover:text-[#0A341B]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Circle Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
            activeTab === 'MEMBERS'
              ? 'bg-[#22C55E] text-white shadow-md'
              : 'text-[#1E5E36] hover:text-[#0A341B]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members Status ({totalCount})</span>
        </button>
      </div>

      {/* 3. Main Workspace: Side-by-side or Tabbed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Referred Members & Mining Status */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            activeTab === 'MEMBERS' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="p-5 sm:p-6 rounded-3xl bg-white/85 border border-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0A341B] flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-[#16A34A]" />
                  <span>Referred Miners Status</span>
                </h3>
                <p className="text-xs text-[#1E5E36] font-medium">
                  Track 4-hour mining cycles for each member
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#22C55E]/30 text-xs font-black text-[#15803D]">
                {filteredMembers.length} Miners
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EAF8EE] border border-[#22C55E]/20 text-xs font-bold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-[#0A341B] shadow-sm font-black'
                    : 'text-[#1E5E36] hover:text-[#0A341B]'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-white text-[#15803D] shadow-sm font-black'
                    : 'text-[#1E5E36] hover:text-[#15803D]'
                }`}
              >
                Mining Active ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('IDLE')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  statusFilter === 'IDLE'
                    ? 'bg-white text-amber-700 shadow-sm font-black'
                    : 'text-[#1E5E36] hover:text-amber-700'
                }`}
              >
                Idle ({idleCount})
              </button>
            </div>

            {/* Member Cards List */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredMembers.map((member) => {
                return (
                  <div
                    key={member.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      member.isMiningActive
                        ? 'bg-white/90 border-[#22C55E]/20 hover:border-[#22C55E]/40'
                        : 'bg-amber-50/70 border-amber-200/70 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Member Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${member.avatarColor} text-white font-bold flex items-center justify-center shadow-sm shrink-0 relative`}
                        >
                          <span className="text-xs">{member.initials}</span>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
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
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-[10px] shadow-xs hover:shadow transition-all active:scale-95 whitespace-nowrap"
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
          className={`lg:col-span-7 space-y-4 ${
            activeTab === 'CHAT' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="p-5 sm:p-6 rounded-3xl bg-white/85 border border-white shadow-sm flex flex-col h-[680px]">
            {/* Chatroom Top Header */}
            <div className="pb-4 border-b border-[#22C55E]/15 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center text-[#15803D] shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0A341B] flex items-center gap-2">
                    <span>Private Circle Chat</span>
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  </h3>
                  <p className="text-xs text-[#1E5E36] font-medium">
                    Strictly visible to {hostName} and your {totalCount} referred miners
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-[#15803D] bg-[#22C55E]/10 px-2.5 py-1 rounded-xl">
                <Users className="w-3.5 h-3.5" />
                <span>{totalCount} Connected</span>
              </div>
            </div>

            {/* Quick Reminder Prompt Chips */}
            <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-black uppercase text-[#15803D] shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Quick:</span>
              </span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text, 'REMINDER')}
                  disabled={sending}
                  className="px-2.5 py-1 rounded-xl bg-white border border-[#22C55E]/30 text-[11px] font-bold text-[#1E5E36] hover:bg-[#22C55E]/15 hover:text-[#0A341B] hover:border-[#22C55E]/50 transition-all shrink-0 shadow-2xs"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 py-2">
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
                        <p>{msg.text}</p>

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

            {/* Input Form Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="pt-3 border-t border-[#22C55E]/15 flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Message your private circle (e.g. claim mining reward)..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#22C55E]/30 text-xs text-[#0A341B] placeholder-[#1E5E36]/60 font-medium focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50 focus:border-[#22C55E] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-black text-xs shadow-[0_4px_16px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.45)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
