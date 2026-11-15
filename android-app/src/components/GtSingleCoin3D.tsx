import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';

interface GtSingleCoin3DProps {
  width?: number;
  height?: number;
}

/**
 * GtSingleCoin3D - Official GT Crystal Coin Display for Market Overview
 * Continuous 360-degree rotation flip with smooth floating bob
 * Uses the exact crystal emerald GT coin (gt-market-coin.png) matching reference.
 */
export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  width = 70,
  height = 68,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous 360-degree rotation loop
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Floating bob up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinAnim, floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const rotateY = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width, height }]}>
      <Animated.View
        style={{
          width: width - 4,
          height: height - 4,
          transform: [
            { translateY },
            { rotateY },
          ],
        }}
      >
        <Image
          source={require('../../assets/gt-market-coin.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

export const GtCoinOrbit = GtSingleCoin3D;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GtSingleCoin3D;
