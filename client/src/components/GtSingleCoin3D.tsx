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
      const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
      camera.position.set(0, 0, 5.2);

      // Camera Headlight: provides gentle, clear forward illumination so BOTH sides are crisp
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
      renderer.toneMappingExposure = 1.0; // Balanced exposure to prevent washing out colors!
      container.appendChild(renderer.domElement);

      // 4. Soft Ambient & Directional Lights for rich emerald coin luster
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const topKeyLight = new THREE.DirectionalLight(0xfffae0, 1.3);
      topKeyLight.position.set(-2, 4, 3);
      scene.add(topKeyLight);

      const bottomRimLight = new THREE.DirectionalLight(0x86efac, 1.0);
      bottomRimLight.position.set(2.5, -3, -2);
      scene.add(bottomRimLight);

      // 5. Canvas Face Texture with Vibrant Green Coin & Crystal-Clear GT Logo
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = 512;
      faceCanvas.height = 512;
      const ctx = faceCanvas.getContext('2d')!;

      // Load official GT Logo image
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/gt-header-logo.png';

      const renderFace = () => {
        ctx.clearRect(0, 0, 512, 512);

        const cx = 256;
        const cy = 256;
        const r = 240;

        // Rich Vibrant Emerald Green Coin Field
        const bgGrad = ctx.createRadialGradient(cx - 30, cy - 40, 30, cx, cy, r);
        bgGrad.addColorStop(0, '#22C55E');    // Primary GT Green
        bgGrad.addColorStop(0.4, '#16A34A');  // Rich emerald
        bgGrad.addColorStop(0.8, '#15803D');  // Deep coin green
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

        ctx.lineWidth = 16;
        ctx.strokeStyle = rimGrad;
        ctx.stroke();

        // Inner Specular Bevel Line
        ctx.beginPath();
        ctx.arc(cx, cy, r - 12, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.stroke();

        // Minted Dashed Ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r - 32, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 8]);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
        ctx.stroke();
        ctx.restore();

        // -----------------------------------------------------------
        // DEEP CONTRASTING CENTER MEDALLION FOR MAXIMUM LOGO CLARITY
        // -----------------------------------------------------------
        const coreRadius = 152;

        // Deep rich emerald core creates maximum contrast against the bright logo!
        const coreGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, coreRadius);
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
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#FEF08A';
        ctx.stroke();
        ctx.restore();

        // -----------------------------------------------------------
        // DRAW GT LOGO (Crystal Pyramid + PNG + Bold "GT" Typography)
        // -----------------------------------------------------------
        const logoCenterY = cy - 24;

        // 1. Faceted Emerald Crystal Pyramid
        ctx.save();
        ctx.translate(cx, logoCenterY);

        // Left Crystal Facet (Bright Mint to Vibrant Emerald)
        ctx.beginPath();
        ctx.moveTo(0, -68);
        ctx.lineTo(-58, 36);
        ctx.lineTo(0, 58);
        ctx.closePath();
        const leftFacetGrad = ctx.createLinearGradient(-58, -68, 0, 58);
        leftFacetGrad.addColorStop(0, '#A7F3D0');
        leftFacetGrad.addColorStop(0.5, '#34D399');
        leftFacetGrad.addColorStop(1, '#059669');
        ctx.fillStyle = leftFacetGrad;
        ctx.fill();

        // Right Crystal Facet (Luminous Mint to Rich Deep Emerald)
        ctx.beginPath();
        ctx.moveTo(0, -68);
        ctx.lineTo(58, 36);
        ctx.lineTo(0, 58);
        ctx.closePath();
        const rightFacetGrad = ctx.createLinearGradient(0, -68, 58, 58);
        rightFacetGrad.addColorStop(0, '#ECFDF5');
        rightFacetGrad.addColorStop(0.5, '#10B981');
        rightFacetGrad.addColorStop(1, '#047857');
        ctx.fillStyle = rightFacetGrad;
        ctx.fill();

        // Center Triangular Highlight Cutout
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(-32, 34);
        ctx.lineTo(0, 58);
        ctx.lineTo(32, 34);
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Facet Bevel Highlights
        ctx.beginPath();
        ctx.moveTo(0, -68);
        ctx.lineTo(0, 58);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.restore();

        // 2. Overlay gt-header-logo.png if loaded for photo-real fidelity
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          const logoSize = 145;
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 2;
          ctx.drawImage(logoImg, cx - logoSize / 2, logoCenterY - logoSize / 2, logoSize, logoSize);
          ctx.restore();
        }

        // 3. Crisp Bold Embossed "GT" Text below the logo
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 46px "Arial Black", "Montserrat", system-ui, sans-serif';

        // Dark text outline for 100% legibility
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#02210F';
        ctx.strokeText('GT', cx, cy + 86);

        // Brilliant Metallic Gold/White Text Fill
        const textGrad = ctx.createLinearGradient(cx, cy + 64, cx, cy + 104);
        textGrad.addColorStop(0, '#FFFFFF');
        textGrad.addColorStop(0.45, '#FEF08A');
        textGrad.addColorStop(1, '#F59E0B');
        ctx.fillStyle = textGrad;
        ctx.fillText('GT', cx, cy + 86);
        ctx.restore();

        // 4 Cardinal Gold Accent Pips
        const pipRadius = r - 32;
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

      // Milled Reeded Edge Texture
      const rimCanvas = document.createElement('canvas');
      rimCanvas.width = 512;
      rimCanvas.height = 64;
      const rimCtx = rimCanvas.getContext('2d')!;
      const stripeWidth = 512 / 80;
      for (let i = 0; i < 80; i++) {
        const x = i * stripeWidth;
        rimCtx.fillStyle = i % 2 === 0 ? '#15803D' : '#86EFAC';
        rimCtx.fillRect(x, 0, stripeWidth * 0.7, 64);
        rimCtx.fillStyle = '#052E16';
        rimCtx.fillRect(x + stripeWidth * 0.7, 0, stripeWidth * 0.3, 64);
      }

      const faceTexture = new THREE.CanvasTexture(faceCanvas);
      faceTexture.colorSpace = THREE.SRGBColorSpace;

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
        metalness: 0.06,
      });

      const rimMaterial = new THREE.MeshStandardMaterial({
        map: rimTexture,
        roughness: 0.35,
        metalness: 0.85,
        color: 0x86efac,
      });

      // Coin Geometry
      const coinRadius = 1.45;
      const coinThickness = 0.22;
      const geometry = new THREE.CylinderGeometry(coinRadius, coinRadius, coinThickness, 64);
      // Both Face 1 (top cap) and Face 2 (bottom cap) use faceMaterial so the GT logo appears on BOTH sides!
      const materials = [rimMaterial, faceMaterial, faceMaterial];
      const coinMesh = new THREE.Mesh(geometry, materials);

      const coinGroup = new THREE.Group();
      coinGroup.add(coinMesh);
      scene.add(coinGroup);

      // Isometric slant so the 3D rim thickness is clearly visible during the horizontal flip
      coinGroup.rotation.y = 0.24;
      coinGroup.rotation.z = -0.10;

      // Initial coin orientation
      coinMesh.rotation.x = Math.PI / 2;

      // 8. Animation Loop
      let startTime = performance.now();

      const animate = (time: number) => {
        animId = requestAnimationFrame(animate);

        const elapsed = (time - startTime) * 0.001;

        // HORIZONTAL COIN FLIP (pitch rotation around horizontal X axis):
        // Flips end-over-end (Face 1 -> Rim -> Face 2 -> Rim) matching the reference video!
        coinMesh.rotation.x = Math.PI / 2 + elapsed * 1.5;

        // Gentle floating bob up and down
        coinGroup.position.y = Math.sin(elapsed * 2.2) * 0.05;

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
