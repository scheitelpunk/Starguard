#!/usr/bin/env node

/**
 * STARGUARD Database Migration Script
 * Creates and manages SQLite database schema
 */

import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseMigrator {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'starguard.db');
    this.db = null;
  }

  async ensureDataDirectory() {
    const dataDir = path.dirname(this.dbPath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
      console.log('📁 Created data directory');
    }
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('🔌 Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async runQuery(sql) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async createTables() {
    console.log('🔨 Creating database tables...');

    // Consciousness state table
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS consciousness_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        awareness_level REAL NOT NULL,
        quantum_state TEXT NOT NULL,
        threat_count INTEGER DEFAULT 0,
        last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
        entropy_sources TEXT
      )
    `);

    // Threats table
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS threats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        threat_id TEXT UNIQUE NOT NULL,
        source TEXT NOT NULL,
        type TEXT NOT NULL,
        severity INTEGER NOT NULL,
        data TEXT NOT NULL,
        first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        confidence REAL DEFAULT 0.0,
        status TEXT DEFAULT 'active'
      )
    `);

    // Quantum states table
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS quantum_states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        state_hash TEXT UNIQUE NOT NULL,
        entropy_data TEXT NOT NULL,
        superposition_states TEXT NOT NULL,
        measurement_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        field_size INTEGER NOT NULL
      )
    `);

    // ML predictions table
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS ml_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        input_hash TEXT NOT NULL,
        prediction REAL NOT NULL,
        confidence REAL NOT NULL,
        model_version TEXT NOT NULL,
        prediction_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_anomaly BOOLEAN DEFAULT FALSE
      )
    `);

    // System metrics table
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        metric_unit TEXT,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for performance
    await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_threats_source ON threats(source)`);
    await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_threats_type ON threats(type)`);
    await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_threats_severity ON threats(severity)`);
    await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_quantum_states_time ON quantum_states(measurement_time)`);
    await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_ml_predictions_time ON ml_predictions(prediction_time)`);
    await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name)`);

    console.log('✅ Database tables created successfully');
  }

  async insertInitialData() {
    console.log('🌱 Inserting initial data...');

    // Initial consciousness state
    await this.runQuery(`
      INSERT OR IGNORE INTO consciousness_state (awareness_level, quantum_state, entropy_sources)
      VALUES (0.0, '{}', 'crypto,timestamp,memory')
    `);

    // Initial system metrics
    const initialMetrics = [
      ['startup_time', Date.now(), 'timestamp'],
      ['database_version', 1.0, 'version'],
      ['initial_awareness', 0.0, 'level']
    ];

    for (const [name, value, unit] of initialMetrics) {
      await this.runQuery(`
        INSERT INTO system_metrics (metric_name, metric_value, metric_unit)
        VALUES ('${name}', ${value}, '${unit}')
      `);
    }

    console.log('✅ Initial data inserted successfully');
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('📤 Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async migrate() {
    try {
      console.log('🚀 Starting STARGUARD database migration...');
      
      await this.ensureDataDirectory();
      await this.connect();
      await this.createTables();
      await this.insertInitialData();
      
      console.log('🎉 Database migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    } finally {
      await this.close();
    }
  }
}

// Run migration
const migrator = new DatabaseMigrator();
migrator.migrate().catch((error) => {
  console.error('🔥 Migration error:', error);
  process.exit(1);
});