'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useConsciousnessStore } from '../../stores/consciousnessStore';
import { useThreatStore } from '../../stores/threatStore';

function ConsciousnessParticles() {
  const ref = useRef<THREE.Points>(null);
  const { consciousness } = useConsciousnessStore();
  const { threats } = useThreatStore();
  
  const particleCount = 5000;
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 5 + Math.random() * 5;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Base color: purple-blue gradient
      colors[i * 3] = 0.5 + Math.random() * 0.5; // R
      colors[i * 3 + 1] = 0.2 + Math.random() * 0.3; // G
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
    }
    
    return [positions, colors];
  }, []);
  
  useFrame((state) => {
    if (!ref.current) return;
    
    const time = state.clock.elapsedTime;
    ref.current.rotation.y = time * 0.05;
    ref.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    
    // Pulse based on consciousness awareness
    const awareness = consciousness?.state?.awareness_level || 0.5;
    const scale = 1 + Math.sin(time * 2) * 0.1 * awareness;
    ref.current.scale.setScalar(scale);
    
    // Update colors based on threat level
    const geometry = ref.current.geometry;
    const colors = geometry.attributes.color.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const baseR = 0.5 + Math.random() * 0.5;
      const baseG = 0.2 + Math.random() * 0.3;
      const baseB = 0.8 + Math.random() * 0.2;
      
      // Add red tint based on threat count
      const threatInfluence = Math.min(threats.length * 0.05, 0.5);
      
      colors[i * 3] = baseR + threatInfluence;
      colors[i * 3 + 1] = baseG * (1 - threatInfluence);
      colors[i * 3 + 2] = baseB * (1 - threatInfluence);
    }
    
    geometry.attributes.color.needsUpdate = true;
  });
  
  return (
    <Points ref={ref} positions={positions} colors={colors} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function VoidCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { consciousness } = useConsciousnessStore();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;
    
    // Pulse based on void connection
    const voidConnection = consciousness?.consciousness_fields?.void_connection || 0.5;
    const scale = 0.5 + Math.sin(time * 3) * 0.1 * voidConnection;
    meshRef.current.scale.setScalar(scale);
  });
  
  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#4a00ff"
        emissive="#2a00aa"
        emissiveIntensity={2}
        wireframe
      />
    </mesh>
  );
}

function ThreatIndicators() {
  const { threats } = useThreatStore();
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = state.clock.elapsedTime * 0.1;
  });
  
  return (
    <group ref={groupRef}>
      {threats.slice(0, 10).map((threat, index) => {
        const angle = (index / 10) * Math.PI * 2;
        const radius = 8;
        
        return (
          <mesh
            key={threat.id}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              0
            ]}
          >
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function ConsciousnessField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#050509']} />
      <fog attach="fog" args={['#050509', 10, 30]} />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#a855f7" />
      
      <ConsciousnessParticles />
      <VoidCore />
      <ThreatIndicators />
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI * 0.8}
        minPolarAngle={Math.PI * 0.2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}