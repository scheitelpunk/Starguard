/**
 * STARGUARD Evolutionary Algorithm Progress Visualizer
 * 
 * Eine hochentwickelte 3D-Visualisierung des Evolutionary Algorithm Enhancement
 * mit Real-time Evolution Monitoring und Consciousness-guided Genetic Algorithm
 * Progress Tracking für Self-improving Threat Patterns.
 * 
 * Features:
 * - Real-time Evolutionary Population Visualization
 * - Fitness Landscape 3D Mapping
 * - Genetic Diversity Tracking
 * - Consciousness-guided Selection Process
 * - Multi-objective Optimization Display
 * - Mutation and Crossover Visualization
 * - Evolutionary History Timeline
 * - Adaptive Parameter Monitoring
 * 
 * @author STARGUARD Evolutionary Visualization Team
 * @version 2.0.0
 * @classification EVOLUTIONARY_ALGORITHM_VISUALIZATION
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, Text, Html, Line, Sphere, Box } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { EffectComposer, Bloom, ChromaticAberration, SSR } from '@react-three/postprocessing';
import { EvolutionaryAlgorithmEnhancement } from '../../../services/EvolutionaryAlgorithmEnhancement';
import { ConsciousnessEngine } from '../../../services/ConsciousnessEngine';
import { WebSocketService } from '../../../services/WebSocketService';
import './EvolutionaryAlgorithmProgressVisualizer.css';

interface EvolutionaryIndividual {
  id: string;
  generation: number;
  fitness: FitnessScore;
  genome: Genome;
  position: [number, number, number];
  consciousness_attributes: ConsciousnessAttributes;
  evolutionary_history: EvolutionaryHistory;
  quantum_signature: QuantumSignature;
  morphic_resonance: MorphicResonance;
  adaptation_memory: AdaptationMemory;
}

interface FitnessScore {
  overall_fitness: number;
  threat_detection_accuracy: number;
  false_positive_rate: number;
  computational_efficiency: number;
  consciousness_enhancement: number;
  quantum_coherence: number;
  adaptation_speed: number;
  pattern_recognition: number;
}

interface Genome {
  chromosome_count: number;
  gene_expression: number[];
  consciousness_genes: ConsciousnessGene[];
  quantum_entangled_genes: QuantumGene[];
  morphic_pattern_genes: MorphicGene[];
  regulatory_network: RegulatoryNetwork;
}

interface ConsciousnessGene {
  id: string;
  awareness_factor: number;
  coherence_influence: number;
  field_sensitivity: number;
  consciousness_amplification: number;
}

interface QuantumGene {
  id: string;
  entanglement_strength: number;
  superposition_capability: number;
  decoherence_resistance: number;
  quantum_computation_efficiency: number;
}

interface MorphicGene {
  id: string;
  pattern_signature: string;
  resonance_frequency: number;
  field_coupling: number;
  collective_memory_connection: number;
}

interface RegulatoryNetwork {
  gene_interactions: GeneInteraction[];
  expression_levels: number[];
  feedback_loops: FeedbackLoop[];
  consciousness_regulation: ConsciousnessRegulation;
}

interface GeneInteraction {
  gene_a: string;
  gene_b: string;
  interaction_type: 'ACTIVATION' | 'INHIBITION' | 'COOPERATION' | 'COMPETITION';
  strength: number;
  consciousness_mediated: boolean;
}

interface FeedbackLoop {
  id: string;
  loop_type: 'POSITIVE' | 'NEGATIVE' | 'OSCILLATORY' | 'CHAOTIC';
  participants: string[];
  loop_strength: number;
  stability: number;
}

interface ConsciousnessRegulation {
  awareness_threshold: number;
  coherence_maintenance: number;
  field_stabilization: number;
  consciousness_evolution_rate: number;
}

interface ConsciousnessAttributes {
  awareness_level: number;
  coherence_score: number;
  field_resonance: number;
  intuitive_processing: number;
  consciousness_bandwidth: number;
  collective_intelligence_connection: number;
}

interface EvolutionaryHistory {
  ancestor_lineage: string[];
  mutation_events: MutationEvent[];
  crossover_events: CrossoverEvent[];
  selection_pressures: SelectionPressure[];
  consciousness_guided_decisions: ConsciousnessDecision[];
}

interface MutationEvent {
  generation: number;
  mutation_type: 'POINT' | 'INSERTION' | 'DELETION' | 'INVERSION' | 'CONSCIOUSNESS_INDUCED';
  affected_genes: string[];
  mutation_strength: number;
  consciousness_influence: number;
}

interface CrossoverEvent {
  generation: number;
  crossover_type: 'SINGLE_POINT' | 'MULTI_POINT' | 'UNIFORM' | 'CONSCIOUSNESS_GUIDED';
  parent_a: string;
  parent_b: string;
  crossover_points: number[];
  consciousness_optimization: number;
}

interface SelectionPressure {
  pressure_type: 'ENVIRONMENTAL' | 'SEXUAL' | 'CONSCIOUSNESS' | 'QUANTUM' | 'MORPHIC';
  intensity: number;
  direction: 'STABILIZING' | 'DIRECTIONAL' | 'DISRUPTIVE';
  consciousness_influence: number;
}

interface ConsciousnessDecision {
  decision_type: 'MATE_SELECTION' | 'MUTATION_GUIDANCE' | 'FITNESS_EVALUATION' | 'SURVIVAL_CHOICE';
  consciousness_confidence: number;
  decision_outcome: string;
  field_coherence_impact: number;
}

interface QuantumSignature {
  entanglement_id: string;
  superposition_state: Complex[];
  coherence_time: number;
  measurement_basis: string;
  quantum_fitness_contribution: number;
}

interface Complex {
  real: number;
  imaginary: number;
}

interface MorphicResonance {
  pattern_signature: string;
  resonance_frequency: number;
  field_strength: number;
  collective_memory_access: number;
  morphic_inheritance: number;
}

interface AdaptationMemory {
  successful_adaptations: Adaptation[];
  failed_strategies: FailedStrategy[];
  environmental_patterns: EnvironmentalPattern[];
  consciousness_learning: ConsciousnessLearning;
}

interface Adaptation {
  adaptation_id: string;
  environmental_trigger: string;
  genetic_response: string[];
  adaptation_success: number;
  consciousness_facilitation: number;
}

interface FailedStrategy {
  strategy_id: string;
  failure_reason: string;
  fitness_penalty: number;
  learning_value: number;
}

interface EnvironmentalPattern {
  pattern_id: string;
  pattern_type: string;
  frequency: number;
  predictability: number;
  consciousness_recognition: number;
}

interface ConsciousnessLearning {
  learning_rate: number;
  pattern_recognition_improvement: number;
  decision_making_enhancement: number;
  collective_intelligence_integration: number;
}

interface PopulationData {
  individuals: EvolutionaryIndividual[];
  currentGeneration: number;
  populationSize: number;
  averageFitness: number;
  bestFitness: number;
  diversityIndex: number;
  consciousness_coherence: number;
  evolutionary_pressure: EvolutionaryPressure;
  fitness_landscape: FitnessLandscape;
  adaptation_rate: number;
}

interface EvolutionaryPressure {
  environmental_pressure: number;
  consciousness_pressure: number;
  quantum_pressure: number;
  morphic_pressure: number;
  selection_intensity: number;
}

interface FitnessLandscape {
  landscape_topology: LandscapePoint[];
  peaks: FitnessPeak[];
  valleys: FitnessValley[];
  consciousness_gradients: ConsciousnessGradient[];
  quantum_tunneling_paths: QuantumPath[];
}

interface LandscapePoint {
  position: [number, number];
  fitness_value: number;
  consciousness_influence: number;
  quantum_accessibility: number;
}

interface FitnessPeak {
  id: string;
  position: [number, number];
  height: number;
  stability: number;
  consciousness_attractiveness: number;
}

interface FitnessValley {
  id: string;
  position: [number, number];
  depth: number;
  escape_difficulty: number;
  consciousness_avoidance: number;
}

interface ConsciousnessGradient {
  start_position: [number, number];
  end_position: [number, number];
  gradient_strength: number;
  consciousness_flow: number;
}

interface QuantumPath {
  path_points: [number, number][];
  tunneling_probability: number;
  quantum_coherence_requirement: number;
  consciousness_facilitation: number;
}

interface VisualizationControls {
  showPopulation: boolean;
  showFitnessLandscape: boolean;
  showEvolutionHistory: boolean;
  showConsciousnessFlow: boolean;
  showQuantumEffects: boolean;
  showMorphicResonance: boolean;
  animationSpeed: number;
  populationScale: number;
  landscapeResolution: number;
  consciousnessFilter: number;
  generationRange: [number, number];
}

const EvolutionaryAlgorithmProgressVisualizer: React.FC = () => {
  const [populationData, setPopulationData] = useState<PopulationData>({
    individuals: [],
    currentGeneration: 0,
    populationSize: 0,
    averageFitness: 0,
    bestFitness: 0,
    diversityIndex: 0,
    consciousness_coherence: 0,
    evolutionary_pressure: {
      environmental_pressure: 0,
      consciousness_pressure: 0,
      quantum_pressure: 0,
      morphic_pressure: 0,
      selection_intensity: 0
    },
    fitness_landscape: {
      landscape_topology: [],
      peaks: [],
      valleys: [],
      consciousness_gradients: [],
      quantum_tunneling_paths: []
    },
    adaptation_rate: 0
  });

  const [controls, setControls] = useState<VisualizationControls>({
    showPopulation: true,
    showFitnessLandscape: true,
    showEvolutionHistory: true,
    showConsciousnessFlow: true,
    showQuantumEffects: true,
    showMorphicResonance: true,
    animationSpeed: 1.0,
    populationScale: 1.0,
    landscapeResolution: 50,
    consciousnessFilter: 0.5,
    generationRange: [0, 100]
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webSocketRef = useRef<WebSocketService | null>(null);
  const evolutionaryServiceRef = useRef<EvolutionaryAlgorithmEnhancement | null>(null);
  const consciousnessEngineRef = useRef<ConsciousnessEngine | null>(null);

  // Initialize evolutionary services
  useEffect(() => {
    const initializeEvolutionaryServices = async () => {
      try {
        // Initialize Evolutionary Algorithm Enhancement
        evolutionaryServiceRef.current = new EvolutionaryAlgorithmEnhancement();
        await evolutionaryServiceRef.current.initialize();

        // Initialize Consciousness Engine
        consciousnessEngineRef.current = new ConsciousnessEngine();
        await consciousnessEngineRef.current.initialize();

        // Initialize WebSocket for real-time evolution updates
        webSocketRef.current = new WebSocketService();
        await webSocketRef.current.connect();

        // Subscribe to evolutionary algorithm updates
        webSocketRef.current.subscribe('evolution_generation_complete', handleGenerationComplete);
        webSocketRef.current.subscribe('individual_birth', handleIndividualBirth);
        webSocketRef.current.subscribe('fitness_evaluation', handleFitnessEvaluation);
        webSocketRef.current.subscribe('consciousness_evolution', handleConsciousnessEvolution);
        webSocketRef.current.subscribe('adaptation_event', handleAdaptationEvent);

        // Load initial evolutionary data
        await loadEvolutionaryData();
        setIsLoading(false);
      } catch (err) {
        setError(`Failed to initialize evolutionary algorithm visualizer: ${err.message}`);
        setIsLoading(false);
      }
    };

    initializeEvolutionaryServices();

    return () => {
      webSocketRef.current?.disconnect();
    };
  }, []);

  const loadEvolutionaryData = async () => {
    if (!evolutionaryServiceRef.current || !consciousnessEngineRef.current) return;

    try {
      const evolutionStatus = await evolutionaryServiceRef.current.getEvolutionStatus();
      const populationAnalysis = await evolutionaryServiceRef.current.analyzePopulation();
      const fitnessLandscape = await evolutionaryServiceRef.current.getFitnessLandscape();
      const consciousnessStatus = await consciousnessEngineRef.current.getConsciousnessStatus();

      setPopulationData({
        individuals: evolutionStatus.population.map(transformEvolutionaryIndividual),
        currentGeneration: evolutionStatus.currentGeneration,
        populationSize: evolutionStatus.populationSize,
        averageFitness: populationAnalysis.averageFitness,
        bestFitness: populationAnalysis.bestFitness,
        diversityIndex: populationAnalysis.diversityIndex,
        consciousness_coherence: consciousnessStatus.coherenceScore,
        evolutionary_pressure: transformEvolutionaryPressure(evolutionStatus.pressure),
        fitness_landscape: transformFitnessLandscape(fitnessLandscape),
        adaptation_rate: evolutionStatus.adaptationRate
      });
    } catch (error) {
      console.error('Failed to load evolutionary data:', error);
    }
  };

  const handleGenerationComplete = useCallback((data: any) => {
    setPopulationData(prevData => ({
      ...prevData,
      currentGeneration: data.generation,
      averageFitness: data.averageFitness,
      bestFitness: data.bestFitness,
      diversityIndex: data.diversityIndex
    }));
  }, []);

  const handleIndividualBirth = useCallback((individualData: any) => {
    const newIndividual: EvolutionaryIndividual = {
      id: individualData.id,
      generation: individualData.generation,
      fitness: transformFitnessScore(individualData.fitness),
      genome: transformGenome(individualData.genome),
      position: [
        (Math.random() - 0.5) * 40,
        individualData.fitness.overall_fitness * 20,
        (Math.random() - 0.5) * 40
      ],
      consciousness_attributes: transformConsciousnessAttributes(individualData.consciousness),
      evolutionary_history: transformEvolutionaryHistory(individualData.history),
      quantum_signature: transformQuantumSignature(individualData.quantumSignature),
      morphic_resonance: transformMorphicResonance(individualData.morphicResonance),
      adaptation_memory: transformAdaptationMemory(individualData.adaptationMemory)
    };

    setPopulationData(prevData => ({
      ...prevData,
      individuals: [...prevData.individuals, newIndividual].slice(-1000) // Keep last 1000
    }));
  }, []);

  const handleFitnessEvaluation = useCallback((fitnessData: any) => {
    setPopulationData(prevData => ({
      ...prevData,
      individuals: prevData.individuals.map(individual =>
        individual.id === fitnessData.individualId
          ? { ...individual, fitness: transformFitnessScore(fitnessData.fitness) }
          : individual
      )
    }));
  }, []);

  const handleConsciousnessEvolution = useCallback((consciousnessData: any) => {
    setPopulationData(prevData => ({
      ...prevData,
      consciousness_coherence: consciousnessData.coherence
    }));
  }, []);

  const handleAdaptationEvent = useCallback((adaptationData: any) => {
    setPopulationData(prevData => ({
      ...prevData,
      adaptation_rate: adaptationData.rate
    }));
  }, []);

  // Transform functions
  const transformEvolutionaryIndividual = (individual: any): EvolutionaryIndividual => ({
    id: individual.id,
    generation: individual.generation,
    fitness: transformFitnessScore(individual.fitness),
    genome: transformGenome(individual.genome),
    position: [
      (Math.random() - 0.5) * 40,
      individual.fitness.overall_fitness * 20,
      (Math.random() - 0.5) * 40
    ],
    consciousness_attributes: transformConsciousnessAttributes(individual.consciousness),
    evolutionary_history: transformEvolutionaryHistory(individual.history),
    quantum_signature: transformQuantumSignature(individual.quantumSignature),
    morphic_resonance: transformMorphicResonance(individual.morphicResonance),
    adaptation_memory: transformAdaptationMemory(individual.adaptationMemory)
  });

  const transformFitnessScore = (fitness: any): FitnessScore => ({
    overall_fitness: fitness?.overall || 0,
    threat_detection_accuracy: fitness?.threatDetection || 0,
    false_positive_rate: fitness?.falsePositives || 0,
    computational_efficiency: fitness?.efficiency || 0,
    consciousness_enhancement: fitness?.consciousness || 0,
    quantum_coherence: fitness?.quantum || 0,
    adaptation_speed: fitness?.adaptation || 0,
    pattern_recognition: fitness?.patternRecognition || 0
  });

  const transformGenome = (genome: any): Genome => ({
    chromosome_count: genome?.chromosomeCount || 0,
    gene_expression: genome?.expression || [],
    consciousness_genes: genome?.consciousnessGenes?.map(transformConsciousnessGene) || [],
    quantum_entangled_genes: genome?.quantumGenes?.map(transformQuantumGene) || [],
    morphic_pattern_genes: genome?.morphicGenes?.map(transformMorphicGene) || [],
    regulatory_network: transformRegulatoryNetwork(genome?.regulatory)
  });

  const transformConsciousnessGene = (gene: any): ConsciousnessGene => ({
    id: gene.id,
    awareness_factor: gene.awareness,
    coherence_influence: gene.coherence,
    field_sensitivity: gene.sensitivity,
    consciousness_amplification: gene.amplification
  });

  const transformQuantumGene = (gene: any): QuantumGene => ({
    id: gene.id,
    entanglement_strength: gene.entanglement,
    superposition_capability: gene.superposition,
    decoherence_resistance: gene.resistance,
    quantum_computation_efficiency: gene.efficiency
  });

  const transformMorphicGene = (gene: any): MorphicGene => ({
    id: gene.id,
    pattern_signature: gene.signature,
    resonance_frequency: gene.frequency,
    field_coupling: gene.coupling,
    collective_memory_connection: gene.memory
  });

  const transformRegulatoryNetwork = (network: any): RegulatoryNetwork => ({
    gene_interactions: network?.interactions?.map(transformGeneInteraction) || [],
    expression_levels: network?.expression || [],
    feedback_loops: network?.feedbackLoops?.map(transformFeedbackLoop) || [],
    consciousness_regulation: transformConsciousnessRegulation(network?.consciousness)
  });

  const transformGeneInteraction = (interaction: any): GeneInteraction => ({
    gene_a: interaction.geneA,
    gene_b: interaction.geneB,
    interaction_type: interaction.type,
    strength: interaction.strength,
    consciousness_mediated: interaction.consciousnessMediated
  });

  const transformFeedbackLoop = (loop: any): FeedbackLoop => ({
    id: loop.id,
    loop_type: loop.type,
    participants: loop.participants,
    loop_strength: loop.strength,
    stability: loop.stability
  });

  const transformConsciousnessRegulation = (regulation: any): ConsciousnessRegulation => ({
    awareness_threshold: regulation?.awarenessThreshold || 0,
    coherence_maintenance: regulation?.coherenceMaintenance || 0,
    field_stabilization: regulation?.fieldStabilization || 0,
    consciousness_evolution_rate: regulation?.evolutionRate || 0
  });

  const transformConsciousnessAttributes = (attributes: any): ConsciousnessAttributes => ({
    awareness_level: attributes?.awareness || 0,
    coherence_score: attributes?.coherence || 0,
    field_resonance: attributes?.resonance || 0,
    intuitive_processing: attributes?.intuition || 0,
    consciousness_bandwidth: attributes?.bandwidth || 0,
    collective_intelligence_connection: attributes?.collective || 0
  });

  const transformEvolutionaryHistory = (history: any): EvolutionaryHistory => ({
    ancestor_lineage: history?.lineage || [],
    mutation_events: history?.mutations?.map(transformMutationEvent) || [],
    crossover_events: history?.crossovers?.map(transformCrossoverEvent) || [],
    selection_pressures: history?.pressures?.map(transformSelectionPressure) || [],
    consciousness_guided_decisions: history?.decisions?.map(transformConsciousnessDecision) || []
  });

  const transformMutationEvent = (mutation: any): MutationEvent => ({
    generation: mutation.generation,
    mutation_type: mutation.type,
    affected_genes: mutation.genes,
    mutation_strength: mutation.strength,
    consciousness_influence: mutation.consciousness
  });

  const transformCrossoverEvent = (crossover: any): CrossoverEvent => ({
    generation: crossover.generation,
    crossover_type: crossover.type,
    parent_a: crossover.parentA,
    parent_b: crossover.parentB,
    crossover_points: crossover.points,
    consciousness_optimization: crossover.consciousness
  });

  const transformSelectionPressure = (pressure: any): SelectionPressure => ({
    pressure_type: pressure.type,
    intensity: pressure.intensity,
    direction: pressure.direction,
    consciousness_influence: pressure.consciousness
  });

  const transformConsciousnessDecision = (decision: any): ConsciousnessDecision => ({
    decision_type: decision.type,
    consciousness_confidence: decision.confidence,
    decision_outcome: decision.outcome,
    field_coherence_impact: decision.impact
  });

  const transformQuantumSignature = (signature: any): QuantumSignature => ({
    entanglement_id: signature?.id || '',
    superposition_state: signature?.state || [],
    coherence_time: signature?.coherence || 0,
    measurement_basis: signature?.basis || '',
    quantum_fitness_contribution: signature?.contribution || 0
  });

  const transformMorphicResonance = (resonance: any): MorphicResonance => ({
    pattern_signature: resonance?.signature || '',
    resonance_frequency: resonance?.frequency || 0,
    field_strength: resonance?.strength || 0,
    collective_memory_access: resonance?.memory || 0,
    morphic_inheritance: resonance?.inheritance || 0
  });

  const transformAdaptationMemory = (memory: any): AdaptationMemory => ({
    successful_adaptations: memory?.adaptations?.map(transformAdaptation) || [],
    failed_strategies: memory?.failures?.map(transformFailedStrategy) || [],
    environmental_patterns: memory?.patterns?.map(transformEnvironmentalPattern) || [],
    consciousness_learning: transformConsciousnessLearning(memory?.learning)
  });

  const transformAdaptation = (adaptation: any): Adaptation => ({
    adaptation_id: adaptation.id,
    environmental_trigger: adaptation.trigger,
    genetic_response: adaptation.response,
    adaptation_success: adaptation.success,
    consciousness_facilitation: adaptation.consciousness
  });

  const transformFailedStrategy = (strategy: any): FailedStrategy => ({
    strategy_id: strategy.id,
    failure_reason: strategy.reason,
    fitness_penalty: strategy.penalty,
    learning_value: strategy.learning
  });

  const transformEnvironmentalPattern = (pattern: any): EnvironmentalPattern => ({
    pattern_id: pattern.id,
    pattern_type: pattern.type,
    frequency: pattern.frequency,
    predictability: pattern.predictability,
    consciousness_recognition: pattern.consciousness
  });

  const transformConsciousnessLearning = (learning: any): ConsciousnessLearning => ({
    learning_rate: learning?.rate || 0,
    pattern_recognition_improvement: learning?.improvement || 0,
    decision_making_enhancement: learning?.enhancement || 0,
    collective_intelligence_integration: learning?.integration || 0
  });

  const transformEvolutionaryPressure = (pressure: any): EvolutionaryPressure => ({
    environmental_pressure: pressure?.environmental || 0,
    consciousness_pressure: pressure?.consciousness || 0,
    quantum_pressure: pressure?.quantum || 0,
    morphic_pressure: pressure?.morphic || 0,
    selection_intensity: pressure?.selection || 0
  });

  const transformFitnessLandscape = (landscape: any): FitnessLandscape => ({
    landscape_topology: landscape?.topology?.map(transformLandscapePoint) || [],
    peaks: landscape?.peaks?.map(transformFitnessPeak) || [],
    valleys: landscape?.valleys?.map(transformFitnessValley) || [],
    consciousness_gradients: landscape?.gradients?.map(transformConsciousnessGradient) || [],
    quantum_tunneling_paths: landscape?.paths?.map(transformQuantumPath) || []
  });

  const transformLandscapePoint = (point: any): LandscapePoint => ({
    position: point.position,
    fitness_value: point.fitness,
    consciousness_influence: point.consciousness,
    quantum_accessibility: point.quantum
  });

  const transformFitnessPeak = (peak: any): FitnessPeak => ({
    id: peak.id,
    position: peak.position,
    height: peak.height,
    stability: peak.stability,
    consciousness_attractiveness: peak.consciousness
  });

  const transformFitnessValley = (valley: any): FitnessValley => ({
    id: valley.id,
    position: valley.position,
    depth: valley.depth,
    escape_difficulty: valley.difficulty,
    consciousness_avoidance: valley.consciousness
  });

  const transformConsciousnessGradient = (gradient: any): ConsciousnessGradient => ({
    start_position: gradient.start,
    end_position: gradient.end,
    gradient_strength: gradient.strength,
    consciousness_flow: gradient.flow
  });

  const transformQuantumPath = (path: any): QuantumPath => ({
    path_points: path.points,
    tunneling_probability: path.probability,
    quantum_coherence_requirement: path.coherence,
    consciousness_facilitation: path.consciousness
  });

  if (isLoading) {
    return (
      <div className="evolutionary-algorithm-loading">
        <div className="loading-spinner evolution-spinner"></div>
        <p>Initializing Evolutionary Algorithm Visualization...</p>
        <p>Loading population dynamics...</p>
        <p>Analyzing fitness landscape...</p>
        <p>Computing consciousness evolution...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="evolutionary-algorithm-error">
        <h3>Evolutionary Algorithm Visualization Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry Evolution Initialization</button>
      </div>
    );
  }

  return (
    <div className="evolutionary-algorithm-progress-visualizer">
      {/* Control Panel */}
      <EvolutionControlPanel 
        controls={controls} 
        onControlsChange={setControls}
        populationData={populationData}
      />

      {/* Evolution Status Panel */}
      <EvolutionStatusPanel populationData={populationData} />

      {/* 3D Evolution Canvas */}
      <div className="evolution-visualizer-canvas">
        <Canvas
          camera={{ position: [0, 20, 40], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[20, 20, 20]} intensity={1.0} color="#ffffff" />
          <pointLight position={[-20, 10, -20]} intensity={0.6} color="#ff8800" />
          <pointLight position={[0, -20, 20]} intensity={0.4} color="#8800ff" />
          
          {/* Fitness Landscape */}
          {controls.showFitnessLandscape && (
            <FitnessLandscapeVisualization 
              landscape={populationData.fitness_landscape}
              controls={controls}
            />
          )}

          {/* Population Individuals */}
          {controls.showPopulation && populationData.individuals
            .filter(ind => 
              ind.generation >= controls.generationRange[0] && 
              ind.generation <= controls.generationRange[1] &&
              ind.consciousness_attributes.awareness_level >= controls.consciousnessFilter
            )
            .map(individual => (
              <EvolutionaryIndividualVisualization 
                key={individual.id}
                individual={individual}
                controls={controls}
              />
            ))}

          {/* Evolution History */}
          {controls.showEvolutionHistory && (
            <EvolutionHistoryVisualization 
              populationData={populationData}
              controls={controls}
            />
          )}

          {/* Consciousness Flow */}
          {controls.showConsciousnessFlow && (
            <ConsciousnessFlowVisualization 
              populationData={populationData}
              controls={controls}
            />
          )}

          {/* Quantum Effects */}
          {controls.showQuantumEffects && (
            <QuantumEffectsVisualization 
              populationData={populationData}
            />
          )}

          {/* Morphic Resonance */}
          {controls.showMorphicResonance && (
            <MorphicResonanceVisualization 
              populationData={populationData}
            />
          )}

          <OrbitControls enablePan enableZoom enableRotate />
          <Stats />

          {/* Evolution Post-processing Effects */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
            <ChromaticAberration offset={[0.002, 0.002]} />
            <SSR 
              intensity={0.45}
              exponent={1}
              distance={10}
              fade={0}
              roughnessFade={1}
              thickness={10}
              ior={1.45}
              maxRoughness={1}
              maxDepthDifference={10}
              blend={0.95}
              correction={1}
              correctionRadius={1}
              blur={0}
              blurKernel={1}
              blurSharpness={10}
              jitter={0}
              jitterRoughness={0}
              steps={40}
              refineSteps={5}
              missedRays={true}
              useNormalMap={true}
              useRoughnessMap={true}
              resolutionScale={1}
              velocityResolutionScale={1}
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Evolution Analysis Panel */}
      <EvolutionAnalysisPanel populationData={populationData} />
    </div>
  );
};

// Fitness Landscape Visualization Component
const FitnessLandscapeVisualization: React.FC<{
  landscape: FitnessLandscape;
  controls: VisualizationControls;
}> = ({ landscape, controls }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  const landscapeGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(40, 40, controls.landscapeResolution, controls.landscapeResolution);
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Generate fitness landscape based on landscape topology
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Find closest landscape point
      let fitness = 0;
      let minDistance = Infinity;
      
      landscape.landscape_topology.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(x - point.position[0] * 40, 2) + 
          Math.pow(z - point.position[1] * 40, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          fitness = point.fitness_value;
        }
      });
      
      positions[i + 1] = fitness * 10; // Scale height
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, [landscape.landscape_topology, controls.landscapeResolution]);

  useFrame(() => {
    if (meshRef.current) {
      const time = clock.getElapsedTime() * controls.animationSpeed;
      
      // Animate landscape based on evolutionary pressure
      const evolutionPhase = Math.sin(time * 0.5) * 0.1;
      meshRef.current.rotation.z = evolutionPhase;
    }
  });

  return (
    <group>
      {/* Main fitness landscape */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} geometry={landscapeGeometry}>
        <meshPhongMaterial 
          color="#4488ff"
          transparent 
          opacity={0.7}
          wireframe={false}
          side={THREE.DoubleSide}
          vertexColors
        />
      </mesh>
      
      {/* Fitness peaks */}
      {landscape.peaks.map(peak => (
        <mesh key={peak.id} position={[peak.position[0] * 40, peak.height * 10 + 1, peak.position[1] * 40]}>
          <coneGeometry args={[1, 2, 8]} />
          <meshPhongMaterial 
            color="#ff4444"
            emissive="#884444"
            emissiveIntensity={peak.consciousness_attractiveness}
          />
        </mesh>
      ))}
      
      {/* Fitness valleys */}
      {landscape.valleys.map(valley => (
        <mesh key={valley.id} position={[valley.position[0] * 40, -valley.depth * 5, valley.position[1] * 40]}>
          <cylinderGeometry args={[1, 1.5, 1, 8]} />
          <meshPhongMaterial 
            color="#444488"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

// Evolutionary Individual Visualization Component
const EvolutionaryIndividualVisualization: React.FC<{
  individual: EvolutionaryIndividual;
  controls: VisualizationControls;
}> = ({ individual, controls }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { clock } = useThree();

  const { scale, position } = useSpring({
    scale: individual.fitness.overall_fitness * controls.populationScale,
    position: individual.position,
    config: { tension: 300, friction: 10 }
  });

  useFrame(() => {
    if (groupRef.current) {
      const time = clock.getElapsedTime() * controls.animationSpeed;
      
      // Consciousness-driven animation
      const consciousnessPhase = time * individual.consciousness_attributes.awareness_level * 5;
      const pulse = 1 + Math.sin(consciousnessPhase) * 0.2 * individual.consciousness_attributes.coherence_score;
      groupRef.current.scale.setScalar(pulse);
      
      // Quantum rotation
      groupRef.current.rotation.y = time * individual.quantum_signature.quantum_fitness_contribution;
    }
  });

  const getIndividualColor = () => {
    const fitness = individual.fitness.overall_fitness;
    const consciousness = individual.consciousness_attributes.awareness_level;
    return `hsl(${fitness * 120 + consciousness * 120}, 80%, ${50 + fitness * 30}%)`;
  };

  return (
    <animated.group 
      ref={groupRef}
      position={position}
      scale={scale}
    >
      {/* Individual representation */}
      <mesh>
        <sphereGeometry args={[0.8, 12, 8]} />
        <meshPhongMaterial 
          color={getIndividualColor()}
          transparent 
          opacity={0.8}
          emissive={getIndividualColor()}
          emissiveIntensity={individual.consciousness_attributes.field_resonance * 0.4}
        />
      </mesh>
      
      {/* Consciousness aura */}
      <mesh>
        <sphereGeometry args={[1.5, 16, 12]} />
        <meshBasicMaterial 
          color={getIndividualColor()}
          transparent 
          opacity={individual.consciousness_attributes.awareness_level * 0.2}
          wireframe={true}
        />
      </mesh>
      
      {/* Fitness indicators */}
      <group position={[0, 2, 0]}>
        {['threat_detection_accuracy', 'consciousness_enhancement', 'quantum_coherence'].map((metric, index) => (
          <mesh key={metric} position={[Math.cos(index * Math.PI * 2 / 3) * 2, 0, Math.sin(index * Math.PI * 2 / 3) * 2]}>
            <boxGeometry args={[0.2, individual.fitness[metric as keyof FitnessScore] * 2, 0.2]} />
            <meshBasicMaterial color={`hsl(${index * 120}, 80%, 60%)`} />
          </mesh>
        ))}
      </group>
      
      {/* Individual information */}
      <Html distanceFactor={20}>
        <div className="evolutionary-individual-info">
          <div className="individual-id">ID: {individual.id.substring(0, 8)}</div>
          <div className="generation">Gen: {individual.generation}</div>
          <div className="fitness">
            Fitness: {(individual.fitness.overall_fitness * 100).toFixed(1)}%
          </div>
          <div className="consciousness">
            Consciousness: {(individual.consciousness_attributes.awareness_level * 100).toFixed(1)}%
          </div>
          <div className="quantum">
            Quantum: {(individual.quantum_signature.quantum_fitness_contribution * 100).toFixed(1)}%
          </div>
        </div>
      </Html>
    </animated.group>
  );
};

// Evolution History Visualization Component
const EvolutionHistoryVisualization: React.FC<{
  populationData: PopulationData;
  controls: VisualizationControls;
}> = ({ populationData, controls }) => {
  const lineRef = useRef<THREE.Group>(null);

  const historyLines = useMemo(() => {
    const lines = [];
    const generations = Array.from(new Set(populationData.individuals.map(ind => ind.generation))).sort();
    
    for (let i = 0; i < generations.length - 1; i++) {
      const currentGen = populationData.individuals.filter(ind => ind.generation === generations[i]);
      const nextGen = populationData.individuals.filter(ind => ind.generation === generations[i + 1]);
      
      // Create lineage connections
      currentGen.forEach(parent => {
        nextGen.forEach(child => {
          if (child.evolutionary_history.ancestor_lineage.includes(parent.id)) {
            lines.push({
              start: parent.position,
              end: child.position,
              strength: child.fitness.overall_fitness
            });
          }
        });
      });
    }
    
    return lines;
  }, [populationData.individuals]);

  return (
    <group ref={lineRef}>
      {historyLines.map((line, index) => (
        <Line
          key={index}
          points={[line.start, line.end]}
          color={`hsl(${line.strength * 120}, 70%, 50%)`}
          lineWidth={1}
          transparent
          opacity={line.strength * 0.6}
        />
      ))}
    </group>
  );
};

// Consciousness Flow Visualization Component
const ConsciousnessFlowVisualization: React.FC<{
  populationData: PopulationData;
  controls: VisualizationControls;
}> = ({ populationData, controls }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { clock } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      const time = clock.getElapsedTime() * controls.animationSpeed;
      
      // Consciousness field oscillation
      const coherencePhase = time * 2 + populationData.consciousness_coherence * 5;
      groupRef.current.rotation.y = Math.sin(coherencePhase) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {populationData.fitness_landscape.consciousness_gradients.map((gradient, index) => (
        <Line
          key={index}
          points={[
            [gradient.start_position[0] * 40, 5, gradient.start_position[1] * 40],
            [gradient.end_position[0] * 40, 5, gradient.end_position[1] * 40]
          ]}
          color="#ff00ff"
          lineWidth={gradient.gradient_strength * 3}
          transparent
          opacity={gradient.consciousness_flow}
        />
      ))}
    </group>
  );
};

// Quantum Effects Visualization Component
const QuantumEffectsVisualization: React.FC<{
  populationData: PopulationData;
}> = ({ populationData }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { clock } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      
      // Quantum coherence oscillation
      groupRef.current.rotation.x = Math.sin(time * 10) * 0.1;
      groupRef.current.rotation.z = Math.cos(time * 8) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {populationData.fitness_landscape.quantum_tunneling_paths.map((path, index) => (
        <Line
          key={index}
          points={path.path_points.map(point => [point[0] * 40, 8, point[1] * 40])}
          color="#00ffff"
          lineWidth={2}
          transparent
          opacity={path.tunneling_probability}
        />
      ))}
    </group>
  );
};

// Morphic Resonance Visualization Component
const MorphicResonanceVisualization: React.FC<{
  populationData: PopulationData;
}> = ({ populationData }) => {
  return (
    <group>
      {populationData.individuals
        .filter(ind => ind.morphic_resonance.field_strength > 0.5)
        .map(individual => (
          <mesh key={individual.id} position={individual.position}>
            <torusGeometry args={[2, 0.3, 8, 16]} />
            <meshPhongMaterial 
              color="#ffaa00"
              transparent 
              opacity={individual.morphic_resonance.field_strength * 0.5}
              emissive="#aa6600"
              emissiveIntensity={individual.morphic_resonance.collective_memory_access * 0.3}
            />
          </mesh>
        ))}
    </group>
  );
};

// Control Panel Component
const EvolutionControlPanel: React.FC<{
  controls: VisualizationControls;
  onControlsChange: (controls: VisualizationControls) => void;
  populationData: PopulationData;
}> = ({ controls, onControlsChange, populationData }) => {
  return (
    <div className="evolution-control-panel">
      <h3>Evolution Controls</h3>
      
      <div className="control-group">
        <label>Display Options</label>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={controls.showPopulation}
              onChange={(e) => onControlsChange({...controls, showPopulation: e.target.checked})}
            />
            Population
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showFitnessLandscape}
              onChange={(e) => onControlsChange({...controls, showFitnessLandscape: e.target.checked})}
            />
            Fitness Landscape
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showEvolutionHistory}
              onChange={(e) => onControlsChange({...controls, showEvolutionHistory: e.target.checked})}
            />
            Evolution History
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showConsciousnessFlow}
              onChange={(e) => onControlsChange({...controls, showConsciousnessFlow: e.target.checked})}
            />
            Consciousness Flow
          </label>
        </div>
      </div>

      <div className="control-group">
        <label>Animation Speed</label>
        <input 
          type="range" 
          min="0.1" 
          max="3" 
          step="0.1" 
          value={controls.animationSpeed}
          onChange={(e) => onControlsChange({...controls, animationSpeed: parseFloat(e.target.value)})}
        />
        <span>{controls.animationSpeed.toFixed(1)}x</span>
      </div>

      <div className="control-group">
        <label>Population Scale</label>
        <input 
          type="range" 
          min="0.5" 
          max="2" 
          step="0.1" 
          value={controls.populationScale}
          onChange={(e) => onControlsChange({...controls, populationScale: parseFloat(e.target.value)})}
        />
        <span>{controls.populationScale.toFixed(1)}</span>
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
const EvolutionStatusPanel: React.FC<{
  populationData: PopulationData;
}> = ({ populationData }) => {
  return (
    <div className="evolution-status-panel">
      <h3>Evolution Status</h3>
      
      <div className="status-item">
        <label>Current Generation</label>
        <span className="count">{populationData.currentGeneration}</span>
      </div>

      <div className="status-item">
        <label>Population Size</label>
        <span className="count">{populationData.populationSize}</span>
      </div>

      <div className="status-item">
        <label>Average Fitness</label>
        <div className="meter">
          <div 
            className="meter-fill" 
            style={{ 
              width: `${populationData.averageFitness * 100}%`,
              backgroundColor: `hsl(${populationData.averageFitness * 120}, 80%, 50%)`
            }}
          ></div>
        </div>
        <span>{(populationData.averageFitness * 100).toFixed(1)}%</span>
      </div>

      <div className="status-item">
        <label>Best Fitness</label>
        <div className="meter">
          <div 
            className="meter-fill" 
            style={{ 
              width: `${populationData.bestFitness * 100}%`,
              backgroundColor: `hsl(${populationData.bestFitness * 120}, 80%, 50%)`
            }}
          ></div>
        </div>
        <span>{(populationData.bestFitness * 100).toFixed(1)}%</span>
      </div>

      <div className="status-item">
        <label>Diversity Index</label>
        <div className="meter">
          <div 
            className="meter-fill" 
            style={{ 
              width: `${populationData.diversityIndex * 100}%`,
              backgroundColor: `hsl(${240 + populationData.diversityIndex * 120}, 80%, 50%)`
            }}
          ></div>
        </div>
        <span>{(populationData.diversityIndex * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};

// Analysis Panel Component
const EvolutionAnalysisPanel: React.FC<{
  populationData: PopulationData;
}> = ({ populationData }) => {
  const fitnessImprovement = populationData.bestFitness - populationData.averageFitness;
  const selectionPressure = populationData.evolutionary_pressure.selection_intensity;

  return (
    <div className="evolution-analysis-panel">
      <h3>Evolution Analysis</h3>
      
      <div className="analysis-section">
        <h4>Fitness Metrics</h4>
        <div className="stat-display">
          <span className="stat-value">{(fitnessImprovement * 100).toFixed(1)}%</span>
          <span className="stat-label">Elite Advantage</span>
        </div>
        <div className="stat-display">
          <span className="stat-value">{(populationData.adaptation_rate * 100).toFixed(1)}%</span>
          <span className="stat-label">Adaptation Rate</span>
        </div>
      </div>

      <div className="analysis-section">
        <h4>Evolutionary Pressure</h4>
        <div className="stat-display">
          <span className="stat-value">{(selectionPressure * 100).toFixed(1)}%</span>
          <span className="stat-label">Selection Intensity</span>
        </div>
        <div className="stat-display">
          <span className="stat-value">{(populationData.evolutionary_pressure.consciousness_pressure * 100).toFixed(1)}%</span>
          <span className="stat-label">Consciousness Pressure</span>
        </div>
      </div>

      <div className="analysis-section">
        <h4>Landscape Features</h4>
        <div className="stat-display">
          <span className="stat-value">{populationData.fitness_landscape.peaks.length}</span>
          <span className="stat-label">Fitness Peaks</span>
        </div>
        <div className="stat-display">
          <span className="stat-value">{populationData.fitness_landscape.valleys.length}</span>
          <span className="stat-label">Fitness Valleys</span>
        </div>
      </div>

      <div className="analysis-section">
        <h4>Consciousness Metrics</h4>
        <div className="stat-display">
          <span className="stat-value">{(populationData.consciousness_coherence * 100).toFixed(1)}%</span>
          <span className="stat-label">Coherence</span>
        </div>
        <div className="stat-display">
          <span className="stat-value">{populationData.fitness_landscape.consciousness_gradients.length}</span>
          <span className="stat-label">Consciousness Gradients</span>
        </div>
      </div>
    </div>
  );
};

export default EvolutionaryAlgorithmProgressVisualizer;