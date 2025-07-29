import { Router } from 'express';
import { Logger } from 'winston';
import { AdaptiveImmuneSystem } from '../../../defense/AdaptiveImmuneSystem';
import { QuantumShield } from '../../../defense/QuantumShield';
import { getDatabase } from '../../../utils/database';

// Mock dependencies
jest.mock('../../../defense/AdaptiveImmuneSystem');
jest.mock('../../../defense/QuantumShield');
jest.mock('../../../utils/database');

describe('Defense API Routes', () => {
  let router: Router;
  let mockImmuneSystem: jest.Mocked<AdaptiveImmuneSystem>;
  let mockQuantumShield: jest.Mocked<QuantumShield>;
  let mockLogger: jest.Mocked<Logger>;
  let mockDb: any;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    mockImmuneSystem = {
      getImmuneStatus: jest.fn().mockReturnValue({
        health: {
          overall_health: 95,
          immune_strength: 88,
          adaptation_rate: 1.2,
          healing_factor: 1.1,
          consciousness_coherence: 0.98
        },
        active_responses: 3,
        antibody_count: 47,
        evolution_cycle: 12
      }),
      heal: jest.fn().mockResolvedValue(undefined),
      evolve: jest.fn(),
      deployDefense: jest.fn().mockResolvedValue({
        id: 'response-123',
        threat_id: 'threat-456',
        response_type: 'quarantine',
        effectiveness: 0.85,
        side_effects: ['Minor energy drain'],
        timestamp: new Date()
      }),
      quarantineThreat: jest.fn().mockResolvedValue(undefined),
      decontaminate: jest.fn().mockResolvedValue(undefined)
    } as any;

    mockQuantumShield = {
      getShieldStatus: jest.fn().mockReturnValue({
        active: true,
        strength: 85,
        layers: [
          { type: 'quantum', integrity: 90, active: true },
          { type: 'temporal', integrity: 85, active: true },
          { type: 'reality', integrity: 80, active: true },
          { type: 'consciousness', integrity: 95, active: true }
        ],
        quantum_flux: 0.05,
        entanglement: 0.85
      }),
      activate: jest.fn().mockResolvedValue(undefined),
      deactivate: jest.fn().mockResolvedValue(undefined),
      reinforceShield: jest.fn().mockResolvedValue(undefined),
      modulate: jest.fn(),
      emergencyOvercharge: jest.fn().mockResolvedValue(undefined)
    } as any;

    mockDb = {
      query: jest.fn().mockResolvedValue({
        rows: [
          { pattern_id: 'pattern-1', name: 'APT Defense', effectiveness: 0.85 },
          { pattern_id: 'pattern-2', name: 'DDoS Shield', effectiveness: 0.75 }
        ]
      })
    };

    (getDatabase as jest.Mock).mockResolvedValue(mockDb);

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
      const createRouter = require('../../../api/routes/defense').createDefenseRouter;
      router = createRouter(mockImmuneSystem, mockQuantumShield, mockLogger);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /immune/status', () => {
    it('should return immune system status', async () => {
      const route = router.stack.find(r => r.route?.path === '/immune/status' && r.route.methods.get);
      await route.route.stack[0].handle(req, res, next);

      expect(mockImmuneSystem.getImmuneStatus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        health: expect.objectContaining({
          overall_health: 95,
          immune_strength: 88
        }),
        active_responses: 3,
        antibody_count: 47
      }));
    });
  });

  describe('POST /heal', () => {
    it('should initiate healing process', async () => {
      req.body = {
        damage_report: {
          affected_systems: ['auth_module', 'data_store'],
          severity: 'medium'
        }
      };

      const route = router.stack.find(r => r.route?.path === '/heal' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockImmuneSystem.heal).toHaveBeenCalledWith(req.body.damage_report);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Healing process initiated',
        status: expect.any(Object)
      });
    });

    it('should handle healing errors', async () => {
      req.body = { damage_report: {} };
      mockImmuneSystem.heal.mockRejectedValueOnce(new Error('Healing failed'));

      const route = router.stack.find(r => r.route?.path === '/heal' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Healing process failed'
      });
    });
  });

  describe('POST /evolve', () => {
    it('should trigger immune system evolution', async () => {
      const route = router.stack.find(r => r.route?.path === '/evolve' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockImmuneSystem.evolve).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Immune system evolution triggered',
        status: expect.any(Object)
      });
    });
  });

  describe('GET /patterns', () => {
    it('should return defense patterns', async () => {
      const route = router.stack.find(r => r.route?.path === '/patterns' && r.route.methods.get);
      await route.route.stack[0].handle(req, res, next);

      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM defense_patterns ORDER BY effectiveness DESC');
      expect(res.json).toHaveBeenCalledWith([
        { pattern_id: 'pattern-1', name: 'APT Defense', effectiveness: 0.85 },
        { pattern_id: 'pattern-2', name: 'DDoS Shield', effectiveness: 0.75 }
      ]);
    });

    it('should handle database errors', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database error'));

      const route = router.stack.find(r => r.route?.path === '/patterns' && r.route.methods.get);
      await route.route.stack[0].handle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to retrieve defense patterns'
      });
    });
  });

  describe('POST /deploy', () => {
    it('should deploy defense pattern', async () => {
      req.body = {
        threat_id: 'threat-456',
        pattern: {
          id: 'pattern-1',
          threat_level: 'high',
          consciousness_signature: 'QUANTUM_THREAT_ALPHA',
          countermeasures: ['shield', 'quarantine']
        }
      };

      const route = router.stack.find(r => r.route?.path === '/deploy' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockImmuneSystem.deployDefense).toHaveBeenCalledWith('threat-456', req.body.pattern);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Defense deployed',
        response: expect.objectContaining({
          id: 'response-123',
          effectiveness: 0.85
        })
      });
    });

    it('should validate required fields', async () => {
      req.body = { threat_id: 'threat-456' }; // Missing pattern

      const route = router.stack.find(r => r.route?.path === '/deploy' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Threat ID and pattern are required'
      });
    });
  });

  describe('POST /quarantine/:threatId', () => {
    it('should quarantine threat', async () => {
      req.params = { threatId: 'threat-789' };

      const route = router.stack.find(r => r.route?.path === '/quarantine/:threatId' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockImmuneSystem.quarantineThreat).toHaveBeenCalledWith('threat-789');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Threat quarantined',
        threat_id: 'threat-789'
      });
    });
  });

  describe('POST /decontaminate', () => {
    it('should decontaminate system', async () => {
      const route = router.stack.find(r => r.route?.path === '/decontaminate' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockImmuneSystem.decontaminate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'System decontamination complete',
        status: expect.any(Object)
      });
    });
  });

  describe('GET /shield/status', () => {
    it('should return quantum shield status', async () => {
      const route = router.stack.find(r => r.route?.path === '/shield/status' && r.route.methods.get);
      await route.route.stack[0].handle(req, res, next);

      expect(mockQuantumShield.getShieldStatus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        active: true,
        strength: 85,
        layers: expect.any(Array)
      }));
    });
  });

  describe('POST /shield/activate', () => {
    it('should activate quantum shield', async () => {
      const route = router.stack.find(r => r.route?.path === '/shield/activate' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockQuantumShield.activate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Quantum shield activated',
        status: expect.any(Object)
      });
    });
  });

  describe('POST /shield/reinforce', () => {
    it('should reinforce shield based on threat level', async () => {
      req.body = { threat_level: 'critical' };

      const route = router.stack.find(r => r.route?.path === '/shield/reinforce' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockQuantumShield.reinforceShield).toHaveBeenCalledWith('critical');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Shield reinforced',
        status: expect.any(Object)
      });
    });

    it('should validate threat level', async () => {
      req.body = {}; // Missing threat_level

      const route = router.stack.find(r => r.route?.path === '/shield/reinforce' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Threat level is required'
      });
    });
  });

  describe('POST /shield/modulate', () => {
    it('should modulate shield parameters', async () => {
      req.body = {
        frequency: 432,
        phase: 1.57
      };

      const route = router.stack.find(r => r.route?.path === '/shield/modulate' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockQuantumShield.modulate).toHaveBeenCalledWith(432, 1.57);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Shield modulated',
        status: expect.any(Object)
      });
    });

    it('should validate modulation parameters', async () => {
      req.body = { frequency: 432 }; // Missing phase

      const route = router.stack.find(r => r.route?.path === '/shield/modulate' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Frequency and phase are required'
      });
    });
  });

  describe('POST /shield/emergency', () => {
    it('should activate emergency overcharge', async () => {
      const route = router.stack.find(r => r.route?.path === '/shield/emergency' && r.route.methods.post);
      await route.route.stack[0].handle(req, res, next);

      expect(mockQuantumShield.emergencyOvercharge).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Emergency shield overcharge activated',
        warning: 'Shield will be depleted in 30 seconds',
        status: expect.any(Object)
      });
    });
  });
});