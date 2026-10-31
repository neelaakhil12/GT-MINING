import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FloatingBottomNav } from '../components/FloatingBottomNav';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { MiningScreen } from '../screens/MiningScreen';
import { ReferralsScreen } from '../screens/ReferralsScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { PrivateNetworkScreen } from '../screens/PrivateNetworkScreen';

import { RootTabParamList, RootStackParamList } from '../types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingBottomNav {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Node" component={CommunityScreen} />
      <Tab.Screen name="Mine" component={MiningScreen} />
      <Tab.Screen name="Referrals" component={ReferralsScreen} />
    </Tab.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Tasks" component={TasksScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PrivateNetwork" component={PrivateNetworkScreen} />
    </Stack.Navigator>
  );
};

