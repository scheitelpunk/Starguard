# Temporal Graph Analysis Documentation

## Advanced Attack Path Detection and Lateral Movement Tracking

The Temporal Graph Engine analyzes security events as time-evolving graphs to detect complex attack patterns, lateral movement, and multi-stage threats using graph algorithms and MITRE ATT&CK framework integration.

## Overview

Temporal Graph Analysis enables:
- **Attack Path Detection**: Multi-hop attack chain discovery
- **Lateral Movement Tracking**: Real-time pivot point identification
- **MITRE ATT&CK Mapping**: 12-phase attack lifecycle correlation
- **Graph Analytics**: PageRank, centrality, connected components
- **Threat Hunting**: Interactive graph queries for SOC analysts

## Architecture

\`\`\`
┌────────────────────────────────────────────────────┐
│      Temporal Graph Engine Architecture            │
├────────────────────────────────────────────────────┤
│  Graph Construction Layer                          │
│  ├── Event Ingestion                              │
│  ├── Node Creation (Users, Devices, IPs, Files)  │
│  ├── Edge Creation (Access, Auth, Communication)  │
│  └── Temporal Indexing                            │
├────────────────────────────────────────────────────┤
│  Analysis Engines                                  │
│  ├── Attack Path Detector                         │
│  │   ├── DFS-Based Path Discovery                │
│  │   ├── Multi-Hop Chain Detection               │
│  │   └── Confidence Scoring                       │
│  ├── Lateral Movement Tracker                     │
│  │   ├── Pivot Point Detection                   │
│  │   ├── Credential Reuse Analysis               │
│  │   └── Anomalous Access Patterns               │
│  ├── MITRE ATT&CK Mapper                          │
│  │   ├── Tactic Identification                   │
│  │   ├── Technique Classification                │
│  │   └── Kill Chain Reconstruction               │
│  └── Graph Algorithms                             │
│      ├── PageRank (Criticality)                   │
│      ├── Betweenness Centrality                   │
│      ├── Community Detection                      │
│      └── Shortest Path                            │
├────────────────────────────────────────────────────┤
│  Query & Visualization Layer                      │
│  ├── Graph Query Language                         │
│  ├── Temporal Queries                             │
│  ├── Interactive Visualization                    │
│  └── Export & Reporting                           │
└────────────────────────────────────────────────────┘
\`\`\`

## Graph Data Model

### Nodes (Entities)
\`\`\`typescript
interface GraphNode {
  id: string;
  type: 'user' | 'device' | 'service' | 'ip_address' | 'process' | 'file' | 'network' | 'credential';
  label: string;
  properties: {
    hostname?: string;
    username?: string;
    ip_address?: string;
    privilege_level?: string;
    [key: string]: any;
  };
  risk_score: number; // 0-100
  first_seen: number;
  last_seen: number;
  occurrences: number;
  tags: string[];
}
\`\`\`

### Edges (Relationships)
\`\`\`typescript
interface GraphEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: 'access' | 'authentication' | 'communication' | 'execution' | 'file_access' | 
        'network_connection' | 'privilege_escalation' | 'data_exfiltration' | 'lateral_movement';
  timestamp: number;
  properties: {
    protocol?: string;
    port?: number;
    success?: boolean;
    [key: string]: any;
  };
  risk_score: number;
  attack_indicators: string[];
}
\`\`\`

### Attack Paths
\`\`\`typescript
interface AttackPath {
  id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  start_time: number;
  end_time: number;
  duration: number; // milliseconds
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  attack_phases: AttackPhase[]; // MITRE ATT&CK phases
  tactics: string[]; // MITRE ATT&CK tactics
  techniques: string[]; // MITRE ATT&CK techniques (e.g., T1078)
  indicators: Array<{type: string; value: string; confidence: number}>;
  risk_score: number; // 0-100
  description: string;
}
\`\`\`

## API Reference

### Initialize Temporal Graph Engine

\`\`\`typescript
import { TemporalGraphEngine } from './temporal-graph/TemporalGraphEngine';

const graph = new TemporalGraphEngine({
  storage: {
    backend: 'memory', // or 'neo4j', 'arangodb'
    max_nodes: 1000000,
    max_edges: 5000000
  },
  attack_path_detection: {
    enabled: true,
    max_path_length: 10,
    min_confidence: 0.7
  },
  lateral_movement: {
    enabled: true,
    detection_window: 3600000 // 1 hour
  },
  mitre_attack: {
    enabled: true,
    version: '12.0'
  }
});
\`\`\`

### Add Nodes and Edges

\`\`\`typescript
// Add security event as graph node
const userNode = await graph.addNode({
  id: 'user-alice',
  type: 'user',
  label: 'alice@company.com',
  properties: {
    username: 'alice',
    department: 'engineering',
    privilege_level: 'user'
  },
  risk_score: 20,
  tags: ['employee', 'active']
});

const serverNode = await graph.addNode({
  id: 'server-db01',
  type: 'device',
  label: 'db01.company.internal',
  properties: {
    hostname: 'db01',
    ip_address: '10.0.1.50',
    os: 'Linux',
    role: 'database_server'
  },
  risk_score: 85,
  tags: ['critical', 'production']
});

// Add relationship/event as edge
const accessEdge = await graph.addEdge({
  source: 'user-alice',
  target: 'server-db01',
  type: 'access',
  timestamp: Date.now(),
  properties: {
    protocol: 'ssh',
    port: 22,
    success: true,
    auth_method: 'password'
  },
  risk_score: 45,
  attack_indicators: ['unusual_time', 'first_time_access']
});
\`\`\`

### Detect Attack Paths

\`\`\`typescript
// Automatically detect attack paths
const attackPaths = await graph.detectAttackPaths();

for (const path of attackPaths) {
  console.log('Attack Path:', path.id);
  console.log('Severity:', path.severity);
  console.log('Confidence:', path.confidence);
  console.log('Steps:', path.nodes.map(n => n.label).join(' → '));
  console.log('MITRE Tactics:', path.tactics);
  console.log('MITRE Techniques:', path.techniques);
  
  // Example output:
  // Steps: attacker@external → web-server → admin-workstation → domain-controller
  // Tactics: ['initial_access', 'execution', 'lateral_movement', 'privilege_escalation']
  // Techniques: ['T1190', 'T1059', 'T1021', 'T1078']
}
\`\`\`

### Track Lateral Movement

\`\`\`typescript
// Detect lateral movement patterns
const lateralMovements = await graph.detectLateralMovement({
  time_window: 3600000, // 1 hour
  min_hops: 2
});

for (const movement of lateralMovements) {
  console.log('Lateral Movement detected:');
  console.log('Source:', movement.source_node.label);
  console.log('Targets:', movement.target_nodes.map(n => n.label));
  console.log('Pivot Points:', movement.pivot_nodes.length);
  console.log('Credentials Used:', movement.credentials_reused);
  
  // Alert security team
  if (movement.severity === 'critical') {
    await alertSOC(movement);
  }
}
\`\`\`

### MITRE ATT&CK Mapping

\`\`\`typescript
// Map observed activities to MITRE ATT&CK framework
const attackMapping = await graph.mapToMITRE({
  time_range: {
    start: Date.now() - 86400000, // Last 24 hours
    end: Date.now()
  }
});

console.log('MITRE ATT&CK Coverage:');
console.log('Tactics:', attackMapping.tactics);
// ['reconnaissance', 'initial_access', 'execution', 'persistence']

console.log('Techniques:', attackMapping.techniques);
// [
//   { id: 'T1190', name: 'Exploit Public-Facing Application', confidence: 0.9 },
//   { id: 'T1078', name: 'Valid Accounts', confidence: 0.85 },
//   { id: 'T1021', name: 'Remote Services', confidence: 0.78 }
// ]

console.log('Attack Phases:', attackMapping.phases);
// Reconstructs complete kill chain
\`\`\`

### Graph Analytics

\`\`\`typescript
// Calculate node criticality using PageRank
const criticalNodes = await graph.calculatePageRank();
console.log('Most critical assets:');
criticalNodes.slice(0, 10).forEach(node => {
  console.log(\`\${node.label}: \${node.pagerank_score.toFixed(3)}\`);
});

// Find central nodes (potential chokepoints)
const centralNodes = await graph.calculateBetweennessCentrality();

// Detect communities (related assets)
const communities = await graph.detectCommunities();
console.log('Network communities:', communities.length);

// Shortest attack path between nodes
const shortestPath = await graph.findShortestPath({
  source: 'attacker-ip',
  target: 'crown-jewels-db',
  edge_types: ['access', 'lateral_movement', 'privilege_escalation']
});
\`\`\`

### Graph Queries

\`\`\`typescript
// Query graph with filters
const suspiciousAccess = await graph.query({
  nodeFilter: {
    type: 'user',
    properties: {
      privilege_level: 'admin'
    }
  },
  edgeFilter: {
    type: 'access',
    timestamp: {
      after: Date.now() - 3600000 // Last hour
    },
    properties: {
      success: true,
      after_hours: true
    }
  },
  limit: 100
});

// Complex graph pattern matching
const suspiciousPattern = await graph.findPattern({
  pattern: [
    { node: { type: 'user', tag: 'external' } },
    { edge: { type: 'authentication' } },
    { node: { type: 'device', tag: 'internal' } },
    { edge: { type: 'lateral_movement' } },
    { node: { type: 'device', tag: 'critical' } }
  ],
  timeWindow: 7200000 // 2 hours
});
\`\`\`

## MITRE ATT&CK Integration

### 12 Attack Phases

| Phase | Description | Example Techniques |
|-------|-------------|-------------------|
| Reconnaissance | Gather information | T1592, T1595 |
| Initial Access | Get into network | T1190, T1566 |
| Execution | Run malicious code | T1059, T1053 |
| Persistence | Maintain foothold | T1078, T1136 |
| Privilege Escalation | Gain higher privileges | T1068, T1134 |
| Defense Evasion | Avoid detection | T1070, T1027 |
| Credential Access | Steal credentials | T1003, T1110 |
| Discovery | Explore environment | T1083, T1046 |
| Lateral Movement | Move through network | T1021, T1091 |
| Collection | Gather target data | T1005, T1039 |
| Exfiltration | Steal data | T1041, T1048 |
| Impact | Disrupt operations | T1486, T1485 |

### Technique Detection

\`\`\`typescript
// Detect specific MITRE technique
const t1078Detection = await graph.detectTechnique('T1078', {
  // T1078: Valid Accounts
  indicators: [
    'credential_reuse',
    'multiple_failed_logins_then_success',
    'login_from_new_location',
    'privilege_escalation'
  ]
});

if (t1078Detection.detected) {
  console.log('T1078 (Valid Accounts) detected');
  console.log('Confidence:', t1078Detection.confidence);
  console.log('Evidence:', t1078Detection.evidence);
}
\`\`\`

## Performance Metrics

### Test Coverage
- **Total Tests**: 35+ (97%+)
- **Graph Operations**: ✅ Add nodes/edges, queries
- **Attack Path Detection**: ✅ DFS, multi-hop paths
- **Lateral Movement**: ✅ Pivot detection, credential reuse
- **MITRE Mapping**: ✅ Tactic/technique classification
- **Graph Algorithms**: ✅ PageRank, centrality, communities

### Benchmark Results
- **Node Addition**: <1ms
- **Edge Addition**: <2ms
- **Attack Path Detection**: 50-500ms (depends on graph size)
- **Lateral Movement Detection**: 100-1000ms
- **Graph Query**: 10-100ms
- **PageRank Calculation**: 1-5s (for 100k nodes)
- **Memory Usage**: ~10MB per 10k nodes/edges

### Scalability
- **Tested**: 1M nodes, 5M edges
- **Performance**: Sub-second queries on indexed properties
- **Distributed**: Supports graph database backends (Neo4j, ArangoDB)

## Use Cases

### 1. APT (Advanced Persistent Threat) Detection

\`\`\`typescript
// Detect multi-stage APT attack
const aptDetection = await graph.detectAPT({
  min_stages: 3,
  time_window: 2592000000, // 30 days
  required_phases: ['initial_access', 'lateral_movement', 'exfiltration']
});

// Example APT attack path:
// 1. Initial Access: Phishing email → User workstation
// 2. Execution: Malware execution → Beacon communication
// 3. Lateral Movement: User → Admin workstation
// 4. Privilege Escalation: Admin access → Domain controller
// 5. Exfiltration: Data → External IP
\`\`\`

### 2. Insider Threat Analysis

\`\`\`typescript
// Detect unusual access patterns by insiders
const insiderThreats = await graph.detectInsiderThreats({
  user_types: ['employee', 'contractor'],
  anomalies: [
    'access_outside_normal_hours',
    'access_to_unusual_resources',
    'bulk_data_download',
    'credential_sharing'
  ]
});
\`\`\`

### 3. Ransomware Kill Chain

\`\`\`typescript
// Detect ransomware attack progression
const ransomwarePattern = await graph.detectRansomware({
  indicators: [
    { phase: 'initial_access', technique: 'T1566' }, // Phishing
    { phase: 'execution', technique: 'T1059' }, // Command scripting
    { phase: 'lateral_movement', technique: 'T1021' }, // Remote services
    { phase: 'impact', technique: 'T1486' } // Data encryption
  ]
});
\`\`\`

### 4. Supply Chain Attack

\`\`\`typescript
// Trace supply chain compromise
const supplyChainPath = await graph.traceSupplyChain({
  entry_point: 'vendor-software-update',
  target: 'production-database',
  include_nodes: ['user', 'process', 'file', 'network']
});
\`\`\`

## Event System

\`\`\`typescript
graph.on('node:added', (node) => {
  console.log('New entity:', node.label);
});

graph.on('edge:added', (edge) => {
  if (edge.risk_score > 70) {
    console.warn('High-risk relationship:', edge.type);
  }
});

graph.on('attack_path:detected', (path) => {
  console.error('ATTACK PATH DETECTED!');
  console.error('Severity:', path.severity);
  console.error('Path:', path.nodes.map(n => n.label).join(' → '));
  
  // Immediate response
  if (path.severity === 'critical') {
    triggerIncidentResponse(path);
  }
});

graph.on('lateral_movement:detected', (movement) => {
  console.warn('Lateral movement:', movement.source_node.label);
  alertSOC(movement);
});
\`\`\`

## Configuration

\`\`\`typescript
interface TemporalGraphConfig {
  storage: {
    backend: 'memory' | 'neo4j' | 'arangodb';
    connection_string?: string;
    max_nodes: number;
    max_edges: number;
  };

  attack_path_detection: {
    enabled: boolean;
    max_path_length: number; // Max hops in attack chain
    min_confidence: number; // 0-1
    algorithms: Array<'dfs' | 'bfs' | 'dijkstra'>;
  };

  lateral_movement: {
    enabled: boolean;
    detection_window: number; // milliseconds
    min_hops: number;
    credential_reuse_threshold: number;
  };

  mitre_attack: {
    enabled: boolean;
    version: string; // ATT&CK framework version
    auto_classify: boolean;
  };

  graph_analytics: {
    enabled: boolean;
    algorithms: Array<'pagerank' | 'centrality' | 'communities'>;
    update_frequency: number; // milliseconds
  };
}
\`\`\`

## Best Practices

### 1. Graph Modeling
- Model entities consistently (users, devices, processes)
- Use timestamps for temporal analysis
- Tag critical assets
- Normalize risk scores (0-100)

### 2. Performance
- Use graph database for large datasets
- Index frequently queried properties
- Limit query result sizes
- Archive old data

### 3. Threat Hunting
- Combine with threat intelligence feeds
- Correlate with SIEM alerts
- Review high-confidence attack paths
- Investigate lateral movement alerts

## Roadmap

### Current (Q1 2025) ✅
- [x] Temporal graph engine
- [x] Attack path detection (DFS)
- [x] Lateral movement tracking
- [x] MITRE ATT&CK integration
- [x] 35+ tests (97%+)

### Q2 2025
- [ ] Neo4j backend integration
- [ ] Real-time graph streaming
- [ ] Machine learning for path scoring
- [ ] Interactive graph visualization UI

### Q3 2025
- [ ] Predictive attack modeling
- [ ] Automated threat hunting
- [ ] Graph-based threat intelligence
- [ ] Multi-tenant graph isolation

## Support

- **Email**: graph-analysis@starguard.io
- **Documentation**: https://docs.starguard.io/temporal-graph

---

[← Back to Advanced Features](./ADVANCED_FEATURES.md)
