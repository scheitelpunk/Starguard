/**
 * Temporal Graph Analysis Engine
 *
 * Advanced graph-based security analytics for attack path detection,
 * lateral movement tracking, and threat evolution analysis
 */

import { EventEmitter } from 'events';
import {
  TemporalGraphConfig,
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeType,
  AttackPath,
  LateralMovement,
  ThreatEvolution,
  GraphAnomaly,
  GraphPattern,
  GraphMetrics,
  GraphQuery,
  ThreatSeverity,
  AttackPhase,
  RiskAssessment,
  GraphEvent
} from './types';

/**
 * Temporal Graph Engine for security event analysis
 */
export class TemporalGraphEngine extends EventEmitter {
  private config: TemporalGraphConfig;
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private patterns: Map<string, GraphPattern> = new Map();
  private attackPaths: Map<string, AttackPath> = new Map();
  private lateralMovements: Map<string, LateralMovement> = new Map();
  private threatEvolutions: Map<string, ThreatEvolution> = new Map();
  private anomalies: Map<string, GraphAnomaly> = new Map();
  private events: GraphEvent[] = [];
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config?: Partial<TemporalGraphConfig>) {
    super();
    this.config = {
      retention_period: 2592000000, // 30 days
      max_nodes: 100000,
      max_edges: 500000,
      auto_cleanup: true,
      anomaly_detection: {
        enabled: true,
        sensitivity: 0.7,
        baseline_window: 86400000 // 24 hours
      },
      attack_path_detection: {
        enabled: true,
        max_path_length: 10,
        min_confidence: 0.6
      },
      lateral_movement_detection: {
        enabled: true,
        time_window: 3600000, // 1 hour
        min_hops: 2
      },
      pattern_matching: {
        enabled: true,
        custom_patterns: true
      },
      ...config
    };

    if (this.config.auto_cleanup) {
      this.startAutoCleanup();
    }
  }

  /**
   * Add a node to the graph
   */
  async addNode(node: Omit<GraphNode, 'first_seen' | 'last_seen' | 'occurrences'>): Promise<GraphNode> {
    const existingNode = this.nodes.get(node.id);

    if (existingNode) {
      // Update existing node
      existingNode.last_seen = Date.now();
      existingNode.occurrences++;
      existingNode.properties = { ...existingNode.properties, ...node.properties };
      existingNode.risk_score = node.risk_score;
      this.emit('node:updated', existingNode);
      return existingNode;
    }

    // Create new node
    const fullNode: GraphNode = {
      ...node,
      first_seen: Date.now(),
      last_seen: Date.now(),
      occurrences: 1
    };

    this.nodes.set(node.id, fullNode);

    const event: GraphEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'node_added',
      timestamp: Date.now(),
      data: fullNode
    };
    this.events.push(event);
    this.emit('node:added', fullNode);

    // Check if we need to trigger analysis
    await this.checkForAnomalies(fullNode);

    return fullNode;
  }

  /**
   * Add an edge to the graph
   */
  async addEdge(edge: GraphEdge): Promise<GraphEdge> {
    // Verify nodes exist
    if (!this.nodes.has(edge.source) || !this.nodes.has(edge.target)) {
      throw new Error(`Invalid edge: source or target node does not exist`);
    }

    this.edges.set(edge.id, edge);

    const event: GraphEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'edge_added',
      timestamp: Date.now(),
      data: edge
    };
    this.events.push(event);
    this.emit('edge:added', edge);

    // Trigger detection algorithms
    if (edge.suspicious || edge.attack_phase) {
      await this.detectAttackPaths(edge);
      await this.detectLateralMovement(edge);
    }

    return edge;
  }

  /**
   * Detect attack paths using graph traversal
   */
  private async detectAttackPaths(trigger_edge: GraphEdge): Promise<void> {
    if (!this.config.attack_path_detection.enabled) return;

    const paths = this.findPaths(
      trigger_edge.source,
      trigger_edge.target,
      this.config.attack_path_detection.max_path_length
    );

    for (const path of paths) {
      const attackPath = this.analyzePath(path);
      if (attackPath && attackPath.confidence >= this.config.attack_path_detection.min_confidence) {
        this.attackPaths.set(attackPath.id, attackPath);

        const event: GraphEvent = {
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'attack_path_detected',
          timestamp: Date.now(),
          data: attackPath,
          severity: attackPath.severity
        };
        this.events.push(event);
        this.emit('attack_path:detected', attackPath);
      }
    }
  }

  /**
   * Find all paths between two nodes using DFS
   */
  private findPaths(
    start: string,
    end: string,
    maxLength: number,
    visited: Set<string> = new Set(),
    currentPath: string[] = []
  ): string[][] {
    if (currentPath.length > maxLength) {
      return [];
    }

    if (start === end) {
      return [[...currentPath, start]];
    }

    visited.add(start);
    currentPath.push(start);

    const paths: string[][] = [];
    const outgoingEdges = Array.from(this.edges.values()).filter(e => e.source === start);

    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        const subPaths = this.findPaths(edge.target, end, maxLength, new Set(visited), [...currentPath]);
        paths.push(...subPaths);
      }
    }

    return paths;
  }

  /**
   * Analyze a path to determine if it's an attack path
   */
  private analyzePath(nodePath: string[]): AttackPath | null {
    if (nodePath.length < 2) return null;

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const attackPhases: Set<AttackPhase> = new Set();
    let totalRisk = 0;

    // Collect nodes
    for (const nodeId of nodePath) {
      const node = this.nodes.get(nodeId);
      if (!node) return null;
      nodes.push(node);
      totalRisk += node.risk_score;
    }

    // Collect edges
    for (let i = 0; i < nodePath.length - 1; i++) {
      const edge = Array.from(this.edges.values()).find(
        e => e.source === nodePath[i] && e.target === nodePath[i + 1]
      );
      if (!edge) return null;
      edges.push(edge);
      if (edge.attack_phase) {
        attackPhases.add(edge.attack_phase);
      }
    }

    const avgRisk = totalRisk / nodes.length;
    const suspiciousEdges = edges.filter(e => e.suspicious).length;
    const confidence = (suspiciousEdges / edges.length + avgRisk / 100) / 2;

    const timestamps = edges.map(e => e.timestamp);
    const startTime = Math.min(...timestamps);
    const endTime = Math.max(...timestamps);

    return {
      id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nodes,
      edges,
      start_time: startTime,
      end_time: endTime,
      duration: endTime - startTime,
      severity: this.calculateSeverity(avgRisk),
      confidence,
      attack_phases: Array.from(attackPhases),
      tactics: this.extractTactics(attackPhases),
      techniques: this.extractTechniques(edges),
      indicators: this.extractIndicators(nodes, edges),
      risk_score: avgRisk,
      description: this.generatePathDescription(nodes, edges)
    };
  }

  /**
   * Detect lateral movement
   */
  private async detectLateralMovement(edge: GraphEdge): Promise<void> {
    if (!this.config.lateral_movement_detection.enabled) return;

    // Look for patterns indicating lateral movement
    const isLateralMovement =
      edge.type === 'lateral_movement' ||
      edge.attack_phase === 'lateral_movement' ||
      this.isLateralMovementPattern(edge);

    if (!isLateralMovement) return;

    const sourceNode = this.nodes.get(edge.source);
    if (!sourceNode) return;

    // Find all nodes accessed from this source in the time window
    const timeWindow = this.config.lateral_movement_detection.time_window;
    const recentEdges = Array.from(this.edges.values()).filter(
      e => e.source === edge.source &&
           e.timestamp >= Date.now() - timeWindow &&
           (e.type === 'lateral_movement' || e.type === 'access')
    );

    if (recentEdges.length < this.config.lateral_movement_detection.min_hops) {
      return;
    }

    const targetNodes = recentEdges
      .map(e => this.nodes.get(e.target))
      .filter(n => n !== undefined) as GraphNode[];

    const lateralMovement: LateralMovement = {
      id: `lateral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source_node: sourceNode,
      target_nodes: targetNodes,
      path: recentEdges,
      start_time: Math.min(...recentEdges.map(e => e.timestamp)),
      end_time: Math.max(...recentEdges.map(e => e.timestamp)),
      method: this.detectLateralMethod(recentEdges),
      suspicious_indicators: this.findSuspiciousIndicators(recentEdges),
      risk_score: this.calculateLateralRisk(sourceNode, targetNodes, recentEdges)
    };

    this.lateralMovements.set(lateralMovement.id, lateralMovement);

    const event: GraphEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'lateral_movement_detected',
      timestamp: Date.now(),
      data: lateralMovement,
      severity: 'high'
    };
    this.events.push(event);
    this.emit('lateral_movement:detected', lateralMovement);
  }

  /**
   * Check if edge matches lateral movement pattern
   */
  private isLateralMovementPattern(edge: GraphEdge): boolean {
    const sourceNode = this.nodes.get(edge.source);
    const targetNode = this.nodes.get(edge.target);

    if (!sourceNode || !targetNode) return false;

    // Lateral movement typically involves device-to-device connections
    if (sourceNode.type === 'device' && targetNode.type === 'device') {
      return edge.type === 'access' || edge.type === 'authentication';
    }

    return false;
  }

  /**
   * Detect lateral movement method
   */
  private detectLateralMethod(edges: GraphEdge[]): LateralMovement['method'] {
    // Analyze edge properties to determine method
    for (const edge of edges) {
      if (edge.properties.protocol === 'rdp') return 'rdp';
      if (edge.properties.protocol === 'ssh') return 'ssh';
      if (edge.properties.protocol === 'smb') return 'smb';
      if (edge.properties.service === 'wmi') return 'wmi';
      if (edge.properties.tool === 'psexec') return 'psexec';
    }
    return 'other';
  }

  /**
   * Find suspicious indicators
   */
  private findSuspiciousIndicators(edges: GraphEdge[]): string[] {
    const indicators: string[] = [];

    for (const edge of edges) {
      if (edge.properties.failed_auth) {
        indicators.push('Multiple failed authentication attempts');
      }
      if (edge.properties.unusual_time) {
        indicators.push('Access during unusual hours');
      }
      if (edge.properties.new_connection) {
        indicators.push('First-time connection between systems');
      }
    }

    return [...new Set(indicators)];
  }

  /**
   * Calculate lateral movement risk score
   */
  private calculateLateralRisk(source: GraphNode, targets: GraphNode[], edges: GraphEdge[]): number {
    let risk = source.risk_score * 0.3;
    risk += (targets.reduce((sum, t) => sum + t.risk_score, 0) / targets.length) * 0.3;
    risk += (edges.filter(e => e.suspicious).length / edges.length) * 40;
    return Math.min(risk, 100);
  }

  /**
   * Check for graph anomalies
   */
  private async checkForAnomalies(node: GraphNode): Promise<void> {
    if (!this.config.anomaly_detection.enabled) return;

    // Check for unusual node degree (connections)
    const nodeDegree = this.getNodeDegree(node.id);
    const avgDegree = this.calculateAverageNodeDegree();

    if (nodeDegree > avgDegree * (1 + this.config.anomaly_detection.sensitivity)) {
      const anomaly: GraphAnomaly = {
        id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'abnormal_frequency',
        nodes: [node],
        edges: this.getNodeEdges(node.id),
        description: `Node ${node.label} has unusually high connectivity`,
        anomaly_score: (nodeDegree - avgDegree) / avgDegree,
        baseline_comparison: {
          expected: avgDegree,
          observed: nodeDegree,
          deviation: nodeDegree - avgDegree
        },
        first_detected: Date.now(),
        last_detected: Date.now(),
        occurrences: 1
      };

      this.anomalies.set(anomaly.id, anomaly);

      const event: GraphEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'anomaly_detected',
        timestamp: Date.now(),
        data: anomaly,
        severity: 'medium'
      };
      this.events.push(event);
      this.emit('anomaly:detected', anomaly);
    }
  }

  /**
   * Get node degree (number of connections)
   */
  private getNodeDegree(nodeId: string): number {
    return Array.from(this.edges.values()).filter(
      e => e.source === nodeId || e.target === nodeId
    ).length;
  }

  /**
   * Calculate average node degree
   */
  private calculateAverageNodeDegree(): number {
    if (this.nodes.size === 0) return 0;
    const totalDegree = Array.from(this.nodes.keys())
      .reduce((sum, nodeId) => sum + this.getNodeDegree(nodeId), 0);
    return totalDegree / this.nodes.size;
  }

  /**
   * Get all edges connected to a node
   */
  private getNodeEdges(nodeId: string): GraphEdge[] {
    return Array.from(this.edges.values()).filter(
      e => e.source === nodeId || e.target === nodeId
    );
  }

  /**
   * Calculate threat severity from risk score
   */
  private calculateSeverity(riskScore: number): ThreatSeverity {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    if (riskScore >= 20) return 'low';
    return 'info';
  }

  /**
   * Extract MITRE ATT&CK tactics from attack phases
   */
  private extractTactics(phases: Set<AttackPhase>): string[] {
    const tacticsMap: Record<AttackPhase, string> = {
      reconnaissance: 'TA0043',
      initial_access: 'TA0001',
      execution: 'TA0002',
      persistence: 'TA0003',
      privilege_escalation: 'TA0004',
      defense_evasion: 'TA0005',
      credential_access: 'TA0006',
      discovery: 'TA0007',
      lateral_movement: 'TA0008',
      collection: 'TA0009',
      exfiltration: 'TA0010',
      impact: 'TA0040'
    };

    return Array.from(phases).map(phase => tacticsMap[phase]);
  }

  /**
   * Extract techniques from edges
   */
  private extractTechniques(edges: GraphEdge[]): string[] {
    const techniques: string[] = [];
    for (const edge of edges) {
      if (edge.properties.technique) {
        techniques.push(edge.properties.technique);
      }
    }
    return [...new Set(techniques)];
  }

  /**
   * Extract indicators from nodes and edges
   */
  private extractIndicators(nodes: GraphNode[], edges: GraphEdge[]): AttackPath['indicators'] {
    const indicators: AttackPath['indicators'] = [];

    for (const node of nodes) {
      if (node.properties.ip_address) {
        indicators.push({
          type: 'ip_address',
          value: node.properties.ip_address,
          confidence: 0.8
        });
      }
      if (node.properties.file_hash) {
        indicators.push({
          type: 'file_hash',
          value: node.properties.file_hash,
          confidence: 0.9
        });
      }
    }

    return indicators;
  }

  /**
   * Generate human-readable path description
   */
  private generatePathDescription(nodes: GraphNode[], edges: GraphEdge[]): string {
    const nodeLabels = nodes.map(n => n.label).join(' → ');
    const edgeTypes = [...new Set(edges.map(e => e.type))].join(', ');
    return `Attack path detected: ${nodeLabels} (via ${edgeTypes})`;
  }

  /**
   * Query the graph
   */
  query(query: GraphQuery): { nodes: GraphNode[]; edges: GraphEdge[] } {
    let nodes = Array.from(this.nodes.values());
    let edges = Array.from(this.edges.values());

    // Apply node filters
    if (query.node_filters) {
      if (query.node_filters.types) {
        nodes = nodes.filter(n => query.node_filters!.types!.includes(n.type));
      }
      if (query.node_filters.min_risk_score !== undefined) {
        nodes = nodes.filter(n => n.risk_score >= query.node_filters!.min_risk_score!);
      }
      if (query.node_filters.tags) {
        nodes = nodes.filter(n =>
          query.node_filters!.tags!.some(tag => n.tags.includes(tag))
        );
      }
    }

    // Apply edge filters
    if (query.edge_filters) {
      if (query.edge_filters.types) {
        edges = edges.filter(e => query.edge_filters!.types!.includes(e.type));
      }
      if (query.edge_filters.suspicious_only) {
        edges = edges.filter(e => e.suspicious);
      }
    }

    // Apply temporal window
    if (query.temporal_window) {
      edges = edges.filter(e =>
        e.timestamp >= query.temporal_window!.start &&
        e.timestamp <= query.temporal_window!.end
      );
    }

    // Apply max results
    if (query.max_results) {
      nodes = nodes.slice(0, query.max_results);
      edges = edges.slice(0, query.max_results);
    }

    return { nodes, edges };
  }

  /**
   * Get graph metrics
   */
  getMetrics(): GraphMetrics {
    const nodesByType: Record<NodeType, number> = {
      user: 0,
      device: 0,
      service: 0,
      ip_address: 0,
      process: 0,
      file: 0,
      network: 0,
      credential: 0
    };

    for (const node of this.nodes.values()) {
      nodesByType[node.type]++;
    }

    const edgesByType: Record<EdgeType, number> = {
      access: 0,
      authentication: 0,
      communication: 0,
      execution: 0,
      file_access: 0,
      network_connection: 0,
      privilege_escalation: 0,
      data_exfiltration: 0,
      lateral_movement: 0
    };

    for (const edge of this.edges.values()) {
      edgesByType[edge.type]++;
    }

    const timestamps = Array.from(this.edges.values()).map(e => e.timestamp);
    const earliestEvent = timestamps.length > 0 ? Math.min(...timestamps) : Date.now();
    const latestEvent = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();

    return {
      total_nodes: this.nodes.size,
      total_edges: this.edges.size,
      nodes_by_type: nodesByType,
      edges_by_type: edgesByType,
      avg_node_degree: this.calculateAverageNodeDegree(),
      max_node_degree: Math.max(...Array.from(this.nodes.keys()).map(id => this.getNodeDegree(id)), 0),
      connected_components: this.countConnectedComponents(),
      graph_density: this.calculateGraphDensity(),
      clustering_coefficient: 0, // Simplified
      avg_path_length: 0, // Simplified
      temporal_span: {
        earliest_event: earliestEvent,
        latest_event: latestEvent,
        duration: latestEvent - earliestEvent
      },
      high_risk_nodes: Array.from(this.nodes.values()).filter(n => n.risk_score >= 70).length,
      suspicious_edges: Array.from(this.edges.values()).filter(e => e.suspicious).length,
      timestamp: Date.now()
    };
  }

  /**
   * Count connected components using Union-Find
   */
  private countConnectedComponents(): number {
    const visited = new Set<string>();
    let components = 0;

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        this.dfsVisit(nodeId, visited);
        components++;
      }
    }

    return components;
  }

  /**
   * DFS visit for connected components
   */
  private dfsVisit(nodeId: string, visited: Set<string>): void {
    visited.add(nodeId);
    const connectedEdges = Array.from(this.edges.values()).filter(
      e => e.source === nodeId || e.target === nodeId
    );

    for (const edge of connectedEdges) {
      const neighbor = edge.source === nodeId ? edge.target : edge.source;
      if (!visited.has(neighbor)) {
        this.dfsVisit(neighbor, visited);
      }
    }
  }

  /**
   * Calculate graph density
   */
  private calculateGraphDensity(): number {
    if (this.nodes.size < 2) return 0;
    const maxEdges = (this.nodes.size * (this.nodes.size - 1)) / 2;
    return this.edges.size / maxEdges;
  }

  /**
   * Start auto cleanup timer
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 3600000); // Every hour
  }

  /**
   * Cleanup old data
   */
  cleanup(): void {
    const cutoff = Date.now() - this.config.retention_period;

    // Remove old edges
    for (const [id, edge] of this.edges.entries()) {
      if (edge.timestamp < cutoff) {
        this.edges.delete(id);
      }
    }

    // Remove nodes with no edges
    for (const [id, node] of this.nodes.entries()) {
      if (node.last_seen < cutoff && this.getNodeDegree(id) === 0) {
        this.nodes.delete(id);
      }
    }

    // Cleanup old events
    this.events = this.events.filter(e => e.timestamp >= cutoff);
  }

  /**
   * Get all attack paths
   */
  getAttackPaths(): AttackPath[] {
    return Array.from(this.attackPaths.values());
  }

  /**
   * Get all lateral movements
   */
  getLateralMovements(): LateralMovement[] {
    return Array.from(this.lateralMovements.values());
  }

  /**
   * Get all anomalies
   */
  getAnomalies(): GraphAnomaly[] {
    return Array.from(this.anomalies.values());
  }

  /**
   * Destroy engine and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.nodes.clear();
    this.edges.clear();
    this.patterns.clear();
    this.attackPaths.clear();
    this.lateralMovements.clear();
    this.threatEvolutions.clear();
    this.anomalies.clear();
    this.events = [];
  }
}
