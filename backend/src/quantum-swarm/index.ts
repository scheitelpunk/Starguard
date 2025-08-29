/**
 * Quantum Swarm Consciousness System - STARGUARD
 * 
 * A distributed, autonomous security system that uses quantum-inspired
 * swarm intelligence to detect, analyze, and respond to security threats
 * in real-time through emergent collective consciousness.
 * 
 * Core Components:
 * - NullstelleObserver: Network traffic analysis with entropy calculation
 * - TemporalGuardian: System time monitoring and Lamport clock synchronization  
 * - SwarmCoordinator: Central consciousness and defense strategy coordination
 * 
 * Features:
 * - Real-time threat detection and consensus
 * - Shannon entropy analysis for anomaly detection
 * - Temporal anomaly detection with clock drift monitoring
 * - Distributed consensus algorithms for threat validation
 * - Adaptive defense strategy generation
 * - Emergent pattern recognition
 * - Redis-based coordination and state management
 */

// Core Agents
export { NullstelleObserver } from './agents/nullstelle-observer';
export { TemporalGuardian } from './agents/temporal-guardian';

// Central Coordinator
export { SwarmCoordinator } from './swarm-coordinator';

// Utility Classes
export { EntropyCalculator } from './utils/entropy';
export { TimingAnalyzer } from './utils/timing';

// Type Definitions
export * from './types';

// Factory Functions for Easy Setup
export class QuantumSwarmFactory {
  /**
   * Create a complete quantum swarm instance with default configuration
   */
  static createDefaultSwarm(config?: {
    redis?: {
      host?: string;
      port?: number;
      password?: string;
      db?: number;
    };
    consciousness?: {
      updateInterval?: number;
      consensusThreshold?: number;
      threatThreshold?: number;
      coherenceThreshold?: number;
    };
    defense?: {
      strategyTimeout?: number;
      maxConcurrentStrategies?: number;
      adaptiveLearning?: boolean;
    };
  }) {
    return new SwarmCoordinator(config);
  }

  /**
   * Create a standalone network observer
   */
  static createNetworkObserver(config?: {
    interface?: string;
    captureSize?: number;
    entropyThreshold?: number;
    timingThreshold?: number;
    analysisWindow?: number;
    alertThreshold?: number;
  }) {
    return new NullstelleObserver(config);
  }

  /**
   * Create a standalone temporal guardian
   */
  static createTemporalGuardian(nodeId?: string, config?: {
    clockDriftThreshold?: number;
    timestampAnomalyThreshold?: number;
    synchronizationInterval?: number;
    maxClockOffset?: number;
    ntpServers?: string[];
  }) {
    return new TemporalGuardian(nodeId, config);
  }

  /**
   * Create a minimal swarm for testing
   */
  static createTestSwarm() {
    return new SwarmCoordinator({
      redis: {
        host: 'localhost',
        port: 6379,
        db: 15 // Use a different DB for testing
      },
      consciousness: {
        updateInterval: 1000,
        consensusThreshold: 0.6,
        threatThreshold: 0.5,
        coherenceThreshold: 0.7
      },
      defense: {
        strategyTimeout: 60000, // 1 minute
        maxConcurrentStrategies: 5,
        adaptiveLearning: true
      }
    });
  }

  /**
   * Create a high-performance production swarm
   */
  static createProductionSwarm(redisConfig: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  }) {
    return new SwarmCoordinator({
      redis: redisConfig,
      consciousness: {
        updateInterval: 2000, // 2 seconds
        consensusThreshold: 0.8,
        threatThreshold: 0.7,
        coherenceThreshold: 0.9
      },
      defense: {
        strategyTimeout: 600000, // 10 minutes
        maxConcurrentStrategies: 20,
        adaptiveLearning: true
      }
    });
  }
}

// Preset Configurations
export const PresetConfigurations = {
  // High sensitivity for development environments
  DEVELOPMENT: {
    consciousness: {
      updateInterval: 1000,
      consensusThreshold: 0.6,
      threatThreshold: 0.4,
      coherenceThreshold: 0.7
    },
    nullstelle: {
      entropyThreshold: 5.5,
      timingThreshold: 2.0,
      analysisWindow: 100,
      alertThreshold: 0.6
    },
    temporal: {
      clockDriftThreshold: 2000,
      timestampAnomalyThreshold: 10000,
      synchronizationInterval: 60000,
      maxClockOffset: 15000
    }
  },

  // Balanced settings for staging environments
  STAGING: {
    consciousness: {
      updateInterval: 3000,
      consensusThreshold: 0.7,
      threatThreshold: 0.6,
      coherenceThreshold: 0.8
    },
    nullstelle: {
      entropyThreshold: 6.0,
      timingThreshold: 2.5,
      analysisWindow: 150,
      alertThreshold: 0.7
    },
    temporal: {
      clockDriftThreshold: 1000,
      timestampAnomalyThreshold: 5000,
      synchronizationInterval: 30000,
      maxClockOffset: 10000
    }
  },

  // High precision for production environments
  PRODUCTION: {
    consciousness: {
      updateInterval: 5000,
      consensusThreshold: 0.8,
      threatThreshold: 0.7,
      coherenceThreshold: 0.9
    },
    nullstelle: {
      entropyThreshold: 6.5,
      timingThreshold: 3.0,
      analysisWindow: 200,
      alertThreshold: 0.75
    },
    temporal: {
      clockDriftThreshold: 500,
      timestampAnomalyThreshold: 3000,
      synchronizationInterval: 15000,
      maxClockOffset: 5000
    }
  },

  // Ultra-high security for critical systems
  CRITICAL: {
    consciousness: {
      updateInterval: 2000,
      consensusThreshold: 0.9,
      threatThreshold: 0.8,
      coherenceThreshold: 0.95
    },
    nullstelle: {
      entropyThreshold: 7.0,
      timingThreshold: 1.5,
      analysisWindow: 300,
      alertThreshold: 0.8
    },
    temporal: {
      clockDriftThreshold: 200,
      timestampAnomalyThreshold: 1000,
      synchronizationInterval: 10000,
      maxClockOffset: 2000
    }
  }
};

// Utility Functions
export class QuantumSwarmUtils {
  /**
   * Validate swarm configuration
   */
  static validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.consciousness) {
      if (config.consciousness.consensusThreshold < 0 || config.consciousness.consensusThreshold > 1) {
        errors.push('consensusThreshold must be between 0 and 1');
      }
      if (config.consciousness.threatThreshold < 0 || config.consciousness.threatThreshold > 1) {
        errors.push('threatThreshold must be between 0 and 1');
      }
      if (config.consciousness.updateInterval < 100) {
        errors.push('updateInterval should be at least 100ms');
      }
    }

    if (config.redis) {
      if (!config.redis.host || typeof config.redis.host !== 'string') {
        errors.push('Redis host is required and must be a string');
      }
      if (config.redis.port && (config.redis.port < 1 || config.redis.port > 65535)) {
        errors.push('Redis port must be between 1 and 65535');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate recommended configuration based on system resources
   */
  static calculateRecommendedConfig(systemInfo: {
    cpuCores: number;
    memoryGB: number;
    networkBandwidthMbps: number;
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
  }) {
    const baseConfig = PresetConfigurations.PRODUCTION;
    
    // Adjust based on CPU cores
    const cpuFactor = Math.min(systemInfo.cpuCores / 4, 2);
    
    // Adjust based on memory
    const memoryFactor = Math.min(systemInfo.memoryGB / 8, 2);
    
    // Adjust based on security level
    const securityMultiplier = {
      low: 0.7,
      medium: 1.0,
      high: 1.3,
      critical: 1.6
    }[systemInfo.securityLevel];

    return {
      consciousness: {
        updateInterval: Math.max(1000, baseConfig.consciousness.updateInterval / cpuFactor),
        consensusThreshold: Math.min(0.95, baseConfig.consciousness.consensusThreshold * securityMultiplier),
        threatThreshold: Math.min(0.9, baseConfig.consciousness.threatThreshold * securityMultiplier),
        coherenceThreshold: baseConfig.consciousness.coherenceThreshold
      },
      nullstelle: {
        entropyThreshold: baseConfig.nullstelle.entropyThreshold * securityMultiplier,
        analysisWindow: Math.floor(baseConfig.nullstelle.analysisWindow * memoryFactor),
        alertThreshold: Math.min(0.9, baseConfig.nullstelle.alertThreshold * securityMultiplier)
      },
      temporal: {
        clockDriftThreshold: baseConfig.temporal.clockDriftThreshold / securityMultiplier,
        synchronizationInterval: Math.max(5000, baseConfig.temporal.synchronizationInterval / cpuFactor)
      }
    };
  }

  /**
   * Generate system health report
   */
  static generateHealthReport(swarm: SwarmCoordinator) {
    const status = swarm.getSwarmStatus();
    const timestamp = new Date().toISOString();

    return {
      timestamp,
      overall: {
        status: status.isActive ? 'ACTIVE' : 'INACTIVE',
        health: status.performanceMetrics.swarmHealth,
        coordinatorId: status.coordinatorId
      },
      agents: {
        total: status.agentCount,
        active: status.agentCount // Simplified - in reality would check each agent
      },
      threats: {
        active: status.activeThreats,
        processed: status.performanceMetrics.threatsProcessed,
        consensusReached: status.performanceMetrics.consensusReached
      },
      consciousness: {
        threatLevel: status.consciousnessState.threatLevel,
        swarmCoherence: status.consciousnessState.swarmCoherence,
        emergentPatterns: status.consciousnessState.emergentPatterns.length
      },
      defense: {
        activeStrategies: status.activeStrategies,
        strategiesExecuted: status.performanceMetrics.strategiesExecuted
      },
      performance: {
        avgResponseTime: status.performanceMetrics.avgResponseTime,
        lastUpdate: new Date(status.performanceMetrics.lastUpdate).toISOString()
      }
    };
  }
}

// Constants
export const QUANTUM_SWARM_VERSION = '1.0.0';
export const CONSCIOUSNESS_PROTOCOLS = {
  CONSENSUS: 'swarm:consensus',
  DEFENSE: 'swarm:defense',
  CONSCIOUSNESS: 'swarm:consciousness',
  COORDINATION: 'swarm:coordination'
};

// Default export for convenience
export default {
  SwarmCoordinator,
  NullstelleObserver,
  TemporalGuardian,
  QuantumSwarmFactory,
  PresetConfigurations,
  QuantumSwarmUtils,
  EntropyCalculator,
  TimingAnalyzer,
  QUANTUM_SWARM_VERSION,
  CONSCIOUSNESS_PROTOCOLS
};