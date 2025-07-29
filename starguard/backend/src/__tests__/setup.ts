// Jest setup file

// Mock Winston logger
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

// Mock Redis
jest.mock('../utils/redis', () => ({
  connectRedis: jest.fn(),
  getRedisClient: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    isOpen: true
  })),
  cacheConsciousnessState: jest.fn(),
  cacheThreatAnalysis: jest.fn(),
  getCachedThreatAnalysis: jest.fn()
}));

// Mock Database
jest.mock('../utils/database', () => ({
  connectDatabase: jest.fn(),
  getPool: jest.fn(() => ({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  })),
  closeDatabase: jest.fn()
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '4001';
process.env.FRONTEND_URL = 'http://localhost:3001';

// Global test timeout
jest.setTimeout(10000);

// Prevent unhandled promise rejections from failing tests
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});