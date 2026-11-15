import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface MiningGlobe3DProps {
  spinning?: boolean;
}

const GLOBE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent !important;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }
    #canvas-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent !important;
    }
    canvas {
      width: 100% !important;
      height: 100% !important;
      display: block;
      background: transparent !important;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <script>
    (function() {
      var container = document.getElementById('canvas-container');
      var width = container.clientWidth || window.innerWidth || 300;
      var height = container.clientHeight || window.innerHeight || 260;

      // 1. Scene
      var scene = new THREE.Scene();

      // 2. Camera - positioned closer so globe appears large and prominent
      var camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
      camera.position.set(0, 0, 5.7);

      // 3. WebGL Renderer with Alpha Transparent Background
      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2, 2.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);

      // 4. Studio Lighting tailored for thick, rich, vibrant emerald green (matches website exactly)
      var ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
      scene.add(ambientLight);

      var dirLight1 = new THREE.DirectionalLight(0xffffff, 1.85);
      dirLight1.position.set(4.5, 5.5, 4.0);
      scene.add(dirLight1);

      var dirLight2 = new THREE.DirectionalLight(0x4ade80, 2.0);
      dirLight2.position.set(-4.5, -3.0, 3.0);
      scene.add(dirLight2);

      var dirLight3 = new THREE.DirectionalLight(0x16a34a, 1.5);
      dirLight3.position.set(0, -4.0, -3.0);
      scene.add(dirLight3);

      // 5. Globe Group
      var globeGroup = new THREE.Group();
      scene.add(globeGroup);

      globeGroup.rotation.x = 0.18;
      globeGroup.rotation.z = -0.06;

      // Core Sphere: Thick, rich emerald green with glossy specular clearcoat
      var innerGeo = new THREE.SphereGeometry(1.62, 48, 48);
      var innerMat = new THREE.MeshPhysicalMaterial({
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
      var innerSphere = new THREE.Mesh(innerGeo, innerMat);
      globeGroup.add(innerSphere);

      // 6. Segmented Floating Flat Cube Tiles (Wafers) - 230 tiles Fibonacci distribution
      var tileCount = 230;
      var tileGeo = new THREE.BoxGeometry(0.25, 0.25, 0.045);
      var tileMat = new THREE.MeshPhysicalMaterial({
        color: 0x22c55e,
        emissive: 0x059669,
        emissiveIntensity: 0.2,
        roughness: 0.22,
        metalness: 0.1,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        reflectivity: 0.8,
      });

      var instancedTiles = new THREE.InstancedMesh(tileGeo, tileMat, tileCount);
      instancedTiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      var dummy = new THREE.Object3D();
      var goldenRatio = (1 + Math.sqrt(5)) / 2;
      var tileData = [];

      for (var i = 0; i < tileCount; i++) {
        var theta = (2 * Math.PI * i) / goldenRatio;
        var phi = Math.acos(1 - (2 * (i + 0.5)) / tileCount);

        var sinPhi = Math.sin(phi);
        var normal = new THREE.Vector3(
          sinPhi * Math.cos(theta),
          sinPhi * Math.sin(theta),
          Math.cos(phi)
        ).normalize();

        var baseRadius = 1.66;
        if (i % 5 === 0) {
          baseRadius = 2.15 + (i % 3) * 0.12;
        } else if (i % 2 === 0) {
          baseRadius = 1.88 + (i % 4) * 0.08;
        } else {
          baseRadius = 1.66 + Math.sin(i * 3.1) * 0.04;
        }

        tileData.push({
          normal: normal,
          baseRadius: baseRadius,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0035 + Math.random() * 0.0035,
          amplitude: baseRadius > 1.8 ? 0.16 + Math.random() * 0.12 : 0.05,
          scaleX: 0.9 + Math.sin(i * 1.5) * 0.2,
          scaleY: 0.9 + Math.cos(i * 1.5) * 0.2,
        });

        var pos = normal.clone().multiplyScalar(baseRadius);
        dummy.position.copy(pos);
        dummy.lookAt(pos.clone().add(normal));
        dummy.scale.set(tileData[i].scaleX, tileData[i].scaleY, 1.0);
        dummy.updateMatrix();
        instancedTiles.setMatrixAt(i, dummy.matrix);
      }

      instancedTiles.instanceMatrix.needsUpdate = true;
      globeGroup.add(instancedTiles);

      // Fast spin progress
      var spinProgress = {
        active: false,
        startTime: 0,
        duration: 2600,
        totalRotations: 14 * Math.PI * 2,
      };

      window.triggerSpin = function() {
        spinProgress.active = true;
        spinProgress.startTime = performance.now();
        spinProgress.duration = 2600;
        spinProgress.totalRotations = 14 * Math.PI * 2;
      };

      var baseAngle = 0;
      var tempPos = new THREE.Vector3();
      var targetLook = new THREE.Vector3();

      function animate() {
        requestAnimationFrame(animate);

        var now = performance.now();

        // Breathing tile oscillations
        for (var j = 0; j < tileCount; j++) {
          var d = tileData[j];
          var r = d.baseRadius + Math.sin(now * d.speed + d.phase) * d.amplitude;
          tempPos.copy(d.normal).multiplyScalar(r);
          dummy.position.copy(tempPos);
          targetLook.copy(tempPos).add(d.normal);
          dummy.lookAt(targetLook);
          dummy.scale.set(d.scaleX, d.scaleY, 1.0);
          dummy.updateMatrix();
          instancedTiles.setMatrixAt(j, dummy.matrix);
        }
        instancedTiles.instanceMatrix.needsUpdate = true;

        if (spinProgress.active) {
          var elapsed = now - spinProgress.startTime;
          var t = Math.min(1, elapsed / spinProgress.duration);
          var ease = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
          globeGroup.rotation.y = baseAngle + ease * spinProgress.totalRotations;
          var pulse = Math.sin(t * Math.PI) * 0.15;
          globeGroup.scale.set(1 + pulse, 1 + pulse, 1 + pulse);

          if (t >= 1) {
            spinProgress.active = false;
            baseAngle = globeGroup.rotation.y;
            globeGroup.scale.set(1, 1, 1);
          }
        } else {
          globeGroup.rotation.y += 0.017;
          baseAngle = globeGroup.rotation.y;
        }

        globeGroup.position.y = Math.sin(now * 0.0022) * 0.08;

        renderer.render(scene, camera);
      }

      animate();

      window.addEventListener('resize', function() {
        var w = container.clientWidth || window.innerWidth;
        var h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
    })();
  </script>
</body>
</html>
`;

export const MiningGlobe3D: React.FC<MiningGlobe3DProps> = ({ spinning = false }) => {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (spinning) {
      webViewRef.current?.injectJavaScript(`
        if (typeof window.triggerSpin === 'function') {
          window.triggerSpin();
        }
        true;
      `);
    }
  }, [spinning]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Ambient mint aura glow matching website */}
      <View style={styles.ambientGlow} />

      {/* Real Three.js WebGL 3D Globe matching website 100% */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: GLOBE_HTML }}
        style={styles.webview}
        containerStyle={styles.webviewContainer}
        scrollEnabled={false}
        overScrollMode="never"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        androidLayerType="hardware"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
  },
  webview: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
  webviewContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
});

export default MiningGlobe3D;
