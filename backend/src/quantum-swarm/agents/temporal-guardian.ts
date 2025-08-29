import { EventEmitter } from 'events';
import * as winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import * as cron from 'node-cron';
import { TimingAnalyzer } from '../utils/timing';
import { TemporalAnomaly, LamportClock, AgentState } from '../types';

/**
 * TemporalGuardian - Advanced temporal analysis and clock synchronization agent
 * Monitors system time, detects clock drift, and implements Lamport clock
 */
export class TemporalGuardian extends EventEmitter {
  private readonly logger: winston.Logger;
  private readonly agentId: string;
  private readonly config: {
    clockDriftThreshold: number;
    timestampAnomalyThreshold: number;
    synchronizationInterval: number;
    maxClockOffset: number;
    ntpServers: string[];
  };

  private isActive: boolean = false;
  private lamportClock: LamportClock;
  private systemTimeBaseline: number;
  private clockDriftHistory: number[] = [];
  private timestampAnomalies: TemporalAnomaly[] = [];
  private performanceMetrics: {
    anomaliesDetected: number;
    clockSyncs: number;
    avgDriftRate: number;
    lastSync: number;
  };

  private monitoringIntervals: NodeJS.Timeout[] = [];
  private cronJobs: cron.ScheduledTask[] = [];
  private peerClocks: Map<string, LamportClock> = new Map();

  constructor(nodeId?: string, config?: Partial<TemporalGuardian['config']>) {
    super();
    
    this.agentId = uuidv4();
    this.config = {
      clockDriftThreshold: 1000, // 1 second in milliseconds
      timestampAnomalyThreshold: 5000, // 5 seconds
      synchronizationInterval: 30000, // 30 seconds
      maxClockOffset: 10000, // 10 seconds
      ntpServers: [
        'time.google.com',
        'pool.ntp.org',
        'time.cloudflare.com'
      ],
      ...config
    };

    // Initialize Lamport clock
    this.lamportClock = {
      logicalTime: 0,
      nodeId: nodeId || this.agentId,
      vectorClock: new Map()
    };

    this.systemTimeBaseline = Date.now();
    this.performanceMetrics = {
      anomaliesDetected: 0,
      clockSyncs: 0,
      avgDriftRate: 0,
      lastSync: Date.now()
    };

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'temporal-guardian', agentId: this.agentId },
      transports: [
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });

    this.setupSignalHandlers();
  }

  /**
   * Start temporal monitoring and synchronization
   */
  async start(): Promise<void> {
    try {
      this.isActive = true;
      this.logger.info('Starting TemporalGuardian', { agentId: this.agentId });

      // Initialize system time monitoring
      this.startSystemTimeMonitoring();
      
      // Start clock drift detection
      this.startClockDriftDetection();
      
      // Start timestamp anomaly detection
      this.startTimestampAnomalyDetection();
      
      // Schedule periodic synchronization
      this.schedulePeriodicSynchronization();
      
      // Initialize NTP synchronization
      this.initializeNTPSync();
      
      this.emit('started', { agentId: this.agentId, timestamp: Date.now() });
      
    } catch (error) {
      this.logger.error('Failed to start TemporalGuardian', { error, agentId: this.agentId });
      throw error;
    }
  }

  /**
   * Stop temporal monitoring
   */
  async stop(): Promise<void> {
    this.isActive = false;
    this.logger.info('Stopping TemporalGuardian', { agentId: this.agentId });

    // Clear monitoring intervals
    this.monitoringIntervals.forEach(interval => clearInterval(interval));
    this.monitoringIntervals = [];

    // Stop cron jobs
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];

    this.emit('stopped', { agentId: this.agentId, timestamp: Date.now() });
  }

  /**
   * Start system time monitoring
   */
  private startSystemTimeMonitoring(): void {
    const interval = setInterval(() => {
      if (!this.isActive) return;
      
      this.monitorSystemTime();
    }, 1000); // Every second

    this.monitoringIntervals.push(interval);
  }

  /**
   * Monitor system time for irregularities
   */
  private monitorSystemTime(): void {
    const currentTime = Date.now();
    const highResTime = process.hrtime.bigint();
    
    // Check for time jumps
    const expectedTime = this.systemTimeBaseline + (Date.now() - this.systemTimeBaseline);
    const timeDifference = Math.abs(currentTime - expectedTime);
    
    if (timeDifference > this.config.timestampAnomalyThreshold) {
      this.handleTimestampAnomaly({
        id: uuidv4(),
        type: 'timestamp_gap',
        severity: Math.min(timeDifference / this.config.timestampAnomalyThreshold, 1),
        timestamp: currentTime,
        details: {
          expectedTime,
          actualTime: currentTime,
          difference: timeDifference,
          highResTime: highResTime.toString()
        }
      });
    }

    // Update baseline periodically
    if (Math.random() > 0.99) { // 1% chance to reset baseline
      this.systemTimeBaseline = currentTime;
    }
  }

  /**
   * Start clock drift detection
   */
  private startClockDriftDetection(): void {
    let lastMeasurement = {
      systemTime: Date.now(),
      processTime: process.hrtime.bigint()
    };

    const interval = setInterval(() => {
      if (!this.isActive) return;
      
      const currentSystemTime = Date.now();
      const currentProcessTime = process.hrtime.bigint();
      
      // Calculate drift
      const systemDelta = currentSystemTime - lastMeasurement.systemTime;
      const processDelta = Number(currentProcessTime - lastMeasurement.processTime) / 1000000; // Convert to ms
      
      const drift = Math.abs(systemDelta - processDelta);
      this.clockDriftHistory.push(drift);
      
      // Keep history size manageable
      if (this.clockDriftHistory.length > 1000) {
        this.clockDriftHistory.shift();
      }

      // Check for significant drift
      if (drift > this.config.clockDriftThreshold) {
        this.handleClockDrift(drift, systemDelta, processDelta);
      }

      // Update measurements
      lastMeasurement = {
        systemTime: currentSystemTime,
        processTime: currentProcessTime
      };
      
    }, 5000); // Every 5 seconds

    this.monitoringIntervals.push(interval);
  }

  /**
   * Handle detected clock drift
   */
  private handleClockDrift(drift: number, systemDelta: number, processDelta: number): void {
    const anomaly: TemporalAnomaly = {
      id: uuidv4(),
      type: 'clock_drift',
      severity: Math.min(drift / this.config.clockDriftThreshold, 1),
      timestamp: Date.now(),
      details: {
        drift,
        systemDelta,
        processDelta,
        driftHistory: this.clockDriftHistory.slice(-10)
      }
    };

    this.timestampAnomalies.push(anomaly);
    this.performanceMetrics.anomaliesDetected++;
    
    // Calculate average drift rate
    const avgDrift = this.clockDriftHistory.reduce((sum, d) => sum + d, 0) / this.clockDriftHistory.length;
    this.performanceMetrics.avgDriftRate = avgDrift;

    this.logger.warn('Clock drift detected', anomaly);
    this.emit('clockDriftDetected', anomaly);
  }

  /**
   * Start timestamp anomaly detection
   */
  private startTimestampAnomalyDetection(): void {
    const timestampBuffer: number[] = [];
    
    const interval = setInterval(() => {
      if (!this.isActive) return;
      
      const timestamp = Date.now();
      timestampBuffer.push(timestamp);
      
      // Keep buffer size manageable
      if (timestampBuffer.length > 100) {
        timestampBuffer.shift();
      }

      if (timestampBuffer.length >= 10) {
        this.analyzeTimestampSequence(timestampBuffer);
      }
      
    }, 2000); // Every 2 seconds

    this.monitoringIntervals.push(interval);
  }

  /**
   * Analyze timestamp sequence for anomalies
   */
  private analyzeTimestampSequence(timestamps: number[]): void {
    // Check for sequence anomalies
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }

    // Detect timing anomalies
    const timingAnomalies = TimingAnalyzer.detectTimingAnomalies(intervals, 2.0);
    const anomalyCount = timingAnomalies.filter(a => a).length;

    if (anomalyCount > intervals.length * 0.3) { // More than 30% anomalous
      const anomaly: TemporalAnomaly = {
        id: uuidv4(),
        type: 'sequence_anomaly',
        severity: anomalyCount / intervals.length,
        timestamp: Date.now(),
        details: {
          anomalyCount,
          totalIntervals: intervals.length,
          suspiciousIntervals: intervals.filter((_, i) => timingAnomalies[i]),
          timingStats: TimingAnalyzer.calculateTimingVariance(timestamps)
        }
      };

      this.handleTimestampAnomaly(anomaly);
    }

    // Check for potential timing attacks
    const timingAttackAnalysis = TimingAnalyzer.detectTimingAttacks(
      timestamps.slice(0, -1), // Request timings (simulate)
      intervals // Response timings
    );

    if (timingAttackAnalysis.suspicious) {
      const anomaly: TemporalAnomaly = {
        id: uuidv4(),
        type: 'timing_attack',
        severity: timingAttackAnalysis.riskScore,
        timestamp: Date.now(),
        details: timingAttackAnalysis
      };

      this.handleTimestampAnomaly(anomaly);
    }
  }

  /**
   * Handle detected timestamp anomaly
   */
  private handleTimestampAnomaly(anomaly: TemporalAnomaly): void {
    this.timestampAnomalies.push(anomaly);
    this.performanceMetrics.anomaliesDetected++;
    
    // Keep anomaly history manageable
    if (this.timestampAnomalies.length > 1000) {
      this.timestampAnomalies.shift();
    }

    this.logger.warn('Timestamp anomaly detected', anomaly);
    this.emit('timestampAnomalyDetected', anomaly);
  }

  /**
   * Schedule periodic synchronization
   */
  private schedulePeriodicSynchronization(): void {
    // Synchronize every minute
    const syncTask = cron.schedule('*/1 * * * *', () => {
      if (this.isActive) {
        this.performClockSynchronization();
      }
    }, { scheduled: false });

    syncTask.start();
    this.cronJobs.push(syncTask);

    // Health check every 5 minutes
    const healthTask = cron.schedule('*/5 * * * *', () => {
      if (this.isActive) {
        this.performHealthCheck();
      }
    }, { scheduled: false });

    healthTask.start();
    this.cronJobs.push(healthTask);
  }

  /**
   * Perform clock synchronization
   */
  private async performClockSynchronization(): Promise<void> {
    try {
      // Increment Lamport clock
      this.lamportClock.logicalTime++;
      
      // Sync with NTP if available
      const ntpOffset = await this.getNTPOffset();
      
      if (Math.abs(ntpOffset) > this.config.maxClockOffset) {
        const anomaly: TemporalAnomaly = {
          id: uuidv4(),
          type: 'clock_drift',
          severity: Math.abs(ntpOffset) / this.config.maxClockOffset,
          timestamp: Date.now(),
          details: {
            ntpOffset,
            maxAllowedOffset: this.config.maxClockOffset,
            lamportTime: this.lamportClock.logicalTime
          }
        };

        this.handleTimestampAnomaly(anomaly);
      }

      this.performanceMetrics.clockSyncs++;
      this.performanceMetrics.lastSync = Date.now();
      
      this.logger.debug('Clock synchronization completed', {
        lamportTime: this.lamportClock.logicalTime,
        ntpOffset,
        agentId: this.agentId
      });

      this.emit('clockSynchronized', {
        lamportTime: this.lamportClock.logicalTime,
        ntpOffset,
        timestamp: Date.now()
      });
      
    } catch (error) {
      this.logger.error('Clock synchronization failed', { error });
    }
  }

  /**
   * Get NTP offset (simplified implementation)
   */
  private async getNTPOffset(): Promise<number> {
    try {
      // Simplified NTP implementation - in production, use proper NTP client
      const startTime = Date.now();
      
      // Simulate network request to NTP server
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      const endTime = Date.now();
      const networkDelay = endTime - startTime;
      
      // Simulate NTP response with small random offset
      const simulatedOffset = (Math.random() - 0.5) * 200; // ±100ms
      
      return simulatedOffset - (networkDelay / 2);
      
    } catch (error) {
      this.logger.warn('NTP synchronization failed', { error });
      return 0;
    }
  }

  /**
   * Initialize NTP synchronization
   */
  private initializeNTPSync(): void {
    // Initial synchronization
    this.performClockSynchronization();
    
    // Set up continuous monitoring
    const ntpInterval = setInterval(() => {
      if (!this.isActive) return;
      
      this.performClockSynchronization();
    }, this.config.synchronizationInterval);

    this.monitoringIntervals.push(ntpInterval);
  }

  /**
   * Perform health check
   */
  private performHealthCheck(): void {
    const now = Date.now();
    const recentAnomalies = this.timestampAnomalies.filter(a => 
      now - a.timestamp < 300000 // Last 5 minutes
    );

    const healthStatus = {
      timestamp: now,
      anomaliesInLast5Min: recentAnomalies.length,
      avgClockDrift: this.clockDriftHistory.length > 0 
        ? this.clockDriftHistory.reduce((sum, d) => sum + d, 0) / this.clockDriftHistory.length 
        : 0,
      lamportTime: this.lamportClock.logicalTime,
      lastSync: this.performanceMetrics.lastSync,
      isHealthy: recentAnomalies.length < 10 && this.performanceMetrics.avgDriftRate < this.config.clockDriftThreshold
    };

    this.logger.info('Temporal health check completed', healthStatus);
    this.emit('healthCheck', healthStatus);
  }

  /**
   * Update Lamport clock with external event
   */
  updateLamportClock(externalTime: number, sourceNodeId?: string): number {
    // Update logical time to be greater than both local and external time
    this.lamportClock.logicalTime = Math.max(this.lamportClock.logicalTime, externalTime) + 1;
    
    // Update vector clock if source is provided
    if (sourceNodeId) {
      this.lamportClock.vectorClock.set(sourceNodeId, externalTime);
    }

    this.logger.debug('Lamport clock updated', {
      logicalTime: this.lamportClock.logicalTime,
      externalTime,
      sourceNodeId
    });

    return this.lamportClock.logicalTime;
  }

  /**
   * Synchronize with peer nodes
   */
  synchronizeWithPeer(peerClock: LamportClock): void {
    // Update local clock
    this.updateLamportClock(peerClock.logicalTime, peerClock.nodeId);
    
    // Store peer clock information
    this.peerClocks.set(peerClock.nodeId, peerClock);
    
    // Merge vector clocks
    for (const [nodeId, time] of peerClock.vectorClock) {
      const currentTime = this.lamportClock.vectorClock.get(nodeId) || 0;
      this.lamportClock.vectorClock.set(nodeId, Math.max(currentTime, time));
    }

    this.logger.debug('Synchronized with peer', {
      peerId: peerClock.nodeId,
      peerLogicalTime: peerClock.logicalTime,
      localLogicalTime: this.lamportClock.logicalTime
    });

    this.emit('peerSynchronized', {
      peerId: peerClock.nodeId,
      timestamp: Date.now()
    });
  }

  /**
   * Get current Lamport timestamp
   */
  getCurrentTimestamp(): number {
    this.lamportClock.logicalTime++;
    return this.lamportClock.logicalTime;
  }

  /**
   * Get current clock state
   */
  getClockState(): LamportClock {
    return {
      logicalTime: this.lamportClock.logicalTime,
      nodeId: this.lamportClock.nodeId,
      vectorClock: new Map(this.lamportClock.vectorClock)
    };
  }

  /**
   * Get temporal anomalies in time range
   */
  getAnomaliesInRange(startTime: number, endTime: number): TemporalAnomaly[] {
    return this.timestampAnomalies.filter(anomaly => 
      anomaly.timestamp >= startTime && anomaly.timestamp <= endTime
    );
  }

  /**
   * Calculate temporal consensus with peer nodes
   */
  calculateTemporalConsensus(): {
    consensusTime: number;
    confidence: number;
    participatingNodes: string[];
  } {
    const allClocks = Array.from(this.peerClocks.values()).concat([this.lamportClock]);
    
    if (allClocks.length === 1) {
      return {
        consensusTime: this.lamportClock.logicalTime,
        confidence: 1.0,
        participatingNodes: [this.lamportClock.nodeId]
      };
    }

    // Calculate median time for consensus
    const times = allClocks.map(clock => clock.logicalTime).sort((a, b) => a - b);
    const median = times[Math.floor(times.length / 2)];
    
    // Calculate confidence based on agreement
    const deviations = times.map(time => Math.abs(time - median));
    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
    const maxAcceptableDeviation = 1000; // 1 second
    const confidence = Math.max(0, 1 - (avgDeviation / maxAcceptableDeviation));

    return {
      consensusTime: median,
      confidence,
      participatingNodes: allClocks.map(clock => clock.nodeId)
    };
  }

  /**
   * Get current agent state
   */
  getAgentState(): AgentState {
    return {
      id: this.agentId,
      type: 'temporal',
      status: this.isActive ? 'active' : 'standby',
      lastHeartbeat: Date.now(),
      performance: {
        threatsDetected: this.performanceMetrics.anomaliesDetected,
        falsePositives: 0, // TODO: Implement false positive tracking
        responseTime: 0, // TODO: Implement response time tracking
        accuracy: this.calculateAccuracy()
      },
      configuration: this.config
    };
  }

  /**
   * Calculate detection accuracy
   */
  private calculateAccuracy(): number {
    // Simplified accuracy calculation based on clock drift
    if (this.clockDriftHistory.length === 0) return 1.0;
    
    const avgDrift = this.performanceMetrics.avgDriftRate;
    const maxAcceptableDrift = this.config.clockDriftThreshold;
    
    return Math.max(0, 1 - (avgDrift / maxAcceptableDrift));
  }

  /**
   * Setup signal handlers for graceful shutdown
   */
  private setupSignalHandlers(): void {
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }
}

export default TemporalGuardian;