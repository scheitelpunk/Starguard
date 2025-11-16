/**
 * Security Analysis Type Definitions
 * Type-safe security analysis interfaces
 */

/**
 * Partial security analysis result (from individual analyzers)
 */
export interface PartialSecurityAnalysis {
  anomalies: import('./threat.types').SecurityAnomaly[];
  riskScore: number;
  confidence: number;
}

/**
 * Threat detection data - can be various formats
 */
export type ThreatDetectionData =
  | string
  | Buffer
  | RequestData
  | NetworkData
  | Record<string, unknown>;

/**
 * HTTP request data for threat detection
 */
export interface RequestData {
  requestCount?: number;
  timeWindow?: number;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
}

/**
 * Network data for threat detection
 */
export interface NetworkData {
  unusualPorts?: boolean;
  suspiciousIPs?: boolean;
  encryptedTraffic?: boolean;
  offHoursActivity?: boolean;
  connectionCount?: number;
  bandwidth?: number;
}

/**
 * Malware simulation data
 */
export interface MalwareSimulationData {
  code?: string;
  entropy?: number;
  signatures?: string[];
}

/**
 * DDoS simulation data
 */
export interface DDoSSimulationData {
  requestCount?: number;
  timeWindow?: number;
  sources?: string[];
}

/**
 * Intrusion simulation data
 */
export interface IntrusionSimulationData {
  commands?: string[];
  privilege_escalation?: boolean;
  lateral_movement?: boolean;
}

/**
 * Generic attack simulation data
 */
export interface AttackSimulationData {
  data?: string;
  anomaly_score?: number;
  quantum_signature?: string;
}

/**
 * All possible simulation data types
 */
export type SimulationData =
  | MalwareSimulationData
  | DDoSSimulationData
  | IntrusionSimulationData
  | AttackSimulationData;

/**
 * Behavior check result
 */
export interface BehaviorCheckResult {
  detected: boolean;
  confidence: number;
  evidence?: string;
}

/**
 * Anomaly detection pattern
 */
export interface AnomalyPattern {
  name: string;
  score: number;
  threshold: number;
  type: 'ransomware' | 'malware' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Suspicious pattern detection
 */
export interface SuspiciousPattern {
  pattern: RegExp;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Type guard for request data
 */
export function isRequestData(obj: unknown): obj is RequestData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('requestCount' in obj || 'method' in obj || 'url' in obj)
  );
}

/**
 * Type guard for network data
 */
export function isNetworkData(obj: unknown): obj is NetworkData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('unusualPorts' in obj ||
      'suspiciousIPs' in obj ||
      'encryptedTraffic' in obj ||
      'offHoursActivity' in obj)
  );
}

/**
 * Type guard for simulation data
 */
export function isSimulationData(obj: unknown): obj is SimulationData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('code' in obj ||
      'requestCount' in obj ||
      'commands' in obj ||
      'data' in obj)
  );
}
