import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';

interface GtSingleCoin3DProps {
  width?: number;
  height?: number;
}

/**
 * GtSingleCoin3D - Official GT Crystal Coin Display for Market Overview
 * Renders the crystal emerald GT coin with smooth 360-degree 3D rotation & floating bob
 */
export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  width = 54,
  height = 54,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous 360-degree rotation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Subtle floating bob up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinAnim, floatAnim]);

  const rotateY = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
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
          source={require('../../assets/gt-crystal-coin.png')}
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
