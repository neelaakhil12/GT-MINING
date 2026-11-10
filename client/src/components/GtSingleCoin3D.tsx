import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GtSingleCoin3DProps {
  className?: string;
  width?: number;
  height?: number;
}

export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  className = '',
  width = 110,
  height = 95,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId: number;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      // 1. Scene
      const scene = new THREE.Scene();

      // 2. Camera with isometric perspective
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(0, 0, 5.2);

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      container.appendChild(renderer.domElement);

      // 4. Lights
      const ambientLight = new THREE.AmbientLight(0xdcfce7, 1.8);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
      keyLight.position.set(-3, 3.5, 4.5);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x22c55e, 2.8);
      fillLight.position.set(3.5, -2, 2.5);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x86efac, 2.5);
      rimLight.position.set(0, 3, -2);
      scene.add(rimLight);

      // Sweeping specular glint light (moves across coin like in the video)
      const sweepLight = new THREE.PointLight(0xffffff, 3.5, 6);
      sweepLight.position.set(-1.5, 1.5, 2.5);
      scene.add(sweepLight);

      // 5. Canvas Textures for Coin Faces and Reeded Rim
      const logoImg = new Image();
      logoImg.src = '/gt-logo.png';

      const createFaceCanvas = (isBack: boolean) => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;

        const render = () => {
          ctx.clearRect(0, 0, 512, 512);

          if (isBack) {
            ctx.save();
            ctx.translate(512, 0);
            ctx.scale(-1, 1);
          }

          const cx = 256;
          const cy = 256;
          const r = 240;

          // Radial Emerald Metallic Gradient
          const bgGrad = ctx.createRadialGradient(cx - 50, cy - 60, 20, cx, cy, r);
          bgGrad.addColorStop(0, '#86EFAC');   // Bright mint highlight
          bgGrad.addColorStop(0.25, '#22C55E'); // GT Primary Emerald
          bgGrad.addColorStop(0.65, '#15803D'); // Deep rich emerald
          bgGrad.addColorStop(0.92, '#0A341B'); // Dark rim shadow
          bgGrad.addColorStop(1, '#052E16');    // Edge border

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = bgGrad;
          ctx.fill();

          // Outer Polished Metallic Gold/Green Rim
          const rimGrad = ctx.createLinearGradient(60, 40, 450, 470);
          rimGrad.addColorStop(0, '#FEF08A');   // Gold shimmer
          rimGrad.addColorStop(0.35, '#86EFAC'); // Light green
          rimGrad.addColorStop(0.7, '#22C55E');  // Emerald
          rimGrad.addColorStop(1, '#0F5327');   // Dark green

          ctx.lineWidth = 18;
          ctx.strokeStyle = rimGrad;
          ctx.stroke();

          // Fine Bevel Highlight
          ctx.beginPath();
          ctx.arc(cx, cy, r - 15, 0, Math.PI * 2);
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.stroke();

          // Deep Groove
          ctx.beginPath();
          ctx.arc(cx, cy, r - 24, 0, Math.PI * 2);
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(5, 46, 22, 0.85)';
          ctx.stroke();

          // Minted Dashed Ring
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, r - 42, 0, Math.PI * 2);
          ctx.lineWidth = 4.5;
          ctx.setLineDash([12, 10]);
          ctx.strokeStyle = 'rgba(220, 252, 231, 0.85)';
          ctx.stroke();
          ctx.restore();

          // Center Inner Recess Glow
          const recessGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 170);
          recessGrad.addColorStop(0, 'rgba(134, 239, 172, 0.35)');
          recessGrad.addColorStop(0.7, 'rgba(34, 197, 94, 0.15)');
          recessGrad.addColorStop(1, 'rgba(5, 46, 22, 0.3)');

          ctx.beginPath();
          ctx.arc(cx, cy, 170, 0, Math.PI * 2);
          ctx.fillStyle = recessGrad;
          ctx.fill();

          // Draw GT Crystal Logo or Fallback Faceted Pyramid
          if (logoImg.complete && logoImg.naturalWidth > 0) {
            const logoSize = 200;
            ctx.save();
            ctx.shadowColor = 'rgba(5, 46, 22, 0.8)';
            ctx.shadowBlur = 18;
            ctx.shadowOffsetY = 10;
            ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
            ctx.restore();
          } else {
            // Crisp fallback faceted GT emblem
            ctx.save();
            ctx.translate(cx, cy);

            // Facet 1 (Left)
            ctx.beginPath();
            ctx.moveTo(0, -90);
            ctx.lineTo(-75, 45);
            ctx.lineTo(0, 75);
            ctx.closePath();
            ctx.fillStyle = '#86EFAC';
            ctx.fill();

            // Facet 2 (Right)
            ctx.beginPath();
            ctx.moveTo(0, -90);
            ctx.lineTo(75, 45);
            ctx.lineTo(0, 75);
            ctx.closePath();
            ctx.fillStyle = '#22C55E';
            ctx.fill();

            // Facet 3 (Center Bottom)
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(-45, 45);
            ctx.lineTo(0, 75);
            ctx.lineTo(45, 45);
            ctx.closePath();
            ctx.fillStyle = '#DCFCE7';
            ctx.fill();

            ctx.restore();
          }

          // 4 Cardinal Pips
          const pipRadius = r - 42;
          const pips = [
            { x: cx, y: cy - pipRadius },
            { x: cx, y: cy + pipRadius },
            { x: cx - pipRadius, y: cy },
            { x: cx + pipRadius, y: cy },
          ];
          pips.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FEF08A';
            ctx.fill();
            ctx.strokeStyle = '#052E16';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });

          if (isBack) {
            ctx.restore();
          }
        };

        render();
        logoImg.onload = () => {
          render();
          faceTexture.needsUpdate = true;
          if (backTexture) backTexture.needsUpdate = true;
        };

        return canvas;
      };

      // Reeded Milled Edge Texture
      const createRimTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;

        // Vertical ridges (milled coin edge)
        const stripeWidth = 512 / 80;
        for (let i = 0; i < 80; i++) {
          const x = i * stripeWidth;
          ctx.fillStyle = i % 2 === 0 ? '#15803D' : '#86EFAC';
          ctx.fillRect(x, 0, stripeWidth * 0.7, 64);
          ctx.fillStyle = '#052E16';
          ctx.fillRect(x + stripeWidth * 0.7, 0, stripeWidth * 0.3, 64);
        }
        return canvas;
      };

      const faceCanvas = createFaceCanvas(false);
      const backCanvas = createFaceCanvas(true);
      const rimCanvas = createRimTexture();

      const faceTexture = new THREE.CanvasTexture(faceCanvas);
      faceTexture.colorSpace = THREE.SRGBColorSpace;

      const backTexture = new THREE.CanvasTexture(backCanvas);
      backTexture.colorSpace = THREE.SRGBColorSpace;

      const rimTexture = new THREE.CanvasTexture(rimCanvas);
      rimTexture.wrapS = THREE.RepeatWrapping;
      rimTexture.wrapT = THREE.ClampToEdgeWrapping;
      rimTexture.repeat.set(4, 1);

      // 6. Materials
      const faceMaterial = new THREE.MeshStandardMaterial({
        map: faceTexture,
        roughness: 0.22,
        metalness: 0.88,
      });

      const backMaterial = new THREE.MeshStandardMaterial({
        map: backTexture,
        roughness: 0.22,
        metalness: 0.88,
      });

      const rimMaterial = new THREE.MeshStandardMaterial({
        map: rimTexture,
        roughness: 0.35,
        metalness: 0.92,
        color: 0x86efac,
      });

      // 7. Coin Geometry (Cylinder with 3D thickness)
      // Cylinder materials order: [sides, top (front), bottom (back)]
      const coinRadius = 1.45;
      const coinThickness = 0.22;
      const geometry = new THREE.CylinderGeometry(coinRadius, coinRadius, coinThickness, 64);
      const materials = [rimMaterial, faceMaterial, backMaterial];
      const coinMesh = new THREE.Mesh(geometry, materials);

      // Realistic 3D angle matching the reference video (tilted forward & slight dynamic roll)
      const coinGroup = new THREE.Group();
      coinGroup.add(coinMesh);
      scene.add(coinGroup);

      // In Three.js, Cylinder is upright on Y axis, so orient top face (+Y) to face camera (+Z)
      coinMesh.rotation.x = Math.PI / 2;

      // Group gives the isometric tilt perspective of the video:
      // Tilted forward ~22 deg, slight roll ~-10 deg
      coinGroup.rotation.x = 0.38;
      coinGroup.rotation.z = -0.16;

      // 8. Animation Loop matching reference video
      let startTime = performance.now();

      const animate = (time: number) => {
        animId = requestAnimationFrame(animate);

        const elapsed = (time - startTime) * 0.001;

        // Smooth 360-degree rotation on Y-axis (approx 4.5s per turn)
        coinGroup.rotation.y = elapsed * 1.4;

        // Subtle floating bob up and down
        coinGroup.position.y = Math.sin(elapsed * 2.2) * 0.06;

        // Dynamic sweep light simulating moving lens flare shimmer
        sweepLight.position.x = Math.sin(elapsed * 1.8) * 2.5;
        sweepLight.position.y = Math.cos(elapsed * 1.8) * 1.8;

        renderer?.render(scene, camera);
      };

      animId = requestAnimationFrame(animate);
    } catch (e) {
      console.warn('3D Coin WebGL initialization fallback:', e);
    }

    return () => {
      cancelAnimationFrame(animId);
      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [width, height]);

  return (
    <div
      ref={mountRef}
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ width, height }}
    >
      {/* Ambient Emerald Rim Glow */}
      <div
        className="absolute w-20 h-20 rounded-full bg-[#22C55E]/20 blur-xl pointer-events-none"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
};
