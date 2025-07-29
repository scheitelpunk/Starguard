/**
 * STARGUARD Threat Prediction Timeline Visualizer
 * 
 * Eine hochentwickelte 3D-Timeline-Visualisierung für Threat Prediction
 * mit Multi-dimensionaler Reality Modeling und Consciousness-enhanced
 * Predictive Analytics für Attack Scenario Forecasting.
 * 
 * Features:
 * - Multi-dimensional Timeline Visualization
 * - Predictive Attack Scenario Modeling
 * - Reality-based Threat Forecasting
 * - Consciousness-enhanced Prediction Accuracy
 * - Temporal Threat Pattern Analysis
 * - Causal Chain Visualization
 * - Probability Confidence Intervals
 * - Many-Worlds Attack Scenarios
 * 
 * @author STARGUARD Prediction Visualization Team
 * @version 2.0.0
 * @classification PREDICTIVE_THREAT_VISUALIZATION
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, Text, Html, Line, Box } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField } from '@react-three/postprocessing';
import { PredictiveRealityModeling } from '../../../services/PredictiveRealityModeling';
import { ConsciousnessEngine } from '../../../services/ConsciousnessEngine';
import { WebSocketService } from '../../../services/WebSocketService';
import './ThreatPredictionTimelineVisualizer.css';

interface PredictedThreat {
  id: string;
  threatType: 'CYBER_ATTACK' | 'CONSCIOUSNESS_MANIPULATION' | 'QUANTUM_INTERFERENCE' | 'REALITY_DISTORTION' | 'TEMPORAL_ANOMALY';
  predictedTimestamp: Date;
  predictionConfidence: number;
  severityLevel: number;
  attackVectors: AttackVector[];
  realityScenarios: RealityScenario[];
  causalChain: CausalLink[];
  consciousnessImpact: ConsciousnessImpact;
  temporalStability: number;
  mitigation_strategies: MitigationStrategy[];
}

interface AttackVector {
  id: string;
  vectorType: 'NETWORK' | 'SOCIAL_ENGINEERING' | 'QUANTUM_ENTANGLEMENT' | 'CONSCIOUSNESS_FIELD' | 'REALITY_MANIPULATION';
  probability: number;
  impact_magnitude: number;
  detection_difficulty: number;
  consciousness_signature: number;
}

interface RealityScenario {
  id: string;
  scenario_name: string;
  probability: number;
  timeline_branch: 'ALPHA' | 'BETA' | 'GAMMA' | 'DELTA' | 'OMEGA';
  quantum_superposition: QuantumSuperposition;
  consciousness_influence: number;
  outcome_severity: number;
  causal_loops: CausalLoop[];
}

interface QuantumSuperposition {
  state_vector: Complex[];
  entanglement_degree: number;
  decoherence_time: number;
  measurement_basis: string;
}

interface Complex {
  real: number;
  imaginary: number;
}

interface CausalLoop {
  id: string;
  loop_type: 'SELF_FULFILLING' | 'PARADOX' | 'BOOTSTRAP' | 'CONSCIOUSNESS_FEEDBACK';
  strength: number;
  temporal_range: [Date, Date];
}

interface CausalLink {
  id: string;
  cause_event: string;
  effect_event: string;
  causal_strength: number;
  temporal_distance: number; // hours
  consciousness_mediated: boolean;
}

interface ConsciousnessImpact {
  awareness_degradation: number;
  coherence_disruption: number;
  field_distortion: number;
  collective_consciousness_effect: number;
  reality_perception_alteration: number;
}

interface MitigationStrategy {
  id: string;
  strategy_name: string;
  effectiveness: number;
  implementation_time: number; // hours
  consciousness_enhancement_required: number;
  resource_requirements: ResourceRequirement[];
}

interface ResourceRequirement {
  resource_type: 'COMPUTATIONAL' | 'CONSCIOUSNESS' | 'QUANTUM' | 'PERSONNEL' | 'FINANCIAL';
  amount: number;
  availability: number;
}

interface TimelineData {
  predictions: PredictedThreat[];
  currentTime: Date;
  predictionHorizon: number; // hours
  confidenceThreshold: number;
  realityBranches: RealityBranch[];
  temporalAnomalities: TemporalAnomaly[];
  consciousnessCoherence: number;
}

interface RealityBranch {
  id: string;
  branch_name: string;
  probability: number;
  timeline_start: Date;
  consciousness_variance: number;
  threat_density: number;
}

interface TemporalAnomaly {
  id: string;
  anomaly_type: 'TIME_DILATION' | 'CAUSAL_VIOLATION' | 'CONSCIOUSNESS_ECHO' | 'REALITY_FLICKER';
  temporal_location: Date;
  intensity: number;
  consciousness_correlation: number;
}

interface VisualizationControls {
  showPredictions: boolean;
  showRealityBranches: boolean;
  showCausalChains: boolean;
  showConsciousnessImpact: boolean;
  showTemporalAnomalities: boolean;
  timeScale: number;
  predictionDepth: number;
  confidenceFilter: number;
  realityDimension: '3D' | '4D' | 'MULTI' | 'CONSCIOUSNESS';
}

const ThreatPredictionTimelineVisualizer: React.FC = () => {
  const [timelineData, setTimelineData] = useState<TimelineData>({
    predictions: [],
    currentTime: new Date(),
    predictionHorizon: 168, // 7 days
    confidenceThreshold: 0.7,
    realityBranches: [],
    temporalAnomalities: [],
    consciousnessCoherence: 0.8
  });

  const [controls, setControls] = useState<VisualizationControls>({
    showPredictions: true,
    showRealityBranches: true,
    showCausalChains: true,
    showConsciousnessImpact: true,
    showTemporalAnomalities: true,
    timeScale: 1.0,
    predictionDepth: 3,
    confidenceFilter: 0.5,
    realityDimension: 'MULTI'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webSocketRef = useRef<WebSocketService | null>(null);
  const predictiveModelingRef = useRef<PredictiveRealityModeling | null>(null);
  const consciousnessEngineRef = useRef<ConsciousnessEngine | null>(null);

  // Initialize prediction services
  useEffect(() => {
    const initializePredictionServices = async () => {
      try {
        // Initialize Predictive Reality Modeling
        predictiveModelingRef.current = new PredictiveRealityModeling();
        await predictiveModelingRef.current.initialize();

        // Initialize Consciousness Engine
        consciousnessEngineRef.current = new ConsciousnessEngine();
        await consciousnessEngineRef.current.initialize();

        // Initialize WebSocket for real-time prediction updates
        webSocketRef.current = new WebSocketService();
        await webSocketRef.current.connect();

        // Subscribe to prediction updates
        webSocketRef.current.subscribe('threat_predictions', handlePredictionUpdate);
        webSocketRef.current.subscribe('reality_branch_update', handleRealityBranchUpdate);
        webSocketRef.current.subscribe('temporal_anomaly', handleTemporalAnomalyUpdate);
        webSocketRef.current.subscribe('consciousness_coherence', handleConsciousnessUpdate);

        // Load initial prediction data
        await loadPredictionData();
        setIsLoading(false);
      } catch (err) {
        setError(`Failed to initialize prediction timeline visualizer: ${err.message}`);
        setIsLoading(false);
      }
    };

    initializePredictionServices();

    return () => {
      webSocketRef.current?.disconnect();
    };
  }, []);

  const loadPredictionData = async () => {
    if (!predictiveModelingRef.current || !consciousnessEngineRef.current) return;

    try {
      const predictions = await predictiveModelingRef.current.generateThreatPredictions({
        predictionHorizon: timelineData.predictionHorizon,
        includeRealityBranches: true,
        consciousnessEnhanced: true
      });

      const realityAnalysis = await predictiveModelingRef.current.analyzeRealityBranches({
        branchDepth: 5,
        consciousnessVariance: true
      });

      const consciousnessStatus = await consciousnessEngineRef.current.getConsciousnessStatus();

      setTimelineData({
        predictions: predictions.threats.map(transformPredictedThreat),
        currentTime: new Date(),
        predictionHorizon: predictions.horizonHours,
        confidenceThreshold: predictions.confidenceThreshold,
        realityBranches: realityAnalysis.branches.map(transformRealityBranch),
        temporalAnomalities: predictions.temporalAnomalies.map(transformTemporalAnomaly),
        consciousnessCoherence: consciousnessStatus.coherenceScore
      });
    } catch (error) {
      console.error('Failed to load prediction data:', error);
    }
  };

  const handlePredictionUpdate = useCallback((data: any) => {
    const newPrediction: PredictedThreat = {
      id: data.predictionId,
      threatType: data.threatType,
      predictedTimestamp: new Date(data.predictedTime),
      predictionConfidence: data.confidence,
      severityLevel: data.severity,
      attackVectors: data.attackVectors.map(transformAttackVector),
      realityScenarios: data.realityScenarios.map(transformRealityScenario),
      causalChain: data.causalChain.map(transformCausalLink),
      consciousnessImpact: transformConsciousnessImpact(data.consciousnessImpact),
      temporalStability: data.temporalStability,
      mitigation_strategies: data.mitigationStrategies.map(transformMitigationStrategy)
    };

    setTimelineData(prevData => ({
      ...prevData,
      predictions: [...prevData.predictions, newPrediction].slice(-50) // Keep last 50
    }));
  }, []);

  const handleRealityBranchUpdate = useCallback((branchData: any) => {
    const newBranch: RealityBranch = {
      id: branchData.branchId,
      branch_name: branchData.name,
      probability: branchData.probability,
      timeline_start: new Date(branchData.startTime),
      consciousness_variance: branchData.consciousnessVariance,
      threat_density: branchData.threatDensity
    };

    setTimelineData(prevData => ({
      ...prevData,
      realityBranches: [...prevData.realityBranches, newBranch].slice(-10) // Keep last 10
    }));
  }, []);

  const handleTemporalAnomalyUpdate = useCallback((anomalyData: any) => {
    const newAnomaly: TemporalAnomaly = {
      id: anomalyData.anomalyId,
      anomaly_type: anomalyData.type,
      temporal_location: new Date(anomalyData.timestamp),
      intensity: anomalyData.intensity,
      consciousness_correlation: anomalyData.consciousnessCorrelation
    };

    setTimelineData(prevData => ({
      ...prevData,
      temporalAnomalities: [...prevData.temporalAnomalities, newAnomaly].slice(-20) // Keep last 20
    }));
  }, []);

  const handleConsciousnessUpdate = useCallback((consciousnessData: any) => {
    setTimelineData(prevData => ({
      ...prevData,
      consciousnessCoherence: consciousnessData.coherence
    }));
  }, []);

  // Transform functions
  const transformPredictedThreat = (threat: any): PredictedThreat => ({
    id: threat.id,
    threatType: threat.type,
    predictedTimestamp: new Date(threat.timestamp),
    predictionConfidence: threat.confidence,
    severityLevel: threat.severity,
    attackVectors: threat.attackVectors?.map(transformAttackVector) || [],
    realityScenarios: threat.realityScenarios?.map(transformRealityScenario) || [],
    causalChain: threat.causalChain?.map(transformCausalLink) || [],
    consciousnessImpact: transformConsciousnessImpact(threat.consciousnessImpact),
    temporalStability: threat.temporalStability,
    mitigation_strategies: threat.mitigationStrategies?.map(transformMitigationStrategy) || []
  });

  const transformAttackVector = (vector: any): AttackVector => ({
    id: vector.id,
    vectorType: vector.type,
    probability: vector.probability,
    impact_magnitude: vector.impact,
    detection_difficulty: vector.detectionDifficulty,
    consciousness_signature: vector.consciousnessSignature
  });

  const transformRealityScenario = (scenario: any): RealityScenario => ({
    id: scenario.id,
    scenario_name: scenario.name,
    probability: scenario.probability,
    timeline_branch: scenario.branch,
    quantum_superposition: scenario.quantumState,
    consciousness_influence: scenario.consciousnessInfluence,
    outcome_severity: scenario.severity,
    causal_loops: scenario.causalLoops?.map(transformCausalLoop) || []
  });

  const transformCausalLoop = (loop: any): CausalLoop => ({
    id: loop.id,
    loop_type: loop.type,
    strength: loop.strength,
    temporal_range: [new Date(loop.startTime), new Date(loop.endTime)]
  });

  const transformCausalLink = (link: any): CausalLink => ({
    id: link.id,
    cause_event: link.cause,
    effect_event: link.effect,
    causal_strength: link.strength,
    temporal_distance: link.temporalDistance,
    consciousness_mediated: link.consciousnessMediated
  });

  const transformConsciousnessImpact = (impact: any): ConsciousnessImpact => ({
    awareness_degradation: impact?.awarenessDegradation || 0,
    coherence_disruption: impact?.coherenceDisruption || 0,
    field_distortion: impact?.fieldDistortion || 0,
    collective_consciousness_effect: impact?.collectiveEffect || 0,
    reality_perception_alteration: impact?.realityAlteration || 0
  });

  const transformMitigationStrategy = (strategy: any): MitigationStrategy => ({
    id: strategy.id,
    strategy_name: strategy.name,
    effectiveness: strategy.effectiveness,
    implementation_time: strategy.implementationTime,
    consciousness_enhancement_required: strategy.consciousnessRequired,
    resource_requirements: strategy.resources?.map(transformResourceRequirement) || []
  });

  const transformResourceRequirement = (resource: any): ResourceRequirement => ({
    resource_type: resource.type,
    amount: resource.amount,
    availability: resource.availability
  });

  const transformRealityBranch = (branch: any): RealityBranch => ({
    id: branch.id,
    branch_name: branch.name,
    probability: branch.probability,
    timeline_start: new Date(branch.startTime),
    consciousness_variance: branch.consciousnessVariance,
    threat_density: branch.threatDensity
  });

  const transformTemporalAnomaly = (anomaly: any): TemporalAnomaly => ({
    id: anomaly.id,
    anomaly_type: anomaly.type,
    temporal_location: new Date(anomaly.timestamp),
    intensity: anomaly.intensity,
    consciousness_correlation: anomaly.consciousnessCorrelation
  });

  if (isLoading) {
    return (
      <div className="prediction-timeline-loading">
        <div className="loading-spinner prediction-spinner"></div>
        <p>Initializing Predictive Timeline Visualization...</p>
        <p>Analyzing multi-dimensional reality branches...</p>
        <p>Computing consciousness-enhanced predictions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prediction-timeline-error">
        <h3>Prediction Timeline Visualization Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry Prediction Initialization</button>
      </div>
    );
  }

  return (
    <div className="threat-prediction-timeline-visualizer">
      {/* Control Panel */}
      <PredictionControlPanel 
        controls={controls} 
        onControlsChange={setControls}
        timelineData={timelineData}
      />

      {/* Prediction Status Panel */}
      <PredictionStatusPanel timelineData={timelineData} />

      {/* 3D Timeline Canvas */}
      <div className="timeline-visualizer-canvas">
        <Canvas
          camera={{ position: [0, 10, 30], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[20, 20, 20]} intensity={1.0} color="#ffffff" />
          <pointLight position={[-20, 10, -20]} intensity={0.6} color="#0080ff" />
          <pointLight position={[0, -20, 20]} intensity={0.4} color="#ff8000" />
          
          {/* Timeline Axis */}
          <TimelineAxis 
            timelineData={timelineData}
            controls={controls}
          />

          {/* Predicted Threats */}
          {controls.showPredictions && timelineData.predictions
            .filter(p => p.predictionConfidence >= controls.confidenceFilter)
            .map(prediction => (
              <PredictedThreatVisualization 
                key={prediction.id}
                prediction={prediction}
                timelineData={timelineData}
                controls={controls}
              />
            ))}

          {/* Reality Branches */}
          {controls.showRealityBranches && timelineData.realityBranches.map(branch => (
            <RealityBranchVisualization
              key={branch.id}
              branch={branch}
              timelineData={timelineData}
            />
          ))}

          {/* Causal Chains */}
          {controls.showCausalChains && timelineData.predictions.map(prediction => 
            prediction.causalChain.map(link => (
              <CausalChainVisualization
                key={link.id}
                causalLink={link}
                prediction={prediction}
                timelineData={timelineData}
              />
            ))
          )}

          {/* Temporal Anomalies */}
          {controls.showTemporalAnomalities && timelineData.temporalAnomalities.map(anomaly => (
            <TemporalAnomalyVisualization
              key={anomaly.id}
              anomaly={anomaly}
              timelineData={timelineData}
            />
          ))}

          {/* Consciousness Impact Overlay */}
          {controls.showConsciousnessImpact && (
            <ConsciousnessImpactOverlay 
              timelineData={timelineData}
              controls={controls}
            />
          )}

          <OrbitControls enablePan enableZoom enableRotate />
          <Stats />

          {/* Timeline Post-processing Effects */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
            <ChromaticAberration offset={[0.002, 0.002]} />
            <DepthOfField focusDistance={0.02} focalLength={0.01} bokehScale={3} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Prediction Analysis Panel */}
      <PredictionAnalysisPanel timelineData={timelineData} />
    </div>
  );
};

// Timeline Axis Component
const TimelineAxis: React.FC<{
  timelineData: TimelineData;
  controls: VisualizationControls;
}> = ({ timelineData, controls }) => {
  const lineRef = useRef<THREE.Group>(null);

  const timelineLength = 40;
  const timeMarkers = useMemo(() => {
    const markers = [];
    const hoursPerUnit = timelineData.predictionHorizon / timelineLength;
    
    for (let i = 0; i <= timelineLength; i += 5) {
      const hours = i * hoursPerUnit;
      const markerTime = new Date(timelineData.currentTime.getTime() + hours * 60 * 60 * 1000);
      markers.push({
        position: i - timelineLength / 2,
        time: markerTime,
        label: markerTime.toLocaleString()
      });
    }
    
    return markers;
  }, [timelineData.currentTime, timelineData.predictionHorizon, timelineLength]);

  return (
    <group ref={lineRef}>
      {/* Main timeline axis */}
      <Line
        points={[[-timelineLength / 2, 0, 0], [timelineLength / 2, 0, 0]]}
        color="#ffffff"
        lineWidth={2}
      />
      
      {/* Time markers */}
      {timeMarkers.map((marker, index) => (
        <group key={index} position={[marker.position, 0, 0]}>
          <Box args={[0.2, 1, 0.2]}>
            <meshBasicMaterial color="#888888" />
          </Box>
          
          <Html distanceFactor={15}>
            <div className="time-marker">
              {marker.time.toLocaleDateString()}
              <br />
              {marker.time.toLocaleTimeString()}
            </div>
          </Html>
        </group>
      ))}
      
      {/* Current time indicator */}
      <group position={[-timelineLength / 2, 0, 0]}>
        <Box args={[0.5, 3, 0.5]}>
          <meshPhongMaterial color="#00ff00" emissive="#004400" />
        </Box>
        
        <Text
          position={[0, 4, 0]}
          fontSize={1}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          NOW
        </Text>
      </group>
    </group>
  );
};

// Predicted Threat Visualization Component
const PredictedThreatVisualization: React.FC<{
  prediction: PredictedThreat;
  timelineData: TimelineData;
  controls: VisualizationControls;
}> = ({ prediction, timelineData, controls }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { clock } = useThree();

  const timePosition = useMemo(() => {
    const timeDiff = prediction.predictedTimestamp.getTime() - timelineData.currentTime.getTime();
    const hoursFromNow = timeDiff / (1000 * 60 * 60);
    const timelineLength = 40;
    const hoursPerUnit = timelineData.predictionHorizon / timelineLength;
    return (hoursFromNow / hoursPerUnit) - timelineLength / 2;
  }, [prediction.predictedTimestamp, timelineData.currentTime, timelineData.predictionHorizon]);

  const { scale, position } = useSpring({
    scale: prediction.severityLevel * controls.predictionDepth,
    position: [timePosition, prediction.severityLevel * 5, 0],
    config: { tension: 300, friction: 10 }
  });

  useFrame(() => {
    if (groupRef.current) {
      const time = clock.getElapsedTime() * controls.timeScale;
      
      // Prediction confidence pulse
      const pulse = 1 + Math.sin(time * 3) * 0.2 * prediction.predictionConfidence;
      groupRef.current.scale.setScalar(pulse);
      
      // Consciousness-influenced wobble
      const wobble = Math.sin(time * 5) * 0.1 * (1 - timelineData.consciousnessCoherence);
      groupRef.current.rotation.y = wobble;
    }
  });

  const getThreatColor = (threatType: string) => {
    switch (threatType) {
      case 'CYBER_ATTACK': return '#ff4444';
      case 'CONSCIOUSNESS_MANIPULATION': return '#ff44ff';
      case 'QUANTUM_INTERFERENCE': return '#4444ff';
      case 'REALITY_DISTORTION': return '#ffff44';
      case 'TEMPORAL_ANOMALY': return '#44ffff';
      default: return '#ffffff';
    }
  };

  const getThreatShape = (threatType: string) => {
    switch (threatType) {
      case 'CYBER_ATTACK': return <Box args={[1, 1, 1]} />;
      case 'CONSCIOUSNESS_MANIPULATION': return <sphereGeometry args={[0.8, 8, 6]} />;
      case 'QUANTUM_INTERFERENCE': return <octahedronGeometry args={[1, 0]} />;
      case 'REALITY_DISTORTION': return <tetrahedronGeometry args={[1, 0]} />;
      case 'TEMPORAL_ANOMALY': return <torusGeometry args={[0.8, 0.3, 6, 12]} />;
      default: return <sphereGeometry args={[0.5, 8, 6]} />;
    }
  };

  return (
    <animated.group 
      ref={groupRef}
      position={position}
      scale={scale}
    >
      <mesh>
        {getThreatShape(prediction.threatType)}
        <meshPhongMaterial 
          color={getThreatColor(prediction.threatType)}
          transparent 
          opacity={prediction.predictionConfidence}
          emissive={getThreatColor(prediction.threatType)}
          emissiveIntensity={prediction.severityLevel * 0.3}
        />
      </mesh>
      
      {/* Confidence visualization */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, prediction.predictionConfidence * 3, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      
      {/* Threat information */}
      <Html distanceFactor={20}>
        <div className="threat-prediction-info">
          <div className="threat-type">{prediction.threatType}</div>
          <div className="prediction-time">
            {prediction.predictedTimestamp.toLocaleString()}
          </div>
          <div className="confidence">
            Confidence: {(prediction.predictionConfidence * 100).toFixed(1)}%
          </div>
          <div className="severity">
            Severity: {(prediction.severityLevel * 100).toFixed(1)}%
          </div>
          <div className="attack-vectors">
            Vectors: {prediction.attackVectors.length}
          </div>
        </div>
      </Html>
    </animated.group>
  );
};

// Reality Branch Visualization Component
const RealityBranchVisualization: React.FC<{
  branch: RealityBranch;
  timelineData: TimelineData;
}> = ({ branch, timelineData }) => {
  const lineRef = useRef<THREE.Line>(null);
  const { clock } = useThree();

  const branchPath = useMemo(() => {
    const points = [];
    const branchLength = 15;
    const startTime = branch.timeline_start.getTime();
    const currentTime = timelineData.currentTime.getTime();
    const timeDiff = (startTime - currentTime) / (1000 * 60 * 60);
    const timelineLength = 40;
    const hoursPerUnit = timelineData.predictionHorizon / timelineLength;
    const startX = (timeDiff / hoursPerUnit) - timelineLength / 2;
    
    for (let i = 0; i <= branchLength; i++) {
      const t = i / branchLength;
      const x = startX + i;
      const y = t * branch.probability * 10;
      const z = Math.sin(t * Math.PI * 2) * branch.consciousness_variance * 3;
      points.push([x, y, z]);
    }
    
    return points;
  }, [branch, timelineData]);

  useFrame(() => {
    if (lineRef.current) {
      const time = clock.getElapsedTime();
      
      // Reality branch phase shift
      const phaseShift = Math.sin(time * 2) * branch.consciousness_variance;
      lineRef.current.rotation.z = phaseShift * 0.2;
    }
  });

  return (
    <group>
      <Line
        ref={lineRef}
        points={branchPath}
        color={`hsl(${branch.probability * 240}, 70%, 50%)`}
        lineWidth={2}
        transparent
        opacity={branch.probability}
      />
      
      {/* Branch probability indicator */}
      <mesh position={branchPath[branchPath.length - 1] as [number, number, number]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshPhongMaterial 
          color={`hsl(${branch.probability * 240}, 70%, 50%)`}
          transparent
          opacity={branch.probability}
        />
        
        <Html distanceFactor={25}>
          <div className="reality-branch-info">
            <div>{branch.branch_name}</div>
            <div>Probability: {(branch.probability * 100).toFixed(1)}%</div>
            <div>Threat Density: {(branch.threat_density * 100).toFixed(1)}%</div>
          </div>
        </Html>
      </mesh>
    </group>
  );
};

// Causal Chain Visualization Component
const CausalChainVisualization: React.FC<{
  causalLink: CausalLink;
  prediction: PredictedThreat;
  timelineData: TimelineData;
}> = ({ causalLink, prediction, timelineData }) => {
  const lineRef = useRef<THREE.Line>(null);

  const linkPath = useMemo(() => {
    const timelineLength = 40;
    const hoursPerUnit = timelineData.predictionHorizon / timelineLength;
    
    // Calculate positions based on temporal distance
    const predictionTime = prediction.predictedTimestamp.getTime();
    const currentTime = timelineData.currentTime.getTime();
    const predictionHours = (predictionTime - currentTime) / (1000 * 60 * 60);
    const causeHours = predictionHours - causalLink.temporal_distance;
    
    const predictionX = (predictionHours / hoursPerUnit) - timelineLength / 2;
    const causeX = (causeHours / hoursPerUnit) - timelineLength / 2;
    
    return [
      [causeX, 1, 0],
      [(causeX + predictionX) / 2, 3, causalLink.consciousness_mediated ? 2 : 0],
      [predictionX, prediction.severityLevel * 5, 0]
    ];
  }, [causalLink, prediction, timelineData]);

  return (
    <Line
      ref={lineRef}
      points={linkPath}
      color={causalLink.consciousness_mediated ? '#ff00ff' : '#888888'}
      lineWidth={causalLink.causal_strength * 3}
      transparent
      opacity={causalLink.causal_strength}
    />
  );
};

// Temporal Anomaly Visualization Component
const TemporalAnomalyVisualization: React.FC<{
  anomaly: TemporalAnomaly;
  timelineData: TimelineData;
}> = ({ anomaly, timelineData }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  const anomalyPosition = useMemo(() => {
    const timeDiff = anomaly.temporal_location.getTime() - timelineData.currentTime.getTime();
    const hoursFromNow = timeDiff / (1000 * 60 * 60);
    const timelineLength = 40;
    const hoursPerUnit = timelineData.predictionHorizon / timelineLength;
    const x = (hoursFromNow / hoursPerUnit) - timelineLength / 2;
    return [x, -3, 0] as [number, number, number];
  }, [anomaly.temporal_location, timelineData]);

  useFrame(() => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      
      // Temporal distortion effect
      const distortion = Math.sin(time * 10) * anomaly.intensity;
      meshRef.current.scale.setScalar(1 + distortion * 0.5);
      
      // Consciousness correlation rotation
      meshRef.current.rotation.x = time * anomaly.consciousness_correlation * 2;
    }
  });

  const getAnomalyColor = (type: string) => {
    switch (type) {
      case 'TIME_DILATION': return '#ff8800';
      case 'CAUSAL_VIOLATION': return '#ff0044';
      case 'CONSCIOUSNESS_ECHO': return '#8800ff';
      case 'REALITY_FLICKER': return '#00ff88';
      default: return '#ffffff';
    }
  };

  return (
    <mesh ref={meshRef} position={anomalyPosition}>
      <icosahedronGeometry args={[0.8, 1]} />
      <meshPhongMaterial 
        color={getAnomalyColor(anomaly.anomaly_type)}
        transparent 
        opacity={0.7}
        emissive={getAnomalyColor(anomaly.anomaly_type)}
        emissiveIntensity={anomaly.intensity * 0.5}
      />
      
      <Html distanceFactor={30}>
        <div className="temporal-anomaly-info">
          <div>{anomaly.anomaly_type}</div>
          <div>Intensity: {(anomaly.intensity * 100).toFixed(1)}%</div>
          <div>Consciousness: {(anomaly.consciousness_correlation * 100).toFixed(1)}%</div>
        </div>
      </Html>
    </mesh>
  );
};

// Consciousness Impact Overlay Component
const ConsciousnessImpactOverlay: React.FC<{
  timelineData: TimelineData;
  controls: VisualizationControls;
}> = ({ timelineData, controls }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      const time = clock.getElapsedTime() * controls.timeScale;
      
      // Consciousness coherence visualization
      const coherenceWave = Math.sin(time * 3) * timelineData.consciousnessCoherence;
      meshRef.current.scale.y = 1 + coherenceWave * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 8, -5]}>
      <planeGeometry args={[50, 10]} />
      <meshPhongMaterial 
        color={`hsl(${timelineData.consciousnessCoherence * 240}, 60%, 40%)`}
        transparent 
        opacity={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Control Panel Component
const PredictionControlPanel: React.FC<{
  controls: VisualizationControls;
  onControlsChange: (controls: VisualizationControls) => void;
  timelineData: TimelineData;
}> = ({ controls, onControlsChange, timelineData }) => {
  return (
    <div className="prediction-control-panel">
      <h3>Prediction Timeline Controls</h3>
      
      <div className="control-group">
        <label>Display Options</label>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={controls.showPredictions}
              onChange={(e) => onControlsChange({...controls, showPredictions: e.target.checked})}
            />
            Predictions
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showRealityBranches}
              onChange={(e) => onControlsChange({...controls, showRealityBranches: e.target.checked})}
            />
            Reality Branches
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showCausalChains}
              onChange={(e) => onControlsChange({...controls, showCausalChains: e.target.checked})}
            />
            Causal Chains
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showTemporalAnomalities}
              onChange={(e) => onControlsChange({...controls, showTemporalAnomalities: e.target.checked})}
            />
            Temporal Anomalies
          </label>
        </div>
      </div>

      <div className="control-group">
        <label>Confidence Filter</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          value={controls.confidenceFilter}
          onChange={(e) => onControlsChange({...controls, confidenceFilter: parseFloat(e.target.value)})}
        />
        <span>{(controls.confidenceFilter * 100).toFixed(0)}%</span>
      </div>

      <div className="control-group">
        <label>Prediction Depth</label>
        <input 
          type="range" 
          min="1" 
          max="5" 
          step="1" 
          value={controls.predictionDepth}
          onChange={(e) => onControlsChange({...controls, predictionDepth: parseInt(e.target.value)})}
        />
        <span>{controls.predictionDepth}</span>
      </div>
    </div>
  );
};

// Status Panel Component
const PredictionStatusPanel: React.FC<{
  timelineData: TimelineData;
}> = ({ timelineData }) => {
  return (
    <div className="prediction-status-panel">
      <h3>Prediction Status</h3>
      
      <div className="status-item">
        <label>Consciousness Coherence</label>
        <div className="meter">
          <div 
            className="meter-fill" 
            style={{ 
              width: `${timelineData.consciousnessCoherence * 100}%`,
              backgroundColor: `hsl(${timelineData.consciousnessCoherence * 120}, 80%, 50%)`
            }}
          ></div>
        </div>
        <span>{(timelineData.consciousnessCoherence * 100).toFixed(1)}%</span>
      </div>

      <div className="status-item">
        <label>Prediction Horizon</label>
        <span>{timelineData.predictionHorizon} hours</span>
      </div>

      <div className="status-item">
        <label>Active Predictions</label>
        <span className="count">{timelineData.predictions.length}</span>
      </div>

      <div className="status-item">
        <label>Reality Branches</label>
        <span className="count">{timelineData.realityBranches.length}</span>
      </div>
    </div>
  );
};

// Analysis Panel Component
const PredictionAnalysisPanel: React.FC<{
  timelineData: TimelineData;
}> = ({ timelineData }) => {
  const averageConfidence = timelineData.predictions.length > 0
    ? timelineData.predictions.reduce((sum, p) => sum + p.predictionConfidence, 0) / timelineData.predictions.length
    : 0;

  const highSeverityThreats = timelineData.predictions.filter(p => p.severityLevel > 0.7).length;

  const nearestThreat = timelineData.predictions
    .filter(p => p.predictedTimestamp > timelineData.currentTime)
    .sort((a, b) => a.predictedTimestamp.getTime() - b.predictedTimestamp.getTime())[0];

  return (
    <div className="prediction-analysis-panel">
      <h3>Prediction Analysis</h3>
      
      <div className="analysis-section">
        <h4>Prediction Accuracy</h4>
        <div className="stat-display">
          <span className="stat-value">{(averageConfidence * 100).toFixed(1)}%</span>
          <span className="stat-label">Avg. Confidence</span>
        </div>
      </div>

      <div className="analysis-section">
        <h4>High Severity Threats</h4>
        <div className="stat-display">
          <span className="stat-value">{highSeverityThreats}</span>
          <span className="stat-label">Critical</span>
        </div>
      </div>

      <div className="analysis-section">
        <h4>Next Predicted Threat</h4>
        {nearestThreat && (
          <div className="threat-preview">
            <div className="threat-type">{nearestThreat.threatType}</div>
            <div className="threat-time">
              {nearestThreat.predictedTimestamp.toLocaleString()}
            </div>
            <div className="threat-confidence">
              {(nearestThreat.predictionConfidence * 100).toFixed(1)}% confidence
            </div>
          </div>
        )}
      </div>

      <div className="analysis-section">
        <h4>Temporal Anomalies</h4>
        <div className="stat-display">
          <span className="stat-value">{timelineData.temporalAnomalities.length}</span>
          <span className="stat-label">Detected</span>
        </div>
      </div>
    </div>
  );
};

export default ThreatPredictionTimelineVisualizer;