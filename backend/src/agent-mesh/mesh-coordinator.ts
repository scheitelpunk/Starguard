import { EventEmitter } from 'events';
import * as winston from 'winston';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import * as CryptoJS from 'crypto-js';
import { NetworkMonitoringAgent } from './agents/network-monitoring-agent';
import { TimeSyncAgent } from './agents/time-sync-agent';
import {
  ConsciousnessState,
  DefenseStrategy,
  SwarmConsensus,
  AgentState,
  ThreatProbability,
  TemporalAnomaly,
  DefenseAction
} from './types';

interface PerformanceMetrics {
  threatsProcessed: number;
  consensusReached: number;
  strategiesExecuted: number;
  avgResponseTime: number;
  swarmHealth: number;
  lastUpdate: number;
}

/**
 * SwarmCoordinator - Central coordination system for quantum swarm consciousness
 * Manages distributed agents, consensus, and defense strategies
 */
export class SwarmCoordinator extends EventEmitter {
  private readonly logger: winston.Logger;
  private readonly coordinatorId: string;
  private readonly config: {
    redis: {
      host: string;
      port: number;
      password?: string;
      db: number;
    };
    consciousness: {
      updateInterval: number;
      consensusThreshold: number;
      threatThreshold: number;
      coherenceThreshold: number;
    };
    defense: {
      strategyTimeout: number;
      maxConcurrentStrategies: number;
      adaptiveLearning: boolean;
    };
  };

  private isActive: boolean = false;
  private redis: Redis;
  private agents: Map<string, AgentState> = new Map();
  private consciousnessState: ConsciousnessState;
  private activeDefenseStrategies: Map<string, DefenseStrategy> = new Map();
  private threatConsensus: Map<string, SwarmConsensus> = new Map();
  
  // Core swarm components
  private nullstelleObservers: Map<string, InstanceType<typeof NetworkMonitoringAgent>> = new Map();
  private temporalGuardians: Map<string, InstanceType<typeof TimeSyncAgent>> = new Map();
  
  private monitoringIntervals: NodeJS.Timeout[] = [];
  private scheduledTimeouts: NodeJS.Timeout[] = [];
  private performanceMetrics: {
    threatsProcessed: number;
    consensusReached: number;
    strategiesExecuted: number;
    avgResponseTime: number;
    swarmHealth: number;
    lastUpdate: number;
  };

  // Resource limits for memory management
  private readonly resourceLimits = {
    maxAgents: 50,
    maxDefenseStrategies: 20,
    maxThreatConsensus: 100,
    maxObservers: 10,
    maxGuardians: 10
  };

  constructor(config?: Partial<SwarmCoordinator['config']>) {
    super();
    
    this.coordinatorId = uuidv4();
    this.config = {
      redis: {
        host: 'localhost',
        port: 6379,
        db: 0,
        ...config?.redis
      },
      consciousness: {
        updateInterval: 5000, // 5 seconds
        consensusThreshold: 0.7,
        threatThreshold: 0.6,
        coherenceThreshold: 0.8,
        ...config?.consciousness
      },
      defense: {
        strategyTimeout: 300000, // 5 minutes
        maxConcurrentStrategies: 10,
        adaptiveLearning: true,
        ...config?.defense
      }
    };

    // Initialize Redis connection
    this.redis = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      db: this.config.redis.db,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    // Initialize consciousness state
    this.consciousnessState = {
      id: this.coordinatorId,
      timestamp: Date.now(),
      threatLevel: 0,
      activeThreats: [],
      systemHealth: {
        cpu: 0,
        memory: 0,
        network: 0,
        disk: 0
      },
      swarmCoherence: 1.0,
      emergentPatterns: []
    };

    this.performanceMetrics = {
      threatsProcessed: 0,
      consensusReached: 0,
      strategiesExecuted: 0,
      avgResponseTime: 0,
      swarmHealth: 1.0,
      lastUpdate: Date.now()
    };

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'swarm-coordinator', coordinatorId: this.coordinatorId },
      transports: [
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });

    this.setupSignalHandlers();
    this.setupRedisEventHandlers();
  }

  /**
   * Start swarm coordination system
   */
  async start(): Promise<void> {
    try {
      this.isActive = true;
      this.logger.info('Starting SwarmCoordinator', { coordinatorId: this.coordinatorId });

      // Connect to Redis
      await this.redis.connect();
      
      // Initialize swarm agents
      await this.initializeSwarmAgents();
      
      // Start consciousness monitoring
      this.startConsciousnessMonitoring();
      
      // Start consensus processes
      this.startConsensusProcesses();
      
      // Start defense strategy management
      this.startDefenseManagement();
      
      // Initialize emergent pattern detection
      this.startEmergentPatternDetection();
      
      this.emit('started', { coordinatorId: this.coordinatorId, timestamp: Date.now() });
      
    } catch (error) {
      this.logger.error('Failed to start SwarmCoordinator', { error, coordinatorId: this.coordinatorId });
      throw error;
    }
  }

  /**
   * Stop swarm coordination
   */
  async stop(): Promise<void> {
    this.isActive = false;
    this.logger.info('Stopping SwarmCoordinator', { coordinatorId: this.coordinatorId });

    try {
      // Stop all agents
      for (const observer of this.nullstelleObservers.values()) {
        await observer.stop();
      }
      for (const guardian of this.temporalGuardians.values()) {
        await guardian.stop();
      }

      // Clear monitoring intervals
      this.monitoringIntervals.forEach(interval => clearInterval(interval));
      this.monitoringIntervals = [];

      // Clear scheduled timeouts
      this.scheduledTimeouts.forEach(timeout => clearTimeout(timeout));
      this.scheduledTimeouts = [];

      // Remove all event listeners to prevent memory leaks
      this.removeAllListeners();

      // Disconnect from Redis
      await this.redis.disconnect();

      this.emit('stopped', { coordinatorId: this.coordinatorId, timestamp: Date.now() });
    } catch (error) {
      this.logger.error('Error during shutdown', { error });
      throw error;
    } finally {
      // Ensure cleanup even if errors occur
      this.agents.clear();
      this.activeDefenseStrategies.clear();
      this.threatConsensus.clear();
      this.nullstelleObservers.clear();
      this.temporalGuardians.clear();
    }
  }

  /**
   * Initialize swarm agents
   */
  private async initializeSwarmAgents(): Promise<void> {
    // Create NetworkMonitoringAgent instances with resource limits
    const observerConfig = {
      entropyThreshold: 6.5,
      timingThreshold: 2.0,
      analysisWindow: 150,
      alertThreshold: 0.65
    };

    const observerCount = Math.min(3, this.resourceLimits.maxObservers);
    for (let i = 0; i < observerCount; i++) {
      const observer = new NetworkMonitoringAgent();
      const agentId = `observer-${i}-${Date.now()}`;
      const agentState: AgentState = {
        id: agentId,
        type: 'network-monitoring',
        status: 'active',
        lastHeartbeat: Date.now(),
        performance: {
          threatsDetected: 0,
          falsePositives: 0,
          responseTime: 0,
          accuracy: 1.0
        }
      };

      this.nullstelleObservers.set(agentId, observer);
      this.agents.set(agentId, agentState);

      // Set up event handlers
      observer.on('threatDetected', (threat: any) => this.handleThreatDetection(threat, agentId));
      observer.on('analysisCompleted', (analysis: any) => this.handleAnalysisCompleted(analysis, agentId));

      await observer.start();
    }

    // Create TimeSyncAgent instances with resource limits
    const guardianConfig = {
      clockDriftThreshold: 500,
      timestampAnomalyThreshold: 3000,
      synchronizationInterval: 15000,
      maxClockOffset: 5000
    };

    const guardianCount = Math.min(2, this.resourceLimits.maxGuardians);
    for (let i = 0; i < guardianCount; i++) {
      const guardian = new TimeSyncAgent(undefined, guardianConfig);
      const agentId = guardian.getAgentState().id;

      this.temporalGuardians.set(agentId, guardian);
      this.agents.set(agentId, guardian.getAgentState());

      // Set up event handlers
      guardian.on('clockDriftDetected', (anomaly: any) => this.handleTemporalAnomaly(anomaly, agentId));
      guardian.on('timestampAnomalyDetected', (anomaly: any) => this.handleTemporalAnomaly(anomaly, agentId));

      await guardian.start();
    }

    this.logger.info('Swarm agents initialized', {
      nullstelleObservers: this.nullstelleObservers.size,
      temporalGuardians: this.temporalGuardians.size
    });
  }

  /**
   * Start consciousness monitoring
   */
  private startConsciousnessMonitoring(): void {
    const interval = setInterval(() => {
      if (!this.isActive) return;
      
      this.updateConsciousnessState();
    }, this.config.consciousness.updateInterval);

    this.monitoringIntervals.push(interval);
  }

  /**
   * Update consciousness state
   */
  private async updateConsciousnessState(): Promise<void> {
    try {
      const startTime = process.hrtime.bigint();
      
      // Gather agent states
      const agentStates = Array.from(this.agents.values());
      
      // Calculate system health
      const systemHealth = await this.calculateSystemHealth();
      
      // Determine threat level
      const threatLevel = this.calculateOverallThreatLevel();
      
      // Calculate swarm coherence
      const swarmCoherence = this.calculateSwarmCoherence(agentStates);
      
      // Detect emergent patterns
      const emergentPatterns = this.detectEmergentPatterns();
      
      // Update consciousness state
      this.consciousnessState = {
        id: this.coordinatorId,
        timestamp: Date.now(),
        threatLevel,
        activeThreats: this.getActiveThreats(),
        systemHealth,
        swarmCoherence,
        emergentPatterns
      };

      // Store in Redis
      await this.storeConsciousnessState();
      
      // Update performance metrics
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000;
      this.updatePerformanceMetrics(responseTime);
      
      // Emit consciousness update
      this.emit('consciousnessUpdated', this.consciousnessState);
      
    } catch (error) {
      this.logger.error('Error updating consciousness state', { error });
    }
  }

  /**
   * Calculate system health metrics
   */
  private async calculateSystemHealth(): Promise<ConsciousnessState['systemHealth']> {
    // In a real implementation, this would collect actual system metrics
    // For now, we'll simulate based on agent performance
    
    const agentStates = Array.from(this.agents.values());
    const activeAgents = agentStates.filter(agent => agent.status === 'active');
    
    const avgAccuracy = activeAgents.length > 0 
      ? activeAgents.reduce((sum, agent) => sum + agent.performance.accuracy, 0) / activeAgents.length 
      : 1.0;
    
    const avgResponseTime = activeAgents.length > 0
      ? activeAgents.reduce((sum, agent) => sum + agent.performance.responseTime, 0) / activeAgents.length
      : 0;

    return {
      cpu: Math.max(0.1, Math.random() * 0.3 + (1 - avgAccuracy) * 0.5), // Simulated
      memory: Math.max(0.2, Math.random() * 0.4 + (avgResponseTime / 1000)), // Simulated
      network: Math.max(0.1, Math.random() * 0.2), // Simulated
      disk: Math.max(0.05, Math.random() * 0.15) // Simulated
    };
  }

  /**
   * Calculate overall threat level
   */
  private calculateOverallThreatLevel(): number {
    const recentThreats = Array.from(this.threatConsensus.values())
      .filter(consensus => Date.now() - consensus.timestamp < 300000); // Last 5 minutes
    
    if (recentThreats.length === 0) return 0;
    
    const avgThreatLevel = recentThreats.reduce((sum, threat) => sum + threat.finalDecision, 0) / recentThreats.length;
    const threatFrequency = recentThreats.length / 300; // Per second
    
    return Math.min((avgThreatLevel * 0.8) + (threatFrequency * 0.2), 1);
  }

  /**
   * Calculate swarm coherence
   */
  private calculateSwarmCoherence(agentStates: AgentState[]): number {
    if (agentStates.length === 0) return 0;
    
    const activeAgents = agentStates.filter(agent => agent.status === 'active');
    const coherenceRatio = activeAgents.length / agentStates.length;
    
    // Calculate performance variance
    const accuracies = activeAgents.map(agent => agent.performance.accuracy);
    const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const accuracyVariance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - avgAccuracy, 2), 0) / accuracies.length;
    
    const coherenceScore = coherenceRatio * (1 - Math.sqrt(accuracyVariance));
    
    return Math.max(0, Math.min(1, coherenceScore));
  }

  /**
   * Get active threats
   */
  private getActiveThreats(): string[] {
    return Array.from(this.threatConsensus.values())
      .filter(consensus => 
        consensus.consensus && 
        consensus.finalDecision > this.config.consciousness.threatThreshold &&
        Date.now() - consensus.timestamp < 600000 // Last 10 minutes
      )
      .map(consensus => consensus.threatId);
  }

  /**
   * Store consciousness state in Redis
   */
  private async storeConsciousnessState(): Promise<void> {
    const key = `swarm:consciousness:${this.coordinatorId}`;
    const serialized = JSON.stringify({
      ...this.consciousnessState,
      timestamp: Date.now()
    });
    
    await this.redis.setex(key, 3600, serialized); // 1 hour TTL
    await this.redis.publish('swarm:consciousness:updates', serialized);
  }

  /**
   * Handle threat detection from agents
   */
  private async handleThreatDetection(threat: any, agentId: string): Promise<void> {
    this.logger.info('Threat detected by agent', { threatId: threat.id, agentId });
    
    // Initiate consensus process
    await this.initiateThreatConsensus(threat, agentId);
    
    // Update performance metrics
    this.performanceMetrics.threatsProcessed++;
  }

  /**
   * Handle analysis completion from agents
   */
  private handleAnalysisCompleted(analysis: any, agentId: string): void {
    this.logger.debug('Analysis completed by agent', { agentId, analysis });
    
    // Update agent state
    const agentState = this.agents.get(agentId);
    if (agentState) {
      agentState.lastHeartbeat = Date.now();
      this.agents.set(agentId, agentState);
    }
  }

  /**
   * Handle temporal anomaly detection
   */
  private async handleTemporalAnomaly(anomaly: TemporalAnomaly, agentId: string): Promise<void> {
    this.logger.warn('Temporal anomaly detected', { anomaly, agentId });
    
    // Convert temporal anomaly to threat for consensus
    const threat = {
      id: anomaly.id,
      type: 'temporal',
      severity: anomaly.severity,
      timestamp: anomaly.timestamp,
      details: anomaly.details,
      agentId
    };
    
    await this.initiateThreatConsensus(threat, agentId);
  }

  /**
   * Initiate threat consensus process
   */
  private async initiateThreatConsensus(threat: any, reportingAgentId: string): Promise<void> {
    const consensusId = `consensus_${threat.id}`;
    
    // Create initial consensus record
    const consensus: SwarmConsensus = {
      threatId: threat.id,
      votes: [{
        agentId: reportingAgentId,
        threatLevel: threat.severity || threat.threatProbability?.score || 0.5,
        confidence: threat.threatProbability?.confidence || 0.8,
        timestamp: Date.now()
      }],
      finalDecision: 0,
      consensus: false,
      timestamp: Date.now()
    };
    
    this.threatConsensus.set(consensusId, consensus);
    
    // Request votes from other agents
    await this.requestConsensusVotes(consensusId, threat);

    // Schedule consensus evaluation and track timeout
    const timeout = setTimeout(() => {
      this.evaluateConsensus(consensusId);
    }, 5000); // Wait 5 seconds for votes
    this.scheduledTimeouts.push(timeout);
  }

  /**
   * Request consensus votes from agents
   */
  private async requestConsensusVotes(consensusId: string, threat: any): Promise<void> {
    const message = {
      type: 'consensus_request',
      consensusId,
      threat,
      timestamp: Date.now()
    };
    
    await this.redis.publish('swarm:consensus:requests', JSON.stringify(message));
    
    // Simulate votes from agents (in real implementation, agents would respond via Redis)
    this.simulateConsensusVotes(consensusId, threat);
  }

  /**
   * Simulate consensus votes (for demonstration)
   */
  private simulateConsensusVotes(consensusId: string, threat: any): void {
    const consensus = this.threatConsensus.get(consensusId);
    if (!consensus) return;
    
    // Simulate votes from other agents
    const otherAgents = Array.from(this.agents.keys()).filter(id => 
      !consensus.votes.some(vote => vote.agentId === id)
    );
    
    for (const agentId of otherAgents.slice(0, 3)) { // Limit to 3 additional votes
      const vote = {
        agentId,
        threatLevel: (threat.severity || 0.5) + (Math.random() - 0.5) * 0.3,
        confidence: 0.7 + Math.random() * 0.3,
        timestamp: Date.now() + Math.random() * 3000
      };
      
      consensus.votes.push(vote);
    }
    
    this.threatConsensus.set(consensusId, consensus);
  }

  /**
   * Evaluate consensus results
   */
  private async evaluateConsensus(consensusId: string): Promise<void> {
    const consensus = this.threatConsensus.get(consensusId);
    if (!consensus) return;
    
    const votes = consensus.votes;
    const totalWeight = votes.reduce((sum, vote) => sum + vote.confidence, 0);
    
    if (totalWeight === 0) {
      this.logger.warn('No valid votes for consensus', { consensusId });
      return;
    }
    
    // Calculate weighted average
    const weightedThreatLevel = votes.reduce((sum, vote) => 
      sum + (vote.threatLevel * vote.confidence), 0
    ) / totalWeight;
    
    // Determine if consensus is reached
    const avgConfidence = totalWeight / votes.length;
    const consensusReached = avgConfidence >= this.config.consciousness.consensusThreshold;
    
    // Update consensus record
    consensus.finalDecision = weightedThreatLevel;
    consensus.consensus = consensusReached;
    consensus.timestamp = Date.now();
    
    this.threatConsensus.set(consensusId, consensus);
    
    if (consensusReached) {
      this.performanceMetrics.consensusReached++;
      
      if (weightedThreatLevel > this.config.consciousness.threatThreshold) {
        await this.generateDefenseStrategy(consensus);
      }
    }
    
    this.logger.info('Consensus evaluated', {
      consensusId,
      finalDecision: weightedThreatLevel,
      consensusReached,
      votes: votes.length
    });
    
    this.emit('consensusReached', consensus);
  }

  /**
   * Generate defense strategy
   */
  private async generateDefenseStrategy(consensus: SwarmConsensus): Promise<void> {
    const strategyId = uuidv4();
    const threat = consensus.threatId;
    
    // Analyze threat pattern and generate appropriate strategy
    const strategy: DefenseStrategy = {
      id: strategyId,
      name: `Defense-${threat.substring(0, 8)}`,
      priority: Math.floor(consensus.finalDecision * 10),
      actions: this.generateDefenseActions(consensus),
      triggers: [`threat:${threat}`],
      effectiveness: 0.8, // Initial estimate
      timestamp: Date.now()
    };
    
    // Enforce defense strategy limits with LRU eviction
    if (this.activeDefenseStrategies.size >= this.resourceLimits.maxDefenseStrategies) {
      const sortedStrategies = Array.from(this.activeDefenseStrategies.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const oldestStrategy = sortedStrategies[0];
      this.activeDefenseStrategies.delete(oldestStrategy[0]);
      this.logger.debug('LRU eviction applied to defense strategies', {
        removed: oldestStrategy[0]
      });
    }

    this.activeDefenseStrategies.set(strategyId, strategy);

    // Execute strategy
    await this.executeDefenseStrategy(strategy);

    this.logger.info('Defense strategy generated', { strategyId, threat });
    this.emit('defenseStrategyGenerated', strategy);
  }

  /**
   * Generate defense actions based on threat consensus
   */
  private generateDefenseActions(consensus: SwarmConsensus): DefenseAction[] {
    const actions: DefenseAction[] = [];
    const threatLevel = consensus.finalDecision;
    
    if (threatLevel > 0.8) {
      // High threat - aggressive defense
      actions.push({
        type: 'block',
        target: 'source_ip',
        parameters: { duration: 3600000 }, // 1 hour
        duration: 3600000
      });
      
      actions.push({
        type: 'alert',
        target: 'admin',
        parameters: { severity: 'critical', message: `High threat detected: ${consensus.threatId}` }
      });
    } else if (threatLevel > 0.6) {
      // Medium threat - moderate defense
      actions.push({
        type: 'throttle',
        target: 'source_ip',
        parameters: { rate: 10, duration: 1800000 }, // 30 minutes
        duration: 1800000
      });
      
      actions.push({
        type: 'monitor',
        target: 'traffic_pattern',
        parameters: { enhanced: true, duration: 3600000 }
      });
    } else {
      // Low threat - monitoring only
      actions.push({
        type: 'monitor',
        target: 'suspicious_activity',
        parameters: { duration: 1800000 }
      });
    }
    
    return actions;
  }

  /**
   * Execute defense strategy
   */
  private async executeDefenseStrategy(strategy: DefenseStrategy): Promise<void> {
    this.logger.info('Executing defense strategy', { strategyId: strategy.id });
    
    for (const action of strategy.actions) {
      await this.executeDefenseAction(action, strategy.id);
    }
    
    this.performanceMetrics.strategiesExecuted++;
    
    // Schedule strategy cleanup and track timeout
    if (strategy.actions.some(action => action.duration)) {
      const maxDuration = Math.max(...strategy.actions
        .filter(action => action.duration)
        .map(action => action.duration!));

      const timeout = setTimeout(() => {
        this.cleanupDefenseStrategy(strategy.id);
      }, maxDuration);
      this.scheduledTimeouts.push(timeout);
    }
  }

  /**
   * Execute individual defense action
   */
  private async executeDefenseAction(action: DefenseAction, strategyId: string): Promise<void> {
    this.logger.info('Executing defense action', { action: action.type, target: action.target, strategyId });
    
    // Publish action to Redis for other components to handle
    const message = {
      type: 'defense_action',
      action,
      strategyId,
      timestamp: Date.now()
    };
    
    await this.redis.publish('swarm:defense:actions', JSON.stringify(message));
    
    // In a real implementation, this would interface with:
    // - Firewall systems for blocking
    // - Load balancers for throttling
    // - Monitoring systems for enhanced surveillance
    // - Alert systems for notifications
  }

  /**
   * Cleanup expired defense strategy
   */
  private cleanupDefenseStrategy(strategyId: string): void {
    this.activeDefenseStrategies.delete(strategyId);
    this.logger.info('Defense strategy cleaned up', { strategyId });
  }

  /**
   * Start consensus processes
   */
  private startConsensusProcesses(): void {
    // Subscribe to consensus responses
    this.redis.subscribe('swarm:consensus:responses');
    
    // Set up periodic consensus cleanup
    const cleanupInterval = setInterval(() => {
      if (!this.isActive) return;
      this.cleanupExpiredConsensus();
    }, 60000); // Every minute
    
    this.monitoringIntervals.push(cleanupInterval);
  }

  /**
   * Clean up expired consensus records with LRU eviction
   */
  private cleanupExpiredConsensus(): void {
    const now = Date.now();
    const expiredKeys = [];

    // Remove expired entries
    for (const [key, consensus] of this.threatConsensus) {
      if (now - consensus.timestamp > 3600000) { // 1 hour
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.threatConsensus.delete(key));

    // Enforce size limit with LRU eviction
    if (this.threatConsensus.size > this.resourceLimits.maxThreatConsensus) {
      const sortedEntries = Array.from(this.threatConsensus.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = this.threatConsensus.size - this.resourceLimits.maxThreatConsensus;
      for (let i = 0; i < toRemove; i++) {
        this.threatConsensus.delete(sortedEntries[i][0]);
      }

      this.logger.debug('LRU eviction applied to threat consensus', { removed: toRemove });
    }

    if (expiredKeys.length > 0) {
      this.logger.debug('Cleaned up expired consensus records', { count: expiredKeys.length });
    }
  }

  /**
   * Start defense management
   */
  private startDefenseManagement(): void {
    // Subscribe to defense action results
    this.redis.subscribe('swarm:defense:results');
    
    // Periodic strategy effectiveness evaluation
    const evaluationInterval = setInterval(() => {
      if (!this.isActive) return;
      this.evaluateDefenseEffectiveness();
    }, 300000); // Every 5 minutes
    
    this.monitoringIntervals.push(evaluationInterval);
  }

  /**
   * Evaluate defense strategy effectiveness
   */
  private evaluateDefenseEffectiveness(): void {
    for (const [strategyId, strategy] of this.activeDefenseStrategies) {
      // In a real implementation, this would analyze:
      // - Reduction in threat incidents
      // - System performance impact
      // - False positive rates
      // - Resource utilization
      
      const simulatedEffectiveness = 0.7 + Math.random() * 0.3;
      strategy.effectiveness = simulatedEffectiveness;
      
      this.logger.debug('Strategy effectiveness evaluated', {
        strategyId,
        effectiveness: simulatedEffectiveness
      });
    }
  }

  /**
   * Start emergent pattern detection
   */
  private startEmergentPatternDetection(): void {
    const detectionInterval = setInterval(() => {
      if (!this.isActive) return;
      this.detectEmergentPatterns();
    }, 30000); // Every 30 seconds
    
    this.monitoringIntervals.push(detectionInterval);
  }

  /**
   * Detect emergent patterns in swarm behavior
   */
  private detectEmergentPatterns(): string[] {
    const patterns: string[] = [];
    
    // Analyze threat patterns
    const recentThreats = Array.from(this.threatConsensus.values())
      .filter(consensus => Date.now() - consensus.timestamp < 1800000); // Last 30 minutes
    
    if (recentThreats.length > 10) {
      patterns.push('high_threat_frequency');
    }
    
    // Analyze agent coordination patterns
    const activeAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'active');
    
    const avgAccuracy = activeAgents.length > 0
      ? activeAgents.reduce((sum, agent) => sum + agent.performance.accuracy, 0) / activeAgents.length
      : 0;
    
    if (avgAccuracy > 0.95) {
      patterns.push('high_swarm_coherence');
    }
    
    // Analyze defense effectiveness patterns
    const recentStrategies = Array.from(this.activeDefenseStrategies.values())
      .filter(strategy => Date.now() - strategy.timestamp < 3600000); // Last hour
    
    const avgEffectiveness = recentStrategies.length > 0
      ? recentStrategies.reduce((sum, strategy) => sum + strategy.effectiveness, 0) / recentStrategies.length
      : 0;
    
    if (avgEffectiveness > 0.9) {
      patterns.push('adaptive_defense_optimization');
    }
    
    return patterns;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(responseTime: number): void {
    this.performanceMetrics.avgResponseTime = 
      (this.performanceMetrics.avgResponseTime + responseTime) / 2;
    
    // Calculate swarm health
    const agentHealth = Array.from(this.agents.values())
      .filter(agent => agent.status === 'active').length / this.agents.size;
    
    const consensusHealth = this.performanceMetrics.consensusReached > 0 ? 1.0 : 0.8;
    const strategiesHealth = this.activeDefenseStrategies.size <= this.config.defense.maxConcurrentStrategies ? 1.0 : 0.7;
    
    this.performanceMetrics.swarmHealth = (agentHealth * 0.5) + (consensusHealth * 0.3) + (strategiesHealth * 0.2);
    this.performanceMetrics.lastUpdate = Date.now();
  }

  /**
   * Setup Redis event handlers
   */
  private setupRedisEventHandlers(): void {
    this.redis.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message);
        
        switch (channel) {
          case 'swarm:consensus:responses':
            this.handleConsensusResponse(data);
            break;
          case 'swarm:defense:results':
            this.handleDefenseResult(data);
            break;
        }
      } catch (error) {
        this.logger.warn('Error processing Redis message', { channel, error });
      }
    });
    
    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error', { error });
    });
  }

  /**
   * Handle consensus response from agents
   */
  private handleConsensusResponse(data: any): void {
    const consensus = this.threatConsensus.get(data.consensusId);
    if (consensus) {
      consensus.votes.push(data.vote);
      this.threatConsensus.set(data.consensusId, consensus);
    }
  }

  /**
   * Handle defense action results
   */
  private handleDefenseResult(data: any): void {
    const strategy = this.activeDefenseStrategies.get(data.strategyId);
    if (strategy) {
      // Update strategy effectiveness based on results
      if (data.success) {
        strategy.effectiveness = Math.min(1.0, strategy.effectiveness + 0.1);
      } else {
        strategy.effectiveness = Math.max(0.1, strategy.effectiveness - 0.1);
      }
      
      this.activeDefenseStrategies.set(data.strategyId, strategy);
    }
  }

  /**
   * Get current swarm status
   */
  getSwarmStatus(): {
    coordinatorId: string;
    isActive: boolean;
    consciousnessState: ConsciousnessState;
    agentCount: number;
    activeThreats: number;
    activeStrategies: number;
    performanceMetrics: PerformanceMetrics;
  } {
    return {
      coordinatorId: this.coordinatorId,
      isActive: this.isActive,
      consciousnessState: this.consciousnessState,
      agentCount: this.agents.size,
      activeThreats: this.getActiveThreats().length,
      activeStrategies: this.activeDefenseStrategies.size,
      performanceMetrics: { ...this.performanceMetrics }
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

export default SwarmCoordinator;