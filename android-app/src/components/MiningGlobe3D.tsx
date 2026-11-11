import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle, Path } from 'react-native-svg';
import { useIsFocused } from '@react-navigation/native';

interface MiningGlobe3DProps {
  spinning?: boolean;
}

interface TileSpec {
  nx: number;
  ny: number;
  nz: number;
  ux: number;
  uy: number;
  uz: number;
  vx: number;
  vy: number;
  vz: number;
  hw: number;
  hh: number;
  baseRadius: number;
  phase: number;
  speed: number;
  amplitude: number;
}

interface GlobeFrame {
  backPaths: string[];
  frontPaths: string[];
  bobY: number;
  sphereR: number;
  highlightX: number;
  highlightY: number;
  highlightR: number;
}

// 6 emerald wafer shading buckets matching Three.js studio lighting (dark rim -> specular highlight)
const TILE_COLORS = [
  '#0C592C',
  '#15803D',
  '#16A34A',
  '#22C55E',
  '#4ADE80',
  '#86EFAC',
] as const;

const TILE_STROKES = [
  'rgba(5, 46, 22, 0.45)',
  'rgba(20, 83, 45, 0.35)',
  'rgba(134, 239, 172, 0.28)',
  'rgba(187, 247, 208, 0.36)',
  'rgba(220, 252, 231, 0.45)',
  'rgba(255, 255, 255, 0.55)',
] as const;

const VIEW_W = 260;
const VIEW_H = 236;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const CAM_Z = 5.7;
const CORE_R = 1.62;
// Perspective focal length tuned so core sphere + outer tiles fit cleanly without edge clipping
const FOCAL = 222;
const BASE_SPHERE_SCREEN_R = (FOCAL * CORE_R) / Math.sqrt(CAM_Z * CAM_Z - CORE_R * CORE_R);

const TILT_X = 0.18;
const TILT_Z = -0.06;
const COS_TX = Math.cos(TILT_X);
const SIN_TX = Math.sin(TILT_X);
const COS_TZ = Math.cos(TILT_Z);
const SIN_TZ = Math.sin(TILT_Z);

function createTileSpecs(): TileSpec[] {
  const tileCount = 165;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const specs: TileSpec[] = [];

  for (let i = 0; i < tileCount; i++) {
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / tileCount);
    const sinPhi = Math.sin(phi);

    const nx = sinPhi * Math.cos(theta);
    const ny = sinPhi * Math.sin(theta);
    const nz = Math.cos(phi);

    // Orthonormal tangent basis (U, V) perpendicular to N
    const refX = Math.abs(ny) > 0.98 ? 1 : 0;
    const refY = Math.abs(ny) > 0.98 ? 0 : 1;
    const refZ = 0;

    // U = normalize(cross(ref, N))
    let ux = refY * nz - refZ * ny;
    let uy = refZ * nx - refX * nz;
    let uz = refX * ny - refY * nx;
    const uLen = Math.hypot(ux, uy, uz) || 1;
    ux /= uLen;
    uy /= uLen;
    uz /= uLen;

    // V = normalize(cross(N, U))
    const vx = ny * uz - nz * uy;
    const vy = nz * ux - nx * uz;
    const vz = nx * uy - ny * ux;

    let baseRadius = 1.66;
    if (i % 5 === 0) {
      baseRadius = 2.14 + (i % 3) * 0.11;
    } else if (i % 2 === 0) {
      baseRadius = 1.88 + (i % 4) * 0.08;
    } else {
      baseRadius = 1.66 + Math.sin(i * 3.1) * 0.04;
    }

    const scaleX = 0.9 + Math.sin(i * 1.5) * 0.2;
    const scaleY = 0.9 + Math.cos(i * 1.5) * 0.2;

    specs.push({
      nx,
      ny,
      nz,
      ux,
      uy,
      uz,
      vx,
      vy,
      vz,
      hw: 0.125 * scaleX,
      hh: 0.125 * scaleY,
      baseRadius,
      phase: ((i * 1.37) % (Math.PI * 2)),
      speed: 0.0035 + ((i % 7) * 0.0005),
      amplitude: baseRadius > 1.8 ? 0.15 + ((i % 4) * 0.025) : 0.05,
    });
  }

  return specs;
}

function computeFrame(
  tiles: TileSpec[],
  angleY: number,
  nowMs: number,
  scalePulse: number
): GlobeFrame {
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);

  // Combined rotation matrix M = Rz(TILT_Z) * Rx(TILT_X) * Ry(angleY)
  const m00 = COS_TZ * cosY - SIN_TZ * SIN_TX * sinY;
  const m01 = -SIN_TZ * COS_TX;
  const m02 = COS_TZ * sinY + SIN_TZ * SIN_TX * cosY;

  const m10 = SIN_TZ * cosY + COS_TZ * SIN_TX * sinY;
  const m11 = COS_TZ * COS_TX;
  const m12 = SIN_TZ * sinY - COS_TZ * SIN_TX * cosY;

  const m20 = -COS_TX * sinY;
  const m21 = SIN_TX;
  const m22 = COS_TX * cosY;

  const bobY = -Math.sin(nowMs * 0.0022) * 3.6;
  const cyBob = CY + bobY;

  const backBuckets = ['', '', '', '', '', ''];
  const frontBuckets = ['', '', '', '', '', ''];

  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i];
    const r = (t.baseRadius + Math.sin(nowMs * t.speed + t.phase) * t.amplitude) * scalePulse;

    // Rotated unit normal
    const rnx = m00 * t.nx + m01 * t.ny + m02 * t.nz;
    const rny = m10 * t.nx + m11 * t.ny + m12 * t.nz;
    const rnz = m20 * t.nx + m21 * t.ny + m22 * t.nz;

    // 3D tile center
    const cx3 = rnx * r;
    const cy3 = rny * r;
    const cz3 = rnz * r;

    // Rotated half-axis tangent vectors
    const hw = t.hw * scalePulse;
    const hh = t.hh * scalePulse;
    const dux = (m00 * t.ux + m01 * t.uy + m02 * t.uz) * hw;
    const duy = (m10 * t.ux + m11 * t.uy + m12 * t.uz) * hw;
    const duz = (m20 * t.ux + m21 * t.uy + m22 * t.uz) * hw;

    const dvx = (m00 * t.vx + m01 * t.vy + m02 * t.vz) * hh;
    const dvy = (m10 * t.vx + m11 * t.vy + m12 * t.vz) * hh;
    const dvz = (m20 * t.vx + m21 * t.vy + m22 * t.vz) * hh;

    // Project 4 corners to 2D SVG viewport
    const p0z = CAM_Z - (cz3 - duz - dvz);
    const p1z = CAM_Z - (cz3 + duz - dvz);
    const p2z = CAM_Z - (cz3 + duz + dvz);
    const p3z = CAM_Z - (cz3 - duz + dvz);

    const x0 = CX + ((cx3 - dux - dvx) * FOCAL) / p0z;
    const y0 = cyBob - ((cy3 - duy - dvy) * FOCAL) / p0z;
    const x1 = CX + ((cx3 + dux - dvx) * FOCAL) / p1z;
    const y1 = cyBob - ((cy3 + duy - dvy) * FOCAL) / p1z;
    const x2 = CX + ((cx3 + dux + dvx) * FOCAL) / p2z;
    const y2 = cyBob - ((cy3 + duy + dvy) * FOCAL) / p2z;
    const x3 = CX + ((cx3 - dux + dvx) * FOCAL) / p3z;
    const y3 = cyBob - ((cy3 - duy + dvy) * FOCAL) / p3z;

    // Directional studio lighting intensity -> 6 emerald buckets
    const facing = Math.abs(rnz);
    const key = Math.max(0, rnx * 0.56 + rny * 0.68 + rnz * 0.48);
    const fill = Math.max(0, rnx * -0.58 + rny * -0.38 + rnz * 0.42);
    const shade = 0.18 + key * 0.62 + fill * 0.24 + facing * 0.14;
    const bucket = Math.max(0, Math.min(5, Math.floor(shade * 5.3)));

    const d = `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}L${x3.toFixed(1)} ${y3.toFixed(1)}Z`;
    if (cz3 < 0) {
      backBuckets[bucket] += d;
    } else {
      frontBuckets[bucket] += d;
    }
  }

  const sphereR = BASE_SPHERE_SCREEN_R * scalePulse;

  return {
    backPaths: backBuckets,
    frontPaths: frontBuckets,
    bobY,
    sphereR,
    highlightX: CX + sphereR * 0.32,
    highlightY: cyBob - sphereR * 0.32,
    highlightR: sphereR * 0.36,
  };
}

export const MiningGlobe3D: React.FC<MiningGlobe3DProps> = ({ spinning = false }) => {
  const { width: screenWidth } = useWindowDimensions();
  const isFocused = useIsFocused();
  const globeWidth = Math.min(Math.max(Math.round(screenWidth - 64), 220), 300);

  const tiles = useMemo(() => createTileSpecs(), []);
  const angleRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const spinRef = useRef<{
    active: boolean;
    startTime: number;
    baseAngle: number;
    duration: number;
    totalRotations: number;
  }>({
    active: false,
    startTime: 0,
    baseAngle: 0,
    duration: 2600,
    totalRotations: 14 * Math.PI * 2,
  });

  const [frame, setFrame] = useState<GlobeFrame>(() => computeFrame(tiles, 0, 0, 1));

  useEffect(() => {
    if (spinning) {
      spinRef.current = {
        active: true,
        startTime: Date.now(),
        baseAngle: angleRef.current,
        duration: 2600,
        totalRotations: 14 * Math.PI * 2,
      };
    }
  }, [spinning]);

  useEffect(() => {
    if (!isFocused) return;

    let rafId: number;
    let lastDraw = 0;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const now = Date.now();
      // ~35 FPS keeps Hermes & native Android canvas smooth without unnecessary bridge traffic
      if (now - lastDraw < 28) return;

      const dt = lastFrameTimeRef.current > 0 ? Math.min(64, now - lastFrameTimeRef.current) : 28;
      lastFrameTimeRef.current = now;
      lastDraw = now;

      let scalePulse = 1;
      const spin = spinRef.current;

      if (spin.active) {
        const elapsed = now - spin.startTime;
        const t = Math.min(1, elapsed / spin.duration);
        const ease = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
        angleRef.current = spin.baseAngle + ease * spin.totalRotations;
        scalePulse = 1 + Math.sin(t * Math.PI) * 0.15;

        if (t >= 1) {
          spin.active = false;
        }
      } else {
        angleRef.current += 0.017 * (dt / 16.67);
      }

      setFrame(computeFrame(tiles, angleRef.current, now, scalePulse));
    };

    lastFrameTimeRef.current = Date.now();
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isFocused, tiles]);

  return (
    <View style={[styles.container, { width: globeWidth, height: VIEW_H }]} pointerEvents="none">
      <View style={styles.ambientAura} />
      <Svg width={globeWidth} height={VIEW_H} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        <Defs>
          <RadialGradient
            id="gtCoreSphere"
            cx="64%"
            cy="34%"
            rx="62%"
            ry="62%"
            fx="68%"
            fy="28%"
          >
            <Stop offset="0%" stopColor="#86EFAC" stopOpacity="1" />
            <Stop offset="26%" stopColor="#22C55E" stopOpacity="1" />
            <Stop offset="70%" stopColor="#15803D" stopOpacity="1" />
            <Stop offset="100%" stopColor="#053B1C" stopOpacity="1" />
          </RadialGradient>
          <RadialGradient id="gtCoreHighlight" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.62" />
            <Stop offset="55%" stopColor="#BBF7D0" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Back hemisphere floating tiles behind core sphere */}
        {frame.backPaths.map((d, idx) => (
          <Path
            key={`b${idx}`}
            d={d || 'M0 0'}
            fill={TILE_COLORS[idx]}
            stroke={TILE_STROKES[idx]}
            strokeWidth={0.75}
            strokeLinejoin="round"
          />
        ))}

        {/* Glossy emerald core sphere */}
        <Circle
          cx={CX}
          cy={CY + frame.bobY}
          r={frame.sphereR}
          fill="url(#gtCoreSphere)"
        />

        {/* Crisp top-right specular gleam */}
        <Circle
          cx={frame.highlightX}
          cy={frame.highlightY}
          r={frame.highlightR}
          fill="url(#gtCoreHighlight)"
        />

        {/* Front hemisphere floating & exploded tiles in front of sphere */}
        {frame.frontPaths.map((d, idx) => (
          <Path
            key={`f${idx}`}
            d={d || 'M0 0'}
            fill={TILE_COLORS[idx]}
            stroke={TILE_STROKES[idx]}
            strokeWidth={0.85}
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  ambientAura: {
    position: 'absolute',
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: 'rgba(52, 211, 153, 0.22)',
  },
});
