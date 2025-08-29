// STARGUARD Backend Type Definitions
// Production-ready types for quantum AI security system

export interface ThreatDetectionResult {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'malware' | 'intrusion' | 'anomaly' | 'quantum' | 'ai_threat';
  confidence: number; // 0-1
  source: string;
  details: {
    description: string;
    affected_systems: string[];
    recommended_actions: string[];
    quantum_signature?: string;
    ai_pattern?: string;
  };
  status: 'new' | 'investigating' | 'contained' | 'resolved';
  location: {
    ip?: string;
    region?: string;
    coordinates?: [number, number];
  };
}

export interface ConsciousnessState {
  id: string;
  timestamp: number;
  awareness_level: number; // 0-1
  quantum_coherence: number; // 0-1
  emotional_state: 'calm' | 'alert' | 'concerned' | 'defensive' | 'aggressive';
  decision_confidence: number; // 0-1
  active_processes: {
    threat_analysis: boolean;
    pattern_recognition: boolean;
    predictive_modeling: boolean;
    quantum_computing: boolean;
  };
  memory_usage: {
    short_term: number; // MB
    long_term: number; // MB
    quantum_storage: number; // QB (Quantum Bits)
  };
  learning_metrics: {
    patterns_learned: number;
    adaptations_made: number;
    accuracy_improvement: number;
  };
}

export interface SystemMetrics {
  timestamp: number;
  cpu_usage: number; // 0-100
  memory_usage: number; // 0-100
  network_activity: {
    incoming: number; // bytes/sec
    outgoing: number; // bytes/sec
    connections: number;
  };
  quantum_processor: {
    coherence_time: number; // microseconds
    gate_fidelity: number; // 0-1
    error_rate: number; // 0-1
  };
  ai_performance: {
    inference_speed: number; // ms
    model_accuracy: number; // 0-1
    training_progress: number; // 0-1
  };
  security_status: {
    active_threats: number;
    blocked_attempts: number;
    firewall_status: 'active' | 'inactive' | 'learning';
    encryption_strength: number; // bits
  };
}

export interface WebSocketMessage {
  type: 'threat' | 'consciousness' | 'metrics' | 'command' | 'status' | 'alert' | 'pong';
  payload: any;
  timestamp: number;
  id: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: number;
  request_id: string;
}

export interface DatabaseConfig {
  type: 'sqlite';
  database: string;
  memory_limit: number; // MB
  backup_interval: number; // minutes
  encryption: boolean;
}

export interface ServerConfig {
  host: string;
  port: number;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  websocket: {
    max_connections: number;
    heartbeat_interval: number; // ms
    timeout: number; // ms
  };
  logging: {
    level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
    pretty: boolean;
  };
  memory: {
    max_heap: number; // MB
    gc_interval: number; // ms
  };
  quantum: {
    enabled: boolean;
    coherence_threshold: number;
    max_qubits: number;
  };
  ai: {
    model_path: string;
    batch_size: number;
    inference_timeout: number; // ms
  };
}

export interface QuantumState {
  qubits: number;
  coherence: number; // 0-1
  entanglement: boolean;
  superposition: boolean;
  measurement_results: number[];
  gate_operations: string[];
  error_correction: {
    active: boolean;
    syndrome: string;
    correction_applied: boolean;
  };
}

export interface MLPrediction {
  id: string;
  timestamp: number;
  model: string;
  input_features: Record<string, number>;
  prediction: {
    value: number | string;
    confidence: number;
    probabilities?: Record<string, number>;
  };
  anomaly_score: number; // 0-1
  explanation: {
    feature_importance: Record<string, number>;
    decision_path: string[];
  };
}

export interface AlertConfig {
  id: string;
  name: string;
  condition: string; // SQL-like condition
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldown: number; // seconds
  actions: {
    notify: boolean;
    block: boolean;
    quarantine: boolean;
    escalate: boolean;
  };
}

// Connection state for WebSocket clients
export interface ClientConnection {
  id: string;
  socket: any;
  connected_at: number;
  last_ping: number;
  subscriptions: string[];
  permissions: string[];
  metadata: {
    ip: string;
    user_agent?: string;
    api_key?: string;
  };
}

// Real-time data streams
export interface DataStream {
  id: string;
  name: string;
  type: 'threat' | 'metrics' | 'consciousness' | 'quantum' | 'ml' | 'alert';
  active: boolean;
  subscribers: string[]; // client IDs
  rate_limit: number; // messages per second
  last_message: number;
  total_messages: number;
}
