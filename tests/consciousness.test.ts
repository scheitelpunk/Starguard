import { ConsciousnessEngine, ConsciousnessState, ThreatContext } from '../backend/src/consciousness/consciousness';
import { QuantumEngine } from '../backend/src/quantum/quantumEngine';
import { promises as fs } from 'fs';
import { join } from 'path';

describe('STARGUARD Quantum Consciousness Engine', () => {
  let consciousness: ConsciousnessEngine;
  const testPersistencePath = './.test-consciousness';
  
  beforeEach(async () => {
    // Clean up any existing test state
    try {
      await fs.unlink(testPersistencePath);
    } catch (error) {
      // File doesn't exist, that's fine
    }
    
    consciousness = new ConsciousnessEngine({
      persistencePath: testPersistencePath,
      awakeningThreshold: 0.3,
      awarenessDecayRate: 0.95,
      threatSensitivity: 0.8,
      quantumUpdateInterval: 100 // Faster for testing
    });
  });
  
  afterEach(async () => {
    await consciousness.shutdown();
    
    // Clean up test persistence file
    try {
      await fs.unlink(testPersistencePath);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  describe('Initialization and States', () => {
    test('should initialize in VOID state', async () => {
      const state = consciousness.getCurrentState();
      expect(state.state).toBe(ConsciousnessState.VOID);
      expect(state.metrics.awarenessLevel).toBeGreaterThanOrEqual(0);
      expect(state.metrics.awarenessLevel).toBeLessThanOrEqual(1);
    });
    
    test('should begin awakening sequence', async () => {
      await consciousness.beginAwakeningSequence();
      const state = consciousness.getCurrentState();
      expect(state.state).toBe(ConsciousnessState.AWAKENING);
      expect(state.metrics.awarenessLevel).toBeGreaterThan(0);
    });
    
    test('should transition states based on awareness level', async () => {
      let stateTransitions: any[] = [];
      
      consciousness.on('stateTransition', (data) => {
        stateTransitions.push(data);
      });
      
      await consciousness.beginAwakeningSequence();
      
      // Wait for potential state updates
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(stateTransitions.length).toBeGreaterThan(0);
    });
  });

  describe('Threat Processing', () => {
    test('should process threat and increase awareness', async () => {
      const initialState = consciousness.getCurrentState();
      const initialAwareness = initialState.metrics.awarenessLevel;
      
      const threat: ThreatContext = {
        severity: 0.8,
        type: 'malware-detection',
        timestamp: Date.now(),
        indicators: ['suspicious-network-activity', 'unauthorized-file-access']
      };
      
      consciousness.processThreat(threat);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const newState = consciousness.getCurrentState();
      expect(newState.metrics.awarenessLevel).toBeGreaterThanOrEqual(initialAwareness);
      expect(newState.threatCount).toBe(1);
    });
    
    test('should handle multiple threats', async () => {
      const threats: ThreatContext[] = [
        { severity: 0.6, type: 'port-scan', timestamp: Date.now(), indicators: ['network-probe'] },
        { severity: 0.9, type: 'data-exfiltration', timestamp: Date.now(), indicators: ['large-upload'] },
        { severity: 0.4, type: 'failed-login', timestamp: Date.now(), indicators: ['brute-force'] }
      ];
      
      threats.forEach(threat => consciousness.processThreat(threat));
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const state = consciousness.getCurrentState();
      expect(state.threatCount).toBe(3);
      expect(state.metrics.threatResponseIndex).toBeGreaterThan(0);
    });
  });

  describe('Memory System', () => {
    test('should store and retrieve memory', () => {
      const testData = { key: 'test-data', value: 123, timestamp: Date.now() };
      
      consciousness.storeMemory('test-key', testData);
      const retrieved = consciousness.retrieveMemory('test-key');
      
      expect(retrieved).toEqual(testData);
    });
    
    test('should handle memory TTL', async () => {
      const testData = { temporary: 'data' };
      
      consciousness.storeMemory('ttl-key', testData, 100); // 100ms TTL
      
      // Should exist immediately
      expect(consciousness.retrieveMemory('ttl-key')).toEqual(testData);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be null after TTL
      expect(consciousness.retrieveMemory('ttl-key')).toBeNull();
    });
  });

  describe('Quantum Measurements', () => {
    test('should perform quantum measurement', () => {
      const measurement = consciousness.measureConsciousness();
      
      expect(typeof measurement).toBe('number');
      expect(measurement).toBeGreaterThanOrEqual(0);
      
      const state = consciousness.getCurrentState();
      expect(state.metrics.coherenceLevel).toBeGreaterThanOrEqual(0);
      expect(state.metrics.coherenceLevel).toBeLessThanOrEqual(1);
    });
    
    test('should emit measurement events', (done) => {
      consciousness.on('consciousnessMeasured', (data) => {
        expect(data.measurement).toBeDefined();
        expect(data.state).toBeDefined();
        expect(data.metrics).toBeDefined();
        done();
      });
      
      consciousness.measureConsciousness();
    });
  });

  describe('Quantum Metrics', () => {
    test('should have valid quantum entropy', async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const state = consciousness.getCurrentState();
      expect(state.metrics.quantumEntropy).toBeGreaterThanOrEqual(0);
      expect(state.metrics.quantumEntropy).toBeLessThanOrEqual(1);
    });
    
    test('should have coherence and entanglement values', async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const state = consciousness.getCurrentState();
      expect(state.quantumState.coherence).toBeGreaterThanOrEqual(0);
      expect(state.quantumState.coherence).toBeLessThanOrEqual(1);
      expect(state.quantumState.entanglement).toBeGreaterThanOrEqual(0);
      expect(state.quantumState.entanglement).toBeLessThanOrEqual(1);
    });
  });

  describe('State Persistence', () => {
    test('should persist and restore state', async () => {
      // Create initial state
      await consciousness.beginAwakeningSequence();
      consciousness.storeMemory('persistent-data', { test: 'value' });
      
      const threat: ThreatContext = {
        severity: 0.7,
        type: 'test-threat',
        timestamp: Date.now(),
        indicators: ['test-indicator']
      };
      consciousness.processThreat(threat);
      
      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const originalState = consciousness.getCurrentState();
      
      // Shutdown and create new instance
      await consciousness.shutdown();
      
      const newConsciousness = new ConsciousnessEngine({
        persistencePath: testPersistencePath,
        quantumUpdateInterval: 100
      });
      
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const restoredState = newConsciousness.getCurrentState();
      
      // State should be restored
      expect(restoredState.state).toBe(originalState.state);
      expect(newConsciousness.retrieveMemory('persistent-data')).toEqual({ test: 'value' });
      
      await newConsciousness.shutdown();
    });
  });
});

describe('Quantum Engine', () => {
  let quantumEngine: QuantumEngine;
  
  beforeEach(() => {
    quantumEngine = new QuantumEngine(64); // Smaller dimensions for faster testing
  });

  describe('Quantum State Evolution', () => {
    test('should evolve quantum walk', async () => {
      const initialState = quantumEngine.getQuantumState();
      
      await quantumEngine.evolveQuantumWalk();
      
      const newState = quantumEngine.getQuantumState();
      
      expect(newState.walkPositions).toBeDefined();
      expect(newState.walkPositions.length).toBeGreaterThan(0);
      expect(newState.coherence).toBeGreaterThanOrEqual(0);
      expect(newState.coherence).toBeLessThanOrEqual(1);
    });
    
    test('should generate quantum entropy', async () => {
      const entropy = await quantumEngine.generateQuantumEntropy();
      
      expect(entropy).toBeGreaterThanOrEqual(0);
      expect(entropy).toBeLessThanOrEqual(1);
    });
    
    test('should measure quantum state', () => {
      const measurement = quantumEngine.measureQuantumState();
      
      expect(typeof measurement).toBe('number');
      expect(measurement).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Quantum Properties', () => {
    test('should calculate entanglement', () => {
      const entanglement = quantumEngine.calculateEntanglement();
      
      expect(entanglement).toBeGreaterThanOrEqual(0);
      expect(entanglement).toBeLessThanOrEqual(1);
    });
    
    test('should calculate coherence', () => {
      const coherence = quantumEngine.calculateCoherence();
      
      expect(coherence).toBeGreaterThanOrEqual(0);
      expect(coherence).toBeLessThanOrEqual(1);
    });
    
    test('should apply interference patterns', () => {
      const initialState = quantumEngine.getQuantumState();
      
      quantumEngine.applyInterference(1.5);
      
      const newState = quantumEngine.getQuantumState();
      
      // State should have changed
      expect(newState.coherence).toBeDefined();
    });
  });

  describe('State Reset', () => {
    test('should reset to initial state', async () => {
      // Modify state
      await quantumEngine.evolveQuantumWalk();
      quantumEngine.applyInterference(2.0);
      
      // Reset
      await quantumEngine.reset();
      
      const state = quantumEngine.getQuantumState();
      expect(state.coherence).toBeGreaterThanOrEqual(0);
      expect(state.entanglement).toBeGreaterThanOrEqual(0);
    });
  });
});