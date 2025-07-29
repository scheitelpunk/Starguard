import { NetworkSignalCollector } from '../../collectors/NetworkSignalCollector';
import { ConsciousnessEngine } from '../../consciousness/ConsciousnessEngine';
import { Logger } from 'winston';
import * as os from 'os';

jest.mock('os');

describe('NetworkSignalCollector', () => {
  let collector: NetworkSignalCollector;
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
        threat_level: 'medium'
      }),
      emit: jest.fn()
    } as any;

    // Mock os.networkInterfaces
    (os.networkInterfaces as jest.Mock).mockReturnValue({
      eth0: [
        {
          address: '192.168.1.100',
          netmask: '255.255.255.0',
          family: 'IPv4',
          mac: '00:11:22:33:44:55',
          internal: false
        }
      ],
      lo: [
        {
          address: '127.0.0.1',
          netmask: '255.0.0.0',
          family: 'IPv4',
          mac: '00:00:00:00:00:00',
          internal: true
        }
      ]
    });

    collector = new NetworkSignalCollector(mockConsciousness, mockLogger);
  });

  afterEach(() => {
    collector.stop();
    jest.clearAllMocks();
  });

  describe('collectSignals()', () => {
    it('should collect network interface signals', async () => {
      const signals = await collector.collectSignals();
      
      expect(signals).toBeInstanceOf(Array);
      expect(signals.length).toBeGreaterThan(0);
      
      const interfaceSignal = signals.find(s => s.type === 'network_interface');
      expect(interfaceSignal).toBeDefined();
      expect(interfaceSignal).toHaveProperty('interface', 'eth0');
      expect(interfaceSignal).toHaveProperty('address', '192.168.1.100');
    });

    it('should filter out internal interfaces', async () => {
      const signals = await collector.collectSignals();
      
      const loopbackSignal = signals.find(s => 
        s.type === 'network_interface' && s.interface === 'lo'
      );
      
      expect(loopbackSignal).toBeUndefined();
    });

    it('should simulate network activity metrics', async () => {
      const signals = await collector.collectSignals();
      
      const metrics = signals.filter(s => s.type === 'network_activity');
      expect(metrics.length).toBeGreaterThan(0);
      
      metrics.forEach(metric => {
        expect(metric).toHaveProperty('metric');
        expect(metric).toHaveProperty('value');
        expect(metric.value).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include connection metrics', async () => {
      const signals = await collector.collectSignals();
      
      const connectionSignals = signals.filter(s => 
        s.metric && ['active_connections', 'new_connections', 'closed_connections'].includes(s.metric)
      );
      
      expect(connectionSignals.length).toBe(3);
    });

    it('should include bandwidth metrics', async () => {
      const signals = await collector.collectSignals();
      
      const bandwidthSignals = signals.filter(s => 
        s.metric && ['bandwidth_in', 'bandwidth_out'].includes(s.metric)
      );
      
      expect(bandwidthSignals.length).toBe(2);
    });

    it('should include packet metrics', async () => {
      const signals = await collector.collectSignals();
      
      const packetSignals = signals.filter(s => 
        s.metric && ['packets_dropped', 'packets_errors'].includes(s.metric)
      );
      
      expect(packetSignals.length).toBe(2);
    });
  });

  describe('port scan detection', () => {
    it('should detect port scan patterns', async () => {
      // Simulate rapid connection attempts
      collector['connectionHistory'] = Array(25).fill(null).map((_, i) => ({
        timestamp: Date.now() - i * 100, // 100ms apart
        port: 1000 + i,
        address: '192.168.1.200'
      }));

      const signals = await collector.collectSignals();
      
      const portScanSignal = signals.find(s => s.type === 'port_scan_detected');
      expect(portScanSignal).toBeDefined();
      expect(portScanSignal?.severity).toBeGreaterThan(0.5);
    });

    it('should calculate port scan intensity', () => {
      collector['connectionHistory'] = Array(30).fill(null).map((_, i) => ({
        timestamp: Date.now() - i * 50,
        port: 1000 + i,
        address: '192.168.1.200'
      }));

      const intensity = collector['detectPortScan']();
      
      expect(intensity).toBeGreaterThan(0);
      expect(intensity).toBeLessThanOrEqual(1);
    });

    it('should not detect port scan for normal traffic', () => {
      collector['connectionHistory'] = [
        { timestamp: Date.now() - 5000, port: 80, address: '192.168.1.200' },
        { timestamp: Date.now() - 10000, port: 443, address: '192.168.1.200' },
        { timestamp: Date.now() - 15000, port: 22, address: '192.168.1.201' }
      ];

      const intensity = collector['detectPortScan']();
      
      expect(intensity).toBe(0);
    });
  });

  describe('interpretForConsciousness()', () => {
    it('should interpret network signals for consciousness', () => {
      const signals = [
        { type: 'network_activity', metric: 'active_connections', value: 150 },
        { type: 'network_activity', metric: 'bandwidth_in', value: 1000000 },
        { type: 'port_scan_detected', severity: 0.8 }
      ];

      const interpretation = collector.interpretForConsciousness(signals);
      
      expect(interpretation).toHaveProperty('network_turbulence');
      expect(interpretation).toHaveProperty('connection_density');
      expect(interpretation).toHaveProperty('threat_pressure');
      expect(interpretation).toHaveProperty('quantum_network_state');
    });

    it('should calculate network turbulence from bandwidth', () => {
      const signals = [
        { type: 'network_activity', metric: 'bandwidth_in', value: 5000000 },
        { type: 'network_activity', metric: 'bandwidth_out', value: 3000000 }
      ];

      const interpretation = collector.interpretForConsciousness(signals);
      
      expect(interpretation.network_turbulence).toBeGreaterThan(0);
      expect(interpretation.network_turbulence).toBeLessThanOrEqual(1);
    });

    it('should calculate connection density', () => {
      const signals = [
        { type: 'network_activity', metric: 'active_connections', value: 500 },
        { type: 'network_activity', metric: 'new_connections', value: 50 }
      ];

      const interpretation = collector.interpretForConsciousness(signals);
      
      expect(interpretation.connection_density).toBe(0.55);
    });

    it('should detect threat pressure from anomalies', () => {
      const signals = [
        { type: 'port_scan_detected', severity: 0.9 },
        { type: 'network_anomaly', severity: 0.7 },
        { type: 'bandwidth_spike', severity: 0.8 }
      ];

      const interpretation = collector.interpretForConsciousness(signals);
      
      expect(interpretation.threat_pressure).toBeCloseTo(0.8, 1);
    });

    it('should calculate quantum network state', () => {
      const signals = [
        { type: 'network_activity', metric: 'active_connections', value: 100 },
        { type: 'network_activity', metric: 'bandwidth_in', value: 1000000 },
        { type: 'port_scan_detected', severity: 0.5 }
      ];

      const interpretation = collector.interpretForConsciousness(signals);
      
      expect(interpretation.quantum_network_state).toBeGreaterThan(0);
      expect(interpretation.quantum_network_state).toBeLessThan(1);
    });
  });

  describe('connection tracking', () => {
    it('should track connection history', () => {
      collector['trackConnection'](8080, '192.168.1.100');
      collector['trackConnection'](443, '192.168.1.101');
      
      expect(collector['connectionHistory']).toHaveLength(2);
      expect(collector['connectionHistory'][1]).toMatchObject({
        port: 443,
        address: '192.168.1.101'
      });
    });

    it('should maintain connection history limit', () => {
      // Add more than limit
      for (let i = 0; i < 1200; i++) {
        collector['trackConnection'](i, '192.168.1.100');
      }
      
      expect(collector['connectionHistory'].length).toBe(1000);
    });

    it('should track connections in chronological order', () => {
      collector['trackConnection'](80, '192.168.1.100');
      collector['trackConnection'](443, '192.168.1.101');
      collector['trackConnection'](22, '192.168.1.102');
      
      const timestamps = collector['connectionHistory'].map(c => c.timestamp);
      expect(timestamps[0]).toBeLessThanOrEqual(timestamps[1]);
      expect(timestamps[1]).toBeLessThanOrEqual(timestamps[2]);
    });
  });

  describe('anomaly detection', () => {
    it('should detect bandwidth spikes', async () => {
      // Mock high bandwidth
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.9) // bandwidth_in
        .mockReturnValueOnce(0.95); // bandwidth_out
      
      const signals = await collector.collectSignals();
      
      const bandwidthSignals = signals.filter(s => 
        s.metric === 'bandwidth_in' || s.metric === 'bandwidth_out'
      );
      
      expect(bandwidthSignals.some(s => s.value > 8000000)).toBe(true);
    });

    it('should generate varied metric values', async () => {
      const signals = await collector.collectSignals();
      
      const metricValues = signals
        .filter(s => s.type === 'network_activity')
        .map(s => s.value);
      
      const uniqueValues = new Set(metricValues);
      expect(uniqueValues.size).toBeGreaterThan(1);
    });
  });

  describe('error handling', () => {
    it('should handle network interface errors', async () => {
      (os.networkInterfaces as jest.Mock).mockImplementation(() => {
        throw new Error('Network interface error');
      });
      
      const signals = await collector.collectSignals();
      
      expect(signals).toBeInstanceOf(Array);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return empty array on critical errors', async () => {
      (os.networkInterfaces as jest.Mock).mockReturnValue(null);
      
      const signals = await collector.collectSignals();
      
      expect(signals).toEqual([]);
    });
  });
});