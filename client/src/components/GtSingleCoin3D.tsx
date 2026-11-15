import React from 'react';

interface GtSingleCoin3DProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * GtSingleCoin3D - Market Overview GT Coin
 * Renders the official crystal GT coin (image-removebg-preview (56).png)
 * with the exact smooth 3D floating and tilt animation from reference video 20261115-0552-53.7682372.mp4
 */
export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  className = '',
  width = 54,
  height = 54,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width, height, perspective: '600px' }}
    >
      <style>{`
        @keyframes gtCoinFloatSpin {
          0% {
            transform: translateY(0px) rotateY(0deg) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-4px) rotateY(28deg) rotate(3deg) scale(1.05);
          }
          50% {
            transform: translateY(0px) rotateY(0deg) rotate(0deg) scale(1);
          }
          75% {
            transform: translateY(4px) rotateY(-28deg) rotate(-3deg) scale(0.97);
          }
          100% {
            transform: translateY(0px) rotateY(0deg) rotate(0deg) scale(1);
          }
        }
        @keyframes gtCoinGlowPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.88);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.18);
          }
        }
      `}</style>

      {/* Ambient glowing aura behind the coin */}
      <div
        className="absolute inset-0 rounded-full bg-[#22C55E]/30 blur-md pointer-events-none"
        style={{ animation: 'gtCoinGlowPulse 3.5s ease-in-out infinite' }}
      />

      <img
        src="/gt-market-coin.png"
        alt="GT Coin"
        className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_4px_10px_rgba(22,101,52,0.35)]"
        style={{
          animation: 'gtCoinFloatSpin 5s ease-in-out infinite',
          transformStyle: 'preserve-3d',
        }}
      />
    </div>
  );
};

export default GtSingleCoin3D;
