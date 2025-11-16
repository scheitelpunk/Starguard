import { Logger } from '../utils/logger.js';

export interface CoalescerConfig {
  windowMs: number;        // Time window to coalesce requests (ms)
  maxWaitMs: number;       // Maximum wait time before executing
  keyExtractor: (args: any[]) => string;  // Extract cache key from arguments
}

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (error: any) => void;
  timestamp: number;
}

/**
 * RequestCoalescer - Deduplicate concurrent identical requests
 *
 * Features:
 * - Automatic request deduplication
 * - Configurable coalescing windows
 * - Promise-based API
 * - Performance metrics
 *
 * Use case: Multiple clients requesting same data simultaneously
 * Result: Single backend operation serves all clients
 */
export class RequestCoalescer<T = any> {
  private logger: Logger;
  private config: CoalescerConfig;
  private pending: Map<string, PendingRequest<T>[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private stats = {
    requests: 0,
    coalesced: 0,
    executed: 0,
    errors: 0,
  };

  constructor(config: Partial<CoalescerConfig> = {}) {
    this.logger = new Logger('request-coalescer');
    this.config = {
      windowMs: config.windowMs || 100,
      maxWaitMs: config.maxWaitMs || 1000,
      keyExtractor: config.keyExtractor || ((args: any[]) => JSON.stringify(args)),
    };
  }

  /**
   * Execute function with request coalescing
   */
  async execute(
    fn: (...args: any[]) => Promise<T>,
    ...args: any[]
  ): Promise<T> {
    this.stats.requests++;

    // Generate cache key
    const key = this.config.keyExtractor(args);

    // Check if there's a pending request for this key
    if (this.pending.has(key)) {
      // Coalesce with existing request
      this.stats.coalesced++;

      return new Promise<T>((resolve, reject) => {
        const requests = this.pending.get(key)!;
        requests.push({
          resolve,
          reject,
          timestamp: Date.now(),
        });
      });
    }

    // Create new pending request group
    return new Promise<T>((resolve, reject) => {
      this.pending.set(key, [{
        resolve,
        reject,
        timestamp: Date.now(),
      }]);

      // Schedule execution
      const timer = setTimeout(async () => {
        await this.executeRequest(key, fn, args);
      }, this.config.windowMs);

      this.timers.set(key, timer);

      // Also set max wait timer
      setTimeout(async () => {
        if (this.pending.has(key)) {
          await this.executeRequest(key, fn, args);
        }
      }, this.config.maxWaitMs);
    });
  }

  /**
   * Execute the actual request and resolve all pending promises
   */
  private async executeRequest(
    key: string,
    fn: (...args: any[]) => Promise<T>,
    args: any[]
  ): Promise<void> {
    const requests = this.pending.get(key);
    if (!requests || requests.length === 0) {
      return;
    }

    // Clear timer
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }

    // Remove from pending
    this.pending.delete(key);

    this.logger.debug(`Executing coalesced request for ${requests.length} callers`, { key });
    this.stats.executed++;

    try {
      // Execute function once
      const result = await fn(...args);

      // Resolve all pending promises
      for (const request of requests) {
        request.resolve(result);
      }
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Coalesced request failed', error instanceof Error ? error : new Error(String(error)));

      // Reject all pending promises
      for (const request of requests) {
        request.reject(error);
      }
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const coalescedRatio = this.stats.requests > 0
      ? (this.stats.coalesced / this.stats.requests) * 100
      : 0;

    const avgCoalescedPerExecution = this.stats.executed > 0
      ? (this.stats.coalesced + this.stats.executed) / this.stats.executed
      : 0;

    return {
      ...this.stats,
      pending: this.pending.size,
      coalescedRatio,
      avgCoalescedPerExecution,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      requests: 0,
      coalesced: 0,
      executed: 0,
      errors: 0,
    };
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    // Reject all pending requests
    for (const [key, requests] of this.pending) {
      const error = new Error('Request coalescer cleared');
      for (const request of requests) {
        request.reject(error);
      }
    }

    this.timers.clear();
    this.pending.clear();
  }

  /**
   * Shutdown coalescer
   */
  shutdown(): void {
    this.clear();
    this.logger.info('Request coalescer shut down');
  }
}

/**
 * Create a coalesced version of an async function
 */
export function createCoalescedFunction<T>(
  fn: (...args: any[]) => Promise<T>,
  config?: Partial<CoalescerConfig>
): (...args: any[]) => Promise<T> {
  const coalescer = new RequestCoalescer<T>(config);

  return async (...args: any[]): Promise<T> => {
    return coalescer.execute(fn, ...args);
  };
}

export default RequestCoalescer;
