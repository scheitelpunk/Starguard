export interface NetworkPacket {
  timestamp: number;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  size: number;
  payload: Buffer;
  entropy?: number;
  anomalyScore?: number;
}

export interface ThreatProbability {
  score: number;
  confidence: number;
  factors: {
    entropy: number;
    timing: number;
    frequency: number;
    pattern: number;
  };
  timestamp: number;
}

export interface ConsciousnessState {
  id: string;
  timestamp: number;
  threatLevel: number;
  activeThreats: string[];
  systemHealth: {
    cpu: number;
    memory: number;
    network: number;
    disk: number;
  };
  swarmCoherence: number;
  emergentPatterns: string[];
}

export interface DefenseStrategy {
  id: string;
  name: string;
  priority: number;
  actions: DefenseAction[];
  triggers: string[];
  effectiveness: number;
  timestamp: number;
}

export interface DefenseAction {
  type: 'block' | 'throttle' | 'monitor' | 'isolate' | 'alert';
  target: string;
  parameters: Record<string, any>;
  duration?: number;
}

export interface SwarmConsensus {
  threatId: string;
  votes: {
    agentId: string;
    threatLevel: number;
    confidence: number;
    timestamp: number;
  }[];
  finalDecision: number;
  consensus: boolean;
  timestamp: number;
}

export interface TemporalAnomaly {
  id: string;
  type: 'clock_drift' | 'timestamp_gap' | 'sequence_anomaly' | 'timing_attack';
  severity: number;
  timestamp: number;
  details: Record<string, any>;
  source?: string;
}

export interface LamportClock {
  logicalTime: number;
  nodeId: string;
  vectorClock: Map<string, number>;
}

export interface AgentState {
  id: string;
  type: 'nullstelle' | 'temporal' | 'coordinator';
  status: 'active' | 'standby' | 'error' | 'maintenance';
  lastHeartbeat: number;
  performance: {
    threatsDetected: number;
    falsePositives: number;
    responseTime: number;
    accuracy: number;
  };
  configuration: Record<string, any>;
}