/**
 * OpenTelemetry Telemetry Configuration
 * Comprehensive distributed tracing and metrics export setup
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { Logger } from '../utils/logger.js';

const logger = new Logger('telemetry');

export interface TelemetryConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  jaegerEndpoint?: string;
  otlpEndpoint?: string;
  prometheusPort?: number;
  enableAutoInstrumentation?: boolean;
  enableDebugLogs?: boolean;
}

export class TelemetryManager {
  private sdk: NodeSDK | null = null;
  private prometheusExporter: PrometheusExporter | null = null;
  private config: TelemetryConfig;

  constructor(config: TelemetryConfig) {
    this.config = {
      jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
      otlpEndpoint: process.env.OTLP_ENDPOINT || 'http://localhost:4318',
      prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9464', 10),
      enableAutoInstrumentation: true,
      enableDebugLogs: false,
      ...config,
    };
  }

  /**
   * Initialize OpenTelemetry SDK with all exporters and instrumentations
   */
  async initialize(): Promise<void> {
    try {
      // Enable diagnostic logging if requested
      if (this.config.enableDebugLogs) {
        diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
      }

      // Create resource with service information
      const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.config.serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: this.config.serviceVersion,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: this.config.environment,
        'service.instance.id': process.env.HOSTNAME || 'localhost',
        'service.namespace': 'starguard2',
      });

      // Configure trace exporters
      const traceExporters = this.createTraceExporters();

      // Configure metric exporters
      const metricReaders = this.createMetricReaders();

      // Initialize SDK
      this.sdk = new NodeSDK({
        resource,
        spanProcessors: traceExporters.map(exporter => new BatchSpanProcessor(exporter)),
        metricReader: metricReaders[0], // Primary metric reader
        instrumentations: this.config.enableAutoInstrumentation
          ? [
              getNodeAutoInstrumentations({
                '@opentelemetry/instrumentation-fs': { enabled: false }, // Reduce noise
                '@opentelemetry/instrumentation-net': { enabled: false },
                '@opentelemetry/instrumentation-dns': { enabled: false },
              }),
            ]
          : [],
      });

      await this.sdk.start();
      logger.info('OpenTelemetry SDK initialized successfully', {
        service: this.config.serviceName,
        version: this.config.serviceVersion,
        environment: this.config.environment,
      });
    } catch (error) {
      logger.error('Failed to initialize OpenTelemetry SDK', error);
      throw error;
    }
  }

  /**
   * Create trace exporters based on configuration
   */
  private createTraceExporters(): Array<JaegerExporter | OTLPTraceExporter> {
    const exporters: Array<JaegerExporter | OTLPTraceExporter> = [];

    // Jaeger exporter (for Jaeger UI)
    if (this.config.jaegerEndpoint) {
      exporters.push(
        new JaegerExporter({
          endpoint: this.config.jaegerEndpoint,
        })
      );
      logger.info('Jaeger trace exporter configured', {
        endpoint: this.config.jaegerEndpoint,
      });
    }

    // OTLP HTTP exporter (for generic collectors)
    if (this.config.otlpEndpoint) {
      exporters.push(
        new OTLPTraceExporter({
          url: `${this.config.otlpEndpoint}/v1/traces`,
        })
      );
      logger.info('OTLP trace exporter configured', {
        endpoint: this.config.otlpEndpoint,
      });
    }

    return exporters;
  }

  /**
   * Create metric readers/exporters
   */
  private createMetricReaders(): PeriodicExportingMetricReader[] {
    const readers: PeriodicExportingMetricReader[] = [];

    // Prometheus exporter (pull-based)
    if (this.config.prometheusPort) {
      this.prometheusExporter = new PrometheusExporter({
        port: this.config.prometheusPort,
      });
      logger.info('Prometheus exporter configured', {
        port: this.config.prometheusPort,
        endpoint: `http://localhost:${this.config.prometheusPort}/metrics`,
      });
    }

    // OTLP metrics exporter (push-based)
    if (this.config.otlpEndpoint) {
      const otlpMetricExporter = new OTLPMetricExporter({
        url: `${this.config.otlpEndpoint}/v1/metrics`,
      });
      readers.push(
        new PeriodicExportingMetricReader({
          exporter: otlpMetricExporter,
          exportIntervalMillis: 10000, // Export every 10 seconds
        })
      );
      logger.info('OTLP metrics exporter configured');
    }

    return readers;
  }

  /**
   * Shutdown telemetry gracefully
   */
  async shutdown(): Promise<void> {
    try {
      if (this.sdk) {
        await this.sdk.shutdown();
        logger.info('OpenTelemetry SDK shut down successfully');
      }
      if (this.prometheusExporter) {
        await this.prometheusExporter.shutdown();
        logger.info('Prometheus exporter shut down successfully');
      }
    } catch (error) {
      logger.error('Error shutting down telemetry', error);
      throw error;
    }
  }

  /**
   * Get Prometheus metrics endpoint URL
   */
  getPrometheusEndpoint(): string | null {
    return this.config.prometheusPort
      ? `http://localhost:${this.config.prometheusPort}/metrics`
      : null;
  }
}

// Singleton instance
let telemetryManager: TelemetryManager | null = null;

/**
 * Initialize global telemetry manager
 */
export async function initializeTelemetry(config: TelemetryConfig): Promise<TelemetryManager> {
  if (telemetryManager) {
    logger.warn('Telemetry already initialized');
    return telemetryManager;
  }

  telemetryManager = new TelemetryManager(config);
  await telemetryManager.initialize();
  return telemetryManager;
}

/**
 * Get global telemetry manager instance
 */
export function getTelemetryManager(): TelemetryManager | null {
  return telemetryManager;
}

/**
 * Shutdown global telemetry
 */
export async function shutdownTelemetry(): Promise<void> {
  if (telemetryManager) {
    await telemetryManager.shutdown();
    telemetryManager = null;
  }
}
