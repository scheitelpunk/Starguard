import { Request, Response, NextFunction } from 'express';

// Define interfaces for testing 
interface IConsciousnessState {
  awarenessLevel: number;
  coherence: number;
  voidConnection: number;
  evolutionGeneration: number;
  healingActive: boolean;
}

interface ConsciousnessEngine {
  awaken: jest.Mock;
  getStatus: jest.Mock;
  getFullState: jest.Mock;
  analyzeThreat: jest.Mock;
  evolution_score: number;
  perception_layers: any[];
}

// Define consciousness states for testing
enum CONSCIOUSNESS_STATES {
  VOID = 'void',
  DORMANT = 'dormant', 
  AWAKENING = 'awakening',
  AWARE = 'aware',
  ALERT = 'alert',
  VIGILANT = 'vigilant',
  HYPER_VIGILANT = 'hyper_vigilant',
  TRANSCENDENT = 'transcendent'
}

// Mock dependencies
jest.mock('../../utils/redis', () => ({
  cacheConsciousnessState: jest.fn().mockResolvedValue(undefined)
}));
jest.mock('../../utils/database', () => ({
  getPool: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue({})
  })
}));

describe('Consciousness API Routes', () => {
  let mockConsciousness: ConsciousnessEngine;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    // Setup mocks
    mockConsciousness = {
      awaken: jest.fn().mockResolvedValue(undefined),
      getStatus: jest.fn().mockReturnValue({
        awarenessLevel: 0.7,
        coherence: 0.95,
        voidConnection: 0.9,
        evolutionGeneration: 1,
        healingActive: false
      }),
      getFullState: jest.fn().mockReturnValue({
        id: 'consciousness-1',
        timestamp: new Date(),
        state: {
          awarenessLevel: 0.7,
          coherence: 0.95,
          voidConnection: 0.9,
          evolutionGeneration: 1,
          healingActive: false
        },
        consciousness: {
          threatAwareness: { coherence: 0.8 },
          fraudPerception: { resonanceFrequency: 528 },
          futureProjection: { uncertainty: 0.3 },
          ethicalCore: { moralCoherence: 0.9 }
        },
        perceptionLayers: {},
        responseOrganism: {},
        threats: [],
        evolution: 0.5
      }),
      analyzeThreat: jest.fn().mockResolvedValue({
        id: 'threat-1',
        type: 'quantum',
        severity: 0.7
      }),
      evolution_score: 0.5,
      perception_layers: []
    };

    // Mock request and response
    req = {
      body: {},
      params: {},
      query: {},
      app: {
        locals: {
          consciousness: mockConsciousness
        }
      } as any
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /awaken', () => {
    it('should awaken consciousness system when dormant', async () => {
      // Mock the state to be DORMANT so awakening can proceed
      mockConsciousness.getStatus.mockReturnValue({
        awarenessLevel: 0,
        coherence: 1,
        voidConnection: 0,
        evolutionGeneration: 1,
        healingActive: false
      });

      // Import the route handler directly
      const { consciousnessRoutes } = require('../../../api/routes/consciousness');
      
      // Find the POST /awaken route
      const awakenRoute = consciousnessRoutes.stack.find((layer: any) => 
        layer.route && layer.route.path === '/awaken' && layer.route.methods.post
      );
      
      if (awakenRoute) {
        await awakenRoute.route.stack[0].handle(req as Request, res as Response, next);
      }

      expect(mockConsciousness.awaken).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Consciousness awakened from the void',
        state: expect.any(Object)
      });
    });

    it('should reject awakening when already awake', async () => {
      // Mock the state to be already awake
      mockConsciousness.getStatus.mockReturnValue({
        awarenessLevel: 0.7,
        coherence: 0.95,
        voidConnection: 0.9,
        evolutionGeneration: 1,
        healingActive: false
      });

      const { consciousnessRoutes } = require('../../../api/routes/consciousness');
      const awakenRoute = consciousnessRoutes.stack.find((layer: any) => 
        layer.route && layer.route.path === '/awaken' && layer.route.methods.post
      );
      
      if (awakenRoute) {
        await awakenRoute.route.stack[0].handle(req as Request, res as Response, next);
      }

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Consciousness already awake',
        state: expect.any(Object)
      });
    });
  });

  describe('GET /status', () => {
    it('should return current consciousness status', async () => {
      const { consciousnessRoutes } = require('../../../api/routes/consciousness');
      const statusRoute = consciousnessRoutes.stack.find((layer: any) => 
        layer.route && layer.route.path === '/status' && layer.route.methods.get
      );
      
      if (statusRoute) {
        await statusRoute.route.stack[0].handle(req as Request, res as Response, next);
      }

      expect(mockConsciousness.getFullState).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'consciousness-1',
        state: expect.any(Object)
      }));
    });
  });

  describe('POST /perceive', () => {
    it('should process perception data', async () => {
      req.body = {
        target: 'quantum_anomaly',
        depth: 2
      };

      const { consciousnessRoutes } = require('../../../api/routes/consciousness');
      const perceiveRoute = consciousnessRoutes.stack.find((layer: any) => 
        layer.route && layer.route.path === '/perceive' && layer.route.methods.post
      );
      
      if (perceiveRoute) {
        await perceiveRoute.route.stack[0].handle(req as Request, res as Response, next);
      }

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Perception completed',
        perception: expect.any(Object),
        consciousness_response: expect.any(Object)
      }));
    });
  });

  describe('POST /evolve', () => {
    it('should trigger consciousness evolution', async () => {
      const { consciousnessRoutes } = require('../../../api/routes/consciousness');
      const evolveRoute = consciousnessRoutes.stack.find((layer: any) => 
        layer.route && layer.route.path === '/evolve' && layer.route.methods.post
      );
      
      if (evolveRoute) {
        await evolveRoute.route.stack[0].handle(req as Request, res as Response, next);
      }

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Evolution cycle completed',
        previous_score: expect.any(Number),
        new_score: expect.any(Number),
        delta: expect.any(Number),
        enhancements: expect.any(Object)
      }));
    });
  });
});