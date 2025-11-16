import { EventEmitter } from 'events';
import { Logger } from './logger';

const logger = new Logger('resource-manager');

/**
 * ResourceManager - Centralized resource cleanup and management
 * Tracks intervals, timeouts, and provides automatic cleanup
 */
export class ResourceManager extends EventEmitter {
  private intervals: Set<NodeJS.Timeout> = new Set();
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private connections: Set<any> = new Set();
  private cleanupCallbacks: Array<() => Promise<void> | void> = [];
  private isShuttingDown: boolean = false;

  /**
   * Track a setInterval for automatic cleanup
   */
  public trackInterval(interval: NodeJS.Timeout): NodeJS.Timeout {
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Track a setTimeout for automatic cleanup
   */
  public trackTimeout(timeout: NodeJS.Timeout): NodeJS.Timeout {
    this.timeouts.add(timeout);
    return timeout;
  }

  /**
   * Track a connection (WebSocket, DB, etc.) for automatic cleanup
   */
  public trackConnection(connection: any): any {
    this.connections.add(connection);
    return connection;
  }

  /**
   * Register a cleanup callback
   */
  public onCleanup(callback: () => Promise<void> | void): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Clean up all tracked resources
   */
  public async cleanup(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    logger.info('Starting resource cleanup');

    // Clear all intervals
    this.intervals.forEach(interval => {
      clearInterval(interval);
    });
    this.intervals.clear();

    // Clear all timeouts
    this.timeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    this.timeouts.clear();

    // Close all connections
    this.connections.forEach(connection => {
      try {
        if (typeof connection.close === 'function') {
          connection.close();
        } else if (typeof connection.end === 'function') {
          connection.end();
        } else if (typeof connection.destroy === 'function') {
          connection.destroy();
        }
      } catch (error) {
        logger.error('Error closing connection:', error instanceof Error ? error : new Error(String(error)));
      }
    });
    this.connections.clear();

    // Run cleanup callbacks
    for (const callback of this.cleanupCallbacks) {
      try {
        await callback();
      } catch (error) {
        logger.error('Error in cleanup callback:', error instanceof Error ? error : new Error(String(error)));
      }
    }
    this.cleanupCallbacks = [];

    this.emit('cleanup-complete');
    logger.info('Resource cleanup complete');
  }

  /**
   * Get resource statistics
   */
  public getStats() {
    return {
      intervals: this.intervals.size,
      timeouts: this.timeouts.size,
      connections: this.connections.size,
      cleanupCallbacks: this.cleanupCallbacks.length
    };
  }
}

/**
 * Global resource manager instance
 */
export const globalResourceManager = new ResourceManager();

/**
 * Register cleanup on process termination
 */
process.on('SIGTERM', async () => {
  await globalResourceManager.cleanup();
});

process.on('SIGINT', async () => {
  await globalResourceManager.cleanup();
});

process.on('uncaughtException', async (error) => {
  logger.error('Uncaught exception:', error);
  await globalResourceManager.cleanup();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  logger.error('Unhandled rejection at:', { promise, reason });
  await globalResourceManager.cleanup();
  process.exit(1);
});

/**
 * TTL Map - Map with automatic expiration
 */
export class TTLMap<K, V> extends Map<K, V> {
  private ttls: Map<K, NodeJS.Timeout> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) {
    super();
    this.defaultTTL = defaultTTL;
  }

  override set(key: K, value: V, ttl?: number): this {
    const timeout = globalResourceManager.trackTimeout(
      setTimeout(() => {
        this.delete(key);
      }, ttl || this.defaultTTL)
    );

    const existingTimeout = this.ttls.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    this.ttls.set(key, timeout);
    return super.set(key, value);
  }

  override delete(key: K): boolean {
    const timeout = this.ttls.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.ttls.delete(key);
    }
    return super.delete(key);
  }

  override clear(): void {
    this.ttls.forEach(timeout => clearTimeout(timeout));
    this.ttls.clear();
    super.clear();
  }

  getTTL(key: K): number | undefined {
    const timeout = this.ttls.get(key);
    return timeout ? (timeout as any)._idleTimeout : undefined;
  }

  refresh(key: K, ttl?: number): boolean {
    if (!this.has(key)) {
      return false;
    }
    const value = this.get(key)!;
    this.set(key, value, ttl);
    return true;
  }
}
