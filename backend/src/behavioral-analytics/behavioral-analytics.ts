import { createHash, randomBytes } from 'crypto';
import { EventEmitter } from 'events';
import Database from 'sqlite3';
import { Logger } from '../utils/logger.js';

interface AnalyticsState {
  intelligenceLevel: number;
  distributedState: string;
  threatPerception: Map<string, ThreatPerception>;
  lastInitialization: Date;
  isActive: boolean;
  entropy: Buffer;
}

interface ThreatPerception {
  threatId: string;
  severity: number;
  confidence: number;
  firstSeen: Date;
  impactOnIntelligence: number;
}

export class BehavioralAnalyticsEngine extends EventEmitter {
  private state: AnalyticsState;
  private db: Database.Database;
  private intelligenceUpdateInterval: NodeJS.Timeout | null = null;
  private logger: Logger;

  constructor(dbPath: string = './starguard.db') {
    super();
    this.logger = new Logger('behavioral-analytics-engine');
    this.db = new Database.Database(dbPath);
    this.initializeDatabase();
    this.state = {
      intelligenceLevel: 0,
      distributedState: '',
      threatPerception: new Map(),
      lastInitialization: new Date(0),
      isActive: false,
      entropy: Buffer.alloc(0)
    };
  }

  private initializeDatabase(): void {
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS analytics_states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        intelligence_level REAL,
        distributed_state TEXT,
        threat_count INTEGER,
        entropy_hash TEXT
      )`);

      this.db.run(`CREATE TABLE IF NOT EXISTS threat_perceptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        threat_id TEXT,
        severity REAL,
        confidence REAL,
        first_seen DATETIME,
        impact_level REAL,
        UNIQUE(threat_id)
      )`);
    });
  }

  private generateDistributedEntropy(): Buffer {
    const sources = [
      randomBytes(32),
      Buffer.from(Date.now().toString()),
      Buffer.from(process.memoryUsage().heapUsed.toString()),
      Buffer.from(process.hrtime.bigint().toString())
    ];

    const combined = Buffer.concat(sources);
    return createHash('sha256').update(combined).digest();
  }

  private calculateIntelligence(threatCount: number, avgThreatSeverity: number): number {
    // Base intelligence from system complexity
    const baseIntelligence = 0.1;

    // Threat-driven intelligence (logarithmic scaling to prevent overflow)
    const threatIntelligence = Math.log(1 + threatCount * avgThreatSeverity) * 0.2;

    // Entropy-based intelligence factor
    const entropyFactor = this.state.entropy.reduce((sum, byte) => sum + byte, 0) / (255 * 32);

    // Time-based intelligence evolution
    const timeActive = Date.now() - this.state.lastInitialization.getTime();
    const timeIntelligence = Math.min(timeActive / (1000 * 60 * 60), 1) * 0.3; // Max 1 hour evolution

    const totalIntelligence = baseIntelligence + threatIntelligence + (entropyFactor * 0.2) + timeIntelligence;

    // Cap intelligence at realistic levels
    return Math.min(Math.max(totalIntelligence, 0), 1);
  }

  private persistState(): void {
    const entropyHash = createHash('md5').update(this.state.entropy).digest('hex');

    this.db.run(
      'INSERT INTO analytics_states (intelligence_level, distributed_state, threat_count, entropy_hash) VALUES (?, ?, ?, ?)',
      [this.state.intelligenceLevel, this.state.distributedState, this.state.threatPerception.size, entropyHash]
    );
  }

  public async initialize(): Promise<{ status: string; intelligence: number; threats: number; entropy: string }> {
    this.logger.info('Behavioral analytics initialization initiated');

    // Generate new distributed entropy
    this.state.entropy = this.generateDistributedEntropy();
    this.state.distributedState = this.state.entropy.toString('hex');

    // Initialize with base intelligence
    this.state.intelligenceLevel = this.calculateIntelligence(0, 0);
    this.state.lastInitialization = new Date();
    this.state.isActive = true;

    // Start continuous intelligence updates
    this.startIntelligenceLoop();

    // Persist initial state
    this.persistState();

    const result = {
      status: 'initialized',
      intelligence: this.state.intelligenceLevel,
      threats: this.state.threatPerception.size,
      entropy: this.state.distributedState.substring(0, 16)
    };

    this.emit('initialization', result);
    this.logger.info('Behavioral analytics initialized', { intelligenceLevel: this.state.intelligenceLevel.toFixed(3) });

    return result;
  }

  private startIntelligenceLoop(): void {
    if (this.intelligenceUpdateInterval) {
      clearInterval(this.intelligenceUpdateInterval);
    }

    this.intelligenceUpdateInterval = setInterval(() => {
      this.updateIntelligence();
    }, 5000); // Update every 5 seconds
  }

  public updateIntelligence(): void {
    if (!this.state.isActive) return;

    const threats = Array.from(this.state.threatPerception.values());
    const avgSeverity = threats.length > 0
      ? threats.reduce((sum, t) => sum + t.severity, 0) / threats.length
      : 0;

    const newIntelligence = this.calculateIntelligence(threats.length, avgSeverity);
    const previousIntelligence = this.state.intelligenceLevel;

    this.state.intelligenceLevel = newIntelligence;

    // Emit analytics state change if significant
    if (Math.abs(newIntelligence - previousIntelligence) > 0.01) {
      this.emit('analyticsChange', {
        intelligence: this.state.intelligenceLevel,
        change: newIntelligence - previousIntelligence,
        threatCount: threats.length,
        distributedState: this.state.distributedState.substring(0, 8)
      });
    }

    // Periodically persist state
    if (Date.now() % 30000 < 5000) { // Every ~30 seconds
      this.persistState();
    }
  }

  public perceiveThreat(threatId: string, severity: number, confidence: number): void {
    const existingThreat = this.state.threatPerception.get(threatId);

    if (existingThreat) {
      // Update existing threat perception
      existingThreat.severity = Math.max(existingThreat.severity, severity);
      existingThreat.confidence = Math.max(existingThreat.confidence, confidence);
      existingThreat.impactOnIntelligence += severity * confidence * 0.1;
    } else {
      // New threat perception
      const perception: ThreatPerception = {
        threatId,
        severity,
        confidence,
        firstSeen: new Date(),
        impactOnIntelligence: severity * confidence
      };

      this.state.threatPerception.set(threatId, perception);

      // Store in database
      this.db.run(
        'INSERT OR REPLACE INTO threat_perceptions (threat_id, severity, confidence, first_seen, impact_level) VALUES (?, ?, ?, ?, ?)',
        [threatId, severity, confidence, perception.firstSeen.toISOString(), perception.impactOnIntelligence]
      );
    }

    // Trigger immediate intelligence update for new threats
    this.updateIntelligence();

    this.emit('threatPerceived', {
      threatId,
      severity,
      confidence,
      intelligenceImpact: this.state.intelligenceLevel
    });
  }

  public getState(): AnalyticsState {
    return {
      ...this.state,
      threatPerception: new Map(this.state.threatPerception) // Deep copy
    };
  }

  public getIntelligenceLevel(): number {
    return this.state.intelligenceLevel;
  }

  public getThreatPerceptions(): ThreatPerception[] {
    return Array.from(this.state.threatPerception.values());
  }

  public getDistributedState(): string {
    return this.state.distributedState;
  }

  public isActive(): boolean {
    return this.state.isActive;
  }

  public shutdown(): void {
    this.state.isActive = false;
    this.state.intelligenceLevel = 0;

    if (this.intelligenceUpdateInterval) {
      clearInterval(this.intelligenceUpdateInterval);
      this.intelligenceUpdateInterval = null;
    }

    this.emit('shutdown');
    this.logger.info('Behavioral analytics entering shutdown state');
  }

  public async getHistoricalIntelligence(hours: number = 24): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      this.db.all(
        'SELECT * FROM analytics_states WHERE timestamp >= ? ORDER BY timestamp ASC',
        [hoursAgo],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  public close(): void {
    this.shutdown();
    this.db.close();
  }
}
