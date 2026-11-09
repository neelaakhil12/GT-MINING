import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated, Easing, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MiningGlobe3DProps {
  spinning?: boolean;
}

export const MiningGlobe3D: React.FC<MiningGlobe3DProps> = ({ spinning = false }) => {
  // Continuous rotation animations
  const baseRotateAnim = useRef(new Animated.Value(0)).current;
  const counterRotateAnim = useRef(new Animated.Value(0)).current;
  const verticalFloatAnim = useRef(new Animated.Value(0)).current;
  const pulseAuraAnim = useRef(new Animated.Value(1)).current;
  const fastSpinAnim = useRef(new Animated.Value(0)).current;
  const isFastSpinning = useRef(false);

  useEffect(() => {
    // 1. Smooth slow continuous rotation of outer rings
    Animated.loop(
      Animated.timing(baseRotateAnim, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Counter rotation of inner orbital ring
    Animated.loop(
      Animated.timing(counterRotateAnim, {
        toValue: 1,
        duration: 6500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Floating levitation bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(verticalFloatAnim, {
          toValue: -10,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(verticalFloatAnim, {
          toValue: 10,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Subtle ambient aura breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAuraAnim, {
          toValue: 1.18,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAuraAnim, {
          toValue: 0.95,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 5. Trigger fast spin on mining activation
  useEffect(() => {
    if (spinning && !isFastSpinning.current) {
      isFastSpinning.current = true;
      fastSpinAnim.setValue(0);
      Animated.timing(fastSpinAnim, {
        toValue: 1,
        duration: 2600,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start(() => {
        isFastSpinning.current = false;
      });
    }
  }, [spinning]);

  const baseSpin = baseRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const counterSpin = counterRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const fastSpinExtra = fastSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2880deg'], // 8 ultra-fast spins
  });

  const fastScale = fastSpinAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.25, 1],
  });

  return (
    <View style={styles.container}>
      {/* Ambient glowing background aura */}
      <Animated.View
        style={[
          styles.ambientAura,
          {
            transform: [{ scale: pulseAuraAnim }],
          },
        ]}
      />

      {/* Floating 3D Globe Assembly */}
      <Animated.View
        style={[
          styles.globeAssembly,
          {
            transform: [
              { translateY: verticalFloatAnim },
              { scale: fastScale },
            ],
          },
        ]}
      >
        {/* Layer 1: Outer Celestial Orbital Ring (Tilted) */}
        <Animated.View
          style={[
            styles.outerOrbitalRing,
            {
              transform: [
                { rotateX: '65deg' },
                { rotateZ: '-25deg' },
                { rotateZ: baseSpin },
              ],
            },
          ]}
        >
          {/* Orbital Node Satellites */}
          <View style={[styles.nodePoint, { top: -4, left: '50%', transform: [{ translateX: -4 }] }]}>
            <View style={styles.nodeCore} />
          </View>
          <View style={[styles.nodePoint, { bottom: -4, left: '50%', transform: [{ translateX: -4 }] }]}>
            <View style={styles.nodeCore} />
          </View>
        </Animated.View>

        {/* Layer 2: Counter-Rotating Secondary Celestial Ring */}
        <Animated.View
          style={[
            styles.innerOrbitalRing,
            {
              transform: [
                { rotateX: '55deg' },
                { rotateY: '35deg' },
                { rotateZ: counterSpin },
              ],
            },
          ]}
        >
          <View style={[styles.nodePointSmall, { top: -3, right: '20%' }]} />
          <View style={[styles.nodePointSmall, { bottom: -3, left: '20%' }]} />
        </Animated.View>

        {/* Layer 3: Central GT 3D Core Sphere & Gem Facets */}
        <Animated.View
          style={[
            styles.coreSphereContainer,
            {
              transform: [
                { rotateY: baseSpin },
                { rotateZ: fastSpinExtra },
              ],
            },
          ]}
        >
          {/* Sphere Outer Glow */}
          <LinearGradient
            colors={['#4ade80', '#16a34a', '#052e16']}
            start={{ x: 0.15, y: 0.1 }}
            end={{ x: 0.85, y: 0.95 }}
            style={styles.coreSphere}
          >
            {/* Top specular highlight shine */}
            <View style={styles.specularShine} />

            {/* Inner crystalline facets */}
            <View style={styles.crystalFacet1} />
            <View style={styles.crystalFacet2} />

            {/* Center GT Hologram Monogram */}
            <View style={styles.centerMonogramBox}>
              <Text style={styles.monogramText}>GT</Text>
              <Text style={styles.miningSubText}>MINING</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientAura: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(74, 222, 128, 0.22)',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 40,
    elevation: 10,
  },
  globeAssembly: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerOrbitalRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: 'rgba(134, 239, 172, 0.65)',
    borderStyle: 'dashed',
  },
  innerOrbitalRing: {
    position: 'absolute',
    width: 175,
    height: 175,
    borderRadius: 87.5,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.45)',
  },
  nodePoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#86efac',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  nodeCore: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ffffff',
  },
  nodePointSmall: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    shadowColor: '#16a34a',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  coreSphereContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  coreSphere: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  specularShine: {
    position: 'absolute',
    top: 10,
    left: 20,
    width: 45,
    height: 25,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    transform: [{ rotate: '-30deg' }],
  },
  crystalFacet1: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 45,
    transform: [{ rotate: '45deg' }],
  },
  crystalFacet2: {
    position: 'absolute',
    width: 110,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 25,
    transform: [{ rotate: '-35deg' }],
  },
  centerMonogramBox: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  monogramText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  miningSubText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#dcfce7',
    letterSpacing: 3,
    marginTop: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
