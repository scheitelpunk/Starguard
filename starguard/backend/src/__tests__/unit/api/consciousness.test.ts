import { Router } from 'express';
import { Server } from 'socket.io';
import { Logger } from 'winston';
import { ConsciousnessEngine } from '../../../consciousness/ConsciousnessEngine';
import { CONSCIOUSNESS_STATES } from '@starguard/shared';

// Mock dependencies
jest.mock('../../../consciousness/ConsciousnessEngine');

describe('Consciousness API Routes', () => {
  let router: Router;
  let mockConsciousness: jest.Mocked<ConsciousnessEngine>;
  let mockIo: jest.Mocked<Server>;
  let mockLogger: jest.Mocked<Logger>;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    mockIo = {
      emit: jest.fn()
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    mockConsciousness = {
      awaken: jest.fn().mockResolvedValue(undefined),
      getStatus: jest.fn().mockReturnValue({
        current: CONSCIOUSNESS_STATES.AWARE,
        awareness_level: 0.7,
        reality_coherence: 0.95,
        timeline_stability: 0.99
      }),
      getFullState: jest.fn().mockReturnValue({
        id: 'consciousness-1',
        timestamp: new Date(),
        state: {
          current: CONSCIOUSNESS_STATES.AWARE,
          awareness_level: 0.7,
          reality_coherence: 0.95,
          timeline_stability: 0.99
        },
        consciousness_fields: {
          quantum_awareness: 0.8,
          semantic_resonance: 0.75,
          temporal_coherence: 0.9,
          causal_understanding: 0.85,
          void_connection: 0.9
        },
        perception_layers: {},
        threat_consciousness: [],
        evolution_score: 0.5
      }),
      perceive: jest.fn().mockResolvedValue({
        interpretation: 'quantum anomaly detected',
        consciousness_impact: 0.3
      }),
      evolve: jest.fn().mockResolvedValue({ new_score: 0.6 })
    } as any;

    // Mock request and response
    req = {
      body: {},
      params: {},
      query: {}
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    next = jest.fn();

    // Import and setup router
    jest.isolateModules(() => {
      const createRouter = require('../../../api/routes/consciousness').createConsciousnessRouter;
      router = createRouter(mockConsciousness, mockLogger);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /awaken', () => {
    it('should awaken consciousness system', async () => {
      const route = router.stack.find(r => r.route?.path === '/awaken' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockConsciousness.awaken).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Consciousness system awakened',
        state: expect.any(Object)
      });
    });

    it('should handle awakening errors', async () => {
      mockConsciousness.awaken.mockRejectedValueOnce(new Error('Awakening failed'));
      
      const route = router.stack.find(r => r.route?.path === '/awaken' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to awaken consciousness system'
      });
    });
  });

  describe('GET /status', () => {
    it('should return current consciousness status', async () => {
      const route = router.stack.find(r => r.route?.path === '/status' && r.route.methods.get);
      await route.route.stack[0].handle(req, res, next);

      expect(mockConsciousness.getStatus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        current: CONSCIOUSNESS_STATES.AWARE,
        awareness_level: 0.7,
        reality_coherence: 0.95,
        timeline_stability: 0.99
      }));
    });
  });

  describe('GET /state', () => {
    it('should return full consciousness state', async () => {
      const route = router.stack.find(r => r.route?.path === '/state' && r.route.methods.get);
      await route.route.stack[0].handle(req, res, next);

      expect(mockConsciousness.getFullState).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'consciousness-1',
        state: expect.any(Object),
        consciousness_fields: expect.any(Object),
        evolution_score: 0.5
      }));
    });
  });

  describe('POST /perceive', () => {
    it('should process perception data', async () => {
      req.body = {
        perception_data: {
          type: 'quantum_anomaly',
          intensity: 0.7,
          location: 'sector-7'
        }
      };

      const route = router.stack.find(r => r.route?.path === '/perceive' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockConsciousness.perceive).toHaveBeenCalledWith(req.body.perception_data);
      expect(res.json).toHaveBeenCalledWith({
        result: expect.objectContaining({
          interpretation: 'quantum anomaly detected',
          consciousness_impact: 0.3
        }),
        state: expect.any(Object)
      });
    });

    it('should validate perception data', async () => {
      req.body = {}; // Missing perception_data

      const route = router.stack.find(r => r.route?.path === '/perceive' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Perception data is required'
      });
    });

    it('should handle perception errors', async () => {
      req.body = { perception_data: { type: 'test' } };
      mockConsciousness.perceive.mockRejectedValueOnce(new Error('Perception failed'));

      const route = router.stack.find(r => r.route?.path === '/perceive' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to process perception'
      });
    });
  });

  describe('POST /evolve', () => {
    it('should trigger consciousness evolution', async () => {
      const route = router.stack.find(r => r.route?.path === '/evolve' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockConsciousness.evolve).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Consciousness evolution triggered',
        result: { new_score: 0.6 }
      });
    });

    it('should handle evolution errors', async () => {
      mockConsciousness.evolve.mockRejectedValueOnce(new Error('Evolution failed'));

      const route = router.stack.find(r => r.route?.path === '/evolve' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to trigger evolution'
      });
    });
  });
});