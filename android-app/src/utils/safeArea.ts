import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Universal Safe Area hook for Android & iOS
 * - Prevents content cut-off by top Notification Bar / Camera Cutout / Notch
 * - Prevents content cut-off by bottom 3-Button Navigation Bar OR Gesture Bar
 * - Provides dynamic bottom padding for ScrollViews with and without FloatingBottomNav
 */
export function useAppSafeArea() {
  const insets = useSafeAreaInsets();

  // 1. Top Safe Area:
  // On Android, ensure at least StatusBar.currentHeight (typically 24-38dp)
  // so notification status bar and camera punch holes NEVER overlap headers.
  const androidStatusBar = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;
  const top = Math.max(insets.top, androidStatusBar);

  // 2. Bottom Safe Area:
  // Dynamically adapts to:
  // - Android 3-Button Navigation (insets.bottom ~48dp)
  // - Android Gesture Navigation (insets.bottom ~15-20dp)
  // - iOS Home Indicator (insets.bottom ~34dp)
  const bottom = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 10);

  // 3. FloatingBottomNav dynamic offset from bottom edge
  const bottomNavMargin = bottom + (Platform.OS === 'ios' ? 8 : 6);

  // 4. ScrollView padding bottom for screens WITH FloatingBottomNav (Dashboard, Mine, Node, Referrals, Wallet)
  // Floating pill is at bottom + 6dp, height 62dp (top edge at bottom + 68dp).
  // Leaves a comfortable, clean two-finger gap (~20dp) above the floating bottom nav bar pill.
  const tabContentPaddingBottom = bottom + (Platform.OS === 'ios' ? 90 : 86);

  // 5. ScrollView padding bottom for screens WITHOUT FloatingBottomNav (Tasks, Profile, Notifications, etc.)
  // Clean two-finger gap (~20dp) from screen bottom edge.
  const stackContentPaddingBottom = bottom + 20;

  // 6. Modal bottom padding for dialogs and full-screen sheets
  const modalPaddingBottom = bottom + 16;

  return {
    insets,
    top,
    bottom,
    bottomNavMargin,
    tabContentPaddingBottom,
    stackContentPaddingBottom,
    modalPaddingBottom,
  };
}

