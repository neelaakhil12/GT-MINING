import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  borderHover?: boolean;
  onClick?: () => void;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  children,
  className = '',
  glow = false,
  borderHover = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl bg-[#0B2516]/90 border border-[#86EFAC]/20 p-5 sm:p-6 shadow-xl backdrop-blur-xl transition-all duration-300 text-white ${
        borderHover ? 'hover:border-[#86EFAC]/50 hover:shadow-[0_10px_30px_rgba(34,197,94,0.15)]' : ''
      } ${
        glow ? 'border-[#22C55E]/40 shadow-[0_12px_32px_rgba(34,197,94,0.18)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

