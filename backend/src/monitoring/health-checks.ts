/**
 * Enhanced Health Checks
 * Liveness, readiness, and startup probes for Kubernetes
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '../utils/logger.js';
import Redis from 'ioredis';

const logger = new Logger('health-checks');

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      message?: string;
      responseTime?: number;
      details?: any;
    };
  };
}

export interface DependencyConfig {
  redis?: {
    client: Redis;
    timeout?: number;
  };
  database?: {
    checkQuery: () => Promise<boolean>;
    timeout?: number;
  };
  mlService?: {
    url: string;
    timeout?: number;
  };
}

/**
 * Health Check Manager
 */
export class HealthCheckManager {
  private startTime: number;
  private isReady: boolean = false;
  private dependencies: DependencyConfig;

  constructor(dependencies: DependencyConfig = {}) {
    this.startTime = Date.now();
    this.dependencies = dependencies;
  }

  /**
   * Mark service as ready to accept traffic
   */
  setReady(ready: boolean = true): void {
    this.isReady = ready;
    logger.info(`Service readiness set to: ${ready}`);
  }

  /**
   * Liveness Probe - Is the service running?
   * Used by Kubernetes to restart the container if this fails
   */
  async checkLiveness(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = {};

    // Check if process is responsive
    checks.process = {
      status: 'pass',
      message: 'Process is responsive',
      details: {
        pid: process.pid,
        uptime: process.uptime(),
      },
    };

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    checks.memory = {
      status: memUsagePercent > 90 ? 'fail' : memUsagePercent > 80 ? 'warn' : 'pass',
      message: `Heap usage: ${memUsagePercent.toFixed(2)}%`,
      details: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      },
    };

    // Check event loop lag
    const eventLoopLag = await this.checkEventLoopLag();
    checks.eventLoop = {
      status: eventLoopLag > 1000 ? 'fail' : eventLoopLag > 500 ? 'warn' : 'pass',
      message: `Event loop lag: ${eventLoopLag}ms`,
      responseTime: eventLoopLag,
    };

    const overallStatus = this.calculateOverallStatus(checks);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks,
    };
  }

  /**
   * Readiness Probe - Can the service accept traffic?
   * Used by Kubernetes to route traffic to the container
   */
  async checkReadiness(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = {};

    // Check if service marked as ready
    checks.serviceReady = {
      status: this.isReady ? 'pass' : 'fail',
      message: this.isReady ? 'Service is ready' : 'Service not ready',
    };

    // Check Redis connection
    if (this.dependencies.redis) {
      const redisCheck = await this.checkRedis();
      checks.redis = redisCheck;
    }

    // Check database connection
    if (this.dependencies.database) {
      const dbCheck = await this.checkDatabase();
      checks.database = dbCheck;
    }

    // Check ML service
    if (this.dependencies.mlService) {
      const mlCheck = await this.checkMLService();
      checks.mlService = mlCheck;
    }

    const overallStatus = this.calculateOverallStatus(checks);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks,
    };
  }

  /**
   * Startup Probe - Has the service completed initialization?
   * Used by Kubernetes to know when the container is ready to receive liveness checks
   */
  async checkStartup(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = {};

    // Check if all critical components are initialized
    checks.initialization = {
      status: this.isReady ? 'pass' : 'fail',
      message: this.isReady ? 'All components initialized' : 'Initialization in progress',
    };

    // Check minimum uptime (service should be up for at least 5 seconds)
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    checks.uptime = {
      status: uptimeSeconds >= 5 ? 'pass' : 'warn',
      message: `Service uptime: ${uptimeSeconds.toFixed(2)}s`,
      responseTime: uptimeSeconds,
    };

    const overallStatus = this.calculateOverallStatus(checks);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks,
    };
  }

  /**
   * Comprehensive health check
   */
  async checkHealth(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = {};

    // Run all dependency checks
    const [liveness, readiness] = await Promise.all([
      this.checkLiveness(),
      this.checkReadiness(),
    ]);

    // Merge all checks
    Object.assign(checks, liveness.checks, readiness.checks);

    const overallStatus = this.calculateOverallStatus(checks);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks,
    };
  }

  /**
   * Check Redis connection
   */
  private async checkRedis(): Promise<HealthStatus['checks'][string]> {
    if (!this.dependencies.redis) {
      return { status: 'pass', message: 'Redis not configured' };
    }

    const startTime = Date.now();
    try {
      const timeout = this.dependencies.redis.timeout || 1000;
      const pingPromise = this.dependencies.redis.client.ping();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis ping timeout')), timeout)
      );

      await Promise.race([pingPromise, timeoutPromise]);
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime > 500 ? 'warn' : 'pass',
        message: 'Redis connection OK',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Redis check failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check database connection
   */
  private async checkDatabase(): Promise<HealthStatus['checks'][string]> {
    if (!this.dependencies.database) {
      return { status: 'pass', message: 'Database not configured' };
    }

    const startTime = Date.now();
    try {
      const timeout = this.dependencies.database.timeout || 2000;
      const queryPromise = this.dependencies.database.checkQuery();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), timeout)
      );

      await Promise.race([queryPromise, timeoutPromise]);
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime > 1000 ? 'warn' : 'pass',
        message: 'Database connection OK',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Database check failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check ML service availability
   */
  private async checkMLService(): Promise<HealthStatus['checks'][string]> {
    if (!this.dependencies.mlService) {
      return { status: 'pass', message: 'ML service not configured' };
    }

    const startTime = Date.now();
    try {
      const timeout = this.dependencies.mlService.timeout || 3000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.dependencies.mlService.url}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          status: responseTime > 2000 ? 'warn' : 'pass',
          message: 'ML service OK',
          responseTime,
        };
      } else {
        return {
          status: 'fail',
          message: `ML service returned status ${response.status}`,
          responseTime,
        };
      }
    } catch (error) {
      return {
        status: 'fail',
        message: `ML service check failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Measure event loop lag
   */
  private checkEventLoopLag(): Promise<number> {
    const start = Date.now();
    return new Promise((resolve) => {
      setImmediate(() => {
        resolve(Date.now() - start);
      });
    });
  }

  /**
   * Calculate overall status from individual checks
   */
  private calculateOverallStatus(
    checks: HealthStatus['checks']
  ): 'healthy' | 'unhealthy' | 'degraded' {
    const statuses = Object.values(checks).map((check) => check.status);

    if (statuses.some((s) => s === 'fail')) {
      return 'unhealthy';
    }
    if (statuses.some((s) => s === 'warn')) {
      return 'degraded';
    }
    return 'healthy';
  }
}

/**
 * Register health check routes in Fastify
 */
export function registerHealthChecks(
  fastify: FastifyInstance,
  healthCheckManager: HealthCheckManager
): void {
  // Liveness probe
  fastify.get('/health/live', async (request: FastifyRequest, reply: FastifyReply) => {
    const health = await healthCheckManager.checkLiveness();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    reply.code(statusCode).send(health);
  });

  // Readiness probe
  fastify.get('/health/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    const health = await healthCheckManager.checkReadiness();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    reply.code(statusCode).send(health);
  });

  // Startup probe
  fastify.get('/health/startup', async (request: FastifyRequest, reply: FastifyReply) => {
    const health = await healthCheckManager.checkStartup();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    reply.code(statusCode).send(health);
  });

  // Comprehensive health check
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    const health = await healthCheckManager.checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    reply.code(statusCode).send(health);
  });

  logger.info('Health check routes registered');
}
