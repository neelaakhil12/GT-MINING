import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
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
  const [progress, setProgress] = useState(0);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    const duration = 8500; // Continuous smooth orbit speed

    const loop = (timestamp: number) => {
      if (!active) return;
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const t = (elapsed % duration) / duration;
      setProgress(t);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
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
        const currentAngle = baseAngle + progress * 2 * Math.PI;

        const x = centerX + Math.cos(currentAngle) * radiusX;
        const y =
          centerY -
          Math.sin(currentAngle) * radiusY +
          Math.cos(currentAngle) * diagonalTilt;

        // 3D Depth Scale (front coins ~1.02, back coins ~0.68)
        const scale = 0.7 + (Math.sin(currentAngle) + 1) * 0.16;
        const zIndex = Math.round(scale * 100);

        return (
          <View
            key={`orbit-coin-${i}`}
            style={[
              styles.coinWrapper,
              {
                zIndex,
                transform: [
                  { translateX: x - 16 },
                  { translateY: y - 16 },
                  { scale },
                  { rotateZ: '18deg' },
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
              {/* Inner ring with GT Crystal Logo */}
              <View style={styles.coinInnerRing}>
                <Image
                  source={require('../../assets/gt-logo.png')}
                  style={styles.coinLogo}
                  resizeMode="contain"
                />
              </View>
            </LinearGradient>
          </View>
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
    width: 23,
    height: 23,
    borderRadius: 11.5,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 52, 27, 0.2)',
  },
  coinLogo: {
    width: 17,
    height: 17,
  },
});
