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
    <div className="space-y-6">
      <AdminNav />

      {/* Top Header Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Private Rooms & Chats</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time monitoring and moderation of all private circle networks and member discussions.
          </p>
        </div>

        {/* Global Stats Counter */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
            <div className="text-xs font-semibold text-emerald-700 uppercase">Total Rooms</div>
            <div className="text-lg font-bold text-emerald-950">{rooms.length}</div>
          </div>
          <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 text-center">
            <div className="text-xs font-semibold text-blue-700 uppercase">Members</div>
            <div className="text-lg font-bold text-blue-950">{totalAllMembers}</div>
          </div>
          <div className="px-4 py-2 bg-purple-50 rounded-xl border border-purple-100 text-center">
            <div className="text-xs font-semibold text-purple-700 uppercase">Messages</div>
            <div className="text-lg font-bold text-purple-950">{totalAllMessages}</div>
          </div>
          <button
            onClick={() => {
              fetchRooms(search);
              if (selectedHostId) fetchDetail(selectedHostId);
            }}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
            title="Refresh All"
          >
            <RefreshCw className={`w-5 h-5 ${loadingRooms ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Split-Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Rooms Directory (5 cols) */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-sm flex flex-col h-[740px] overflow-hidden">
          {/* Search Bar Header */}
          <div className="p-4 border-b border-gray-100 bg-emerald-50/40">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search host, email, referral code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-20 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Rooms Directory List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loadingRooms ? (
              <div className="p-12 text-center text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                <p className="text-sm">Loading private rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium text-gray-600">No private rooms found</p>
                <p className="text-xs text-gray-400 mt-1">
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
                    className={`w-full text-left p-4 transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    {/* Host Avatar */}
                    <div className="relative shrink-0">
                      {room.host.avatar ? (
                        <img
                          src={room.host.avatar}
                          alt={room.host.fullName}
                          className="w-11 h-11 rounded-full object-cover border border-emerald-200"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {hostInitial}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase border border-white">
                        Host
                      </span>
                    </div>

                    {/* Room Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {room.host.fullName}
                        </span>
                        <span className="text-[11px] text-gray-400 shrink-0">
                          {formatTime(room.updatedAt)}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {room.host.email} • Code:{' '}
                        <span className="font-mono font-medium text-emerald-700">
                          {room.host.referralCode}
                        </span>
                      </div>

                      {/* Last message preview */}
                      <p className="text-xs text-gray-600 truncate mt-1.5 bg-gray-50/90 rounded px-2 py-0.5 border border-gray-100">
                        {room.lastMessage ? (
                          <>
                            <span className="font-medium text-gray-800">
                              {room.lastMessage.senderName}:
                            </span>{' '}
                            {room.lastMessage.text}
                          </>
                        ) : (
                          <span className="italic text-gray-400">No messages yet</span>
                        )}
                      </p>

                      {/* Stats Badges */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          <Users className="w-3 h-3 text-gray-500" />
                          {room.stats.totalMembers} members
                        </span>
                        {room.stats.activeMiningCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <Zap className="w-3 h-3 text-emerald-600" />
                            {room.stats.activeMiningCount} active
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
                          <MessageSquare className="w-3 h-3 text-purple-600" />
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
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-sm flex flex-col h-[740px] overflow-hidden">
          {!selectedHostId || !roomDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-3">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Select a Private Room</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                Choose any room from the list on the left to monitor live conversations, view room
                members, and manage messages.
              </p>
            </div>
          ) : (
            <>
              {/* Room Header */}
              <div className="p-4 border-b border-gray-100 bg-emerald-50/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                    {(roomDetail.host.fullName || 'H').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-gray-900 text-sm truncate">
                        {roomDetail.host.fullName}&apos;s Private Room
                      </h2>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded uppercase">
                        Host
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {roomDetail.host.email} • Code:{' '}
                      <span className="font-mono font-medium text-emerald-700">
                        {roomDetail.host.referralCode}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Tab switchers: Chat vs Members */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'chat'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat ({roomDetail.stats.totalMessages})
                  </button>
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'members'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Members ({roomDetail.stats.totalMembers})
                  </button>
                  <button
                    onClick={() => fetchDetail(selectedHostId, true)}
                    className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                    title="Refresh Chat"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* View 1: Chat Feed */}
              {activeTab === 'chat' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9FBFA]">
                  {loadingDetail ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                    </div>
                  ) : roomDetail.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-16">
                      <MessageSquare className="w-8 h-8 opacity-40 mb-2" />
                      <p className="text-sm font-medium text-gray-600">No messages in this room yet</p>
                      <p className="text-xs text-gray-400 max-w-xs mt-1">
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
                          className="group flex items-start gap-2.5 max-w-2xl hover:bg-emerald-50/30 p-2 rounded-xl transition"
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
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                  isHost
                                    ? 'bg-gradient-to-tr from-amber-500 to-amber-600'
                                    : 'bg-gradient-to-tr from-emerald-500 to-teal-500'
                                }`}
                              >
                                {initial}
                              </div>
                            )}
                          </div>

                          {/* Message Bubble Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900 truncate">
                                {msg.senderName}
                              </span>
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                  isHost
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isHost ? 'Host' : 'Member'}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {formatTime(msg.createdAt)}
                              </span>

                              {/* Delete message button (Admin Action) */}
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 ml-auto p-1 text-gray-400 hover:text-red-600 rounded transition"
                                title="Delete inappropriate message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="mt-1 text-xs text-gray-800 leading-relaxed bg-white border border-gray-200/80 rounded-2xl rounded-tl-sm px-3.5 py-2 shadow-xs inline-block break-words max-w-full">
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
                <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Room Members Directory ({roomDetail.members.length})
                  </div>
                  {roomDetail.members.map((member) => (
                    <div
                      key={member.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50 px-2 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                            member.isHost
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                        >
                          {(member.fullName || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-xs truncate">
                              {member.fullName}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                member.isHost
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {member.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {member.email} • Code:{' '}
                            <span className="font-mono font-medium text-emerald-700">
                              {member.referralCode}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Member Mining Status */}
                      <div className="text-right shrink-0">
                        {member.isMiningActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Mining Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
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
