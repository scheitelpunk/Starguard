/**
 * Temporal Graph Analysis Types
 *
 * Advanced graph-based threat detection and attack path analysis
 * Tracks security events over time to identify attack patterns and lateral movement
 */

/**
 * Node Types in Security Graph
 */
export type NodeType = 'user' | 'device' | 'service' | 'ip_address' | 'process' | 'file' | 'network' | 'credential';

/**
 * Edge Types (Relationships)
 */
export type EdgeType = 'access' | 'authentication' | 'communication' | 'execution' | 'file_access' | 'network_connection' | 'privilege_escalation' | 'data_exfiltration' | 'lateral_movement';

/**
 * Threat Severity
 */
export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Attack Phase (MITRE ATT&CK inspired)
 */
export type AttackPhase = 'reconnaissance' | 'initial_access' | 'execution' | 'persistence' | 'privilege_escalation' | 'defense_evasion' | 'credential_access' | 'discovery' | 'lateral_movement' | 'collection' | 'exfiltration' | 'impact';

/**
 * Graph Node
 */
export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, any>;
  risk_score: number; // 0-100
  first_seen: number;
  last_seen: number;
  occurrences: number;
  tags: string[];
}

/**
 * Graph Edge (Relationship)
 */
export interface GraphEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: EdgeType;
  timestamp: number;
  properties: Record<string, any>;
  weight: number; // Relationship strength
  suspicious: boolean;
  attack_phase?: AttackPhase;
}

/**
 * Temporal Window
 */
export interface TemporalWindow {
  start: number;
  end: number;
  duration: number; // milliseconds
}

/**
 * Attack Path
 */
export interface AttackPath {
  id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  start_time: number;
  end_time: number;
  duration: number;
  severity: ThreatSeverity;
  confidence: number; // 0-1
  attack_phases: AttackPhase[];
  tactics: string[]; // MITRE ATT&CK tactics
  techniques: string[]; // MITRE ATT&CK techniques
  indicators: {
    type: string;
    value: string;
    confidence: number;
  }[];
  risk_score: number; // 0-100
  description: string;
}

/**
 * Lateral Movement Detection
 */
export interface LateralMovement {
  id: string;
  source_node: GraphNode;
  target_nodes: GraphNode[];
  path: GraphEdge[];
  start_time: number;
  end_time: number;
  method: 'rdp' | 'ssh' | 'smb' | 'wmi' | 'psexec' | 'pass_the_hash' | 'pass_the_ticket' | 'other';
  credential_used?: string;
  suspicious_indicators: string[];
  risk_score: number;
}

/**
 * Threat Evolution
 */
export interface ThreatEvolution {
  threat_id: string;
  name: string;
  timeline: Array<{
    timestamp: number;
    phase: AttackPhase;
    nodes_added: string[];
    edges_added: string[];
    event_description: string;
  }>;
  current_phase: AttackPhase;
  progression: number; // 0-100 (percentage through kill chain)
  velocity: number; // Events per hour
  scope: {
    affected_users: number;
    affected_devices: number;
    affected_services: number;
    network_segments: string[];
  };
  predicted_next_steps: Array<{
    phase: AttackPhase;
    technique: string;
    probability: number;
    targets: string[];
  }>;
  mitigation_recommendations: string[];
}

/**
 * Graph Query
 */
export interface GraphQuery {
  node_filters?: {
    types?: NodeType[];
    labels?: string[];
    properties?: Record<string, any>;
    min_risk_score?: number;
    tags?: string[];
  };
  edge_filters?: {
    types?: EdgeType[];
    suspicious_only?: boolean;
    attack_phases?: AttackPhase[];
  };
  temporal_window?: TemporalWindow;
  max_results?: number;
}

/**
 * Graph Pattern
 */
export interface GraphPattern {
  id: string;
  name: string;
  description: string;
  pattern_type: 'attack_path' | 'lateral_movement' | 'data_exfiltration' | 'privilege_escalation' | 'reconnaissance';
  node_sequence: Array<{
    type: NodeType;
    properties?: Record<string, any>;
    optional?: boolean;
  }>;
  edge_sequence: Array<{
    type: EdgeType;
    properties?: Record<string, any>;
    optional?: boolean;
  }>;
  temporal_constraints?: {
    max_duration?: number; // Maximum time between first and last event
    min_velocity?: number; // Minimum events per hour
  };
  severity: ThreatSeverity;
  confidence_threshold: number; // 0-1
}

/**
 * Anomaly Detection Result
 */
export interface GraphAnomaly {
  id: string;
  type: 'unusual_connection' | 'abnormal_frequency' | 'suspicious_timing' | 'unexpected_relationship' | 'isolated_cluster' | 'bridge_node';
  nodes: GraphNode[];
  edges: GraphEdge[];
  description: string;
  anomaly_score: number; // 0-1
  baseline_comparison: {
    expected: any;
    observed: any;
    deviation: number;
  };
  first_detected: number;
  last_detected: number;
  occurrences: number;
}

/**
 * Graph Metrics
 */
export interface GraphMetrics {
  total_nodes: number;
  total_edges: number;
  nodes_by_type: Record<NodeType, number>;
  edges_by_type: Record<EdgeType, number>;
  avg_node_degree: number;
  max_node_degree: number;
  connected_components: number;
  graph_density: number;
  clustering_coefficient: number;
  avg_path_length: number;
  temporal_span: {
    earliest_event: number;
    latest_event: number;
    duration: number;
  };
  high_risk_nodes: number;
  suspicious_edges: number;
  timestamp: number;
}

/**
 * Temporal Graph Configuration
 */
export interface TemporalGraphConfig {
  retention_period: number; // milliseconds
  max_nodes: number;
  max_edges: number;
  auto_cleanup: boolean;
  anomaly_detection: {
    enabled: boolean;
    sensitivity: number; // 0-1
    baseline_window: number; // milliseconds
  };
  attack_path_detection: {
    enabled: boolean;
    max_path_length: number;
    min_confidence: number;
  };
  lateral_movement_detection: {
    enabled: boolean;
    time_window: number; // milliseconds
    min_hops: number;
  };
  pattern_matching: {
    enabled: boolean;
    custom_patterns: boolean;
  };
}

/**
 * Graph Snapshot
 */
export interface GraphSnapshot {
  id: string;
  timestamp: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  metrics: GraphMetrics;
  metadata: Record<string, any>;
}

/**
 * Threat Intelligence Context
 */
export interface ThreatIntelligenceContext {
  ioc_type: 'ip' | 'domain' | 'file_hash' | 'url' | 'email' | 'user_agent';
  value: string;
  threat_actor?: string;
  campaign?: string;
  malware_family?: string;
  first_seen: number;
  last_seen: number;
  confidence: number; // 0-1
  sources: string[];
  tags: string[];
}

/**
 * Risk Assessment
 */
export interface RiskAssessment {
  node_id: string;
  risk_score: number; // 0-100
  factors: {
    connectivity: number; // How connected to other risky nodes
    privilege_level: number; // Access privileges
    data_sensitivity: number; // Access to sensitive data
    anomalous_behavior: number; // Deviation from baseline
    threat_intelligence: number; // Matches known threats
  };
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  mitigation_priority: number; // 1-10
  recommendations: string[];
  timestamp: number;
}

/**
 * Attack Surface
 */
export interface AttackSurface {
  entry_points: GraphNode[]; // Externally accessible nodes
  critical_assets: GraphNode[]; // High-value targets
  weak_points: Array<{
    node: GraphNode;
    vulnerabilities: string[];
    risk_score: number;
  }>;
  attack_paths_to_critical: AttackPath[];
  exposure_score: number; // 0-100
  recommendations: string[];
}

/**
 * Time Series Analysis
 */
export interface TimeSeriesAnalysis {
  metric: string;
  data_points: Array<{
    timestamp: number;
    value: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  forecast: Array<{
    timestamp: number;
    predicted_value: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
  }>;
  anomalies: Array<{
    timestamp: number;
    value: number;
    expected_value: number;
    deviation: number;
  }>;
  seasonality?: {
    detected: boolean;
    period: number; // milliseconds
    strength: number; // 0-1
  };
}

/**
 * Graph Event
 */
export interface GraphEvent {
  id: string;
  type: 'node_added' | 'node_updated' | 'node_removed' | 'edge_added' | 'edge_removed' | 'attack_path_detected' | 'lateral_movement_detected' | 'anomaly_detected' | 'threat_evolved';
  timestamp: number;
  data: any;
  severity?: ThreatSeverity;
}
