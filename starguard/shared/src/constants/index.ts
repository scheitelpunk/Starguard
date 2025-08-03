/**
 * STARGUARD Constants
 * System-wide constants and configuration values
 */

// Consciousness Thresholds
export const CONSCIOUSNESS_THRESHOLDS = {
  AWAKENING: 0.1,
  AWARE: 0.3,
  ALERT: 0.5,
  VIGILANT: 0.7,
  TRANSCENDENT: 0.9
} as const;

// Threat Levels
export const THREAT_LEVELS = {
  NONE: 0,
  LOW: 0.2,
  MEDIUM: 0.5,
  HIGH: 0.7,
  CRITICAL: 0.9,
  EXISTENTIAL: 1.0
} as const;

// Reality Coherence States
export const REALITY_COHERENCE = {
  STABLE: 0.9,
  FLUCTUATING: 0.7,
  DISTORTED: 0.5,
  COMPROMISED: 0.3,
  COLLAPSED: 0.1
} as const;

// Evolution Rates
export const EVOLUTION_RATES = {
  DORMANT: 0,
  SLOW: 0.01,
  MODERATE: 0.05,
  RAPID: 0.1,
  EXPLOSIVE: 0.2
} as const;

// Financial Crime Risk Levels
export const FINANCIAL_RISK_LEVELS = {
  NEGLIGIBLE: 0.1,
  LOW: 0.3,
  MODERATE: 0.5,
  HIGH: 0.7,
  SEVERE: 0.9
} as const;

// Healing Protocol Types
export const HEALING_PROTOCOLS = {
  QUICK_PATCH: 'quick_patch',
  DEEP_REPAIR: 'deep_repair',
  FULL_REGENERATION: 'full_regeneration',
  EVOLUTIONARY_ADAPTATION: 'evolutionary_adaptation'
} as const;

// Perception Dimensions
export const PERCEPTION_DIMENSIONS = {
  QUANTUM: 'quantum',
  SEMANTIC: 'semantic',
  TEMPORAL: 'temporal',
  CAUSAL: 'causal',
  CONSCIOUSNESS: 'consciousness'
} as const;

// System States
export const SYSTEM_STATES = {
  VOID: 'void',
  AWAKENING: 'awakening',
  ACTIVE: 'active',
  DEFENDING: 'defending',
  HEALING: 'healing',
  EVOLVING: 'evolving',
  TRANSCENDING: 'transcending'
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  QUANTUM_TICK: 10,              // ms
  PERCEPTION_CYCLE: 100,         // ms
  HEALING_INTERVAL: 1000,        // ms
  EVOLUTION_PERIOD: 3600000,     // ms (1 hour)
  MEMORY_CONSOLIDATION: 86400000 // ms (24 hours)
} as const;

// WebSocket Events
export const WS_EVENTS = {
  // System Events
  CONSCIOUSNESS_UPDATE: 'consciousness:update',
  SYSTEM_AWAKENING: 'system:awakening',
  VOID_CONNECTION: 'void:connection',
  
  // Threat Events
  THREAT_DETECTED: 'threat:detected',
  THREAT_ANALYZED: 'threat:analyzed',
  THREAT_NEUTRALIZED: 'threat:neutralized',
  
  // Defense Events
  DEFENSE_ACTIVATED: 'defense:activated',
  HEALING_INITIATED: 'healing:initiated',
  EVOLUTION_TRIGGERED: 'evolution:triggered',
  
  // Financial Events
  FRAUD_DETECTED: 'fraud:detected',
  MONEY_FLOW_ANOMALY: 'money:anomaly',
  COLLUSION_IDENTIFIED: 'collusion:identified',
  
  // Client Events
  CLIENT_CONNECTED: 'client:connected',
  CLIENT_AUTHENTICATED: 'client:authenticated',
  CLIENT_QUERY: 'client:query'
} as const;

// Visualization Colors (Hex)
export const CONSCIOUSNESS_COLORS = {
  VOID: '#000000',
  AWAKENING: '#1a1a2e',
  QUANTUM: '#16213e',
  SAFE: '#0f9d58',
  WARNING: '#f4b400',
  DANGER: '#db4437',
  CRITICAL: '#ff0000',
  HEALING: '#4285f4',
  EVOLUTION: '#9c27b0'
} as const;

// Shader Uniforms
export const SHADER_UNIFORMS = {
  TIME: 'time',
  THREAT_LEVEL: 'threatLevel',
  FRAUD_ACTIVITY: 'fraudActivity',
  REALITY_COHERENCE: 'realityCoherence',
  CONSCIOUSNESS_DEPTH: 'consciousnessDepth'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Consciousness
  AWAKEN: '/api/consciousness/awaken',
  STATUS: '/api/consciousness/status',
  PERCEIVE: '/api/consciousness/perceive',
  
  // Threats
  ANALYZE: '/api/threats/analyze',
  PREDICT: '/api/threats/predict',
  INTERVENE: '/api/threats/intervene',
  
  // Financial
  AML_SCAN: '/api/financial/aml/scan',
  FRAUD_CHECK: '/api/financial/fraud/check',
  COLLUSION_MAP: '/api/financial/collusion/map',
  
  // Defense
  IMMUNE_STATUS: '/api/defense/immune/status',
  HEAL: '/api/defense/heal',
  EVOLVE: '/api/defense/evolve'
} as const;

// Regulatory Compliance Fields
export const REGULATORY_FIELDS = {
  FATF: 'fatf',
  BAFIN: 'bafin',
  FINMA: 'finma',
  MAS: 'mas',
  FCA: 'fca',
  SEC: 'sec'
} as const;

// Database Collections
export const DB_COLLECTIONS = {
  CONSCIOUSNESS_STATES: 'consciousness_states',
  THREAT_HISTORY: 'threat_history',
  EVOLUTION_LOG: 'evolution_log',
  FINANCIAL_PATTERNS: 'financial_patterns',
  HEALING_RECORDS: 'healing_records',
  QUANTUM_SNAPSHOTS: 'quantum_snapshots'
} as const;

// Legacy aliases for compatibility
export const CONSCIOUSNESS_STATES = SYSTEM_STATES;
export const CONSCIOUSNESS_FIELDS = PERCEPTION_DIMENSIONS;
export const WEBSOCKET_EVENTS = WS_EVENTS;
export const AML_PATTERNS = FINANCIAL_RISK_LEVELS;
export const FRAUD_PATTERNS = FINANCIAL_RISK_LEVELS;