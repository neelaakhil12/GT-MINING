// Always connect directly to AWS Production Server (or configured VITE_API_URL)
const getApiBase = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // When running locally on Vite dev server (localhost/127.0.0.1), direct all requests to AWS production server
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'https://gtnetwork.in/api';
    }
  }
  return '/api';
};

const API_BASE = getApiBase();

// Purge any legacy browser local mock database traces to ensure 100% AWS server persistence
if (typeof window !== 'undefined') {
  try {
    ['gt_mock_database_v4', 'gt_mock_database_v3', 'gt_mock_database_v2', 'gt_mock_database_v1'].forEach((k) => {
      localStorage.removeItem(k);
    });
  } catch {}
}

export const getToken = (): string | null => {
  return localStorage.getItem('gt_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('gt_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('gt_token');
  localStorage.removeItem('gt_active_user_id');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  }

  if (!response.ok) {
    throw new Error(`AWS Server returned error ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const api = {
  // Auth
  sendSignupOtp: (body: { fullName: string; email: string; phone: string; referralCode?: string }) =>
    request<any>('/auth/signup/send-otp', { method: 'POST', body: JSON.stringify(body) }),
  verifySignupOtp: (body: { email: string; otpCode: string }) =>
    request<any>('/auth/signup/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  completeSignup: (body: { email: string; password: string; confirmPassword?: string }) =>
    request<any>('/auth/signup/complete', { method: 'POST', body: JSON.stringify(body) }),
  signup: (body: any) => request<any>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  googleLogin: (body: any) => request<any>('/auth/google', { method: 'POST', body: JSON.stringify(body) }),
  getSession: () => request<any>('/auth/session'),
  forgotPassword: (email: string, isAdmin?: boolean) => request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email, isAdmin }) }),
  resetPassword: (body: any) => request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),

  // Dashboard
  getDashboardSummary: () => request<any>('/dashboard/summary'),

  // Mining
  getMiningConfig: () => request<any>('/mining/config'),
  getMiningStatus: () => request<any>('/mining/status'),
  claimMiningReward: () => request<any>('/mining/claim', { method: 'POST' }),
  getMiningHistory: () => request<any>('/mining/history'),

  // Referrals
  getReferralSummary: () => request<any>('/referrals/summary'),
  getReferralHistory: () => request<any>('/referrals/history'),
  claimReferralCommissions: () => request<any>('/referrals/claim', { method: 'POST' }),

  // Wallet
  getWallet: () => request<any>('/wallet'),
  getTransactions: (type?: string) => request<any>(`/wallet/transactions${type ? `?type=${type}` : ''}`),

  // Community
  getCommunityPosts: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return request<any>(`/community/posts?${params.toString()}`);
  },
  getCommunityPost: (id: string) => request<any>(`/community/posts/${id}`),
  likeCommunityPost: (id: string, body: any = {}) =>
    request<any>(`/community/posts/${id}/like`, { method: 'POST', body: JSON.stringify(body) }),
  getCommunityComments: (id: string) => request<any>(`/community/posts/${id}/comments`),
  addCommunityComment: (id: string, body: { content: string; userName?: string; userId?: string }) =>
    request<any>(`/community/posts/${id}/comments`, { method: 'POST', body: JSON.stringify(body) }),

  // Profile
  getProfile: () => request<any>('/profile'),
  updateProfile: (body: any) => request<any>('/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  updateAvatar: (avatar: string) => request<any>('/profile/avatar', { method: 'POST', body: JSON.stringify({ avatar }) }),
  changePassword: (body: any) => request<any>('/profile/change-password', { method: 'POST', body: JSON.stringify(body) }),
  requestEmailChange: (newEmail: string) => request<any>('/profile/request-email-change', { method: 'POST', body: JSON.stringify({ newEmail }) }),
  getEmailChangeStatus: () => request<any>('/profile/email-change-status'),
  deleteAccount: (body: any) => request<any>('/profile', { method: 'DELETE', body: JSON.stringify(body) }),

  // Notifications
  getNotifications: () => request<any>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<any>('/notifications/mark-all-read', { method: 'POST' }),

  // Private Network
  getPrivateNetwork: () => request<any>('/private-network'),
  sendPrivateNetworkMessage: (body: { text: string; type?: string; targetMemberId?: string; targetMemberName?: string }) =>
    request<any>('/private-network/messages', { method: 'POST', body: JSON.stringify(body) }),
  pingPrivateNetworkMember: (body: { memberId: string; memberName: string }) =>
    request<any>('/private-network/ping-member', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  getAdminDashboard: () => request<any>('/admin/dashboard'),
  getAdminReports: () => request<any>('/admin/reports'),
  getAdminUsers: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return request<any>(`/admin/users?${params.toString()}`);
  },
  updateUserStatus: (id: string, body: any) => request<any>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getAdminEmailRequests: () => request<any>('/admin/email-change-requests'),
  approveEmailRequest: (id: string) => request<any>(`/admin/email-change-requests/${id}/approve`, { method: 'POST' }),
  rejectEmailRequest: (id: string, reason?: string) => request<any>(`/admin/email-change-requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getMiningSettings: () => request<any>('/admin/mining-settings'),
  updateMiningSettings: (body: any) => request<any>('/admin/mining-settings', { method: 'PATCH', body: JSON.stringify(body) }),
  getAdminReferrals: () => request<any>('/admin/referrals'),
  updateReferralSettings: (body: any) => request<any>('/admin/referral-settings', { method: 'PATCH', body: JSON.stringify(body) }),
  getAdminTransactions: () => request<any>('/admin/transactions'),
  adjustWalletBalance: (body: any) => request<any>('/admin/transactions/adjust', { method: 'POST', body: JSON.stringify(body) }),
  getAdminPosts: () => request<any>('/admin/community/posts'),
  createAdminPost: (body: any) => request<any>('/admin/community/posts', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminPost: (id: string, body: any) => request<any>(`/admin/community/posts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAdminPost: async (id: string) => {
    try {
      await request<any>(`/community/posts/${id}`, { method: 'DELETE' });
    } catch {}
    return request<any>(`/admin/community/posts/${id}`, { method: 'DELETE' });
  },

  // Pre-Opening / Onboarding Sliders Banners
  getAdminOnboardingBanners: () => request<any>('/admin/onboarding-banners'),
  createAdminOnboardingBanner: (body: any) => request<any>('/admin/onboarding-banners', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminOnboardingBanner: (id: string, body: any) => request<any>(`/admin/onboarding-banners/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAdminOnboardingBanner: (id: string) => request<any>(`/admin/onboarding-banners/${id}`, { method: 'DELETE' }),
  getPublicOnboardingBanners: () => request<any>('/onboarding-banners'),

  // Home Page Carousel Banners
  getAdminHomeBanners: () => request<any>('/admin/home-banners'),
  createAdminHomeBanner: (body: any) => request<any>('/admin/home-banners', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminHomeBanner: (id: string, body: any) => request<any>(`/admin/home-banners/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAdminHomeBanner: (id: string) => request<any>(`/admin/home-banners/${id}`, { method: 'DELETE' }),
  getPublicHomeBanners: () => request<any>('/home-banners'),

  // Referral Page Carousel Banners
  getAdminReferralBanners: () => request<any>('/admin/referral-banners'),
  createAdminReferralBanner: (body: any) => request<any>('/admin/referral-banners', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminReferralBanner: (id: string, body: any) => request<any>(`/admin/referral-banners/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAdminReferralBanner: (id: string) => request<any>(`/admin/referral-banners/${id}`, { method: 'DELETE' }),
  getPublicReferralBanners: () => request<any>('/referral-banners'),

  // Tasks & Video Quests
  getAdminTasks: () => request<any>('/admin/tasks'),
  createAdminTask: (body: any) => request<any>('/admin/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminTask: (id: string, body: any) => request<any>(`/admin/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAdminTask: (id: string) => request<any>(`/admin/tasks/${id}`, { method: 'DELETE' }),
  getPublicTasks: () => request<any>('/tasks'),
  submitTaskProof: (body: { taskId: string; proofImage: string; proofNote?: string }) =>
    request<any>('/tasks/submit-proof', { method: 'POST', body: JSON.stringify(body) }),
  getMyTaskSubmissions: () => request<any>('/tasks/my-submissions'),

  // Task Submissions Verification (Admin)
  getAdminTaskSubmissions: (status?: string) =>
    request<any>(`/admin/task-submissions${status ? `?status=${status}` : ''}`),
  approveTaskSubmission: (id: string) =>
    request<any>(`/admin/task-submissions/${id}/approve`, { method: 'POST' }),
  rejectTaskSubmission: (id: string, reason?: string) =>
    request<any>(`/admin/task-submissions/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),

  getAdminSettings: () => request<any>('/admin/settings'),
  updateAdminSettings: (body: any) => request<any>('/admin/settings', { method: 'PATCH', body: JSON.stringify(body) }),
  getAdminAuditLogs: () => request<any>('/admin/audit-logs'),
  getAdminTopMiners: () => request<any>('/admin/top-miners'),
};
