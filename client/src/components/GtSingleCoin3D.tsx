import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GtSingleCoin3DProps {
  className?: string;
  width?: number;
  height?: number;
}

let cachedLogo: HTMLImageElement | null = null;
if (typeof Image !== 'undefined') {
  cachedLogo = new Image();
  cachedLogo.crossOrigin = 'anonymous';
  cachedLogo.src = '/gt-header-logo.png';
}

/**
 * GtSingleCoin3D - Market Overview GT 3D Gold Coin Animation
 * 
 * 1. 3D Gold Coin Continuous 360-Degree Rotation & Flip (Full 360° loop over horizontal X axis).
 * 2. Slanted diagonally on Z & Y axis matching reference video 20261110-0722-01.3679429.mp4.
 * 3. Metallic gleam and light flare across embossed GT emblem and gold milled edge.
 * 4. Cinematic floating sparkle particles around coin with 100% alpha transparency.
 */
export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  className = '',
  width = 115,
  height = 100,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId: number;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
      camera.position.set(0, 0, 4.4);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);

      // 1. Ambient & Directional Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xfffae0, 3.2);
      keyLight.position.set(3, 4, 3.5);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x86efac, 1.8);
      rimLight.position.set(-3, -2.5, 2);
      scene.add(rimLight);

      const gleamLight = new THREE.PointLight(0xffffff, 2.5, 8);
      gleamLight.position.set(1.5, 2.5, 3.0);
      scene.add(gleamLight);

      // 2. High-Res Embossed Gold & Emerald Coin Face
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      const logoImg = cachedLogo || new Image();
      if (!cachedLogo) {
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = '/gt-header-logo.png';
      }

      const drawFace = () => {
        ctx.clearRect(0, 0, 512, 512);
        const cx = 256;
        const cy = 256;
        const r = 246;

        // Outer Polished Metallic Gold Rim
        const goldGrad = ctx.createLinearGradient(0, 0, 512, 512);
        goldGrad.addColorStop(0, '#FFF5BA');
        goldGrad.addColorStop(0.25, '#F59E0B');
        goldGrad.addColorStop(0.5, '#FEF08A');
        goldGrad.addColorStop(0.75, '#D97706');
        goldGrad.addColorStop(1, '#FEF08A');

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = goldGrad;
        ctx.fill();

        // Deep Dark Crypto Ambiance Inner Medallion Field
        const bgGrad = ctx.createRadialGradient(cx - 20, cy - 30, 20, cx, cy, r - 18);
        bgGrad.addColorStop(0, '#0F3820');
        bgGrad.addColorStop(0.4, '#072414');
        bgGrad.addColorStop(0.8, '#03170C');
        bgGrad.addColorStop(1, '#020D07');

        ctx.beginPath();
        ctx.arc(cx, cy, r - 18, 0, Math.PI * 2);
        ctx.fillStyle = bgGrad;
        ctx.fill();

        // Beveled Gold Ring
        ctx.beginPath();
        ctx.arc(cx, cy, r - 34, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#FEF08A';
        ctx.stroke();

        // Dashed Mint Security Ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r - 50, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.setLineDash([9, 6]);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.stroke();
        ctx.restore();

        // Inner Core Gold Rim
        ctx.beginPath();
        ctx.arc(cx, cy, 145, 0, Math.PI * 2);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#F59E0B';
        ctx.stroke();

        // Embossed GT Center Logo
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          const s = 195;
          ctx.save();
          ctx.shadowColor = 'rgba(254, 240, 138, 0.6)';
          ctx.shadowBlur = 15;
          ctx.drawImage(logoImg, cx - s / 2, cy - s / 2, s, s);
          ctx.restore();
        } else {
          ctx.save();
          ctx.strokeStyle = '#22C55E';
          ctx.lineWidth = 14;
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(cx, cy - 80);
          ctx.lineTo(cx + 70, cy + 50);
          ctx.lineTo(cx - 70, cy + 50);
          ctx.closePath();
          ctx.stroke();

          ctx.fillStyle = '#4ADE80';
          ctx.font = '900 64px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('GT', cx, cy + 8);
          ctx.restore();
        }
      };

      drawFace();
      const faceTexture = new THREE.CanvasTexture(canvas);
      faceTexture.anisotropy = 8;

      if (!logoImg.complete) {
        logoImg.onload = () => {
          drawFace();
          faceTexture.needsUpdate = true;
        };
      }

      // 3. Materials
      const sideMaterial = new THREE.MeshStandardMaterial({
        color: 0xEAB308,
        metalness: 0.96,
        roughness: 0.16,
      });

      const faceMaterial = new THREE.MeshStandardMaterial({
        map: faceTexture,
        metalness: 0.65,
        roughness: 0.22,
      });

      // 4. Real 3D Cylinder Coin
      const geometry = new THREE.CylinderGeometry(1.22, 1.22, 0.18, 64);
      const materials = [sideMaterial, faceMaterial, faceMaterial];
      const coinMesh = new THREE.Mesh(geometry, materials);

      // Slant Group for diagonal posture matching reference video
      const slantGroup = new THREE.Group();
      slantGroup.rotation.z = -0.35; // diagonal slant
      slantGroup.rotation.y = 0.22;  // subtle isometric angle
      slantGroup.add(coinMesh);

      scene.add(slantGroup);

      // 5. Subtle Floating Sparkle Particles around coin
      const particleCount = 28;
      const particleGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 3.2;
        pos[i + 1] = (Math.random() - 0.5) * 3.2;
        pos[i + 2] = (Math.random() - 0.5) * 1.8;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0xFEF08A,
        size: 0.055,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // 6. CONTINUOUS 360-DEGREE FULL ROTATION FLIP!
      // Up and down continuous 360 degree loop without oscillating
      const animate = () => {
        animId = requestAnimationFrame(animate);

        // Full 360° continuous flip over horizontal X-axis (up & down)
        coinMesh.rotation.x += 0.024;

        // Particle floating drift
        particles.rotation.y += 0.003;
        particles.rotation.x += 0.002;

        renderer?.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(animId);
        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
        geometry.dispose();
        particleGeo.dispose();
        particleMat.dispose();
        sideMaterial.dispose();
        faceMaterial.dispose();
        faceTexture.dispose();
      };
    } catch {
      return () => {};
    }
  }, [width, height]);

  return (
    <div
      ref={mountRef}
      className={`relative pointer-events-none select-none flex items-center justify-center ${className}`}
      style={{ width, height }}
    />
  );
};

export default GtSingleCoin3D;
