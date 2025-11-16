/**
 * Server with Monitoring Integration - Example
 * Complete example of integrating OpenTelemetry monitoring
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { config } from 'dotenv';
import {
  initializeTelemetry,
  initializeMetrics,
  getMetrics,
  HealthCheckManager,
  registerHealthChecks,
  createLogger,
  biometricTracer,
  threatTracer,
  shutdownTelemetry,
  shutdownMetrics,
} from './monitoring/index.js';

// Load environment variables
config();

const logger = createLogger('starguard-server');

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Initialize monitoring stack
 */
async function initializeMonitoring(): Promise<HealthCheckManager> {
  logger.info('Initializing monitoring stack');

  // 1. Initialize OpenTelemetry
  await initializeTelemetry({
    serviceName: 'starguard2',
    serviceVersion: '1.0.0',
    environment: NODE_ENV,
    jaegerEndpoint: process.env.JAEGER_ENDPOINT,
    otlpEndpoint: process.env.OTLP_ENDPOINT,
    prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9464', 10),
    enableAutoInstrumentation: true,
    enableDebugLogs: NODE_ENV === 'development',
  });

  logger.info('OpenTelemetry initialized');

  // 2. Initialize custom metrics
  initializeMetrics('starguard2');
  logger.info('Custom metrics initialized');

  // 3. Initialize health checks
  const healthCheckManager = new HealthCheckManager({
    // Configure dependencies here
    // redis: {
    //   client: null as any, // Add your Redis client
    //   timeout: 1000,
    // },
    database: {
      checkQuery: async () => {
        // Implement database health check
        return true;
      },
      timeout: 2000,
    },
    mlService: {
      url: process.env.ML_SERVICE_URL || 'http://localhost:5000',
      timeout: 3000,
    },
  });

  logger.info('Health checks configured');

  return healthCheckManager;
}

/**
 * Create and configure Fastify server
 */
async function createServer(healthCheckManager: HealthCheckManager): Promise<FastifyInstance> {
  const fastify: FastifyInstance = Fastify({
    logger: false, // Use our enhanced logger instead
    trustProxy: true,
    maxParamLength: 200,
    bodyLimit: 1048576 * 10, // 10MB
  });

  // Register health check routes FIRST (no auth required)
  registerHealthChecks(fastify, healthCheckManager);

  // Add request logging middleware with trace correlation
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const requestLogger = createLogger('http-request');
    (request as any).startTime = Date.now();

    requestLogger.info('Incoming request', {
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
  });

  // Add metrics recording middleware
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const metrics = getMetrics();
    const duration = Date.now() - ((request as any).startTime || Date.now());

    // Record API response time
    metrics.recordApiResponseTime(
      request.url,
      request.method,
      reply.statusCode,
      duration
    );

    const responseLogger = createLogger('http-response');
    responseLogger.info('Request completed', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
    });
  });

  // Example traced route
  fastify.get('/api/quantum/status', async (request: FastifyRequest, reply: FastifyReply) => {
    const metrics = getMetrics();

    // Use distributed tracing
    return await threatTracer.traceThreatScan('status-check', 1, async (span) => {
      span.setAttribute('user.id', 'example-user');

      // Simulate some work
      const status = {
        healthy: true,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };

      // Record custom metrics
      metrics.recordThreatDetected('low', 'status-check');

      return status;
    });
  });

  // Example biometric authentication route
  fastify.post('/api/auth/biometric', async (request: FastifyRequest, reply: FastifyReply) => {
    const metrics = getMetrics();
    const { userId, biometricData, type } = request.body as any;

    return await biometricTracer.traceAuthentication(userId, type, async (span) => {
      // Simulate authentication
      const confidence = Math.random();
      const success = confidence > 0.7;

      span.setAttribute('auth.confidence', confidence);
      span.setAttribute('auth.success', success);

      // Record metrics
      if (success) {
        metrics.recordAuthSuccess(type, confidence);
      } else {
        metrics.recordAuthFailure(type, 'low_confidence');
      }

      return {
        success,
        confidence,
        timestamp: new Date().toISOString(),
      };
    });
  });

  // Example error handling with tracing
  fastify.setErrorHandler(async (error, request, reply) => {
    const errorLogger = createLogger('error-handler');

    errorLogger.error('Request error', error, {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
    });

    reply.status(500).send({
      error: 'Internal Server Error',
      message: NODE_ENV === 'development' ? error.message : 'An error occurred',
    });
  });

  return fastify;
}

/**
 * Start the server
 */
async function start() {
  let healthCheckManager: HealthCheckManager;
  let fastify: FastifyInstance;

  try {
    // Initialize monitoring
    healthCheckManager = await initializeMonitoring();

    // Create server
    fastify = await createServer(healthCheckManager);

    // Mark as ready
    healthCheckManager.setReady(true);

    // Start listening
    await fastify.listen({ port: PORT, host: HOST });

    logger.info('Server started successfully', {
      port: PORT,
      host: HOST,
      environment: NODE_ENV,
      metrics: `http://localhost:${process.env.PROMETHEUS_PORT || 9464}/metrics`,
      health: `http://localhost:${PORT}/health`,
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);

    try {
      // Mark as not ready (stop accepting new requests)
      healthCheckManager.setReady(false);

      // Close server
      await fastify.close();
      logger.info('Server closed');

      // Shutdown monitoring
      await shutdownTelemetry();
      await shutdownMetrics();
      logger.info('Monitoring shutdown complete');

      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Start the server
start();
