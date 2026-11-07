import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { MobileFrameWrapper } from './src/components/MobileFrameWrapper';

// Disable native screens on web and inject global input outline reset to remove browser black focus box
if (Platform.OS === 'web') {
  enableScreens(false);
  if (typeof document !== 'undefined') {
    const styleId = 'gt-global-input-outline-reset';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Remove default browser black outline / focus box from all inputs */
        input, textarea, select, button {
          outline: none !important;
          outline-style: none !important;
          outline-width: 0 !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        input:focus, textarea:focus, select:focus, button:focus,
        input:focus-visible, textarea:focus-visible, select:focus-visible, button:focus-visible,
        input:active, textarea:active {
          outline: none !important;
          outline-style: none !important;
          outline-width: 0 !important;
          box-shadow: none !important;
        }
        /* Remove ugly browser autofill light blue background */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 100px #EAF8EE inset !important;
          -webkit-text-fill-color: #0A341B !important;
          outline: none !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

const webInitialMetrics = {
  frame: { x: 0, y: 0, width: 395, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export default function App() {
  return (
    <SafeAreaProvider
      initialMetrics={Platform.OS === 'web' ? webInitialMetrics : initialWindowMetrics}
      style={styles.root}
    >
      <AuthProvider>
        <MobileFrameWrapper>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor="#EAF8EE" />
            <RootNavigator />
          </NavigationContainer>
        </MobileFrameWrapper>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
