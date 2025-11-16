/**
 * Enhanced Logger with OpenTelemetry Trace Correlation
 * Structured logging with trace IDs and context propagation
 */

import { trace, context as otelContext, Span } from '@opentelemetry/api';
import { Logger as BaseLogger } from '../utils/logger.js';

export interface LogContext {
  traceId?: string;
  spanId?: string;
  userId?: string;
  requestId?: string;
  ipAddress?: string;
  [key: string]: any;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: string;
  context: string;
  message: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  requestId?: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

/**
 * Enhanced logger with trace correlation
 */
export class EnhancedLogger {
  private context: string;
  private baseLogger: BaseLogger;
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';
  private static enableTracing: boolean = true;

  constructor(context: string) {
    this.context = context;
    this.baseLogger = new BaseLogger(context);
  }

  /**
   * Set global log level
   */
  static setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    EnhancedLogger.logLevel = level;
    BaseLogger.setLogLevel(level);
  }

  /**
   * Enable/disable tracing integration
   */
  static setTracingEnabled(enabled: boolean): void {
    EnhancedLogger.enableTracing = enabled;
  }

  /**
   * Get current trace context
   */
  private getTraceContext(): { traceId?: string; spanId?: string } {
    if (!EnhancedLogger.enableTracing) {
      return {};
    }

    try {
      const span = trace.getActiveSpan();
      if (span) {
        const spanContext = span.spanContext();
        return {
          traceId: spanContext.traceId,
          spanId: spanContext.spanId,
        };
      }
    } catch (error) {
      // Silently fail if tracing is not available
    }

    return {};
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: string,
    message: string,
    data?: any,
    error?: Error,
    additionalContext?: LogContext
  ): StructuredLogEntry {
    const traceContext = this.getTraceContext();

    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      context: this.context,
      message,
      ...traceContext,
      ...additionalContext,
    };

    if (data !== undefined && data !== null) {
      entry.data = data;
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }

    return entry;
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: StructuredLogEntry): string {
    const { timestamp, level, context, message, traceId, spanId, userId, requestId, data, error } = entry;

    // Base message
    let output = `[${timestamp}] ${level} [${context}] ${message}`;

    // Add trace info if available
    if (traceId) {
      output += ` [trace:${traceId.substring(0, 8)}]`;
    }
    if (spanId) {
      output += ` [span:${spanId.substring(0, 8)}]`;
    }

    // Add user/request context
    if (userId) {
      output += ` [user:${userId}]`;
    }
    if (requestId) {
      output += ` [req:${requestId}]`;
    }

    // Add data if present
    if (data !== undefined) {
      output += `\n${JSON.stringify(data, null, 2)}`;
    }

    // Add error details if present
    if (error) {
      output += `\nError: ${error.name}: ${error.message}`;
      if (error.stack) {
        output += `\n${error.stack}`;
      }
    }

    return output;
  }

  /**
   * Should log at this level
   */
  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level as keyof typeof levels] >= levels[EnhancedLogger.logLevel];
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any, additionalContext?: LogContext): void {
    if (this.shouldLog('debug')) {
      const entry = this.createLogEntry('debug', message, data, undefined, additionalContext);
      console.debug(this.formatLogEntry(entry));

      // Also add to active span if available
      this.addLogToSpan('DEBUG', message, data);
    }
  }

  /**
   * Log info message
   */
  info(message: string, data?: any, additionalContext?: LogContext): void {
    if (this.shouldLog('info')) {
      const entry = this.createLogEntry('info', message, data, undefined, additionalContext);
      console.info(this.formatLogEntry(entry));

      this.addLogToSpan('INFO', message, data);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any, additionalContext?: LogContext): void {
    if (this.shouldLog('warn')) {
      const entry = this.createLogEntry('warn', message, data, undefined, additionalContext);
      console.warn(this.formatLogEntry(entry));

      this.addLogToSpan('WARN', message, data);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, additionalContext?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorObj = error instanceof Error ? error : undefined;
      const errorData = error instanceof Error ? undefined : error;

      const entry = this.createLogEntry('error', message, errorData, errorObj, additionalContext);
      console.error(this.formatLogEntry(entry));

      // Record exception on span
      if (errorObj) {
        this.recordExceptionOnSpan(errorObj);
      }
    }
  }

  /**
   * Add log event to active span
   */
  private addLogToSpan(level: string, message: string, data?: any): void {
    if (!EnhancedLogger.enableTracing) {
      return;
    }

    try {
      const span = trace.getActiveSpan();
      if (span) {
        span.addEvent(`log.${level.toLowerCase()}`, {
          'log.message': message,
          'log.level': level,
          'log.context': this.context,
          ...(data && typeof data === 'object' ? { 'log.data': JSON.stringify(data) } : {}),
        });
      }
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * Record exception on active span
   */
  private recordExceptionOnSpan(error: Error): void {
    if (!EnhancedLogger.enableTracing) {
      return;
    }

    try {
      const span = trace.getActiveSpan();
      if (span) {
        span.recordException(error);
      }
    } catch (err) {
      // Silently fail
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(childContext: string, additionalData?: LogContext): EnhancedLogger {
    const childLogger = new EnhancedLogger(`${this.context}:${childContext}`);
    return childLogger;
  }

  /**
   * Log with custom level and full context
   */
  log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any,
    error?: Error,
    additionalContext?: LogContext
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, data, error, additionalContext);
    const output = this.formatLogEntry(entry);

    switch (level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        if (error) {
          this.recordExceptionOnSpan(error);
        }
        break;
    }

    this.addLogToSpan(level.toUpperCase(), message, data);
  }

  /**
   * Get structured log entry (for external logging systems)
   */
  getStructuredLog(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any,
    error?: Error,
    additionalContext?: LogContext
  ): StructuredLogEntry {
    return this.createLogEntry(level, message, data, error, additionalContext);
  }
}

/**
 * Create logger instance
 */
export function createLogger(context: string): EnhancedLogger {
  return new EnhancedLogger(context);
}

/**
 * Middleware to add request context to logs
 */
export function createRequestLogger(requestId: string, userId?: string, ipAddress?: string) {
  return {
    debug: (context: string, message: string, data?: any) => {
      const logger = new EnhancedLogger(context);
      logger.debug(message, data, { requestId, userId, ipAddress });
    },
    info: (context: string, message: string, data?: any) => {
      const logger = new EnhancedLogger(context);
      logger.info(message, data, { requestId, userId, ipAddress });
    },
    warn: (context: string, message: string, data?: any) => {
      const logger = new EnhancedLogger(context);
      logger.warn(message, data, { requestId, userId, ipAddress });
    },
    error: (context: string, message: string, error?: Error | any) => {
      const logger = new EnhancedLogger(context);
      logger.error(message, error, { requestId, userId, ipAddress });
    },
  };
}
