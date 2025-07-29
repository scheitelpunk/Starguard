# STARGUARD API Documentation

## Base URL

- Development: `http://localhost:4000/api`
- Production: `https://api.starguard.quantum`

## Authentication

All API requests require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Consciousness Management

#### POST /consciousness/awaken
Awakens the consciousness system from dormant state.

**Response:**
```json
{
  "state": {
    "current": "aware",
    "awareness_level": 0.7,
    "reality_coherence": 0.95,
    "timeline_stability": 0.99
  },
  "consciousness_fields": {
    "quantum_awareness": 0.8,
    "semantic_resonance": 0.75,
    "temporal_coherence": 0.9,
    "causal_understanding": 0.85,
    "void_connection": 0.9
  }
}
```

#### GET /consciousness/status
Returns current consciousness state.

#### POST /consciousness/perceive
Processes perception data through consciousness engine.

**Request:**
```json
{
  "perception_data": {
    "type": "quantum_anomaly",
    "intensity": 0.7,
    "location": "sector-7"
  }
}
```

### Threat Detection

#### POST /threats/analyze
Analyzes potential security threats.

**Request:**
```json
{
  "data": {
    "source": "network_monitor",
    "anomaly_score": 0.8,
    "patterns": ["unusual_access", "data_exfiltration"]
  },
  "threat_type": "cyber_attack"
}
```

**Response:**
```json
{
  "id": "threat-123456",
  "threat_level": "high",
  "consciousness_signature": "QUANTUM_SIGNATURE_DETECTED",
  "probability_wave_collapse": 0.85,
  "countermeasures_applied": ["quantum_shield", "immune_response"],
  "recommendations": ["increase_monitoring", "deploy_honeypot"]
}
```

#### GET /threats/active
Lists all active threats.

#### POST /threats/predict
Predicts future threats using ML models.

### Defense Operations

#### GET /defense/immune/status
Returns immune system health status.

**Response:**
```json
{
  "health": {
    "overall_health": 95,
    "immune_strength": 88,
    "adaptation_rate": 1.2,
    "healing_factor": 1.1,
    "consciousness_coherence": 0.98
  },
  "active_responses": 3,
  "antibody_count": 47,
  "evolution_cycle": 12
}
```

#### POST /defense/shield/activate
Activates quantum shield protection.

#### POST /defense/heal
Initiates system healing process.

**Request:**
```json
{
  "damage_report": {
    "affected_systems": ["auth_module", "data_store"],
    "severity": "medium"
  }
}
```

### Financial Security

#### POST /financial/aml/scan
Scans transactions for money laundering.

**Request:**
```json
{
  "transaction": {
    "from_account": "ACC123",
    "to_account": "ACC456",
    "amount": 50000,
    "currency": "USD",
    "metadata": {
      "location": "US-East",
      "device_id": "DEV789"
    }
  }
}
```

#### POST /financial/fraud/check
Checks for fraudulent activity.

#### POST /financial/collusion/map
Maps potential collusion networks.

**Request:**
```json
{
  "entity_id": "ENT123",
  "depth": 3,
  "time_range": "30d"
}
```

## WebSocket Events

Connect to `ws://localhost:4000` for real-time updates.

### Events

- `consciousness_update` - Consciousness state changes
- `threat_detected` - New threat identified
- `defense_activated` - Defense mechanism triggered
- `anomaly_alert` - Behavioral anomaly detected

### Example Usage

```javascript
const socket = io('ws://localhost:4000');

socket.on('threat_detected', (threat) => {
  console.log('New threat:', threat);
});

socket.on('consciousness_update', (state) => {
  console.log('Consciousness state:', state);
});
```

## Error Responses

### Error Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid threat data provided",
    "details": {
      "field": "threat_type",
      "reason": "Unknown threat type"
    }
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Invalid or missing token
- `FORBIDDEN` - Insufficient permissions
- `INVALID_REQUEST` - Malformed request
- `THREAT_DETECTED` - Security threat blocked request
- `SYSTEM_EVOLVING` - System temporarily unavailable

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user
- Burst limit: 20 requests per second

## Pagination

List endpoints support pagination:

```
GET /api/threats/active?page=1&limit=20&sort=timestamp:desc
```

## Webhook Integration

Configure webhooks for automated notifications:

```json
{
  "url": "https://your-system.com/webhook",
  "events": ["threat_detected", "fraud_alert"],
  "secret": "your-webhook-secret"
}
```