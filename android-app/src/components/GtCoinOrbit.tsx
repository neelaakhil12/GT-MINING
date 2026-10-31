import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GtCoinOrbitProps {
  width?: number;
  height?: number;
}

const NUM_COINS = 11;

export const GtCoinOrbit: React.FC<GtCoinOrbitProps> = ({
  width = 150,
  height = 110,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animValue, {
        toValue: 1,
        duration: 9000, // Calm, smooth orbit speed matching web
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const centerX = width * 0.46;
  const centerY = height * 0.45;
  const radiusX = width * 0.38;
  const radiusY = height * 0.22;
  const diagonalTilt = height * 0.22;

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      {Array.from({ length: NUM_COINS }).map((_, i) => {
        const baseAngle = (i * 2 * Math.PI) / NUM_COINS;

        // Animated position around cross-horizontal slanted ellipse
        const translateX = animValue.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [
            centerX + Math.cos(baseAngle) * radiusX,
            centerX + Math.cos(baseAngle + Math.PI * 0.5) * radiusX,
            centerX + Math.cos(baseAngle + Math.PI) * radiusX,
            centerX + Math.cos(baseAngle + Math.PI * 1.5) * radiusX,
            centerX + Math.cos(baseAngle + Math.PI * 2) * radiusX,
          ],
        });

        const translateY = animValue.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [
            centerY -
              Math.sin(baseAngle) * radiusY +
              Math.cos(baseAngle) * diagonalTilt,
            centerY -
              Math.sin(baseAngle + Math.PI * 0.5) * radiusY +
              Math.cos(baseAngle + Math.PI * 0.5) * diagonalTilt,
            centerY -
              Math.sin(baseAngle + Math.PI) * radiusY +
              Math.cos(baseAngle + Math.PI) * diagonalTilt,
            centerY -
              Math.sin(baseAngle + Math.PI * 1.5) * radiusY +
              Math.cos(baseAngle + Math.PI * 1.5) * diagonalTilt,
            centerY -
              Math.sin(baseAngle + Math.PI * 2) * radiusY +
              Math.cos(baseAngle + Math.PI * 2) * diagonalTilt,
          ],
        });

        // 3D Depth Scale (front coins ~1.0, back coins ~0.65)
        const scale = animValue.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [
            0.7 + (Math.sin(baseAngle) + 1) * 0.16,
            0.7 + (Math.sin(baseAngle + Math.PI * 0.5) + 1) * 0.16,
            0.7 + (Math.sin(baseAngle + Math.PI) + 1) * 0.16,
            0.7 + (Math.sin(baseAngle + Math.PI * 1.5) + 1) * 0.16,
            0.7 + (Math.sin(baseAngle + Math.PI * 2) + 1) * 0.16,
          ],
        });

        // Dynamic 3D coin spin interpolation
        const spinRotate = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [`${(i * 32.7).toFixed(1)}deg`, `${(i * 32.7 + 360).toFixed(1)}deg`],
        });

        return (
          <Animated.View
            key={`coin-${i}`}
            style={[
              styles.coinWrapper,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                  { rotateZ: '18deg' }, // Cross horizontal tilt
                  { rotateY: spinRotate }, // 3D axial rotation
                ],
              },
            ]}
          >
            {/* Metallic Coin Face */}
            <LinearGradient
              colors={['#86EFAC', '#22C55E', '#15803D', '#0A341B']}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 0.9 }}
              style={styles.coinFace}
            >
              {/* Inner ring */}
              <View style={styles.coinInnerRing}>
                <Text style={styles.coinText}>GT</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: 4,
    overflow: 'visible',
  },
  coinWrapper: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinFace: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A341B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  coinInnerRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
});

