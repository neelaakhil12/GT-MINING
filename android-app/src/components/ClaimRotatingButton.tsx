import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ClaimRotatingButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
}

export const ClaimRotatingButton: React.FC<ClaimRotatingButtonProps> = ({
  onPress,
  disabled = false,
  isLoading = false,
  label = 'Claim',
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2600, // Rotating line beam speed
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePress = () => {
    if (disabled || isLoading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Haptics fallback
    }
    onPress();
  };

  return (
    <View style={styles.outerWrapper}>
      {/* 1. Animated Rotating Beam Border */}
      {!disabled && (
        <Animated.View
          style={[
            styles.rotatingBeamContainer,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'transparent',
              'transparent',
              'rgba(34, 197, 94, 0.25)',
              '#22C55E',
              '#86EFAC',
              '#FFFFFF',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rotatingBeamGradient}
          />
        </Animated.View>
      )}

      {/* 2. Inner Button */}
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || isLoading}
        activeOpacity={0.85}
        style={[styles.buttonInner, disabled && styles.buttonDisabled]}
      >
        <LinearGradient
          colors={
            disabled
              ? ['#374151', '#1F2937']
              : ['#0A341B', '#15803D']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {isLoading ? (
            <View style={styles.contentRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.buttonText}>Claiming...</Text>
            </View>
          ) : (
            <View style={styles.contentRow}>
              {!disabled && (
                <Sparkles size={13} color="#86EFAC" style={{ marginRight: 4 }} />
              )}
              <Text style={styles.buttonText}>{label}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'relative',
    borderRadius: 999,
    padding: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  rotatingBeamContainer: {
    position: 'absolute',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotatingBeamGradient: {
    width: '100%',
    height: '100%',
  },
  buttonInner: {
    borderRadius: 999,
    overflow: 'hidden',
    zIndex: 2,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  gradientButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

