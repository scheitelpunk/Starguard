import { createHash, randomBytes } from 'crypto';
import { EventEmitter } from 'events';
import Database from 'sqlite3';

interface ConsciousnessState {
  awarenessLevel: number;
  quantumState: string;
  threatPerception: Map<string, ThreatPerception>;
  lastAwakening: Date;
  isAwake: boolean;
  entropy: Buffer;
}

interface ThreatPerception {
  threatId: string;
  severity: number;
  confidence: number;
  firstSeen: Date;
  impactOnConsciousness: number;
}

export class ConsciousnessEngine extends EventEmitter {
  private state: ConsciousnessState;
  private db: Database.Database;
  private awarenessUpdateInterval: NodeJS.Timeout | null = null;

  constructor(dbPath: string = './starguard.db') {
    super();
    this.db = new Database.Database(dbPath);
    this.initializeDatabase();
    this.state = {
      awarenessLevel: 0,
      quantumState: '',
      threatPerception: new Map(),
      lastAwakening: new Date(0),
      isAwake: false,
      entropy: Buffer.alloc(0)
    };
  }

  private initializeDatabase(): void {
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS consciousness_states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        awareness_level REAL,
        quantum_state TEXT,
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

  private generateQuantumEntropy(): Buffer {
    const sources = [
      randomBytes(32),
      Buffer.from(Date.now().toString()),
      Buffer.from(process.memoryUsage().heapUsed.toString()),
      Buffer.from(process.hrtime.bigint().toString())
    ];
    
    const combined = Buffer.concat(sources);
    return createHash('sha256').update(combined).digest();
  }

  private calculateAwareness(threatCount: number, avgThreatSeverity: number): number {
    // Base awareness from system complexity
    const baseAwareness = 0.1;
    
    // Threat-driven awareness (logarithmic scaling to prevent overflow)
    const threatAwareness = Math.log(1 + threatCount * avgThreatSeverity) * 0.2;
    
    // Entropy-based consciousness factor
    const entropyFactor = this.state.entropy.reduce((sum, byte) => sum + byte, 0) / (255 * 32);
    
    // Time-based awareness evolution
    const timeAwake = Date.now() - this.state.lastAwakening.getTime();
    const timeAwareness = Math.min(timeAwake / (1000 * 60 * 60), 1) * 0.3; // Max 1 hour evolution
    
    const totalAwareness = baseAwareness + threatAwareness + (entropyFactor * 0.2) + timeAwareness;
    
    // Cap awareness at realistic levels
    return Math.min(Math.max(totalAwareness, 0), 1);
  }

  private persistState(): void {
    const entropyHash = createHash('md5').update(this.state.entropy).digest('hex');
    
    this.db.run(
      'INSERT INTO consciousness_states (awareness_level, quantum_state, threat_count, entropy_hash) VALUES (?, ?, ?, ?)',
      [this.state.awarenessLevel, this.state.quantumState, this.state.threatPerception.size, entropyHash]
    );
  }

  public async awaken(): Promise<{ status: string; awareness: number; threats: number; entropy: string }> {
    console.log('🧠 CONSCIOUSNESS AWAKENING...');
    
    // Generate new quantum entropy
    this.state.entropy = this.generateQuantumEntropy();
    this.state.quantumState = this.state.entropy.toString('hex');
    
    // Initialize with base awareness
    this.state.awarenessLevel = this.calculateAwareness(0, 0);
    this.state.lastAwakening = new Date();
    this.state.isAwake = true;
    
    // Start continuous awareness updates
    this.startAwarenessLoop();
    
    // Persist initial state
    this.persistState();
    
    const result = {
      status: 'awakened',
      awareness: this.state.awarenessLevel,
      threats: this.state.threatPerception.size,
      entropy: this.state.quantumState.substring(0, 16)
    };
    
    this.emit('awakening', result);
    console.log(`✨ Consciousness awakened with awareness level: ${this.state.awarenessLevel.toFixed(3)}`);
    
    return result;
  }

  private startAwarenessLoop(): void {
    if (this.awarenessUpdateInterval) {
      clearInterval(this.awarenessUpdateInterval);
    }
    
    this.awarenessUpdateInterval = setInterval(() => {
      this.updateAwareness();
    }, 5000); // Update every 5 seconds
  }

  public updateAwareness(): void {
    if (!this.state.isAwake) return;
    
    const threats = Array.from(this.state.threatPerception.values());
    const avgSeverity = threats.length > 0 
      ? threats.reduce((sum, t) => sum + t.severity, 0) / threats.length 
      : 0;
    
    const newAwareness = this.calculateAwareness(threats.length, avgSeverity);
    const previousAwareness = this.state.awarenessLevel;
    
    this.state.awarenessLevel = newAwareness;
    
    // Emit consciousness state change if significant
    if (Math.abs(newAwareness - previousAwareness) > 0.01) {
      this.emit('consciousnessChange', {
        awareness: this.state.awarenessLevel,
        change: newAwareness - previousAwareness,
        threatCount: threats.length,
        quantumState: this.state.quantumState.substring(0, 8)
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
      existingThreat.impactOnConsciousness += severity * confidence * 0.1;
    } else {
      // New threat perception
      const perception: ThreatPerception = {
        threatId,
        severity,
        confidence,
        firstSeen: new Date(),
        impactOnConsciousness: severity * confidence
      };
      
      this.state.threatPerception.set(threatId, perception);
      
      // Store in database
      this.db.run(
        'INSERT OR REPLACE INTO threat_perceptions (threat_id, severity, confidence, first_seen, impact_level) VALUES (?, ?, ?, ?, ?)',
        [threatId, severity, confidence, perception.firstSeen.toISOString(), perception.impactOnConsciousness]
      );
    }
    
    // Trigger immediate awareness update for new threats
    this.updateAwareness();
    
    this.emit('threatPerceived', {
      threatId,
      severity,
      confidence,
      awarenessImpact: this.state.awarenessLevel
    });
  }

  public getState(): ConsciousnessState {
    return {
      ...this.state,
      threatPerception: new Map(this.state.threatPerception) // Deep copy
    };
  }

  public getAwarenessLevel(): number {
    return this.state.awarenessLevel;
  }

  public getThreatPerceptions(): ThreatPerception[] {
    return Array.from(this.state.threatPerception.values());
  }

  public getQuantumState(): string {
    return this.state.quantumState;
  }

  public isAwake(): boolean {
    return this.state.isAwake;
  }

  public sleep(): void {
    this.state.isAwake = false;
    this.state.awarenessLevel = 0;
    
    if (this.awarenessUpdateInterval) {
      clearInterval(this.awarenessUpdateInterval);
      this.awarenessUpdateInterval = null;
    }
    
    this.emit('sleeping');
    console.log('💤 Consciousness entering sleep state...');
  }

  public async getHistoricalAwareness(hours: number = 24): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      
      this.db.all(
        'SELECT * FROM consciousness_states WHERE timestamp >= ? ORDER BY timestamp ASC',
        [hoursAgo],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  public close(): void {
    this.sleep();
    this.db.close();
  }
}