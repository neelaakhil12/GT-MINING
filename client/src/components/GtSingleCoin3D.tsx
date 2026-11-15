import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GtSingleCoin3DProps {
  className?: string;
  width?: number;
  height?: number;
}

let cachedTexture: THREE.Texture | null = null;

/**
 * GtSingleCoin3D - Market Overview GT 3D Crystal Coin Animation
 * 
 * 1. 3D Crystal Emerald Coin Continuous 360-Degree Rotation & Flip.
 * 2. Uses official crystal emerald coin texture (/gt-crystal-coin.png).
 * 3. Slanted diagonally on Z & Y axis matching reference 3D motion.
 * 4. Specular metallic gleam and light flare across embossed GT emblem and rim.
 * 5. Cinematic floating sparkle particles around coin with 100% alpha transparency.
 */
export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  className = '',
  width = 68,
  height = 64,
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
      renderer.toneMappingExposure = 1.35;
      container.appendChild(renderer.domElement);

      // 1. Ambient & Directional Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xfffae0, 3.4);
      keyLight.position.set(3, 4, 3.5);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x86efac, 2.2);
      rimLight.position.set(-3, -2.5, 2);
      scene.add(rimLight);

      const gleamLight = new THREE.PointLight(0x22c55e, 3.0, 8);
      gleamLight.position.set(1.5, 2.5, 3.0);
      scene.add(gleamLight);

      // 2. Load Crystal Emerald Coin Texture
      let faceTexture: THREE.Texture;
      if (cachedTexture) {
        faceTexture = cachedTexture;
      } else {
        const loader = new THREE.TextureLoader();
        faceTexture = loader.load('/gt-crystal-coin.png', () => {
          renderer?.render(scene, camera);
        });
        faceTexture.colorSpace = THREE.SRGBColorSpace;
        faceTexture.anisotropy = 8;
        cachedTexture = faceTexture;
      }

      // 3. Materials
      const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0x22C55E,
        metalness: 0.92,
        roughness: 0.22,
        emissive: 0x052e16,
      });

      const faceMaterial = new THREE.MeshStandardMaterial({
        map: faceTexture,
        metalness: 0.45,
        roughness: 0.2,
        transparent: true,
      });

      // 4. Real 3D Coin Mesh (Circle Front + Circle Back + Milled Rim Cylinder)
      const coinRadius = 1.25;
      const coinThickness = 0.18;

      // Front Face (+Z)
      const frontGeo = new THREE.CircleGeometry(coinRadius, 64);
      const frontMesh = new THREE.Mesh(frontGeo, faceMaterial);
      frontMesh.position.z = coinThickness / 2;

      // Back Face (-Z)
      const backGeo = new THREE.CircleGeometry(coinRadius, 64);
      backGeo.rotateY(Math.PI);
      const backMesh = new THREE.Mesh(backGeo, faceMaterial);
      backMesh.position.z = -coinThickness / 2;

      // Milled Outer Rim connecting front and back faces
      const rimGeo = new THREE.CylinderGeometry(coinRadius, coinRadius, coinThickness, 64, 1, true);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, rimMaterial);

      // Coin Assembly
      const coinMesh = new THREE.Group();
      coinMesh.add(frontMesh);
      coinMesh.add(backMesh);
      coinMesh.add(rimMesh);

      // Slant Group for diagonal posture matching reference video
      const slantGroup = new THREE.Group();
      slantGroup.rotation.z = -0.32; // diagonal slant
      slantGroup.rotation.y = 0.22;  // subtle isometric depth
      slantGroup.add(coinMesh);

      scene.add(slantGroup);

      // 5. Floating Sparkle Particles around coin
      const particleCount = 26;
      const particleGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 3.2;
        pos[i + 1] = (Math.random() - 0.5) * 3.2;
        pos[i + 2] = (Math.random() - 0.5) * 1.8;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x86EFAC,
        size: 0.055,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // 6. CONTINUOUS 360-DEGREE FULL ROTATION FLIP
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
        frontGeo.dispose();
        backGeo.dispose();
        rimGeo.dispose();
        particleGeo.dispose();
        particleMat.dispose();
        rimMaterial.dispose();
        faceMaterial.dispose();
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
