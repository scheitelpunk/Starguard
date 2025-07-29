import { SignalCollector } from './SignalCollector';
import { ISignal } from '@starguard/shared';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';

interface NetworkMetrics {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  errors: number;
  dropped: number;
}

export class NetworkSignalCollector extends SignalCollector {
  private previousMetrics: Map<string, NetworkMetrics> = new Map();
  private portScans: Map<string, number> = new Map();
  private connectionAttempts: Map<string, number> = new Map();
  private suspiciousPatterns: Set<string> = new Set();
  
  constructor(consciousness: any, io: any, logger: any) {
    super('network', consciousness, io, logger);
    this.initializeSuspiciousPatterns();
  }
  
  protected async initialize(): Promise<void> {
    this.logger.info('Initializing NetworkSignalCollector');
    
    // Initialize network interface monitoring
    const interfaces = os.networkInterfaces();
    for (const [name, iface] of Object.entries(interfaces)) {
      if (iface) {
        this.logger.debug(`Monitoring network interface: ${name}`);
      }
    }
    
    // Reset counters
    this.portScans.clear();
    this.connectionAttempts.clear();
  }
  
  protected async cleanup(): Promise<void> {
    this.logger.info('Cleaning up NetworkSignalCollector');
    this.previousMetrics.clear();
    this.portScans.clear();
    this.connectionAttempts.clear();
  }
  
  protected async performCalibration(params: any): Promise<void> {
    if (params.suspiciousPatterns) {
      params.suspiciousPatterns.forEach((pattern: string) => {
        this.suspiciousPatterns.add(pattern);
      });
    }
    
    if (params.resetBaseline) {
      this.previousMetrics.clear();
      this.logger.info('Network baseline reset');
    }
  }
  
  async collect(): Promise<ISignal[]> {
    const signals: ISignal[] = [];
    
    // Collect network interface metrics
    const interfaceSignals = await this.collectInterfaceMetrics();
    signals.push(...interfaceSignals);
    
    // Simulate port scan detection
    const portScanSignals = this.detectPortScans();
    signals.push(...portScanSignals);
    
    // Simulate connection anomaly detection
    const connectionSignals = this.detectConnectionAnomalies();
    signals.push(...connectionSignals);
    
    // Simulate packet analysis
    const packetSignals = this.analyzePacketPatterns();
    signals.push(...packetSignals);
    
    return signals;
  }
  
  private async collectInterfaceMetrics(): Promise<ISignal[]> {
    const signals: ISignal[] = [];
    const interfaces = os.networkInterfaces();
    
    for (const [name, iface] of Object.entries(interfaces)) {
      if (!iface || name === 'lo') continue; // Skip loopback
      
      // Simulate network metrics (in production, use actual network monitoring)
      const metrics: NetworkMetrics = {
        bytesReceived: Math.floor(Math.random() * 1000000),
        bytesSent: Math.floor(Math.random() * 1000000),
        packetsReceived: Math.floor(Math.random() * 10000),
        packetsSent: Math.floor(Math.random() * 10000),
        errors: Math.floor(Math.random() * 10),
        dropped: Math.floor(Math.random() * 5)
      };
      
      const previous = this.previousMetrics.get(name);
      if (previous) {
        // Calculate deltas
        const bytesReceivedDelta = metrics.bytesReceived - previous.bytesReceived;
        const bytesSentDelta = metrics.bytesSent - previous.bytesSent;
        
        // Check for anomalies
        if (bytesReceivedDelta > 5000000) { // 5MB spike
          signals.push({
            id: uuidv4(),
            timestamp: new Date(),
            source: `network:${name}`,
            type: 'network',
            strength: Math.min(1, bytesReceivedDelta / 10000000),
            data: {
              interface: name,
              metric: 'bytes_received_spike',
              delta: bytesReceivedDelta,
              current: metrics.bytesReceived
            }
          });
        }
        
        if (metrics.errors > previous.errors * 2 && metrics.errors > 10) {
          signals.push({
            id: uuidv4(),
            timestamp: new Date(),
            source: `network:${name}`,
            type: 'network',
            strength: Math.min(1, metrics.errors / 100),
            data: {
              interface: name,
              metric: 'error_rate_increase',
              errors: metrics.errors,
              previous: previous.errors
            }
          });
        }
      }
      
      this.previousMetrics.set(name, metrics);
    }
    
    return signals;
  }
  
  private detectPortScans(): ISignal[] {
    const signals: ISignal[] = [];
    
    // Simulate port scan detection
    const scanProbability = 0.05;
    if (Math.random() < scanProbability) {
      const sourceIp = this.generateRandomIp();
      const scannedPorts = Math.floor(Math.random() * 1000) + 100;
      
      this.portScans.set(sourceIp, (this.portScans.get(sourceIp) || 0) + scannedPorts);
      
      signals.push({
        id: uuidv4(),
        timestamp: new Date(),
        source: 'network:port_scanner',
        type: 'network',
        strength: Math.min(1, scannedPorts / 1000),
        data: {
          attack_type: 'port_scan',
          source_ip: sourceIp,
          ports_scanned: scannedPorts,
          total_from_source: this.portScans.get(sourceIp)
        }
      });
    }
    
    return signals;
  }
  
  private detectConnectionAnomalies(): ISignal[] {
    const signals: ISignal[] = [];
    
    // Simulate connection anomalies
    const anomalyTypes = [
      { type: 'syn_flood', probability: 0.02, strength: 0.8 },
      { type: 'unusual_protocol', probability: 0.03, strength: 0.6 },
      { type: 'malformed_packet', probability: 0.01, strength: 0.9 },
      { type: 'suspicious_payload', probability: 0.04, strength: 0.7 }
    ];
    
    for (const anomaly of anomalyTypes) {
      if (Math.random() < anomaly.probability) {
        const sourceIp = this.generateRandomIp();
        
        signals.push({
          id: uuidv4(),
          timestamp: new Date(),
          source: 'network:anomaly_detector',
          type: 'network',
          strength: anomaly.strength,
          data: {
            anomaly_type: anomaly.type,
            source_ip: sourceIp,
            destination_port: Math.floor(Math.random() * 65535),
            protocol: ['TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 3)]
          }
        });
      }
    }
    
    return signals;
  }
  
  private analyzePacketPatterns(): ISignal[] {
    const signals: ISignal[] = [];
    
    // Check for known malicious patterns
    const patternCheckProbability = 0.1;
    if (Math.random() < patternCheckProbability) {
      const patterns = Array.from(this.suspiciousPatterns);
      if (patterns.length > 0) {
        const detectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        signals.push({
          id: uuidv4(),
          timestamp: new Date(),
          source: 'network:pattern_analyzer',
          type: 'network',
          strength: 0.85,
          data: {
            pattern_type: 'malicious_signature',
            pattern: detectedPattern,
            confidence: Math.random() * 0.3 + 0.7,
            packet_count: Math.floor(Math.random() * 100) + 1
          }
        });
      }
    }
    
    // Detect data exfiltration patterns
    if (Math.random() < 0.02) {
      signals.push({
        id: uuidv4(),
        timestamp: new Date(),
        source: 'network:exfiltration_detector',
        type: 'network',
        strength: 0.75,
        data: {
          pattern_type: 'data_exfiltration',
          destination: this.generateRandomIp(),
          data_volume: Math.floor(Math.random() * 1000000) + 100000,
          encryption_detected: Math.random() > 0.5,
          protocol: 'HTTPS'
        }
      });
    }
    
    return signals;
  }
  
  private initializeSuspiciousPatterns(): void {
    // Initialize with known malicious patterns
    this.suspiciousPatterns.add('shellcode_x86');
    this.suspiciousPatterns.add('sql_injection');
    this.suspiciousPatterns.add('xss_payload');
    this.suspiciousPatterns.add('buffer_overflow');
    this.suspiciousPatterns.add('command_injection');
    this.suspiciousPatterns.add('directory_traversal');
    this.suspiciousPatterns.add('malware_signature');
    this.suspiciousPatterns.add('cryptominer_pattern');
  }
  
  private generateRandomIp(): string {
    const octets = [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256)
    ];
    return octets.join('.');
  }
}