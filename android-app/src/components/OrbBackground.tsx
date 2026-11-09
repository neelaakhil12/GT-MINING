import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const OrbBackground: React.FC = () => {
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 7500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 7500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY1 = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const translateY2 = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Base soft green background */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#EAF8EE' }]} />

      {/* Large 3D sphere top-left */}
      <Animated.View
        style={[
          styles.orbLarge,
          {
            transform: [{ translateY: translateY1 }],
          },
        ]}
      >
        <LinearGradient
          colors={['#BBF7D0', '#4ADE80', '#22C55E', '#15803D']}
          start={{ x: 0.25, y: 0.2 }}
          end={{ x: 0.85, y: 0.9 }}
          style={styles.gradientFill}
        >
          {/* Specular highlight */}
          <View style={styles.specularHighlight} />
        </LinearGradient>
      </Animated.View>

      {/* Medium 3D sphere right */}
      <Animated.View
        style={[
          styles.orbMedium,
          {
            transform: [{ translateY: translateY2 }],
          },
        ]}
      >
        <LinearGradient
          colors={['#DCFCE7', '#86EFAC', '#22C55E', '#166534']}
          start={{ x: 0.3, y: 0.25 }}
          end={{ x: 0.9, y: 0.95 }}
          style={styles.gradientFill}
        >
          <View style={styles.specularHighlightSmall} />
        </LinearGradient>
      </Animated.View>

      {/* Small floating sphere top right */}
      <View style={styles.orbSmall}>
        <LinearGradient
          colors={['#BBF7D0', '#4ADE80', '#15803D']}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.9, y: 0.9 }}
          style={styles.gradientFill}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientFill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  orbLarge: {
    position: 'absolute',
    top: 60,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.65,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
  },
  orbMedium: {
    position: 'absolute',
    top: height * 0.45,
    right: -45,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.7,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
  },
  orbSmall: {
    position: 'absolute',
    top: 40,
    right: 35,
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.75,
  },
  specularHighlight: {
    position: 'absolute',
    top: '18%',
    left: '22%',
    width: '28%',
    height: '16%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    transform: [{ rotate: '-35deg' }],
  },
  specularHighlightSmall: {
    position: 'absolute',
    top: '20%',
    left: '24%',
    width: '24%',
    height: '14%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transform: [{ rotate: '-35deg' }],
  },
});

