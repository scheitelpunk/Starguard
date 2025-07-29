import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { getDatabase } from '../utils/database';

interface Entity {
  id: string;
  type: 'individual' | 'organization' | 'account';
  risk_score: number;
  metadata: any;
}

interface Connection {
  from_id: string;
  to_id: string;
  type: string;
  strength: number;
  timestamp: Date;
}

interface CollusionNetwork {
  id: string;
  entities: Entity[];
  connections: Connection[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  patterns_detected: string[];
  timestamp: Date;
}

export class CollusionMapper extends EventEmitter {
  private logger: Logger;
  private networks: Map<string, CollusionNetwork> = new Map();

  constructor(logger: Logger) {
    super();
    this.logger = logger;
  }

  async mapNetwork(seedEntityId: string): Promise<CollusionNetwork> {
    const db = await getDatabase();
    const entities = new Map<string, Entity>();
    const connections: Connection[] = [];
    
    // Start with seed entity
    const seedEntity = await this.getEntity(seedEntityId);
    entities.set(seedEntityId, seedEntity);
    
    // Breadth-first search for connections
    const queue = [seedEntityId];
    const visited = new Set<string>();
    
    while (queue.length > 0 && entities.size < 100) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      
      // Find direct connections
      const directConnections = await this.findConnections(currentId);
      
      for (const conn of directConnections) {
        connections.push(conn);
        
        const targetId = conn.from_id === currentId ? conn.to_id : conn.from_id;
        
        if (!entities.has(targetId)) {
          const entity = await this.getEntity(targetId);
          entities.set(targetId, entity);
          
          if (conn.strength > 0.5) {
            queue.push(targetId);
          }
        }
      }
    }
    
    // Analyze network patterns
    const patterns = this.detectPatterns(Array.from(entities.values()), connections);
    const riskLevel = this.assessNetworkRisk(entities, connections, patterns);
    
    const network: CollusionNetwork = {
      id: `network-${Date.now()}`,
      entities: Array.from(entities.values()),
      connections,
      risk_level: riskLevel,
      patterns_detected: patterns,
      timestamp: new Date()
    };
    
    this.networks.set(network.id, network);
    
    if (riskLevel === 'high' || riskLevel === 'critical') {
      this.emit('collusion_detected', network);
    }
    
    return network;
  }

  private async getEntity(entityId: string): Promise<Entity> {
    const db = await getDatabase();
    
    const result = await db.query(
      `SELECT * FROM entities WHERE id = $1`,
      [entityId]
    );
    
    if (result.rows.length === 0) {
      return {
        id: entityId,
        type: 'account',
        risk_score: 0.5,
        metadata: {}
      };
    }
    
    return result.rows[0];
  }

  private async findConnections(entityId: string): Promise<Connection[]> {
    const db = await getDatabase();
    
    // Find transaction connections
    const transactionResult = await db.query(
      `SELECT DISTINCT 
         CASE WHEN from_account = $1 THEN to_account ELSE from_account END as connected_id,
         COUNT(*) as transaction_count,
         SUM(amount) as total_amount,
         MAX(timestamp) as last_transaction
       FROM transactions
       WHERE from_account = $1 OR to_account = $1
       GROUP BY connected_id
       HAVING COUNT(*) > 3`,
      [entityId]
    );
    
    const connections: Connection[] = [];
    
    for (const row of transactionResult.rows) {
      connections.push({
        from_id: entityId,
        to_id: row.connected_id,
        type: 'transaction',
        strength: Math.min(1, row.transaction_count / 20),
        timestamp: row.last_transaction
      });
    }
    
    return connections;
  }

  private detectPatterns(entities: Entity[], connections: Connection[]): string[] {
    const patterns: string[] = [];
    
    // Circular transaction pattern
    if (this.hasCircularPattern(connections)) {
      patterns.push('circular_transactions');
    }
    
    // Hub and spoke pattern
    const hubEntities = this.findHubEntities(entities, connections);
    if (hubEntities.length > 0) {
      patterns.push('hub_and_spoke');
    }
    
    // Layering pattern
    if (this.hasLayeringPattern(connections)) {
      patterns.push('layering');
    }
    
    // Shell company pattern
    const shellCount = entities.filter(e => 
      e.type === 'organization' && e.metadata?.age_days < 90
    ).length;
    if (shellCount > entities.length * 0.3) {
      patterns.push('shell_companies');
    }
    
    return patterns;
  }

  private hasCircularPattern(connections: Connection[]): boolean {
    // Simple cycle detection
    const graph = new Map<string, Set<string>>();
    
    connections.forEach(conn => {
      if (!graph.has(conn.from_id)) graph.set(conn.from_id, new Set());
      if (!graph.has(conn.to_id)) graph.set(conn.to_id, new Set());
      
      graph.get(conn.from_id)!.add(conn.to_id);
    });
    
    // DFS to find cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);
      
      const neighbors = graph.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }
      
      recursionStack.delete(node);
      return false;
    };
    
    for (const node of graph.keys()) {
      if (!visited.has(node) && hasCycle(node)) {
        return true;
      }
    }
    
    return false;
  }

  private findHubEntities(entities: Entity[], connections: Connection[]): Entity[] {
    const connectionCount = new Map<string, number>();
    
    connections.forEach(conn => {
      connectionCount.set(conn.from_id, (connectionCount.get(conn.from_id) || 0) + 1);
      connectionCount.set(conn.to_id, (connectionCount.get(conn.to_id) || 0) + 1);
    });
    
    const avgConnections = Array.from(connectionCount.values()).reduce((a, b) => a + b, 0) / 
                          connectionCount.size;
    
    return entities.filter(entity => 
      (connectionCount.get(entity.id) || 0) > avgConnections * 3
    );
  }

  private hasLayeringPattern(connections: Connection[]): boolean {
    // Check for sequential transactions with decreasing amounts
    const sequences = new Map<string, Connection[]>();
    
    connections.forEach(conn => {
      if (!sequences.has(conn.from_id)) {
        sequences.set(conn.from_id, []);
      }
      sequences.get(conn.from_id)!.push(conn);
    });
    
    for (const [_, conns] of sequences) {
      if (conns.length > 5) {
        return true;
      }
    }
    
    return false;
  }

  private assessNetworkRisk(
    entities: Map<string, Entity>,
    connections: Connection[],
    patterns: string[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;
    
    // Pattern-based risk
    riskScore += patterns.length * 0.2;
    
    // Entity risk
    const avgEntityRisk = Array.from(entities.values())
      .reduce((sum, e) => sum + e.risk_score, 0) / entities.size;
    riskScore += avgEntityRisk * 0.5;
    
    // Connection density risk
    const density = connections.length / Math.max(1, entities.size);
    if (density > 3) riskScore += 0.3;
    
    if (riskScore > 0.9) return 'critical';
    if (riskScore > 0.7) return 'high';
    if (riskScore > 0.4) return 'medium';
    return 'low';
  }
}