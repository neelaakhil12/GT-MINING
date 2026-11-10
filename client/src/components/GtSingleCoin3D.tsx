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

      // Camera Headlight: moves with the camera to ensure BOTH sides of the coin are brilliantly lit!
      const cameraHeadlight = new THREE.DirectionalLight(0xffffff, 3.2);
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
      renderer.toneMappingExposure = 1.35;
      container.appendChild(renderer.domElement);

      // 4. Ambient and Rim Lights for rich metallic emerald luster
      const ambientLight = new THREE.AmbientLight(0xe8fdf0, 2.2);
      scene.add(ambientLight);

      const topKeyLight = new THREE.DirectionalLight(0xfffbe8, 3.5);
      topKeyLight.position.set(-2.5, 4, 3);
      scene.add(topKeyLight);

      const bottomRimLight = new THREE.DirectionalLight(0x86efac, 2.5);
      bottomRimLight.position.set(3, -3, -2);
      scene.add(bottomRimLight);

      // 5. High-Resolution Face Textures with Crystal-Clear GT Logo on BOTH SIDES
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/gt-header-logo.png';

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

          // Rich Emerald Metallic Coin Field
          const bgGrad = ctx.createRadialGradient(cx - 40, cy - 50, 20, cx, cy, r);
          bgGrad.addColorStop(0, '#4ADE80');   // Bright emerald mint
          bgGrad.addColorStop(0.3, '#22C55E'); // GT Primary Green
          bgGrad.addColorStop(0.7, '#15803D'); // Deep rich green
          bgGrad.addColorStop(0.95, '#052E16'); // Dark perimeter bevel
          bgGrad.addColorStop(1, '#02210F');

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = bgGrad;
          ctx.fill();

          // Outer Polished Metallic Gold/Green Rim
          const rimGrad = ctx.createLinearGradient(40, 40, 470, 470);
          rimGrad.addColorStop(0, '#FEF08A');   // Bright warm gold accent
          rimGrad.addColorStop(0.25, '#86EFAC'); // Mint highlight
          rimGrad.addColorStop(0.65, '#22C55E'); // Emerald
          rimGrad.addColorStop(1, '#0F5327');   // Dark green

          ctx.lineWidth = 18;
          ctx.strokeStyle = rimGrad;
          ctx.stroke();

          // Inner Specular Bevel Line
          ctx.beginPath();
          ctx.arc(cx, cy, r - 14, 0, Math.PI * 2);
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.stroke();

          // Deep Recessed Groove
          ctx.beginPath();
          ctx.arc(cx, cy, r - 22, 0, Math.PI * 2);
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(2, 33, 15, 0.9)';
          ctx.stroke();

          // Minted Dashed Ring
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, r - 38, 0, Math.PI * 2);
          ctx.lineWidth = 4.5;
          ctx.setLineDash([12, 10]);
          ctx.strokeStyle = 'rgba(220, 252, 231, 0.9)';
          ctx.stroke();
          ctx.restore();

          // -----------------------------------------------------------
          // HIGH-CONTRAST LUMINOUS CENTER MEDALLION FOR GT LOGO
          // -----------------------------------------------------------
          const coreRadius = 145;

          // Luminous Radial Medallion Core (gives the logo crystal clarity!)
          const coreGrad = ctx.createRadialGradient(cx - 20, cy - 30, 10, cx, cy, coreRadius);
          coreGrad.addColorStop(0, '#FFFFFF');          // Bright center glow
          coreGrad.addColorStop(0.4, '#DCFCE7');        // Soft pale emerald
          coreGrad.addColorStop(0.8, '#86EFAC');        // Mint highlight
          coreGrad.addColorStop(1, '#16A34A');          // Emerald edge

          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
          ctx.fillStyle = coreGrad;
          ctx.shadowColor = 'rgba(2, 33, 15, 0.65)';
          ctx.shadowBlur = 16;
          ctx.shadowOffsetY = 6;
          ctx.fill();

          // Medallion Gold Border
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#FEF08A';
          ctx.stroke();
          ctx.restore();

          // Inner Decorative Bead Ring
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, coreRadius - 10, 0, Math.PI * 2);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(21, 128, 61, 0.6)';
          ctx.stroke();
          ctx.restore();

          // -----------------------------------------------------------
          // DRAW GT LOGO IN HIGH CLARITY (Vector + Image Composite)
          // -----------------------------------------------------------
          // 1. Faceted Emerald Crystal Pyramid (Always renders instantly!)
          ctx.save();
          ctx.translate(cx, cy - 8);

          // Left Crystal Facet
          ctx.beginPath();
          ctx.moveTo(0, -80);
          ctx.lineTo(-70, 42);
          ctx.lineTo(0, 68);
          ctx.closePath();
          const leftFacetGrad = ctx.createLinearGradient(-70, -80, 0, 68);
          leftFacetGrad.addColorStop(0, '#86EFAC');
          leftFacetGrad.addColorStop(0.6, '#22C55E');
          leftFacetGrad.addColorStop(1, '#15803D');
          ctx.fillStyle = leftFacetGrad;
          ctx.fill();

          // Right Crystal Facet
          ctx.beginPath();
          ctx.moveTo(0, -80);
          ctx.lineTo(70, 42);
          ctx.lineTo(0, 68);
          ctx.closePath();
          const rightFacetGrad = ctx.createLinearGradient(0, -80, 70, 68);
          rightFacetGrad.addColorStop(0, '#DCFCE7');
          rightFacetGrad.addColorStop(0.5, '#16A34A');
          rightFacetGrad.addColorStop(1, '#0A341B');
          ctx.fillStyle = rightFacetGrad;
          ctx.fill();

          // Center Triangular Cutout / Inner Reflection
          ctx.beginPath();
          ctx.moveTo(0, -22);
          ctx.lineTo(-40, 42);
          ctx.lineTo(0, 68);
          ctx.lineTo(40, 42);
          ctx.closePath();
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // Facet Bevel Highlights
          ctx.beginPath();
          ctx.moveTo(0, -80);
          ctx.lineTo(0, 68);
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.stroke();

          ctx.restore();

          // 2. Overlay gt-header-logo.png with Drop Shadow if loaded
          if (logoImg.complete && logoImg.naturalWidth > 0) {
            const logoSize = 180;
            ctx.save();
            ctx.shadowColor = 'rgba(2, 33, 15, 0.45)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;
            ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2 - 8, logoSize, logoSize);
            ctx.restore();
          }

          // 3. Crisp Embossed "GT" Monogram directly below
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 36px "Arial Black", "Montserrat", system-ui, sans-serif';

          // 3D text shadow
          ctx.fillStyle = '#052E16';
          ctx.fillText('GT', cx, cy + 92);

          // Metallic text fill
          const textGrad = ctx.createLinearGradient(cx, cy + 70, cx, cy + 105);
          textGrad.addColorStop(0, '#FFFFFF');
          textGrad.addColorStop(0.5, '#FEF08A');
          textGrad.addColorStop(1, '#86EFAC');
          ctx.fillStyle = textGrad;
          ctx.fillText('GT', cx, cy + 90);

          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#0A341B';
          ctx.strokeText('GT', cx, cy + 90);
          ctx.restore();

          // 4 Cardinal Gold Accent Pips
          const pipRadius = r - 38;
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

      // 6. Materials (low metalness for crystal-clear, bright colors at ALL angles!)
      const faceMaterial = new THREE.MeshStandardMaterial({
        map: faceTexture,
        roughness: 0.32,
        metalness: 0.18,
      });

      const backMaterial = new THREE.MeshStandardMaterial({
        map: backTexture,
        roughness: 0.32,
        metalness: 0.18,
      });

      const rimMaterial = new THREE.MeshStandardMaterial({
        map: rimTexture,
        roughness: 0.35,
        metalness: 0.85,
        color: 0x86efac,
      });

      // 7. Coin Geometry (Cylinder with 3D thickness)
      const coinRadius = 1.45;
      const coinThickness = 0.22;
      const geometry = new THREE.CylinderGeometry(coinRadius, coinRadius, coinThickness, 64);
      const materials = [rimMaterial, faceMaterial, backMaterial];
      const coinMesh = new THREE.Mesh(geometry, materials);

      // Group gives the isometric tilt perspective of the video:
      const coinGroup = new THREE.Group();
      coinGroup.add(coinMesh);
      scene.add(coinGroup);

      // Orient top face (+Y) to face +Z
      coinMesh.rotation.x = Math.PI / 2;

      // Realistic 3D angle matching the reference video (tilted forward ~22 deg, slight dynamic roll)
      coinGroup.rotation.x = 0.38;
      coinGroup.rotation.z = -0.16;

      // 8. Animation Loop
      let startTime = performance.now();

      const animate = (time: number) => {
        animId = requestAnimationFrame(animate);

        const elapsed = (time - startTime) * 0.001;

        // Smooth 360-degree rotation on Y-axis (both front and back faces clearly visible in sequence!)
        coinGroup.rotation.y = elapsed * 1.4;

        // Subtle floating bob up and down
        coinGroup.position.y = Math.sin(elapsed * 2.2) * 0.06;

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
