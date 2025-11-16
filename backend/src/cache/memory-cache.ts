import { Logger } from '../utils/logger.js';

export interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

export interface MemoryCacheConfig {
  maxSize: number;          // Maximum cache size in bytes
  maxEntries: number;       // Maximum number of entries
  defaultTTL: number;       // Default TTL in seconds
  cleanupInterval: number;  // Cleanup interval in milliseconds
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
}

/**
 * MemoryCache - High-performance in-memory LRU cache
 *
 * Features:
 * - LRU/LFU/FIFO eviction policies
 * - Automatic memory management
 * - TTL support
 * - Size-based eviction
 * - Performance metrics
 */
export class MemoryCache<K = string, V = any> {
  private cache: Map<K, MemoryCacheEntry<V>> = new Map();
  private accessOrder: K[] = [];
  private currentSize: number = 0;
  private config: MemoryCacheConfig;
  private logger: Logger;
  private cleanupTimer?: NodeJS.Timeout;

  // Statistics
  private hits: number = 0;
  private misses: number = 0;
  private evictions: number = 0;
  private expirations: number = 0;

  constructor(config: Partial<MemoryCacheConfig> = {}) {
    this.logger = new Logger('memory-cache');

    this.config = {
      maxSize: config.maxSize || 100 * 1024 * 1024, // 100MB default
      maxEntries: config.maxEntries || 10000,
      defaultTTL: config.defaultTTL || 300, // 5 minutes
      cleanupInterval: config.cleanupInterval || 60000, // 1 minute
      evictionPolicy: config.evictionPolicy || 'lru',
    };

    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  get(key: K): V | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      this.expirations++;
      this.misses++;
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.updateAccessOrder(key);

    this.hits++;
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V, ttl?: number): void {
    const size = this.estimateSize(value);
    const expiresAt = Date.now() + (ttl || this.config.defaultTTL) * 1000;

    // Check if we need to evict
    this.ensureCapacity(size);

    // Remove old entry if exists
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.currentSize -= oldEntry.size;
    }

    // Add new entry
    const entry: MemoryCacheEntry<V> = {
      value,
      expiresAt,
      size,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
    this.currentSize += size;
    this.updateAccessOrder(key);
  }

  /**
   * Get multiple values
   */
  mget(keys: K[]): Map<K, V> {
    const result = new Map<K, V>();

    for (const key of keys) {
      const value = this.get(key);
      if (value !== null) {
        result.set(key, value);
      }
    }

    return result;
  }

  /**
   * Set multiple values
   */
  mset(entries: Map<K, { value: V; ttl?: number }>): void {
    for (const [key, { value, ttl }] of entries) {
      this.set(key, value, ttl);
    }
  }

  /**
   * Delete key from cache
   */
  delete(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.currentSize -= entry.size;
    this.removeFromAccessOrder(key);
    return true;
  }

  /**
   * Check if key exists
   */
  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      this.expirations++;
      return false;
    }

    return true;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.currentSize = 0;
    this.logger.info('Memory cache cleared');
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      expirations: this.expirations,
      entries: this.cache.size,
      currentSize: this.currentSize,
      maxSize: this.config.maxSize,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      memoryUsage: (this.currentSize / this.config.maxSize) * 100,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.expirations = 0;
  }

  /**
   * Get or set with fallback function
   */
  async getOrSet(key: K, ttl: number, fallback: () => Promise<V>): Promise<V> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fallback();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Ensure capacity by evicting entries if necessary
   */
  private ensureCapacity(requiredSize: number): void {
    // Evict based on size
    while (
      this.currentSize + requiredSize > this.config.maxSize ||
      this.cache.size >= this.config.maxEntries
    ) {
      const evicted = this.evictOne();
      if (!evicted) break;
    }
  }

  /**
   * Evict one entry based on eviction policy
   */
  private evictOne(): boolean {
    if (this.cache.size === 0) return false;

    let keyToEvict: K | null = null;

    switch (this.config.evictionPolicy) {
      case 'lru':
        keyToEvict = this.findLRU();
        break;
      case 'lfu':
        keyToEvict = this.findLFU();
        break;
      case 'fifo':
        keyToEvict = this.findFIFO();
        break;
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
      this.evictions++;
      return true;
    }

    return false;
  }

  /**
   * Find least recently used entry
   */
  private findLRU(): K | null {
    if (this.accessOrder.length === 0) {
      // Fallback to first entry
      return this.cache.keys().next().value || null;
    }
    return this.accessOrder[0];
  }

  /**
   * Find least frequently used entry
   */
  private findLFU(): K | null {
    let minAccessCount = Infinity;
    let keyToEvict: K | null = null;

    for (const [key, entry] of this.cache) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        keyToEvict = key;
      }
    }

    return keyToEvict;
  }

  /**
   * Find first in first out entry
   */
  private findFIFO(): K | null {
    return this.cache.keys().next().value || null;
  }

  /**
   * Update access order for LRU tracking
   */
  private updateAccessOrder(key: K): void {
    if (this.config.evictionPolicy !== 'lru') return;

    // Remove key from current position
    this.removeFromAccessOrder(key);

    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order
   */
  private removeFromAccessOrder(key: K): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: V): number {
    try {
      const serialized = JSON.stringify(value);
      return serialized.length * 2; // Rough estimate for UTF-16
    } catch {
      return 1000; // Default size if serialization fails
    }
  }

  /**
   * Start background cleanup
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: K[] = [];

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt < now) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
      this.expirations++;
    }

    if (keysToDelete.length > 0) {
      this.logger.debug(`Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Stop cleanup timer
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Shutdown cache
   */
  shutdown(): void {
    this.stopCleanup();
    this.clear();
    this.logger.info('Memory cache shut down');
  }
}

export default MemoryCache;
