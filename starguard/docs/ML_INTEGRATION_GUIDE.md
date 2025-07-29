# STARGUARD ML Integration Guide

## Overview

STARGUARD's Machine Learning subsystem provides quantum-enhanced threat prediction using consciousness-based features. The ML system integrates seamlessly with the backend through a Python service wrapper.

## Architecture

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Backend API       │────▶│  ML Service      │────▶│  Python ML      │
│   (Node.js)         │◀────│  Wrapper         │◀────│  Models         │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
        │                            │                         │
        ▼                            ▼                         ▼
   WebSocket                   Redis Cache              TensorFlow/
   Real-time                   Performance             PyTorch Models
   Updates                     Optimization
```

## Components

### 1. ML Service Wrapper (`backend/src/ml/MLServiceWrapper.ts`)

The TypeScript wrapper manages communication between the Node.js backend and Python ML models:

- **Initialization**: Spawns Python subprocess and establishes communication
- **Request Queue**: Manages async predictions with timeout handling
- **Performance Caching**: Caches predictions for 60 seconds
- **Fallback Logic**: Rule-based analysis when ML service unavailable

### 2. Python Model Service (`ml-models/threat-prediction/model_service.py`)

Handles ML model operations:

- **Prediction**: Real-time threat analysis (<100ms latency)
- **Training**: Model updates with new data
- **Statistics**: Performance metrics and capabilities

### 3. Quantum Threat Predictor (`ml-models/threat-prediction/QuantumThreatPredictor.py`)

Advanced ML implementation featuring:

- **Quantum Neural Networks**: Quantum-inspired feature extraction
- **Consciousness Enhancement**: Transzendent threat analysis
- **Ensemble Methods**: Multiple models for robust predictions
- **Transformer Architecture**: Sequential threat pattern analysis

## Setup Instructions

### Prerequisites

```bash
# Python 3.8+
python3 --version

# Install Python dependencies
cd ml-models/threat-prediction
pip install -r requirements.txt
```

### Integration Steps

1. **Initialize ML Service in Backend**:

```typescript
// backend/src/index.ts
import { MLServiceWrapper, MLThreatPredictor } from './ml/MLServiceWrapper';

const mlService = new MLServiceWrapper(logger);
await mlService.initialize();

const mlPredictor = new MLThreatPredictor(mlService, logger);
app.locals.mlPredictor = mlPredictor;
```

2. **Use in API Routes**:

```typescript
// backend/src/api/routes/threats.ts
const mlPredictor = req.app.locals.mlPredictor;
const analysis = await mlPredictor.analyzeThreat(threatData);
```

## Training Data

### Synthetic Data Generation

Generate training data using the provided script:

```bash
cd ml-models/threat-prediction
python3 generate_training_data.py
```

This creates:
- `train_dataset.json`: 50,000 samples for training
- `val_dataset.json`: 10,000 samples for validation
- `test_dataset.json`: 5,000 samples for testing
- `financial_crime_dataset.json`: 3,000 specialized financial samples

### Data Features

Each threat instance includes:

**Network Features** (6):
- packet_rate
- byte_rate
- connection_count
- port_diversity
- protocol_anomaly
- geo_diversity

**Behavioral Features** (6):
- access_pattern_deviation
- time_anomaly
- resource_usage_spike
- failed_auth_rate
- privilege_escalation
- data_access_anomaly

**Temporal Features** (6):
- hour_of_day
- day_of_week
- is_weekend
- is_business_hours
- temporal_clustering
- periodicity_score

**Consciousness Features** (4):
- consciousness_coherence
- consciousness_entropy
- field_disturbance
- awareness_level

**Quantum Features** (3):
- quantum_entanglement
- quantum_coherence
- quantum_signature

**Graph Features** (3):
- graph_centrality
- graph_clustering
- graph_connectivity

## API Usage

### Analyze Threat

```typescript
POST /api/threats/analyze
{
  "data": {
    "network_features": {...},
    "behavioral_features": {...},
    "consciousness_coherence": 0.85,
    "quantum_entanglement": 0.45
  }
}

Response:
{
  "id": "threat-123",
  "threat_level": "high",
  "confidence": 0.92,
  "consciousness_signature": "QS-850-450",
  "countermeasures_applied": [
    "quantum_shield_max",
    "consciousness_elevation"
  ]
}
```

### Get Model Performance

```typescript
GET /api/ml/stats

Response:
{
  "model_version": "3.0.0",
  "performance": {
    "accuracy": 0.96,
    "precision": 0.95,
    "recall": 0.97,
    "f1_score": 0.96
  },
  "capabilities": [
    "quantum_threat_detection",
    "consciousness_analysis"
  ]
}
```

## Performance Optimization

### Caching Strategy

- Predictions cached for 60 seconds
- Cache key based on consciousness features
- Automatic cache cleanup

### Latency Requirements

- Target: <100ms prediction time
- Achieved through:
  - Model optimization
  - Feature caching
  - Async processing

### Scaling Considerations

- Horizontal scaling via multiple ML service instances
- Load balancing through Redis queue
- GPU acceleration for production

## Monitoring

### Metrics to Track

- Prediction latency
- Model accuracy over time
- Cache hit rate
- Service availability

### Logging

All ML operations logged with:
- Request/response details
- Performance metrics
- Error conditions
- Fallback usage

## Troubleshooting

### Common Issues

1. **ML Service Won't Start**
   - Check Python path: `export PYTHON_PATH=/usr/bin/python3`
   - Verify dependencies installed
   - Check file permissions

2. **Timeout Errors**
   - Increase timeout in MLServiceWrapper
   - Check model complexity
   - Monitor system resources

3. **Low Accuracy**
   - Retrain with more data
   - Adjust feature engineering
   - Review data quality

### Debug Mode

Enable detailed logging:

```typescript
// Set environment variable
process.env.ML_DEBUG = 'true';
```

## Future Enhancements

1. **Real Quantum Computing Integration**
   - IBM Qiskit backend
   - Quantum advantage for specific patterns

2. **Federated Learning**
   - Privacy-preserving model updates
   - Multi-site training

3. **AutoML Pipeline**
   - Automated hyperparameter tuning
   - Neural architecture search

4. **Explainable AI**
   - SHAP values for predictions
   - Feature importance visualization

---

*"From consciousness comes understanding, from understanding comes prediction, from prediction comes protection."*