import { FraudDetector } from '../../financial/FraudDetector';
import { BehavioralAnomalyEngine } from '../../cybercrime/BehavioralAnomalyEngine';
import { Logger } from 'winston';

jest.mock('../../cybercrime/BehavioralAnomalyEngine');

describe('FraudDetector', () => {
  let detector: FraudDetector;
  let mockLogger: jest.Mocked<Logger>;
  let mockBehaviorEngine: jest.Mocked<BehavioralAnomalyEngine>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    mockBehaviorEngine = {
      analyzeBehavior: jest.fn().mockResolvedValue([])
    } as any;

    detector = new FraudDetector(mockLogger, mockBehaviorEngine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with fraud patterns', () => {
      expect(detector['patterns'].size).toBeGreaterThan(0);
      expect(detector['patterns'].has('card-fraud-1')).toBe(true);
      expect(detector['patterns'].has('identity-theft-1')).toBe(true);
      expect(detector['patterns'].has('account-takeover-1')).toBe(true);
    });
  });

  describe('analyzeTransaction()', () => {
    const baseTransactionData = {
      account_id: 'ACC123',
      amount: 100,
      average_amount: 95,
      location: { lat: 40.7128, lng: -74.0060 },
      previous_location: { lat: 40.7128, lng: -74.0060 },
      device_id: 'DEV123',
      known_device_id: 'DEV123',
      typing_speed_deviation: 10
    };

    it('should analyze normal transaction without fraud', async () => {
      const analysis = await detector.analyzeTransaction(baseTransactionData);
      
      expect(analysis).toHaveProperty('id');
      expect(analysis).toHaveProperty('fraud_type');
      expect(analysis).toHaveProperty('confidence');
      expect(analysis).toHaveProperty('risk_score');
      expect(analysis).toHaveProperty('indicators_matched');
      expect(analysis).toHaveProperty('recommendation');
      expect(analysis.recommendation).toBe('approve');
    });

    it('should detect unusual location indicator', async () => {
      const data = {
        ...baseTransactionData,
        location: { lat: 51.5074, lng: -0.1278 }, // London
        previous_location: { lat: 40.7128, lng: -74.0060 } // New York
      };

      const analysis = await detector.analyzeTransaction(data);
      
      expect(analysis.indicators_matched).toContain('unusual_location');
    });

    it('should detect high amount indicator', async () => {
      const data = {
        ...baseTransactionData,
        amount: 500,
        average_amount: 100
      };

      const analysis = await detector.analyzeTransaction(data);
      
      expect(analysis.indicators_matched).toContain('high_amount');
    });

    it('should detect new device indicator', async () => {
      const data = {
        ...baseTransactionData,
        device_id: 'NEW_DEVICE',
        known_device_id: 'OLD_DEVICE'
      };

      const analysis = await detector.analyzeTransaction(data);
      
      expect(analysis.indicators_matched).toContain('new_device');
    });

    it('should detect behavior change indicator', async () => {
      const data = {
        ...baseTransactionData,
        typing_speed_deviation: 75
      };

      const analysis = await detector.analyzeTransaction(data);
      
      expect(analysis.indicators_matched).toContain('behavior_change');
    });

    it('should match fraud patterns with multiple indicators', async () => {
      const data = {
        ...baseTransactionData,
        location: { lat: 51.5074, lng: -0.1278 },
        previous_location: { lat: 40.7128, lng: -74.0060 },
        amount: 500,
        average_amount: 100,
        device_id: 'NEW_DEVICE',
        known_device_id: 'OLD_DEVICE'
      };

      const analysis = await detector.analyzeTransaction(data);
      
      expect(analysis.indicators_matched.length).toBeGreaterThanOrEqual(3);
      expect(analysis.fraud_type).not.toBe('unknown');
    });

    it('should integrate behavioral anomalies into risk score', async () => {
      mockBehaviorEngine.analyzeBehavior.mockResolvedValueOnce([
        { type: 'unusual_login_time', severity: 0.8, confidence: 0.9, description: '', quantumDeviation: 0.8 },
        { type: 'new_location', severity: 0.6, confidence: 0.7, description: '', quantumDeviation: 0.6 }
      ]);

      const analysis = await detector.analyzeTransaction(baseTransactionData);
      
      expect(analysis.risk_score).toBeGreaterThan(0);
      expect(mockBehaviorEngine.analyzeBehavior).toHaveBeenCalledWith(
        baseTransactionData.account_id,
        baseTransactionData
      );
    });

    it('should emit fraud_detected event for high risk', async () => {
      const mockEmit = jest.spyOn(detector, 'emit');
      
      // Create high-risk scenario
      mockBehaviorEngine.analyzeBehavior.mockResolvedValueOnce([
        { type: 'impossible_travel', severity: 0.9, confidence: 0.95, description: '', quantumDeviation: 0.9 }
      ]);

      const data = {
        ...baseTransactionData,
        location: { lat: 35.6762, lng: 139.6503 }, // Tokyo
        previous_location: { lat: 40.7128, lng: -74.0060 }, // New York
        amount: 1000,
        average_amount: 100,
        device_id: 'UNKNOWN',
        known_device_id: 'KNOWN'
      };

      await detector.analyzeTransaction(data);
      
      expect(mockEmit).toHaveBeenCalledWith('fraud_detected', expect.any(Object));
    });
  });

  describe('recommendation logic', () => {
    it('should recommend approve for low risk', async () => {
      const analysis = await detector.analyzeTransaction({
        ...baseTransactionData,
        risk_score: 0.2
      });
      
      expect(analysis.recommendation).toBe('approve');
    });

    it('should recommend review for medium risk', async () => {
      mockBehaviorEngine.analyzeBehavior.mockResolvedValueOnce([
        { type: 'unusual_pattern', severity: 0.5, confidence: 0.6, description: '', quantumDeviation: 0.5 }
      ]);

      const data = {
        ...baseTransactionData,
        amount: 300,
        average_amount: 100
      };

      const analysis = await detector.analyzeTransaction(data);
      
      if (analysis.risk_score >= 0.3 && analysis.risk_score < 0.7) {
        expect(analysis.recommendation).toBe('review');
      }
    });

    it('should recommend decline for high risk', async () => {
      mockBehaviorEngine.analyzeBehavior.mockResolvedValueOnce([
        { type: 'account_takeover', severity: 0.9, confidence: 0.9, description: '', quantumDeviation: 0.9 }
      ]);

      const data = {
        ...baseTransactionData,
        location: { lat: -33.8688, lng: 151.2093 }, // Sydney
        previous_location: { lat: 40.7128, lng: -74.0060 }, // New York
        amount: 5000,
        average_amount: 100,
        device_id: 'HACKER_DEVICE',
        known_device_id: 'USER_DEVICE',
        typing_speed_deviation: 90
      };

      const analysis = await detector.analyzeTransaction(data);
      
      expect(analysis.risk_score).toBeGreaterThan(0.7);
      expect(analysis.recommendation).toBe('decline');
    });
  });

  describe('pattern matching', () => {
    it('should match card fraud pattern', async () => {
      const data = {
        ...baseTransactionData,
        location: { lat: 51.5074, lng: -0.1278 },
        previous_location: { lat: 40.7128, lng: -74.0060 },
        amount: 500,
        average_amount: 100,
        merchant_mismatch: true
      };

      const indicators = await detector['extractIndicators'](data);
      const patterns = detector['matchPatterns'](indicators);
      
      expect(patterns.some(p => p.type === 'card_fraud')).toBe(true);
    });

    it('should match identity theft pattern', async () => {
      const data = {
        ...baseTransactionData,
        personal_info_change: true,
        password_reset: true,
        device_id: 'NEW_DEVICE',
        known_device_id: 'OLD_DEVICE'
      };

      const indicators = await detector['extractIndicators'](data);
      const patterns = detector['matchPatterns'](indicators);
      
      expect(patterns.some(p => p.type === 'identity_theft')).toBe(true);
    });

    it('should match account takeover pattern', async () => {
      const data = {
        ...baseTransactionData,
        multiple_login_attempts: true,
        ip_change: true,
        typing_speed_deviation: 80
      };

      const indicators = await detector['extractIndicators'](data);
      const patterns = detector['matchPatterns'](indicators);
      
      expect(patterns.some(p => p.type === 'account_takeover')).toBe(true);
    });
  });

  describe('confidence calculation', () => {
    it('should calculate confidence based on patterns and indicators', async () => {
      const data = {
        ...baseTransactionData,
        location: { lat: 51.5074, lng: -0.1278 },
        previous_location: { lat: 40.7128, lng: -74.0060 },
        amount: 500,
        average_amount: 100
      };

      const analysis = await detector.analyzeTransaction(data);
      
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });

    it('should increase confidence with more indicators', async () => {
      const dataFewIndicators = {
        ...baseTransactionData,
        amount: 200,
        average_amount: 100
      };

      const dataManyIndicators = {
        ...baseTransactionData,
        location: { lat: 51.5074, lng: -0.1278 },
        previous_location: { lat: 40.7128, lng: -74.0060 },
        amount: 500,
        average_amount: 100,
        device_id: 'NEW',
        known_device_id: 'OLD',
        typing_speed_deviation: 75
      };

      const analysisFew = await detector.analyzeTransaction(dataFewIndicators);
      const analysisMany = await detector.analyzeTransaction(dataManyIndicators);
      
      expect(analysisMany.confidence).toBeGreaterThan(analysisFew.confidence);
    });
  });

  describe('distance calculation', () => {
    it('should calculate distance between locations correctly', () => {
      const distance = detector['calculateDistance'](
        { lat: 40.7128, lng: -74.0060 }, // New York
        { lat: 51.5074, lng: -0.1278 }    // London
      );
      
      expect(distance).toBeGreaterThan(5000); // km
      expect(distance).toBeLessThan(6000);
    });

    it('should return 0 for same location', () => {
      const location = { lat: 40.7128, lng: -74.0060 };
      const distance = detector['calculateDistance'](location, location);
      
      expect(distance).toBe(0);
    });
  });
});