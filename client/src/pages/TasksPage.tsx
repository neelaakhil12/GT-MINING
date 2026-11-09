import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Play,
  Sparkles,
  Upload,
  Camera,
  X,
  Clock,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface TaskItem {
  id: string;
  category: 'social' | 'video';
  title: string;
  description: string;
  reward: number;
  rewardLabel: string;
  buttonLabel: string;
  url: string;
  iconType: 'x' | 'instagram' | 'youtube' | 'telegram' | 'facebook' | 'tiktok' | 'video';
}

const TASKS_DATA: TaskItem[] = [
  {
    id: 'task_x',
    category: 'social',
    title: 'Follow us on X',
    description: 'Follow the official GT account',
    reward: 2,
    rewardLabel: '+2 GT',
    buttonLabel: 'Follow on X',
    url: 'https://x.com',
    iconType: 'x',
  },
  {
    id: 'task_instagram',
    category: 'social',
    title: 'Follow on Instagram',
    description: 'Join our official community',
    reward: 2,
    rewardLabel: '+2 GT',
    buttonLabel: 'Follow',
    url: 'https://instagram.com',
    iconType: 'instagram',
  },
  {
    id: 'task_youtube',
    category: 'social',
    title: 'Subscribe on YouTube',
    description: 'Subscribe to the GT channel',
    reward: 2,
    rewardLabel: '+2 GT',
    buttonLabel: 'Subscribe',
    url: 'https://youtube.com',
    iconType: 'youtube',
  },
  {
    id: 'task_telegram',
    category: 'social',
    title: 'Join Telegram',
    description: 'Join the official GT channel',
    reward: 1,
    rewardLabel: '+1 GT',
    buttonLabel: 'Join',
    url: 'https://t.me',
    iconType: 'telegram',
  },
  {
    id: 'task_facebook',
    category: 'social',
    title: 'Follow on Facebook',
    description: 'Stay updated with GT news',
    reward: 1,
    rewardLabel: '+1 GT',
    buttonLabel: 'Follow',
    url: 'https://facebook.com',
    iconType: 'facebook',
  },
  {
    id: 'task_tiktok',
    category: 'social',
    title: 'Follow on TikTok',
    description: 'Discover GT short videos',
    reward: 1,
    rewardLabel: '+1 GT',
    buttonLabel: 'Follow',
    url: 'https://tiktok.com',
    iconType: 'tiktok',
  },
  {
    id: 'task_video',
    category: 'video',
    title: 'Watch GT introduction',
    description: 'Watch the assigned video (demo: 10 seconds)',
    reward: 2,
    rewardLabel: '+2 GT',
    buttonLabel: 'Watch video',
    url: '#',
    iconType: 'video',
  },
];

// YouTube Embed URL helper
const getYouTubeEmbedUrl = (rawUrl: string): string | null => {
  if (!rawUrl) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = rawUrl.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&enablejsapi=1`
    : null;
};

// Brand Icon Renderers matching screenshot styling exactly
const TaskIcon: React.FC<{ type: TaskItem['iconType'] }> = ({ type }) => {
  switch (type) {
    case 'x':
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#000000] flex items-center justify-center shrink-0 shadow-sm text-white">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
      );
    case 'instagram':
      return (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FA7E1E] via-[#D62976] to-[#962FBF] flex items-center justify-center shrink-0 shadow-sm text-white">
          <svg className="w-6 h-6 fill-none stroke-current stroke-[2.2]" viewBox="0 0 24 24">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'youtube':
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#FF0000] flex items-center justify-center shrink-0 shadow-sm text-white">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>
      );
    case 'telegram':
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#229ED9] flex items-center justify-center shrink-0 shadow-sm text-white">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </div>
      );
    case 'facebook':
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#1877F2] flex items-center justify-center shrink-0 shadow-sm text-white">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
      );
    case 'tiktok':
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#000000] flex items-center justify-center shrink-0 shadow-sm text-white">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.6a8.28 8.28 0 0 0 5.2 1.87v-3.78a4.84 4.84 0 0 1-1.3-.0z" />
          </svg>
        </div>
      );
    case 'video':
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#EF4444] flex items-center justify-center shrink-0 shadow-sm text-white">
          <Play className="w-6 h-6 fill-current text-white translate-x-0.5" />
        </div>
      );
    default:
      return null;
  }
};

// Slider slides for GT Tasks station matching homepage slider size and theme
const TASK_SLIDES = [
  {
    id: 1,
    image: '/banners/task_slide1.jpg',
    tag: 'DAILY REWARDS',
    title: 'Complete Tasks, Earn GT',
    description: 'Boost your balance every day by completing verified social quests.',
    accentColor: '#22C55E',
  },
  {
    id: 2,
    image: '/banners/task_slide2.jpg',
    tag: 'GLOBAL COMMUNITY',
    title: 'Connect & Multiply',
    description: 'Join official GT channels across X, Telegram, and YouTube.',
    accentColor: '#38BDF8',
  },
  {
    id: 3,
    image: '/banners/task_slide3.jpg',
    tag: 'VIDEO REWARDS',
    title: 'Watch & Collect',
    description: 'Explore the latest GT ecosystem updates and claim instant rewards.',
    accentColor: '#A855F7',
  },
];

export const TasksPage: React.FC = () => {
  const { showToast } = useToast();

  // Active filter tab
  const [activeTab, setActiveTab] = useState<'all' | 'social' | 'video'>('all');

  // Slider state with 1 second auto-scroll as requested
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TASK_SLIDES.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Backend-tracked task submissions & statuses
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  // Proof Upload Modal state
  const [proofModalTask, setProofModalTask] = useState<TaskItem | null>(null);
  const [proofImage, setProofImage] = useState<string>('');
  const [proofNote, setProofNote] = useState<string>('');
  const [submittingProof, setSubmittingProof] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Video watching simulation state
  const [tasksList, setTasksList] = useState<TaskItem[]>(TASKS_DATA);
  const [activeVideoTask, setActiveVideoTask] = useState<TaskItem | null>(null);
  const [watchingVideoModalTask, setWatchingVideoModalTask] = useState<TaskItem | null>(null);
  const [videoTimer, setVideoTimer] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  const fetchTasksAndSubmissions = async () => {
    try {
      const [tasksRes, subsRes] = await Promise.allSettled([
        api.getPublicTasks(),
        api.getMyTaskSubmissions(),
      ]);

      if (tasksRes.status === 'fulfilled' && tasksRes.value?.success && Array.isArray(tasksRes.value.tasks) && tasksRes.value.tasks.length > 0) {
        setTasksList(tasksRes.value.tasks);
      }

      if (subsRes.status === 'fulfilled' && subsRes.value?.success && Array.isArray(subsRes.value.submissions)) {
        setSubmissions(subsRes.value.submissions);
      }
    } catch (err) {
      console.error('Error fetching tasks data:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchTasksAndSubmissions();
    const timer = setInterval(fetchTasksAndSubmissions, 8000);
    return () => clearInterval(timer);
  }, []);

  // Handle proof image upload via canvas compression (<200KB for instant transfer)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      showToast('Image size is too large. Please select a photo under 12MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 900;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setProofImage(dataUrl);
          showToast('Screenshot loaded! Tap "Submit Proof" to send to admin.', 'info');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit proof to backend
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofModalTask) return;
    if (!proofImage) {
      showToast('Please upload a screenshot proof of task completion.', 'error');
      return;
    }

    setSubmittingProof(true);
    try {
      const res = await api.submitTaskProof({
        taskId: proofModalTask.id,
        proofImage,
        proofNote: proofNote.trim(),
      });

      if (res && res.success) {
        showToast('🎉 Proof submitted! Sent to admin for verification. Your reward will be credited directly to your wallet upon approval.', 'success');
        setProofModalTask(null);
        setProofImage('');
        setProofNote('');
        await fetchTasksAndSubmissions();
      } else {
        throw new Error(res?.message || 'Failed to submit proof');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit task proof', 'error');
    } finally {
      setSubmittingProof(false);
    }
  };

  // Video demo timer effect
  useEffect(() => {
    let interval: any = null;
    if (activeVideoTask && videoTimer !== null && videoTimer > 0) {
      interval = setInterval(() => {
        setVideoTimer((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            setVideoProgress(100);
            return 0;
          }
          const next = prev - 1;
          const totalSec = (activeVideoTask as any).duration || 15;
          setVideoProgress(Math.round(((totalSec - next) / totalSec) * 100));
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoTimer, activeVideoTask]);

  const handleTaskAction = (task: TaskItem) => {
    const existingSub = submissions.find((s) => s.taskId === task.id);
    if (existingSub?.status === 'APPROVED') {
      showToast('You have already completed this task and claimed your reward.', 'info');
      return;
    }

    if (existingSub?.status === 'PENDING') {
      showToast('Your proof is already submitted and pending admin review. You can re-upload if needed.', 'info');
      setProofModalTask(task);
      setProofImage(existingSub.proofImage || '');
      setProofNote(existingSub.proofNote || '');
      return;
    }

    if (task.category === 'video') {
      const watchSec = (task as any).duration || 15;
      setActiveVideoTask(task);
      setVideoTimer((prev) => (activeVideoTask?.id === task.id && prev !== null ? prev : watchSec));
      setVideoProgress((prev) => (activeVideoTask?.id === task.id ? prev : 0));
      setWatchingVideoModalTask(task);
      return;
    }

    // Open target social platform in new tab
    if (task.url && task.url !== '#') {
      window.open(task.url, '_blank', 'noopener,noreferrer');
    }

    // Immediately open proof upload dialog so user submits screenshot upon returning
    setProofModalTask(task);
    setProofImage('');
    setProofNote('');
  };

  const filteredTasks = tasksList.filter((task) => {
    if (activeTab === 'all') return true;
    return task.category === activeTab;
  });

  const totalTasks = tasksList.length;
  const completedCount = submissions.filter((s) => s.status === 'APPROVED').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Back button and navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1E5E36] hover:text-[#0A341B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-[11px] font-black uppercase tracking-wider text-[#15803D]">
          GT Tasks Station
        </span>
      </div>

      {/* 1. Header Hero Image Slides Carousel - Same size as homepage slider, auto 1-second transition, without left/right arrows */}
      <div className="relative rounded-3xl overflow-hidden shadow-[0_14px_35px_rgba(22,101,52,0.12)] border-2 border-white/90 group bg-[#071F14]">
        {/* Slides Track */}
        <div className="relative h-[165px] sm:h-[210px] md:h-[260px] w-full overflow-hidden">
          {TASK_SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image with Ambient Glass Gradient Overlays */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.08] transition-transform duration-1000 scale-100"
                  loading="eager"
                />

                {/* Multi-layered cinematic gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-[#22C55E]/20 rounded-full blur-3xl pointer-events-none" />

                {/* Slide Foreground Content */}
                <div className="absolute inset-0 p-4 sm:p-7 md:p-8 flex flex-col justify-end text-white max-w-xl space-y-1 sm:space-y-2 z-20">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[10px] font-black tracking-widest uppercase w-fit">
                    <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: slide.accentColor }} />
                    <span>{slide.tag}</span>
                  </div>

                  <h2 className="text-base sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                    {slide.title}
                  </h2>

                  <p className="text-[11px] sm:text-xs text-white/85 line-clamp-1 sm:line-clamp-2 font-medium max-w-md drop-shadow">
                    {slide.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicator Dots - Auto loop without left/right arrows */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {TASK_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === i ? 'w-6 bg-[#22C55E] shadow-sm' : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Tasks Rewards Summary Card - Reduced height and size matching Screenshot 4 */}
      <div className="relative p-4 sm:p-5 rounded-3xl bg-white border border-white shadow-[0_10px_30px_rgba(22,101,52,0.06)] overflow-hidden">
        {/* Soft mint ambient glow circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#DCFCE7]/70 rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[9px] sm:text-[10px] font-black uppercase tracking-wider w-fit">
              <span>COMMUNITY REWARDS</span>
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#0A341B] tracking-tight">
              Tasks to Earn GT
            </h2>

            <p className="text-[11px] sm:text-xs font-medium text-[#1E5E36] line-clamp-1 max-w-md">
              Complete social tasks, watch videos and grow with the GT community.
            </p>

            <div className="pt-1 flex flex-wrap items-baseline gap-2">
              <span className="text-[11px] font-bold text-[#1E5E36]/80">
                Your task rewards:
              </span>
              <span className="text-base sm:text-lg font-black text-[#0A341B] tracking-tight">
                {submissions
                  .filter((s) => s.status === 'APPROVED')
                  .reduce((acc, s) => acc + Number(s.reward || 1), 0)
                  .toFixed(2)}{' '}
                GT
              </span>
              <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#22C55E]/30">
                Credited to Wallet
              </span>
            </div>
          </div>

          {/* Right GT Brand Badge */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#DCFCE7] flex items-center justify-center text-[#15803D] shadow-sm">
              <span className="font-black text-xl sm:text-2xl italic tracking-tight font-sans">
                GT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Daily & Social Tasks Section */}
      <div className="space-y-4">
        
        {/* Section Title & Done Pill */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#0A341B] tracking-tight uppercase">
              DAILY & SOCIAL TASKS
            </h2>
            <p className="text-xs text-[#1E5E36] font-medium">
              Complete tasks and upload screenshot proof to collect wallet rewards
            </p>
          </div>

          <div className="px-4 py-1.5 rounded-full bg-white/90 border border-white text-xs font-black text-[#0A341B] shadow-sm shrink-0">
            {submissions.filter((s) => s.status === 'APPROVED').length} / {tasksList.length} DONE
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
              activeTab === 'all'
                ? 'bg-[#14532D] text-white shadow-sm'
                : 'bg-white/80 hover:bg-white text-[#1E5E36]'
            }`}
          >
            All tasks
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
              activeTab === 'social'
                ? 'bg-[#14532D] text-white shadow-sm'
                : 'bg-white/80 hover:bg-white text-[#1E5E36]'
            }`}
          >
            Social media
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
              activeTab === 'video'
                ? 'bg-[#14532D] text-white shadow-sm'
                : 'bg-white/80 hover:bg-white text-[#1E5E36]'
            }`}
          >
            Video tasks
          </button>
        </div>

        {/* Tasks List matching Screenshot 1 - Compact horizontal row on all viewports */}
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const sub = submissions.find((s) => s.taskId === task.id);
            const isApproved = sub?.status === 'APPROVED';
            const isPending = sub?.status === 'PENDING';
            const isRejected = sub?.status === 'REJECTED';
            const isVideoWatching = activeVideoTask?.id === task.id && videoTimer !== null;

            return (
              <div
                key={task.id}
                className="p-3.5 sm:p-4 rounded-[22px] sm:rounded-3xl bg-white border border-white shadow-[0_4px_20px_rgba(22,101,52,0.04)] flex items-center justify-between gap-3 sm:gap-4 transition-all hover:shadow-[0_8px_25px_rgba(22,101,52,0.08)]"
              >
                {/* Left Side: Brand Icon and Task Info */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <TaskIcon type={task.iconType} />

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-[#0A341B] tracking-tight truncate">
                        {task.title}
                      </h3>
                      {isPending && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]/30">
                          <Clock className="w-3 h-3 text-[#D97706]" />
                          <span>Verification in progress</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#1E5E36]/80 font-medium truncate">
                      {task.description}
                    </p>

                    {/* Video Progress Bar */}
                    {task.category === 'video' && (
                      <div className="pt-1.5 w-full max-w-[200px]">
                        <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#22C55E] transition-all duration-300"
                            style={{
                              width: isApproved ? '100%' : `${activeVideoTask?.id === task.id ? videoProgress : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Reward Points on Top, Action Button Below */}
                <div className="flex flex-col items-end justify-center shrink-0 gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-[#0A341B] tracking-tight">
                    {task.rewardLabel}
                  </span>

                  {isApproved ? (
                    <div className="inline-flex items-center gap-1 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#DCFCE7] text-[#15803D] font-black text-[11px] sm:text-xs border border-[#22C55E]/30 shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Completed</span>
                    </div>
                  ) : isPending ? (
                    <button
                      onClick={() => handleTaskAction(task)}
                      className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#FEF3C7] text-[#92400E] font-black text-[11px] sm:text-xs border border-[#F59E0B]/40 shrink-0 cursor-pointer shadow-2xs hover:bg-[#FDE68A] transition-all"
                      title="Proof submitted. Tap to review or re-upload if needed."
                    >
                      <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Under Review</span>
                    </button>
                  ) : isRejected ? (
                    <button
                      onClick={() => handleTaskAction(task)}
                      className="inline-flex items-center gap-1 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 font-black text-[11px] sm:text-xs border border-red-300 shrink-0 transition-all cursor-pointer"
                      title={sub?.adminComment || 'Proof was rejected. Tap to resubmit.'}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Resubmit Proof ↗</span>
                    </button>
                  ) : isVideoWatching ? (
                    <button
                      onClick={() => setWatchingVideoModalTask(task)}
                      className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#FBBF24]/20 hover:bg-[#FBBF24]/30 text-[#B45309] font-black text-[11px] sm:text-xs border border-[#FBBF24]/30 shrink-0 cursor-pointer transition-all"
                      title="Click to view video"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
                      <span>{videoTimer === 0 ? 'Done! Tap' : `${videoTimer}s...`}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTaskAction(task)}
                      className="inline-flex items-center gap-1 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#14532D] hover:bg-[#0D381E] text-white font-black text-[11px] sm:text-xs shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
                    >
                      <span>{task.buttonLabel}</span>
                      <span className="text-xs">↗</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Watch & Quest Modal */}
      {watchingVideoModalTask && (
        <div
          onClick={() => setWatchingVideoModalTask(null)}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl w-full max-h-[85vh] sm:max-h-[90vh] bg-[#071F14] text-white rounded-3xl shadow-2xl flex flex-col border-2 border-[#22C55E]/40 overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/10 shrink-0 bg-[#071F14]">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4ADE80] block">
                  Video Quest Player
                </span>
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  {watchingVideoModalTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWatchingVideoModalTask(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner border border-white/10">
                {getYouTubeEmbedUrl(watchingVideoModalTask.url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(watchingVideoModalTask.url)!}
                    title={watchingVideoModalTask.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : watchingVideoModalTask.url && watchingVideoModalTask.url !== '#' ? (
                  <video
                    src={watchingVideoModalTask.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="p-6 text-center text-neutral-400 text-xs">
                    No video stream URL provided for this task.
                  </div>
                )}
              </div>

              {/* Progress & Countdown Status */}
              <div className="p-3.5 rounded-2xl bg-[#0B2A1C] border border-[#22C55E]/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#A7C9B1] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
                    <span>Watch Progress</span>
                  </span>
                  <span className="font-black text-[#FBBF24] font-mono">
                    {videoTimer === 0 ? '✓ Requirement Completed' : `${videoTimer}s remaining`}
                  </span>
                </div>

                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#22C55E] to-[#4ADE80] transition-all duration-300"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-6 sm:pb-0">
                <p className="text-[11px] text-[#A7C9B1] text-center sm:text-left">
                  {videoTimer === 0
                    ? `🎉 Video watched! You can now submit your verification screenshot to claim +${watchingVideoModalTask.reward} GT.`
                    : `Please watch for at least ${(watchingVideoModalTask as any).duration || 15}s to complete task.`}
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setWatchingVideoModalTask(null)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-neutral-300 transition-all cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const currentTask = watchingVideoModalTask;
                      setWatchingVideoModalTask(null);
                      setProofModalTask(currentTask);
                      setProofNote('Video completed');
                      setProofImage('');
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs text-[#07130D] bg-gradient-to-r from-[#22C55E] to-[#4ADE80] hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Proof ↗</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Proof Upload Modal */}
      {proofModalTask && (
        <div
          onClick={() => !submittingProof && setProofModalTask(null)}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-white/80 overflow-hidden my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-black/5 p-4 sm:p-6 shrink-0 bg-white">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#15803D]">
                  Task Verification Required
                </span>
                <h3 className="text-base sm:text-xl font-black text-[#0A341B] tracking-tight">
                  {proofModalTask.title}
                </h3>
              </div>
              <button
                type="button"
                disabled={submittingProof}
                onClick={() => setProofModalTask(null)}
                className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-neutral-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body & Form - Fully Scrollable */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              {/* Reward Pill & Instructions */}
              <div className="p-3.5 rounded-2xl bg-[#EAF8EE] border border-[#22C55E]/30 flex items-center justify-between text-xs">
                <span className="font-bold text-[#0A341B]">Completion Reward:</span>
                <span className="font-black text-[#15803D] bg-white px-3 py-1 rounded-full shadow-2xs">
                  +{proofModalTask.reward}.00 GT (Credited to Wallet)
                </span>
              </div>

              <p className="text-xs text-[#1E5E36] font-medium leading-relaxed">
                Please upload a screenshot showing that you completed this task (e.g. following, subscribing, or watching). Once reviewed and approved by the admin, your reward will be added directly into your wallet available balance.
              </p>

              <form onSubmit={handleSubmitProof} className="space-y-4">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                {/* Screenshot Preview / Drop Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full min-h-[130px] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 cursor-pointer relative overflow-hidden ${
                    proofImage
                      ? 'border-[#22C55E] bg-[#EAF8EE]/40'
                      : 'border-neutral-300 hover:border-[#22C55E] bg-neutral-50 hover:bg-[#EAF8EE]/20'
                  }`}
                >
                  {proofImage ? (
                    <div className="space-y-2 text-center w-full">
                      <img
                        src={proofImage}
                        alt="Screenshot Proof Preview"
                        className="max-h-44 mx-auto rounded-xl object-contain shadow-xs border border-white"
                      />
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#15803D]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Screenshot Loaded. Tap to change.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center">
                      <div className="w-11 h-11 rounded-2xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto shadow-2xs">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#0A341B] block">
                          Upload Screenshot Proof
                        </span>
                        <span className="text-[11px] text-[#1E5E36]/70">
                          PNG, JPG, or WebP from your device
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Handle / Profile Link (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A341B] flex justify-between">
                    <span>Your Social Handle / Username (Optional)</span>
                    <span className="text-[10px] text-neutral-400">for faster verification</span>
                  </label>
                  <input
                    type="text"
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    placeholder="e.g. @your_username or profile link"
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#0A341B] focus:outline-none focus:border-[#22C55E] focus:bg-white"
                  />
                </div>

                {/* Action Buttons - pb-8 ensures buttons are never cut off by mobile nav or screen edge */}
                <div className="flex items-center justify-end gap-3 pt-3 pb-8 sm:pb-2">
                  <button
                    type="button"
                    disabled={submittingProof}
                    onClick={() => setProofModalTask(null)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs text-neutral-600 hover:bg-neutral-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProof || !proofImage}
                    className="px-6 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-[0_4px_16px_rgba(34,197,94,0.35)] hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{submittingProof ? 'Submitting Proof...' : 'Submit Proof to Admin'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. Reward Security Disclaimer */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#EAF8EE]/80 border border-[#86EFAC]/40 text-xs text-[#1E5E36] leading-relaxed">
        <p>
          <strong className="text-[#0A341B] font-bold">Reward Verification:</strong>{' '}
          Tasks are verified by administrators via uploaded screenshot proof. Once approved, the reward amount is credited automatically into your wallet balance and lifetime earnings.
        </p>
      </div>

    </div>
  );
};
