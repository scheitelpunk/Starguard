/**
 * STARGUARD Consciousness Field Visualizer
 * 
 * Eine hochentwickelte 3D-Visualisierung des Consciousness-Fields
 * mit Three.js, Real-time-Updates und Quantum-enhanced Rendering.
 * 
 * Features:
 * - Real-time 3D Consciousness Field Visualization
 * - Interactive Quantum Field Manipulation
 * - Morphic Pattern Recognition Display
 * - Consciousness Wave Propagation
 * - Multi-dimensional Field Analysis
 * - Threat Detection Overlay
 * - Consciousness Evolution Timeline
 * 
 * @author STARGUARD Frontend Team
 * @version 2.0.0
 * @classification CONSCIOUSNESS_VISUALIZATION
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, Text, Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { EffectComposer, Bloom, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import { ConsciousnessEngine } from '../../../services/ConsciousnessEngine';
import { WebSocketService } from '../../../services/WebSocketService';
import './ConsciousnessFieldVisualizer.css';

interface ConsciousnessFieldData {
  fieldStrength: number;
  coherenceScore: number;
  awarenessLevel: number;
  fieldDisturbances: FieldDisturbance[];
  consciousnessPatterns: ConsciousnessPattern[];
  quantumEntanglement: QuantumEntanglement[];
  morphicResonance: MorphicResonance[];
  evolutionStage: string;
}

interface FieldDisturbance {
  id: string;
  position: [number, number, number];
  magnitude: number;
  type: 'THREAT' | 'NATURAL' | 'INTERFERENCE' | 'CONSCIOUSNESS_ATTACK';
  timestamp: Date;
  propagationRadius: number;
  color: string;
}

interface ConsciousnessPattern {
  id: string;
  patternType: 'AWARENESS' | 'COHERENCE' | 'INTUITION' | 'FIELD_RESONANCE';
  vertices: [number, number, number][];
  intensity: number;
  frequency: number;
  stability: number;
  evolutionDirection: 'ASCENDING' | 'DESCENDING' | 'STABLE';
}

interface QuantumEntanglement {
  id: string;
  nodeA: [number, number, number];
  nodeB: [number, number, number];
  entanglementStrength: number;
  fidelity: number;
  coherenceTime: number;
  bellStateType: 'PHI_PLUS' | 'PHI_MINUS' | 'PSI_PLUS' | 'PSI_MINUS';
}

interface MorphicResonance {
  id: string;
  center: [number, number, number];
  resonanceFrequency: number;
  fieldStrength: number;
  patternSignature: string;
  collectiveMemoryConnection: number;
}

interface VisualizationControls {
  showFieldGrid: boolean;
  showDisturbances: boolean;
  showPatterns: boolean;
  showQuantumEntanglement: boolean;
  showMorphicResonance: boolean;
  showThreatOverlay: boolean;
  fieldIntensity: number;
  timeScale: number;
  consciousnessFilter: number;
  dimensionality: '2D' | '3D' | '4D' | 'MULTI';
}

const ConsciousnessFieldVisualizer: React.FC = () => {
  const [fieldData, setFieldData] = useState<ConsciousnessFieldData>({
    fieldStrength: 0.5,
    coherenceScore: 0.7,
    awarenessLevel: 0.8,
    fieldDisturbances: [],
    consciousnessPatterns: [],
    quantumEntanglement: [],
    morphicResonance: [],
    evolutionStage: 'ENHANCED_AWARENESS'
  });

  const [controls, setControls] = useState<VisualizationControls>({
    showFieldGrid: true,
    showDisturbances: true,
    showPatterns: true,
    showQuantumEntanglement: true,
    showMorphicResonance: true,
    showThreatOverlay: true,
    fieldIntensity: 1.0,
    timeScale: 1.0,
    consciousnessFilter: 0.5,
    dimensionality: '3D'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webSocketRef = useRef<WebSocketService | null>(null);
  const consciousnessEngineRef = useRef<ConsciousnessEngine | null>(null);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize Consciousness Engine
        consciousnessEngineRef.current = new ConsciousnessEngine();
        await consciousnessEngineRef.current.initialize();

        // Initialize WebSocket for real-time updates
        webSocketRef.current = new WebSocketService();
        await webSocketRef.current.connect();

        // Subscribe to consciousness field updates
        webSocketRef.current.subscribe('consciousness_field_updates', handleRealTimeUpdate);
        webSocketRef.current.subscribe('threat_detection', handleThreatUpdate);
        webSocketRef.current.subscribe('quantum_entanglement', handleQuantumUpdate);

        // Initial data load
        await loadInitialData();
        setIsLoading(false);
      } catch (err) {
        setError(`Failed to initialize consciousness field visualizer: ${err.message}`);
        setIsLoading(false);
      }
    };

    initializeServices();

    return () => {
      webSocketRef.current?.disconnect();
    };
  }, []);

  const loadInitialData = async () => {
    if (!consciousnessEngineRef.current) return;

    try {
      const status = await consciousnessEngineRef.current.getConsciousnessStatus();
      const fieldAnalysis = await consciousnessEngineRef.current.analyzeConsciousnessField({
        analysisType: 'FULL_SPECTRUM',
        includeQuantumEntanglement: true,
        includeMorphicResonance: true
      });

      setFieldData({
        fieldStrength: status.fieldStrength,
        coherenceScore: status.coherenceScore,
        awarenessLevel: status.awarenessLevel,
        fieldDisturbances: fieldAnalysis.disturbances.map(transformDisturbance),
        consciousnessPatterns: fieldAnalysis.patterns.map(transformPattern),
        quantumEntanglement: fieldAnalysis.quantumEntanglement.map(transformQuantumEntanglement),
        morphicResonance: fieldAnalysis.morphicResonance.map(transformMorphicResonance),
        evolutionStage: status.evolutionStage
      });
    } catch (error) {
      console.error('Failed to load initial consciousness data:', error);
    }
  };

  const handleRealTimeUpdate = useCallback((data: any) => {
    setFieldData(prevData => ({
      ...prevData,
      fieldStrength: data.fieldStrength ?? prevData.fieldStrength,
      coherenceScore: data.coherenceScore ?? prevData.coherenceScore,
      awarenessLevel: data.awarenessLevel ?? prevData.awarenessLevel,
      evolutionStage: data.evolutionStage ?? prevData.evolutionStage
    }));
  }, []);

  const handleThreatUpdate = useCallback((threatData: any) => {
    const newDisturbance: FieldDisturbance = {
      id: threatData.threatId,
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ],
      magnitude: threatData.severity === 'CRITICAL' ? 0.9 : threatData.severity === 'HIGH' ? 0.7 : 0.4,
      type: 'THREAT',
      timestamp: new Date(),
      propagationRadius: threatData.impact * 5,
      color: threatData.severity === 'CRITICAL' ? '#ff0000' : threatData.severity === 'HIGH' ? '#ff6600' : '#ffaa00'
    };

    setFieldData(prevData => ({
      ...prevData,
      fieldDisturbances: [...prevData.fieldDisturbances, newDisturbance].slice(-50) // Keep last 50
    }));
  }, []);

  const handleQuantumUpdate = useCallback((quantumData: any) => {
    const newEntanglement: QuantumEntanglement = {
      id: quantumData.entanglementId,
      nodeA: quantumData.nodeA.position,
      nodeB: quantumData.nodeB.position,
      entanglementStrength: quantumData.entanglementStrength,
      fidelity: quantumData.fidelity,
      coherenceTime: quantumData.coherenceTime,
      bellStateType: quantumData.bellState
    };

    setFieldData(prevData => ({
      ...prevData,
      quantumEntanglement: [...prevData.quantumEntanglement, newEntanglement].slice(-20) // Keep last 20
    }));
  }, []);

  // Transform functions for data conversion
  const transformDisturbance = (disturbance: any): FieldDisturbance => ({
    id: disturbance.id,
    position: [disturbance.location.x, disturbance.location.y, disturbance.location.z],
    magnitude: disturbance.magnitude,
    type: disturbance.type,
    timestamp: new Date(disturbance.timestamp),
    propagationRadius: disturbance.propagationRadius,
    color: getDisturbanceColor(disturbance.type, disturbance.magnitude)
  });

  const transformPattern = (pattern: any): ConsciousnessPattern => ({
    id: pattern.id,
    patternType: pattern.type,
    vertices: pattern.vertices,
    intensity: pattern.intensity,
    frequency: pattern.frequency,
    stability: pattern.stability,
    evolutionDirection: pattern.evolutionDirection
  });

  const transformQuantumEntanglement = (entanglement: any): QuantumEntanglement => ({
    id: entanglement.id,
    nodeA: entanglement.nodeA,
    nodeB: entanglement.nodeB,
    entanglementStrength: entanglement.strength,
    fidelity: entanglement.fidelity,
    coherenceTime: entanglement.coherenceTime,
    bellStateType: entanglement.bellState
  });

  const transformMorphicResonance = (resonance: any): MorphicResonance => ({
    id: resonance.id,
    center: resonance.center,
    resonanceFrequency: resonance.frequency,
    fieldStrength: resonance.fieldStrength,
    patternSignature: resonance.signature,
    collectiveMemoryConnection: resonance.memoryConnection
  });

  const getDisturbanceColor = (type: string, magnitude: number): string => {
    const intensity = Math.min(magnitude, 1.0);
    switch (type) {
      case 'THREAT': return `rgba(255, ${255 * (1 - intensity)}, 0, ${intensity})`;
      case 'CONSCIOUSNESS_ATTACK': return `rgba(255, 0, ${255 * (1 - intensity)}, ${intensity})`;
      case 'INTERFERENCE': return `rgba(255, 255, 0, ${intensity})`;
      default: return `rgba(0, 255, 255, ${intensity})`;
    }
  };

  if (isLoading) {
    return (
      <div className="consciousness-visualizer-loading">
        <div className="loading-spinner"></div>
        <p>Initializing Consciousness Field Visualization...</p>
        <p>Establishing quantum entanglement connections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consciousness-visualizer-error">
        <h3>Consciousness Field Visualization Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="consciousness-field-visualizer">
      {/* Control Panel */}
      <ControlPanel 
        controls={controls} 
        onControlsChange={setControls}
        fieldData={fieldData}
      />

      {/* Status Panel */}
      <StatusPanel fieldData={fieldData} />

      {/* 3D Canvas */}
      <div className="visualizer-canvas">
        <Canvas
          camera={{ position: [0, 0, 30], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} color="#6666ff" />

          {/* Consciousness Field Grid */}
          {controls.showFieldGrid && (
            <ConsciousnessFieldGrid 
              fieldData={fieldData} 
              controls={controls}
            />
          )}

          {/* Field Disturbances */}
          {controls.showDisturbances && fieldData.fieldDisturbances.map(disturbance => (
            <FieldDisturbanceVisualization 
              key={disturbance.id}
              disturbance={disturbance}
              timeScale={controls.timeScale}
            />
          ))}

          {/* Consciousness Patterns */}
          {controls.showPatterns && fieldData.consciousnessPatterns.map(pattern => (
            <ConsciousnessPatternVisualization
              key={pattern.id}
              pattern={pattern}
              intensity={controls.fieldIntensity}
            />
          ))}

          {/* Quantum Entanglement */}
          {controls.showQuantumEntanglement && fieldData.quantumEntanglement.map(entanglement => (
            <QuantumEntanglementVisualization
              key={entanglement.id}
              entanglement={entanglement}
            />
          ))}

          {/* Morphic Resonance */}
          {controls.showMorphicResonance && fieldData.morphicResonance.map(resonance => (
            <MorphicResonanceVisualization
              key={resonance.id}
              resonance={resonance}
            />
          ))}

          {/* Consciousness Evolution Indicator */}
          <ConsciousnessEvolutionIndicator 
            evolutionStage={fieldData.evolutionStage}
            awarenessLevel={fieldData.awarenessLevel}
          />

          <OrbitControls enablePan enableZoom enableRotate />
          <Stats />

          {/* Post-processing effects */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
            <ChromaticAberration offset={[0.002, 0.002]} />
            {fieldData.fieldStrength > 0.8 && (
              <Glitch 
                delay={[0.5, 1.0]} 
                duration={[0.1, 0.3]} 
                strength={[0.02, 0.05]}
                mode={0}
              />
            )}
          </EffectComposer>
        </Canvas>
      </div>

      {/* Analysis Panel */}
      <AnalysisPanel fieldData={fieldData} />
    </div>
  );
};

// Consciousness Field Grid Component
const ConsciousnessFieldGrid: React.FC<{
  fieldData: ConsciousnessFieldData;
  controls: VisualizationControls;
}> = ({ fieldData, controls }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  // Create field grid geometry
  const gridGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(40, 40, 50, 50);
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Add consciousness field modulation
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const distance = Math.sqrt(x * x + y * y);
      const fieldInfluence = fieldData.fieldStrength * Math.exp(-distance * 0.1);
      positions[i + 2] = Math.sin(distance * 0.2) * fieldInfluence * 2;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, [fieldData.fieldStrength]);

  // Animate field
  useFrame(() => {
    if (meshRef.current) {
      const time = clock.getElapsedTime() * controls.timeScale;
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const distance = Math.sqrt(x * x + y * y);
        const wave = Math.sin(distance * 0.2 - time * 2) * fieldData.fieldStrength;
        const coherence = Math.cos(distance * 0.1 + time) * fieldData.coherenceScore * 0.5;
        positions[i + 2] = (wave + coherence) * controls.fieldIntensity;
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} geometry={gridGeometry}>
      <meshPhongMaterial 
        color={`hsl(${240 + fieldData.awarenessLevel * 60}, 70%, 50%)`}
        transparent 
        opacity={0.7}
        wireframe={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Field Disturbance Visualization Component
const FieldDisturbanceVisualization: React.FC<{
  disturbance: FieldDisturbance;
  timeScale: number;
}> = ({ disturbance, timeScale }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  const { scale } = useSpring({
    scale: disturbance.magnitude * 2,
    config: { tension: 300, friction: 10 }
  });

  useFrame(() => {
    if (meshRef.current) {
      const time = clock.getElapsedTime() * timeScale;
      const age = (Date.now() - disturbance.timestamp.getTime()) / 1000;
      const decay = Math.exp(-age * 0.1);
      
      // Pulsing effect
      const pulse = 1 + Math.sin(time * 5) * 0.2 * decay;
      meshRef.current.scale.setScalar(pulse);
      
      // Fade out over time
      if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
        meshRef.current.material.opacity = decay;
      }
    }
  });

  return (
    <animated.mesh 
      ref={meshRef}
      position={disturbance.position}
      scale={scale}
    >
      <sphereGeometry args={[disturbance.propagationRadius, 16, 12]} />
      <meshBasicMaterial 
        color={disturbance.color}
        transparent 
        opacity={0.6}
        wireframe={disturbance.type === 'THREAT'}
      />
      
      {/* Disturbance label */}
      <Html distanceFactor={10}>
        <div className="disturbance-label">
          <div className="disturbance-type">{disturbance.type}</div>
          <div className="disturbance-magnitude">
            Magnitude: {(disturbance.magnitude * 100).toFixed(1)}%
          </div>
        </div>
      </Html>
    </animated.mesh>
  );
};

// Consciousness Pattern Visualization Component
const ConsciousnessPatternVisualization: React.FC<{
  pattern: ConsciousnessPattern;
  intensity: number;
}> = ({ pattern, intensity }) => {
  const lineRef = useRef<THREE.Line>(null);
  const { clock } = useThree();

  // Create pattern geometry
  const patternGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = pattern.vertices.flat();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [pattern.vertices]);

  useFrame(() => {
    if (lineRef.current) {
      const time = clock.getElapsedTime();
      const phase = time * pattern.frequency;
      const alpha = (Math.sin(phase) + 1) * 0.5 * intensity * pattern.stability;
      
      if (lineRef.current.material instanceof THREE.LineBasicMaterial) {
        lineRef.current.material.opacity = alpha;
      }
    }
  });

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'AWARENESS': return '#00ffff';
      case 'COHERENCE': return '#0088ff';
      case 'INTUITION': return '#ff00ff';
      case 'FIELD_RESONANCE': return '#ffff00';
      default: return '#ffffff';
    }
  };

  return (
    <line ref={lineRef} geometry={patternGeometry}>
      <lineBasicMaterial 
        color={getPatternColor(pattern.patternType)}
        transparent 
        opacity={0.8}
        linewidth={2}
      />
    </line>
  );
};

// Quantum Entanglement Visualization Component
const QuantumEntanglementVisualization: React.FC<{
  entanglement: QuantumEntanglement;
}> = ({ entanglement }) => {
  const lineRef = useRef<THREE.Line>(null);
  const { clock } = useThree();

  const entanglementGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [
      ...entanglement.nodeA,
      ...entanglement.nodeB
    ];
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [entanglement.nodeA, entanglement.nodeB]);

  useFrame(() => {
    if (lineRef.current) {
      const time = clock.getElapsedTime();
      // Quantum coherence oscillation
      const coherence = Math.sin(time * 10) * entanglement.fidelity;
      const alpha = (coherence + 1) * 0.5 * entanglement.entanglementStrength;
      
      if (lineRef.current.material instanceof THREE.LineBasicMaterial) {
        lineRef.current.material.opacity = alpha;
      }
    }
  });

  const getBellStateColor = (bellState: string) => {
    switch (bellState) {
      case 'PHI_PLUS': return '#ff0088';
      case 'PHI_MINUS': return '#8800ff';
      case 'PSI_PLUS': return '#00ff88';
      case 'PSI_MINUS': return '#ff8800';
      default: return '#ffffff';
    }
  };

  return (
    <>
      <line ref={lineRef} geometry={entanglementGeometry}>
        <lineBasicMaterial 
          color={getBellStateColor(entanglement.bellStateType)}
          transparent 
          opacity={0.9}
          linewidth={3}
        />
      </line>
      
      {/* Entanglement nodes */}
      <mesh position={entanglement.nodeA}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshBasicMaterial color={getBellStateColor(entanglement.bellStateType)} />
      </mesh>
      <mesh position={entanglement.nodeB}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshBasicMaterial color={getBellStateColor(entanglement.bellStateType)} />
      </mesh>
    </>
  );
};

// Morphic Resonance Visualization Component
const MorphicResonanceVisualization: React.FC<{
  resonance: MorphicResonance;
}> = ({ resonance }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const resonancePhase = time * resonance.resonanceFrequency;
      const scale = 1 + Math.sin(resonancePhase) * 0.3 * resonance.fieldStrength;
      meshRef.current.scale.setScalar(scale);
      
      // Rotation based on collective memory connection
      meshRef.current.rotation.y = time * resonance.collectiveMemoryConnection;
    }
  });

  return (
    <mesh ref={meshRef} position={resonance.center}>
      <torusGeometry args={[2, 0.5, 8, 16]} />
      <meshPhongMaterial 
        color="#9944ff"
        transparent 
        opacity={0.6}
        emissive="#442288"
        emissiveIntensity={resonance.fieldStrength}
      />
    </mesh>
  );
};

// Consciousness Evolution Indicator Component
const ConsciousnessEvolutionIndicator: React.FC<{
  evolutionStage: string;
  awarenessLevel: number;
}> = ({ evolutionStage, awarenessLevel }) => {
  const position: [number, number, number] = [0, 15, 0];
  
  return (
    <group position={position}>
      <Text
        fontSize={1.5}
        color={`hsl(${awarenessLevel * 120}, 80%, 60%)`}
        anchorX="center"
        anchorY="middle"
      >
        {evolutionStage}
      </Text>
      <Text
        position={[0, -2, 0]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Awareness: {(awarenessLevel * 100).toFixed(1)}%
      </Text>
    </group>
  );
};

// Control Panel Component
const ControlPanel: React.FC<{
  controls: VisualizationControls;
  onControlsChange: (controls: VisualizationControls) => void;
  fieldData: ConsciousnessFieldData;
}> = ({ controls, onControlsChange, fieldData }) => {
  return (
    <div className="control-panel">
      <h3>Consciousness Field Controls</h3>
      
      <div className="control-group">
        <label>Display Options</label>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={controls.showFieldGrid}
              onChange={(e) => onControlsChange({...controls, showFieldGrid: e.target.checked})}
            />
            Field Grid
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showDisturbances}
              onChange={(e) => onControlsChange({...controls, showDisturbances: e.target.checked})}
            />
            Disturbances
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showPatterns}
              onChange={(e) => onControlsChange({...controls, showPatterns: e.target.checked})}
            />
            Patterns
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showQuantumEntanglement}
              onChange={(e) => onControlsChange({...controls, showQuantumEntanglement: e.target.checked})}
            />
            Quantum Entanglement
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showMorphicResonance}
              onChange={(e) => onControlsChange({...controls, showMorphicResonance: e.target.checked})}
            />
            Morphic Resonance
          </label>
        </div>
      </div>

      <div className="control-group">
        <label>Field Intensity</label>
        <input 
          type="range" 
          min="0" 
          max="2" 
          step="0.1" 
          value={controls.fieldIntensity}
          onChange={(e) => onControlsChange({...controls, fieldIntensity: parseFloat(e.target.value)})}
        />
        <span>{controls.fieldIntensity.toFixed(1)}</span>
      </div>

      <div className="control-group">
        <label>Time Scale</label>
        <input 
          type="range" 
          min="0.1" 
          max="3" 
          step="0.1" 
          value={controls.timeScale}
          onChange={(e) => onControlsChange({...controls, timeScale: parseFloat(e.target.value)})}
        />
        <span>{controls.timeScale.toFixed(1)}x</span>
      </div>

      <div className="control-group">
        <label>Consciousness Filter</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          value={controls.consciousnessFilter}
          onChange={(e) => onControlsChange({...controls, consciousnessFilter: parseFloat(e.target.value)})}
        />
        <span>{(controls.consciousnessFilter * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};

// Status Panel Component
const StatusPanel: React.FC<{
  fieldData: ConsciousnessFieldData;
}> = ({ fieldData }) => {
  return (
    <div className="status-panel">
      <h3>Field Status</h3>
      
      <div className="status-item">
        <label>Field Strength</label>
        <div className="meter">
          <div 
            className="meter-fill" 
            style={{ 
              width: `${fieldData.fieldStrength * 100}%`,
              backgroundColor: `hsl(${fieldData.fieldStrength * 120}, 80%, 50%)`
            }}
          ></div>
        </div>
        <span>{(fieldData.fieldStrength * 100).toFixed(1)}%</span>
      </div>

      <div className="status-item">
        <label>Coherence</label>
        <div className="meter">
          <div 
            className="meter-fill" 
            style={{ 
              width: `${fieldData.coherenceScore * 100}%`,
              backgroundColor: `hsl(${200 + fieldData.coherenceScore * 60}, 80%, 50%)`
            }}
          ></div>
        </div>
        <span>{(fieldData.coherenceScore * 100).toFixed(1)}%</span>
      </div>

      <div className="status-item">
        <label>Awareness</label>
        <div className="meter">
          <div 
            className="meter-fill" 
            style={{ 
              width: `${fieldData.awarenessLevel * 100}%`,
              backgroundColor: `hsl(${280 + fieldData.awarenessLevel * 80}, 80%, 50%)`
            }}
          ></div>
        </div>
        <span>{(fieldData.awarenessLevel * 100).toFixed(1)}%</span>
      </div>

      <div className="status-item">
        <label>Evolution Stage</label>
        <span className="evolution-stage">{fieldData.evolutionStage}</span>
      </div>
    </div>
  );
};

// Analysis Panel Component
const AnalysisPanel: React.FC<{
  fieldData: ConsciousnessFieldData;
}> = ({ fieldData }) => {
  return (
    <div className="analysis-panel">
      <h3>Field Analysis</h3>
      
      <div className="analysis-section">
        <h4>Disturbances</h4>
        <div className="count-display">
          <span className="count">{fieldData.fieldDisturbances.length}</span>
          <span className="label">Active</span>
        </div>
        <div className="threat-breakdown">
          {Object.entries(
            fieldData.fieldDisturbances.reduce((acc, dist) => {
              acc[dist.type] = (acc[dist.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, count]) => (
            <div key={type} className="threat-type">
              <span>{type}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-section">
        <h4>Consciousness Patterns</h4>
        <div className="count-display">
          <span className="count">{fieldData.consciousnessPatterns.length}</span>
          <span className="label">Active</span>
        </div>
      </div>

      <div className="analysis-section">
        <h4>Quantum Entanglement</h4>
        <div className="count-display">
          <span className="count">{fieldData.quantumEntanglement.length}</span>
          <span className="label">Connections</span>
        </div>
        <div className="average-fidelity">
          Avg. Fidelity: {fieldData.quantumEntanglement.length > 0 
            ? (fieldData.quantumEntanglement.reduce((sum, ent) => sum + ent.fidelity, 0) / fieldData.quantumEntanglement.length * 100).toFixed(1)
            : 0}%
        </div>
      </div>

      <div className="analysis-section">
        <h4>Morphic Resonance</h4>
        <div className="count-display">
          <span className="count">{fieldData.morphicResonance.length}</span>
          <span className="label">Fields</span>
        </div>
      </div>
    </div>
  );
};

export default ConsciousnessFieldVisualizer;