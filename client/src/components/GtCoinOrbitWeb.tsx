import React, { useEffect, useRef, useState } from 'react';

interface GtCoinOrbitWebProps {
  className?: string;
  width?: number;
  height?: number;
}

const NUM_COINS = 11;

export const GtCoinOrbitWeb: React.FC<GtCoinOrbitWebProps> = ({
  className = '',
  width = 150,
  height = 110,
}) => {
  const [progress, setProgress] = useState(0);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 8500; // Continuous smooth orbit speed matching app

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const t = (elapsed % duration) / duration;
      setProgress(t);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const centerX = width * 0.46;
  const centerY = height * 0.45;
  const radiusX = width * 0.38;
  const radiusY = height * 0.22;
  const diagonalTilt = height * 0.22;

  return (
    <div
      className={`absolute pointer-events-none select-none overflow-visible right-0 top-1 ${className}`}
      style={{ width, height }}
    >
      {Array.from({ length: NUM_COINS }).map((_, i) => {
        const baseAngle = (i * 2 * Math.PI) / NUM_COINS;
        const currentAngle = baseAngle + progress * 2 * Math.PI;

        const x = centerX + Math.cos(currentAngle) * radiusX;
        const y =
          centerY -
          Math.sin(currentAngle) * radiusY +
          Math.cos(currentAngle) * diagonalTilt;
        const scale = 0.7 + (Math.sin(currentAngle) + 1) * 0.16;
        const zIndex = Math.round(scale * 100);

        return (
          <div
            key={`orbit-coin-${i}`}
            className="absolute flex items-center justify-center will-change-transform"
            style={{
              width: 32,
              height: 32,
              transform: `translate(${x - 16}px, ${y - 16}px) scale(${scale}) rotate(18deg)`,
              zIndex,
            }}
          >
            {/* Metallic Emerald Coin Face */}
            <div
              className="w-[30px] h-[30px] rounded-full border-[1.5px] border-[#DCFCE7] flex items-center justify-center shadow-md relative"
              style={{
                background: 'radial-gradient(circle at 30% 25%, #86EFAC 0%, #22C55E 40%, #15803D 75%, #0A341B 100%)',
                boxShadow: '0 4px 10px rgba(10, 52, 27, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
              }}
            >
              {/* Inner Dashed Ring with Subtle Dark Fill */}
              <div
                className="w-[23px] h-[23px] rounded-full border border-dashed border-white/75 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(10, 52, 27, 0.22)' }}
              >
                <img
                  src="/gt-header-logo.png"
                  alt="GT Logo"
                  className="w-[17px] h-[17px] object-contain drop-shadow"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

