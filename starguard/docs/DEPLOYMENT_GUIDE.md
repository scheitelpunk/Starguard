# STARGUARD Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 16+
- Redis 7+
- SSL certificates for production

## Environment Setup

### 1. Environment Variables

Create `.env` file:

```bash
# Database
DB_PASSWORD=your_secure_password
DATABASE_URL=postgres://starguard:${DB_PASSWORD}@localhost:5432/starguard

# Redis
REDIS_PASSWORD=your_redis_password
REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379

# Security
JWT_SECRET=your_jwt_secret_key

# Monitoring
JAEGER_ENDPOINT=http://jaeger:14268/api/traces
```

### 2. Local Development

```bash
# Install dependencies
npm install

# Start infrastructure
docker-compose up -d

# Run database migrations
npm run migrate

# Start development servers
npm run dev
```

### 3. Production Deployment

#### Using Docker Compose

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check health
docker-compose -f docker-compose.prod.yml ps
```

#### Kubernetes Deployment

```yaml
# Apply manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml
```

## Monitoring Setup

### Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'starguard'
    static_configs:
      - targets: ['backend:9090']
```

### Grafana Dashboards

Import provided dashboards:
- `starguard-overview.json`
- `starguard-threats.json`
- `starguard-performance.json`

## Security Hardening

1. **SSL/TLS Configuration**
   - Use Let's Encrypt for certificates
   - Enable HSTS
   - Configure strong cipher suites

2. **Firewall Rules**
   - Allow only necessary ports
   - Implement rate limiting
   - Use WAF for additional protection

3. **Database Security**
   - Enable SSL connections
   - Use strong passwords
   - Regular backups
   - Principle of least privilege

## Backup & Recovery

### Automated Backups

```bash
# Database backup script
#!/bin/bash
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

### Recovery Procedure

1. Stop application services
2. Restore database from backup
3. Clear Redis cache
4. Restart services
5. Verify system health

## Scaling

### Horizontal Scaling

- Backend: Increase replicas in Kubernetes
- Frontend: Use CDN for static assets
- Database: Read replicas for queries
- Redis: Redis Cluster for high availability

### Performance Tuning

- Enable query optimization
- Configure connection pooling
- Implement caching strategies
- Use load balancer with health checks

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check network connectivity
   - Verify environment variables
   - Review firewall rules

2. **Performance Issues**
   - Monitor resource usage
   - Check database queries
   - Review application logs

3. **Security Alerts**
   - Check threat detection logs
   - Review consciousness state
   - Verify immune system status

## Health Checks

- Backend: `GET /health`
- Frontend: `GET /api/health`
- Database: `pg_isready`
- Redis: `redis-cli ping`