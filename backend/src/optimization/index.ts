/**
 * Optimization Modules Export
 *
 * Central export for all performance optimization modules
 */

export { RedisCache } from './cache/redis-cache.js';
export { MemoryCache } from './cache/memory-cache.js';
export { CompressionPlugin, setupCompression } from './optimization/compression.js';
export { ETagHandler, setupETag } from './optimization/etag-handler.js';
export { WebSocketOptimizer } from './optimization/websocket-optimizer.js';
export { RequestCoalescer, createCoalescedFunction } from './optimization/request-coalescer.js';
export {
  ObjectPool,
  BufferPool,
  RegExpPool,
  ArrayPool
} from './optimization/object-pool.js';
export { QueryOptimizer } from './optimization/query-optimizer.js';
export { WorkerPool } from './workers/worker-pool.js';
export { PerformanceMetrics } from './metrics/performance-metrics.js';

// Type exports
export type { CacheConfig, CacheEntry } from './cache/redis-cache.js';
export type { MemoryCacheEntry, MemoryCacheConfig } from './cache/memory-cache.js';
export type { CompressionConfig } from './optimization/compression.js';
export type { ETagConfig } from './optimization/etag-handler.js';
export type { WSOptimizerConfig, QueuedMessage } from './optimization/websocket-optimizer.js';
export type { CoalescerConfig } from './optimization/request-coalescer.js';
export type { PoolConfig } from './optimization/object-pool.js';
export type { QueryPlan, IndexDefinition } from './optimization/query-optimizer.js';
export type { WorkerTask, WorkerResult } from './workers/worker-pool.js';
