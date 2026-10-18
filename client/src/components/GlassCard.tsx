import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  interactive = false,
  glow = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl backdrop-blur-2xl border border-white/85 p-6 md:p-8 transition-all duration-300 ${
        interactive
          ? 'bg-white/65 hover:bg-white/80 hover:border-white hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(34,197,94,0.18)] cursor-pointer'
          : 'bg-white/65'
      } ${
        glow ? 'shadow-[0_20px_50px_rgba(34,197,94,0.15)] border-white' : 'shadow-[0_15px_35px_rgba(22,101,52,0.08)]'
      } ${className}`}
      style={{
        boxShadow: glow
          ? '0 20px 45px -10px rgba(22, 101, 52, 0.16), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95)'
          : '0 15px 35px -8px rgba(22, 101, 52, 0.08), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.9)',
      }}
    >
      {children}
    </div>
  );
};
