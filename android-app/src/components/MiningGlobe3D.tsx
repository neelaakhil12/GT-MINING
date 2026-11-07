import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import * as THREE from 'three';

interface MiningGlobe3DProps {
  spinning?: boolean;
}

interface TileData {
  normal: THREE.Vector3;
  baseRadius: number;
  phase: number;
  speed: number;
  amplitude: number;
  scaleX: number;
  scaleY: number;
}

export const MiningGlobe3D: React.FC<MiningGlobe3DProps> = ({ spinning = false }) => {
  const mountRef = useRef<any>(null);
  const spinProgressRef = useRef<{
    active: boolean;
    startTime: number;
    duration: number;
    totalRotations: number;
  }>({
    active: false,
    startTime: 0,
    duration: 2600,
    totalRotations: 14 * Math.PI * 2,
  });

  useEffect(() => {
    if (spinning) {
      spinProgressRef.current = {
        active: true,
        startTime: typeof performance !== 'undefined' ? performance.now() : Date.now(),
        duration: 2600,
        totalRotations: 14 * Math.PI * 2,
      };
    }
  }, [spinning]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const container = mountRef.current;
    if (!container) return;

    const width = 280;
    const height = 230;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.7);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Mount canvas to DOM node
    if (container.appendChild) {
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    }

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.85);
    dirLight1.position.set(4.5, 5.5, 4.0);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x4ade80, 2.0);
    dirLight2.position.set(-4.5, -3.0, 3.0);
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0x16a34a, 1.5);
    dirLight3.position.set(0, -4.0, -3.0);
    scene.add(dirLight3);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroup.rotation.x = 0.18;
    globeGroup.rotation.z = -0.06;

    // Core Sphere
    const innerGeo = new THREE.SphereGeometry(1.62, 48, 48);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x15803d,
      emissive: 0x054f2c,
      emissiveIntensity: 0.18,
      roughness: 0.28,
      metalness: 0.08,
      clearcoat: 0.85,
      clearcoatRoughness: 0.14,
      transparent: true,
      opacity: 0.96,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerSphere);

    // 6. Floating Flat Cube Tiles
    const tileCount = 230;
    const tileGeo = new THREE.BoxGeometry(0.25, 0.25, 0.045);
    const tileMat = new THREE.MeshPhysicalMaterial({
      color: 0x22c55e,
      emissive: 0x059669,
      emissiveIntensity: 0.2,
      roughness: 0.22,
      metalness: 0.1,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      reflectivity: 0.8,
    });

    const instancedTiles = new THREE.InstancedMesh(tileGeo, tileMat, tileCount);
    instancedTiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const tileData: TileData[] = [];

    for (let i = 0; i < tileCount; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / tileCount);
      const sinPhi = Math.sin(phi);
      const normal = new THREE.Vector3(
        sinPhi * Math.cos(theta),
        sinPhi * Math.sin(theta),
        Math.cos(phi)
      ).normalize();

      let baseRadius = 1.66;
      if (i % 5 === 0) {
        baseRadius = 2.15 + (i % 3) * 0.12;
      } else if (i % 2 === 0) {
        baseRadius = 1.88 + (i % 4) * 0.08;
      } else {
        baseRadius = 1.66 + Math.sin(i * 3.1) * 0.04;
      }

      tileData.push({
        normal,
        baseRadius,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0035 + Math.random() * 0.0035,
        amplitude: baseRadius > 1.8 ? 0.16 + Math.random() * 0.12 : 0.05,
        scaleX: 0.9 + Math.sin(i * 1.5) * 0.2,
        scaleY: 0.9 + Math.cos(i * 1.5) * 0.2,
      });

      const pos = normal.clone().multiplyScalar(baseRadius);
      dummy.position.copy(pos);
      dummy.lookAt(pos.clone().add(normal));
      dummy.scale.set(tileData[i].scaleX, tileData[i].scaleY, 1.0);
      dummy.updateMatrix();
      instancedTiles.setMatrixAt(i, dummy.matrix);
    }

    instancedTiles.instanceMatrix.needsUpdate = true;
    globeGroup.add(instancedTiles);

    // 7. Animation Loop
    let animationFrameId: number;
    let baseAngle = 0;
    const tempPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const spin = spinProgressRef.current;

      for (let i = 0; i < tileCount; i++) {
        const d = tileData[i];
        const r = d.baseRadius + Math.sin(now * d.speed + d.phase) * d.amplitude;

        tempPos.copy(d.normal).multiplyScalar(r);
        dummy.position.copy(tempPos);

        targetLook.copy(tempPos).add(d.normal);
        dummy.lookAt(targetLook);
        dummy.scale.set(d.scaleX, d.scaleY, 1.0);
        dummy.updateMatrix();

        instancedTiles.setMatrixAt(i, dummy.matrix);
      }
      instancedTiles.instanceMatrix.needsUpdate = true;

      if (spin.active) {
        const elapsed = now - spin.startTime;
        const t = Math.min(1, elapsed / spin.duration);
        const ease = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
        globeGroup.rotation.y = baseAngle + ease * spin.totalRotations;
        const pulse = Math.sin(t * Math.PI) * 0.15;
        globeGroup.scale.set(1 + pulse, 1 + pulse, 1 + pulse);

        if (t >= 1) {
          spin.active = false;
          baseAngle = globeGroup.rotation.y;
          globeGroup.scale.set(1, 1, 1);
        }
      } else {
        globeGroup.rotation.y += 0.017;
        baseAngle = globeGroup.rotation.y;
      }

      globeGroup.position.y = Math.sin(now * 0.0022) * 0.08;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      tileGeo.dispose();
      tileMat.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.ambientAura} />
      <div
        ref={mountRef}
        style={{
          width: 280,
          height: 230,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientAura: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(52, 211, 153, 0.22)',
  },
});

