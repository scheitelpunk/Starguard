import { metrics } from '@opentelemetry/api-metrics';
import { trace } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export class MonitoringService {
  private sdk: NodeSDK | null = null;
  private meter = metrics.getMeter('starguard', '1.0.0');
  private tracer = trace.getTracer('starguard', '1.0.0');
  
  // Metrics
  private requestCounter = this.meter.createCounter('http_requests_total', {
    description: 'Total number of HTTP requests'
  });
  
  private responseTime = this.meter.createHistogram('http_response_time_ms', {
    description: 'HTTP response time in milliseconds'
  });
  
  private threatCounter = this.meter.createCounter('threats_detected_total', {
    description: 'Total number of threats detected'
  });
  
  private consciousnessGauge = this.meter.createObservableGauge('consciousness_level', {
    description: 'Current consciousness awareness level'
  });

  initialize(): void {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'starguard',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    });

    // Prometheus metrics exporter
    const prometheusExporter = new PrometheusExporter({
      port: 9090,
    }, () => {
      console.log('Prometheus metrics server started on port 9090');
    });

    // Jaeger tracing exporter
    const jaegerExporter = new JaegerExporter({
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    });

    this.sdk = new NodeSDK({
      resource,
      instrumentations: [],
    });

    this.sdk.start();
  }

  recordRequest(method: string, path: string, statusCode: number, duration: number): void {
    this.requestCounter.add(1, {
      method,
      path,
      status_code: statusCode.toString()
    });
    
    this.responseTime.record(duration, {
      method,
      path
    });
  }

  recordThreat(threatLevel: string, threatType: string): void {
    this.threatCounter.add(1, {
      level: threatLevel,
      type: threatType
    });
  }

  setConsciousnessLevel(level: number): void {
    this.consciousnessGauge.addCallback((observableResult) => {
      observableResult.observe(level);
    });
  }

  startSpan(name: string, fn: () => Promise<any>): Promise<any> {
    return this.tracer.startActiveSpan(name, async (span) => {
      try {
        const result = await fn();
        span.setStatus({ code: 1 });
        return result;
      } catch (error) {
        span.setStatus({ code: 2, message: error.message });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  shutdown(): void {
    if (this.sdk) {
      this.sdk.shutdown();
    }
  }
}

export const monitoring = new MonitoringService();