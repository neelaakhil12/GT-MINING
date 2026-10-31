import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, Play, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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

  // Track completed task IDs in localStorage
  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gt_completed_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track total task rewards
  const [taskRewards, setTaskRewards] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gt_task_rewards');
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Video watching simulation state (10s demo countdown)
  const [videoTimer, setVideoTimer] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('gt_completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('gt_task_rewards', taskRewards.toFixed(2));
  }, [completedTasks, taskRewards]);

  // Video demo timer effect
  useEffect(() => {
    let interval: any = null;
    if (videoTimer !== null && videoTimer > 0) {
      interval = setInterval(() => {
        setVideoTimer((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            handleCompleteTask('task_video', 2);
            setVideoProgress(100);
            return null;
          }
          const next = prev - 1;
          setVideoProgress(Math.round(((10 - next) / 10) * 100));
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoTimer]);

  const handleCompleteTask = (taskId: string, rewardAmount: number) => {
    if (completedTasks.includes(taskId)) return;

    setCompletedTasks((prev) => [...prev, taskId]);
    setTaskRewards((prev) => prev + rewardAmount);
    showToast(`🎉 Reward Claimed: +${rewardAmount}.00 GT added to your balance!`, 'success');
  };

  const handleTaskAction = (task: TaskItem) => {
    if (completedTasks.includes(task.id)) {
      showToast('You have already completed this task.', 'info');
      return;
    }

    if (task.id === 'task_video') {
      if (videoTimer !== null) return;
      setVideoTimer(10);
      setVideoProgress(0);
      showToast('Watching demo video (10 seconds)...', 'info');
      return;
    }

    // For social links: open in new tab and credit reward
    if (task.url && task.url !== '#') {
      window.open(task.url, '_blank', 'noopener,noreferrer');
    }

    // Simulate task completion with immediate reward reward
    handleCompleteTask(task.id, task.reward);
  };

  const filteredTasks = TASKS_DATA.filter((task) => {
    if (activeTab === 'all') return true;
    return task.category === activeTab;
  });

  const totalTasks = TASKS_DATA.length;
  const completedCount = completedTasks.length;

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

            <div className="pt-1 flex items-baseline gap-2">
              <span className="text-[11px] font-bold text-[#1E5E36]/80">
                Your task rewards:
              </span>
              <span className="text-base sm:text-lg font-black text-[#0A341B] tracking-tight">
                {taskRewards.toFixed(2)} GT
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
              Complete tasks and collect rewards
            </p>
          </div>

          <div className="px-4 py-1.5 rounded-full bg-white/90 border border-white text-xs font-black text-[#0A341B] shadow-sm shrink-0">
            {completedCount} / {totalTasks} DONE
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
            const isCompleted = completedTasks.includes(task.id);
            const isVideoWatching = task.id === 'task_video' && videoTimer !== null;

            return (
              <div
                key={task.id}
                className="p-3.5 sm:p-4 rounded-[22px] sm:rounded-3xl bg-white border border-white shadow-[0_4px_20px_rgba(22,101,52,0.04)] flex items-center justify-between gap-3 sm:gap-4 transition-all hover:shadow-[0_8px_25px_rgba(22,101,52,0.08)]"
              >
                {/* Left Side: Brand Icon and Task Info */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <TaskIcon type={task.iconType} />

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-black text-[#0A341B] tracking-tight truncate">
                      {task.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#1E5E36]/80 font-medium truncate">
                      {task.description}
                    </p>

                    {/* Video Progress Bar in case of demo */}
                    {task.id === 'task_video' && (
                      <div className="pt-1.5 w-full max-w-[200px]">
                        <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#22C55E] transition-all duration-300"
                            style={{
                              width: isCompleted ? '100%' : `${videoProgress}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Reward Points on Top, Action Button Below (matching Screenshot 1) */}
                <div className="flex flex-col items-end justify-center shrink-0 gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-[#0A341B] tracking-tight">
                    {task.rewardLabel}
                  </span>

                  {isCompleted ? (
                    <div className="inline-flex items-center gap-1 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#DCFCE7] text-[#15803D] font-black text-[11px] sm:text-xs border border-[#22C55E]/30 shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Completed</span>
                    </div>
                  ) : isVideoWatching ? (
                    <button
                      disabled
                      className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#FBBF24]/20 text-[#B45309] font-black text-[11px] sm:text-xs border border-[#FBBF24]/30 shrink-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
                      <span>{videoTimer}s...</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTaskAction(task)}
                      className="inline-flex items-center gap-1 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#14532D] hover:bg-[#0D381E] text-white font-black text-[11px] sm:text-xs shadow-sm transition-all active:scale-95 shrink-0"
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

      {/* 4. Reward Security Disclaimer */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#EAF8EE]/80 border border-[#86EFAC]/40 text-xs text-[#1E5E36] leading-relaxed">
        <p>
          <strong className="text-[#0A341B] font-bold">Reward security:</strong>{' '}
          This HTML is a front-end demo. A production app must verify follows, subscriptions, memberships and video completion with a trusted backend before crediting GT. Returning to this page alone is not proof of completion.
        </p>
      </div>

    </div>
  );
};
