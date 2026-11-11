import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { THREE_MIN_JS } from './threeMinJs';

interface MiningGlobe3DProps {
  spinning?: boolean;
}

const buildGlobeHtml = (): string => `<!DOCTYPE html>
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
      background: transparent !important;
    }
    canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
      background: transparent !important;
    }
  </style>
  <script>${THREE_MIN_JS}</script>
</head>
<body>
  <div id="canvas-container"></div>
  <script>
    (function () {
      var spinState = {
        active: false,
        startTime: 0,
        duration: 2600,
        totalRotations: 14 * Math.PI * 2
      };

      window.triggerSpin = function () {
        spinState = {
          active: true,
          startTime: performance.now(),
          duration: 2600,
          totalRotations: 14 * Math.PI * 2
        };
      };

      function startCanvas2DFallback(container) {
        container.innerHTML = '';
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        function resize() {
          var w = container.clientWidth || window.innerWidth || 260;
          var h = container.clientHeight || window.innerHeight || 230;
          canvas.width = Math.max(1, Math.floor(w * dpr));
          canvas.height = Math.max(1, Math.floor(h * dpr));
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        container.appendChild(canvas);
        resize();
        window.addEventListener('resize', resize);

        var tileCount = 130;
        var goldenRatio = (1 + Math.sqrt(5)) / 2;
        var tiles = [];
        for (var i = 0; i < tileCount; i++) {
          var theta = (2 * Math.PI * i) / goldenRatio;
          var phi = Math.acos(1 - (2 * (i + 0.5)) / tileCount);
          var sinPhi = Math.sin(phi);
          var nx = sinPhi * Math.cos(theta);
          var ny = Math.cos(phi);
          var nz = sinPhi * Math.sin(theta);
          var baseR = i % 5 === 0 ? 1.32 : (i % 2 === 0 ? 1.16 : 1.03);
          tiles.push({
            nx: nx, ny: ny, nz: nz,
            baseR: baseR,
            phase: (i * 0.73) % (Math.PI * 2),
            speed: 0.003 + (i % 5) * 0.0007,
            amp: baseR > 1.1 ? 0.09 : 0.03
          });
        }

        var angleY = 0;
        var baseAngle = 0;
        function drawFrame() {
          requestAnimationFrame(drawFrame);
          var now = performance.now();
          var w = container.clientWidth || window.innerWidth || 260;
          var h = container.clientHeight || window.innerHeight || 230;
          if (w <= 0 || h <= 0) return;

          ctx.clearRect(0, 0, w, h);

          if (spinState.active) {
            var elapsed = now - spinState.startTime;
            var t = Math.min(1, elapsed / spinState.duration);
            var ease = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
            angleY = baseAngle + ease * spinState.totalRotations;
            if (t >= 1) {
              spinState.active = false;
              baseAngle = angleY;
            }
          } else {
            angleY += 0.017;
            baseAngle = angleY;
          }

          var bobY = Math.sin(now * 0.0022) * 3;
          var cx = w / 2;
          var cy = h / 2 + bobY;
          var radius = Math.min(w, h) * 0.30;

          // Back tiles
          var cosY = Math.cos(angleY);
          var sinY = Math.sin(angleY);
          var tilt = 0.18;
          var cosX = Math.cos(tilt);
          var sinX = Math.sin(tilt);

          var projected = [];
          for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            var r = tile.baseR + Math.sin(now * tile.speed + tile.phase) * tile.amp;
            var x1 = tile.nx * cosY - tile.nz * sinY;
            var z1 = tile.nx * sinY + tile.nz * cosY;
            var y1 = tile.ny;
            var y2 = y1 * cosX - z1 * sinX;
            var z2 = y1 * sinX + z1 * cosX;
            projected.push({ x: x1 * r, y: y2 * r, z: z2 * r });
          }
          projected.sort(function (a, b) { return a.z - b.z; });

          function drawTile(p) {
            var persp = 4.2 / (4.2 - p.z);
            var sx = cx + p.x * radius * persp;
            var sy = cy - p.y * radius * persp;
            var sz = Math.max(5, 11 * persp);
            var light = Math.max(0.25, Math.min(1, 0.55 + p.z * 0.35 + p.y * 0.15));
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(p.x * 0.35);
            ctx.fillStyle = light > 0.72 ? '#4ADE80' : (light > 0.45 ? '#22C55E' : '#15803D');
            ctx.strokeStyle = 'rgba(255,255,255,0.28)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.rect(-sz * 0.5, -sz * 0.5, sz, sz);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }

          for (var j = 0; j < projected.length; j++) {
            if (projected[j].z < 0) drawTile(projected[j]);
          }

          // Core emerald glossy sphere
          var grad = ctx.createRadialGradient(
            cx + radius * 0.32, cy - radius * 0.32, radius * 0.1,
            cx, cy, radius * 1.02
          );
          grad.addColorStop(0, '#86EFAC');
          grad.addColorStop(0.28, '#22C55E');
          grad.addColorStop(0.75, '#15803D');
          grad.addColorStop(1, '#064E3B');
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          for (var k = 0; k < projected.length; k++) {
            if (projected[k].z >= 0) drawTile(projected[k]);
          }
        }
        drawFrame();
      }

      function initWebGL(attempts) {
        var container = document.getElementById('canvas-container');
        if (!container) return;

        var width = container.clientWidth || window.innerWidth;
        var height = container.clientHeight || window.innerHeight;
        if ((!width || !height) && attempts < 20) {
          setTimeout(function () { initWebGL(attempts + 1); }, 40);
          return;
        }
        width = width || 260;
        height = height || 230;

        if (typeof THREE === 'undefined') {
          if (attempts < 10) {
            setTimeout(function () { initWebGL(attempts + 1); }, 40);
            return;
          }
          startCanvas2DFallback(container);
          return;
        }

        try {
          var scene = new THREE.Scene();
          var camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
          camera.position.set(0, 0, 5.7);

          var renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'default'
          });
          var gl = renderer.getContext && renderer.getContext();
          if (!gl) {
            startCanvas2DFallback(container);
            return;
          }

          renderer.setClearColor(0x000000, 0);
          renderer.setSize(width, height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.15;
          container.appendChild(renderer.domElement);

          var ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
          scene.add(ambientLight);

          var dirLight1 = new THREE.DirectionalLight(0xffffff, 1.9);
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

          // MeshStandardMaterial keeps shaders 100% compatible with mobile Android GPUs (same as Dashboard 3D Coin)
          var innerGeo = new THREE.SphereGeometry(1.60, 36, 36);
          var innerMat = new THREE.MeshStandardMaterial({
            color: 0x15803d,
            emissive: 0x054f2c,
            emissiveIntensity: 0.22,
            roughness: 0.25,
            metalness: 0.12
          });
          var innerSphere = new THREE.Mesh(innerGeo, innerMat);
          globeGroup.add(innerSphere);

          var tileCount = 150;
          var tileGeo = new THREE.BoxGeometry(0.27, 0.27, 0.05);
          var tileMat = new THREE.MeshStandardMaterial({
            color: 0x22c55e,
            emissive: 0x059669,
            emissiveIntensity: 0.22,
            roughness: 0.22,
            metalness: 0.15
          });

          var goldenRatio = (1 + Math.sqrt(5)) / 2;
          var tiles = [];

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
              baseRadius = 2.12 + (i % 3) * 0.12;
            } else if (i % 2 === 0) {
              baseRadius = 1.86 + (i % 4) * 0.08;
            } else {
              baseRadius = 1.66 + Math.sin(i * 3.1) * 0.04;
            }

            var mesh = new THREE.Mesh(tileGeo, tileMat);
            var sx = 0.92 + Math.sin(i * 1.5) * 0.18;
            var sy = 0.92 + Math.cos(i * 1.5) * 0.18;
            mesh.scale.set(sx, sy, 1.0);

            var pos = normal.clone().multiplyScalar(baseRadius);
            mesh.position.copy(pos);
            mesh.lookAt(pos.clone().add(normal));
            globeGroup.add(mesh);

            tiles.push({
              mesh: mesh,
              normal: normal,
              baseRadius: baseRadius,
              phase: (i * 0.87) % (Math.PI * 2),
              speed: 0.0032 + (i % 6) * 0.0005,
              amplitude: baseRadius > 1.8 ? 0.15 : 0.05
            });
          }

          var baseAngle = 0;
          var tempPos = new THREE.Vector3();

          function animate() {
            requestAnimationFrame(animate);
            var now = performance.now();

            for (var i = 0; i < tiles.length; i++) {
              var d = tiles[i];
              var r = d.baseRadius + Math.sin(now * d.speed + d.phase) * d.amplitude;
              tempPos.copy(d.normal).multiplyScalar(r);
              d.mesh.position.copy(tempPos);
            }

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

          window.addEventListener('resize', function () {
            var newW = container.clientWidth || window.innerWidth || 260;
            var newH = container.clientHeight || window.innerHeight || 230;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
          });
        } catch (err) {
          startCanvas2DFallback(container);
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initWebGL(0); });
      } else {
        initWebGL(0);
      }
    })();
  </script>
</body>
</html>`;

export const MiningGlobe3D: React.FC<MiningGlobe3DProps> = ({ spinning = false }) => {
  const webViewRef = useRef<WebView>(null);
  const { width: screenWidth } = useWindowDimensions();
  const globeWidth = Math.min(Math.max(Math.round(screenWidth - 64), 220), 300);
  const globeHeight = 230;
  const globeHtml = useMemo(() => buildGlobeHtml(), []);

  useEffect(() => {
    if (spinning) {
      webViewRef.current?.injectJavaScript('window.triggerSpin && window.triggerSpin(); true;');
    }
  }, [spinning]);

  return (
    <View
      style={[styles.container, { width: globeWidth, height: globeHeight }]}
      pointerEvents="none"
    >
      <View style={styles.ambientAura} />
      <WebView
        ref={webViewRef}
        source={{ html: globeHtml, baseUrl: 'https://gtnetwork.in' }}
        style={styles.webView}
        scrollEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  ambientAura: {
    position: 'absolute',
    width: 195,
    height: 195,
    borderRadius: 98,
    backgroundColor: 'rgba(52, 211, 153, 0.20)',
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    // opacity: 0.99 fixes Chromium WebView rendering an opaque white backing on Android ScrollView layers
    opacity: Platform.OS === 'android' ? 0.99 : 1,
  },
});
