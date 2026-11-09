import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSafeArea } from '../utils/safeArea';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Users } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const EarthGlobeSvg: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = '#1E5E36',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </Svg>
);

export interface FloatingBottomNavProps {
  state?: any;
  navigation?: any;
  descriptors?: any;
  insets?: any;
  activeTab?: 'Home' | 'Node' | 'Mine' | 'Referrals' | 'Wallet';
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  state,
  navigation: propNav,
  activeTab,
}) => {
  const hookNav = useNavigation<any>();
  const nav = propNav || hookNav;
  const { bottomNavMargin } = useAppSafeArea();

  const currentRouteName = state ? state.routes[state.index].name : (activeTab || 'Wallet');

  const navigateTo = (routeName: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics fallback
    }
    if (state) {
      nav.navigate(routeName);
    } else {
      nav.navigate('MainTabs', { screen: routeName });
    }
  };

  return (
    <View style={[styles.floatingContainer, { bottom: bottomNavMargin }]} pointerEvents="box-none">
      <View style={styles.barPill}>
        {/* 1. Home */}
        <TouchableOpacity
          onPress={() => navigateTo('Home')}
          style={styles.tabItem}
          activeOpacity={0.85}
          accessibilityLabel="Home"
        >
          {currentRouteName === 'Home' ? (
            <LinearGradient
              colors={['#236840', '#1B5734', '#124225']}
              style={styles.activeSquircle}
            >
              <Home size={22} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
          ) : (
            <View style={styles.inactiveCircle}>
              <Home size={20} color="#1E5E36" strokeWidth={2.2} />
            </View>
          )}
        </TouchableOpacity>

        {/* 2. Node / Community */}
        <TouchableOpacity
          onPress={() => navigateTo('Node')}
          style={styles.tabItem}
          activeOpacity={0.85}
          accessibilityLabel="Node"
        >
          {currentRouteName === 'Node' ? (
            <LinearGradient
              colors={['#236840', '#1B5734', '#124225']}
              style={styles.activeSquircle}
            >
              <EarthGlobeSvg size={23} color="#FFFFFF" />
            </LinearGradient>
          ) : (
            <View style={styles.inactiveCircle}>
              <EarthGlobeSvg size={20} color="#1E5E36" />
            </View>
          )}
        </TouchableOpacity>

        {/* 3. GT Mine */}
        <TouchableOpacity
          onPress={() => navigateTo('Mine')}
          style={styles.tabItem}
          activeOpacity={0.85}
          accessibilityLabel="Mine GT"
        >
          {currentRouteName === 'Mine' ? (
            <LinearGradient
              colors={['#236840', '#1B5734', '#124225']}
              style={styles.activeSquircle}
            >
              <View style={styles.mineCoinBadgeActive}>
                <Text style={styles.mineCoinTextActive}>GT</Text>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveCircle}>
              <View style={styles.mineCoinBadgeInactive}>
                <Text style={styles.mineCoinTextInactive}>GT</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* 4. Referrals */}
        <TouchableOpacity
          onPress={() => navigateTo('Referrals')}
          style={styles.tabItem}
          activeOpacity={0.85}
          accessibilityLabel="Referrals"
        >
          {currentRouteName === 'Referrals' ? (
            <LinearGradient
              colors={['#236840', '#1B5734', '#124225']}
              style={styles.activeSquircle}
            >
              <Users size={22} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
          ) : (
            <View style={styles.inactiveCircle}>
              <Users size={20} color="#1E5E36" strokeWidth={2.2} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  barPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '88%',
    maxWidth: 340,
    height: 62,
    backgroundColor: 'rgba(235, 248, 239, 0.94)',
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSquircle: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -12 }],
    shadowColor: '#124225',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  inactiveCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mineCoinBadgeActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D6F4DF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mineCoinTextActive: {
    fontSize: 10.5,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#124225',
  },
  mineCoinBadgeInactive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EBF8EF',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mineCoinTextInactive: {
    fontSize: 10,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#15803D',
  },
});
