import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';

interface GtSingleCoin3DProps {
  width?: number;
  height?: number;
}

/**
 * GtSingleCoin3D - Market Overview GT Crystal Coin for App
 * Continuous Top & Bottom vertical flip with smooth floating bob.
 * Exactly matches website GtSingleCoin3D animation (rotateX top-to-bottom flip, 3.5s linear, always upright).
 */
export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  width = 72,
  height = 70,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const auraAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Continuous Top & Bottom vertical flip loop (3500ms linear infinite) matching website
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Ambient emerald aura pulse (3000ms ease-in-out infinite)
    Animated.loop(
      Animated.sequence([
        Animated.timing(auraAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(auraAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinAnim, auraAnim]);

  // Synchronized vertical floating bob (0px -> -5px -> 0px -> 5px -> 0px) matching CSS keyframes
  const translateY = spinAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -5, 0, 5, 0],
  });

  // Front Face: rotateX from 0deg to 360deg
  const frontRotateX = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Front Face Opacity: visible from 0 to 90deg and 270 to 360deg
  const frontOpacity = spinAnim.interpolate({
    inputRange: [0, 0.249, 0.25, 0.749, 0.75, 1],
    outputRange: [1, 1, 0, 0, 1, 1],
  });

  // Back Face: rotateX from 180deg to 540deg (so upright during the 90deg to 270deg flip)
  const backRotateX = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '540deg'],
  });

  // Back Face Opacity: visible from 90deg to 270deg
  const backOpacity = spinAnim.interpolate({
    inputRange: [0, 0.249, 0.25, 0.749, 0.75, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
  });

  // Aura animations
  const auraScale = auraAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.18],
  });

  const auraOpacity = auraAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.65],
  });

  const coinSize = Math.min(width, height) - 4;

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Ambient glowing emerald aura behind the coin */}
      <Animated.View
        style={[
          styles.aura,
          {
            width: coinSize + 8,
            height: coinSize + 8,
            borderRadius: (coinSize + 8) / 2,
            opacity: auraOpacity,
            transform: [{ scale: auraScale }],
          },
        ]}
      />

      {/* Floating & Rotating Container */}
      <View style={{ width: coinSize, height: coinSize, alignItems: 'center', justifyContent: 'center' }}>
        {/* Front Face */}
        <Animated.View
          style={[
            styles.coinFace,
            {
              width: coinSize,
              height: coinSize,
              opacity: frontOpacity,
              transform: [
                { perspective: 800 },
                { translateY },
                { rotateX: frontRotateX },
              ],
            },
          ]}
        >
          <Image
            source={require('../../assets/gt-market-coin.png')}
            style={styles.coinImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Back Face (keeps coin upright during back half of flip) */}
        <Animated.View
          style={[
            styles.coinFace,
            {
              width: coinSize,
              height: coinSize,
              opacity: backOpacity,
              transform: [
                { perspective: 800 },
                { translateY },
                { rotateX: backRotateX },
              ],
            },
          ]}
        >
          <Image
            source={require('../../assets/gt-market-coin.png')}
            style={styles.coinImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
};

export const GtCoinOrbit = GtSingleCoin3D;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aura: {
    position: 'absolute',
    backgroundColor: 'rgba(34, 197, 94, 0.32)',
  },
  coinFace: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinImage: {
    width: '100%',
    height: '100%',
  },
});

export default GtSingleCoin3D;
