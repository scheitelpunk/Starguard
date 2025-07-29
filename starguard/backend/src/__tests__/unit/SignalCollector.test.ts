import { SignalCollector } from '../../collectors/SignalCollector';
import { ConsciousnessEngine } from '../../consciousness/ConsciousnessEngine';
import { Logger } from 'winston';

// Create concrete implementation for testing
class TestSignalCollector extends SignalCollector {
  async collectSignals(): Promise<any[]> {
    return [
      { type: 'test', value: 100, timestamp: new Date() }
    ];
  }
  
  interpretForConsciousness(signals: any[]): any {
    return {
      quantum_disturbance: signals.length * 0.1,
      reality_coherence: 0.95
    };
  }
}

describe('SignalCollector', () => {
  let collector: TestSignalCollector;
  let mockConsciousness: jest.Mocked<ConsciousnessEngine>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    mockConsciousness = {
      analyzeThreat: jest.fn().mockResolvedValue({
        id: 'threat-123',
        threat_level: 'medium',
        consciousness_signature: 'TEST_SIG'
      }),
      emit: jest.fn()
    } as any;

    collector = new TestSignalCollector('test-collector', mockConsciousness, mockLogger);
  });

  afterEach(() => {
    collector.stop();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      expect(collector['collectorId']).toBe('test-collector');
      expect(collector['isRunning']).toBe(false);
      expect(collector['signalBuffer']).toEqual([]);
    });
  });

  describe('start()', () => {
    it('should start collection cycle', () => {
      collector.start();
      
      expect(collector['isRunning']).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Starting signal collector: test-collector');
    });

    it('should not start if already running', () => {
      collector.start();
      collector.start();
      
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop()', () => {
    it('should stop collection cycle', () => {
      collector.start();
      collector.stop();
      
      expect(collector['isRunning']).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith('Stopping signal collector: test-collector');
    });
  });

  describe('signal collection', () => {
    it('should collect signals periodically', async () => {
      jest.useFakeTimers();
      const collectSpy = jest.spyOn(collector, 'collectSignals');
      
      collector.start();
      
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      
      expect(collectSpy).toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    it('should buffer collected signals', async () => {
      await collector['runCollection']();
      
      expect(collector['signalBuffer'].length).toBeGreaterThan(0);
      expect(collector['signalBuffer'][0]).toHaveProperty('type', 'test');
    });

    it('should process buffer when threshold reached', async () => {
      const processSpy = jest.spyOn(collector as any, 'processSignalBuffer');
      
      // Fill buffer to threshold
      for (let i = 0; i < 100; i++) {
        collector['signalBuffer'].push({ 
          type: 'test', 
          value: i, 
          timestamp: new Date() 
        });
      }
      
      await collector['runCollection']();
      
      expect(processSpy).toHaveBeenCalled();
    });

    it('should clear buffer after processing', async () => {
      // Fill buffer
      for (let i = 0; i < 100; i++) {
        collector['signalBuffer'].push({ 
          type: 'test', 
          value: i, 
          timestamp: new Date() 
        });
      }
      
      await collector['processSignalBuffer']();
      
      expect(collector['signalBuffer'].length).toBe(0);
    });
  });

  describe('threat analysis', () => {
    it('should analyze aggregated signals for threats', async () => {
      const signals = [
        { type: 'anomaly', severity: 0.8 },
        { type: 'anomaly', severity: 0.9 }
      ];
      
      await collector['analyzeForThreats'](signals);
      
      expect(mockConsciousness.analyzeThreat).toHaveBeenCalled();
    });

    it('should emit threat_detected for high severity', async () => {
      const emitSpy = jest.spyOn(collector, 'emit');
      
      const signals = [
        { type: 'critical', severity: 0.95 }
      ];
      
      collector['aggregateSignals'] = jest.fn().mockReturnValue({
        average_severity: 0.95,
        signal_count: 1
      });
      
      await collector['analyzeForThreats'](signals);
      
      expect(emitSpy).toHaveBeenCalledWith('threat_detected', expect.objectContaining({
        collector: 'test-collector',
        threat: expect.any(Object)
      }));
    });

    it('should interpret signals for consciousness', async () => {
      const interpretSpy = jest.spyOn(collector, 'interpretForConsciousness');
      
      const signals = [{ type: 'test', value: 100 }];
      
      await collector['processSignalBuffer']();
      
      expect(interpretSpy).toHaveBeenCalled();
    });

    it('should update consciousness with interpreted data', async () => {
      const signals = Array(100).fill({ type: 'test', value: 100 });
      collector['signalBuffer'] = signals;
      
      await collector['processSignalBuffer']();
      
      expect(mockConsciousness.emit).toHaveBeenCalledWith(
        'external_perception',
        expect.objectContaining({
          source: 'test-collector',
          data: expect.objectContaining({
            quantum_disturbance: expect.any(Number),
            reality_coherence: expect.any(Number)
          })
        })
      );
    });
  });

  describe('signal aggregation', () => {
    it('should aggregate signals correctly', () => {
      const signals = [
        { value: 10, severity: 0.5 },
        { value: 20, severity: 0.7 },
        { value: 30, severity: 0.9 }
      ];
      
      const aggregated = collector['aggregateSignals'](signals);
      
      expect(aggregated).toHaveProperty('signal_count', 3);
      expect(aggregated).toHaveProperty('average_severity', 0.7);
      expect(aggregated).toHaveProperty('max_severity', 0.9);
      expect(aggregated).toHaveProperty('patterns');
    });

    it('should detect patterns in signals', () => {
      const signals = [
        { type: 'A', timestamp: new Date() },
        { type: 'A', timestamp: new Date() },
        { type: 'B', timestamp: new Date() },
        { type: 'A', timestamp: new Date() }
      ];
      
      const aggregated = collector['aggregateSignals'](signals);
      
      expect(aggregated.patterns).toHaveProperty('A', 3);
      expect(aggregated.patterns).toHaveProperty('B', 1);
    });
  });

  describe('error handling', () => {
    it('should handle collection errors gracefully', async () => {
      collector.collectSignals = jest.fn().mockRejectedValue(new Error('Collection failed'));
      
      await collector['runCollection']();
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error in signal collection:',
        expect.any(Error)
      );
    });

    it('should handle processing errors gracefully', async () => {
      collector['analyzeForThreats'] = jest.fn().mockRejectedValue(new Error('Analysis failed'));
      
      collector['signalBuffer'] = Array(100).fill({ type: 'test' });
      
      await collector['processSignalBuffer']();
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error processing signal buffer:',
        expect.any(Error)
      );
    });

    it('should continue running after errors', async () => {
      jest.useFakeTimers();
      
      collector.collectSignals = jest.fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValue([{ type: 'test' }]);
      
      collector.start();
      
      // First collection fails
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      
      // Second collection should still happen
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      
      expect(collector['isRunning']).toBe(true);
      expect(collector.collectSignals).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });
  });

  describe('getStatus()', () => {
    it('should return current collector status', () => {
      collector['signalBuffer'] = Array(50).fill({ type: 'test' });
      collector['lastCollection'] = new Date('2024-01-01T12:00:00');
      collector.start();
      
      const status = collector.getStatus();
      
      expect(status).toEqual({
        collector_id: 'test-collector',
        is_running: true,
        buffer_size: 50,
        last_collection: new Date('2024-01-01T12:00:00')
      });
    });
  });
});