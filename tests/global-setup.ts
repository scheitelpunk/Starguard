/**
 * Global Test Setup for STARGUARD2
 * 
 * Sets up test environment, mocks, and shared resources
 * before running the test suite.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Global test setup function
export default async function globalSetup(): Promise<void> {
  console.log('\n🚀 Starting STARGUARD2 Test Suite Global Setup...');
  
  try {
    // 1. Environment validation
    await validateTestEnvironment();
    
    // 2. Create test directories
    await createTestDirectories();
    
    // 3. Start test services
    await startTestServices();
    
    // 4. Initialize test data
    await initializeTestData();
    
    console.log('✅ Global setup completed successfully\n');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    process.exit(1);
  }
}

/**
 * Validate test environment requirements
 */
async function validateTestEnvironment(): Promise<void> {
  console.log('📋 Validating test environment...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
  }
  
  // Check required environment variables
  const requiredEnvVars = {
    NODE_ENV: 'test',
    JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
    REDIS_URL: 'redis://localhost:6379/15',
    DATABASE_URL: 'redis://localhost:6379/15'
  };
  
  Object.entries(requiredEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      console.log(`⚠️  Set default ${key}=${defaultValue}`);
    }
  });
  
  // Check Redis availability (optional for CI/CD)
  if (process.env.CI !== 'true') {
    try {
      execSync('redis-cli ping', { stdio: 'pipe' });
      console.log('✅ Redis connection verified');
    } catch (error) {
      console.warn('⚠️  Redis not available - using mocks for tests');
      process.env.USE_REDIS_MOCK = 'true';
    }
  }
  
  // Validate test database isolation
  if (process.env.REDIS_URL && !process.env.REDIS_URL.includes('/15')) {
    console.warn('⚠️  Test database should use Redis DB 15 for isolation');
  }
}

/**
 * Create necessary test directories
 */
async function createTestDirectories(): Promise<void> {
  console.log('📁 Creating test directories...');
  
  const testDirs = [
    'test-results',
    'coverage',
    'logs/test',
    'tmp/test',
    'tests/fixtures',
    'tests/snapshots'
  ];
  
  testDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📂 Created ${dir}`);
    }
  });
}

/**
 * Start test services if needed
 */
async function startTestServices(): Promise<void> {
  console.log('🔧 Starting test services...');
  
  // Start Redis for tests if not using mocks
  if (process.env.USE_REDIS_MOCK !== 'true' && process.env.CI !== 'true') {
    try {
      // Check if Redis is already running
      execSync('redis-cli ping', { stdio: 'pipe' });
      console.log('✅ Redis already running');
    } catch (error) {
      console.log('🔄 Starting Redis for tests...');
      try {
        // Start Redis in background for tests
        execSync('redis-server --daemonize yes --port 6379', { stdio: 'pipe' });
        
        // Wait for Redis to start
        let retries = 10;
        while (retries > 0) {
          try {
            execSync('redis-cli ping', { stdio: 'pipe' });
            console.log('✅ Redis started successfully');
            break;
          } catch {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (retries === 0) {
          throw new Error('Redis failed to start');
        }
      } catch (error) {
        console.warn('⚠️  Could not start Redis, using mocks');
        process.env.USE_REDIS_MOCK = 'true';
      }
    }
  }
  
  // Set up test database
  if (process.env.USE_REDIS_MOCK !== 'true') {
    try {
      // Clear test database
      execSync('redis-cli -n 15 FLUSHDB', { stdio: 'pipe' });
      console.log('🗑️  Cleared test database');
    } catch (error) {
      console.warn('⚠️  Could not clear test database');
    }
  }
}

/**
 * Initialize test data and fixtures
 */
async function initializeTestData(): Promise<void> {
  console.log('📊 Initializing test data...');
  
  // Create test configuration files
  const testConfigPath = path.join(process.cwd(), 'tests/fixtures/test-config.json');
  const testConfig = {
    api: {
      baseUrl: 'http://localhost:3001',
      timeout: 30000,
      retries: 3
    },
    database: {
      url: process.env.DATABASE_URL,
      pool: {
        min: 1,
        max: 5
      }
    },
    security: {
      jwtSecret: process.env.JWT_SECRET,
      bcryptRounds: 1 // Faster for tests
    },
    consciousness: {
      updateInterval: 100, // Faster for tests
      consensusThreshold: 0.6,
      threatThreshold: 0.5
    },
    quantum: {
      dimensions: 10,
      particles: 50,
      evolutionRate: 0.1
    }
  };
  
  fs.writeFileSync(testConfigPath, JSON.stringify(testConfig, null, 2));
  console.log('📝 Created test configuration');
  
  // Create test fixtures
  const fixturesPath = path.join(process.cwd(), 'tests/fixtures');
  
  // Sample threat data
  const threatFixtures = {
    networkThreats: [
      {
        id: 'threat-001',
        type: 'DDoS',
        severity: 'high',
        source: '192.168.1.100',
        timestamp: Date.now(),
        metadata: {
          requestRate: 1000,
          pattern: 'burst',
          userAgent: 'malicious-bot'
        }
      },
      {
        id: 'threat-002',
        type: 'SQL Injection',
        severity: 'critical',
        source: '10.0.0.50',
        timestamp: Date.now() - 1000,
        metadata: {
          payload: "'; DROP TABLE users; --",
          endpoint: '/api/users/search'
        }
      }
    ],
    normalTraffic: [
      {
        id: 'traffic-001',
        type: 'HTTP GET',
        source: '192.168.1.10',
        timestamp: Date.now(),
        metadata: {
          path: '/api/health',
          responseTime: 45,
          statusCode: 200
        }
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(fixturesPath, 'threat-data.json'),
    JSON.stringify(threatFixtures, null, 2)
  );
  
  // Sample consciousness states
  const consciousnessFixtures = {
    states: [
      {
        id: 'state-001',
        level: 0.8,
        awareness: 0.75,
        threatLevel: 0.3,
        timestamp: Date.now(),
        patterns: ['network_anomaly', 'timing_variance']
      },
      {
        id: 'state-002',
        level: 0.9,
        awareness: 0.85,
        threatLevel: 0.7,
        timestamp: Date.now() - 5000,
        patterns: ['sql_injection_attempt', 'brute_force_login']
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(fixturesPath, 'consciousness-data.json'),
    JSON.stringify(consciousnessFixtures, null, 2)
  );
  
  console.log('🎭 Created test fixtures');
  
  // Set global test timeout
  if (global.setTimeout) {
    global.setTimeout(() => {
      console.error('❌ Global test timeout reached (5 minutes)');
      process.exit(1);
    }, 300000); // 5 minutes
  }
}

// Utility functions for tests
class TestEnvironment {
  static isCI(): boolean {
    return process.env.CI === 'true';
  }
  
  static isDockerAvailable(): boolean {
    try {
      execSync('docker --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
  
  static isRedisAvailable(): boolean {
    if (process.env.USE_REDIS_MOCK === 'true') return false;
    
    try {
      execSync('redis-cli ping', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
  
  static getTestConfig(): any {
    const configPath = path.join(process.cwd(), 'tests/fixtures/test-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {};
  }
}

// Make TestEnvironment available globally
(global as any).TestEnvironment = TestEnvironment;

// Export for direct usage
export { TestEnvironment };
