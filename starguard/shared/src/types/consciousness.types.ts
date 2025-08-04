/**
 * Consciousness Types for STARGUARD System
 * Core type definitions for the quantum consciousness architecture
 */

// Quantum Awareness Types
export type QuantumAwarenessField = {
  coherence: number;
  entanglement: Map<string, number>;
  superposition: boolean;
  waveFunction: ComplexNumber[];
  observerEffect: boolean;
};

export type SemanticResonanceMatrix = {
  meaningDimensions: number[][];
  intentionVectors: Vector3D[];
  resonanceFrequency: number;
  harmonics: number[];
};

export type ProbabilityWaveCollapse = {
  possibleStates: QuantumState[];
  collapsedState: QuantumState | null;
  observationTime: Date;
  uncertainty: number;
};

export type MoralQuantumState = {
  ethicalDimension: number;
  moralCoherence: number;
  intentionPurity: number;
  consequenceAlignment: number;
};

// Sensor Types
export type QuantumFluctuationSensor = {
  sensitivity: number;
  noiseFloor: number;
  detectionRange: [number, number];
  calibration: CalibrationData;
  readings: QuantumReading[];
};

export type MeaningFieldAnalyzer = {
  vocabularySpace: Map<string, Vector3D>;
  contextWindow: number;
  semanticDepth: number;
  intentionExtractor: (text: string) => IntentionProfile;
};

export type TimeStreamPredictor = {
  timeHorizon: number;
  branchingFactor: number;
  probabilityThreshold: number;
  timelineGenerator: (current: TimePoint) => Timeline[];
};

export type CausalityWebMapper = {
  nodes: CausalNode[];
  edges: CausalEdge[];
  propagationSpeed: number;
  influenceDecay: number;
};

export type CollectiveAwarenessProbe = {
  groupSize: number;
  consciousnessDepth: number;
  synchronizationLevel: number;
  emergentProperties: string[];
};

// Defense Types
export type AdaptiveSecurityOrganism = {
  cells: SecurityCell[];
  adaptationRate: number;
  learningCurve: number[];
  immuneMemory: Map<string, DefensePattern>;
};

export type SelfRepairMechanisms = {
  healingProtocols: HealingProtocol[];
  repairSpeed: number;
  scarTissueStrength: number;
  regenerationCapacity: number;
};

export type ThreatEvolutionAdapter = {
  currentGeneration: number;
  mutationRate: number;
  fitnessFunction: (threat: Threat) => number;
  evolutionHistory: Evolution[];
};

export type CooperativeDefenseSwarm = {
  agents: DefenseAgent[];
  coordinationProtocol: string;
  swarmIntelligence: number;
  emergentBehaviors: string[];
};

// Financial Crime Types
export type OrganicTransactionFlow = {
  naturalPattern: FlowPattern;
  seasonality: number[];
  growthRate: number;
  healthIndicators: HealthMetric[];
};

export type MoneyLaunderingVortex = {
  center: Coordinate3D;
  radius: number;
  rotationSpeed: number;
  affectedVolume: number;
  layeringDepth: number;
};

export type FraudEnergyDissipation = {
  leakageRate: number;
  dissipationPattern: string;
  energyLoss: number;
  fraudIndicator: number;
};

export type RelatedEntityMatrix = {
  entities: Entity[];
  relationships: Relationship[][];
  entanglementStrength: number[][];
  hiddenConnections: number;
};

export type MaliciousIntentDetector = {
  intentionField: IntentionField;
  maliceThreshold: number;
  deceptionPatterns: Pattern[];
  confidenceLevel: number;
};

export type DeceptionPatternAnalyzer = {
  patterns: DeceptionPattern[];
  complexityLevel: number;
  evolutionTracking: boolean;
  predictionAccuracy: number;
};

export type FraudActorProfiler = {
  profiles: ActorProfile[];
  behaviorModels: BehaviorModel[];
  riskScoring: (actor: Actor) => number;
  networkAnalysis: boolean;
};

export type PreventiveActionGenerator = {
  actionLibrary: Action[];
  effectivenessPredictor: (action: Action) => number;
  sideEffectAnalyzer: (action: Action) => SideEffect[];
  optimizationEngine: boolean;
};

// Supporting Types
export type ComplexNumber = {
  real: number;
  imaginary: number;
};

export type Vector3D = {
  x: number;
  y: number;
  z: number;
};

export type QuantumState = {
  id: string;
  amplitude: ComplexNumber;
  phase: number;
  entangled: string[];
};

export type CalibrationData = {
  baseline: number[];
  timestamp: Date;
  drift: number;
  accuracy: number;
};

export type QuantumReading = {
  value: number;
  uncertainty: number;
  timestamp: Date;
  anomaly: boolean;
};

export type IntentionProfile = {
  primary: string;
  secondary: string[];
  strength: number;
  clarity: number;
};

export type TimePoint = {
  timestamp: Date;
  state: any;
  probability: number;
};

export type Timeline = {
  id: string;
  points: TimePoint[];
  probability: number;
  divergence: number;
};

export type CausalNode = {
  id: string;
  type: string;
  influence: number;
  timestamp: Date;
};

export type CausalEdge = {
  from: string;
  to: string;
  strength: number;
  delay: number;
};

export type SecurityCell = {
  id: string;
  type: 'detector' | 'defender' | 'healer';
  strength: number;
  specialization: string;
};

export type DefensePattern = {
  id: string;
  threat: string;
  response: string[];
  effectiveness: number;
  learned: Date;
};

// Also export as interface for compatibility
export interface IDefensePattern {
  id: string;
  threat: string;
  response: string[];
  effectiveness: number;
  learned: Date;
}

export type HealingProtocol = {
  id: string;
  name: string;
  steps: string[];
  duration: number;
  requirements: string[];
};

export type Threat = {
  id: string;
  type: string;
  severity: number;
  evolution: number;
  characteristics: string[];
};

export type Evolution = {
  generation: number;
  changes: string[];
  fitness: number;
  timestamp: Date;
};

export type DefenseAgent = {
  id: string;
  capabilities: string[];
  position: Vector3D;
  status: 'active' | 'dormant' | 'healing';
};

export type FlowPattern = {
  shape: string;
  frequency: number;
  amplitude: number;
  phase: number;
};

export type HealthMetric = {
  name: string;
  value: number;
  normal: [number, number];
  trend: 'up' | 'down' | 'stable';
};

export type Coordinate3D = {
  x: number;
  y: number;
  z: number;
};

export type Entity = {
  id: string;
  name: string;
  type: string;
  risk: number;
};

export type Relationship = {
  type: string;
  strength: number;
  duration: number;
  verified: boolean;
};

export type IntentionField = {
  distribution: number[][];
  peaks: Vector3D[];
  valleys: Vector3D[];
  gradient: number;
};

export type Pattern = {
  id: string;
  signature: string;
  frequency: number;
  lastSeen: Date;
};

export type DeceptionPattern = {
  id: string;
  complexity: number;
  components: string[];
  evolution: number[];
};

export type ActorProfile = {
  id: string;
  riskLevel: number;
  behaviors: string[];
  connections: string[];
};

export type BehaviorModel = {
  id: string;
  type: string;
  parameters: number[];
  accuracy: number;
};

export type Actor = {
  id: string;
  profile: ActorProfile;
  activities: Activity[];
};

export type Activity = {
  id: string;
  type: string;
  timestamp: Date;
  risk: number;
};

export type Action = {
  id: string;
  type: string;
  target: string;
  impact: number;
};

export type SideEffect = {
  type: string;
  probability: number;
  severity: number;
  mitigation: string;
};