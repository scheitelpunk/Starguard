// STARGUARD Database Manager
// Production SQLite with optimizations for 8GB RAM
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { dbConfig } from '../config/index.js';
// Enable verbose mode in development
if (process.env.NODE_ENV !== 'production') {
    sqlite3.verbose();
}
export class DatabaseManager {
    db = null;
    initialized = false;
    backupInterval = null;
    async initialize() {
        if (this.initialized)
            return;
        // Ensure database directory exists
        const dbDir = dirname(dbConfig.database);
        if (!existsSync(dbDir)) {
            mkdirSync(dbDir, { recursive: true });
        }
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbConfig.database, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.setupDatabase()
                    .then(() => {
                    this.initialized = true;
                    this.startBackupSchedule();
                    resolve();
                })
                    .catch(reject);
            });
        });
    }
    async setupDatabase() {
        if (!this.db)
            throw new Error('Database not initialized');
        const run = promisify(this.db.run.bind(this.db));
        // Performance optimizations for 8GB RAM
        await run('PRAGMA journal_mode = WAL'); // Write-Ahead Logging
        await run('PRAGMA synchronous = NORMAL'); // Balanced safety/speed
        await run('PRAGMA cache_size = -131072'); // 128MB cache
        await run('PRAGMA temp_store = MEMORY'); // Use RAM for temp tables
        await run('PRAGMA mmap_size = 536870912'); // 512MB memory map
        await run('PRAGMA page_size = 4096'); // Optimal page size
        await run('PRAGMA foreign_keys = ON'); // Enforce relationships
        // Create tables
        await this.createTables();
        await this.createIndexes();
    }
    async createTables() {
        if (!this.db)
            throw new Error('Database not initialized');
        const run = promisify(this.db.run.bind(this.db));
        // Threat detection results
        await run(`
      CREATE TABLE IF NOT EXISTS threats (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        type TEXT NOT NULL,
        confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
        source TEXT NOT NULL,
        description TEXT NOT NULL,
        affected_systems TEXT NOT NULL, -- JSON array
        recommended_actions TEXT NOT NULL, -- JSON array
        quantum_signature TEXT,
        ai_pattern TEXT,
        status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'contained', 'resolved')),
        ip_address TEXT,
        region TEXT,
        coordinates TEXT, -- JSON array [lat, lng]
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
        // Consciousness states
        await run(`
      CREATE TABLE IF NOT EXISTS consciousness (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        awareness_level REAL NOT NULL CHECK (awareness_level >= 0 AND awareness_level <= 1),
        quantum_coherence REAL NOT NULL CHECK (quantum_coherence >= 0 AND quantum_coherence <= 1),
        emotional_state TEXT NOT NULL,
        decision_confidence REAL NOT NULL CHECK (decision_confidence >= 0 AND decision_confidence <= 1),
        active_processes TEXT NOT NULL, -- JSON object
        memory_usage TEXT NOT NULL, -- JSON object
        learning_metrics TEXT NOT NULL, -- JSON object
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
        // System metrics
        await run(`
      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        cpu_usage REAL NOT NULL,
        memory_usage REAL NOT NULL,
        network_activity TEXT NOT NULL, -- JSON object
        quantum_processor TEXT NOT NULL, -- JSON object
        ai_performance TEXT NOT NULL, -- JSON object
        security_status TEXT NOT NULL, -- JSON object
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
        // Alert configurations
        await run(`
      CREATE TABLE IF NOT EXISTS alert_configs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        condition_sql TEXT NOT NULL,
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        enabled INTEGER NOT NULL DEFAULT 1,
        cooldown INTEGER NOT NULL DEFAULT 300,
        actions TEXT NOT NULL, -- JSON object
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
        // Connection logs
        await run(`
      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        connected_at INTEGER NOT NULL,
        disconnected_at INTEGER,
        session_duration INTEGER,
        messages_sent INTEGER DEFAULT 0,
        messages_received INTEGER DEFAULT 0,
        subscriptions TEXT, -- JSON array
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    }
    async createIndexes() {
        if (!this.db)
            throw new Error('Database not initialized');
        const run = promisify(this.db.run.bind(this.db));
        // Performance indexes
        await run('CREATE INDEX IF NOT EXISTS idx_threats_timestamp ON threats(timestamp)');
        await run('CREATE INDEX IF NOT EXISTS idx_threats_severity ON threats(severity)');
        await run('CREATE INDEX IF NOT EXISTS idx_threats_status ON threats(status)');
        await run('CREATE INDEX IF NOT EXISTS idx_threats_type ON threats(type)');
        await run('CREATE INDEX IF NOT EXISTS idx_consciousness_timestamp ON consciousness(timestamp)');
        await run('CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp)');
        await run('CREATE INDEX IF NOT EXISTS idx_connections_ip ON connections(ip_address)');
        await run('CREATE INDEX IF NOT EXISTS idx_connections_connected_at ON connections(connected_at)');
    }
    // Threat operations
    async saveThreat(threat) {
        if (!this.db)
            throw new Error('Database not initialized');
        const run = promisify(this.db.run.bind(this.db));
        await run(`
      INSERT OR REPLACE INTO threats (
        id, timestamp, severity, type, confidence, source, description,
        affected_systems, recommended_actions, quantum_signature, ai_pattern,
        status, ip_address, region, coordinates, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
    `, [
            threat.id,
            threat.timestamp,
            threat.severity,
            threat.type,
            threat.confidence,
            threat.source,
            threat.details.description,
            JSON.stringify(threat.details.affected_systems),
            JSON.stringify(threat.details.recommended_actions),
            threat.details.quantum_signature || null,
            threat.details.ai_pattern || null,
            threat.status,
            threat.location.ip || null,
            threat.location.region || null,
            threat.location.coordinates ? JSON.stringify(threat.location.coordinates) : null
        ]);
    }
    async getThreats(limit = 100, severity) {
        if (!this.db)
            throw new Error('Database not initialized');
        const all = promisify(this.db.all.bind(this.db));
        const query = severity
            ? 'SELECT * FROM threats WHERE severity = ? ORDER BY timestamp DESC LIMIT ?'
            : 'SELECT * FROM threats ORDER BY timestamp DESC LIMIT ?';
        const params = severity ? [severity, limit] : [limit];
        const rows = await all(query, params);
        return rows.map(row => ({
            id: row.id,
            timestamp: row.timestamp,
            severity: row.severity,
            type: row.type,
            confidence: row.confidence,
            source: row.source,
            details: {
                description: row.description,
                affected_systems: JSON.parse(row.affected_systems),
                recommended_actions: JSON.parse(row.recommended_actions),
                quantum_signature: row.quantum_signature,
                ai_pattern: row.ai_pattern
            },
            status: row.status,
            location: {
                ip: row.ip_address,
                region: row.region,
                coordinates: row.coordinates ? JSON.parse(row.coordinates) : undefined
            }
        }));
    }
    // Consciousness operations
    async saveConsciousnessState(state) {
        if (!this.db)
            throw new Error('Database not initialized');
        const run = promisify(this.db.run.bind(this.db));
        await run(`
      INSERT INTO consciousness (
        id, timestamp, awareness_level, quantum_coherence, emotional_state,
        decision_confidence, active_processes, memory_usage, learning_metrics
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            state.id,
            state.timestamp,
            state.awareness_level,
            state.quantum_coherence,
            state.emotional_state,
            state.decision_confidence,
            JSON.stringify(state.active_processes),
            JSON.stringify(state.memory_usage),
            JSON.stringify(state.learning_metrics)
        ]);
    }
    // Metrics operations
    async saveMetrics(metrics) {
        if (!this.db)
            throw new Error('Database not initialized');
        const run = promisify(this.db.run.bind(this.db));
        await run(`
      INSERT INTO metrics (
        timestamp, cpu_usage, memory_usage, network_activity,
        quantum_processor, ai_performance, security_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
            metrics.timestamp,
            metrics.cpu_usage,
            metrics.memory_usage,
            JSON.stringify(metrics.network_activity),
            JSON.stringify(metrics.quantum_processor),
            JSON.stringify(metrics.ai_performance),
            JSON.stringify(metrics.security_status)
        ]);
    }
    async getLatestMetrics() {
        if (!this.db)
            throw new Error('Database not initialized');
        const get = promisify(this.db.get.bind(this.db));
        const row = await get('SELECT * FROM metrics ORDER BY timestamp DESC LIMIT 1');
        if (!row)
            return null;
        return {
            timestamp: row.timestamp,
            cpu_usage: row.cpu_usage,
            memory_usage: row.memory_usage,
            network_activity: JSON.parse(row.network_activity),
            quantum_processor: JSON.parse(row.quantum_processor),
            ai_performance: JSON.parse(row.ai_performance),
            security_status: JSON.parse(row.security_status)
        };
    }
    // Cleanup old data to manage memory
    async cleanup(retentionDays = 30) {
        if (!this.db)
            throw new Error('Database not initialized');
        const run = promisify(this.db.run.bind(this.db));
        const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
        await run('DELETE FROM metrics WHERE timestamp < ?', [cutoffTime]);
        await run('DELETE FROM consciousness WHERE timestamp < ?', [cutoffTime]);
        await run('DELETE FROM connections WHERE connected_at < ?', [cutoffTime]);
        // Run VACUUM to reclaim space
        await run('VACUUM');
    }
    startBackupSchedule() {
        if (this.backupInterval)
            return;
        this.backupInterval = setInterval(async () => {
            try {
                await this.backup();
            }
            catch (error) {
                console.error('Backup failed:', error);
            }
        }, dbConfig.backup_interval * 60 * 1000);
    }
    async backup() {
        if (!this.db)
            return;
        const run = promisify(this.db.run.bind(this.db));
        const backupPath = dbConfig.database.replace('.db', `-backup-${Date.now()}.db`);
        await run(`VACUUM INTO '${backupPath}'`);
        console.log(`Database backed up to: ${backupPath}`);
    }
    async close() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
            this.backupInterval = null;
        }
        if (this.db) {
            return new Promise((resolve) => {
                this.db.close((err) => {
                    if (err)
                        console.error('Error closing database:', err);
                    this.db = null;
                    this.initialized = false;
                    resolve();
                });
            });
        }
    }
}
// Export singleton instance
export const database = new DatabaseManager();
//# sourceMappingURL=database.js.map