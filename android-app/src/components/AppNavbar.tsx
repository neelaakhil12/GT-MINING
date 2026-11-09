import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { Bell, User as UserIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

interface AppNavbarProps {
  activeTab?: 'App' | 'Wallet';
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ activeTab = 'App' }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  return (
    <View style={styles.headerContainer}>
      {/* 1. Left: Crystal Logo Image matching website */}
      <TouchableOpacity
        onPress={() => navigation.navigate('MainTabs')}
        activeOpacity={0.8}
        style={styles.logoBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Image
          source={require('../../assets/gt-logo.png')}
          style={styles.logoImg}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* 2. Center: [App | Wallet] pill toggle matching website mobile navbar */}
      <View style={styles.pillWrapper}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs')}
          style={[styles.pillBtn, activeTab === 'App' && styles.pillBtnActive]}
          activeOpacity={0.85}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text
            style={[
              styles.pillText,
              activeTab === 'App' ? styles.pillTextActive : styles.pillTextInactive,
            ]}
          >
            App
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Wallet')}
          style={[styles.pillBtn, activeTab === 'Wallet' && styles.pillBtnActive]}
          activeOpacity={0.85}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text
            style={[
              styles.pillText,
              activeTab === 'Wallet' ? styles.pillTextActive : styles.pillTextInactive,
            ]}
          >
            Wallet
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Right: Single Profile Avatar Circle matching website mobile view */}
      <View style={styles.actionsRight}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.avatarCircle}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Profile"
        >
          {user?.avatar || user?.profileImage || user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatar || user.profileImage || user.avatarUrl }}
              style={{ width: 34, height: 34, borderRadius: 17 }}
              resizeMode="cover"
            />
          ) : (
            <UserIcon size={18} color="#1E5E36" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 100,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 4,
  },
  logoBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImg: {
    width: 36,
    height: 36,
  },
  pillWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 248, 239, 0.8)',
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pillTextActive: {
    color: '#0A341B',
  },
  pillTextInactive: {
    color: '#1E5E36',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
});

