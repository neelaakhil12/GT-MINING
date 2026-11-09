import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { THREE_MIN_JS } from './threeMinJs';

interface MiningGlobe3DProps {
  spinning?: boolean;
}

const buildGlobeHtml = (): string => `
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
      background: transparent;
      touch-action: none;
      -webkit-touch-callout: none;
      user-select: none;
    }
    #canvas-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
    canvas {
      display: block;
      background: transparent !important;
    }
  </style>
  <script>
    ${THREE_MIN_JS}
  </script>
</head>
<body>
  <div id="canvas-container"></div>
  <script>
    (function init() {
      if (typeof THREE === 'undefined') {
        setTimeout(init, 30);
        return;
      }

      var container = document.getElementById('canvas-container');
      var width = window.innerWidth || 300;
      var height = window.innerHeight || 230;

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
      camera.position.set(0, 0, 5.7);

      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);

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

      var globeGroup = new THREE.Group();
      scene.add(globeGroup);
      globeGroup.rotation.x = 0.18;
      globeGroup.rotation.z = -0.06;

      var innerGeo = new THREE.SphereGeometry(1.62, 36, 36);
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

      var tileCount = 210;
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

      var spinState = {
        active: false,
        startTime: 0,
        duration: 2600,
        totalRotations: 14 * Math.PI * 2,
      };

      window.triggerSpin = function() {
        spinState.active = true;
        spinState.startTime = performance.now();
      };

      var baseAngle = 0;
      var tempPos = new THREE.Vector3();
      var targetLook = new THREE.Vector3();

      function animate() {
        requestAnimationFrame(animate);
        var now = performance.now();

        for (var i = 0; i < tileCount; i++) {
          var d = tileData[i];
          var r = d.baseRadius + Math.sin(now * d.speed + d.phase) * d.amplitude;
          tempPos.copy(d.normal).multiplyScalar(r);
          dummy.position.copy(tempPos);
          targetLook.copy(tempPos).add(d.normal);
          dummy.lookAt(targetLook);
          dummy.scale.set(d.scaleX, d.scaleY, 1.0);
          dummy.updateMatrix();
          instancedTiles.setMatrixAt(i, dummy.matrix);
        }
        instancedTiles.instanceMatrix.needsUpdate = true;

        if (spinState.active) {
          var elapsed = now - spinState.startTime;
          var t = Math.min(1, elapsed / spinState.duration);
          var ease = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
          globeGroup.rotation.y = baseAngle + ease * spinState.totalRotations;
          var pulse = Math.sin(t * Math.PI) * 0.15;
          globeGroup.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
          if (t >= 1) {
            spinState.active = false;
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
        var newW = window.innerWidth || 300;
        var newH = window.innerHeight || 230;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      });
    })();
  </script>
</body>
</html>
`;

export const MiningGlobe3D: React.FC<MiningGlobe3DProps> = ({ spinning = false }) => {
  const webViewRef = useRef<WebView>(null);
  const globeHtml = useMemo(() => buildGlobeHtml(), []);

  useEffect(() => {
    if (spinning) {
      webViewRef.current?.injectJavaScript('window.triggerSpin && window.triggerSpin(); true;');
    }
  }, [spinning]);

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.ambientAura} />
      <WebView
        ref={webViewRef}
        source={{ html: globeHtml, baseUrl: 'https://gtnetwork.in' }}
        style={styles.webView}
        scrollEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        scalesPageToFit={false}
        androidLayerType="hardware"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 235,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  ambientAura: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(52, 211, 153, 0.22)',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 35,
    elevation: 8,
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});
