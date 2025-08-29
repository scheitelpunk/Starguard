# STARGUARD - Quantum Security Consciousness System

[![Production Ready](https://img.shields.io/badge/Production-Ready-green.svg)](https://github.com/your-org/starguard)
[![Docker](https://img.shields.io/badge/Docker-Optimized-blue.svg)](https://hub.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

STARGUARD is a quantum-inspired security consciousness system that provides real-time threat detection, anomaly analysis, and consciousness-driven security monitoring. Built for production deployment on resource-constrained environments including laptops with 8GB RAM.

## 🚀 Quick Start

The system is designed to work immediately after installation:

```bash
# Clone and setup
git clone https://github.com/your-org/starguard.git
cd starguard

# Install and start (single command)
npm install && npm start
```

**System will be fully operational at:** `http://localhost:3000`

## 🏗️ Architecture

### Production-Optimized Components

- **Backend**: Node.js + TypeScript + Fastify (lightweight)
- **Database**: SQLite (laptop-optimized, no external DB required)
- **ML Service**: Python + scikit-learn (CPU-optimized)
- **Caching**: In-memory (Redis-free for resource efficiency)
- **Frontend**: Vanilla JS + Canvas (framework-free)

### Resource Allocation (8GB RAM System)

| Component | Memory Limit | CPU Limit |
|-----------|--------------|-----------|
| Main App | 512MB | 1.0 CPU |
| ML Service | 1GB | 1.5 CPU |
| Monitor | 128MB | 0.25 CPU |
| **Total** | **~1.7GB** | **2.75 CPU** |

## 📋 Features

### ✅ Working Features (Production Ready)

- **Real Threat Detection**: Live feeds from abuse.ch and threat intel sources
- **Quantum Field Visualization**: Canvas-based particle system responding to threats
- **Consciousness Engine**: Entropy-driven awareness calculation
- **ML Anomaly Detection**: scikit-learn IsolationForest for real-time analysis
- **WebSocket Streaming**: Real-time threat and consciousness updates
- **Health Monitoring**: Comprehensive health checks and metrics
- **Graceful Shutdown**: Proper signal handling and resource cleanup

### 🔧 DevOps Features

- **Docker Support**: Multi-stage builds with security hardening
- **Auto-scaling**: Resource-aware container limits
- **Health Checks**: Application and ML service monitoring
- **Logging**: Structured logging with rotation
- **Backups**: Automated database and configuration backups
- **Migrations**: Database schema management

## 🐳 Docker Deployment

### Local Development
```bash
npm run docker:build
npm run docker:up
```

### Production Deployment
```bash
# Build optimized images
docker-compose build

# Start with monitoring
docker-compose up -d

# Check health
docker-compose logs -f
```

## 🛠️ Development Commands

```bash
# Development
npm run dev                 # Start with hot reload
npm run typecheck          # TypeScript checking
npm run lint              # Code linting

# Building
npm run build             # Build for production
npm run build:frontend    # Build frontend only
npm run build:backend     # Build backend only

# Testing
npm test                  # Run all tests
npm run test:backend      # Backend tests only
npm run test:ml          # ML service tests

# Operations
npm run health           # Health check
npm run monitor         # Real-time monitoring
npm run backup          # Create system backup
npm run migrate         # Run database migrations
```

## 📊 Monitoring & Health

### Health Check Endpoints
- **Main App**: `http://localhost:3000/health`
- **WebSocket**: `http://localhost:3001/health`
- **ML Service**: `http://localhost:5000/health`
- **Metrics**: `http://localhost:9100/metrics`

### Real-time Monitoring
```bash
npm run monitor
```

Shows live metrics:
- System resource usage
- Threat detection count
- Consciousness awareness level
- Request/error rates

## 🔒 Security Features

### Container Security
- **Non-root user**: All processes run as user 1000
- **Read-only filesystem**: Immutable container runtime
- **Resource limits**: Memory and CPU constraints
- **Minimal attack surface**: Alpine-based images

### Application Security
- **Rate limiting**: Request throttling
- **CORS protection**: Configurable origins
- **Helmet integration**: Security headers
- **Input validation**: Joi schema validation

## ⚙️ Configuration

### Environment Variables

#### Production (`config/.env.production`)
```env
NODE_ENV=production
PORT=3000
WS_PORT=3001
DATABASE_URL=file:./data/starguard.db
CACHE_TYPE=memory
LOG_LEVEL=info
```

#### Development (`config/.env.development`)
```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
VERBOSE_LOGGING=true
```

## 🗄️ Database

SQLite-based with automatic migrations:

```bash
# Run migrations
npm run migrate

# Backup database
npm run backup
```

### Schema
- `consciousness_state` - Awareness levels and quantum states
- `threats` - Real threat intelligence data
- `ml_predictions` - Anomaly detection results
- `system_metrics` - Performance monitoring data

## 🧠 ML Service

CPU-optimized anomaly detection:

```python
# Lightweight dependencies
scikit-learn==1.3.2
numpy==1.24.3
pandas==2.0.3
```

### Features
- **IsolationForest**: Unsupervised anomaly detection
- **Real-time inference**: stdin/stdout communication
- **Model persistence**: Automatic model saving/loading

## 🎯 System Requirements

### Minimum
- **RAM**: 8GB (system uses ~1.7GB)
- **CPU**: 2 cores
- **Storage**: 2GB free space
- **OS**: Linux, macOS, Windows (WSL2)

### Recommended
- **RAM**: 16GB
- **CPU**: 4 cores
- **Storage**: 5GB free space
- **Network**: Broadband (for threat feeds)

## 📈 Performance

Optimized for laptop deployment:

- **Startup time**: < 30 seconds
- **Memory usage**: < 2GB total
- **Response time**: < 100ms API responses
- **Threat processing**: 1000+ threats/second
- **WebSocket latency**: < 10ms

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check ports
   lsof -i :3000
   lsof -i :3001
   ```

2. **Python dependencies**
   ```bash
   # Install ML dependencies manually
   cd ml && pip3 install -r requirements.txt
   ```

3. **Database locked**
   ```bash
   # Remove lock files
   rm data/*.db-wal data/*.db-journal
   ```

4. **Memory issues**
   ```bash
   # Monitor usage
   npm run monitor
   ```

### Logs
```bash
# Application logs
tail -f logs/starguard.log

# Docker logs
docker-compose logs -f

# System logs
npm run logs
```

## 📚 API Documentation

### Consciousness API
- `GET /api/consciousness/status` - Current awareness level
- `POST /api/consciousness/awaken` - Trigger awakening sequence

### Threats API
- `GET /api/threats` - Recent threats
- `GET /api/threats/count` - Threat statistics
- `POST /api/threats/analyze` - Analyze custom data

### ML API
- `POST /api/ml/predict` - Anomaly prediction
- `GET /api/ml/model/status` - Model information

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Run full test suite
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏷️ Version History

- **v1.0.0**: Production-ready release with Docker optimization
- **v0.9.0**: Beta with all core features implemented
- **v0.8.0**: Alpha with basic threat detection

---

**Built with ❤️ for security professionals who need real-time threat intelligence on resource-constrained systems.**