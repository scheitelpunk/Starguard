/**
 * Optimization Modules Export
 *
 * Central export for all performance optimization modules
 */

// Cache modules - commented out until implemented
// export { RedisCache } from './cache/redis-cache.js';
// export { MemoryCache } from './cache/memory-cache.js';

// Optimization modules
export { setupCompression } from './compression.js';
export { ETagHandler, setupETag } from './etag-handler.js';
export { WebSocketOptimizer } from './websocket-optimizer.js';
export { RequestCoalescer, createCoalescedFunction } from './request-coalescer.js';
export {
  ObjectPool,
  BufferPool,
  RegExpPool,
  ArrayPool
} from './object-pool.js';
export { QueryOptimizer } from './query-optimizer.js';

// Worker pool - commented out until implemented
// export { WorkerPool } from './workers/worker-pool.js';

// Performance metrics - commented out until implemented
// export { PerformanceMetrics } from './metrics/performance-metrics.js';

// Type exports
// export type { CacheConfig, CacheEntry } from './cache/redis-cache.js';
// export type { MemoryCacheEntry, MemoryCacheConfig } from './cache/memory-cache.js';
export type { CompressionConfig } from './compression.js';
export type { ETagConfig } from './etag-handler.js';
export type { WSOptimizerConfig, QueuedMessage } from './websocket-optimizer.js';
export type { CoalescerConfig } from './request-coalescer.js';
export type { PoolConfig } from './object-pool.js';
export type { QueryPlan, IndexDefinition } from './query-optimizer.js';
// export type { WorkerTask, WorkerResult } from './workers/worker-pool.js';
