import { handleMockApi } from './mockDb';

const API_BASE = '/api';

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

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';

    // If server returned HTML (Vercel 404 page) or endpoint is unavailable -> Fall back to persistent in-browser database!
    if (!response.ok || !contentType.includes('application/json')) {
      console.warn(`[GT Network] Backend not available (${response.status}), activating in-browser node database for: ${endpoint}`);
      return handleMockApi(endpoint, options) as T;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    // Network failure, offline, or CORS on Vercel -> Fall back to persistent in-browser database!
    console.warn(`[GT Network] Network fetch failed, activating in-browser node database for: ${endpoint}`);
    return handleMockApi(endpoint, options) as T;
  }
}

export const api = {
  // Auth
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
  getMiningStatus: () => request<any>('/mining/status'),
  claimMiningReward: () => request<any>('/mining/claim', { method: 'POST' }),
  getMiningHistory: () => request<any>('/mining/history'),

  // Referrals
  getReferralSummary: () => request<any>('/referrals/summary'),
  getReferralHistory: () => request<any>('/referrals/history'),

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

  // Profile
  getProfile: () => request<any>('/profile'),
  updateProfile: (body: any) => request<any>('/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body: any) => request<any>('/profile/change-password', { method: 'POST', body: JSON.stringify(body) }),
  requestEmailChange: (newEmail: string) => request<any>('/profile/request-email-change', { method: 'POST', body: JSON.stringify({ newEmail }) }),
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
  getAdminUsers: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return request<any>(`/admin/users?${params.toString()}`);
  },
  updateUserStatus: (id: string, body: any) => request<any>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
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

  // Tasks & Video Quests
  getAdminTasks: () => request<any>('/admin/tasks'),
  createAdminTask: (body: any) => request<any>('/admin/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminTask: (id: string, body: any) => request<any>(`/admin/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAdminTask: (id: string) => request<any>(`/admin/tasks/${id}`, { method: 'DELETE' }),
  getPublicTasks: () => request<any>('/tasks'),

  getAdminSettings: () => request<any>('/admin/settings'),
  updateAdminSettings: (body: any) => request<any>('/admin/settings', { method: 'PATCH', body: JSON.stringify(body) }),
  getAdminAuditLogs: () => request<any>('/admin/audit-logs'),
};
