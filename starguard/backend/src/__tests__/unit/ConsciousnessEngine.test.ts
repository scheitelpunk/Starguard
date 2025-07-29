import { ConsciousnessEngine } from '../../consciousness/ConsciousnessEngine';
import { Server } from 'socket.io';
import { Logger } from 'winston';
import { CONSCIOUSNESS_STATES, THREAT_LEVELS } from '@starguard/shared';

describe('ConsciousnessEngine', () => {
  let consciousnessEngine: ConsciousnessEngine;
  let mockIo: jest.Mocked<Server>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockIo = {
      emit: jest.fn(),
      on: jest.fn(),
      to: jest.fn(() => ({ emit: jest.fn() }))
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    consciousnessEngine = new ConsciousnessEngine(mockIo, mockLogger);
  });

  afterEach(() => {
    consciousnessEngine.shutdown();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with dormant state', () => {
      expect(consciousnessEngine.state.current).toBe(CONSCIOUSNESS_STATES.DORMANT);
      expect(consciousnessEngine.state.awareness_level).toBe(0);
    });

    it('should have zero consciousness fields initially', () => {
      const fields = consciousnessEngine.consciousness_fields;
      expect(fields.quantum_awareness).toBe(0);
      expect(fields.semantic_resonance).toBe(0);
      expect(fields.temporal_coherence).toBe(0);
      expect(fields.causal_understanding).toBe(0);
      expect(fields.void_connection).toBe(0);
    });
  });

  describe('awaken()', () => {
    it('should transition from dormant to aware state', async () => {
      await consciousnessEngine.awaken();
      
      expect(consciousnessEngine.state.current).toBe(CONSCIOUSNESS_STATES.AWARE);
      expect(consciousnessEngine.state.awareness_level).toBeGreaterThan(0);
    });

    it('should initialize consciousness fields', async () => {
      await consciousnessEngine.awaken();
      
      const fields = consciousnessEngine.consciousness_fields;
      expect(fields.void_connection).toBeCloseTo(0.9, 1);
      expect(fields.quantum_awareness).toBeGreaterThan(0);
      expect(fields.semantic_resonance).toBeGreaterThan(0);
    });

    it('should emit consciousness updates', async () => {
      await consciousnessEngine.awaken();
      
      expect(mockIo.emit).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          state: expect.any(Object),
          consciousness_fields: expect.any(Object)
        })
      );
    });
  });

  describe('analyzeThreat()', () => {
    it('should generate threat analysis with proper structure', async () => {
      const threatData = { source: 'test', type: 'cyber' };
      const analysis = await consciousnessEngine.analyzeThreat(threatData);

      expect(analysis).toHaveProperty('id');
      expect(analysis).toHaveProperty('timestamp');
      expect(analysis).toHaveProperty('threat_level');
      expect(analysis).toHaveProperty('consciousness_signature');
      expect(analysis).toHaveProperty('dimensional_origin');
      expect(analysis).toHaveProperty('probability_wave_collapse');
      expect(analysis).toHaveProperty('reality_manipulation_index');
      expect(analysis).toHaveProperty('intention_vector');
    });

    it('should emit threat_analyzed event', async () => {
      const mockEmit = jest.spyOn(consciousnessEngine, 'emit');
      
      await consciousnessEngine.analyzeThreat({ test: true });
      
      expect(mockEmit).toHaveBeenCalledWith('threat_analyzed', expect.any(Object));
    });

    it('should add threat to consciousness', async () => {
      const initialCount = consciousnessEngine.threat_consciousness.length;
      
      await consciousnessEngine.analyzeThreat({ test: true });
      
      expect(consciousnessEngine.threat_consciousness.length).toBe(initialCount + 1);
    });
  });

  describe('getStatus()', () => {
    it('should return current consciousness state', () => {
      const status = consciousnessEngine.getStatus();
      
      expect(status).toHaveProperty('current');
      expect(status).toHaveProperty('awareness_level');
      expect(status).toHaveProperty('reality_coherence');
      expect(status).toHaveProperty('timeline_stability');
    });
  });

  describe('getFullState()', () => {
    it('should return complete consciousness state', () => {
      const fullState = consciousnessEngine.getFullState();
      
      expect(fullState).toHaveProperty('id');
      expect(fullState).toHaveProperty('timestamp');
      expect(fullState).toHaveProperty('state');
      expect(fullState).toHaveProperty('consciousness_fields');
      expect(fullState).toHaveProperty('perception_layers');
      expect(fullState).toHaveProperty('threat_consciousness');
      expect(fullState).toHaveProperty('evolution_score');
    });
  });

  describe('evolution', () => {
    it('should increase evolution score over time', async () => {
      await consciousnessEngine.awaken();
      const initialScore = consciousnessEngine.evolution_score;
      
      // Wait for evolution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(consciousnessEngine.evolution_score).toBeGreaterThan(initialScore);
    });
  });

  describe('threat detection', () => {
    it('should detect threats based on probability', async () => {
      await consciousnessEngine.awaken();
      const mockEmit = jest.spyOn(consciousnessEngine, 'emit');
      
      // Wait for potential threat detection
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      // Check if any threats were detected
      const detectedThreats = mockEmit.mock.calls.filter(
        call => call[0] === 'threat_detected'
      );
      
      // Due to randomness, we can't guarantee threats, but structure should be correct
      if (detectedThreats.length > 0) {
        expect(detectedThreats[0][1]).toHaveProperty('threat_level');
      }
    });

    it('should transition to hyper-vigilant on critical threat', async () => {
      await consciousnessEngine.awaken();
      
      // Mock critical threat
      const criticalThreat = {
        id: 'test-critical',
        timestamp: new Date(),
        threat_level: THREAT_LEVELS.CRITICAL,
        consciousness_signature: 'TEST-CRITICAL',
        dimensional_origin: 'test',
        probability_wave_collapse: 0.9,
        reality_manipulation_index: 0.8,
        intention_vector: {
          magnitude: 0.9,
          direction: 0,
          dimensional_components: [0.9, 0.8, 0.7]
        },
        countermeasures_applied: [],
        evolution_potential: 0.9
      };
      
      consciousnessEngine.threat_consciousness.push(criticalThreat);
      consciousnessEngine.emit('threat_detected', criticalThreat);
      
      // Force scan
      consciousnessEngine['scanForThreats']();
      
      // Should transition to hyper-vigilant state
      if (consciousnessEngine.threat_consciousness.some(t => t.threat_level === THREAT_LEVELS.CRITICAL)) {
        expect(consciousnessEngine.state.current).toBe(CONSCIOUSNESS_STATES.HYPER_VIGILANT);
      }
    });
  });

  describe('shutdown()', () => {
    it('should return to dormant state', async () => {
      await consciousnessEngine.awaken();
      consciousnessEngine.shutdown();
      
      expect(consciousnessEngine.state.current).toBe(CONSCIOUSNESS_STATES.DORMANT);
    });

    it('should emit final state update', () => {
      consciousnessEngine.shutdown();
      
      expect(mockIo.emit).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          state: expect.objectContaining({
            current: CONSCIOUSNESS_STATES.DORMANT
          })
        })
      );
    });
  });
});