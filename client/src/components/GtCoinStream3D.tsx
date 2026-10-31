import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GtCoinStream3DProps {
  className?: string;
  speedMultiplier?: number;
}

export const GtCoinStream3D: React.FC<GtCoinStream3DProps> = ({
  className = '',
  speedMultiplier = 1,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 200;
    let height = container.clientHeight || 150;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera - Perspective framing for horizontal cross orbit
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    const updateCameraDistance = (aspect: number) => {
      camera.position.set(0, 0, Math.max(4.1, 4.7 / Math.min(aspect, 1.2)));
    };
    updateCameraDistance(width / height);

    // 3. Renderer with High Performance and Alpha Transparency
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 4. Lighting - Specular Highlights on Metallic Emerald Coins
    const ambientLight = new THREE.AmbientLight(0xdcfce7, 1.9);
    scene.add(ambientLight);

    const dirLightTopLeft = new THREE.DirectionalLight(0xffffff, 3.8);
    dirLightTopLeft.position.set(-2, 3, 4);
    scene.add(dirLightTopLeft);

    const dirLightBottomRight = new THREE.DirectionalLight(0x22c55e, 2.6);
    dirLightBottomRight.position.set(3, -2, 2);
    scene.add(dirLightBottomRight);

    const rimLight = new THREE.DirectionalLight(0x86efac, 2.2);
    rimLight.position.set(0, 2, -2);
    scene.add(rimLight);

    // 5. Crisp Canvas Texture for GT Coin (512x512)
    const createGtCoinCanvas = (isBackFace: boolean) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // On back face, flip horizontally so GT reads normally
      if (isBackFace) {
        ctx.translate(512, 0);
        ctx.scale(-1, 1);
      }

      const centerX = 256;
      const centerY = 256;
      const radius = 236;

      // Base radial gradient
      const bgGrad = ctx.createRadialGradient(210, 190, 20, 256, 256, radius);
      bgGrad.addColorStop(0, '#34D399');    // bright emerald highlight
      bgGrad.addColorStop(0.35, '#16A34A'); // brand primary green
      bgGrad.addColorStop(0.75, '#15803D'); // rich deep green
      bgGrad.addColorStop(1, '#052E16');    // dark emerald bevel border

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = bgGrad;
      ctx.fill();

      // Outer gold-lime metallic border
      const rimGrad = ctx.createLinearGradient(80, 40, 430, 470);
      rimGrad.addColorStop(0, '#DCFCE7');
      rimGrad.addColorStop(0.3, '#86EFAC');
      rimGrad.addColorStop(0.7, '#22C55E');
      rimGrad.addColorStop(1, '#0F5327');

      ctx.lineWidth = 16;
      ctx.strokeStyle = rimGrad;
      ctx.stroke();

      // Fine bevel highlight
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 16, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.stroke();

      // Deep groove
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 26, 0, Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(5, 46, 22, 0.85)';
      ctx.stroke();

      // Dashed track
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 44, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = 'rgba(134, 239, 172, 0.85)';
      ctx.stroke();
      ctx.restore();

      // Center radial glow
      const glowGrad = ctx.createRadialGradient(256, 256, 10, 256, 256, 150);
      glowGrad.addColorStop(0, 'rgba(52, 211, 153, 0.45)');
      glowGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
      ctx.beginPath();
      ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Embossed "GT" Text
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 178px "Arial Black", "Montserrat", system-ui, sans-serif';

      // 3D bevel shadow below
      ctx.fillStyle = '#022c15';
      ctx.fillText('GT', centerX + 4, centerY + 8);
      ctx.fillStyle = '#064e3b';
      ctx.fillText('GT', centerX + 2, centerY + 4);

      // Metallic gradient fill
      const textGrad = ctx.createLinearGradient(centerX, centerY - 80, centerX, centerY + 80);
      textGrad.addColorStop(0, '#FFFFFF');
      textGrad.addColorStop(0.25, '#DCFCE7');
      textGrad.addColorStop(0.6, '#86EFAC');
      textGrad.addColorStop(0.85, '#22C55E');
      textGrad.addColorStop(1, '#15803D');

      ctx.fillStyle = textGrad;
      ctx.fillText('GT', centerX, centerY);

      // Specular highlight outline
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.strokeText('GT', centerX, centerY);
      ctx.restore();

      // 4 Cardinal Accent Stars
      const pips = [
        { x: centerX, y: centerY - (radius - 44) },
        { x: centerX, y: centerY + (radius - 44) },
        { x: centerX - (radius - 44), y: centerY },
        { x: centerX + (radius - 44), y: centerY },
      ];
      pips.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#DCFCE7';
        ctx.fill();
      });

      return canvas;
    };

    // Milled coin edge texture
    const createRimTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#16A34A';
      ctx.fillRect(0, 0, 128, 32);

      for (let x = 0; x < 128; x += 4) {
        ctx.fillStyle = 'rgba(220, 252, 231, 0.7)';
        ctx.fillRect(x, 0, 2, 32);
        ctx.fillStyle = 'rgba(5, 46, 22, 0.8)';
        ctx.fillRect(x + 2, 0, 2, 32);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(40, 1);
      return texture;
    };

    const frontTexture = new THREE.CanvasTexture(createGtCoinCanvas(false));
    const backTexture = new THREE.CanvasTexture(createGtCoinCanvas(true));
    const rimTexture = createRimTexture();

    const rimMaterial = new THREE.MeshStandardMaterial({
      map: rimTexture,
      color: 0x22c55e,
      metalness: 0.92,
      roughness: 0.20,
    });

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      metalness: 0.75,
      roughness: 0.16,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      metalness: 0.75,
      roughness: 0.16,
    });

    const materials = [rimMaterial, frontMaterial, backMaterial];

    // Coin geometry (refined size so 11 coins distribute with perfect spacing)
    const baseRadius = 0.27;
    const baseThickness = 0.05;
    const coinGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseThickness, 48, 1);
    coinGeometry.rotateX(Math.PI / 2);

    // 6. Cross Horizontal Orbit with 11 Coins (Added 2 more coins & increased circle size)
    const NUM_COINS = 11;
    const centerX = 0.34;
    const centerY = -0.04;
    const radiusX = 1.35; // wide horizontal spread
    const radiusY = 0.40; // flatter cross oval
    const radiusZ = 0.78; // 3D depth

    interface CoinInstance {
      group: THREE.Group;
      mesh: THREE.Mesh;
      baseAngle: number;
    }

    const coins: CoinInstance[] = [];

    for (let i = 0; i < NUM_COINS; i++) {
      const baseAngle = (i * Math.PI * 2) / NUM_COINS;

      const group = new THREE.Group();
      // Steeper cross horizontal diagonal tilt
      group.rotation.x = -0.26;
      group.rotation.z = 0.36; // inkoncham cross horizontal slant

      const mesh = new THREE.Mesh(coinGeometry, materials);
      group.add(mesh);
      scene.add(group);

      coins.push({
        group,
        mesh,
        baseAngle,
      });
    }

    // 7. Interactive Parallax on Mouse / Touch
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetTiltY = x * 0.35;
      targetTiltX = -y * 0.25;
    };

    container.addEventListener('mousemove', handlePointerMove);

    // 8. Animation Loop
    let animId: number;
    let isVisible = true;

    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    io.observe(container);

    const orbitSpeed = 0.65 * speedMultiplier; // Reduced speed: calm, smooth continuous orbit
    const spinSpeed = 1.1 * speedMultiplier;  // Gentle axial coin spin

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const time = performance.now() * 0.001;

      // Smooth camera parallax
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;
      camera.position.x = currentTiltY * 0.5;
      camera.position.y = currentTiltX * 0.35;
      camera.lookAt(0.35, -0.05, 0);

      // Sweeping specular highlights
      dirLightTopLeft.position.x = -2.0 + Math.sin(time * 0.8) * 1.0;
      dirLightTopLeft.position.y = 3.0 + Math.cos(time * 0.8) * 0.7;

      // Revolve coins in an expanded, elegant cross horizontal 3D orbit
      coins.forEach((c) => {
        const theta = c.baseAngle + time * orbitSpeed;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // Expanded Cross Horizontal 3D Orbit:
        // Wide horizontal path (X)
        const x = centerX + cosT * radiusX;
        // Inkoncham cross horizontal diagonal track:
        const y = centerY - sinT * radiusY + cosT * 0.48;
        // Depth in Z: sinT > 0 passes in front (+Z), sinT < 0 passes behind (-Z)
        const z = sinT * radiusZ;

        c.group.position.set(x, y, z);

        // Continuous 360° axial spin as the coin orbits
        c.mesh.rotation.y = time * spinSpeed + c.baseAngle;

        // Dynamic 3D depth perspective: foreground coins are larger (~0.95), background coins smaller (~0.65)
        const depthFactor = (z + radiusZ) / (2 * radiusZ); // 0 (back) to 1 (front)
        const scale = 0.65 + Math.max(0, Math.min(1, depthFactor)) * 0.32;
        c.mesh.scale.setScalar(scale);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Responsive Resize Handling
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 200;
      height = container.clientHeight || 150;
      const aspect = width / height;
      camera.aspect = aspect;
      updateCameraDistance(aspect);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      io.disconnect();
      ro.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      coinGeometry.dispose();
      frontTexture.dispose();
      backTexture.dispose();
      rimTexture.dispose();
      rimMaterial.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      renderer.dispose();
    };
  }, [speedMultiplier]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full pointer-events-none select-none ${className}`}
      style={{ overflow: 'hidden' }}
    />
  );
};
