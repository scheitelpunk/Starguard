import { Logger } from '../utils/logger.js';

export interface PoolConfig<T> {
  factory: () => T;              // Create new object
  reset?: (obj: T) => void;      // Reset object for reuse
  validate?: (obj: T) => boolean; // Validate object before reuse
  maxSize: number;               // Maximum pool size
  minSize: number;               // Minimum pool size
  maxAge?: number;               // Maximum object age (ms)
}

interface PooledObject<T> {
  object: T;
  created: number;
  lastUsed: number;
  useCount: number;
}

/**
 * ObjectPool - Memory-efficient object pooling
 *
 * Features:
 * - Reuse expensive objects
 * - Automatic object lifecycle management
 * - Configurable pool sizes
 * - Object validation
 * - Age-based eviction
 * - Performance metrics
 *
 * Use cases:
 * - Buffer pools
 * - Database connection pools
 * - Regex pattern pools
 * - Large object reuse
 */
export class ObjectPool<T> {
  private logger: Logger;
  private config: PoolConfig<T>;
  private available: PooledObject<T>[] = [];
  private inUse: Set<T> = new Set();
  private stats = {
    created: 0,
    acquired: 0,
    released: 0,
    reused: 0,
    evicted: 0,
    validated: 0,
  };

  constructor(name: string, config: PoolConfig<T>) {
    this.logger = new Logger(`object-pool:${name}`);
    this.config = config;

    // Pre-populate pool
    this.prewarm();
  }

  /**
   * Pre-warm pool with minimum objects
   */
  private prewarm(): void {
    for (let i = 0; i < this.config.minSize; i++) {
      const obj = this.createObject();
      if (obj) {
        this.available.push(obj);
      }
    }

    this.logger.info(`Pool pre-warmed with ${this.available.length} objects`);
  }

  /**
   * Acquire object from pool
   */
  acquire(): T | null {
    this.stats.acquired++;

    // Try to get from available pool
    let pooledObj = this.getAvailableObject();

    // Create new if pool is empty and under max size
    if (!pooledObj) {
      if (this.totalSize() < this.config.maxSize) {
        pooledObj = this.createObject();
      } else {
        this.logger.warn('Pool exhausted, max size reached');
        return null;
      }
    }

    if (!pooledObj) {
      return null;
    }

    // Validate object if validator is provided
    if (this.config.validate) {
      this.stats.validated++;
      if (!this.config.validate(pooledObj.object)) {
        this.logger.debug('Object failed validation, creating new one');
        pooledObj = this.createObject();
        if (!pooledObj) {
          return null;
        }
      }
    }

    // Mark as in use
    pooledObj.lastUsed = Date.now();
    pooledObj.useCount++;
    this.inUse.add(pooledObj.object);

    if (pooledObj.useCount > 1) {
      this.stats.reused++;
    }

    return pooledObj.object;
  }

  /**
   * Release object back to pool
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      this.logger.warn('Attempting to release object not from this pool');
      return;
    }

    this.stats.released++;
    this.inUse.delete(obj);

    // Find the pooled object
    const pooledObj = this.available.find(po => po.object === obj) || {
      object: obj,
      created: Date.now(),
      lastUsed: Date.now(),
      useCount: 1,
    };

    // Reset object if reset function is provided
    if (this.config.reset) {
      try {
        this.config.reset(obj);
      } catch (error) {
        this.logger.error('Failed to reset object', error instanceof Error ? error : new Error(String(error)));
        return; // Don't return to pool if reset fails
      }
    }

    // Check object age
    if (this.config.maxAge) {
      const age = Date.now() - pooledObj.created;
      if (age > this.config.maxAge) {
        this.stats.evicted++;
        this.logger.debug('Object evicted due to age');
        return;
      }
    }

    // Return to pool if under max size
    if (this.available.length < this.config.maxSize) {
      this.available.push(pooledObj);
    } else {
      this.stats.evicted++;
    }
  }

  /**
   * Get available object from pool
   */
  private getAvailableObject(): PooledObject<T> | null {
    return this.available.pop() || null;
  }

  /**
   * Create new pooled object
   */
  private createObject(): PooledObject<T> | null {
    try {
      const obj = this.config.factory();
      this.stats.created++;

      return {
        object: obj,
        created: Date.now(),
        lastUsed: Date.now(),
        useCount: 0,
      };
    } catch (error) {
      this.logger.error('Failed to create object', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Execute function with pooled object
   */
  async use<R>(fn: (obj: T) => Promise<R>): Promise<R> {
    const obj = this.acquire();
    if (!obj) {
      throw new Error('Failed to acquire object from pool');
    }

    try {
      return await fn(obj);
    } finally {
      this.release(obj);
    }
  }

  /**
   * Get total pool size
   */
  totalSize(): number {
    return this.available.length + this.inUse.size;
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const reuseRatio = this.stats.acquired > 0
      ? (this.stats.reused / this.stats.acquired) * 100
      : 0;

    return {
      ...this.stats,
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.totalSize(),
      reuseRatio,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      created: 0,
      acquired: 0,
      released: 0,
      reused: 0,
      evicted: 0,
      validated: 0,
    };
  }

  /**
   * Clear pool
   */
  clear(): void {
    this.available = [];
    this.inUse.clear();
    this.logger.info('Pool cleared');
  }

  /**
   * Drain pool (wait for all objects to be released)
   */
  async drain(timeoutMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();

    while (this.inUse.size > 0) {
      if (Date.now() - startTime > timeoutMs) {
        this.logger.warn(`Pool drain timeout, ${this.inUse.size} objects still in use`);
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.clear();
    return true;
  }
}

/**
 * Common object pools
 */

// Buffer pool for reusing Buffer objects
export class BufferPool extends ObjectPool<Buffer> {
  constructor(bufferSize: number, config?: Partial<Omit<PoolConfig<Buffer>, 'factory'>>) {
    super('buffer', {
      factory: () => Buffer.allocUnsafe(bufferSize),
      reset: (buf) => buf.fill(0),
      maxSize: config?.maxSize || 100,
      minSize: config?.minSize || 10,
      ...config,
    });
  }
}

// RegExp pool for reusing compiled patterns
export class RegExpPool extends ObjectPool<RegExp> {
  constructor(pattern: string | RegExp, flags?: string, config?: Partial<Omit<PoolConfig<RegExp>, 'factory'>>) {
    super('regexp', {
      factory: () => new RegExp(pattern, flags),
      validate: (regex) => regex instanceof RegExp,
      maxSize: config?.maxSize || 50,
      minSize: config?.minSize || 5,
      ...config,
    });
  }
}

// Array pool for reusing arrays
export class ArrayPool<T = any> extends ObjectPool<T[]> {
  constructor(config?: Partial<Omit<PoolConfig<T[]>, 'factory'>>) {
    super('array', {
      factory: () => [],
      reset: (arr) => { arr.length = 0; },
      maxSize: config?.maxSize || 100,
      minSize: config?.minSize || 10,
      ...config,
    });
  }
}

export default ObjectPool;
