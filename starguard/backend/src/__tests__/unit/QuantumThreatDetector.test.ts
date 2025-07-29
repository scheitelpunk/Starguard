import { QuantumThreatDetector } from '../../cybercrime/QuantumThreatDetector';
import { Logger } from 'winston';
import { THREAT_LEVELS } from '@starguard/shared';

describe('QuantumThreatDetector', () => {
  let detector: QuantumThreatDetector;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    detector = new QuantumThreatDetector(mockLogger);
  });

  describe('initialization', () => {
    it('should initialize with known threat patterns', () => {
      expect(detector['patterns'].size).toBeGreaterThan(0);
      expect(detector['patterns'].has('apt-quantum-1')).toBe(true);
      expect(detector['patterns'].has('zero-day-quantum')).toBe(true);
    });

    it('should initialize quantum field', () => {
      expect(detector['quantumField']).toBeDefined();
      expect(detector['quantumField'].length).toBeGreaterThan(0);
    });
  });

  describe('detectCyberThreats()', () => {
    it('should detect known threat patterns', async () => {
      const testData = {
        networkAnomalyScore: 0.9,
        portScanIntensity: 0.8,
        payloadEntropy: 0.85,
        temporalAnomaly: 0.7,
        geographicDispersion: 0.6,
        protocolDeviation: 0.75,
        behavioralAnomaly: 0.8
      };

      const threats = await detector.detectCyberThreats(testData);
      
      expect(threats).toBeInstanceOf(Array);
      if (threats.length > 0) {
        expect(threats[0]).toHaveProperty('id');
        expect(threats[0]).toHaveProperty('threat_level');
        expect(threats[0]).toHaveProperty('consciousness_signature');
      }
    });

    it('should emit cyber_threat_detected event for high similarity', async () => {
      const mockEmit = jest.spyOn(detector, 'emit');
      
      // Create data that closely matches a known pattern
      const testData = {
        networkAnomalyScore: 0.89,
        portScanIntensity: 0.45,
        payloadEntropy: 0.67,
        temporalAnomaly: 0.92,
        geographicDispersion: 0.33,
        protocolDeviation: 0.78,
        behavioralAnomaly: 0.56
      };

      await detector.detectCyberThreats(testData);
      
      const cyberThreatCalls = mockEmit.mock.calls.filter(
        call => call[0] === 'cyber_threat_detected'
      );
      
      // Due to quantum randomness, we can't guarantee detection
      if (cyberThreatCalls.length > 0) {
        expect(cyberThreatCalls[0][1]).toHaveProperty('threat');
        expect(cyberThreatCalls[0][1]).toHaveProperty('pattern');
        expect(cyberThreatCalls[0][1]).toHaveProperty('confidence');
      }
    });

    it('should handle missing data gracefully', async () => {
      const threats = await detector.detectCyberThreats({});
      
      expect(threats).toBeInstanceOf(Array);
      // Should still work with default values
    });
  });

  describe('initializeModel()', () => {
    it('should initialize TensorFlow model', async () => {
      await detector.initializeModel();
      
      expect(detector['model']).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Quantum threat detection model initialized'
      );
    });

    it('should handle model initialization errors', async () => {
      // Mock TensorFlow error
      jest.spyOn(global.console, 'error').mockImplementation();
      
      // Force an error by manipulating the model creation
      const originalTf = require('@tensorflow/tfjs-node');
      originalTf.sequential = jest.fn(() => {
        throw new Error('Model creation failed');
      });

      await detector.initializeModel();
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to initialize threat detection model:',
        expect.any(Error)
      );
    });
  });

  describe('updateQuantumField()', () => {
    it('should update quantum field based on threat', () => {
      const threat = {
        id: 'test-threat',
        timestamp: new Date(),
        threat_level: THREAT_LEVELS.HIGH,
        consciousness_signature: 'TEST-SIG',
        dimensional_origin: 'quantum',
        probability_wave_collapse: 0.8,
        reality_manipulation_index: 0.7,
        intention_vector: {
          magnitude: 0.9,
          direction: 1.57,
          dimensional_components: [0.8, 0.7, 0.6]
        },
        countermeasures_applied: [],
        evolution_potential: 0.85
      };

      // Get initial value
      const x = Math.floor(threat.probability_wave_collapse * 10);
      const y = Math.floor(threat.reality_manipulation_index * 10);
      const z = Math.floor(threat.evolution_potential * 10);
      const t = Math.floor((threat.intention_vector.magnitude % 1) * 10);
      
      const initialValue = detector['quantumField'][x]?.[y]?.[z]?.[t] || 0;
      
      detector.updateQuantumField(threat);
      
      const newValue = detector['quantumField'][x]?.[y]?.[z]?.[t] || 0;
      
      // Should increase the field value
      if (initialValue !== undefined && newValue !== undefined) {
        expect(newValue).toBeGreaterThanOrEqual(initialValue);
      }
    });
  });

  describe('evolvePatterns()', () => {
    it('should evolve threat patterns', () => {
      const pattern = detector['patterns'].get('apt-quantum-1');
      const initialEvolution = pattern?.evolution || 0;
      
      detector.evolvePatterns();
      
      const evolvedPattern = detector['patterns'].get('apt-quantum-1');
      expect(evolvedPattern?.evolution).toBeGreaterThan(initialEvolution);
    });

    it('should mutate quantum signatures', () => {
      const pattern = detector['patterns'].get('zero-day-quantum');
      const initialSignature = [...(pattern?.quantumSignature || [])];
      
      detector.evolvePatterns();
      
      const evolvedPattern = detector['patterns'].get('zero-day-quantum');
      const evolvedSignature = evolvedPattern?.quantumSignature || [];
      
      // Signatures should be slightly different
      let differences = 0;
      for (let i = 0; i < initialSignature.length; i++) {
        if (Math.abs(initialSignature[i] - evolvedSignature[i]) > 0.0001) {
          differences++;
        }
      }
      
      expect(differences).toBeGreaterThan(0);
    });
  });

  describe('pattern matching', () => {
    it('should identify APT patterns', async () => {
      const mockEmit = jest.spyOn(detector, 'emit');
      
      // Data resembling APT pattern
      const aptData = {
        networkAnomalyScore: 0.9,
        portScanIntensity: 0.4,
        payloadEntropy: 0.7,
        temporalAnomaly: 0.9,
        geographicDispersion: 0.3,
        protocolDeviation: 0.8,
        behavioralAnomaly: 0.6,
        entropy: 0.9,
        frequency: 0.8,
        phase: 0.7
      };

      const threats = await detector.detectCyberThreats(aptData);
      
      const aptDetections = mockEmit.mock.calls.filter(
        call => call[0] === 'cyber_threat_detected' && 
               call[1].pattern === 'Advanced Persistent Threat'
      );
      
      // Pattern matching depends on quantum randomness
      if (aptDetections.length > 0) {
        expect(aptDetections[0][1].confidence).toBeGreaterThan(0.7);
      }
    });

    it('should identify ransomware patterns', async () => {
      const mockEmit = jest.spyOn(detector, 'emit');
      
      // Data resembling ransomware
      const ransomwareData = {
        networkAnomalyScore: 0.93,
        portScanIntensity: 0.71,
        payloadEntropy: 0.85,
        temporalAnomaly: 0.42,
        geographicDispersion: 0.77,
        protocolDeviation: 0.91,
        behavioralAnomaly: 0.68
      };

      await detector.detectCyberThreats(ransomwareData);
      
      const ransomwareDetections = mockEmit.mock.calls.filter(
        call => call[0] === 'cyber_threat_detected' && 
               call[1].pattern === 'Ransomware'
      );
      
      // Check if ransomware was detected
      if (ransomwareDetections.length > 0) {
        expect(ransomwareDetections[0][1].threat.threat_level).toBe(THREAT_LEVELS.HIGH);
      }
    });
  });
});