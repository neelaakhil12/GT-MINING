import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { THREE_MIN_JS } from './threeMinJs';

interface GtSingleCoin3DProps {
  width?: number;
  height?: number;
}

const buildCoinHtml = () => `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
    }
  </style>
  <script>${THREE_MIN_JS}</script>
</head>
<body>
  <div id="coin" style="width: 100%; height: 100%;"></div>
  <script>
    try {
      const container = document.getElementById('coin');
      const w = window.innerWidth || 100;
      const h = window.innerHeight || 100;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
      camera.position.set(0, 0, 4.4);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xfffae0, 3.2);
      keyLight.position.set(3, 4, 3.5);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x86efac, 1.8);
      rimLight.position.set(-3, -2.5, 2);
      scene.add(rimLight);

      const gleamLight = new THREE.PointLight(0xffffff, 2.5, 8);
      gleamLight.position.set(1.5, 2.5, 3.0);
      scene.add(gleamLight);

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = 'https://gtnetwork.in/gt-header-logo.png';

      function drawFace() {
        ctx.clearRect(0, 0, 512, 512);
        const cx = 256, cy = 256, r = 246;

        // Outer Polished Metallic Gold Rim
        const goldGrad = ctx.createLinearGradient(0, 0, 512, 512);
        goldGrad.addColorStop(0, '#FFF5BA');
        goldGrad.addColorStop(0.25, '#F59E0B');
        goldGrad.addColorStop(0.5, '#FEF08A');
        goldGrad.addColorStop(0.75, '#D97706');
        goldGrad.addColorStop(1, '#FEF08A');

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = goldGrad;
        ctx.fill();

        // Deep Dark Crypto Ambiance Inner Medallion Field
        const bgGrad = ctx.createRadialGradient(cx - 20, cy - 30, 20, cx, cy, r - 18);
        bgGrad.addColorStop(0, '#0F3820');
        bgGrad.addColorStop(0.4, '#072414');
        bgGrad.addColorStop(0.8, '#03170C');
        bgGrad.addColorStop(1, '#020D07');

        ctx.beginPath();
        ctx.arc(cx, cy, r - 18, 0, Math.PI * 2);
        ctx.fillStyle = bgGrad;
        ctx.fill();

        // Beveled Gold Ring
        ctx.beginPath();
        ctx.arc(cx, cy, r - 34, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#FEF08A';
        ctx.stroke();

        // Dashed Mint Security Ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r - 50, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.setLineDash([9, 6]);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.stroke();
        ctx.restore();

        // Inner Core Gold Rim
        ctx.beginPath();
        ctx.arc(cx, cy, 145, 0, Math.PI * 2);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#F59E0B';
        ctx.stroke();

        // Embossed GT Center Logo
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          const s = 195;
          ctx.save();
          ctx.shadowColor = 'rgba(254, 240, 138, 0.6)';
          ctx.shadowBlur = 15;
          ctx.drawImage(logoImg, cx - s / 2, cy - s / 2, s, s);
          ctx.restore();
        }
      }

      drawFace();
      const faceTexture = new THREE.CanvasTexture(canvas);
      faceTexture.anisotropy = 8;

      logoImg.onload = () => {
        drawFace();
        faceTexture.needsUpdate = true;
      };

      const sideMaterial = new THREE.MeshStandardMaterial({
        color: 0xEAB308,
        metalness: 0.96,
        roughness: 0.16,
      });

      const faceMaterial = new THREE.MeshStandardMaterial({
        map: faceTexture,
        metalness: 0.65,
        roughness: 0.22,
      });

      const geometry = new THREE.CylinderGeometry(1.22, 1.22, 0.18, 64);
      const materials = [sideMaterial, faceMaterial, faceMaterial];
      const coinMesh = new THREE.Mesh(geometry, materials);

      // Slant Group for diagonal posture matching reference video
      const slantGroup = new THREE.Group();
      slantGroup.rotation.z = -0.35; // diagonal slant
      slantGroup.rotation.y = 0.22;  // subtle isometric angle
      slantGroup.add(coinMesh);

      scene.add(slantGroup);

      // Subtle Floating Sparkle Particles around coin
      const particleCount = 28;
      const particleGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 3.2;
        pos[i + 1] = (Math.random() - 0.5) * 3.2;
        pos[i + 2] = (Math.random() - 0.5) * 1.8;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0xFEF08A,
        size: 0.055,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // CONTINUOUS 360-DEGREE FULL ROTATION FLIP!
      function animate() {
        requestAnimationFrame(animate);

        // Full 360° continuous flip over horizontal X-axis (up & down)
        coinMesh.rotation.x += 0.024;

        // Particle floating drift
        particles.rotation.y += 0.003;
        particles.rotation.x += 0.002;

        renderer.render(scene, camera);
      }
      animate();
    } catch (e) {}
  </script>
</body>
</html>`;

export const GtSingleCoin3D: React.FC<GtSingleCoin3DProps> = ({
  width = 90,
  height = 90,
}) => {
  const html = useMemo(() => buildCoinHtml(), []);

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      <WebView
        source={{ html, baseUrl: 'https://gtnetwork.in' }}
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

export const GtCoinOrbit = GtSingleCoin3D;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});

export default GtSingleCoin3D;
