# STARGUARD Performance Tuning Guide

## Overview

This guide provides optimization strategies for maximizing STARGUARD's performance in production environments.

## Performance Baselines

Target metrics for production:
- API Response Time: <100ms (p95)
- WebSocket Latency: <50ms
- Threat Detection: <500ms
- Consciousness Update: <200ms
- Memory Usage: <2GB per instance
- CPU Usage: <70% sustained

## Database Optimization

### 1. PostgreSQL Tuning

```sql
-- postgresql.conf optimizations
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB
max_connections = 200
checkpoint_completion_target = 0.9

-- Connection pooling
max_pool_size = 50
idle_timeout = 30000
```

### 2. Query Optimization

```sql
-- Add indexes for frequent queries
CREATE INDEX idx_threats_timestamp ON threats(timestamp DESC);
CREATE INDEX idx_transactions_account ON transactions(from_account, to_account);
CREATE INDEX idx_consciousness_events ON consciousness_events(entity_id, timestamp);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM threats WHERE timestamp > NOW() - INTERVAL '1 hour';
```

### 3. Partitioning

```sql
-- Partition large tables by time
CREATE TABLE threats_2024_01 PARTITION OF threats
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Automatic partition management
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS void AS $$
BEGIN
  -- Auto-create partitions
END;
$$ LANGUAGE plpgsql;
```

## Application Optimization

### 1. Node.js Performance

```javascript
// Enable cluster mode for multi-core utilization
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  startServer();
}
```

### 2. Memory Management

```javascript
// Implement object pooling
class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  
  acquire(): T {
    return this.pool.pop() || this.factory();
  }
  
  release(obj: T): void {
    this.pool.push(obj);
  }
}

// Use for expensive objects
const threatAnalyzerPool = new ObjectPool(() => new ThreatAnalyzer());
```

### 3. Async Optimization

```typescript
// Batch operations
class BatchProcessor {
  private queue: Task[] = [];
  private processing = false;
  
  async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = this.queue.splice(0, 100);
    
    await Promise.all(
      batch.map(task => this.processTask(task))
    );
    
    this.processing = false;
  }
}

// Implement circuit breaker
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailTime > 60000) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

## Caching Strategy

### 1. Redis Configuration

```javascript
// Redis optimization
const redis = new Redis({
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  
  // Connection pool
  connectionPool: {
    min: 5,
    max: 50
  }
});

// Implement cache warming
async function warmCache() {
  const criticalData = await loadCriticalData();
  await redis.mset(criticalData);
}
```

### 2. Multi-Level Caching

```typescript
class CacheManager {
  private l1Cache = new Map(); // In-memory
  private l2Cache = redis;      // Distributed
  
  async get(key: string): Promise<any> {
    // Check L1
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }
    
    // Check L2
    const value = await this.l2Cache.get(key);
    if (value) {
      this.l1Cache.set(key, value);
      return value;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl = 3600): Promise<void> {
    this.l1Cache.set(key, value);
    await this.l2Cache.setex(key, ttl, JSON.stringify(value));
  }
}
```

## WebSocket Optimization

### 1. Connection Management

```javascript
// Implement room-based broadcasting
io.on('connection', (socket) => {
  // Join specific rooms based on interest
  socket.join(`threat-level-${socket.data.interestedLevel}`);
  
  // Targeted broadcasting
  io.to('threat-level-critical').emit('critical-threat', data);
});

// Message compression
io.engine.generateId = () => {
  return uuidv4().split('-')[0]; // Shorter IDs
};
```

### 2. Message Batching

```typescript
class MessageBatcher {
  private messages: Message[] = [];
  private timer: NodeJS.Timeout;
  
  add(message: Message): void {
    this.messages.push(message);
    
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 50);
    }
  }
  
  flush(): void {
    if (this.messages.length > 0) {
      socket.emit('batch', this.messages);
      this.messages = [];
    }
    clearTimeout(this.timer);
  }
}
```

## Monitoring & Profiling

### 1. Performance Monitoring

```javascript
// Custom performance metrics
const perfMetrics = {
  requestDuration: new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status'],
    buckets: [10, 50, 100, 200, 500, 1000]
  }),
  
  threatDetectionTime: new Histogram({
    name: 'threat_detection_duration_ms',
    help: 'Time to detect threats',
    buckets: [50, 100, 200, 500, 1000]
  })
};

// Middleware for tracking
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    perfMetrics.requestDuration
      .labels(req.method, req.route?.path || 'unknown', res.statusCode)
      .observe(duration);
  });
  
  next();
});
```

### 2. CPU Profiling

```bash
# Generate CPU profile
node --prof backend/dist/index.js

# Process profile
node --prof-process isolate-*.log > profile.txt

# Alternative: 0x flame graphs
npx 0x -o backend/dist/index.js
```

## Load Testing

### 1. API Load Testing

```javascript
// k6 load test script
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
  },
};

export default function() {
  let response = http.get('http://localhost:4000/api/consciousness/status');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

### 2. WebSocket Load Testing

```javascript
// Artillery WebSocket test
config:
  target: 'ws://localhost:4000'
  phases:
    - duration: 60
      arrivalRate: 10
      rampTo: 50

scenarios:
  - name: 'WebSocket threat monitoring'
    engine: ws
    flow:
      - send: '{"type": "subscribe", "channel": "threats"}'
      - think: 1
      - send: '{"type": "ping"}'
      - think: 5
```

## Production Checklist

### Before Deployment

- [ ] Enable production mode: `NODE_ENV=production`
- [ ] Minify and compress assets
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up health checks
- [ ] Configure auto-scaling rules
- [ ] Enable APM monitoring
- [ ] Set up alerting thresholds

### Runtime Optimization

```bash
# Node.js flags for production
NODE_OPTIONS="--max-old-space-size=4096 --optimize-for-size"

# Enable JIT optimization
NODE_OPTIONS="$NODE_OPTIONS --turbo --turbo-inlining"

# Use PM2 for process management
pm2 start ecosystem.config.js --env production
```

### Scaling Strategies

1. **Vertical Scaling**
   - Increase CPU/RAM for compute-intensive operations
   - Use faster SSD storage for database
   - Upgrade network bandwidth

2. **Horizontal Scaling**
   - Add more application instances
   - Implement database read replicas
   - Use Redis Cluster for caching
   - Deploy across multiple regions

## Troubleshooting Performance

### Common Bottlenecks

1. **Slow Queries**
   ```sql
   -- Find slow queries
   SELECT query, mean_time, calls
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

2. **Memory Leaks**
   ```javascript
   // Detect with heapdump
   const heapdump = require('heapdump');
   
   setInterval(() => {
     if (process.memoryUsage().heapUsed > 1e9) {
       heapdump.writeSnapshot();
     }
   }, 60000);
   ```

3. **Event Loop Blocking**
   ```javascript
   // Monitor event loop lag
   const blocked = require('blocked-at');
   blocked((time, stack) => {
     console.log(`Blocked for ${time}ms, operation started here:`, stack);
   });
   ```

Remember: Performance optimization is an iterative process. Monitor, measure, optimize, and repeat.