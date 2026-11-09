import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Play,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Eye,
  Check,
  Sparkles,
  X as CloseIcon,
  Clock,
  Coins,
  Globe,
  Upload,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminNav } from './AdminNav';

export interface AdminTaskItem {
  id: string;
  category: 'social' | 'video';
  title: string;
  description: string;
  reward: number;
  rewardLabel: string;
  buttonLabel: string;
  url: string;
  duration?: number;
  iconType: 'x' | 'instagram' | 'youtube' | 'telegram' | 'facebook' | 'tiktok' | 'video';
  isActive: boolean;
  createdAt?: string;
}

const DEFAULT_TASKS: AdminTaskItem[] = [
  {
    id: 'task_x',
    category: 'social',
    title: 'Follow us on X',
    description: 'Follow the official GT protocol account for instant announcements',
    reward: 2,
    rewardLabel: '+2 GT',
    buttonLabel: 'Follow on X',
    url: 'https://x.com',
    iconType: 'x',
    isActive: true,
  },
  {
    id: 'task_instagram',
    category: 'social',
    title: 'Follow on Instagram',
    description: 'Join our official global community',
    reward: 2,
    rewardLabel: '+2 GT',
    buttonLabel: 'Follow',
    url: 'https://instagram.com',
    iconType: 'instagram',
    isActive: true,
  },
  {
    id: 'task_youtube',
    category: 'social',
    title: 'Subscribe on YouTube',
    description: 'Subscribe to the GT channel for node guides',
    reward: 2,
    rewardLabel: '+2 GT',
    buttonLabel: 'Subscribe',
    url: 'https://youtube.com',
    iconType: 'youtube',
    isActive: true,
  },
  {
    id: 'task_telegram',
    category: 'social',
    title: 'Join Telegram',
    description: 'Join the official GT announcements channel',
    reward: 1,
    rewardLabel: '+1 GT',
    buttonLabel: 'Join',
    url: 'https://t.me',
    iconType: 'telegram',
    isActive: true,
  },
  {
    id: 'task_facebook',
    category: 'social',
    title: 'Follow on Facebook',
    description: 'Stay updated with GT ecosystem news',
    reward: 1,
    rewardLabel: '+1 GT',
    buttonLabel: 'Follow',
    url: 'https://facebook.com',
    iconType: 'facebook',
    isActive: true,
  },
  {
    id: 'task_tiktok',
    category: 'social',
    title: 'Follow on TikTok',
    description: 'Discover GT short updates and viral reels',
    reward: 1,
    rewardLabel: '+1 GT',
    buttonLabel: 'Follow',
    url: 'https://tiktok.com',
    iconType: 'tiktok',
    isActive: true,
  },
];

const PLATFORM_PRESETS = [
  { iconType: 'video', label: 'Custom Video / YouTube Player', category: 'video', defaultBtn: 'Watch video' },
  { iconType: 'youtube', label: 'YouTube Channel Subscribe', category: 'social', defaultBtn: 'Subscribe' },
  { iconType: 'x', label: 'X (Twitter) Profile Follow', category: 'social', defaultBtn: 'Follow on X' },
  { iconType: 'instagram', label: 'Instagram Profile Follow', category: 'social', defaultBtn: 'Follow' },
  { iconType: 'telegram', label: 'Telegram Community Channel', category: 'social', defaultBtn: 'Join' },
  { iconType: 'facebook', label: 'Facebook Page Follow', category: 'social', defaultBtn: 'Follow' },
  { iconType: 'tiktok', label: 'TikTok Account Follow', category: 'social', defaultBtn: 'Follow' },
] as const;

// YouTube Embed URL helper
const getYouTubeEmbedUrl = (rawUrl: string): string | null => {
  if (!rawUrl) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = rawUrl.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
    : null;
};

export const AdminTasksPage: React.FC = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<AdminTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'social'>('all');

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AdminTaskItem | null>(null);
  const [previewVideoTask, setPreviewVideoTask] = useState<AdminTaskItem | null>(null);

  const [category, setCategory] = useState<'video' | 'social'>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState<number | ''>('');
  const [buttonLabel, setButtonLabel] = useState('');
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [iconType, setIconType] = useState<AdminTaskItem['iconType']>('video');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      showToast('Video size should be less than 50MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUrl(reader.result);
        setIconType('video');
        showToast('Video file loaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.getAdminTasks();
      if (res.success && Array.isArray(res.tasks) && res.tasks.length > 0) {
        setTasks(res.tasks);
      } else {
        setTasks(DEFAULT_TASKS);
      }
    } catch {
      setTasks(DEFAULT_TASKS);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = (presetCategory: 'video' | 'social' = 'video') => {
    setEditingTask(null);
    setCategory(presetCategory);
    setTitle('');
    setDescription('');
    setReward('');
    setButtonLabel('');
    setUrl('');
    setDuration('');
    setIconType(presetCategory === 'video' ? 'video' : 'x');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (task: AdminTaskItem) => {
    setEditingTask(task);
    setCategory(task.category);
    setTitle(task.title || '');
    setDescription(task.description || '');
    setReward(task.reward !== undefined && task.reward !== null ? task.reward : '');
    setButtonLabel(task.buttonLabel || '');
    setUrl(task.url || '');
    setDuration(task.duration !== undefined && task.duration !== null ? task.duration : '');
    setIconType(task.iconType || (task.category === 'video' ? 'video' : 'x'));
    setIsActive(task.isActive !== false);
    setModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      showToast('Task title and URL / Video Source are required', 'error');
      return;
    }

    setSaving(true);
    try {
      let finalIconType: AdminTaskItem['iconType'] = 'video';
      if (category === 'video') {
        finalIconType = 'video';
      } else {
        if (url.includes('youtube.com') || url.includes('youtu.be')) finalIconType = 'youtube';
        else if (url.includes('x.com') || url.includes('twitter.com')) finalIconType = 'x';
        else if (url.includes('instagram.com')) finalIconType = 'instagram';
        else if (url.includes('t.me') || url.includes('telegram')) finalIconType = 'telegram';
        else if (url.includes('facebook.com')) finalIconType = 'facebook';
        else if (url.includes('tiktok.com')) finalIconType = 'tiktok';
        else finalIconType = 'x';
      }

      const numReward = Number(reward) || (category === 'video' ? 2 : 1);
      const numDuration = category === 'video' ? (Number(duration) || 15) : 0;
      const finalButtonLabel = buttonLabel.trim() || (category === 'video' ? 'Watch video' : 'Follow');

      const payload = {
        category,
        title: title.trim(),
        description: description.trim(),
        reward: numReward,
        rewardLabel: `+${numReward} GT`,
        buttonLabel: finalButtonLabel,
        url: url.trim(),
        duration: numDuration,
        iconType: finalIconType,
        isActive,
      };

      if (editingTask) {
        const res = await api.updateAdminTask(editingTask.id, payload);
        if (res.success) {
          showToast('Task updated successfully!', 'success');
        }
      } else {
        const res = await api.createAdminTask(payload);
        if (res.success) {
          showToast('New Task published successfully!', 'success');
        }
      }
      setModalOpen(false);
      await fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Failed to save task', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await api.deleteAdminTask(id);
      if (res.success) {
        showToast('Task deleted successfully', 'success');
        await fetchTasks();
      }
    } catch (err: any) {
      showToast('Failed to delete task', 'error');
    }
  };

  const handleToggleActive = async (task: AdminTaskItem) => {
    try {
      const updatedStatus = !task.isActive;
      await api.updateAdminTask(task.id, { isActive: updatedStatus });
      setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, isActive: updatedStatus } : t)));
      showToast(`Task ${updatedStatus ? 'activated' : 'deactivated'}`, 'success');
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'all') return true;
    return t.category === activeFilter;
  });

  const videoTasksCount = tasks.filter(t => t.category === 'video').length;
  const socialTasksCount = tasks.filter(t => t.category === 'social').length;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4">
      <AdminNav />

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B2516] to-[#04160E] border-2 border-[#86EFAC]/25 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#4ADE80]">
              <Video className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Daily & Video Tasks Management
            </h2>
          </div>
          <p className="text-xs text-[#A7C9B1] mt-1.5">
            Create, upload, and configure daily video watch tasks and social media quests with GT token rewards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleOpenCreate('video')}
            className="px-5 py-3 rounded-2xl font-black text-xs text-[#07130D] bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:brightness-110 shadow-[0_4px_20px_rgba(251,191,36,0.35)] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Upload Video Task</span>
          </button>
          <button
            onClick={() => handleOpenCreate('social')}
            className="px-4 py-3 rounded-2xl font-bold text-xs text-white bg-white/10 hover:bg-white/15 border border-white/15 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Social Task</span>
          </button>
        </div>
      </div>

      {/* Analytics & Metrics Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#092215] border border-[#86EFAC]/20 space-y-1">
          <p className="text-[11px] font-bold text-[#A7C9B1]">TOTAL TASKS</p>
          <p className="text-2xl font-black text-white">{tasks.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#092215] border border-rose-500/30 space-y-1">
          <p className="text-[11px] font-bold text-rose-300">VIDEO WATCH TASKS</p>
          <p className="text-2xl font-black text-white flex items-center gap-1.5">
            <Video className="w-5 h-5 text-rose-400" />
            <span>{videoTasksCount}</span>
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#092215] border border-[#38BDF8]/30 space-y-1">
          <p className="text-[11px] font-bold text-sky-300">SOCIAL MEDIA QUESTS</p>
          <p className="text-2xl font-black text-white">{socialTasksCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#092215] border border-[#FBBF24]/30 space-y-1">
          <p className="text-[11px] font-bold text-amber-300">ACTIVE REWARDS</p>
          <p className="text-2xl font-black text-[#FBBF24]">
            +{tasks.reduce((acc, t) => acc + (t.isActive ? (t.reward || 0) : 0), 0)} GT
          </p>
        </div>
      </div>

      {/* Main Content Area: Left Tasks List, Right Live Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Cols: Task Cards & Filter */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {(['all', 'video', 'social'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-[#22C55E] text-[#07130D] shadow-sm'
                    : 'bg-[#0B2516]/60 text-[#A7C9B1] border border-[#86EFAC]/15 hover:text-white'
                }`}
              >
                {tab === 'all' && `All Tasks (${tasks.length})`}
                {tab === 'video' && `Video Tasks (${videoTasksCount})`}
                {tab === 'social' && `Social Media (${socialTasksCount})`}
              </button>
            ))}
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-[#0B2516]/40 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0B2516]/40 border border-white/10 space-y-3">
              <Video className="w-10 h-10 text-[#A7C9B1] mx-auto opacity-40" />
              <p className="text-sm font-bold text-white">No tasks configured in this category.</p>
              <button
                onClick={() => handleOpenCreate(activeFilter === 'video' ? 'video' : 'social')}
                className="px-4 py-2 rounded-xl bg-[#22C55E] text-[#07130D] text-xs font-bold cursor-pointer"
              >
                + Add Task Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl bg-[#0B2516]/90 border transition-all ${
                    task.isActive
                      ? 'border-[#86EFAC]/25 hover:border-[#86EFAC]/50'
                      : 'border-white/10 opacity-60'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        task.category === 'video'
                          ? 'bg-[#EF4444] text-white'
                          : task.iconType === 'youtube'
                          ? 'bg-[#FF0000] text-white'
                          : task.iconType === 'instagram'
                          ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white'
                          : task.iconType === 'telegram'
                          ? 'bg-[#0088cc] text-white'
                          : task.iconType === 'facebook'
                          ? 'bg-[#1877f2] text-white'
                          : task.iconType === 'tiktok'
                          ? 'bg-black text-white border border-white/20'
                          : 'bg-black text-white'
                      }`}
                    >
                      {task.category === 'video' ? (
                        <Play className="w-6 h-6 fill-current text-white translate-x-0.5" />
                      ) : (
                        <span className="font-black text-base uppercase">
                          {task.iconType.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            task.category === 'video'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {task.category === 'video' ? 'VIDEO QUEST' : 'SOCIAL QUEST'}
                        </span>
                        {task.duration ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#86EFAC] bg-[#22C55E]/15 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.duration}s watch</span>
                          </span>
                        ) : null}
                      </div>

                      <h4 className="text-sm font-black text-white truncate mt-1">
                        {task.title}
                      </h4>
                      <p className="text-xs text-[#A7C9B1] truncate mt-0.5">
                        {task.description}
                      </p>
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#86EFAC] hover:underline flex items-center gap-1 mt-1 truncate max-w-sm"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{task.url}</span>
                      </a>
                    </div>
                  </div>

                  {/* Right: Reward & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                    <span className="px-3 py-1.5 rounded-xl bg-[#22C55E]/20 text-[#86EFAC] border border-[#22C55E]/30 font-black text-xs">
                      {task.rewardLabel || `+${task.reward} GT`}
                    </span>

                    {task.category === 'video' && task.url && (
                      <button
                        onClick={() => setPreviewVideoTask(task)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#22C55E]/20 hover:bg-[#22C55E]/30 text-[#4ADE80] border border-[#22C55E]/40 cursor-pointer transition-all flex items-center gap-1.5 text-[11px] font-bold"
                        title="Preview & Play Uploaded Video"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Video</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleActive(task)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                        task.isActive
                          ? 'bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/30'
                          : 'bg-white/5 text-neutral-400 border border-white/10'
                      }`}
                      title="Toggle active status"
                    >
                      {task.isActive ? 'Active' : 'Disabled'}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#86EFAC] cursor-pointer transition-all"
                      title="Edit task"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400 cursor-pointer transition-all"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Live User Mobile Preview */}
        <div className="lg:col-span-5 bg-[#071F14] border border-[#86EFAC]/25 rounded-3xl p-5 sticky top-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#86EFAC]" />
              <span className="text-xs font-black text-white">Live Mobile Tasks Preview</span>
            </div>
            <span className="text-[10px] text-[#86EFAC] font-mono">Exact App View</span>
          </div>

          {/* Smartphone Bezel */}
          <div className="w-full max-w-[340px] mx-auto rounded-[36px] bg-[#0A2A1A] border-4 border-[#22C55E]/40 p-3 shadow-2xl overflow-hidden text-neutral-800">
            {/* Phone Screen Top Header */}
            <div className="rounded-[28px] bg-gradient-to-b from-[#F0FAF3] to-[#E6F7ED] p-4 min-h-[480px] flex flex-col justify-between">
              
              <div className="space-y-3">
                {/* Simulated App Bar */}
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-lg bg-[#22C55E] flex items-center justify-center font-black text-white text-[10px]">
                    GT
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white text-[10px] font-bold text-[#15803D] shadow-sm">
                    Your task rewards: 0.00 GT
                  </div>
                </div>

                {/* Section Title */}
                <div>
                  <h5 className="text-xs font-black text-[#0A341B] tracking-tight">
                    DAILY & SOCIAL TASKS
                  </h5>
                  <p className="text-[10px] text-[#1E5E36]">
                    Complete tasks and collect rewards (0/{tasks.length} DONE)
                  </p>
                </div>

                {/* Filter Pills preview */}
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-[#0A341B] text-white">
                    All ({tasks.length})
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-white/80 text-[#1E5E36]">
                    Video ({videoTasksCount})
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-white/80 text-[#1E5E36]">
                    Social ({socialTasksCount})
                  </span>
                </div>

                {/* Tasks Cards Preview list */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {tasks.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-2xl bg-white border border-[#22C55E]/20 shadow-sm flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${
                            t.category === 'video' ? 'bg-[#EF4444]' : 'bg-[#0A341B]'
                          }`}
                        >
                          {t.category === 'video' ? (
                            <Play className="w-4 h-4 fill-current text-white translate-x-0.5" />
                          ) : (
                            <span className="text-[10px] font-bold uppercase">{t.iconType.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-[#0A341B] truncate">{t.title}</p>
                          <p className="text-[9px] text-[#1E5E36] truncate">{t.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-black text-[#15803D] block">{t.rewardLabel}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-[#0A341B] text-white text-[8px] font-bold inline-block">
                          {t.buttonLabel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom footer note */}
              <div className="text-center pt-2 border-t border-black/5">
                <span className="text-[9px] text-[#15803D] font-bold">
                  ✓ Instant GT credit to Pioneer wallet
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Create or Edit Task */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)] flex flex-col rounded-3xl bg-[#092215] border-2 border-[#86EFAC]/40 shadow-2xl my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#092215] shrink-0 sticky top-0 z-10 gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                <span className="w-8 h-8 rounded-xl bg-[#22C55E]/20 text-[#86EFAC] flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4" />
                </span>
                <h3 className="text-sm sm:text-base md:text-lg font-black text-white truncate">
                  {editingTask ? 'Edit Task / Video Quest' : 'Upload New Task / Video Quest'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer shrink-0"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4">
              {/* Task Category Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A7C9B1]">Task Category *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('video');
                      setIconType('video');
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      category === 'video'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : 'bg-[#05160E] text-neutral-400 border-white/10'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    <span>Video Watch Task</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCategory('social');
                      setIconType('x');
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      category === 'social'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                        : 'bg-[#05160E] text-neutral-400 border-white/10'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Social Media Quest</span>
                  </button>
                </div>
              </div>

              {/* Task Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1]">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title (e.g. Watch Video or Follow on X)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                />
              </div>

              {/* Video Content (Direct Upload File OR YouTube Link) */}
              {category === 'video' ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#A7C9B1]">Video Source *</label>
                    <span className="text-[10px] text-[#86EFAC]">Direct Video Upload or YouTube Link</span>
                  </div>

                  {/* Hidden Video File Input */}
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />

                  {/* Option 1: Direct File Upload */}
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#0F3520] hover:bg-[#16492C] border-2 border-dashed border-[#22C55E]/50 hover:border-[#22C55E] text-[#86EFAC] text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md group"
                  >
                    <Upload className="w-4 h-4 text-[#22C55E] group-hover:scale-110 transition-transform" />
                    <span>Choose Video File to Upload</span>
                    <span className="text-[10px] text-[#A7C9B1] font-normal font-mono">(MP4, WebM up to 50MB)</span>
                  </button>

                  {/* Live Video Preview if uploaded */}
                  {url && (url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.webm')) && (
                    <div className="rounded-xl overflow-hidden bg-black border border-[#22C55E]/40 relative mt-2 shadow-lg">
                      <video src={url} controls className="w-full max-h-48 object-contain bg-black" />
                      <button
                        type="button"
                        onClick={() => setUrl('')}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                        title="Remove uploaded video"
                      >
                        <CloseIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* OR Divider */}
                  <div className="flex items-center gap-2 my-1">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] text-[#A7C9B1] uppercase font-bold tracking-wider">
                      OR Paste YouTube / Web Link
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Option 2: YouTube / Video URL Input */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      required={!url}
                      value={url.startsWith('data:video') ? '(Direct video file uploaded ✓)' : url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      disabled={url.startsWith('data:video')}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none font-mono text-[11px] disabled:opacity-75 disabled:text-[#86EFAC]"
                    />
                    {(url.includes('youtube.com') || url.includes('youtu.be')) && (
                      <p className="text-[10px] text-[#22C55E] font-bold flex items-center gap-1 pt-0.5">
                        <Check className="w-3 h-3" /> YouTube Video Link Detected
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Social Action URL */
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#A7C9B1]">Target Social Link *</label>
                    <span className="text-[10px] text-[#86EFAC]">Opens when user clicks</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://x.com/gtnetwork or https://t.me/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none font-mono text-[11px]"
                  />
                </div>
              )}

              {/* Reward Amount & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1]">Reward Amount (GT Coins) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="100"
                      required
                      value={reward}
                      onChange={(e) => setReward(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="e.g. 2"
                      className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none font-black"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-[#86EFAC]">GT</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#A7C9B1]">Button Text</label>
                  <input
                    type="text"
                    value={buttonLabel}
                    onChange={(e) => setButtonLabel(e.target.value)}
                    placeholder={category === 'video' ? 'e.g. Watch video' : 'e.g. Follow on X'}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none"
                  />
                </div>
              </div>

              {/* Video Watch Countdown Duration (for video tasks) */}
              {category === 'video' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#A7C9B1]">
                      Required Watch Duration (Seconds)
                    </label>
                    <span className="text-[10px] text-rose-400">User must watch before claiming GT</span>
                  </div>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g. 15"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#05160E] border border-rose-500/40 text-white text-xs focus:border-rose-400 outline-none font-mono"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A7C9B1]">Task Instructions / Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write clear instructions for users to collect their reward..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#05160E] border border-[#86EFAC]/30 text-white text-xs focus:border-[#FBBF24] outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="taskActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#22C55E] focus:ring-0 cursor-pointer accent-[#22C55E]"
                />
                <label htmlFor="taskActiveCheck" className="text-xs font-bold text-white cursor-pointer select-none">
                  Make task live immediately across app & website
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#092215] shrink-0 sticky bottom-0 z-10">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-xs font-black text-[#07130D] bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:brightness-110 shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Publishing...' : editingTask ? 'Update Task' : 'Publish Task 🚀'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Admin Video Preview Modal */}
      {previewVideoTask && (
        <div
          onClick={() => setPreviewVideoTask(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#071F14] rounded-3xl border-2 border-[#22C55E]/40 shadow-2xl overflow-hidden my-auto flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-[#071F14]">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-[#4ADE80] block">
                  Admin Video Quest Preview
                </span>
                <h4 className="text-sm sm:text-base font-black text-white truncate">
                  {previewVideoTask.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideoTask(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner border border-white/10">
                {getYouTubeEmbedUrl(previewVideoTask.url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(previewVideoTask.url)!}
                    title={previewVideoTask.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : previewVideoTask.url ? (
                  <video
                    src={previewVideoTask.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <p className="text-xs text-neutral-400">No video stream URL found</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-[#A7C9B1] pt-1">
                <span className="truncate max-w-md font-mono text-[11px] text-neutral-300">
                  {previewVideoTask.url}
                </span>
                <span className="shrink-0 font-bold text-[#FBBF24]">
                  {previewVideoTask.duration || 15}s watch duration
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

