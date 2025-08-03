/**
 * System Types for STARGUARD
 * Core system-level type definitions
 */


// Perception Layer Interface (different from main interface)
export interface IPerceptionLayer {
  type: 'quantum' | 'semantic' | 'temporal' | 'causal';
  sensitivity: number;
  active_nodes: number;
  pattern_recognition: number;
  dimensional_reach: number;
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



// ML and Analysis types
export interface ThreatAnalysis {
  threat_id: string;
  probability: number;
  severity: string;
  confidence: number;
  patterns: string[];
  recommendations: string[];
}

// Defense types (different from consciousness.types)
export interface DefensePatternConfig {
  id: string;
  name: string;
  effectiveness: number;
  threat_types: string[];
  deployment_cost: number;
}

export interface Countermeasure {
  id: string;
  type: string;
  activation_threshold: number;
  success_rate: number;
  side_effects: string[];
}

export interface SystemHealth {
  overall_status: string;
  component_health: { [key: string]: number };
  threat_level: string;
  last_check: Date;
}