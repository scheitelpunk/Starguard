import { EventEmitter } from 'events';
import * as net from 'net';
import * as dgram from 'dgram';
import { createSocket } from 'dgram';
import * as winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { EntropyCalculator } from '../utils/entropy';
import { TimingAnalyzer } from '../utils/timing';
import { NetworkPacket, ThreatProbability, AgentState } from '../types';

/**
 * NullstelleObserver - Advanced network traffic analysis agent
 * Monitors network patterns, calculates entropy, and detects anomalies
 */
export class NullstelleObserver extends EventEmitter {
  private readonly logger: winston.Logger;
  private readonly agentId: string;
  private readonly config: {
    interface: string;
    captureSize: number;
    entropyThreshold: number;
    timingThreshold: number;
    analysisWindow: number;
    alertThreshold: number;
  };

  private isActive: boolean = false;
  private packetBuffer: NetworkPacket[] = [];
  private threatHistory: ThreatProbability[] = [];
  private performanceMetrics: {
    packetsProcessed: number;
    threatsDetected: number;
    falsePositives: number;
    averageResponseTime: number;
    lastUpdate: number;
  };

  private networkSockets: Map<string, net.Socket | dgram.Socket> = new Map();
  private monitoringIntervals: NodeJS.Timeout[] = [];

  constructor(config?: Partial<NullstelleObserver['config']>) {
    super();
    
    this.agentId = uuidv4();
    this.config = {
      interface: 'any',
      captureSize: 65535,
      entropyThreshold: 6.0,
      timingThreshold: 2.5,
      analysisWindow: 100,
      alertThreshold: 0.7,
      ...config
    };

    this.performanceMetrics = {
      packetsProcessed: 0,
      threatsDetected: 0,
      falsePositives: 0,
      averageResponseTime: 0,
      lastUpdate: Date.now()
    };

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'nullstelle-observer', agentId: this.agentId },
      transports: [
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });

    this.setupSignalHandlers();
  }

  /**
   * Start network monitoring and analysis
   */
  async start(): Promise<void> {
    try {
      this.isActive = true;
      this.logger.info('Starting NullstelleObserver', { agentId: this.agentId });

      // Initialize network monitoring
      await this.initializeNetworkMonitoring();
      
      // Start analysis routines
      this.startAnalysisRoutines();
      
      // Emit startup event
      this.emit('started', { agentId: this.agentId, timestamp: Date.now() });
      
    } catch (error) {
      this.logger.error('Failed to start NullstelleObserver', { error, agentId: this.agentId });
      throw error;
    }
  }

  /**
   * Stop network monitoring
   */
  async stop(): Promise<void> {
    this.isActive = false;
    this.logger.info('Stopping NullstelleObserver', { agentId: this.agentId });

    // Close network sockets
    for (const [key, socket] of this.networkSockets) {
      try {
        if ('close' in socket && typeof socket.close === 'function') {
          socket.close();
        } else if ('end' in socket && typeof socket.end === 'function') {
          (socket as any).end();
        }
        this.networkSockets.delete(key);
      } catch (error) {
        this.logger.warn('Error closing socket', { key, error });
      }
    }

    // Clear monitoring intervals
    this.monitoringIntervals.forEach(interval => clearInterval(interval));
    this.monitoringIntervals = [];

    this.emit('stopped', { agentId: this.agentId, timestamp: Date.now() });
  }

  /**
   * Initialize network monitoring systems
   */
  private async initializeNetworkMonitoring(): Promise<void> {
    try {
      // Monitor TCP connections
      await this.setupTCPMonitoring();
      
      // Monitor UDP traffic
      await this.setupUDPMonitoring();
      
      // Start raw socket monitoring (requires privileges)
      await this.setupRawSocketMonitoring();
      
    } catch (error) {
      this.logger.error('Error initializing network monitoring', { error });
      // Continue with available methods
    }
  }

  /**
   * Setup TCP connection monitoring
   */
  private async setupTCPMonitoring(): Promise<void> {
    const server = net.createServer();
    
    server.on('connection', (socket) => {
      const connectionId = `tcp_${socket.remoteAddress}:${socket.remotePort}`;
      this.networkSockets.set(connectionId, socket);
      
      socket.on('data', (data) => {
        this.processNetworkData(data, {
          sourceIP: socket.remoteAddress || 'unknown',
          destinationIP: socket.localAddress || 'unknown',
          sourcePort: socket.remotePort || 0,
          destinationPort: socket.localPort || 0,
          protocol: 'TCP'
        });
      });

      socket.on('close', () => {
        this.networkSockets.delete(connectionId);
      });
    });

    // Listen on a monitoring port for TCP analysis
    server.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        this.logger.info('TCP monitoring started', { port: address.port });
      }
    });
  }

  /**
   * Setup UDP traffic monitoring
   */
  private async setupUDPMonitoring(): Promise<void> {
    const udpSocket = createSocket('udp4');
    
    udpSocket.on('message', (data, rinfo) => {
      this.processNetworkData(data, {
        sourceIP: rinfo.address,
        destinationIP: 'localhost',
        sourcePort: rinfo.port,
        destinationPort: rinfo.port,
        protocol: 'UDP'
      });
    });

    udpSocket.on('error', (err) => {
      this.logger.warn('UDP monitoring error', { error: err.message });
    });

    // Bind to a monitoring port
    udpSocket.bind(0, () => {
      const address = udpSocket.address();
      this.logger.info('UDP monitoring started', { port: address.port });
    });

    this.networkSockets.set('udp_monitor', udpSocket);
  }

  /**
   * Setup raw socket monitoring (where available)
   */
  private async setupRawSocketMonitoring(): Promise<void> {
    try {
      // This would require raw-socket library and root privileges
      // For production, this should be implemented with proper network sniffing
      this.logger.info('Raw socket monitoring would require elevated privileges');
      
      // Fallback: Monitor system network statistics
      this.startNetworkStatisticsMonitoring();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn('Raw socket monitoring unavailable', { error: errorMessage });
      this.startNetworkStatisticsMonitoring();
    }
  }

  /**
   * Monitor network statistics from system
   */
  private startNetworkStatisticsMonitoring(): void {
    const interval = setInterval(() => {
      if (!this.isActive) return;
      
      // Simulate network monitoring with system statistics
      this.simulateNetworkCapture();
      
    }, 1000);

    this.monitoringIntervals.push(interval);
  }

  /**
   * Simulate network packet capture for demonstration
   * In production, this would be replaced with real packet capture
   */
  private simulateNetworkCapture(): void {
    // Generate simulated network traffic for analysis
    const simulatedPackets = this.generateSimulatedTraffic();
    
    simulatedPackets.forEach(packet => {
      this.processNetworkPacket(packet);
    });
  }

  /**
   * Generate simulated network traffic for testing
   */
  private generateSimulatedTraffic(): NetworkPacket[] {
    const packets: NetworkPacket[] = [];
    const now = Date.now();
    
    // Generate normal traffic
    for (let i = 0; i < 10; i++) {
      const packet: NetworkPacket = {
        timestamp: now + i * 100,
        sourceIP: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        destinationIP: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
        sourcePort: Math.floor(Math.random() * 65535),
        destinationPort: 80 + Math.floor(Math.random() * 1000),
        protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
        size: Math.floor(Math.random() * 1500) + 64,
        payload: Buffer.from(`Normal traffic data ${i}`)
      };
      packets.push(packet);
    }

    // Occasionally generate suspicious traffic
    if (Math.random() > 0.8) {
      const suspiciousPacket: NetworkPacket = {
        timestamp: now,
        sourceIP: '192.168.1.100',
        destinationIP: '10.0.0.1',
        sourcePort: 1337,
        destinationPort: 22,
        protocol: 'TCP',
        size: 1400,
        payload: Buffer.alloc(1400, 0xFF) // High entropy data
      };
      packets.push(suspiciousPacket);
    }

    return packets;
  }

  /**
   * Process raw network data
   */
  private processNetworkData(data: Buffer, metadata: {
    sourceIP: string;
    destinationIP: string;
    sourcePort: number;
    destinationPort: number;
    protocol: string;
  }): void {
    const packet: NetworkPacket = {
      timestamp: Date.now(),
      sourceIP: metadata.sourceIP,
      destinationIP: metadata.destinationIP,
      sourcePort: metadata.sourcePort,
      destinationPort: metadata.destinationPort,
      protocol: metadata.protocol,
      size: data.length,
      payload: data
    };

    this.processNetworkPacket(packet);
  }

  /**
   * Process individual network packet
   */
  private processNetworkPacket(packet: NetworkPacket): void {
    const startTime = process.hrtime.bigint();
    
    try {
      // Calculate Shannon entropy
      packet.entropy = EntropyCalculator.calculateShannonEntropy(packet.payload);
      
      // Add to buffer
      this.packetBuffer.push(packet);
      
      // Maintain buffer size
      if (this.packetBuffer.length > this.config.analysisWindow) {
        this.packetBuffer.shift();
      }

      // Analyze packet for threats
      const threatProb = this.analyzeThreatProbability(packet);
      
      if (threatProb.score > this.config.alertThreshold) {
        this.handleThreatDetection(packet, threatProb);
      }

      // Update performance metrics
      this.updatePerformanceMetrics(startTime);
      
    } catch (error) {
      this.logger.error('Error processing packet', { error, packet });
    }
  }

  /**
   * Analyze threat probability for a packet
   */
  private analyzeThreatProbability(packet: NetworkPacket): ThreatProbability {
    const factors = {
      entropy: this.analyzeEntropyFactor(packet),
      timing: this.analyzeTimingFactor(packet),
      frequency: this.analyzeFrequencyFactor(packet),
      pattern: this.analyzePatternFactor(packet)
    };

    // Calculate weighted threat score
    const weights = { entropy: 0.3, timing: 0.25, frequency: 0.25, pattern: 0.2 };
    const score = Object.entries(factors).reduce((sum, [key, value]) => 
      sum + value * weights[key as keyof typeof weights], 0
    );

    // Calculate confidence based on data sufficiency
    const confidence = Math.min(this.packetBuffer.length / this.config.analysisWindow, 1.0);

    const threatProb: ThreatProbability = {
      score,
      confidence,
      factors,
      timestamp: packet.timestamp
    };

    this.threatHistory.push(threatProb);
    if (this.threatHistory.length > 1000) {
      this.threatHistory.shift();
    }

    return threatProb;
  }

  /**
   * Analyze entropy-based threat factors
   */
  private analyzeEntropyFactor(packet: NetworkPacket): number {
    if (!packet.entropy) return 0;

    // High entropy might indicate encrypted/compressed data or randomness
    if (packet.entropy > this.config.entropyThreshold) {
      return Math.min((packet.entropy - this.config.entropyThreshold) / 2, 1);
    }

    // Very low entropy might indicate padding attacks or simple patterns
    if (packet.entropy < 1.0) {
      return 0.3;
    }

    return 0;
  }

  /**
   * Analyze timing-based threat factors
   */
  private analyzeTimingFactor(packet: NetworkPacket): number {
    if (this.packetBuffer.length < 5) return 0;

    const recentPackets = this.packetBuffer.slice(-10);
    const timestamps = recentPackets.map(p => p.timestamp);
    
    const timingAnalysis = TimingAnalyzer.calculateTimingVariance(timestamps);
    
    // High coefficient of variation might indicate timing attacks
    if (timingAnalysis.coefficientOfVariation > this.config.timingThreshold) {
      return Math.min(timingAnalysis.coefficientOfVariation / 5, 1);
    }

    return 0;
  }

  /**
   * Analyze frequency-based threat factors
   */
  private analyzeFrequencyFactor(packet: NetworkPacket): number {
    if (this.packetBuffer.length < 10) return 0;

    // Count packets from same source in recent window
    const recentFromSameSource = this.packetBuffer.filter(p => 
      p.sourceIP === packet.sourceIP && 
      Date.now() - p.timestamp < 10000 // Last 10 seconds
    ).length;

    // High frequency from single source
    if (recentFromSameSource > 50) {
      return Math.min(recentFromSameSource / 100, 1);
    }

    return 0;
  }

  /**
   * Analyze pattern-based threat factors
   */
  private analyzePatternFactor(packet: NetworkPacket): number {
    if (this.packetBuffer.length < 20) return 0;

    let suspiciousPatterns = 0;

    // Check for port scanning patterns
    const recentPorts = new Set(this.packetBuffer
      .filter(p => p.sourceIP === packet.sourceIP)
      .map(p => p.destinationPort)
    );

    if (recentPorts.size > 10) {
      suspiciousPatterns += 0.4;
    }

    // Check for payload patterns
    if (this.detectSuspiciousPayloadPatterns(packet)) {
      suspiciousPatterns += 0.3;
    }

    // Check for protocol anomalies
    if (this.detectProtocolAnomalies(packet)) {
      suspiciousPatterns += 0.3;
    }

    return Math.min(suspiciousPatterns, 1);
  }

  /**
   * Detect suspicious payload patterns
   */
  private detectSuspiciousPayloadPatterns(packet: NetworkPacket): boolean {
    const payload = packet.payload.toString('hex');
    
    // Check for known attack signatures (simplified)
    const suspiciousPatterns = [
      /90{8,}/, // NOP sleds
      /(41{8,})/, // Buffer overflow patterns
      /(%[0-9a-f]{2}){10,}/, // Excessive URL encoding
      /(\\x[0-9a-f]{2}){10,}/ // Hex escape sequences
    ];

    return suspiciousPatterns.some(pattern => pattern.test(payload));
  }

  /**
   * Detect protocol anomalies
   */
  private detectProtocolAnomalies(packet: NetworkPacket): boolean {
    // Check for unusual port combinations
    const commonPorts = [22, 23, 53, 80, 110, 143, 443, 993, 995];
    
    if (packet.protocol === 'TCP' && !commonPorts.includes(packet.destinationPort)) {
      if (packet.destinationPort < 1024) {
        return true; // Privileged port access
      }
    }

    // Check packet size anomalies
    if (packet.size > 1500 || packet.size < 20) {
      return true;
    }

    return false;
  }

  /**
   * Handle threat detection
   */
  private handleThreatDetection(packet: NetworkPacket, threatProb: ThreatProbability): void {
    this.performanceMetrics.threatsDetected++;
    
    const threat = {
      id: uuidv4(),
      timestamp: packet.timestamp,
      sourceIP: packet.sourceIP,
      threatProbability: threatProb,
      packet,
      agentId: this.agentId
    };

    this.logger.warn('Threat detected', threat);
    this.emit('threatDetected', threat);
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(startTime: bigint): void {
    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    this.performanceMetrics.packetsProcessed++;
    this.performanceMetrics.averageResponseTime = 
      (this.performanceMetrics.averageResponseTime + responseTime) / 2;
    this.performanceMetrics.lastUpdate = Date.now();
  }

  /**
   * Start analysis routines
   */
  private startAnalysisRoutines(): void {
    // Periodic threat analysis
    const analysisInterval = setInterval(() => {
      if (!this.isActive) return;
      this.performPeriodicAnalysis();
    }, 30000); // Every 30 seconds

    this.monitoringIntervals.push(analysisInterval);

    // Performance reporting
    const reportingInterval = setInterval(() => {
      if (!this.isActive) return;
      this.reportPerformanceMetrics();
    }, 60000); // Every minute

    this.monitoringIntervals.push(reportingInterval);
  }

  /**
   * Perform periodic analysis of collected data
   */
  private performPeriodicAnalysis(): void {
    if (this.packetBuffer.length === 0) return;

    // Analyze entropy patterns
    const entropies = this.packetBuffer.map(p => p.entropy || 0);
    const entropyAnomalies = EntropyCalculator.detectEntropyAnomalies(entropies);
    
    // Analyze timing patterns  
    const timestamps = this.packetBuffer.map(p => p.timestamp);
    const timingPatterns = TimingAnalyzer.analyzePeriodicPatterns(timestamps);

    const analysis = {
      timestamp: Date.now(),
      packetCount: this.packetBuffer.length,
      entropyAnomalies: entropyAnomalies.filter(a => a).length,
      timingPatterns: timingPatterns.length,
      threatLevel: this.calculateOverallThreatLevel()
    };

    this.logger.info('Periodic analysis completed', analysis);
    this.emit('analysisCompleted', analysis);
  }

  /**
   * Calculate overall threat level
   */
  private calculateOverallThreatLevel(): number {
    if (this.threatHistory.length === 0) return 0;

    const recentThreats = this.threatHistory.filter(t => 
      Date.now() - t.timestamp < 300000 // Last 5 minutes
    );

    if (recentThreats.length === 0) return 0;

    const averageScore = recentThreats.reduce((sum, t) => sum + t.score, 0) / recentThreats.length;
    const threatFrequency = recentThreats.length / 300; // Per second

    return Math.min((averageScore * 0.7) + (threatFrequency * 0.3), 1);
  }

  /**
   * Report performance metrics
   */
  private reportPerformanceMetrics(): void {
    const metrics = {
      ...this.performanceMetrics,
      uptime: Date.now() - this.performanceMetrics.lastUpdate,
      accuracy: this.calculateAccuracy(),
      bufferUtilization: this.packetBuffer.length / this.config.analysisWindow
    };

    this.logger.info('Performance metrics', metrics);
    this.emit('performanceMetrics', metrics);
  }

  /**
   * Calculate detection accuracy
   */
  private calculateAccuracy(): number {
    const total = this.performanceMetrics.threatsDetected + this.performanceMetrics.falsePositives;
    if (total === 0) return 1;
    
    return this.performanceMetrics.threatsDetected / total;
  }

  /**
   * Get current agent state
   */
  getAgentState(): AgentState {
    return {
      id: this.agentId,
      type: 'nullstelle',
      status: this.isActive ? 'active' : 'standby',
      lastHeartbeat: Date.now(),
      performance: {
        threatsDetected: this.performanceMetrics.threatsDetected,
        falsePositives: this.performanceMetrics.falsePositives,
        responseTime: this.performanceMetrics.averageResponseTime,
        accuracy: this.calculateAccuracy()
      },
      configuration: this.config
    };
  }

  /**
   * Setup signal handlers for graceful shutdown
   */
  private setupSignalHandlers(): void {
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }
}

export default NullstelleObserver;