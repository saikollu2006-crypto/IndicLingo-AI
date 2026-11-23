import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  createGlyphTexture, 
  createLightRayTexture, 
  createSingularityCoreTexture 
} from '../utils/canvasGlyphs';
import { COSMIC_GLYPHS } from '../utils/languages';

interface CosmicSceneProps {
  interactive?: boolean;
  intensity?: number;
  speedMultiplier?: number;
  cameraZ?: number;
  glyphCount?: number;
  variant?: 'hero' | 'login' | 'compact' | 'workspace';
}

function SingularityCore({ intensity = 1.0 }: { intensity?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createSingularityCoreTexture(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const scale = 1.0 + Math.sin(t * 1.5) * 0.06;
    meshRef.current.scale.set(scale, scale, 1);
  });

  return (
    <group position={[0, 0, -0.2]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[4.2 * intensity, 4.2 * intensity]} />
        <meshBasicMaterial
          map={texture}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          opacity={0.9}
        />
      </mesh>
      <mesh scale={[1.3, 1.3, 1]}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshBasicMaterial
          map={texture}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          opacity={0.95}
        />
      </mesh>
    </group>
  );
}

function RadialLightRays({ count = 40 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => createLightRayTexture(), []);

  const rays = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
      const length = 4.0 + Math.random() * 5.2;
      const width = 0.10 + Math.random() * 0.16;
      const zOffset = (Math.random() - 0.5) * 1.2;
      const opacity = 0.40 + Math.random() * 0.45;
      return { angle, length, width, zOffset, opacity };
    });
  }, [count]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.z = t * 0.035;
  });

  return (
    <group ref={groupRef} position={[0, 0, -0.5]}>
      {rays.map((ray, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(ray.angle) * (ray.length * 0.45),
            Math.sin(ray.angle) * (ray.length * 0.45),
            ray.zOffset,
          ]}
          rotation={[0, 0, ray.angle - Math.PI / 2]}
        >
          <planeGeometry args={[ray.width, ray.length]} />
          <meshBasicMaterial
            map={texture}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            opacity={ray.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

function FloatingGlyphs({ count = 30, speedMultiplier = 1.0 }: { count?: number; speedMultiplier?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const glyphItems = useMemo(() => {
    const list = COSMIC_GLYPHS.slice(0, count);
    return list.map((item, idx) => {
      const phi = idx * 0.68;
      const radius = 1.3 + Math.sqrt(idx) * 0.85;
      const x = Math.cos(phi) * radius + (Math.random() - 0.5) * 0.35;
      const y = Math.sin(phi) * radius * 0.85 + (Math.random() - 0.5) * 0.35;
      const z = -2.2 + (idx % 6) * 0.7 + (Math.random() - 0.5) * 0.4;

      const isCenter = idx < 4;
      const scale = isCenter ? 1.35 : 0.65 + Math.random() * 0.5;
      const floatSpeed = (0.45 + Math.random() * 0.5) * speedMultiplier;
      const floatAmp = 0.07 + Math.random() * 0.1;

      // Dark Botanical Luxury Gold palette (#654922, #956E2F, #B68B4B, #4D574E, #303531, #202221)
      const color = '#F4EFE6'; // Crisp Ivory core
      const glowColor = idx % 2 === 0 ? '#B68B4B' : '#956E2F'; // Warm Honey Gold & Antique Gold

      const texture = createGlyphTexture({
        char: item.char,
        langCode: item.lang,
        color,
        glowColor,
        fontSize: item.char.length > 2 ? 65 : 115,
        isCenterpiece: isCenter,
      });

      return {
        ...item,
        x,
        y,
        z,
        scale,
        texture,
        floatSpeed,
        floatAmp,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, [count, speedMultiplier]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      const g = glyphItems[i];
      if (!g) return;
      child.position.y = g.y + Math.sin(t * g.floatSpeed + g.phase) * g.floatAmp;
      child.position.x = g.x + Math.cos(t * g.floatSpeed * 0.8 + g.phase) * (g.floatAmp * 0.5);
      child.rotation.z = Math.sin(t * 0.25 + g.phase) * 0.06;
    });

    groupRef.current.rotation.z = t * 0.012;
  });

  return (
    <group ref={groupRef}>
      {glyphItems.map((g, i) => (
        <mesh key={i} position={[g.x, g.y, g.z]} scale={[g.scale, g.scale, 1]}>
          <planeGeometry args={[1.3, 1.3]} />
          <meshBasicMaterial
            map={g.texture}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            opacity={0.92}
          />
        </mesh>
      ))}
    </group>
  );
}

function CosmicParticles({ count = 1800 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#F4EFE6'), // Crisp Ivory (#F4EFE6)
      new THREE.Color('#B68B4B'), // Warm Honey Gold (#B68B4B)
      new THREE.Color('#956E2F'), // Antique Gold (#956E2F)
      new THREE.Color('#4D574E'), // Sage Slate (#4D574E)
    ];

    for (let i = 0; i < count; i++) {
      const radius = Math.pow(Math.random(), 0.6) * 10.5;
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 5.5;

      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = Math.sin(theta) * radius * 0.75;
      pos[i * 3 + 2] = z;

      const picked = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = picked.r;
      col[i * 3 + 1] = picked.g;
      col[i * 3 + 2] = picked.b;
    }

    return { positions: pos, colors: col };
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    pointsRef.current.rotation.z = t * 0.015;
    pointsRef.current.rotation.y = Math.sin(t * 0.04) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        vertexColors
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CameraRig({ interactive = true }: { interactive?: boolean }) {
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  useFrame(({ camera }) => {
    if (!interactive) return;
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.04;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.04;

    camera.position.x = mouse.current.x * 1.0;
    camera.position.y = mouse.current.y * 0.7;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export const CosmicSingularityUniverse: React.FC<CosmicSceneProps> = ({
  interactive = true,
  intensity = 1.0,
  speedMultiplier = 1.0,
  cameraZ = 6.2,
  glyphCount = 30,
  variant = 'hero',
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 52 }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#202221'), 0);
        }}
      >
        <CameraRig interactive={interactive} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 1]} intensity={2.6} color="#F4EFE6" distance={10} decay={2} />
        <pointLight position={[0, 0, -2]} intensity={2.0} color="#B68B4B" distance={8} decay={2} />

        <SingularityCore intensity={variant === 'workspace' ? intensity * 1.0 : intensity} />
        <RadialLightRays count={variant === 'compact' ? 24 : variant === 'workspace' ? 36 : 42} />
        <FloatingGlyphs count={glyphCount} speedMultiplier={speedMultiplier} />
        <CosmicParticles count={variant === 'compact' ? 1000 : variant === 'workspace' ? 1500 : 1800} />
      </Canvas>
    </div>
  );
};
