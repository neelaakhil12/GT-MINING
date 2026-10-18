import React from 'react';

interface GtLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'nav' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  spinning?: boolean;
  glow?: boolean;
  className?: string;
  showText?: boolean;
}

export const GtLogo: React.FC<GtLogoProps> = ({
  size = 'md',
  animated = false,
  spinning = false,
  glow = true,
  className = '',
  showText = false,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    nav: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56',
    '2xl': 'w-56 h-56 sm:w-72 sm:h-72',
  };

  return (
    <div className={`relative inline-flex items-center gap-3 select-none ${className}`}>
      {/* Outer ambient glow */}
      {glow && (
        <div
          className={`absolute rounded-full pointer-events-none transition-all duration-700 ${
            size === 'xl' || size === '2xl'
              ? 'inset-[-16px] bg-gradient-to-tr from-[#22C55E]/40 via-[#86EFAC]/30 to-transparent blur-3xl'
              : size === 'nav'
              ? 'inset-[-8px] bg-[#22C55E]/30 blur-xl'
              : 'inset-[-4px] bg-[#22C55E]/25 blur-md'
          } ${spinning ? 'scale-125 opacity-100' : animated ? 'animate-pulse' : ''}`}
        />
      )}

      {/* Crystal Logo Image Container */}
      <div
        className={`relative ${sizeMap[size]} flex items-center justify-center shrink-0 ${
          spinning
            ? 'animate-rapid-spin'
            : animated
            ? 'animate-coin-float'
            : ''
        }`}
      >
        <img
          src="/gt-logo.png"
          alt="GT Mining Crystal Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(34,197,94,0.38)] transition-transform duration-300 hover:scale-105"
          loading="eager"
        />

        {/* Specular glint overlay */}
        {glow && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
        )}
      </div>

      {showText && (
        <span className="font-black text-2xl sm:text-3xl tracking-wider text-[#16A34A] leading-none">
          GT
        </span>
      )}
    </div>
  );
};
