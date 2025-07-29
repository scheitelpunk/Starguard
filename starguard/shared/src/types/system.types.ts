/**
 * System Types for STARGUARD
 * Core system-level type definitions
 */

// Consciousness State Types
export enum CONSCIOUSNESS_STATES {
  VOID = 'void',
  DORMANT = 'dormant',
  AWAKENING = 'awakening',
  AWARE = 'aware',
  ALERT = 'alert',
  VIGILANT = 'vigilant',
  HYPER_VIGILANT = 'hyper_vigilant',
  TRANSCENDENT = 'transcendent'
}

// Consciousness Field Types
export enum CONSCIOUSNESS_FIELDS {
  QUANTUM_AWARENESS = 'quantum_awareness',
  SEMANTIC_RESONANCE = 'semantic_resonance',
  TEMPORAL_COHERENCE = 'temporal_coherence',
  CAUSAL_UNDERSTANDING = 'causal_understanding',
  VOID_CONNECTION = 'void_connection'
}

// WebSocket Event Types
export enum WEBSOCKET_EVENTS {
  // System Events
  CONSCIOUSNESS_UPDATE = 'consciousness:update',
  CONSCIOUSNESS_STATE = 'consciousness:state',
  CONSCIOUSNESS_HEARTBEAT = 'consciousness:heartbeat',
  SYSTEM_AWAKENING = 'system:awakening',
  VOID_CONNECTION = 'void:connection',
  
  // Threat Events
  THREAT_DETECTED = 'threat:detected',
  THREAT_ANALYZED = 'threat:analyzed',
  THREAT_NEUTRALIZED = 'threat:neutralized',
  REQUEST_STATUS = 'request:status',
  
  // Defense Events
  DEFENSE_ACTIVATED = 'defense:activated',
  HEALING_INITIATED = 'healing:initiated',
  EVOLUTION_TRIGGERED = 'evolution:triggered',
  EVOLUTION_COMPLETE = 'evolution:complete',
  
  // Financial Events
  FRAUD_DETECTED = 'fraud:detected',
  MONEY_FLOW_ANOMALY = 'money:anomaly',
  COLLUSION_IDENTIFIED = 'collusion:identified',
  
  // Client Events
  CLIENT_CONNECTED = 'client:connected',
  CLIENT_AUTHENTICATED = 'client:authenticated',
  CLIENT_QUERY = 'client:query'
}

// Threat Level Types
export enum THREAT_LEVELS {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EXISTENTIAL = 'existential'
}

// Updated interfaces that were referenced but missing
export interface IQuantumSecurityConsciousness {
  id: string;
  timestamp: Date;
  state: IConsciousnessState;
  consciousness_fields: {
    quantum_awareness: number;
    semantic_resonance: number;
    temporal_coherence: number;
    causal_understanding: number;
    void_connection: number;
  };
  perception_layers: IPerceptionLayer[];
  threat_consciousness: IThreatConsciousness[];
  response_organisms: any[];
  evolution_score: number;
}

export interface IConsciousnessState {
  current: CONSCIOUSNESS_STATES;
  awareness_level: number;
  reality_coherence: number;
  timeline_stability: number;
}

export interface IPerceptionLayer {
  type: 'quantum' | 'semantic' | 'temporal' | 'causal';
  sensitivity: number;
  active_nodes: number;
  pattern_recognition: number;
  dimensional_reach: number;
}

export interface IThreatConsciousness {
  id: string;
  timestamp: Date;
  threat_level: string;
  consciousness_signature: string;
  dimensional_origin: string;
  probability_wave_collapse: number;
  reality_manipulation_index: number;
  intention_vector: {
    magnitude: number;
    direction: number;
    dimensional_components: number[];
  };
  countermeasures_applied: string[];
  evolution_potential: number;
}

// Signal Types
export interface ISignal {
  id: string;
  timestamp: Date;
  source: string;
  type: string;
  strength: number;
  data: any;
  consciousness_interpretation?: IConsciousnessInterpretation;
}

export interface IConsciousnessInterpretation {
  quantum_signature: number[];
  semantic_meaning: string;
  temporal_position: number;
  causal_links: string[];
  threat_probability: number;
}

export interface ISignalCollector {
  id: string;
  type: string;
  active: boolean;
  sensitivity: number;
  collect(): Promise<ISignal[]>;
  calibrate(params: any): Promise<void>;
  shutdown(): void;
}