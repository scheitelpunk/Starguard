/**
 * Monitoring Module - Main Export
 * Centralized exports for all monitoring components
 */

// Telemetry
export {
  TelemetryManager,
  initializeTelemetry,
  getTelemetryManager,
  shutdownTelemetry,
  type TelemetryConfig,
} from './telemetry.js';

// Custom Metrics
export {
  CustomMetrics,
  initializeMetrics,
  getMetrics,
  shutdownMetrics,
} from './custom-metrics.js';

// Distributed Tracing
export {
  traced,
  getTracer,
  biometricTracer,
  threatTracer,
  quantumSwarmTracer,
  defenseEvolutionTracer,
  mlTracer,
  BiometricTracer,
  ThreatTracer,
  QuantumSwarmTracer,
  DefenseEvolutionTracer,
  MLTracer,
  type SpanAttributes,
} from './tracing.js';

// Health Checks
export {
  HealthCheckManager,
  registerHealthChecks,
  type HealthStatus,
  type DependencyConfig,
} from './health-checks.js';

// Enhanced Logger
export {
  EnhancedLogger,
  createLogger,
  createRequestLogger,
  type LogContext,
  type StructuredLogEntry,
} from './logger-enhanced.js';
