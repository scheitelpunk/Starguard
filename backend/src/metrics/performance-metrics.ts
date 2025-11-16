import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { Logger } from '../utils/logger.js';

/**
 * PerformanceMetrics - Prometheus metrics for production monitoring
 *
 * Features:
 * - HTTP request metrics
 * - Response time histograms
 * - Error rate tracking
 * - Cache hit rates
 * - Database query metrics
 * - WebSocket connection metrics
 * - Custom business metrics
 */
export class PerformanceMetrics {
  private logger: Logger;

  // HTTP Metrics
  private httpRequestsTotal: Counter;
  private httpRequestDuration: Histogram;
  private httpRequestSize: Histogram;
  private httpResponseSize: Histogram;
  private httpErrorsTotal: Counter;

  // Cache Metrics
  private cacheHitsTotal: Counter;
  private cacheMissesTotal: Counter;
  private cacheSize: Gauge;

  // Database Metrics
  private dbQueryDuration: Histogram;
  private dbQueryErrors: Counter;
  private dbConnectionsActive: Gauge;

  // WebSocket Metrics
  private wsConnectionsActive: Gauge;
  private wsMessagesTotal: Counter;
  private wsMessageSize: Histogram;

  // Worker Metrics
  private workerTasksTotal: Counter;
  private workerTaskDuration: Histogram;
  private workerPoolUtilization: Gauge;

  // Business Metrics
  private threatsDetected: Counter;
  private authenticationAttempts: Counter;
  private authenticationFailures: Counter;
  private quantumEventsTotal: Counter;

  constructor() {
    this.logger = new Logger('performance-metrics');

    // Enable default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ prefix: 'starguard_' });

    // HTTP Metrics
    this.httpRequestsTotal = new Counter({
      name: 'starguard_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'starguard_http_request_duration_ms',
      help: 'HTTP request duration in milliseconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
    });

    this.httpRequestSize = new Histogram({
      name: 'starguard_http_request_size_bytes',
      help: 'HTTP request size in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
    });

    this.httpResponseSize = new Histogram({
      name: 'starguard_http_response_size_bytes',
      help: 'HTTP response size in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
    });

    this.httpErrorsTotal = new Counter({
      name: 'starguard_http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'status'],
    });

    // Cache Metrics
    this.cacheHitsTotal = new Counter({
      name: 'starguard_cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
    });

    this.cacheMissesTotal = new Counter({
      name: 'starguard_cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
    });

    this.cacheSize = new Gauge({
      name: 'starguard_cache_size_bytes',
      help: 'Current cache size in bytes',
      labelNames: ['cache_type'],
    });

    // Database Metrics
    this.dbQueryDuration = new Histogram({
      name: 'starguard_db_query_duration_ms',
      help: 'Database query duration in milliseconds',
      labelNames: ['operation', 'table'],
      buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
    });

    this.dbQueryErrors = new Counter({
      name: 'starguard_db_query_errors_total',
      help: 'Total number of database query errors',
      labelNames: ['operation', 'table'],
    });

    this.dbConnectionsActive = new Gauge({
      name: 'starguard_db_connections_active',
      help: 'Number of active database connections',
    });

    // WebSocket Metrics
    this.wsConnectionsActive = new Gauge({
      name: 'starguard_ws_connections_active',
      help: 'Number of active WebSocket connections',
    });

    this.wsMessagesTotal = new Counter({
      name: 'starguard_ws_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['direction', 'type'],
    });

    this.wsMessageSize = new Histogram({
      name: 'starguard_ws_message_size_bytes',
      help: 'WebSocket message size in bytes',
      labelNames: ['direction'],
      buckets: [100, 1000, 10000, 100000],
    });

    // Worker Metrics
    this.workerTasksTotal = new Counter({
      name: 'starguard_worker_tasks_total',
      help: 'Total number of worker tasks',
      labelNames: ['type', 'status'],
    });

    this.workerTaskDuration = new Histogram({
      name: 'starguard_worker_task_duration_ms',
      help: 'Worker task duration in milliseconds',
      labelNames: ['type'],
      buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
    });

    this.workerPoolUtilization = new Gauge({
      name: 'starguard_worker_pool_utilization',
      help: 'Worker pool utilization percentage',
    });

    // Business Metrics
    this.threatsDetected = new Counter({
      name: 'starguard_threats_detected_total',
      help: 'Total number of threats detected',
      labelNames: ['type', 'severity'],
    });

    this.authenticationAttempts = new Counter({
      name: 'starguard_auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['method'],
    });

    this.authenticationFailures = new Counter({
      name: 'starguard_auth_failures_total',
      help: 'Total number of authentication failures',
      labelNames: ['method', 'reason'],
    });

    this.quantumEventsTotal = new Counter({
      name: 'starguard_quantum_events_total',
      help: 'Total number of quantum events',
      labelNames: ['type'],
    });
  }

  /**
   * Register metrics endpoint with Fastify
   */
  register(fastify: FastifyInstance): void {
    // Metrics endpoint
    fastify.get('/metrics', async (request, reply) => {
      reply.header('Content-Type', register.contentType);
      return register.metrics();
    });

    // Add hooks for automatic HTTP metrics collection
    fastify.addHook('onRequest', async (request, reply) => {
      (request as any).startTime = Date.now();
    });

    fastify.addHook('onResponse', async (request, reply) => {
      const duration = Date.now() - ((request as any).startTime || Date.now());
      const route = this.normalizeRoute(request.routerPath || request.url);
      const method = request.method;
      const status = reply.statusCode;

      // Record metrics
      this.httpRequestsTotal.inc({ method, route, status });
      this.httpRequestDuration.observe({ method, route, status }, duration);

      if (status >= 400) {
        this.httpErrorsTotal.inc({ method, route, status });
      }

      // Record request/response sizes if available
      const requestSize = request.headers['content-length'];
      if (requestSize) {
        this.httpRequestSize.observe({ method, route }, parseInt(requestSize));
      }

      const responseSize = reply.getHeader('content-length');
      if (responseSize) {
        this.httpResponseSize.observe({ method, route }, parseInt(responseSize as string));
      }
    });

    this.logger.info('Performance metrics registered at /metrics');
  }

  /**
   * Normalize route for consistent metrics
   */
  private normalizeRoute(route: string): string {
    return route
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id') // UUIDs
      .replace(/\/\d+/g, '/:id') // Numeric IDs
      .replace(/\?.*$/, ''); // Query strings
  }

  /**
   * Record cache hit
   */
  recordCacheHit(cacheType: 'redis' | 'memory'): void {
    this.cacheHitsTotal.inc({ cache_type: cacheType });
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(cacheType: 'redis' | 'memory'): void {
    this.cacheMissesTotal.inc({ cache_type: cacheType });
  }

  /**
   * Update cache size
   */
  updateCacheSize(cacheType: 'redis' | 'memory', size: number): void {
    this.cacheSize.set({ cache_type: cacheType }, size);
  }

  /**
   * Record database query
   */
  recordDbQuery(operation: string, table: string, duration: number, error?: boolean): void {
    this.dbQueryDuration.observe({ operation, table }, duration);

    if (error) {
      this.dbQueryErrors.inc({ operation, table });
    }
  }

  /**
   * Update database connections
   */
  updateDbConnections(count: number): void {
    this.dbConnectionsActive.set(count);
  }

  /**
   * Update WebSocket connections
   */
  updateWsConnections(count: number): void {
    this.wsConnectionsActive.set(count);
  }

  /**
   * Record WebSocket message
   */
  recordWsMessage(direction: 'inbound' | 'outbound', type: string, size: number): void {
    this.wsMessagesTotal.inc({ direction, type });
    this.wsMessageSize.observe({ direction }, size);
  }

  /**
   * Record worker task
   */
  recordWorkerTask(type: string, duration: number, status: 'success' | 'error'): void {
    this.workerTasksTotal.inc({ type, status });
    this.workerTaskDuration.observe({ type }, duration);
  }

  /**
   * Update worker pool utilization
   */
  updateWorkerPoolUtilization(percentage: number): void {
    this.workerPoolUtilization.set(percentage);
  }

  /**
   * Record threat detection
   */
  recordThreatDetected(type: string, severity: string): void {
    this.threatsDetected.inc({ type, severity });
  }

  /**
   * Record authentication attempt
   */
  recordAuthAttempt(method: string, success: boolean, reason?: string): void {
    this.authenticationAttempts.inc({ method });

    if (!success && reason) {
      this.authenticationFailures.inc({ method, reason });
    }
  }

  /**
   * Record quantum event
   */
  recordQuantumEvent(type: string): void {
    this.quantumEventsTotal.inc({ type });
  }

  /**
   * Get current metrics as JSON
   */
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    register.clear();
    this.logger.info('All metrics reset');
  }
}

export default PerformanceMetrics;
