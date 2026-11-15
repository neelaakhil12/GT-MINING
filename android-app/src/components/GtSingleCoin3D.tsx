import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';

interface GtSingleCoin3DProps {
  width?: number;
  height?: number;
}

/**
 * GtSingleCoin3D - Official GT Crystal Coin Display for Market Overview
 * Renders the crystal emerald GT coin (image-removebg-preview (56).png)
 * with the exact smooth floating and 3D tilt animation matching reference video 20261115-0552-53.7682372.mp4
 */
export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  width = 54,
  height = 54,
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
    <View style={[styles.container, { width, height }]}>
      <Animated.View
        style={{
          width: width - 4,
          height: height - 4,
          transform: [
            { translateY },
            { rotate },
            { scale },
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
