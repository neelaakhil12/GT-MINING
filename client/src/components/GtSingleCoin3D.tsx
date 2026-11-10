import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GtSingleCoin3DProps {
  className?: string;
  width?: number;
  height?: number;
}

// Module-level preload for official GT header logo
const cachedLogoImg = typeof Image !== 'undefined' ? new Image() : null;
if (cachedLogoImg) {
  cachedLogoImg.crossOrigin = 'anonymous';
  cachedLogoImg.src = '/gt-header-logo.png';
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
      const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
      camera.position.set(0, 0, 5.2);

      // Camera Headlight: attached to camera for clean, balanced forward light so BOTH sides are clear
      const cameraHeadlight = new THREE.DirectionalLight(0xffffff, 1.4);
      cameraHeadlight.position.set(0, 0, 1);
      camera.add(cameraHeadlight);
      scene.add(camera);

      // 3. Renderer with high performance & alpha transparency
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0; // Prevents over-exposure and color washout!
      container.appendChild(renderer.domElement);

      // 4. Balanced Ambient & Directional Lights for rich crypto emerald luster
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
      scene.add(ambientLight);

      const topKeyLight = new THREE.DirectionalLight(0xfffae0, 1.25);
      topKeyLight.position.set(-2, 4, 3);
      scene.add(topKeyLight);

      const bottomRimLight = new THREE.DirectionalLight(0x86efac, 0.9);
      bottomRimLight.position.set(2.5, -3, -2);
      scene.add(bottomRimLight);

      // 5. Canvas Face Texture with Solid Green Coin & Crisp Bold GT Logo
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = 512;
      faceCanvas.height = 512;
      const ctx = faceCanvas.getContext('2d')!;

      // Load official GT Logo image (preloaded gt-header-logo.png)
      const logoImg = cachedLogoImg || new Image();
      if (!cachedLogoImg) {
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = '/gt-header-logo.png';
      }

      const renderFace = () => {
        ctx.clearRect(0, 0, 512, 512);

        const cx = 256;
        const cy = 256;
        const r = 240;

        // Rich Vibrant Emerald Green Coin Field
        const bgGrad = ctx.createRadialGradient(cx - 30, cy - 40, 25, cx, cy, r);
        bgGrad.addColorStop(0, '#22C55E');    // Primary GT Green
        bgGrad.addColorStop(0.35, '#16A34A'); // Rich emerald
        bgGrad.addColorStop(0.75, '#15803D'); // Deep coin green
        bgGrad.addColorStop(1, '#052E16');    // Dark perimeter rim bevel

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = bgGrad;
        ctx.fill();

        // Outer Polished Metallic Gold/Green Rim
        const rimGrad = ctx.createLinearGradient(40, 40, 470, 470);
        rimGrad.addColorStop(0, '#FEF08A');    // Warm bright gold
        rimGrad.addColorStop(0.3, '#F59E0B');  // Amber gold
        rimGrad.addColorStop(0.7, '#86EFAC');  // Mint sheen
        rimGrad.addColorStop(1, '#15803D');    // Emerald depth

        ctx.lineWidth = 15;
        ctx.strokeStyle = rimGrad;
        ctx.stroke();

        // Inner Specular Bevel Line
        ctx.beginPath();
        ctx.arc(cx, cy, r - 12, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.stroke();

        // Minted Dashed Ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r - 28, 0, Math.PI * 2);
        ctx.lineWidth = 3.5;
        ctx.setLineDash([9, 7]);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
        ctx.stroke();
        ctx.restore();

        // -----------------------------------------------------------
        // DEEP CONTRASTING CENTER MEDALLION FOR MAXIMUM LOGO CLARITY
        // -----------------------------------------------------------
        const coreRadius = 160;

        // Deep rich emerald core creates maximum contrast against the bright logo!
        const coreGrad = ctx.createRadialGradient(cx, cy - 10, 20, cx, cy, coreRadius);
        coreGrad.addColorStop(0, '#064E3B');   // Deep forest emerald
        coreGrad.addColorStop(0.7, '#022C17'); // Dark crypto green
        coreGrad.addColorStop(1, '#01190C');   // Ultra-crisp border

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        ctx.fill();

        // Medallion Gold Border
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = '#FEF08A';
        ctx.stroke();
        ctx.restore();

        // -----------------------------------------------------------
        // OFFICIAL GT HEADER LOGO (gt-header-logo.png) DIRECTLY
        // -----------------------------------------------------------
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          const logoSize = 210;
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 4;
          // Centered directly on the coin face
          ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
          ctx.restore();
        }

        // 4 Cardinal Gold Accent Pips
        const pipRadius = r - 30;
        const pips = [
          { x: cx, y: cy - pipRadius },
          { x: cx, y: cy + pipRadius },
          { x: cx - pipRadius, y: cy },
          { x: cx + pipRadius, y: cy },
        ];
        pips.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#FEF08A';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#052E16';
          ctx.stroke();
        });
      };

      renderFace();

      // Milled Reeded Edge Texture (Polished Gold)
      const rimCanvas = document.createElement('canvas');
      rimCanvas.width = 512;
      rimCanvas.height = 64;
      const rimCtx = rimCanvas.getContext('2d')!;
      const stripeWidth = 512 / 80;
      for (let i = 0; i < 80; i++) {
        const x = i * stripeWidth;
        rimCtx.fillStyle = i % 2 === 0 ? '#FEF08A' : '#B45309';
        rimCtx.fillRect(x, 0, stripeWidth, 64);
      }

      const faceTexture = new THREE.CanvasTexture(faceCanvas);
      faceTexture.colorSpace = THREE.SRGBColorSpace;
      faceTexture.anisotropy = 8;

      logoImg.onload = () => {
        renderFace();
        faceTexture.needsUpdate = true;
      };

      const rimTexture = new THREE.CanvasTexture(rimCanvas);
      rimTexture.wrapS = THREE.RepeatWrapping;
      rimTexture.wrapT = THREE.ClampToEdgeWrapping;
      rimTexture.repeat.set(4, 1);

      // Low metalness ensures rich green colors without dark shadows or white glare
      const faceMaterial = new THREE.MeshStandardMaterial({
        map: faceTexture,
        roughness: 0.32,
        metalness: 0.08,
      });

      const rimMaterial = new THREE.MeshStandardMaterial({
        map: rimTexture,
        roughness: 0.3,
        metalness: 0.85,
        color: 0xFDE047,
      });

      // -----------------------------------------------------------
      // COIN GEOMETRY WITH PERFECT FRONT & BACK FACE UV ALIGNMENT
      // -----------------------------------------------------------
      const coinRadius = 1.45;
      const coinThickness = 0.22;

      // Front Face (Circle in XY plane, facing +Z towards camera)
      const frontGeo = new THREE.CircleGeometry(coinRadius, 64);
      const frontMesh = new THREE.Mesh(frontGeo, faceMaterial);
      frontMesh.position.z = coinThickness / 2;

      // Back Face (Circle rotated 180° around Y, facing -Z away from camera)
      // When the coin rotates 180° horizontally, the back face is 100% upright and un-mirrored!
      const backGeo = new THREE.CircleGeometry(coinRadius, 64);
      backGeo.rotateY(Math.PI);
      const backMesh = new THREE.Mesh(backGeo, faceMaterial);
      backMesh.position.z = -coinThickness / 2;

      // Milled Outer Rim Cylinder connecting front and back faces
      const rimGeo = new THREE.CylinderGeometry(coinRadius, coinRadius, coinThickness, 64, 1, true);
      rimGeo.rotateX(Math.PI / 2); // Align cylinder axis with Z
      const rimMesh = new THREE.Mesh(rimGeo, rimMaterial);

      // Coin Assembly Mesh
      const coinMesh = new THREE.Group();
      coinMesh.add(frontMesh);
      coinMesh.add(backMesh);
      coinMesh.add(rimMesh);

      // Parent Group for Perspective Tilt
      const coinGroup = new THREE.Group();
      coinGroup.add(coinMesh);
      scene.add(coinGroup);

      // -----------------------------------------------------------
      // EXACT POSE & HORIZONTAL ROTATION MATCHING REFERENCE VIDEO
      // -----------------------------------------------------------
      // Reference video pose:
      // Tilted slightly forward on X (~12 deg = 0.21 rad) so the top rim is visible from above.
      // NO sideways tilt (Z = 0) so the coin and logo stay perfectly level and upright!
      coinGroup.rotation.x = 0.21;
      coinGroup.rotation.z = -0.02;

      // 8. Animation Loop
      let startTime = performance.now();

      const animate = (time: number) => {
        animId = requestAnimationFrame(animate);

        const elapsed = (time - startTime) * 0.001;

        // EXACT HORIZONTAL COIN ROTATION MATCHING REFERENCE VIDEO:
        // Rotates around the vertical Y-axis!
        // Logo stays 100% upright, never turns upside down, perfectly level!
        coinMesh.rotation.y = elapsed * 1.5;

        // Gentle floating bob up and down
        coinGroup.position.y = Math.sin(elapsed * 2.0) * 0.04;

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
    />
  );
};

export default GtSingleCoin3D;
