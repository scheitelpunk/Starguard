import { AdaptiveImmuneSystem } from '../../defense/AdaptiveImmuneSystem';
import { Logger } from 'winston';
import { THREAT_LEVELS } from '@starguard/shared';
import { getPool } from '../../utils/database';

jest.mock('../../utils/database');

describe('AdaptiveImmuneSystem', () => {
  let immuneSystem: AdaptiveImmuneSystem;
  let mockLogger: jest.Mocked<Logger>;
  let mockDb: any;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    mockDb = {
      query: jest.fn().mockResolvedValue({ rows: [] })
    };

    (getPool as jest.Mock).mockReturnValue(mockDb);

    immuneSystem = new AdaptiveImmuneSystem(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with base antibodies', () => {
      expect(immuneSystem['antibodies'].size).toBe(4);
      expect(immuneSystem['antibodies'].has('ab-quantum-1')).toBe(true);
      expect(immuneSystem['antibodies'].has('ab-reality-1')).toBe(true);
      expect(immuneSystem['antibodies'].has('ab-temporal-1')).toBe(true);
      expect(immuneSystem['antibodies'].has('ab-consciousness-1')).toBe(true);
    });

    it('should have full system health on init', () => {
      const status = immuneSystem.getImmuneStatus();
      expect(status.health.overall_health).toBe(100);
      expect(status.health.immune_strength).toBe(100);
      expect(status.health.consciousness_coherence).toBe(1.0);
    });
  });

  describe('deployDefense()', () => {
    const mockPattern = {
      id: 'pattern-1',
      threat_level: THREAT_LEVELS.HIGH,
      consciousness_signature: 'QUANTUM_THREAT_ALPHA',
      countermeasures: []
    };

    it('should deploy defense with matching antibodies', async () => {
      const response = await immuneSystem.deployDefense('threat-1', mockPattern);

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('threat_id', 'threat-1');
      expect(response).toHaveProperty('response_type');
      expect(response).toHaveProperty('effectiveness');
      expect(response.effectiveness).toBeGreaterThan(0);
    });

    it('should create adaptive antibody for unknown patterns', async () => {
      const unknownPattern = {
        ...mockPattern,
        consciousness_signature: 'UNKNOWN_SIGNATURE_XYZ'
      };

      const initialCount = immuneSystem['antibodies'].size;
      await immuneSystem.deployDefense('threat-2', unknownPattern);
      
      expect(immuneSystem['antibodies'].size).toBe(initialCount + 1);
    });

    it('should emit defense_deployed event', async () => {
      const mockEmit = jest.spyOn(immuneSystem, 'emit');
      
      await immuneSystem.deployDefense('threat-3', mockPattern);
      
      expect(mockEmit).toHaveBeenCalledWith('defense_deployed', expect.any(Object));
    });

    it('should determine correct response type based on threat level', async () => {
      const criticalPattern = { ...mockPattern, threat_level: THREAT_LEVELS.CRITICAL };
      const response = await immuneSystem.deployDefense('threat-4', criticalPattern);
      
      expect(response.response_type).toBe('neutralize');
    });
  });

  describe('heal()', () => {
    it('should gradually restore system health', async () => {
      // Damage the system first
      immuneSystem['systemHealth'].overall_health = 50;
      immuneSystem['systemHealth'].consciousness_coherence = 0.5;

      await immuneSystem.heal({});

      expect(immuneSystem['systemHealth'].overall_health).toBeGreaterThan(50);
      expect(immuneSystem['systemHealth'].consciousness_coherence).toBeGreaterThan(0.5);
    });

    it('should emit healing progress events', async () => {
      const mockEmit = jest.spyOn(immuneSystem, 'emit');
      
      await immuneSystem.heal({});
      
      const healingEvents = mockEmit.mock.calls.filter(
        call => call[0] === 'healing_progress'
      );
      
      expect(healingEvents.length).toBeGreaterThan(0);
    });
  });

  describe('evolve()', () => {
    it('should increment evolution cycle', () => {
      const initialCycle = immuneSystem['evolutionCycle'];
      
      immuneSystem.evolve();
      
      expect(immuneSystem['evolutionCycle']).toBe(initialCycle + 1);
    });

    it('should evolve antibodies with mutations', () => {
      // Mock random to ensure mutation
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      
      const antibody = immuneSystem['antibodies'].get('ab-quantum-1');
      const initialMutations = antibody?.mutations.length || 0;
      
      immuneSystem.evolve();
      
      const evolvedAntibody = immuneSystem['antibodies'].get('ab-quantum-1');
      expect(evolvedAntibody?.mutations.length).toBeGreaterThan(initialMutations);
    });

    it('should increase adaptation rate', () => {
      const initialRate = immuneSystem['systemHealth'].adaptation_rate;
      
      immuneSystem.evolve();
      
      expect(immuneSystem['systemHealth'].adaptation_rate).toBeGreaterThan(initialRate);
    });

    it('should emit evolution_complete event', () => {
      const mockEmit = jest.spyOn(immuneSystem, 'emit');
      
      immuneSystem.evolve();
      
      expect(mockEmit).toHaveBeenCalledWith('evolution_complete', expect.objectContaining({
        cycle: expect.any(Number),
        antibody_count: expect.any(Number),
        adaptation_rate: expect.any(Number)
      }));
    });
  });

  describe('quarantineThreat()', () => {
    it('should insert threat into quarantine zone', async () => {
      await immuneSystem.quarantineThreat('threat-5');
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO quarantine_zone'),
        ['threat-5', expect.any(Date), 'active']
      );
    });

    it('should emit threat_quarantined event', async () => {
      const mockEmit = jest.spyOn(immuneSystem, 'emit');
      
      await immuneSystem.quarantineThreat('threat-6');
      
      expect(mockEmit).toHaveBeenCalledWith('threat_quarantined', {
        threatId: 'threat-6',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('decontaminate()', () => {
    it('should reset system to pristine state', async () => {
      // Contaminate system first
      immuneSystem['systemHealth'].overall_health = 50;
      immuneSystem['systemHealth'].immune_strength = 60;
      immuneSystem['activeResponses'].set('resp-1', {} as any);
      
      await immuneSystem.decontaminate();
      
      expect(immuneSystem['systemHealth'].overall_health).toBe(100);
      expect(immuneSystem['systemHealth'].immune_strength).toBe(100);
      expect(immuneSystem['activeResponses'].size).toBe(0);
    });

    it('should reinitialize antibodies', async () => {
      // Add custom antibody
      immuneSystem['antibodies'].set('custom-ab', {} as any);
      
      await immuneSystem.decontaminate();
      
      expect(immuneSystem['antibodies'].size).toBe(4); // Only base antibodies
      expect(immuneSystem['antibodies'].has('custom-ab')).toBe(false);
    });

    it('should emit system_decontaminated event', async () => {
      const mockEmit = jest.spyOn(immuneSystem, 'emit');
      
      await immuneSystem.decontaminate();
      
      expect(mockEmit).toHaveBeenCalledWith('system_decontaminated', {
        timestamp: expect.any(Date),
        health: expect.any(Object)
      });
    });
  });

  describe('pattern matching', () => {
    it('should calculate pattern similarity correctly', () => {
      const similarity = immuneSystem['calculatePatternSimilarity'](
        'QUANTUM_SIGNATURE_ALPHA',
        'QUANTUM_SIGNATURE_BETA'
      );
      
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should find matching antibodies for similar patterns', () => {
      const pattern = {
        id: 'test-pattern',
        threat_level: THREAT_LEVELS.HIGH,
        consciousness_signature: 'QUANTUM_SIGNATURE_ALPHA',
        countermeasures: []
      };
      
      const matches = immuneSystem['findMatchingAntibodies'](pattern);
      
      expect(matches).toBeInstanceOf(Array);
      expect(matches.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('side effects calculation', () => {
    it('should calculate side effects based on effectiveness', () => {
      const lowEffectSideEffects = immuneSystem['calculateSideEffects'](0.5);
      const highEffectSideEffects = immuneSystem['calculateSideEffects'](0.95);
      
      expect(lowEffectSideEffects.length).toBeLessThan(highEffectSideEffects.length);
      expect(highEffectSideEffects).toContain('High energy consumption');
    });
  });

  describe('getImmuneStatus()', () => {
    it('should return complete immune system status', () => {
      const status = immuneSystem.getImmuneStatus();
      
      expect(status).toHaveProperty('health');
      expect(status).toHaveProperty('active_responses');
      expect(status).toHaveProperty('antibody_count');
      expect(status).toHaveProperty('evolution_cycle');
      
      expect(status.antibody_count).toBe(4);
      expect(status.evolution_cycle).toBe(0);
    });
  });
});