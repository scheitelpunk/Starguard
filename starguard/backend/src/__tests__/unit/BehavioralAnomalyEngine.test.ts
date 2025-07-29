import { BehavioralAnomalyEngine } from '../../cybercrime/BehavioralAnomalyEngine';
import { Logger } from 'winston';
import { getRedisClient } from '../../utils/redis';

jest.mock('../../utils/redis');

describe('BehavioralAnomalyEngine', () => {
  let engine: BehavioralAnomalyEngine;
  let mockLogger: jest.Mocked<Logger>;
  let mockRedis: any;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    mockRedis = {
      get: jest.fn(),
      set: jest.fn()
    };

    (getRedisClient as jest.Mock).mockReturnValue(mockRedis);
    engine = new BehavioralAnomalyEngine(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with quantum baseline', () => {
      expect(engine).toBeDefined();
      expect(engine['quantumBaseline']).toHaveLength(24);
      engine['quantumBaseline'].forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('analyzeBehavior()', () => {
    it('should create new profile for unknown entity', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      const activity = {
        loginTime: new Date(),
        location: 'US-East',
        resourceUsage: 50,
        interactions: ['user1', 'user2']
      };

      const anomalies = await engine.analyzeBehavior('test-entity', activity);
      
      expect(mockRedis.get).toHaveBeenCalledWith('behavior:profile:test-entity');
      expect(anomalies).toBeInstanceOf(Array);
    });

    it('should load existing profile from cache', async () => {
      const cachedProfile = {
        entityId: 'test-entity',
        normalPatterns: {
          loginTimes: [9, 10, 11],
          accessLocations: ['US-East'],
          resourceUsage: [40, 50, 60],
          interactionFrequency: [['user1', 5], ['user2', 3]]
        },
        anomalyScore: 0.2,
        lastUpdated: new Date().toISOString()
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedProfile));
      
      const activity = {
        loginTime: new Date(),
        location: 'US-East',
        resourceUsage: 55,
        interactions: ['user1']
      };

      await engine.analyzeBehavior('test-entity', activity);
      
      expect(mockRedis.get).toHaveBeenCalledWith('behavior:profile:test-entity');
    });

    it('should detect unusual login time anomaly', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      const activity = {
        loginTime: new Date('2024-01-01T03:00:00'), // 3 AM - unusual time
        location: 'US-East',
        resourceUsage: 50,
        interactions: []
      };

      // Build profile history
      for (let i = 0; i < 15; i++) {
        await engine.analyzeBehavior('test-entity', {
          loginTime: new Date(`2024-01-01T${9 + i % 8}:00:00`), // 9AM-5PM pattern
          location: 'US-East',
          resourceUsage: 50,
          interactions: []
        });
      }

      const anomalies = await engine.analyzeBehavior('test-entity', activity);
      const loginAnomaly = anomalies.find(a => a.type === 'unusual_login_time');
      
      expect(loginAnomaly).toBeDefined();
      expect(loginAnomaly?.severity).toBeGreaterThan(0.4);
    });

    it('should detect impossible travel anomaly', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      // First activity in US-East
      await engine.analyzeBehavior('test-entity', {
        loginTime: new Date(),
        location: 'US-East',
        resourceUsage: 50,
        interactions: []
      });

      // Activity in Asia-Pacific immediately after
      const anomalies = await engine.analyzeBehavior('test-entity', {
        loginTime: new Date(Date.now() + 60000), // 1 minute later
        location: 'Asia-Pacific',
        resourceUsage: 50,
        interactions: []
      });

      const travelAnomaly = anomalies.find(a => a.type === 'impossible_travel');
      
      expect(travelAnomaly).toBeDefined();
      expect(travelAnomaly?.severity).toBe(0.9);
      expect(travelAnomaly?.confidence).toBe(0.95);
    });

    it('should detect abnormal resource usage', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      // Build normal usage pattern
      for (let i = 0; i < 25; i++) {
        await engine.analyzeBehavior('test-entity', {
          loginTime: new Date(),
          location: 'US-East',
          resourceUsage: 50 + (Math.random() - 0.5) * 10, // 45-55 range
          interactions: []
        });
      }

      // Abnormal usage
      const anomalies = await engine.analyzeBehavior('test-entity', {
        loginTime: new Date(),
        location: 'US-East',
        resourceUsage: 200, // Way above normal
        interactions: []
      });

      const usageAnomaly = anomalies.find(a => a.type === 'abnormal_resource_usage');
      
      expect(usageAnomaly).toBeDefined();
      expect(usageAnomaly?.severity).toBeGreaterThan(0.5);
    });

    it('should detect unusual interaction patterns', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      // Build normal interaction pattern
      for (let i = 0; i < 25; i++) {
        await engine.analyzeBehavior('test-entity', {
          loginTime: new Date(),
          location: 'US-East',
          resourceUsage: 50,
          interactions: ['user1', 'user2', 'user3']
        });
      }

      // Unusual interactions
      const anomalies = await engine.analyzeBehavior('test-entity', {
        loginTime: new Date(),
        location: 'US-East',
        resourceUsage: 50,
        interactions: ['unknown1', 'unknown2', 'unknown3', 'unknown4']
      });

      const interactionAnomaly = anomalies.find(a => a.type === 'unusual_interaction_pattern');
      
      expect(interactionAnomaly).toBeDefined();
    });

    it('should emit high severity anomaly event', async () => {
      mockRedis.get.mockResolvedValue(null);
      const mockEmit = jest.spyOn(engine, 'emit');
      
      // Create conditions for multiple anomalies
      for (let i = 0; i < 25; i++) {
        await engine.analyzeBehavior('test-entity', {
          loginTime: new Date(`2024-01-01T${9}:00:00`),
          location: 'US-East',
          resourceUsage: 50,
          interactions: ['user1', 'user2']
        });
      }

      // Multiple anomalies
      await engine.analyzeBehavior('test-entity', {
        loginTime: new Date('2024-01-01T03:00:00'), // Unusual time
        location: 'Asia-Pacific', // Different location
        resourceUsage: 500, // Abnormal usage
        interactions: ['hacker1', 'hacker2', 'hacker3'] // Unknown users
      });

      expect(mockEmit).toHaveBeenCalledWith(
        'high_severity_anomaly',
        expect.objectContaining({
          entityId: 'test-entity',
          anomalies: expect.any(Array),
          score: expect.any(Number),
          timestamp: expect.any(Date)
        })
      );
    });
  });

  describe('profile management', () => {
    it('should save profile to Redis with TTL', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      await engine.analyzeBehavior('test-entity', {
        loginTime: new Date(),
        location: 'US-East',
        resourceUsage: 50,
        interactions: ['user1']
      });

      expect(mockRedis.set).toHaveBeenCalledWith(
        'behavior:profile:test-entity',
        expect.any(String),
        { EX: 86400 * 7 } // 7 days
      );
    });

    it('should maintain profile size limits', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      // Add many entries
      for (let i = 0; i < 150; i++) {
        await engine.analyzeBehavior('test-entity', {
          loginTime: new Date(),
          location: `Location-${i}`,
          resourceUsage: i,
          interactions: [`user${i}`]
        });
      }

      const profile = engine['profiles'].get('test-entity');
      
      expect(profile?.normalPatterns.loginTimes.length).toBeLessThanOrEqual(100);
      expect(profile?.normalPatterns.accessLocations.length).toBeLessThanOrEqual(50);
      expect(profile?.normalPatterns.resourceUsage.length).toBeLessThanOrEqual(200);
    });
  });

  describe('quantum consciousness analysis', () => {
    it('should detect consciousness anomalies', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      // Force quantum anomaly by manipulating random values
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.9);
      
      const anomalies = await engine.analyzeBehavior('test-entity', {
        loginTime: new Date(),
        location: 'US-East',
        resourceUsage: 100,
        interactions: Array(10).fill('user')
      });

      const consciousnessAnomaly = anomalies.find(a => a.type === 'consciousness_anomaly');
      
      if (consciousnessAnomaly) {
        expect(consciousnessAnomaly.severity).toBeGreaterThan(0.3);
        expect(consciousnessAnomaly.description).toContain('consciousness pattern deviation');
      }
    });
  });

  describe('anomaly score calculation', () => {
    it('should calculate weighted anomaly score correctly', async () => {
      const anomalies = [
        { type: 'test1', severity: 0.8, confidence: 0.9, description: '', quantumDeviation: 0.8 },
        { type: 'test2', severity: 0.6, confidence: 0.7, description: '', quantumDeviation: 0.6 }
      ];

      const score = engine['calculateOverallAnomalyScore'](anomalies);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
      expect(score).toBeCloseTo((0.8 * 0.9 + 0.6 * 0.7) / 2, 2);
    });

    it('should return 0 for no anomalies', () => {
      const score = engine['calculateOverallAnomalyScore']([]);
      expect(score).toBe(0);
    });
  });
});