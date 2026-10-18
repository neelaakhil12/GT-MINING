import React from 'react';

interface GtCoinProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  glow?: boolean;
}

export const GtCoin: React.FC<GtCoinProps> = ({
  size = 'md',
  animated = false,
  className = '',
  glow = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-24 h-24 text-lg',
    xl: 'w-48 h-48 md:w-56 md:h-56 text-2xl',
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Outer Pulse Ring for animated coins */}
      {glow && animated && (
        <div className="absolute inset-0 rounded-full bg-[#22C55E]/30 blur-xl animate-pulse-ring pointer-events-none" />
      )}

      {/* Outer Glow Halo */}
      {glow && (
        <div
          className={`absolute inset-0 rounded-full ${
            size === 'xl' ? 'bg-[#22C55E]/20 blur-2xl' : 'bg-[#22C55E]/15 blur-md'
          }`}
        />
      )}

      {/* Coin Body */}
      <div
        className={`${sizeMap[size]} rounded-full relative flex items-center justify-center ${
          animated ? 'animate-coin-float' : ''
        }`}
        style={{
          background: 'radial-gradient(circle at 35% 30%, #4ADE80 0%, #16A34A 55%, #0B381B 100%)',
          boxShadow: glow
            ? '0 0 25px rgba(34, 197, 94, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -4px 8px rgba(0, 0, 0, 0.7)'
            : 'inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(134, 239, 172, 0.55)',
        }}
      >
        {/* Inner Coin Rim */}
        <div
          className="absolute inset-1.5 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 65% 70%, #071F13 0%, #0D2E1C 100%)',
            border: '1.5px dashed rgba(134, 239, 172, 0.4)',
          }}
        >
          {/* Monogram GT */}
          <span
            className="font-black tracking-tight text-[#86EFAC] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '-0.05em',
            }}
          >
            GT
          </span>
        </div>

        {/* Shine highlight reflection */}
        <div className="absolute top-1 left-2 w-1/3 h-1/4 rounded-full bg-white/20 blur-[1px] transform -rotate-45 pointer-events-none" />
      </div>
    </div>
  );
};
