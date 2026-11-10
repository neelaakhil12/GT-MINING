import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Text, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GtSingleCoin3DProps {
  width?: number;
  height?: number;
}

export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  width = 90,
  height = 90,
}) => {
  // Continuous 360-degree rotation animation
  const rotateAnim = useRef(new Animated.Value(0)).current;
  // Floating vertical bobbing animation
  const bobAnim = useRef(new Animated.Value(0)).current;
  // Specular shine sweep across the coin face
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Continuous 360-degree rotation (approx 4.6s per turn like video)
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Gentle floating bob up and down
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Specular glare sweep
    const shineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 2300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    rotateLoop.start();
    bobLoop.start();
    shineLoop.start();

    return () => {
      rotateLoop.stop();
      bobLoop.stop();
      shineLoop.stop();
    };
  }, [rotateAnim, bobAnim, shineAnim]);

  // Rotates 0 -> 360 deg
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Floating bob -3px to +3px
  const translateY = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-3, 3],
  });

  // Specular shine sweep from -100% to +150%
  const shineTranslateX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 80],
  });

  // Specular shine opacity pulses when coin is facing light
  const shineOpacity = rotateAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0.85, 0.2, 0.1, 0.75, 0.85],
  });

  const coinSize = 68;

  // Reusable Face Component for BOTH sides
  const renderCoinFace = (isBack: boolean = false) => (
    <LinearGradient
      colors={['#86EFAC', '#22C55E', '#15803D', '#0A341B']}
      start={{ x: 0.15, y: 0.1 }}
      end={{ x: 0.85, y: 0.95 }}
      style={[
        styles.coinFace,
        {
          width: coinSize,
          height: coinSize,
          borderRadius: coinSize / 2,
          backfaceVisibility: 'hidden',
          transform: isBack ? [{ rotateX: '180deg' }] : [],
        },
      ]}
    >
      {/* Polished Metallic Bevel Rim */}
      <View
        style={[
          styles.outerRim,
          { width: coinSize - 4, height: coinSize - 4, borderRadius: (coinSize - 4) / 2 },
        ]}
      >
        {/* Minted Dashed Ring with High-Contrast Luminous Center Medallion */}
        <View
          style={[
            styles.dashedRing,
            { width: coinSize - 16, height: coinSize - 16, borderRadius: (coinSize - 16) / 2 },
          ]}
        >
          {/* Deep Contrasting Center Medallion Core for High Logo Clarity */}
          <LinearGradient
            colors={['#064E3B', '#022C17', '#01190C']}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            style={styles.logoMedallionCore}
          >
            {/* GT Crystal Logo */}
            <Image
              source={require('../../assets/gt-logo.png')}
              style={{ width: coinSize * 0.42, height: coinSize * 0.42 }}
              resizeMode="contain"
            />
            {/* Embossed GT Text */}
            <Text style={styles.coinGtText}>GT</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Sweeping Specular Light Glint Overlay */}
      <Animated.View
        style={[
          styles.specularShineContainer,
          {
            opacity: shineOpacity,
            transform: [{ translateX: shineTranslateX }, { rotateZ: '35deg' }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.45)',
            'rgba(254, 240, 138, 0.75)',
            'rgba(255, 255, 255, 0.45)',
            'rgba(255, 255, 255, 0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.specularShine}
        />
      </Animated.View>
    </LinearGradient>
  );

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      {/* Soft Ambient Emerald Glow */}
      <View style={[styles.ambientGlow, { width: coinSize * 1.3, height: coinSize * 1.3 }]} />

      {/* 3D Floating Coin Group */}
      <Animated.View
        style={[
          styles.coinGroup,
          {
            width: coinSize,
            height: coinSize,
            transform: [
              { translateY },
              { perspective: 900 },
              { rotateY: '24deg' },  // Isometric 3D angle so edge thickness is visible
              { rotateZ: '-10deg' }, // Dynamic tilt
              { rotateX: spin },     // Continuous horizontal flip around horizontal X axis
            ],
          },
        ]}
      >
        {/* Layered 3D Cylindrical Edge (creates true thickness and metallic edge) */}
        {[-3, -2, -1, 1, 2, 3].map((depth) => (
          <View
            key={`edge-slice-${depth}`}
            style={[
              styles.edgeSlice,
              {
                width: coinSize,
                height: coinSize,
                borderRadius: coinSize / 2,
                transform: [{ translateY: depth * 0.8 }, { translateX: depth * 0.4 }],
              },
            ]}
          />
        ))}

        {/* FRONT COIN FACE (Visible when angle 0 - 90 & 270 - 360) */}
        {renderCoinFace(false)}

        {/* BACK COIN FACE (Visible when angle 90 - 270) */}
        {renderCoinFace(true)}
      </Animated.View>
    </View>
  );
};

// Also export as GtCoinOrbit for backward compatibility
export const GtCoinOrbit = GtSingleCoin3D;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 4,
    top: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  ambientGlow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(34, 197, 94, 0.22)',
    // @ts-ignore
    filter: Platform.OS === 'web' ? 'blur(16px)' : undefined,
  },
  coinGroup: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#052E16',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 6,
  },
  edgeSlice: {
    position: 'absolute',
    backgroundColor: '#0F5327',
    borderWidth: 1.5,
    borderColor: '#15803D',
  },
  coinFace: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DCFCE7',
    overflow: 'hidden',
  },
  outerRim: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(254, 240, 138, 0.85)', // Gold accent
    backgroundColor: 'transparent',
  },
  dashedRing: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: 'rgba(220, 252, 231, 0.85)',
    backgroundColor: 'rgba(5, 46, 22, 0.35)',
  },
  logoMedallionCore: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEF08A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  coinGtText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FEF08A',
    letterSpacing: 0.5,
    marginTop: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  specularShineContainer: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 32,
  },
  specularShine: {
    flex: 1,
  },
});
