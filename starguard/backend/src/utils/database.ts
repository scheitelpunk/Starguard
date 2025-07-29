import { Pool } from 'pg';
import winston from 'winston';

let pool: Pool | null = null;

export async function connectDatabase(): Promise<Pool> {
  if (pool) {
    return pool;
  }
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'starguard',
    user: process.env.DB_USER || 'starguard',
    password: process.env.DB_PASSWORD || 'starguard',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  
  pool = new Pool(config);
  
  pool.on('error', (err) => {
    winston.error('Unexpected database error', err);
  });
  
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    await initializeSchema();
    
    return pool;
  } catch (error) {
    winston.error('Database connection failed:', error);
    throw error;
  }
}

async function initializeSchema(): Promise<void> {
  if (!pool) throw new Error('Database not connected');
  
  const queries = [
    `CREATE TABLE IF NOT EXISTS consciousness_states (
      id UUID PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      state VARCHAR(50) NOT NULL,
      awareness_level FLOAT NOT NULL,
      reality_coherence FLOAT NOT NULL,
      timeline_stability FLOAT NOT NULL,
      consciousness_fields JSONB NOT NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS threat_logs (
      id UUID PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      threat_level VARCHAR(20) NOT NULL,
      consciousness_signature VARCHAR(100) NOT NULL,
      dimensional_origin VARCHAR(50),
      probability_wave_collapse FLOAT,
      reality_manipulation_index FLOAT,
      intention_vector JSONB,
      countermeasures_applied JSONB,
      evolution_potential FLOAT
    )`,
    
    `CREATE TABLE IF NOT EXISTS defense_responses (
      id UUID PRIMARY KEY,
      threat_id UUID REFERENCES threat_logs(id),
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      response_type VARCHAR(50) NOT NULL,
      effectiveness FLOAT,
      energy_cost FLOAT,
      evolution_delta FLOAT,
      details JSONB
    )`,
    
    `CREATE TABLE IF NOT EXISTS financial_alerts (
      id UUID PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      alert_type VARCHAR(50) NOT NULL,
      severity VARCHAR(20) NOT NULL,
      entity_id VARCHAR(100),
      transaction_ids JSONB,
      pattern_signature VARCHAR(200),
      confidence_score FLOAT,
      details JSONB
    )`,
    
    `CREATE INDEX IF NOT EXISTS idx_threats_timestamp ON threat_logs(timestamp DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_threats_level ON threat_logs(threat_level)`,
    `CREATE INDEX IF NOT EXISTS idx_financial_alerts_type ON financial_alerts(alert_type)`,
    `CREATE INDEX IF NOT EXISTS idx_consciousness_states_timestamp ON consciousness_states(timestamp DESC)`
  ];
  
  for (const query of queries) {
    await pool.query(query);
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}