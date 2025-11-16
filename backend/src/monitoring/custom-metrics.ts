/**
 * Custom Metrics for Starguard2
 * Business, Performance, and Security Metrics
 */

import { metrics, ValueType } from '@opentelemetry/api';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Logger } from '../utils/logger.js';

const logger = new Logger('metrics');

/**
 * Custom Metrics Manager
 */
export class CustomMetrics {
  private meterProvider: MeterProvider;
  private meter: any;

  // Business Metrics
  private authSuccessCounter: any;
  private authFailureCounter: any;
  private threatDetectionCounter: any;
  private swarmConsensusHistogram: any;
  private defenseEffectivenessGauge: any;
  private sessionDurationHistogram: any;

  // Performance Metrics
  private apiResponseTimeHistogram: any;
  private dbQueryDurationHistogram: any;
  private cacheHitCounter: any;
  private cacheMissCounter: any;
  private wsMessageLatencyHistogram: any;
  private memoryUsageGauge: any;

  // Security Metrics
  private failedAuthAttemptsCounter: any;
  private rateLimitViolationsCounter: any;
  private suspiciousActivityGauge: any;
  private threatIntelUpdateCounter: any;
  private consensusFailureCounter: any;

  constructor(serviceName: string = 'starguard2') {
    // Create meter provider with Prometheus exporter
    const prometheusExporter = new PrometheusExporter({
      port: 9464,
    });

    this.meterProvider = new MeterProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      }),
      readers: [
        new PeriodicExportingMetricReader({
          exporter: prometheusExporter,
          exportIntervalMillis: 10000,
        }),
      ],
    });

    metrics.setGlobalMeterProvider(this.meterProvider);
    this.meter = metrics.getMeter(serviceName, '1.0.0');

    this.initializeMetrics();
    logger.info('Custom metrics initialized');
  }

  /**
   * Initialize all custom metrics
   */
  private initializeMetrics(): void {
    // Business Metrics
    this.authSuccessCounter = this.meter.createCounter('starguard_auth_success_total', {
      description: 'Total successful authentication attempts',
      valueType: ValueType.INT,
    });

    this.authFailureCounter = this.meter.createCounter('starguard_auth_failure_total', {
      description: 'Total failed authentication attempts',
      valueType: ValueType.INT,
    });

    this.threatDetectionCounter = this.meter.createCounter('starguard_threats_detected_total', {
      description: 'Total threats detected',
      valueType: ValueType.INT,
    });

    this.swarmConsensusHistogram = this.meter.createHistogram('starguard_swarm_consensus_duration_ms', {
      description: 'Time taken to achieve swarm consensus in milliseconds',
      valueType: ValueType.DOUBLE,
    });

    this.defenseEffectivenessGauge = this.meter.createObservableGauge('starguard_defense_effectiveness', {
      description: 'Current defense strategy effectiveness score (0-100)',
      valueType: ValueType.DOUBLE,
    });

    this.sessionDurationHistogram = this.meter.createHistogram('starguard_session_duration_seconds', {
      description: 'User session duration in seconds',
      valueType: ValueType.DOUBLE,
    });

    // Performance Metrics
    this.apiResponseTimeHistogram = this.meter.createHistogram('starguard_api_response_time_ms', {
      description: 'API endpoint response time in milliseconds',
      valueType: ValueType.DOUBLE,
    });

    this.dbQueryDurationHistogram = this.meter.createHistogram('starguard_db_query_duration_ms', {
      description: 'Database query duration in milliseconds',
      valueType: ValueType.DOUBLE,
    });

    this.cacheHitCounter = this.meter.createCounter('starguard_cache_hit_total', {
      description: 'Total cache hits',
      valueType: ValueType.INT,
    });

    this.cacheMissCounter = this.meter.createCounter('starguard_cache_miss_total', {
      description: 'Total cache misses',
      valueType: ValueType.INT,
    });

    this.wsMessageLatencyHistogram = this.meter.createHistogram('starguard_websocket_message_latency_ms', {
      description: 'WebSocket message latency in milliseconds',
      valueType: ValueType.DOUBLE,
    });

    this.memoryUsageGauge = this.meter.createObservableGauge('starguard_memory_usage_bytes', {
      description: 'Memory usage by component in bytes',
      valueType: ValueType.DOUBLE,
    });

    // Security Metrics
    this.failedAuthAttemptsCounter = this.meter.createCounter('starguard_failed_auth_attempts_total', {
      description: 'Total failed authentication attempts (potential attacks)',
      valueType: ValueType.INT,
    });

    this.rateLimitViolationsCounter = this.meter.createCounter('starguard_rate_limit_violations_total', {
      description: 'Total rate limit violations',
      valueType: ValueType.INT,
    });

    this.suspiciousActivityGauge = this.meter.createObservableGauge('starguard_suspicious_activity_score', {
      description: 'Current suspicious activity score (0-100)',
      valueType: ValueType.DOUBLE,
    });

    this.threatIntelUpdateCounter = this.meter.createCounter('starguard_threat_intel_updates_total', {
      description: 'Total threat intelligence updates received',
      valueType: ValueType.INT,
    });

    this.consensusFailureCounter = this.meter.createCounter('starguard_consensus_failures_total', {
      description: 'Total consensus failures in swarm',
      valueType: ValueType.INT,
    });
  }

  // Business Metrics Methods
  recordAuthSuccess(biometricType: string, confidence: number): void {
    this.authSuccessCounter.add(1, {
      biometric_type: biometricType,
      confidence_range: this.getConfidenceRange(confidence),
    });
  }

  recordAuthFailure(biometricType: string, reason: string): void {
    this.authFailureCounter.add(1, {
      biometric_type: biometricType,
      failure_reason: reason,
    });
  }

  recordThreatDetected(severity: string, threatType: string): void {
    this.threatDetectionCounter.add(1, {
      severity,
      threat_type: threatType,
    });
  }

  recordSwarmConsensusTime(durationMs: number, agentCount: number, success: boolean): void {
    this.swarmConsensusHistogram.record(durationMs, {
      agent_count: String(agentCount),
      success: String(success),
    });
  }

  recordSessionDuration(durationSeconds: number, userId: string): void {
    this.sessionDurationHistogram.record(durationSeconds, {
      user_type: this.getUserType(userId),
    });
  }

  // Performance Metrics Methods
  recordApiResponseTime(
    endpoint: string,
    method: string,
    statusCode: number,
    durationMs: number
  ): void {
    this.apiResponseTimeHistogram.record(durationMs, {
      endpoint,
      method,
      status_code: String(statusCode),
    });
  }

  recordDbQueryDuration(queryType: string, table: string, durationMs: number): void {
    this.dbQueryDurationHistogram.record(durationMs, {
      query_type: queryType,
      table,
    });
  }

  recordCacheHit(cacheKey: string): void {
    this.cacheHitCounter.add(1, {
      cache_type: this.getCacheType(cacheKey),
    });
  }

  recordCacheMiss(cacheKey: string): void {
    this.cacheMissCounter.add(1, {
      cache_type: this.getCacheType(cacheKey),
    });
  }

  recordWebSocketLatency(messageType: string, latencyMs: number): void {
    this.wsMessageLatencyHistogram.record(latencyMs, {
      message_type: messageType,
    });
  }

  // Security Metrics Methods
  recordFailedAuthAttempt(userId: string, ipAddress: string, reason: string): void {
    this.failedAuthAttemptsCounter.add(1, {
      reason,
      ip_subnet: this.getSubnet(ipAddress),
    });
  }

  recordRateLimitViolation(endpoint: string, ipAddress: string): void {
    this.rateLimitViolationsCounter.add(1, {
      endpoint,
      ip_subnet: this.getSubnet(ipAddress),
    });
  }

  recordThreatIntelUpdate(source: string, threatsAdded: number): void {
    this.threatIntelUpdateCounter.add(threatsAdded, {
      source,
    });
  }

  recordConsensusFailure(reason: string): void {
    this.consensusFailureCounter.add(1, {
      reason,
    });
  }

  // Utility Methods
  private getConfidenceRange(confidence: number): string {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  }

  private getUserType(userId: string): string {
    // Simplified - in production, look up actual user type
    return userId.startsWith('admin_') ? 'admin' : 'user';
  }

  private getCacheType(cacheKey: string): string {
    if (cacheKey.startsWith('threat:')) return 'threat';
    if (cacheKey.startsWith('user:')) return 'user';
    if (cacheKey.startsWith('session:')) return 'session';
    return 'other';
  }

  private getSubnet(ipAddress: string): string {
    // Get /24 subnet
    const parts = ipAddress.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }

  /**
   * Shutdown metrics gracefully
   */
  async shutdown(): Promise<void> {
    await this.meterProvider.shutdown();
    logger.info('Custom metrics shut down');
  }
}

// Singleton instance
let customMetrics: CustomMetrics | null = null;

/**
 * Initialize custom metrics
 */
export function initializeMetrics(serviceName: string = 'starguard2'): CustomMetrics {
  if (!customMetrics) {
    customMetrics = new CustomMetrics(serviceName);
  }
  return customMetrics;
}

/**
 * Get metrics instance
 */
export function getMetrics(): CustomMetrics {
  if (!customMetrics) {
    throw new Error('Metrics not initialized. Call initializeMetrics() first.');
  }
  return customMetrics;
}

/**
 * Shutdown metrics
 */
export async function shutdownMetrics(): Promise<void> {
  if (customMetrics) {
    await customMetrics.shutdown();
    customMetrics = null;
  }
}
