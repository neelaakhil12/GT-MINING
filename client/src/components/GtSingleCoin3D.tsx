import React from 'react';

interface GtSingleCoin3DProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * GtSingleCoin3D - Market Overview GT Crystal Coin
 * Exact user-selected crystal emerald GT coin (gt-market-coin.png)
 * Continuous Top & Bottom vertical flip with smooth floating bob.
 */
export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  className = '',
  width = 72,
  height = 70,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width, height, perspective: '800px' }}
    >
      {/* Ambient glowing emerald aura behind the coin */}
      <div
        className="absolute inset-0 rounded-full bg-[#22C55E]/30 blur-md pointer-events-none gt-coin-aura"
      />

      {/* Top & Bottom continuous vertical flip container */}
      <div
        className="relative w-full h-full flex items-center justify-center gt-coin-flip-container"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face */}
        <img
          src="/gt-market-coin.png"
          alt="GT Coin Front"
          className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(22,101,52,0.35)]"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        />

        {/* Back Face (rotated 180deg over X axis so it is upright when flipped from top to bottom) */}
        <img
          src="/gt-market-coin.png"
          alt="GT Coin Back"
          className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(22,101,52,0.35)]"
          style={{
            transform: 'rotateX(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        />
      </div>
    </div>
  );
};

export default GtSingleCoin3D;
