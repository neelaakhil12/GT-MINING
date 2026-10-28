import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { MiningPage } from './pages/MiningPage';
import { WalletPage } from './pages/WalletPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { CommunityPage } from './pages/CommunityPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LegalPage } from './pages/LegalPage';
import { TasksPage } from './pages/TasksPage';
import { PrivateNetworkPage } from './pages/PrivateNetworkPage';

// Admin pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminMiningPage } from './pages/admin/AdminMiningPage';
import { AdminReferralsPage } from './pages/admin/AdminReferralsPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { AdminCommunityPage } from './pages/admin/AdminCommunityPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Check if current route is landing or auth page
  const isPublicStandalone = [
    '/',
    '/onboarding',
    '/tour',
    '/login',
    '/signup',
    '/forgot-password',
    '/admin/login',
    '/terms',
    '/privacy',
  ].includes(location.pathname);

  const isChatScreen = location.pathname === '/private-network';

  // Lock document body and root scroll completely on chat screen to emulate native WhatsApp
  useEffect(() => {
    if (isChatScreen) {
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overscrollBehavior = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [isChatScreen]);

  return (
    <div
      className={`flex flex-col bg-[#EAF8EE] text-[#0A341B] selection:bg-[#22C55E]/30 selection:text-[#0A341B] relative ${
        isChatScreen ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen overflow-x-hidden'
      }`}
    >
      
      {/* 3D Floating Green Spheres matching user reference image */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Big vibrant 3D sphere on left */}
        <div className="absolute -left-28 top-24 w-96 h-96 orb-3d orb-3d-glow opacity-80 animate-orb-float" />
        
        {/* Upper right floating sphere */}
        <div className="absolute right-1/4 top-12 w-20 h-20 orb-3d orb-3d-glow opacity-90 animate-orb-float" style={{ animationDelay: '2s' }} />

        {/* Medium sphere on the right */}
        <div className="absolute right-12 top-1/3 w-44 h-44 orb-3d orb-3d-glow opacity-85 animate-orb-float" style={{ animationDelay: '4s' }} />

        {/* Lower right sphere */}
        <div className="absolute right-36 bottom-24 w-36 h-36 orb-3d orb-3d-glow opacity-90 animate-orb-float" style={{ animationDelay: '1s' }} />

        {/* Center ambient glow */}
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-[#4ADE80]/20 rounded-full blur-[140px]" />
      </div>

      <div className={`relative z-10 flex flex-col ${isChatScreen ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
        {!isPublicStandalone && <Navbar />}

        {/* Main Content Area - Fullscreen for onboarding/auth, padded for dashboard */}
        <main
          className={`flex-1 w-full mx-auto ${
            isPublicStandalone
              ? 'p-0 max-w-full flex items-center justify-center'
              : isChatScreen
              ? 'w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-20 pb-2 h-full max-h-full flex flex-col overflow-hidden'
              : 'max-w-screen-2xl px-4 sm:px-8 lg:px-12 pt-24 sm:pt-28 pb-28 sm:pb-16'
          }`}
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation for authenticated pages (hidden in private network chat like WhatsApp) */}
        {isAuthenticated && !isPublicStandalone && !isChatScreen && <BottomNav />}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppLayout>
            <Routes>
              {/* Public & Onboarding Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<LandingPage />} />
              <Route path="/tour" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/terms" element={<LegalPage />} />
              <Route path="/privacy" element={<LegalPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Authenticated User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mining"
                element={
                  <ProtectedRoute>
                    <MiningPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/referrals"
                element={
                  <ProtectedRoute>
                    <ReferralsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/private-network"
                element={
                  <ProtectedRoute>
                    <PrivateNetworkPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <CommunityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/mining-settings"
                element={
                  <AdminRoute>
                    <AdminMiningPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/referrals"
                element={
                  <AdminRoute>
                    <AdminReferralsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/transactions"
                element={
                  <AdminRoute>
                    <AdminTransactionsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/community"
                element={
                  <AdminRoute>
                    <AdminCommunityPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminRoute>
                    <AdminSettingsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <AdminRoute>
                    <AdminAuditLogsPage />
                  </AdminRoute>
                }
              />

              {/* Catch-all redirect to / */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
