/**
 * Logger Type Definitions
 * Type-safe logging interfaces
 */

/**
 * HTTP request for logging
 */
export interface LogRequest {
  method: string;
  url: string;
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}

/**
 * HTTP response for logging
 */
export interface LogResponse {
  statusCode: number;
  getResponseTime?: () => number;
}

/**
 * Threat information for logging
 */
export interface LogThreat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  source: string;
}

/**
 * Consciousness state for logging
 */
export interface LogConsciousnessState {
  awareness_level: number;
  quantum_coherence: number;
  emotional_state: string;
  decision_confidence: number;
}

/**
 * System metrics for logging
 */
export interface LogMetrics {
  cpu_usage?: number;
  memory_usage?: number;
  network_activity?: {
    connections: number;
    bandwidth?: number;
  };
  disk_usage?: number;
}

/**
 * Security event details for logging
 */
export interface SecurityEventDetails {
  user?: string;
  ip?: string;
  resource?: string;
  action?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

/**
 * Performance operation data
 */
export interface PerformanceData {
  cacheHit?: boolean;
  recordsProcessed?: number;
  bytesProcessed?: number;
  errorCount?: number;
  retryCount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * WebSocket logging data
 */
export interface WebSocketData {
  messageType?: string;
  messageSize?: number;
  connectionDuration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Structured log data - generic wrapper for all log types
 */
export type StructuredLogData =
  | LogMetrics
  | SecurityEventDetails
  | PerformanceData
  | WebSocketData
  | Record<string, unknown>;

/**
 * Type guard for log request
 */
export function isLogRequest(obj: unknown): obj is LogRequest {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'method' in obj &&
    'url' in obj &&
    typeof (obj as LogRequest).method === 'string'
  );
}

/**
 * Type guard for log metrics
 */
export function isLogMetrics(obj: unknown): obj is LogMetrics {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('cpu_usage' in obj || 'memory_usage' in obj || 'network_activity' in obj)
  );
}

/**
 * Type guard for threat
 */
export function isLogThreat(obj: unknown): obj is LogThreat {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'severity' in obj
  );
}
