// STARGUARD Production Logger
// High-performance logging with structured output

import pino from 'pino';
import { config } from '../config/index.js';

// Create base logger with production optimizations
const baseLogger = pino({
  level: config.logging.level,
  ...(config.logging.pretty && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname'
      }
    }
  }),
  formatters: {
    level: (label) => {
      return { level: label };
    },
    bindings: (bindings) => {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
        service: 'starguard-backend'
      };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'api_key',
      'secret',
      'private_key'
    ],
    remove: true
  }
});

// Enhanced logger with context methods
export class Logger {
  private logger: pino.Logger;
  
  constructor(context?: string) {
    this.logger = context ? baseLogger.child({ context }) : baseLogger;
  }

  // Standard log levels
  fatal(message: string, data?: any): void {
    this.logger.fatal(data, message);
  }

  error(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      this.logger.error({ 
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      }, message);
    } else {
      this.logger.error(error, message);
    }
  }

  warn(message: string, data?: any): void {
    this.logger.warn(data, message);
  }

  info(message: string, data?: any): void {
    this.logger.info(data, message);
  }

  debug(message: string, data?: any): void {
    this.logger.debug(data, message);
  }

  trace(message: string, data?: any): void {
    this.logger.trace(data, message);
  }

  // Specialized logging methods
  request(req: any, res: any): void {
    this.logger.info({
      request: {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        contentLength: req.headers['content-length']
      },
      response: {
        statusCode: res.statusCode,
        responseTime: res.getResponseTime?.() || 0
      }
    }, `${req.method} ${req.url} - ${res.statusCode}`);
  }

  websocket(action: string, clientId: string, data?: any): void {
    this.logger.info({
      websocket: {
        action,
        clientId,
        ...data
      }
    }, `WebSocket: ${action} - ${clientId}`);
  }

  threat(threat: any): void {
    this.logger.warn({
      threat: {
        id: threat.id,
        type: threat.type,
        severity: threat.severity,
        confidence: threat.confidence,
        source: threat.source
      }
    }, `Threat detected: ${threat.type} (${threat.severity})`);
  }

  consciousness(state: any): void {
    this.logger.info({
      consciousness: {
        awareness: state.awareness_level,
        coherence: state.quantum_coherence,
        emotion: state.emotional_state,
        confidence: state.decision_confidence
      }
    }, `Consciousness update: ${state.emotional_state}`);
  }

  metrics(metrics: any): void {
    this.logger.debug({
      metrics: {
        cpu: metrics.cpu_usage,
        memory: metrics.memory_usage,
        connections: metrics.network_activity?.connections || 0
      }
    }, 'System metrics updated');
  }

  security(event: string, details?: any): void {
    this.logger.warn({
      security: {
        event,
        timestamp: Date.now(),
        ...details
      }
    }, `Security event: ${event}`);
  }

  performance(operation: string, duration: number, data?: any): void {
    this.logger.info({
      performance: {
        operation,
        duration,
        ...data
      }
    }, `Performance: ${operation} completed in ${duration}ms`);
  }

  database(operation: string, table?: string, duration?: number): void {
    this.logger.debug({
      database: {
        operation,
        table,
        duration
      }
    }, `Database: ${operation}${table ? ` on ${table}` : ''}`);
  }

  // Memory and resource tracking
  memory(): void {
    const usage = process.memoryUsage();
    const mbUsage = {
      rss: Math.round(usage.rss / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024)
    };
    
    this.logger.debug({ memory: mbUsage }, 'Memory usage snapshot');
  }

  // Error context enhancement
  withContext(context: Record<string, any>): Logger {
    return new Logger('custom');
  }

  // Flush logs (useful for graceful shutdown)
  async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.flush();
      // Give a small delay to ensure logs are written
      setTimeout(resolve, 100);
    });
  }
}

// Export default logger instance
export const logger = new Logger('starguard');

// Export specialized loggers
export const requestLogger = new Logger('http');
export const wsLogger = new Logger('websocket');
export const dbLogger = new Logger('database');
export const securityLogger = new Logger('security');
export const metricsLogger = new Logger('metrics');

// Performance measurement utilities
export class PerformanceTimer {
  private start: number;
  private operation: string;
  
  constructor(operation: string) {
    this.operation = operation;
    this.start = Date.now();
  }
  
  end(data?: any): number {
    const duration = Date.now() - this.start;
    logger.performance(this.operation, duration, data);
    return duration;
  }
}

export function timer(operation: string): PerformanceTimer {
  return new PerformanceTimer(operation);
}

// Request ID generation for tracing
let requestCounter = 0;
export function generateRequestId(): string {
  return `req_${Date.now()}_${++requestCounter}`;
}

// Log level management
export function setLogLevel(level: string): void {
  baseLogger.level = level;
  logger.info(`Log level changed to: ${level}`);
}

// Graceful shutdown logging
export async function gracefulShutdown(): Promise<void> {
  logger.info('Initiating graceful shutdown...');
  await logger.flush();
  
  // Final memory snapshot
  logger.memory();
  
  logger.info('Logging system shutdown complete');
  await logger.flush();
}
