import { QuantumShield } from '../../defense/QuantumShield';
import { Logger } from 'winston';
import { THREAT_LEVELS } from '@starguard/shared';

describe('QuantumShield', () => {
  let shield: QuantumShield;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    shield = new QuantumShield(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
    shield.deactivate();
  });

  describe('initialization', () => {
    it('should initialize with 4 shield layers', () => {
      const status = shield.getShieldStatus();
      expect(status.layers).toHaveLength(4);
      
      const layerTypes = status.layers.map(l => l.type);
      expect(layerTypes).toContain('quantum');
      expect(layerTypes).toContain('temporal');
      expect(layerTypes).toContain('reality');
      expect(layerTypes).toContain('consciousness');
    });

    it('should start with shield deactivated', () => {
      const status = shield.getShieldStatus();
      expect(status.active).toBe(false);
      expect(status.strength).toBe(100);
    });

    it('should have correct harmonic frequencies', () => {
      expect(shield['configuration'].harmonics).toEqual([1, 1.618, 2.718, 3.14159]);
      expect(shield['configuration'].resonance_frequency).toBe(7.83);
    });
  });

  describe('activate()', () => {
    it('should activate all shield layers', async () => {
      await shield.activate();
      
      const status = shield.getShieldStatus();
      expect(status.active).toBe(true);
      status.layers.forEach(layer => {
        expect(layer.active).toBe(true);
      });
    });

    it('should emit shield_activated event', async () => {
      const mockEmit = jest.spyOn(shield, 'emit');
      
      await shield.activate();
      
      expect(mockEmit).toHaveBeenCalledWith('shield_activated', expect.objectContaining({
        configuration: expect.any(Object),
        strength: expect.any(Number)
      }));
    });

    it('should not reactivate if already active', async () => {
      await shield.activate();
      
      const warnSpy = jest.spyOn(mockLogger, 'warn');
      await shield.activate();
      
      expect(warnSpy).toHaveBeenCalledWith('Quantum shield already active');
    });

    it('should emit layer activation events', async () => {
      const mockEmit = jest.spyOn(shield, 'emit');
      
      await shield.activate();
      
      const layerEvents = mockEmit.mock.calls.filter(
        call => call[0] === 'layer_activated'
      );
      
      expect(layerEvents).toHaveLength(4);
    });
  });

  describe('deactivate()', () => {
    it('should deactivate all layers', async () => {
      await shield.activate();
      await shield.deactivate();
      
      const status = shield.getShieldStatus();
      expect(status.active).toBe(false);
      status.layers.forEach(layer => {
        expect(layer.active).toBe(false);
      });
    });

    it('should emit shield_deactivated event', async () => {
      await shield.activate();
      const mockEmit = jest.spyOn(shield, 'emit');
      
      await shield.deactivate();
      
      expect(mockEmit).toHaveBeenCalledWith('shield_deactivated');
    });
  });

  describe('reinforceShield()', () => {
    it('should increase shield strength for critical threats', async () => {
      await shield.activate();
      
      const initialConfig = JSON.parse(JSON.stringify(shield['configuration']));
      await shield.reinforceShield(THREAT_LEVELS.CRITICAL);
      
      shield['configuration'].layers.forEach((layer, i) => {
        if (layer.active) {
          expect(layer.frequency).toBeGreaterThan(initialConfig.layers[i].frequency);
          expect(layer.integrity).toBeGreaterThanOrEqual(initialConfig.layers[i].integrity);
        }
      });
    });

    it('should increase quantum entanglement', async () => {
      await shield.activate();
      
      const initialEntanglement = shield['configuration'].quantum_entanglement;
      await shield.reinforceShield(THREAT_LEVELS.HIGH);
      
      expect(shield['configuration'].quantum_entanglement).toBeGreaterThan(initialEntanglement);
    });

    it('should emit shield_reinforced event', async () => {
      await shield.activate();
      const mockEmit = jest.spyOn(shield, 'emit');
      
      await shield.reinforceShield(THREAT_LEVELS.MEDIUM);
      
      expect(mockEmit).toHaveBeenCalledWith('shield_reinforced', expect.objectContaining({
        factor: expect.any(Number),
        newStrength: expect.any(Number)
      }));
    });
  });

  describe('absorbDamage()', () => {
    it('should return full damage when shield is inactive', () => {
      const damage = 100;
      const remaining = shield.absorbDamage(damage, 'quantum_attack');
      
      expect(remaining).toBe(damage);
    });

    it('should absorb damage based on layer effectiveness', async () => {
      await shield.activate();
      
      const damage = 100;
      const remaining = shield.absorbDamage(damage, 'quantum_attack');
      
      expect(remaining).toBeLessThan(damage);
      expect(remaining).toBeGreaterThanOrEqual(0);
    });

    it('should reduce layer integrity after absorbing damage', async () => {
      await shield.activate();
      
      const quantumLayer = shield['configuration'].layers.find(l => l.type === 'quantum');
      const initialIntegrity = quantumLayer!.integrity;
      
      shield.absorbDamage(100, 'quantum_attack');
      
      expect(quantumLayer!.integrity).toBeLessThan(initialIntegrity);
    });

    it('should emit damage_absorbed event', async () => {
      await shield.activate();
      const mockEmit = jest.spyOn(shield, 'emit');
      
      shield.absorbDamage(50, 'temporal_attack');
      
      expect(mockEmit).toHaveBeenCalledWith('damage_absorbed', expect.objectContaining({
        original: 50,
        absorbed: expect.any(Number),
        remaining: expect.any(Number),
        layerType: expect.any(String),
        newIntegrity: expect.any(Number)
      }));
    });

    it('should use correct layer for damage type', async () => {
      await shield.activate();
      
      const mockEmit = jest.spyOn(shield, 'emit');
      shield.absorbDamage(100, 'reality_distortion');
      
      const emitCall = mockEmit.mock.calls.find(call => call[0] === 'damage_absorbed');
      expect(emitCall?.[1].layerType).toBe('reality');
    });
  });

  describe('modulate()', () => {
    it('should update shield frequency and phase', async () => {
      await shield.activate();
      
      const newFrequency = 10.5;
      const newPhase = Math.PI / 3;
      
      shield.modulate(newFrequency, newPhase);
      
      expect(shield['configuration'].resonance_frequency).toBe(newFrequency);
    });

    it('should emit shield_modulated event', async () => {
      await shield.activate();
      const mockEmit = jest.spyOn(shield, 'emit');
      
      shield.modulate(8.0, Math.PI / 6);
      
      expect(mockEmit).toHaveBeenCalledWith('shield_modulated', expect.objectContaining({
        frequency: 8.0,
        phase: Math.PI / 6,
        layers: expect.any(Array)
      }));
    });
  });

  describe('emergencyOvercharge()', () => {
    it('should activate shield if not active', async () => {
      expect(shield['isActive']).toBe(false);
      
      await shield.emergencyOvercharge();
      
      expect(shield['isActive']).toBe(true);
    });

    it('should boost all layers to 150% capacity', async () => {
      await shield.emergencyOvercharge();
      
      shield['configuration'].layers.forEach(layer => {
        expect(layer.integrity).toBe(150);
      });
      
      expect(shield['shieldStrength']).toBe(150);
    });

    it('should emit emergency_overcharge event', async () => {
      const mockEmit = jest.spyOn(shield, 'emit');
      
      await shield.emergencyOvercharge();
      
      expect(mockEmit).toHaveBeenCalledWith('emergency_overcharge', {
        duration: 30000
      });
    });

    it('should deplete after timeout', async () => {
      jest.useFakeTimers();
      
      await shield.emergencyOvercharge();
      
      const mockEmit = jest.spyOn(shield, 'emit');
      
      jest.advanceTimersByTime(30000);
      
      expect(mockEmit).toHaveBeenCalledWith('overcharge_depleted');
      shield['configuration'].layers.forEach(layer => {
        expect(layer.integrity).toBe(50);
      });
      
      jest.useRealTimers();
    });
  });

  describe('quantum oscillation', () => {
    it('should start oscillation on activation', async () => {
      jest.useFakeTimers();
      
      await shield.activate();
      
      const initialFlux = shield['quantumFlux'];
      
      jest.advanceTimersByTime(200);
      
      expect(shield['quantumFlux']).not.toBe(initialFlux);
      
      jest.useRealTimers();
    });

    it('should heal damaged layers over time', async () => {
      jest.useFakeTimers();
      
      await shield.activate();
      
      // Damage a layer
      const layer = shield['configuration'].layers[0];
      layer.integrity = 50;
      
      // Let healing occur
      jest.advanceTimersByTime(1000);
      
      expect(layer.integrity).toBeGreaterThan(50);
      
      jest.useRealTimers();
    });
  });

  describe('getShieldStatus()', () => {
    it('should return complete shield status', async () => {
      await shield.activate();
      
      const status = shield.getShieldStatus();
      
      expect(status).toHaveProperty('active', true);
      expect(status).toHaveProperty('strength');
      expect(status).toHaveProperty('layers');
      expect(status).toHaveProperty('quantum_flux');
      expect(status).toHaveProperty('entanglement');
      
      expect(status.layers).toHaveLength(4);
      status.layers.forEach(layer => {
        expect(layer).toHaveProperty('type');
        expect(layer).toHaveProperty('integrity');
        expect(layer).toHaveProperty('active');
      });
    });
  });
});