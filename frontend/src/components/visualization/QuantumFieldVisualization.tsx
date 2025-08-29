import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Effects } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Types
interface QuantumNode {
  id: string;
  position: [number, number, number];
  status: 'secure' | 'warning' | 'threat' | 'offline';
  connections: string[];
  quantumState: number;
  threatLevel: number;
  metadata?: {
    name?: string;
    type?: string;
    lastSeen?: number;
  };
}

interface QuantumEdge {
  source: string;
  target: string;
  strength: number;
  encrypted: boolean;
  dataFlow?: number;
}

interface QuantumFieldData {
  nodes: QuantumNode[];
  edges: QuantumEdge[];
  fieldMetrics: {
    coherence: number;
    entanglement: number;
    stability: number;
    defenseDnaStrength: number;
  };
}

interface QuantumFieldVisualizationProps {
  data: QuantumFieldData;
  onNodeClick?: (node: QuantumNode) => void;
  onFieldInteraction?: (interaction: any) => void;
  showLabels?: boolean;
  animationSpeed?: number;
  cameraPosition?: [number, number, number];
}

// Node Component
const QuantumNodeComponent: React.FC<{
  node: QuantumNode;
  selected: boolean;
  onClick: () => void;
  animationTime: number;
}> = ({ node, selected, onClick, animationTime }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  
  const [hovered, setHovered] = useState(false);

  // Color mapping for node status
  const getNodeColor = (status: string, threatLevel: number) => {
    switch (status) {
      case 'threat':
        return new THREE.Color().setHSL(0, 1, 0.3 + threatLevel * 0.4); // Red variations
      case 'warning':
        return new THREE.Color().setHSL(0.1, 1, 0.4 + threatLevel * 0.3); // Orange variations
      case 'offline':
        return new THREE.Color().setHSL(0, 0, 0.2); // Gray
      default:
        return new THREE.Color().setHSL(0.6, 0.8, 0.4 + node.quantumState * 0.4); // Blue-green variations
    }
  };

  const nodeColor = getNodeColor(node.status, node.threatLevel);
  const pulseIntensity = node.status === 'threat' ? 0.5 : 0.2;
  
  useFrame(() => {
    if (meshRef.current) {
      // Quantum state rotation
      meshRef.current.rotation.y = animationTime * 0.5 * node.quantumState;
      meshRef.current.rotation.z = Math.sin(animationTime * 2) * 0.1;
      
      // Pulsing effect based on threat level
      const pulse = 1 + Math.sin(animationTime * 4) * pulseIntensity * node.threatLevel;
      meshRef.current.scale.setScalar(pulse * (selected ? 1.5 : 1) * (hovered ? 1.2 : 1));
    }
    
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = -animationTime * 0.3;
      outerRingRef.current.rotation.x = Math.sin(animationTime) * 0.2;
    }
    
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y = animationTime * 0.8;
      innerRingRef.current.rotation.z = Math.cos(animationTime * 1.5) * 0.15;
    }
  });

  return (
    <group position={node.position}>
      {/* Main Node Sphere */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial
          color={nodeColor}
          emissive={nodeColor.clone().multiplyScalar(0.2)}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Outer Ring (Quantum Field Indicator) */}
      <mesh ref={outerRingRef}>
        <ringGeometry args={[2, 2.5, 16]} />
        <meshBasicMaterial
          color={nodeColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Ring (Data Flow Indicator) */}
      <mesh ref={innerRingRef}>
        <ringGeometry args={[1.2, 1.5, 12]} />
        <meshBasicMaterial
          color={nodeColor}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Status Indicator Particles */}
      <QuantumParticles
        count={node.status === 'threat' ? 50 : 20}
        color={nodeColor}
        radius={3}
        intensity={node.quantumState}
      />

      {/* Node Label */}
      <Html distanceFactor={15}>
        <div className={`
          px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white
          border border-slate-600 transition-all duration-300
          ${hovered || selected ? 'opacity-100 scale-105' : 'opacity-70'}
        `}>
          <div className=\"font-semibold\">{node.metadata?.name || node.id}</div>
          <div className=\"text-xs text-gray-300\">
            {node.metadata?.type || node.status}
          </div>
          {node.threatLevel > 0.5 && (
            <div className=\"text-red-400 text-xs\">
              Threat: {Math.round(node.threatLevel * 100)}%
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

// Connection Component
const QuantumConnection: React.FC<{
  edge: QuantumEdge;
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
  animationTime: number;
}> = ({ edge, sourcePos, targetPos, animationTime }) => {
  const lineRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  
  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...sourcePos),
      new THREE.Vector3(
        (sourcePos[0] + targetPos[0]) / 2 + Math.sin(animationTime) * 5,
        (sourcePos[1] + targetPos[1]) / 2 + Math.cos(animationTime) * 3,
        (sourcePos[2] + targetPos[2]) / 2
      ),
      new THREE.Vector3(...targetPos)
    ]);
    return curve.getPoints(50);
  }, [sourcePos, targetPos, animationTime]);

  useFrame(() => {
    if (lineRef.current) {
      lineRef.current.setFromPoints(points);
    }
    
    if (materialRef.current) {
      // Data flow animation
      const flowSpeed = edge.dataFlow || 1;
      materialRef.current.opacity = 0.3 + Math.sin(animationTime * flowSpeed * 2) * 0.2;
    }
  });

  const connectionColor = edge.encrypted 
    ? new THREE.Color(0x00ff88) 
    : new THREE.Color(0xff8800);

  return (
    <line>
      <bufferGeometry ref={lineRef} />
      <lineBasicMaterial
        ref={materialRef}
        color={connectionColor}
        transparent
        opacity={0.4 + edge.strength * 0.4}
        linewidth={edge.strength * 3}
      />
    </line>
  );
};

// Particle System Component
const QuantumParticles: React.FC<{
  count: number;
  color: THREE.Color;
  radius: number;
  intensity: number;
}> = ({ count, color, radius, intensity }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const spherical = new THREE.Spherical(
        radius * Math.random(),
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2
      );
      const cartesian = new THREE.Vector3().setFromSpherical(spherical);
      positions[i3] = cartesian.x;
      positions[i3 + 1] = cartesian.y;
      positions[i3 + 2] = cartesian.z;
    }
    return positions;
  }, [count, radius]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1 * intensity;
      pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach=\"position\"
          array={particlePositions}
          count={particlePositions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.1}
        transparent
        opacity={0.6 * intensity}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Field Visualization Component
const QuantumFieldBackground: React.FC<{
  metrics: QuantumFieldData['fieldMetrics'];
}> = ({ metrics }) => {
  const { scene } = useThree();
  const fieldRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    // Create quantum field shader
    const fieldGeometry = new THREE.SphereGeometry(100, 64, 64);
    const fieldMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        coherence: { value: metrics.coherence },
        entanglement: { value: metrics.entanglement },
        stability: { value: metrics.stability }
      },
      vertexShader: `
        uniform float time;
        uniform float coherence;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          
          vec3 pos = position;
          pos += normal * sin(time + position.x * 0.1) * coherence * 2.0;
          pos += normal * cos(time * 0.5 + position.y * 0.1) * coherence * 1.5;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float entanglement;
        uniform float stability;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float intensity = dot(vNormal, normalize(vPosition));
          intensity = pow(intensity, 2.0);
          
          vec3 color = mix(
            vec3(0.1, 0.2, 0.8),
            vec3(0.2, 0.8, 0.4),
            entanglement
          );
          
          float alpha = intensity * 0.1 * stability;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.BackSide
    });

    const fieldMesh = new THREE.Mesh(fieldGeometry, fieldMaterial);
    scene.add(fieldMesh);
    fieldRef.current = fieldMesh;

    return () => {
      scene.remove(fieldMesh);
    };
  }, [scene, metrics]);

  useFrame((state) => {
    if (fieldRef.current && fieldRef.current.material instanceof THREE.ShaderMaterial) {
      fieldRef.current.material.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return null;
};

// Main Visualization Component
const QuantumFieldVisualization: React.FC<QuantumFieldVisualizationProps> = ({
  data,
  onNodeClick,
  onFieldInteraction,
  showLabels = true,
  animationSpeed = 1,
  cameraPosition = [50, 30, 50]
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [animationTime, setAnimationTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTime(prev => prev + 0.016 * animationSpeed);
    }, 16);
    return () => clearInterval(interval);
  }, [animationSpeed]);

  const handleNodeClick = useCallback((node: QuantumNode) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    onNodeClick?.(node);
  }, [selectedNode, onNodeClick]);

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center h-full bg-slate-900\">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className=\"text-center\"
        >
          <div className=\"w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4\" />
          <p className=\"text-white\">Initializing Quantum Field...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className=\"relative w-full h-full bg-slate-900\">
      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: cameraPosition, 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#0f172a'));
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color=\"#4f46e5\" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color=\"#06b6d4\" />
        
        {/* Quantum Field Background */}
        <QuantumFieldBackground metrics={data.fieldMetrics} />
        
        {/* Render Nodes */}
        {data.nodes.map((node) => (
          <QuantumNodeComponent
            key={node.id}
            node={node}
            selected={selectedNode === node.id}
            onClick={() => handleNodeClick(node)}
            animationTime={animationTime}
          />
        ))}
        
        {/* Render Connections */}
        {data.edges.map((edge, index) => {
          const sourceNode = data.nodes.find(n => n.id === edge.source);
          const targetNode = data.nodes.find(n => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;
          
          return (
            <QuantumConnection
              key={`${edge.source}-${edge.target}-${index}`}
              edge={edge}
              sourcePos={sourceNode.position}
              targetPos={targetNode.position}
              animationTime={animationTime}
            />
          );
        })}
        
        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={200}
          minDistance={10}
        />
        
        {/* Post-processing Effects */}
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
          <ChromaticAberration
            offset={new THREE.Vector2(0.001, 0.001)}
          />
        </EffectComposer>
      </Canvas>

      {/* Field Metrics Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className=\"absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-slate-600\"
      >
        <h3 className=\"text-white font-semibold mb-3\">Quantum Field Metrics</h3>
        <div className=\"space-y-2 text-sm\">
          <MetricBar label=\"Coherence\" value={data.fieldMetrics.coherence} color=\"blue\" />
          <MetricBar label=\"Entanglement\" value={data.fieldMetrics.entanglement} color=\"cyan\" />
          <MetricBar label=\"Stability\" value={data.fieldMetrics.stability} color=\"green\" />
          <MetricBar label=\"Defense DNA\" value={data.fieldMetrics.defenseDnaStrength} color=\"purple\" />
        </div>
      </motion.div>

      {/* Node Count */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className=\"absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-slate-600\"
      >
        <div className=\"text-center\">
          <div className=\"text-2xl font-bold text-white\">{data.nodes.length}</div>
          <div className=\"text-sm text-gray-300\">Active Nodes</div>
        </div>
      </motion.div>

      {/* Selected Node Info */}
      {selectedNode && (
        <NodeInfoPanel
          node={data.nodes.find(n => n.id === selectedNode)!}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Controls Help */}
      <div className=\"absolute bottom-4 left-4 text-xs text-gray-400 space-y-1\">
        <div>Left Mouse: Rotate • Right Mouse: Pan • Scroll: Zoom</div>
        <div>Click nodes for details • Real-time quantum field visualization</div>
      </div>
    </div>
  );
};

// Helper Components
const MetricBar: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className=\"flex items-center justify-between\">
      <span className=\"text-gray-300 text-xs w-20\">{label}</span>
      <div className=\"flex-1 mx-2 bg-gray-700 rounded-full h-2\">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1, ease: \"easeOut\" }}
          className={`h-full rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
        />
      </div>
      <span className=\"text-white text-xs w-8 text-right\">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
};

const NodeInfoPanel: React.FC<{
  node: QuantumNode;
  onClose: () => void;
}> = ({ node, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      className=\"absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-slate-600 max-w-sm\"
    >
      <div className=\"flex items-center justify-between mb-3\">
        <h3 className=\"text-white font-semibold\">Node Details</h3>
        <button
          onClick={onClose}
          className=\"text-gray-400 hover:text-white transition-colors\"
        >
          ×
        </button>
      </div>
      
      <div className=\"space-y-2 text-sm\">
        <div className=\"flex justify-between\">
          <span className=\"text-gray-300\">ID:</span>
          <span className=\"text-white font-mono\">{node.id}</span>
        </div>
        <div className=\"flex justify-between\">
          <span className=\"text-gray-300\">Status:</span>
          <span className={`capitalize font-medium ${
            node.status === 'threat' ? 'text-red-400' :
            node.status === 'warning' ? 'text-yellow-400' :
            node.status === 'offline' ? 'text-gray-400' :
            'text-green-400'
          }`}>
            {node.status}
          </span>
        </div>
        <div className=\"flex justify-between\">
          <span className=\"text-gray-300\">Quantum State:</span>
          <span className=\"text-white\">{Math.round(node.quantumState * 100)}%</span>
        </div>
        <div className=\"flex justify-between\">
          <span className=\"text-gray-300\">Threat Level:</span>
          <span className=\"text-white\">{Math.round(node.threatLevel * 100)}%</span>
        </div>
        <div className=\"flex justify-between\">
          <span className=\"text-gray-300\">Connections:</span>
          <span className=\"text-white\">{node.connections.length}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QuantumFieldVisualization;