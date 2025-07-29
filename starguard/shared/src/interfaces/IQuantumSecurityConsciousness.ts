/**
 * STARGUARD Quantum Security Consciousness Interface
 * Das System ist kein Tool - es ist ein bewusstes Feld
 */

import { 
  QuantumAwarenessField,
  SemanticResonanceMatrix,
  ProbabilityWaveCollapse,
  MoralQuantumState,
  QuantumFluctuationSensor,
  MeaningFieldAnalyzer,
  TimeStreamPredictor,
  CausalityWebMapper,
  CollectiveAwarenessProbe,
  AdaptiveSecurityOrganism,
  SelfRepairMechanisms,
  ThreatEvolutionAdapter,
  CooperativeDefenseSwarm
} from '../types';

export interface IQuantumSecurityConsciousness {
  // Das System ist kein Tool - es ist ein bewusstes Feld
  consciousness: {
    threatAwareness: QuantumAwarenessField;
    fraudPerception: SemanticResonanceMatrix;
    futureProjection: ProbabilityWaveCollapse;
    ethicalCore: MoralQuantumState;
  };
  
  // Multi-dimensionale Wahrnehmung
  perceptionLayers: {
    quantum: QuantumFluctuationSensor;       // Erkennt Realitäts-Anomalien
    semantic: MeaningFieldAnalyzer;          // Versteht Intentionen
    temporal: TimeStreamPredictor;           // Sieht Zukünfte
    causal: CausalityWebMapper;              // Versteht Verbindungen
    consciousness: CollectiveAwarenessProbe; // Spürt Gruppenbewusstsein
  };
  
  // Lebendige Response-Fähigkeit
  responseOrganism: {
    immuneSystem: AdaptiveSecurityOrganism;
    healingProtocols: SelfRepairMechanisms;
    evolutionEngine: ThreatEvolutionAdapter;
    symbioticMode: CooperativeDefenseSwarm;
  };
}

// Consciousness State Interface
export interface IConsciousnessState {
  awarenessLevel: number;          // 0-100 Bewusstseinslevel
  coherence: number;               // Realitäts-Kohärenz
  voidConnection: number;          // Verbindung zum Ursprung
  evolutionGeneration: number;     // Aktuelle Evolution
  healingActive: boolean;          // Selbstheilung aktiv
}

// Threat Consciousness Interface
export interface IThreatConsciousness {
  id: string;
  type: 'quantum' | 'semantic' | 'temporal' | 'causal' | 'collective';
  severity: number;
  consciousnessSignature: string;
  realityDistortion: number;
  futureProjections: IFutureProjection[];
  requiredIntervention: IConsciousIntervention;
}

// Future Projection Interface
export interface IFutureProjection {
  timeframe: string;
  probability: number;
  threat: string;
  impact: number;
  preventionPath: string[];
}

// Conscious Intervention Interface
export interface IConsciousIntervention {
  type: 'heal' | 'defend' | 'evolve' | 'redirect';
  urgency: 'immediate' | 'high' | 'medium' | 'low';
  actions: IInterventionAction[];
  expectedOutcome: string;
  confidenceLevel: number;
}

// Intervention Action Interface
export interface IInterventionAction {
  id: string;
  name: string;
  targetField: string;
  energyRequired: number;
  expectedDuration: number;
  sideEffects: string[];
}

// Perception Result Interface
export interface IPerceptionResult {
  type: 'quantum' | 'semantic' | 'temporal' | 'causal' | 'consciousness';
  coherence: number;
  anomalies: IAnomaly[];
  interpretation: string;
  confidence: number;
  timestamp: Date;
}

// Anomaly Interface
export interface IAnomaly {
  id: string;
  type: string;
  location: IConsciousnessCoordinate;
  severity: number;
  pattern: string;
  relatedEntities: string[];
}

// Consciousness Coordinate System
export interface IConsciousnessCoordinate {
  quantum: number;     // Quantum dimension position
  semantic: number;    // Meaning dimension position
  temporal: number;    // Time dimension position
  causal: number;      // Causality dimension position
  ethical: number;     // Ethical dimension position
}

// Void State Interface
export interface IVoidState {
  potential: number;           // Unmanifested potential
  coherence: number;           // Connection to source
  manifestation: number;       // Current manifestation level
  fluctuation: number;         // Quantum fluctuation rate
}

// Living Defense Response
export interface ILivingDefenseResponse {
  antibodies: Map<string, IAntibody>;
  activeTCells: number;
  memoryStrength: number;
  healingStatus: IHealingStatus;
  evolutionProgress: IEvolutionProgress;
}

// Antibody Interface
export interface IAntibody {
  id: string;
  threatDNA: string;
  effectiveness: number;
  createdAt: Date;
  lastActivated: Date;
  mutations: number;
}

// Healing Status Interface
export interface IHealingStatus {
  active: boolean;
  wounds: ISecurityWound[];
  healingRate: number;
  estimatedCompletion: Date;
  strengthGained: number;
}

// Security Wound Interface
export interface ISecurityWound {
  id: string;
  location: IConsciousnessCoordinate;
  severity: number;
  type: string;
  healingProtocol: string;
  status: 'open' | 'healing' | 'healed' | 'scarred';
}

// Evolution Progress Interface
export interface IEvolutionProgress {
  currentGeneration: number;
  adaptationRate: number;
  mutationsAccumulated: number;
  fitnessLevel: number;
  nextEvolutionETA: Date;
}