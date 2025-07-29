import { AMLScanner } from '../../financial/AMLScanner';
import { Logger } from 'winston';
import { getDatabase } from '../../utils/database';

jest.mock('../../utils/database');

describe('AMLScanner', () => {
  let scanner: AMLScanner;
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

    (getDatabase as jest.Mock).mockResolvedValue(mockDb);

    scanner = new AMLScanner(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scanTransaction()', () => {
    const baseTransaction = {
      id: 'tx-123',
      from_account: 'ACC001',
      to_account: 'ACC002',
      amount: 5000,
      currency: 'USD',
      timestamp: new Date()
    };

    it('should return empty array for normal transactions', async () => {
      const alerts = await scanner.scanTransaction(baseTransaction);
      
      expect(alerts).toBeInstanceOf(Array);
      expect(alerts.length).toBe(0);
    });

    it('should detect structuring pattern', async () => {
      // Mock database to return multiple transactions just below threshold
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: 4, total: 38000 }]
      });

      const transaction = {
        ...baseTransaction,
        amount: 9500
      };

      const alerts = await scanner.scanTransaction(transaction);
      
      const structuringAlert = alerts.find(a => a.type === 'structuring');
      expect(structuringAlert).toBeDefined();
      expect(structuringAlert?.severity).toBe('high');
      expect(structuringAlert?.risk_score).toBe(0.85);
    });

    it('should detect high velocity transactions', async () => {
      // Mock high transaction count
      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // structuring check
        .mockResolvedValueOnce({ rows: [{ count: 25 }] }); // velocity check

      const alerts = await scanner.scanTransaction(baseTransaction);
      
      const velocityAlert = alerts.find(a => a.type === 'high_velocity');
      expect(velocityAlert).toBeDefined();
      expect(velocityAlert?.severity).toBe('medium');
    });

    it('should detect layering pattern', async () => {
      const transaction = {
        ...baseTransaction,
        metadata: { hop_count: 7 }
      };

      const alerts = await scanner.scanTransaction(transaction);
      
      const layeringAlert = alerts.find(a => a.type === 'layering');
      expect(layeringAlert).toBeDefined();
      expect(layeringAlert?.severity).toBe('high');
    });

    it('should calculate risk score based on multiple factors', async () => {
      const transaction = {
        ...baseTransaction,
        amount: 75000,
        currency: 'XMR', // Privacy coin
        timestamp: new Date('2024-01-01T03:00:00') // Odd hour
      };

      const alerts = await scanner.scanTransaction(transaction);
      
      const riskAlert = alerts.find(a => a.type === 'risk_threshold');
      expect(riskAlert).toBeDefined();
      expect(riskAlert?.risk_score).toBeGreaterThan(0.5);
    });

    it('should emit aml_alert events', async () => {
      const mockEmit = jest.spyOn(scanner, 'emit');
      
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: 5, total: 45000 }]
      });

      const transaction = {
        ...baseTransaction,
        amount: 9800
      };

      await scanner.scanTransaction(transaction);
      
      expect(mockEmit).toHaveBeenCalledWith('aml_alert', expect.any(Object));
    });

    it('should handle multiple alerts for single transaction', async () => {
      // Setup for multiple alerts
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ count: 4, total: 38000 }] }) // structuring
        .mockResolvedValueOnce({ rows: [{ count: 25 }] }); // velocity

      const transaction = {
        ...baseTransaction,
        amount: 9500,
        currency: 'XMR',
        metadata: { hop_count: 6 }
      };

      const alerts = await scanner.scanTransaction(transaction);
      
      expect(alerts.length).toBeGreaterThanOrEqual(3);
      expect(alerts.some(a => a.type === 'structuring')).toBe(true);
      expect(alerts.some(a => a.type === 'high_velocity')).toBe(true);
      expect(alerts.some(a => a.type === 'layering')).toBe(true);
    });
  });

  describe('risk scoring', () => {
    it('should assign correct severity levels', async () => {
      const testCases = [
        { amount: 150000, expectedSeverity: 'high' },
        { amount: 60000, expectedSeverity: 'medium' },
        { amount: 20000, expectedSeverity: 'low' }
      ];

      for (const testCase of testCases) {
        const transaction = {
          id: `tx-${testCase.amount}`,
          from_account: 'ACC001',
          to_account: 'ACC002',
          amount: testCase.amount,
          currency: 'USD',
          timestamp: new Date()
        };

        const alerts = await scanner.scanTransaction(transaction);
        const riskAlert = alerts.find(a => a.type === 'risk_threshold');
        
        if (riskAlert) {
          expect(riskAlert.severity).toBe(testCase.expectedSeverity);
        }
      }
    });

    it('should increase risk for privacy coins', async () => {
      const regularTransaction = {
        id: 'tx-regular',
        from_account: 'ACC001',
        to_account: 'ACC002',
        amount: 50000,
        currency: 'USD',
        timestamp: new Date()
      };

      const privacyTransaction = {
        ...regularTransaction,
        id: 'tx-privacy',
        currency: 'XMR'
      };

      const regularAlerts = await scanner.scanTransaction(regularTransaction);
      const privacyAlerts = await scanner.scanTransaction(privacyTransaction);

      const regularRisk = regularAlerts.find(a => a.type === 'risk_threshold')?.risk_score || 0;
      const privacyRisk = privacyAlerts.find(a => a.type === 'risk_threshold')?.risk_score || 0;

      expect(privacyRisk).toBeGreaterThan(regularRisk);
    });

    it('should consider transaction timing in risk calculation', async () => {
      const dayTransaction = {
        id: 'tx-day',
        from_account: 'ACC001',
        to_account: 'ACC002',
        amount: 50000,
        currency: 'USD',
        timestamp: new Date('2024-01-01T14:00:00')
      };

      const nightTransaction = {
        ...dayTransaction,
        id: 'tx-night',
        timestamp: new Date('2024-01-01T03:00:00')
      };

      const dayAlerts = await scanner.scanTransaction(dayTransaction);
      const nightAlerts = await scanner.scanTransaction(nightTransaction);

      const dayRisk = dayAlerts.find(a => a.type === 'risk_threshold')?.risk_score || 0;
      const nightRisk = nightAlerts.find(a => a.type === 'risk_threshold')?.risk_score || 0;

      expect(nightRisk).toBeGreaterThan(dayRisk);
    });
  });

  describe('alert generation', () => {
    it('should generate unique alert IDs', async () => {
      const transaction = {
        id: 'tx-test',
        from_account: 'ACC001',
        to_account: 'ACC002',
        amount: 100000,
        currency: 'USD',
        timestamp: new Date()
      };

      const alerts1 = await scanner.scanTransaction(transaction);
      const alerts2 = await scanner.scanTransaction(transaction);

      if (alerts1.length > 0 && alerts2.length > 0) {
        expect(alerts1[0].id).not.toBe(alerts2[0].id);
      }
    });

    it('should include transaction ID in alerts', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: 4, total: 38000 }]
      });

      const transaction = {
        id: 'tx-specific-123',
        from_account: 'ACC001',
        to_account: 'ACC002',
        amount: 9500,
        currency: 'USD',
        timestamp: new Date()
      };

      const alerts = await scanner.scanTransaction(transaction);
      
      alerts.forEach(alert => {
        expect(alert.transaction_ids).toContain('tx-specific-123');
      });
    });

    it('should include timestamp in all alerts', async () => {
      const transaction = {
        id: 'tx-time',
        from_account: 'ACC001',
        to_account: 'ACC002',
        amount: 100000,
        currency: 'XMR',
        timestamp: new Date()
      };

      const alerts = await scanner.scanTransaction(transaction);
      
      alerts.forEach(alert => {
        expect(alert.timestamp).toBeInstanceOf(Date);
        expect(alert.timestamp.getTime()).toBeCloseTo(Date.now(), -2);
      });
    });
  });
});