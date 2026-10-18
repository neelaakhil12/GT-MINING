import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MiningGlobe3DProps {
  spinning?: boolean;
  className?: string;
}

export const MiningGlobe3D: React.FC<MiningGlobe3DProps> = ({
  spinning = false,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const spinProgressRef = useRef<{
    active: boolean;
    startTime: number;
    duration: number;
    totalRotations: number;
  }>({
    active: false,
    startTime: 0,
    duration: 2800,
    totalRotations: 15 * Math.PI * 2, // 15 full cycles
  });

  // Trigger spin when spinning prop changes to true
  useEffect(() => {
    if (spinning) {
      spinProgressRef.current = {
        active: true,
        startTime: performance.now(),
        duration: 2800,
        totalRotations: 15 * Math.PI * 2,
      };
    }
  }, [spinning]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 280;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.8);

    // 3. Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Balanced Studio Lighting for vibrant medium-range green
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.7);
    scene.add(ambientLight);

    // Crisp white key light for clean specular highlights
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight1.position.set(5, 6, 4);
    scene.add(dirLight1);

    // Soft mint-emerald rim light
    const dirLight2 = new THREE.DirectionalLight(0x86efac, 1.8);
    dirLight2.position.set(-5, -4, 3);
    scene.add(dirLight2);

    // Luminous inner core light
    const pointLight = new THREE.PointLight(0x34d399, 2.2, 10);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 5. Main Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Inner Core Sphere: Medium balanced emerald green volume
    const innerGeo = new THREE.SphereGeometry(1.65, 32, 32);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x22c55e,
      emissive: 0x065f46,
      emissiveIntensity: 0.08,
      roughness: 0.25,
      metalness: 0.08,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: 0.88,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerSphere);

    // 6. Segmented Floating Cube Tiles: Medium-range luminous emerald jade
    const tileCount = 260;
    const tileGeo = new THREE.BoxGeometry(0.24, 0.24, 0.08);
    const tileMat = new THREE.MeshPhysicalMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.1,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.7,
    });

    const instancedTiles = new THREE.InstancedMesh(tileGeo, tileMat, tileCount);
    instancedTiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    // Fibonacci sphere distribution for uniform coverage with layered radius variations
    for (let i = 0; i < tileCount; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / tileCount);

      // Layered expansion: some tiles close to core, some floating outward
      const radiusLayer = 1.75 + Math.sin(i * 1.7) * 0.35 + (i % 3 === 0 ? 0.3 : 0);

      const x = radiusLayer * Math.sin(phi) * Math.cos(theta);
      const y = radiusLayer * Math.sin(phi) * Math.sin(theta);
      const z = radiusLayer * Math.cos(phi);

      dummy.position.set(x, y, z);
      // Align tile facing directly outward from origin
      dummy.lookAt(0, 0, 0);
      dummy.scale.set(
        0.85 + Math.sin(i) * 0.25,
        0.85 + Math.cos(i) * 0.25,
        1.0
      );
      dummy.updateMatrix();

      instancedTiles.setMatrixAt(i, dummy.matrix);
    }
    instancedTiles.instanceMatrix.needsUpdate = true;
    globeGroup.add(instancedTiles);

    // 6.5 Inward/Outward Floating Breathing Energy Particles
    const particleCount = 130;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleBaseDirs: { x: number; y: number; z: number; baseR: number; speed: number; phase: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const sinPhi = Math.sin(phi);

      const dx = sinPhi * Math.cos(theta);
      const dy = sinPhi * Math.sin(theta);
      const dz = Math.cos(phi);

      const baseR = 2.0 + Math.random() * 1.3;
      const speed = 0.0018 + Math.random() * 0.002;
      const phase = Math.random() * Math.PI * 2;

      particleBaseDirs.push({ x: dx, y: dy, z: dz, baseR, speed, phase });

      particlePositions[i * 3] = dx * baseR;
      particlePositions[i * 3 + 1] = dy * baseR;
      particlePositions[i * 3 + 2] = dz * baseR;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Canvas circular radial particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const pGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pGrad.addColorStop(0.3, 'rgba(134, 239, 172, 0.95)');
    pGrad.addColorStop(0.7, 'rgba(34, 197, 94, 0.45)');
    pGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    const particleTexture = new THREE.CanvasTexture(canvas);
    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Subtle tilt like earth axis
    globeGroup.rotation.x = 0.22;
    globeGroup.rotation.z = -0.08;

    // 7. Animation Loop
    let animationFrameId: number;
    let baseAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const spin = spinProgressRef.current;

      // Breathe particles radially inward and outward
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const p = particleBaseDirs[i];
        const currentR = p.baseR + Math.sin(now * p.speed + p.phase) * 0.42;
        posArr[i * 3] = p.x * currentR;
        posArr[i * 3 + 1] = p.y * currentR;
        posArr[i * 3 + 2] = p.z * currentR;
      }
      posAttr.needsUpdate = true;
      particles.rotation.y += 0.0025;

      if (spin.active) {
        const elapsed = now - spin.startTime;
        const t = Math.min(1, elapsed / spin.duration);

        // Quintic ease in-out for rapid high-speed spin
        const ease = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

        globeGroup.rotation.y = baseAngle + ease * spin.totalRotations;

        // Dynamic scale pulse during rapid spin
        const pulse = Math.sin(t * Math.PI) * 0.18;
        globeGroup.scale.set(1 + pulse, 1 + pulse, 1 + pulse);

        if (t >= 1) {
          spin.active = false;
          baseAngle = globeGroup.rotation.y;
          globeGroup.scale.set(1, 1, 1);
        }
      } else {
        // Normal gentle idle spin
        globeGroup.rotation.y += 0.009;
        baseAngle = globeGroup.rotation.y;
      }

      // Gentle floating bob
      globeGroup.position.y = Math.sin(now * 0.0018) * 0.08;
      particles.position.y = globeGroup.position.y;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 300;
      const newH = container.clientHeight || 280;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      tileGeo.dispose();
      tileMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[220px] sm:h-[280px] flex items-center justify-center select-none overflow-hidden">
      {/* Ambient emerald glow aura */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-[#16A34A]/30 via-[#22C55E]/25 to-transparent blur-3xl pointer-events-none" />
      <div
        ref={mountRef}
        className={`relative z-10 w-full h-full flex items-center justify-center ${className}`}
      />
    </div>
  );
};
