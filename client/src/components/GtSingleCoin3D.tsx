import React from 'react';

interface GtSingleCoin3DProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * GtSingleCoin3D - Market Overview GT Coin
 * Uses official high-res GT Coin asset from image copy.png (/gt-market-coin.png)
 */
export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  className = '',
  width = 105,
  height = 92,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width, height }}
    >
      <img
        src="/gt-market-coin.png"
        alt="GT Coin"
        className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(22,101,52,0.25)] transition-transform duration-500 hover:scale-105"
      />
    </div>
  );
};

export default GtSingleCoin3D;
