/**
 * Test Utilities and Helpers
 * Provides common mocks, factories, and utilities for testing
 */

import { EventEmitter } from 'events';

/**
 * Mock logger for tests
 */
export class MockLogger {
  constructor() {
    this.logs = {
      info: [],
      warn: [],
      error: [],
      debug: []
    };
  }

  info(...args) {
    this.logs.info.push(args);
  }

  warn(...args) {
    this.logs.warn.push(args);
  }

  error(...args) {
    this.logs.error.push(args);
  }

  debug(...args) {
    this.logs.debug.push(args);
  }

  clear() {
    this.logs = { info: [], warn: [], error: [], debug: [] };
  }

  getLogs(level) {
    return this.logs[level] || [];
  }
}

/**
 * Mock Redis client
 */
export class MockRedis extends EventEmitter {
  constructor() {
    super();
    this.data = new Map();
    this.subscribers = new Map();
    this.connected = false;
  }

  async connect() {
    this.connected = true;
    return Promise.resolve();
  }

  async disconnect() {
    this.connected = false;
    return Promise.resolve();
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async set(key, value, ...args) {
    this.data.set(key, value);
    return 'OK';
  }

  async setex(key, seconds, value) {
    this.data.set(key, value);
    setTimeout(() => this.data.delete(key), seconds * 1000);
    return 'OK';
  }

  async del(...keys) {
    let count = 0;
    keys.forEach(key => {
      if (this.data.delete(key)) count++;
    });
    return count;
  }

  async publish(channel, message) {
    const subscribers = this.subscribers.get(channel) || [];
    subscribers.forEach(callback => callback(channel, message));
    return subscribers.length;
  }

  async subscribe(...channels) {
    channels.forEach(channel => {
      if (!this.subscribers.has(channel)) {
        this.subscribers.set(channel, []);
      }
    });
    return Promise.resolve();
  }

  on(event, callback) {
    if (event === 'message') {
      // Store message handler for all subscribed channels
      this.messageHandler = callback;
      this.subscribers.forEach((callbacks, channel) => {
        callbacks.push(callback);
      });
    }
    return super.on(event, callback);
  }

  clear() {
    this.data.clear();
    this.subscribers.clear();
  }
}

/**
 * Mock SQLite database
 */
export class MockDatabase {
  constructor() {
    this.tables = new Map();
  }

  async query(sql, params = []) {
    // Simple mock - just return empty results
    return [];
  }

  async run(sql, params = []) {
    return { changes: 1, lastID: Date.now() };
  }

  async get(sql, params = []) {
    return null;
  }

  async all(sql, params = []) {
    return [];
  }

  async close() {
    return Promise.resolve();
  }
}

/**
 * Keystroke event factory
 */
export function createKeystrokeEvent(overrides = {}) {
  return {
    key: 'a',
    eventType: 'keydown',
    timestamp: Date.now(),
    pressure: 0.5,
    sessionId: 'test-session-' + Math.random().toString(36).substr(2, 9),
    ...overrides
  };
}

/**
 * Mouse event factory
 */
export function createMouseEvent(overrides = {}) {
  return {
    x: Math.floor(Math.random() * 1920),
    y: Math.floor(Math.random() * 1080),
    timestamp: Date.now(),
    eventType: 'move',
    sessionId: 'test-session-' + Math.random().toString(36).substr(2, 9),
    ...overrides
  };
}

/**
 * Network packet factory
 */
export function createNetworkPacket(overrides = {}) {
  return {
    timestamp: Date.now(),
    sourceIP: '192.168.1.' + Math.floor(Math.random() * 255),
    destIP: '10.0.0.' + Math.floor(Math.random() * 255),
    sourcePort: 1024 + Math.floor(Math.random() * 64511),
    destPort: Math.floor(Math.random() * 65535),
    protocol: 'TCP',
    size: Math.floor(Math.random() * 1500),
    ...overrides
  };
}

/**
 * Defense gene factory
 */
export function createDefenseGene(overrides = {}) {
  return {
    id: 'gene-' + Math.random().toString(36).substr(2, 9),
    type: 'SIGNATURE',
    sequence: 'ABCD' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    strength: 0.5 + Math.random() * 0.5,
    accuracy: 0.7 + Math.random() * 0.3,
    falsePositiveRate: Math.random() * 0.1,
    generation: 0,
    parentIds: [],
    mutations: [],
    created: Date.now(),
    ...overrides
  };
}

/**
 * Defense organism factory
 */
export function createDefenseOrganism(overrides = {}) {
  const genes = overrides.genes || [
    createDefenseGene(),
    createDefenseGene({ type: 'BEHAVIOR' }),
    createDefenseGene({ type: 'NETWORK' })
  ];

  return {
    id: 'organism-' + Math.random().toString(36).substr(2, 9),
    genes,
    fitness: 0,
    performance: {
      detectionRate: 0,
      falsePositiveRate: 0,
      responseTime: 0,
      resourceUsage: 0,
      adaptabilityScore: 0,
      survivabilityScore: 0
    },
    generation: 0,
    lineage: [],
    created: Date.now(),
    lastEvaluation: 0,
    ...overrides
  };
}

/**
 * Agent state factory
 */
export function createAgentState(overrides = {}) {
  return {
    id: 'agent-' + Math.random().toString(36).substr(2, 9),
    type: 'observer',
    status: 'active',
    performance: {
      accuracy: 0.85 + Math.random() * 0.15,
      responseTime: 50 + Math.random() * 100,
      tasksCompleted: Math.floor(Math.random() * 100)
    },
    lastHeartbeat: Date.now(),
    metadata: {},
    ...overrides
  };
}

/**
 * Wait for event to be emitted
 */
export function waitForEvent(emitter, eventName, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Event ${eventName} not emitted within ${timeout}ms`));
    }, timeout);

    emitter.once(eventName, (...args) => {
      clearTimeout(timer);
      resolve(args);
    });
  });
}

/**
 * Sleep helper
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random domain names
 */
export function generateRandomDomain(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let domain = '';
  for (let i = 0; i < length; i++) {
    domain += chars[Math.floor(Math.random() * chars.length)];
  }
  return domain + '.com';
}

/**
 * Generate DGA-like domain (high entropy)
 */
export function generateDGADomain(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let domain = '';
  for (let i = 0; i < length; i++) {
    domain += chars[Math.floor(Math.random() * chars.length)];
  }
  return domain + '.xyz';
}

/**
 * Assert that a value is within a range
 */
export function assertInRange(value, min, max, message) {
  if (value < min || value > max) {
    throw new Error(message || `Expected ${value} to be between ${min} and ${max}`);
  }
}

/**
 * Assert that an array contains an element matching predicate
 */
export function assertContains(array, predicate, message) {
  if (!array.some(predicate)) {
    throw new Error(message || 'Array does not contain expected element');
  }
}

/**
 * Mock performance timer
 */
export class MockPerformance {
  now() {
    return Date.now();
  }
}

/**
 * Batch create events for testing
 */
export function createBatchKeystrokeEvents(count, sessionId) {
  const events = [];
  let timestamp = Date.now();

  for (let i = 0; i < count; i++) {
    events.push(createKeystrokeEvent({
      sessionId,
      timestamp: timestamp + i * 100,
      eventType: i % 2 === 0 ? 'keydown' : 'keyup'
    }));
  }

  return events;
}

export function createBatchMouseEvents(count, sessionId) {
  const events = [];
  let timestamp = Date.now();
  let x = 0, y = 0;

  for (let i = 0; i < count; i++) {
    x += Math.floor(Math.random() * 10 - 5);
    y += Math.floor(Math.random() * 10 - 5);

    events.push(createMouseEvent({
      sessionId,
      timestamp: timestamp + i * 50,
      x: Math.max(0, x),
      y: Math.max(0, y)
    }));
  }

  return events;
}
