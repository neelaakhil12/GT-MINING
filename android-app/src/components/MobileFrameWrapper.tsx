import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';

export const MobileFrameWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // On native mobile (Android/iOS) or small mobile viewports, show full screen directly
  const isDesktopWeb = Platform.OS === 'web' && windowWidth > 520;

  if (!isDesktopWeb) {
    return <View style={styles.fullscreen}>{children}</View>;
  }

  // On desktop browser, wrap in an authentic, high-end smartphone frame
  const frameHeight = Math.min(844, windowHeight - 48);

  return (
    <View style={styles.desktopBackdrop}>
      {/* Top Banner Tag */}
      <View style={styles.deviceBanner}>
        <View style={styles.greenDot} />
        <Text style={styles.deviceBannerText}>
          GT Network Mobile App (Desktop Preview • Port 8081)
        </Text>
      </View>

      {/* Outer Smartphone Chassis */}
      <View style={[styles.phoneChassis, { height: frameHeight }]}>
        {/* Left Side Buttons (Volume & Action) */}
        <View style={styles.buttonAction} />
        <View style={styles.buttonVolumeUp} />
        <View style={styles.buttonVolumeDown} />

        {/* Right Side Power Button */}
        <View style={styles.buttonPower} />

        {/* Outer Titanium Bezel */}
        <View style={styles.bezelBorder}>
          {/* Dynamic Island / Camera Notch */}
          <View style={styles.dynamicIslandContainer}>
            <View style={styles.dynamicIslandPill}>
              <View style={styles.cameraLens} />
              <View style={styles.sensorDot} />
            </View>
          </View>

          {/* Inner Screen Display */}
          <View style={styles.screenInner}>{children}</View>

          {/* Bottom Home Indicator Bar */}
          <View style={styles.homeIndicatorWrapper} pointerEvents="none">
            <View style={styles.homeIndicatorBar} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  desktopBackdrop: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
    backgroundColor: '#071A0F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  deviceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 14,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  deviceBannerText: {
    color: '#DCFCE7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  phoneChassis: {
    position: 'relative',
    width: 395,
    borderRadius: 50,
    backgroundColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.55,
    shadowRadius: 50,
    elevation: 24,
  },
  bezelBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#0F172A',
    overflow: 'hidden',
    backgroundColor: '#EAF8EE',
    position: 'relative',
  },
  screenInner: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#EAF8EE',
    paddingTop: 32,
  },
  dynamicIslandContainer: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  dynamicIslandPill: {
    width: 105,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10,
  },
  cameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 6,
  },
  sensorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#064E3B',
  },
  homeIndicatorWrapper: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  homeIndicatorBar: {
    width: 130,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: 'rgba(10, 52, 27, 0.45)',
  },
  // Hardware Side Buttons
  buttonAction: {
    position: 'absolute',
    left: -13,
    top: 90,
    width: 3.5,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  buttonVolumeUp: {
    position: 'absolute',
    left: -13,
    top: 130,
    width: 3.5,
    height: 46,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  buttonVolumeDown: {
    position: 'absolute',
    left: -13,
    top: 190,
    width: 3.5,
    height: 46,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  buttonPower: {
    position: 'absolute',
    right: -13,
    top: 140,
    width: 3.5,
    height: 64,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
});

