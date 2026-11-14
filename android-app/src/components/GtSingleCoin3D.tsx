import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface GtSingleCoin3DProps {
  width?: number;
  height?: number;
}

/**
 * GtSingleCoin3D - Official GT Coin Display for Market Overview
 * Renders the official high-resolution GT coin asset (image copy.png)
 */
export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  width = 90,
  height = 90,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={require('../../assets/gt-market-coin.png')}
        style={{ width: width - 6, height: height - 6 }}
        resizeMode="contain"
      />
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
