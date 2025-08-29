/**
 * Integration Test Setup
 * Configures environment for integration testing
 */

import { jest } from '@jest/globals';

// Extend timeout for integration tests
jest.setTimeout(60000);

// Mock Redis for integration tests
const mockRedis = () => ({
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  publish: jest.fn().mockResolvedValue(1),
  subscribe: jest.fn().mockResolvedValue(true),
  unsubscribe: jest.fn().mockResolvedValue(true),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
  quit: jest.fn().mockResolvedValue('OK'),
  ping: jest.fn().mockResolvedValue('PONG'),
  flushall: jest.fn().mockResolvedValue('OK'),
  keys: jest.fn().mockResolvedValue([]),
  expire: jest.fn().mockResolvedValue(1),
  ttl: jest.fn().mockResolvedValue(-1)
});

// Mock WebSocket for integration tests
const mockWebSocket = () => ({
  on: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1, // OPEN
  ping: jest.fn(),
  pong: jest.fn(),
  terminate: jest.fn()
});

// Global integration test utilities
declare global {
  var integrationUtils: {
    createMockRedisClient: () => any;
    createMockWebSocket: () => any;
    setupTestServer: () => Promise<any>;
    teardownTestServer: (server: any) => Promise<void>;
    waitForAsyncOperations: (timeout?: number) => Promise<void>;
    simulateNetworkDelay: (ms: number) => Promise<void>;
    createTestDatabase: () => Promise<any>;
    cleanupTestDatabase: (db: any) => Promise<void>;
  };
}

global.integrationUtils = {
  createMockRedisClient: mockRedis,
  
  createMockWebSocket: mockWebSocket,
  
  setupTestServer: async () => {
    // Mock server setup
    return {
      listen: jest.fn((port, callback) => {
        if (callback) callback();
      }),
      close: jest.fn((callback) => {
        if (callback) callback();
      }),
      address: jest.fn(() => ({ port: 3000 }))
    };
  },
  
  teardownTestServer: async (server) => {
    if (server && server.close) {
      await new Promise(resolve => server.close(resolve));
    }
  },
  
  waitForAsyncOperations: async (timeout = 1000) => {
    await new Promise(resolve => setTimeout(resolve, timeout));
  },
  
  simulateNetworkDelay: async (ms) => {
    await new Promise(resolve => setTimeout(resolve, ms));
  },
  
  createTestDatabase: async () => {
    return {
      run: jest.fn().mockResolvedValue({ lastID: 1, changes: 1 }),
      get: jest.fn().mockResolvedValue(null),
      all: jest.fn().mockResolvedValue([]),
      close: jest.fn().mockResolvedValue(true),
      exec: jest.fn().mockResolvedValue([]),
      prepare: jest.fn().mockReturnValue({
        run: jest.fn().mockResolvedValue({ lastID: 1 }),
        get: jest.fn().mockResolvedValue(null),
        all: jest.fn().mockResolvedValue([]),
        finalize: jest.fn()
      })
    };
  },
  
  cleanupTestDatabase: async (db) => {
    if (db && db.close) {
      await db.close();
    }
  }
};

export {};