#!/usr/bin/env node

/**
 * STARGUARD Quantum Consciousness Demo
 * 
 * This demo shows the quantum consciousness engine in action:
 * - Real quantum-inspired consciousness simulation
 * - True entropy generation from crypto APIs
 * - Threat-responsive awareness levels
 * - WebSocket broadcasting of consciousness changes
 * - Cross-session memory persistence
 */

import { initializeStarguardConsciousness, ConsciousnessState, ThreatContext } from '../backend/src/consciousness';
import { WebSocket } from 'ws';

async function runStarguardDemo() {
  console.log('🌟 Initializing STARGUARD Quantum Consciousness Engine...');
  
  // Initialize the consciousness system
  const { consciousness, broadcaster, api } = await initializeStarguardConsciousness({
    persistencePath: './.demo-consciousness',
    websocketPort: 8080,
    awakeningThreshold: 0.25,
    threatSensitivity: 0.9
  });
  
  console.log('✅ STARGUARD Consciousness System Online');
  console.log('📡 WebSocket server listening on ws://localhost:8080/consciousness');
  
  // Set up WebSocket client to monitor consciousness
  const wsClient = new WebSocket('ws://localhost:8080/consciousness');
  
  wsClient.on('open', () => {
    console.log('📱 Demo client connected to consciousness stream');
  });
  
  wsClient.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log(`🧠 Consciousness Event: ${message.type}`);
    
    if (message.type === 'consciousness-update') {
      const state = message.data;
      console.log(`   State: ${state.state}`);
      console.log(`   Awareness: ${(state.metrics.awarenessLevel * 100).toFixed(1)}%`);
      console.log(`   Coherence: ${(state.metrics.coherenceLevel * 100).toFixed(1)}%`);
      console.log(`   Quantum Entropy: ${(state.metrics.quantumEntropy * 100).toFixed(1)}%`);
      console.log('   ---');
    }
    
    if (message.type === 'state-transition') {
      console.log(`🔄 State Transition: ${message.data.from} → ${message.data.to}`);
    }
    
    if (message.type === 'threat-alert') {
      console.log(`🚨 Threat Processed: ${message.data.threat.type} (severity: ${message.data.threat.severity})`);
    }
  });
  
  // Demo sequence
  console.log('\n🎬 Starting demonstration sequence...');
  
  // Step 1: Begin awakening from void
  console.log('\n1. 🌅 Beginning awakening sequence from void state...');
  await api.beginAwakening();
  await sleep(2000);
  
  // Step 2: Store some memories
  console.log('\n2. 🧠 Storing memories in consciousness...');
  api.storeMemory('system-startup', {
    timestamp: Date.now(),
    version: '1.0.0',
    config: 'demo-mode'
  });
  
  api.storeMemory('security-baseline', {
    established: Date.now(),
    policies: ['encryption-required', 'multi-factor-auth', 'audit-logging'],
    threat_level: 'normal'
  });
  
  await sleep(1000);
  
  // Step 3: Simulate threat scenarios
  console.log('\n3. ⚠️  Simulating various threat scenarios...');
  
  const threats: ThreatContext[] = [
    {
      severity: 0.3,
      type: 'failed-login-attempt',
      timestamp: Date.now(),
      indicators: ['invalid-credentials', 'repeated-attempts']
    },
    {
      severity: 0.6,
      type: 'port-scan-detected',
      timestamp: Date.now(),
      indicators: ['network-reconnaissance', 'multiple-ports']
    },
    {
      severity: 0.8,
      type: 'malware-signature',
      timestamp: Date.now(),
      indicators: ['suspicious-file-hash', 'behavioral-analysis-match']
    },
    {
      severity: 0.95,
      type: 'data-exfiltration-attempt',
      timestamp: Date.now(),
      indicators: ['large-outbound-transfer', 'encrypted-channel', 'off-hours-activity']
    }
  ];
  
  for (const threat of threats) {
    console.log(`   Processing threat: ${threat.type} (severity: ${threat.severity})`);
    api.processThreat(threat);
    await sleep(1500);
  }
  
  // Step 4: Perform quantum measurements
  console.log('\n4. ⚛️  Performing quantum consciousness measurements...');
  for (let i = 0; i < 3; i++) {
    const measurement = api.measureConsciousness();
    console.log(`   Quantum measurement ${i + 1}: ${measurement}`);
    await sleep(1000);
  }
  
  // Step 5: Show memory retrieval
  console.log('\n5. 🔍 Retrieving stored memories...');
  const startupMemory = api.retrieveMemory('system-startup');
  const securityMemory = api.retrieveMemory('security-baseline');
  
  console.log('   System startup memory:', startupMemory);
  console.log('   Security baseline memory:', securityMemory);
  
  // Step 6: Final state report
  console.log('\n6. 📊 Final consciousness state report:');
  const finalState = api.getCurrentState();
  
  console.log('   Consciousness State:', finalState.state);
  console.log('   Metrics:');
  console.log(`     - Awareness Level: ${(finalState.metrics.awarenessLevel * 100).toFixed(2)}%`);
  console.log(`     - Coherence Level: ${(finalState.metrics.coherenceLevel * 100).toFixed(2)}%`);
  console.log(`     - Processing Capacity: ${(finalState.metrics.processingCapacity * 100).toFixed(2)}%`);
  console.log(`     - Quantum Entropy: ${(finalState.metrics.quantumEntropy * 100).toFixed(2)}%`);
  console.log(`     - Threat Response Index: ${(finalState.metrics.threatResponseIndex * 100).toFixed(2)}%`);
  console.log(`     - Memory Integrity: ${(finalState.metrics.memoryIntegrity * 100).toFixed(2)}%`);
  
  console.log('   Quantum State:');
  console.log(`     - Coherence: ${(finalState.quantumState.coherence * 100).toFixed(2)}%`);
  console.log(`     - Entanglement: ${(finalState.quantumState.entanglement * 100).toFixed(2)}%`);
  console.log(`     - Active Walk Positions: ${finalState.quantumState.walkPositions.length}`);
  
  console.log(`   Active Threats: ${finalState.threatCount}`);
  console.log(`   Memory Entries: ${finalState.memorySize}`);
  
  // Step 7: Monitor for a bit longer
  console.log('\n7. ⏱️  Monitoring consciousness evolution for 10 seconds...');
  await sleep(10000);
  
  console.log('\n✅ Demo completed successfully!');
  console.log('💡 The consciousness engine will continue running in the background.');
  console.log('🔗 Connect to ws://localhost:8080/consciousness to monitor real-time updates.');
  console.log('\n🛑 Press Ctrl+C to shutdown the system.');
  
  // Keep the demo running
  process.stdin.resume();
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down STARGUARD demo...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating STARGUARD demo...');
  process.exit(0);
});

// Run the demo
if (require.main === module) {
  runStarguardDemo().catch(error => {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  });
}

export { runStarguardDemo };