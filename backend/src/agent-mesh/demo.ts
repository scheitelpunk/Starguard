#!/usr/bin/env tsx

/**
 * Quantum Swarm Consciousness System Demo
 * 
 * This demonstration shows the complete quantum swarm system in action:
 * 1. Initialize the swarm coordinator with agents
 * 2. Monitor network traffic and temporal anomalies
 * 3. Demonstrate threat consensus and defense strategies
 * 4. Show emergent consciousness patterns
 */

import { 
  SwarmCoordinator, 
  NullstelleObserver, 
  TemporalGuardian,
  QuantumSwarmFactory,
  PresetConfigurations,
  QuantumSwarmUtils
} from './index';

class QuantumSwarmDemo {
  private swarm?: SwarmCoordinator;
  private isRunning: boolean = false;

  async runDemo(): Promise<void> {
    console.log('🚀 Starting Quantum Swarm Consciousness System Demo');
    console.log('=' .repeat(60));

    try {
      // Step 1: System Configuration
      await this.demonstrateConfiguration();

      // Step 2: Initialize Swarm
      await this.initializeSwarm();

      // Step 3: Monitor System Activity
      await this.monitorSwarmActivity();

      // Step 4: Simulate Threats and Responses
      await this.simulateThreatsAndResponses();

      // Step 5: Show Advanced Features
      await this.demonstrateAdvancedFeatures();

    } catch (error) {
      console.error('❌ Demo failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async demonstrateConfiguration(): Promise<void> {
    console.log('\n📋 Step 1: System Configuration');
    console.log('-'.repeat(40));

    // Show available presets
    console.log('Available configuration presets:');
    Object.keys(PresetConfigurations).forEach(preset => {
      console.log(`  - ${preset}: ${this.describePreset(preset)}`);
    });

    // Show system recommendation
    const systemInfo = {
      cpuCores: 8,
      memoryGB: 16,
      networkBandwidthMbps: 1000,
      securityLevel: 'high' as const
    };

    const recommendedConfig = QuantumSwarmUtils.calculateRecommendedConfig(systemInfo);
    console.log('\n🎯 Recommended configuration for your system:');
    console.log(JSON.stringify(recommendedConfig, null, 2));

    // Validate configuration
    const validation = QuantumSwarmUtils.validateConfig(recommendedConfig);
    console.log(`\n✅ Configuration valid: ${validation.valid}`);
    if (!validation.valid) {
      console.log('❌ Errors:', validation.errors);
    }
  }

  private async initializeSwarm(): Promise<void> {
    console.log('\n🧠 Step 2: Initializing Quantum Swarm');
    console.log('-'.repeat(40));

    // Create swarm with test configuration
    this.swarm = QuantumSwarmFactory.createTestSwarm();
    
    // Set up event listeners for monitoring
    this.setupEventListeners();

    try {
      console.log('🔄 Starting swarm coordinator...');
      await this.swarm?.start();
      this.isRunning = true;

      if (this.swarm) {
        const status = this.swarm.getSwarmStatus();
        console.log(`✅ Swarm initialized with ${status.agentCount} agents`);
        console.log(`🆔 Coordinator ID: ${status.coordinatorId}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to start swarm:', error);
      throw error;
    }
  }

  private async monitorSwarmActivity(): Promise<void> {
    if (!this.swarm) return;

    console.log('\n📊 Step 3: Monitoring Swarm Activity');
    console.log('-'.repeat(40));

    // Monitor for 10 seconds
    const monitoringDuration = 10000;
    const startTime = Date.now();

    console.log(`🔍 Monitoring swarm activity for ${monitoringDuration/1000} seconds...`);

    const monitorInterval = setInterval(() => {
      if (!this.swarm) return;

      const status = this.swarm.getSwarmStatus();
      const uptime = Date.now() - startTime;
      
      console.log(`[${Math.floor(uptime/1000)}s] Threat Level: ${(status.consciousnessState.threatLevel * 100).toFixed(1)}% | ` +
                 `Coherence: ${(status.consciousnessState.swarmCoherence * 100).toFixed(1)}% | ` +
                 `Active Threats: ${status.activeThreats} | ` +
                 `Strategies: ${status.activeStrategies}`);

      if (status.consciousnessState.emergentPatterns.length > 0) {
        console.log(`🌟 Emergent patterns detected: ${status.consciousnessState.emergentPatterns.join(', ')}`);
      }
    }, 2000);

    await this.sleep(monitoringDuration);
    clearInterval(monitorInterval);
  }

  private async simulateThreatsAndResponses(): Promise<void> {
    console.log('\n⚡ Step 4: Threat Detection and Response Demo');
    console.log('-'.repeat(40));

    if (!this.swarm) return;

    console.log('🎭 The swarm agents are continuously monitoring for threats...');
    console.log('📡 NullstelleObserver agents are analyzing network patterns');
    console.log('🕐 TemporalGuardian agents are monitoring timing anomalies');
    console.log('🧠 SwarmCoordinator is managing consensus and defense strategies');

    // Wait for natural threat detection and consensus
    let consensusCount = 0;
    let defenseCount = 0;

    const threatMonitoringDuration = 15000;
    const startTime = Date.now();

    console.log(`\n⏱️  Waiting ${threatMonitoringDuration/1000}s for natural threat detection...`);

    while (Date.now() - startTime < threatMonitoringDuration) {
      const status = this.swarm.getSwarmStatus();
      
      if (status.performanceMetrics.consensusReached > consensusCount) {
        consensusCount = status.performanceMetrics.consensusReached;
        console.log(`🤝 Consensus reached on threat #${consensusCount}`);
      }

      if (status.performanceMetrics.strategiesExecuted > defenseCount) {
        defenseCount = status.performanceMetrics.strategiesExecuted;
        console.log(`🛡️  Defense strategy #${defenseCount} executed`);
      }

      await this.sleep(1000);
    }

    console.log(`\n📈 Summary: ${consensusCount} consensus decisions, ${defenseCount} defense strategies`);
  }

  private async demonstrateAdvancedFeatures(): Promise<void> {
    console.log('\n🚀 Step 5: Advanced Features Demonstration');
    console.log('-'.repeat(40));

    if (!this.swarm) return;

    // Generate comprehensive health report
    const healthReport = QuantumSwarmUtils.generateHealthReport(this.swarm);
    console.log('🏥 System Health Report:');
    console.log(JSON.stringify(healthReport, null, 2));

    // Show individual component demonstrations
    await this.demonstrateEntropyAnalysis();
    await this.demonstrateTemporalAnalysis();
    await this.demonstrateConsciousnessEvolution();
  }

  private async demonstrateEntropyAnalysis(): Promise<void> {
    console.log('\n🔬 Entropy Analysis Demonstration:');
    
    const { EntropyCalculator } = await import('./utils/entropy');
    
    // High entropy data (random)
    const randomData = Buffer.alloc(1000);
    for (let i = 0; i < 1000; i++) {
      randomData[i] = Math.floor(Math.random() * 256);
    }
    const highEntropy = EntropyCalculator.calculateShannonEntropy(randomData);
    
    // Low entropy data (repetitive)
    const repetitiveData = Buffer.alloc(1000, 0xAA);
    const lowEntropy = EntropyCalculator.calculateShannonEntropy(repetitiveData);
    
    console.log(`  📊 Random data entropy: ${highEntropy.toFixed(2)} bits`);
    console.log(`  📊 Repetitive data entropy: ${lowEntropy.toFixed(2)} bits`);
    console.log(`  🎯 Entropy threshold: 6.0 bits (values above indicate anomalies)`);
  }

  private async demonstrateTemporalAnalysis(): Promise<void> {
    console.log('\n⏰ Temporal Analysis Demonstration:');
    
    const { TimingAnalyzer } = await import('./utils/timing');
    
    // Regular timing pattern
    const regularTimings = Array.from({length: 20}, (_, i) => 1000 + i * 100);
    const regularStats = TimingAnalyzer.calculateTimingVariance(regularTimings);
    
    // Irregular timing pattern  
    const irregularTimings = Array.from({length: 20}, (_, i) => 1000 + i * 100 + Math.random() * 50);
    const irregularStats = TimingAnalyzer.calculateTimingVariance(irregularTimings);
    
    console.log(`  📈 Regular pattern CV: ${regularStats.coefficientOfVariation.toFixed(3)}`);
    console.log(`  📈 Irregular pattern CV: ${irregularStats.coefficientOfVariation.toFixed(3)}`);
    console.log(`  🎯 Timing threshold: 2.5 (values above indicate potential attacks)`);
  }

  private async demonstrateConsciousnessEvolution(): Promise<void> {
    console.log('\n🧠 Consciousness Evolution:');

    if (!this.swarm) return;

    const initialState = this.swarm.getSwarmStatus().consciousnessState;
    console.log(`  🎭 Initial state - Threat: ${(initialState.threatLevel * 100).toFixed(1)}%, ` +
               `Coherence: ${(initialState.swarmCoherence * 100).toFixed(1)}%`);

    // Wait a bit for state evolution
    await this.sleep(5000);

    const evolvedState = this.swarm.getSwarmStatus().consciousnessState;
    console.log(`  🎭 Evolved state - Threat: ${(evolvedState.threatLevel * 100).toFixed(1)}%, ` +
               `Coherence: ${(evolvedState.swarmCoherence * 100).toFixed(1)}%`);

    const threatDelta = evolvedState.threatLevel - initialState.threatLevel;
    const coherenceDelta = evolvedState.swarmCoherence - initialState.swarmCoherence;

    console.log(`  📊 Evolution - Threat Δ: ${(threatDelta * 100).toFixed(2)}%, ` +
               `Coherence Δ: ${(coherenceDelta * 100).toFixed(2)}%`);
  }

  private setupEventListeners(): void {
    if (!this.swarm) return;

    this.swarm.on('consciousnessUpdated', (state) => {
      if (state.emergentPatterns.length > 0) {
        console.log(`🌟 Emergent patterns: ${state.emergentPatterns.join(', ')}`);
      }
    });

    this.swarm.on('consensusReached', (consensus) => {
      console.log(`🤝 Consensus: Threat ${consensus.threatId} - Decision: ${(consensus.finalDecision * 100).toFixed(1)}%`);
    });

    this.swarm.on('defenseStrategyGenerated', (strategy) => {
      console.log(`🛡️  Defense: ${strategy.name} with ${strategy.actions.length} actions (Priority: ${strategy.priority})`);
    });
  }

  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up...');
    
    if (this.swarm && this.isRunning) {
      await this.swarm.stop();
      this.isRunning = false;
      console.log('✅ Swarm stopped gracefully');
    }

    console.log('\n🎉 Demo completed successfully!');
    console.log('=' .repeat(60));
  }

  private describePreset(preset: string): string {
    const descriptions: Record<string, string> = {
      DEVELOPMENT: 'High sensitivity, frequent updates, suitable for testing',
      STAGING: 'Balanced settings for pre-production environments',
      PRODUCTION: 'Optimized for production with high precision',
      CRITICAL: 'Maximum security for critical infrastructure'
    };
    return descriptions[preset] || 'Custom configuration';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Performance benchmark function
async function runPerformanceBenchmark(): Promise<void> {
  console.log('\n⚡ Performance Benchmark');
  console.log('-'.repeat(40));

  const { EntropyCalculator, TimingAnalyzer } = await import('./index');

  // Entropy calculation benchmark
  const startTime = process.hrtime.bigint();
  const iterations = 1000;
  
  for (let i = 0; i < iterations; i++) {
    const data = Buffer.alloc(512);
    for (let j = 0; j < 512; j++) {
      data[j] = Math.floor(Math.random() * 256);
    }
    EntropyCalculator.calculateShannonEntropy(data);
  }
  
  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1000000;
  
  console.log(`📊 Entropy calculations: ${iterations} iterations in ${duration.toFixed(2)}ms`);
  console.log(`📊 Average time per calculation: ${(duration / iterations).toFixed(3)}ms`);

  // Timing analysis benchmark
  const timestamps = Array.from({length: 1000}, (_, i) => Date.now() + i * 100);
  
  const timingStart = process.hrtime.bigint();
  TimingAnalyzer.calculateTimingVariance(timestamps);
  const timingEnd = process.hrtime.bigint();
  
  const timingDuration = Number(timingEnd - timingStart) / 1000000;
  console.log(`⏱️  Timing analysis: 1000 timestamps processed in ${timingDuration.toFixed(2)}ms`);
}

// Main execution
async function main(): Promise<void> {
  // Check if running in benchmark mode
  if (process.argv.includes('--benchmark')) {
    await runPerformanceBenchmark();
    return;
  }

  // Run the main demo
  const demo = new QuantumSwarmDemo();
  await demo.runDemo();
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { QuantumSwarmDemo };