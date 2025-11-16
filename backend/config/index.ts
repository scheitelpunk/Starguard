// STARGUARD Configuration Management
// Production environment configuration with security

import { readFileSync } from 'fs';
import { z } from 'zod';
import { ServerConfig, DatabaseConfig } from '../types/index.js';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (error) {
    console.warn('dotenv not available, using environment variables only');
  }
}

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('8080'),
  API_KEY: z.string().min(16).optional(),
  JWT_SECRET: z.string().min(32).optional(),
  DB_ENCRYPTION_KEY: z.string().min(32).optional(),
  DB_PATH: z.string().optional(),
  DB_ENCRYPTION: z.enum(['true', 'false']).default('false'),
  QUANTUM_ENABLED: z.enum(['true', 'false']).default('false'),
  AI_MODEL_PATH: z.string().optional(),
});

// Production environment schema (stricter requirements)
const prodEnvSchema = envSchema.extend({
  API_KEY: z.string().min(32, 'API_KEY must be at least 32 characters in production'),
  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be at least 64 characters in production'),
  DB_ENCRYPTION_KEY: z.string().min(32, 'DB_ENCRYPTION_KEY required in production'),
  DB_ENCRYPTION: z.literal('true', {
    errorMap: () => ({ message: 'Database encryption must be enabled in production' })
  }),
});

// Validate environment variables
function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const schema = isProd ? prodEnvSchema : envSchema;

  try {
    return schema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Validate on startup
const validatedEnv = validateEnv();

// Default configuration
const DEFAULT_CONFIG: ServerConfig = {
  host: '0.0.0.0',
  port: 8080,
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://starguard.ai', 'https://console.starguard.ai']
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  },
  websocket: {
    max_connections: 1000,
    heartbeat_interval: 30000, // 30 seconds
    timeout: 60000 // 1 minute
  },
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    pretty: process.env.NODE_ENV !== 'production'
  },
  memory: {
    max_heap: 6144, // 6GB for 8GB system (leave 2GB for OS)
    gc_interval: 60000 // 1 minute
  },
  quantum: {
    enabled: process.env.QUANTUM_ENABLED === 'true',
    coherence_threshold: 0.95,
    max_qubits: 64
  },
  ai: {
    model_path: process.env.AI_MODEL_PATH || './models/starguard-v1.onnx',
    batch_size: 32,
    inference_timeout: 5000 // 5 seconds
  }
};

const DEFAULT_DB_CONFIG: DatabaseConfig = {
  type: 'sqlite',
  database: process.env.DB_PATH || './database/starguard.db',
  memory_limit: 512, // 512MB
  backup_interval: 15, // 15 minutes
  encryption: process.env.DB_ENCRYPTION === 'true'
};

// Configuration override from files
function loadConfigFile(path: string): Partial<ServerConfig> {
  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return {};
  }
}

// Environment-specific overrides (using validated env)
const ENV_OVERRIDES: Partial<ServerConfig> = {
  host: validatedEnv.HOST,
  port: validatedEnv.PORT,
};

// Load configuration with priority: ENV > File > Default
const fileConfig = loadConfigFile('./config/starguard.json');

export const config: ServerConfig = {
  ...DEFAULT_CONFIG,
  ...fileConfig,
  ...ENV_OVERRIDES
};

export const dbConfig: DatabaseConfig = {
  ...DEFAULT_DB_CONFIG,
  database: validatedEnv.DB_PATH || DEFAULT_DB_CONFIG.database,
  encryption: validatedEnv.DB_ENCRYPTION === 'true'
};

// Security validation
if (process.env.NODE_ENV === 'production') {
  // Validate required environment variables
  const required = ['API_KEY', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
  
  // Ensure secure configuration in production
  if (config.cors.origin.includes('localhost')) {
    console.warn('WARNING: localhost origins allowed in production');
  }
}

// Memory management for 8GB systems
if (process.platform === 'linux') {
  // Optimize for container environments
  process.env.NODE_OPTIONS = `--max-old-space-size=${config.memory.max_heap}`;
}

// Export environment helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

export const secrets = {
  apiKey: validatedEnv.API_KEY || 'dev-key-not-secure',
  jwtSecret: validatedEnv.JWT_SECRET || 'dev-jwt-secret',
  dbEncryptionKey: validatedEnv.DB_ENCRYPTION_KEY || 'dev-encryption-key'
};

// Runtime configuration logging
if (!isTest) {
  console.log('STARGUARD Configuration:');
  console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- Host: ${config.host}:${config.port}`);
  console.log(`- Database: ${dbConfig.database}`);
  console.log(`- Memory Limit: ${config.memory.max_heap}MB`);
  console.log(`- Quantum Enabled: ${config.quantum.enabled}`);
  console.log(`- CORS Origins: ${JSON.stringify(config.cors.origin)}`);
}
