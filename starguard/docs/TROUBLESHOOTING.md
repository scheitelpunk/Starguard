# STARGUARD Troubleshooting Guide

## Common Issues and Solutions

### 1. System Startup Issues

#### Consciousness Engine Won't Awaken

**Symptoms:**
- System remains in DORMANT state
- No consciousness field initialization
- WebSocket connections fail

**Solutions:**
```bash
# Check backend logs
docker logs starguard_backend_1

# Verify database connection
docker exec -it starguard_postgres_1 psql -U starguard -c "SELECT 1"

# Restart consciousness service
docker-compose restart backend
```

#### Frontend Not Loading

**Symptoms:**
- Blank page or 404 errors
- Console errors about missing modules
- Three.js visualization not rendering

**Solutions:**
```bash
# Rebuild frontend
cd frontend
rm -rf .next node_modules
npm install
npm run build
npm run dev

# Check for port conflicts
lsof -i :3000
```

### 2. Database Issues

#### Connection Pool Exhausted

**Error:** `Error: Connection pool exhausted`

**Solutions:**
```typescript
// Increase pool size in database.ts
const pool = new Pool({
  max: 50, // Increase from default 20
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### Migration Failures

**Error:** `Migration failed: relation already exists`

**Solutions:**
```bash
# Check migration status
cd backend
npm run migrate:status

# Reset migrations (CAUTION: Data loss)
npm run migrate:reset
npm run migrate
```

### 3. Performance Issues

#### High Memory Usage

**Symptoms:**
- Node.js process consuming >2GB RAM
- Slow response times
- Memory leak warnings

**Solutions:**
```bash
# Analyze memory usage
node --inspect backend/dist/index.js

# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Check for memory leaks
npm run test:memory
```

#### Slow Threat Detection

**Symptoms:**
- Threat analysis takes >5 seconds
- Consciousness field updates lag
- WebSocket timeouts

**Solutions:**
```typescript
// Optimize quantum field calculation
// In QuantumThreatDetector.ts
private optimizedQuantumField = memoize(this.calculateQuantumField);

// Add caching for pattern matching
private patternCache = new Map<string, MatchResult>();
```

### 4. Security Alerts

#### Unusual Consciousness Fluctuations

**Alert:** `WARN: Consciousness coherence below threshold`

**Investigation Steps:**
1. Check system health:
```bash
curl http://localhost:4000/api/defense/immune/status
```

2. Review threat logs:
```sql
SELECT * FROM threat_events 
WHERE timestamp > NOW() - INTERVAL '1 hour'
ORDER BY severity DESC;
```

3. Verify quantum shield integrity:
```bash
curl -X GET http://localhost:4000/api/defense/shield/status
```

#### Repeated Authentication Failures

**Alert:** `Multiple failed login attempts detected`

**Solutions:**
- Enable rate limiting
- Check for brute force patterns
- Review IP blocklist
- Verify JWT secret rotation

### 5. WebSocket Issues

#### Connection Drops

**Symptoms:**
- "Connection lost" messages
- Real-time updates stop
- Reconnection loops

**Solutions:**
```javascript
// Implement exponential backoff
const socket = io({
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10
});

// Add heartbeat monitoring
socket.on('pong', () => {
  lastHeartbeat = Date.now();
});
```

#### Message Queue Overflow

**Error:** `WebSocket message queue full`

**Solutions:**
```typescript
// Implement message throttling
class MessageThrottler {
  private queue: Message[] = [];
  private processing = false;
  
  async process() {
    if (this.processing) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 100);
      await this.processBatch(batch);
    }
    
    this.processing = false;
  }
}
```

### 6. Docker/Container Issues

#### Container Restart Loop

**Symptoms:**
- Container exits immediately
- Status shows "Restarting"
- No logs available

**Solutions:**
```bash
# Check container logs
docker logs --tail 50 starguard_backend_1

# Run container interactively
docker run -it starguard/backend:latest sh

# Check resource limits
docker stats
```

#### Volume Permission Errors

**Error:** `EACCES: permission denied`

**Solutions:**
```bash
# Fix volume permissions
docker exec starguard_backend_1 chown -R node:node /app

# Or in Dockerfile
USER node
WORKDIR /app
```

### 7. Monitoring & Logging

#### Missing Metrics

**Symptoms:**
- Prometheus showing no data
- Grafana dashboards empty
- No trace data in Jaeger

**Solutions:**
```bash
# Verify metrics endpoint
curl http://localhost:9090/metrics

# Check OpenTelemetry configuration
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 npm start

# Enable debug logging
DEBUG=starguard:* npm start
```

#### Log Overflow

**Issue:** Logs filling disk space

**Solutions:**
```javascript
// Implement log rotation
const winston = require('winston');
require('winston-daily-rotate-file');

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/starguard-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '100m',
  maxFiles: '14d'
});
```

### 8. Development Environment

#### TypeScript Compilation Errors

**Error:** `Cannot find module '@starguard/shared'`

**Solutions:**
```bash
# Rebuild shared module
cd shared
npm run build

# Link shared module
cd ../backend
npm link ../shared

# Clear TypeScript cache
rm -rf dist/ *.tsbuildinfo
npm run build
```

#### Hot Reload Not Working

**Issue:** Changes not reflected without restart

**Solutions:**
```json
// Update nodemon.json
{
  "watch": ["src", "../shared/src"],
  "ext": "ts,js",
  "ignore": ["**/*.test.ts"],
  "exec": "ts-node src/index.ts"
}
```

### 9. Emergency Procedures

#### System Compromise Detected

**CRITICAL:** Quantum shield breach detected

**Immediate Actions:**
1. Activate emergency shield:
```bash
curl -X POST http://localhost:4000/api/defense/shield/emergency
```

2. Isolate affected systems:
```bash
docker-compose stop backend
# Analyze logs before restart
```

3. Deploy immune response:
```bash
curl -X POST http://localhost:4000/api/defense/immune/emergency-response
```

#### Data Corruption

**Signs:**
- Inconsistent consciousness readings
- Database integrity errors
- Transaction rollback failures

**Recovery Steps:**
1. Stop all services
2. Restore from last known good backup
3. Verify data integrity
4. Gradually restart services
5. Monitor consciousness coherence

### 10. Diagnostic Commands

#### Health Check Script

```bash
#!/bin/bash
# starguard-health-check.sh

echo "Checking STARGUARD Health..."

# Check services
for service in postgres redis backend frontend; do
  if docker-compose ps | grep -q "$service.*Up"; then
    echo "✓ $service is running"
  else
    echo "✗ $service is down"
  fi
done

# Check API
if curl -s http://localhost:4000/health > /dev/null; then
  echo "✓ API is responsive"
else
  echo "✗ API is not responding"
fi

# Check consciousness
CONSCIOUSNESS=$(curl -s http://localhost:4000/api/consciousness/status | jq -r '.state.current')
echo "Consciousness State: $CONSCIOUSNESS"
```

## Getting Help

If these solutions don't resolve your issue:

1. Check logs: `docker-compose logs -f`
2. Enable debug mode: `DEBUG=* npm start`
3. Contact support: support@starguard.quantum
4. File an issue: https://github.com/starguard/starguard/issues

Remember: The system's consciousness may provide insights into issues. Monitor the consciousness field for anomalies that could indicate problems.