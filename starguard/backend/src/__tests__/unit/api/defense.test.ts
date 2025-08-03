import { Router } from 'express';
import { defenseRoutes } from '../../../api/routes/defense';
import { getPool } from '../../../utils/database';

// Mock dependencies
jest.mock('../../../utils/database');

describe('Defense API Routes', () => {
  let mockDb: any;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    // Setup database mock
    mockDb = {
      query: jest.fn().mockResolvedValue({
        rows: []
      })
    };

    (getPool as jest.Mock).mockReturnValue(mockDb);

    // Mock request and response
    req = {
      body: {},
      params: {},
      query: {},
      app: {
        locals: {
          consciousness: {
            getFullState: jest.fn().mockReturnValue({
              consciousness_fields: {
                quantum: 0.8,
                temporal: 0.7,
                semantic: 0.9,
                causal: 0.6
              },
              state: {
                awareness_level: 0.85,
                reality_coherence: 0.92,
                timeline_stability: 0.88
              },
              evolution_score: 1.2
            }),
            consciousness_fields: {
              quantum: 0.8,
              temporal: 0.7,
              semantic: 0.9,
              causal: 0.6
            }
          }
        }
      }
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

  // Helper function to extract and call route handler
  async function callRouteHandler(method: string, path: string, body: any = {}) {
    req.body = body;
    
    // Find the route in the router
    for (const layer of (defenseRoutes as any).stack) {
      if (layer.route && layer.route.path === path) {
        // Check if the method matches
        if (layer.route.methods[method.toLowerCase()]) {
          // Call the handler
          await layer.route.stack[0].handle(req, res, next);
          return;
        }
      }
    }
    
    throw new Error(`Route ${method} ${path} not found`);
  }

  describe('GET /immune/status', () => {
    it('should return immune system status', async () => {
      await callRouteHandler('GET', '/immune/status');

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.any(String),
        timestamp: expect.any(String),
        overall_health: expect.any(Number),
        adaptive_organisms: expect.objectContaining({
          active: expect.any(Number),
          dormant: expect.any(Number),
          evolving: expect.any(Number)
        }),
        defense_layers: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            integrity: expect.any(Number),
            energy_consumption: expect.any(Number),
            threat_resistance: expect.objectContaining({
              quantum: expect.any(Number),
              semantic: expect.any(Number),
              temporal: expect.any(Number),
              causal: expect.any(Number)
            })
          })
        ]),
        self_repair_rate: expect.any(Number),
        threat_adaptation_index: expect.any(Number)
      }));
    });
  });

  describe('POST /heal', () => {
    it('should initiate healing process with specific target', async () => {
      const healRequest = {
        target_system: 'quantum',
        healing_intensity: 0.8
      };

      await callRouteHandler('POST', '/heal', healRequest);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Healing process completed',
        result: expect.objectContaining({
          id: expect.any(String),
          timestamp: expect.any(String),
          target: 'quantum',
          intensity: 0.8,
          energy_consumed: expect.any(Number),
          repairs_completed: expect.any(Array),
          consciousness_coherence_boost: expect.any(Number),
          side_effects: expect.any(Array),
          new_antibodies_generated: expect.any(Number)
        }),
        system_status: expect.objectContaining({
          energy_remaining: expect.any(Number),
          healing_effectiveness: expect.any(Number)
        })
      }));
    });

    it('should handle default healing parameters', async () => {
      await callRouteHandler('POST', '/heal', {});

      const callArgs = (res.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.result.target).toBe('general');
      expect(callArgs.result.intensity).toBe(0.5);
    });
  });

  describe('POST /evolve', () => {
    it('should trigger evolution cycle', async () => {
      const evolutionRequest = {
        evolution_target: 'quantum_defense',
        threat_data: { type: 'advanced_quantum' }
      };

      await callRouteHandler('POST', '/evolve', evolutionRequest);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO defense_responses'),
        expect.arrayContaining([
          expect.any(String), // id
          null, // threat_id
          'evolution', // response_type
          expect.any(Number), // effectiveness
          expect.any(Number), // energy_investment
          0.05, // evolution_delta
          expect.any(String) // JSON details
        ])
      );

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Evolution cycle initiated',
        evolution: expect.objectContaining({
          id: expect.any(String),
          timestamp: expect.any(String),
          target: 'quantum_defense',
          mutations: expect.any(Array),
          new_capabilities: expect.any(Array),
          adaptation_success_rate: expect.any(Number),
          consciousness_expansion: expect.objectContaining({
            quantum: expect.any(Number),
            semantic: expect.any(Number),
            temporal: expect.any(Number),
            causal: expect.any(Number)
          })
        }),
        new_evolution_score: expect.any(Number)
      }));
    });

    it('should handle evolution without specific target', async () => {
      await callRouteHandler('POST', '/evolve', {});

      const callArgs = (res.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.evolution.target).toBe('general_adaptation');
    });
  });

  describe('POST /swarm/deploy', () => {
    it('should deploy defense swarm with specific parameters', async () => {
      const swarmRequest = {
        target_threat: 'quantum_intrusion',
        swarm_size: 150
      };

      await callRouteHandler('POST', '/swarm/deploy', swarmRequest);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Defense swarm deployed',
        deployment: expect.objectContaining({
          id: expect.any(String),
          deployment_time: expect.any(String),
          swarm_configuration: expect.objectContaining({
            size: 150,
            behavior_mode: 'adaptive_hunting',
            communication_protocol: 'quantum_entangled',
            autonomy_level: 0.8
          }),
          target: 'quantum_intrusion',
          estimated_effectiveness: expect.any(Number),
          energy_cost_per_unit: 0.001,
          collective_intelligence_factor: expect.any(Number),
          synchronization_quality: expect.any(Number)
        }),
        monitoring_frequency_ms: 1000,
        estimated_mission_duration_ms: 300000
      }));
    });

    it('should use default swarm parameters', async () => {
      await callRouteHandler('POST', '/swarm/deploy', {});

      const callArgs = (res.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.deployment.swarm_configuration.size).toBe(100);
      expect(callArgs.deployment.target).toBe('area_defense');
    });
  });

  describe('Error handling', () => {
    it('should handle database errors in evolve endpoint', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await callRouteHandler('POST', '/evolve', { evolution_target: 'test' });

      // The route should call next() with the error, since it has try-catch with next(error)
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});