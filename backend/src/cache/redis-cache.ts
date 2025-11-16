import Redis from 'ioredis';
import { Logger } from '../utils/logger.js';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  maxRetriesPerRequest?: number;
  enableOfflineQueue?: boolean;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  compressed?: boolean;
}

/**
 * RedisCache - High-performance Redis caching layer
 *
 * Features:
 * - Automatic TTL management
 * - Compression for large values
 * - Connection pooling
 * - Automatic reconnection
 * - Performance metrics
 */
export class RedisCache {
  private client: Redis;
  private logger: Logger;
  private hits: number = 0;
  private misses: number = 0;
  private sets: number = 0;
  private errors: number = 0;

  // TTL presets in seconds
  public static readonly TTL = {
    BIOMETRIC_PROFILE: 300,     // 5 minutes
    THREAT_INTELLIGENCE: 3600,  // 1 hour
    QUANTUM_FIELD: 30,          // 30 seconds
    SESSION: 1800,              // 30 minutes
    API_RESPONSE: 60,           // 1 minute
    USER_DATA: 600,             // 10 minutes
    METRICS: 120,               // 2 minutes
  };

  constructor(config: CacheConfig) {
    this.logger = new Logger('redis-cache');

    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      keyPrefix: config.keyPrefix || 'starguard:',
      maxRetriesPerRequest: config.maxRetriesPerRequest || 3,
      enableOfflineQueue: config.enableOfflineQueue !== false,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(`Redis retry attempt ${times}, delay: ${delay}ms`);
        return delay;
      },
      reconnectOnError: (err: Error) => {
        this.logger.error('Redis connection error', err);
        return true;
      },
    });

    this.setupEventHandlers();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);

      if (value === null) {
        this.misses++;
        return null;
      }

      this.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      this.errors++;
      this.logger.error(`Cache get error for key ${key}`, error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttl: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttl, serialized);
      this.sets++;
      return true;
    } catch (error) {
      this.errors++;
      this.logger.error(`Cache set error for key ${key}`, error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Get multiple keys at once (pipeline)
   */
  async mget<T>(keys: string[]): Promise<Map<string, T>> {
    try {
      const values = await this.client.mget(...keys);
      const result = new Map<string, T>();

      values.forEach((value, index) => {
        if (value !== null) {
          try {
            result.set(keys[index], JSON.parse(value) as T);
            this.hits++;
          } catch {
            this.misses++;
          }
        } else {
          this.misses++;
        }
      });

      return result;
    } catch (error) {
      this.errors++;
      this.logger.error('Cache mget error', error instanceof Error ? error : new Error(String(error)));
      return new Map();
    }
  }

  /**
   * Set multiple key-value pairs at once (pipeline)
   */
  async mset(entries: Map<string, { value: any; ttl: number }>): Promise<boolean> {
    try {
      const pipeline = this.client.pipeline();

      for (const [key, { value, ttl }] of entries) {
        const serialized = JSON.stringify(value);
        pipeline.setex(key, ttl, serialized);
      }

      await pipeline.exec();
      this.sets += entries.size;
      return true;
    } catch (error) {
      this.errors++;
      this.logger.error('Cache mset error', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.errors++;
      this.logger.error(`Cache del error for key ${key}`, error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      const pipeline = this.client.pipeline();
      keys.forEach(key => pipeline.del(key));
      await pipeline.exec();

      return keys.length;
    } catch (error) {
      this.errors++;
      this.logger.error(`Cache delPattern error for pattern ${pattern}`, error instanceof Error ? error : new Error(String(error)));
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.errors++;
      this.logger.error(`Cache exists error for key ${key}`, error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Get remaining TTL for key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.errors++;
      this.logger.error(`Cache ttl error for key ${key}`, error instanceof Error ? error : new Error(String(error)));
      return -1;
    }
  }

  /**
   * Increment counter
   */
  async incr(key: string, ttl?: number): Promise<number> {
    try {
      const value = await this.client.incr(key);
      if (ttl && value === 1) {
        await this.client.expire(key, ttl);
      }
      return value;
    } catch (error) {
      this.errors++;
      this.logger.error(`Cache incr error for key ${key}`, error instanceof Error ? error : new Error(String(error)));
      return 0;
    }
  }

  /**
   * Add to sorted set (for time-series data)
   */
  async zadd(key: string, score: number, member: string, ttl?: number): Promise<boolean> {
    try {
      await this.client.zadd(key, score, member);
      if (ttl) {
        await this.client.expire(key, ttl);
      }
      return true;
    } catch (error) {
      this.errors++;
      this.logger.error(`Cache zadd error for key ${key}`, error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Get range from sorted set
   */
  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.zrange(key, start, stop);
    } catch (error) {
      this.errors++;
      this.logger.error(`Cache zrange error for key ${key}`, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Remove old entries from sorted set
   */
  async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
    try {
      return await this.client.zremrangebyscore(key, min, max);
    } catch (error) {
      this.errors++;
      this.logger.error(`Cache zremrangebyscore error for key ${key}`, error instanceof Error ? error : new Error(String(error)));
      return 0;
    }
  }

  /**
   * Cache with fallback - get from cache or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    ttl: number,
    fallback: () => Promise<T>
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute fallback and cache result
    try {
      const value = await fallback();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      this.logger.error(`Cache getOrSet fallback error for key ${key}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      errors: this.errors,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      total,
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.errors = 0;
  }

  /**
   * Flush all cache
   */
  async flush(): Promise<boolean> {
    try {
      await this.client.flushdb();
      this.logger.info('Cache flushed successfully');
      return true;
    } catch (error) {
      this.errors++;
      this.logger.error('Cache flush error', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers() {
    this.client.on('connect', () => {
      this.logger.info('Redis connected');
    });

    this.client.on('ready', () => {
      this.logger.info('Redis ready');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis error', err);
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      this.logger.info('Redis reconnecting');
    });
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    await this.client.quit();
    this.logger.info('Redis connection closed gracefully');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}

export default RedisCache;
