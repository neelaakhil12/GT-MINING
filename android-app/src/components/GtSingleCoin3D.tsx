import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';

interface GtSingleCoin3DProps {
  width?: number;
  height?: number;
}

/**
 * GtSingleCoin3D - Official GT Coin Display for Market Overview
 * Renders the official high-resolution GT coin asset with smooth floating & tilt animation
 */
export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  width = 52,
  height = 52,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animValue]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const rotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

  const scale = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          transform: [{ translateY }, { rotate }, { scale }],
        },
      ]}
    >
      <Image
        source={require('../../assets/gt-market-coin.png')}
        style={{ width: width - 4, height: height - 4 }}
        resizeMode="contain"
      />
    </Animated.View>
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
