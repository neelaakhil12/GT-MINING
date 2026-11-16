import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Users,
  Search,
  RefreshCw,
  Trash2,
  Shield,
  Zap,
  Calendar,
  Mail,
  UserCheck,
  ChevronRight,
  Send,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';

interface RoomSummary {
  circleHostId: string;
  host: {
    id: string;
    fullName: string;
    email: string;
    referralCode: string;
    avatar: string | null;
    accountStatus: string;
    createdAt: string;
  };
  stats: {
    totalMembers: number;
    activeMiningCount: number;
    totalMessages: number;
  };
  lastMessage: {
    id: string;
    senderName: string;
    senderRole: string;
    text: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}

interface RoomMember {
  id: string;
  fullName: string;
  email: string;
  referralCode: string;
  role: string;
  isHost: boolean;
  isMiningActive: boolean;
  lastMiningAt: string | null;
  avatar: string | null;
  rewardEarned?: number;
}

interface RoomMessage {
  id: string;
  circleId?: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderAvatar?: string;
  text: string;
  type?: string;
  createdAt: string;
}

interface RoomDetail {
  circleHostId: string;
  host: RoomMember;
  members: RoomMember[];
  messages: RoomMessage[];
  stats: {
    totalMembers: number;
    activeMiningCount: number;
    totalMessages: number;
  };
}

export const AdminPrivateRoomsPage: React.FC = () => {
  const { showToast } = useToast();

  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);

  const [roomDetail, setRoomDetail] = useState<RoomDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'members'>('chat');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch all rooms
  const fetchRooms = async (query = search, silent = false) => {
    if (!silent) setLoadingRooms(true);
    try {
      const res = await api.getAdminPrivateRooms(query);
      if (res && res.success) {
        setRooms(res.rooms || []);
        // Auto-select first room if none selected
        if (!selectedHostId && res.rooms && res.rooms.length > 0) {
          setSelectedHostId(res.rooms[0].circleHostId);
        }
      } else {
        if (!silent) showToast(res?.message || 'Failed to fetch rooms', 'error');
      }
    } catch (err: any) {
      if (!silent) showToast(err?.message || 'Network error fetching rooms', 'error');
    } finally {
      if (!silent) setLoadingRooms(false);
    }
  };

  // Fetch room detail when selectedHostId changes
  const fetchDetail = async (circleHostId: string, silent = false) => {
    if (!silent) setLoadingDetail(true);
    try {
      const res = await api.getAdminPrivateRoomDetail(circleHostId);
      if (res && res.success) {
        setRoomDetail(res);
      } else {
        if (!silent) showToast(res?.message || 'Failed to load room details', 'error');
      }
    } catch (err: any) {
      if (!silent) showToast(err?.message || 'Error loading room conversation', 'error');
    } finally {
      if (!silent) setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedHostId) {
      fetchDetail(selectedHostId);
    } else {
      setRoomDetail(null);
    }
  }, [selectedHostId]);

  // Scroll to bottom when messages update in chat tab
  useEffect(() => {
    if (activeTab === 'chat' && roomDetail?.messages) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [roomDetail?.messages, activeTab]);

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedHostId) return;
    if (!window.confirm('Are you sure you want to delete this message from the private room?')) {
      return;
    }

    try {
      const res = await api.deleteAdminPrivateRoomMessage(selectedHostId, messageId);
      if (res && res.success) {
        showToast('Message deleted successfully', 'success');
        // Update local state
        setRoomDetail((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages.filter((m) => m.id !== messageId),
            stats: {
              ...prev.stats,
              totalMessages: Math.max(0, prev.stats.totalMessages - 1),
            },
          };
        });
        // Update room list summary
        setRooms((prev) =>
          prev.map((r) =>
            r.circleHostId === selectedHostId
              ? {
                  ...r,
                  stats: { ...r.stats, totalMessages: Math.max(0, r.stats.totalMessages - 1) },
                }
              : r
          )
        );
      } else {
        showToast(res?.message || 'Failed to delete message', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error deleting message', 'error');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRooms(search);
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const totalAllMessages = rooms.reduce((acc, r) => acc + (r.stats.totalMessages || 0), 0);
  const totalAllMembers = rooms.reduce((acc, r) => acc + (r.stats.totalMembers || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-4">
      <AdminNav />

      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B2516] to-[#04160E] border-2 border-[#86EFAC]/25 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#86EFAC]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Private Rooms & Chats</h1>
          </div>
          <p className="text-xs text-[#A7C9B1] mt-1">
            Real-time monitoring and moderation of all private circle networks and member discussions.
          </p>
        </div>

        {/* Global Stats Counter */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#22C55E]/15 rounded-xl border border-[#22C55E]/30 text-center">
            <div className="text-[10px] font-bold text-[#86EFAC] uppercase">Total Rooms</div>
            <div className="text-lg font-black text-white">{rooms.length}</div>
          </div>
          <div className="px-4 py-2 bg-sky-500/15 rounded-xl border border-sky-500/30 text-center">
            <div className="text-[10px] font-bold text-sky-400 uppercase">Members</div>
            <div className="text-lg font-black text-white">{totalAllMembers}</div>
          </div>
          <div className="px-4 py-2 bg-purple-500/15 rounded-xl border border-purple-500/30 text-center">
            <div className="text-[10px] font-bold text-purple-400 uppercase">Messages</div>
            <div className="text-lg font-black text-white">{totalAllMessages}</div>
          </div>
          <button
            onClick={() => {
              fetchRooms(search);
              if (selectedHostId) fetchDetail(selectedHostId);
            }}
            className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-[#86EFAC] transition cursor-pointer"
            title="Refresh All"
          >
            <RefreshCw className={`w-5 h-5 ${loadingRooms ? 'animate-spin text-[#86EFAC]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Split-Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Rooms Directory (5 cols) */}
        <div className="lg:col-span-5 bg-[#071F14] rounded-3xl border border-[#86EFAC]/25 shadow-xl flex flex-col h-[740px] overflow-hidden">
          {/* Search Bar Header */}
          <div className="p-4 border-b border-white/10 bg-[#0B2516]/60">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search host, email, referral code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-20 py-2 text-xs bg-[#0B2516] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#86EFAC]/50"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#22C55E] text-black font-black rounded-lg text-xs hover:bg-[#16A34A] transition cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Rooms Directory List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {loadingRooms ? (
              <div className="p-12 text-center text-[#A7C9B1]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#86EFAC]" />
                <p className="text-xs">Loading private rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-12 text-center text-[#A7C9B1]">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#86EFAC]" />
                <p className="text-sm font-bold text-white">No private rooms found</p>
                <p className="text-xs text-[#A7C9B1] mt-1">
                  {search ? 'Try clearing your search query' : 'Rooms will appear as users interact'}
                </p>
              </div>
            ) : (
              rooms.map((room) => {
                const isSelected = room.circleHostId === selectedHostId;
                const hostInitial = (room.host.fullName || 'H').charAt(0).toUpperCase();

                return (
                  <button
                    key={room.circleHostId}
                    onClick={() => setSelectedHostId(room.circleHostId)}
                    className={`w-full text-left p-4 transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#22C55E]/15 border-l-4 border-l-[#22C55E]'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Host Avatar */}
                    <div className="relative shrink-0">
                      {room.host.avatar ? (
                        <img
                          src={room.host.avatar}
                          alt={room.host.fullName}
                          className="w-11 h-11 rounded-full object-cover border border-[#86EFAC]/30"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#22C55E] to-[#10B981] text-white font-black flex items-center justify-center text-sm shadow-sm">
                          {hostInitial}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase border border-[#071F14]">
                        Host
                      </span>
                    </div>

                    {/* Room Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white text-sm truncate">
                          {room.host.fullName}
                        </span>
                        <span className="text-[11px] text-[#A7C9B1]/60 shrink-0">
                          {formatTime(room.updatedAt)}
                        </span>
                      </div>

                      <div className="text-xs text-[#A7C9B1] truncate mt-0.5">
                        {room.host.email} • Code:{' '}
                        <span className="font-mono font-medium text-[#86EFAC]">
                          {room.host.referralCode}
                        </span>
                      </div>

                      {/* Last message preview */}
                      <p className="text-xs text-neutral-300 truncate mt-1.5 bg-black/40 rounded px-2 py-1 border border-white/5">
                        {room.lastMessage ? (
                          <>
                            <span className="font-bold text-white">
                              {room.lastMessage.senderName}:
                            </span>{' '}
                            {room.lastMessage.text}
                          </>
                        ) : (
                          <span className="italic text-neutral-500">No messages yet</span>
                        )}
                      </p>

                      {/* Stats Badges */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                          <Users className="w-3 h-3 text-[#86EFAC]" />
                          {room.stats.totalMembers} members
                        </span>
                        {room.stats.activeMiningCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#86EFAC] bg-[#22C55E]/20 border border-[#22C55E]/30 px-2 py-0.5 rounded-full">
                            <Zap className="w-3 h-3 text-[#4ADE80]" />
                            {room.stats.activeMiningCount} active
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full">
                          <MessageSquare className="w-3 h-3 text-purple-400" />
                          {room.stats.totalMessages}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Room Detail & Full Chat Thread (7 cols) */}
        <div className="lg:col-span-7 bg-[#071F14] rounded-3xl border border-[#86EFAC]/25 shadow-xl flex flex-col h-[740px] overflow-hidden">
          {!selectedHostId || !roomDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#A7C9B1]">
              <div className="w-16 h-16 rounded-2xl bg-[#0B2516] border border-[#86EFAC]/20 flex items-center justify-center text-[#86EFAC] mb-3">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Select a Private Room</h3>
              <p className="text-xs text-[#A7C9B1] max-w-sm mt-1">
                Choose any room from the list on the left to monitor live conversations, view room
                members, and manage messages.
              </p>
            </div>
          ) : (
            <>
              {/* Room Header */}
              <div className="p-4 border-b border-white/10 bg-[#0B2516]/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#22C55E] to-[#10B981] text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                    {(roomDetail.host.fullName || 'H').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-white text-sm truncate">
                        {roomDetail.host.fullName}&apos;s Private Room
                      </h2>
                      <span className="text-[10px] font-black bg-amber-500 text-black px-1.5 py-0.2 rounded uppercase">
                        Host
                      </span>
                    </div>
                    <p className="text-xs text-[#A7C9B1] truncate">
                      {roomDetail.host.email} • Code:{' '}
                      <span className="font-mono font-medium text-[#86EFAC]">
                        {roomDetail.host.referralCode}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Tab switchers: Chat vs Members */}
                <div className="flex items-center gap-1 bg-[#0B2516] p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      activeTab === 'chat'
                        ? 'bg-[#22C55E] text-black shadow-sm'
                        : 'text-[#A7C9B1] hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat ({roomDetail.stats.totalMessages})
                  </button>
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      activeTab === 'members'
                        ? 'bg-[#22C55E] text-black shadow-sm'
                        : 'text-[#A7C9B1] hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Members ({roomDetail.stats.totalMembers})
                  </button>
                  <button
                    onClick={() => fetchDetail(selectedHostId, true)}
                    className="p-1.5 text-[#86EFAC] hover:bg-white/5 rounded-lg transition cursor-pointer"
                    title="Refresh Chat"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* View 1: Chat Feed */}
              {activeTab === 'chat' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#04160E]">
                  {loadingDetail ? (
                    <div className="h-full flex items-center justify-center text-[#86EFAC]">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#86EFAC]" />
                    </div>
                  ) : roomDetail.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-[#A7C9B1] py-16">
                      <MessageSquare className="w-8 h-8 opacity-30 text-[#86EFAC] mb-2" />
                      <p className="text-sm font-bold text-white">No messages in this room yet</p>
                      <p className="text-xs text-[#A7C9B1] max-w-xs mt-1">
                        When the host or members send messages in this private room, they will appear
                        here live.
                      </p>
                    </div>
                  ) : (
                    roomDetail.messages.map((msg) => {
                      const isHost = msg.senderRole === 'HOST';
                      const initial = (msg.senderName || 'M').charAt(0).toUpperCase();

                      return (
                        <div
                          key={msg.id}
                          className="group flex items-start gap-2.5 max-w-2xl hover:bg-white/5 p-2 rounded-xl transition"
                        >
                          {/* Sender Avatar */}
                          <div className="relative shrink-0">
                            {msg.senderAvatar &&
                            typeof msg.senderAvatar === 'string' &&
                            (msg.senderAvatar.startsWith('http') ||
                              msg.senderAvatar.startsWith('/')) ? (
                              <img
                                src={msg.senderAvatar}
                                alt={msg.senderName}
                                className="w-8 h-8 rounded-full object-cover border border-[#86EFAC]/30"
                              />
                            ) : (
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                  isHost
                                    ? 'bg-gradient-to-tr from-amber-500 to-amber-600'
                                    : 'bg-gradient-to-tr from-[#22C55E] to-[#10B981]'
                                }`}
                              >
                                {initial}
                              </div>
                            )}
                          </div>

                          {/* Message Bubble Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">
                                {msg.senderName}
                              </span>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                                  isHost
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-[#22C55E]/20 text-[#86EFAC] border border-[#22C55E]/30'
                                }`}
                              >
                                {isHost ? 'Host' : 'Member'}
                              </span>
                              <span className="text-[10px] text-[#A7C9B1]/60">
                                {formatTime(msg.createdAt)}
                              </span>

                              {/* Delete message button (Admin Action) */}
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 ml-auto p-1 text-neutral-500 hover:text-red-400 rounded transition cursor-pointer"
                                title="Delete message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="mt-1 text-xs text-neutral-100 leading-relaxed bg-[#0B2516] border border-[#86EFAC]/20 rounded-2xl rounded-tl-sm px-3.5 py-2 shadow-xs inline-block break-words max-w-full">
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

              {/* View 2: Room Members Directory */}
              {activeTab === 'members' && (
                <div className="flex-1 overflow-y-auto p-4 divide-y divide-white/5 bg-[#071F14]">
                  <div className="text-xs font-bold text-[#86EFAC] uppercase tracking-wider mb-2">
                    Room Members Directory ({roomDetail.members.length})
                  </div>
                  {roomDetail.members.map((member) => (
                    <div
                      key={member.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-white/5 px-2 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${
                            member.isHost
                              ? 'bg-amber-500'
                              : 'bg-[#22C55E]'
                          }`}
                        >
                          {(member.fullName || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs truncate">
                              {member.fullName}
                            </span>
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                                member.isHost
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-[#22C55E]/20 text-[#86EFAC] border border-[#22C55E]/30'
                              }`}
                            >
                              {member.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#A7C9B1] truncate">
                            {member.email} • Code:{' '}
                            <span className="font-mono font-medium text-[#86EFAC]">
                              {member.referralCode}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Member Mining Status */}
                      <div className="text-right shrink-0">
                        {member.isMiningActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#86EFAC] bg-[#22C55E]/20 border border-[#22C55E]/30 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                            Mining Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                            Idle
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
