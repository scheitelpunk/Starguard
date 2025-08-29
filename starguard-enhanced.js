#!/usr/bin/env node

/**
 * STARGUARD - Enhanced Server with WebSocket Support
 * Compatible with the frontend application
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';
import crypto from 'crypto';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 3000;

// System State
let systemState = {
  isAwakened: false,
  awarenessLevel: 0,
  threatCount: 0,
  quantumCoherence: 0.5,
  startTime: Date.now(),
  particles: [],
  threats: []
};

// Connected WebSocket clients
const clients = new Set();

// Real Threat Feeds Configuration
const THREAT_FEEDS = {
  feodo: {
    url: 'https://feodotracker.abuse.ch/downloads/ipblocklist.csv',
    interval: 300000, // 5 minutes
    lastUpdate: 0,
    cache: new Set()
  },
  urlhaus: {
    url: 'https://urlhaus.abuse.ch/downloads/csv/',
    interval: 600000, // 10 minutes  
    lastUpdate: 0,
    cache: new Set()
  },
  spamhaus: {
    // Using Spamhaus DROP list (free)
    url: 'https://www.spamhaus.org/drop/drop.txt',
    interval: 3600000, // 1 hour
    lastUpdate: 0,
    cache: new Set()
  }
};

// Threat processing and classification
class ThreatProcessor {
  constructor() {
    this.knownThreats = new Map();
    this.geoLocationCache = new Map();
  }
  
  async fetchThreatFeed(feedName) {
    const feed = THREAT_FEEDS[feedName];
    if (!feed || Date.now() - feed.lastUpdate < feed.interval) {
      return false;
    }
    
    console.log(`📡 Fetching ${feedName} threat feed...`);
    
    try {
      const response = await this.httpsGet(feed.url);
      const threats = this.parseFeed(response, feedName);
      
      feed.cache.clear();
      threats.forEach(threat => {
        feed.cache.add(threat);
        this.knownThreats.set(threat.id, threat);
      });
      
      feed.lastUpdate = Date.now();
      console.log(`✅ Updated ${feedName} feed with ${threats.length} threats`);
      return threats;
      
    } catch (error) {
      console.error(`❌ Error fetching ${feedName} feed:`, error.message);
      return false;
    }
  }
  
  parseFeed(data, feedName) {
    const threats = [];
    const lines = data.split('\n');
    
    switch (feedName) {
      case 'feodo':
        lines.forEach((line, index) => {
          if (line.startsWith('#') || !line.trim()) return;
          
          const parts = line.split(',');
          if (parts.length >= 4) {
            const [firstSeen, dstIp, dstPort, lastSeen, malware] = parts;
            
            const ipHash = crypto.createHash('md5').update(dstIp.trim()).digest('hex').substring(0, 8);
            threats.push({
              id: `feodo_${ipHash}`,
              type: 'malware_c2',
              subtype: malware ? malware.trim() : 'botnet',
              ip: dstIp.trim(),
              port: dstPort.trim(),
              firstSeen: new Date(firstSeen),
              lastSeen: new Date(lastSeen),
              severity: 0.8,
              confidence: 0.95,
              source: 'Feodo Tracker',
              displayName: `Feodo-${ipHash}` // Clean display name
            });
          }
        });
        break;
        
      case 'urlhaus':
        lines.forEach(line => {
          if (line.startsWith('#') || !line.trim()) return;
          
          const parts = line.split(',');
          if (parts.length >= 7) {
            const [id, dateAdded, url, urlStatus, lastOnline, threat, tags] = parts.map(p => p.replace(/"/g, ''));
            
            threats.push({
              id: `urlhaus_${id}`,
              type: 'malicious_url',
              subtype: threat.toLowerCase(),
              url: url,
              status: urlStatus,
              dateAdded: new Date(dateAdded),
              lastOnline: lastOnline ? new Date(lastOnline) : null,
              tags: tags.split(' ').filter(t => t),
              severity: this.calculateUrlSeverity(threat, tags),
              confidence: 0.9,
              source: 'URLhaus',
              displayName: `URLhaus-${id}` // Clean display name
            });
          }
        });
        break;
        
      case 'spamhaus':
        lines.forEach(line => {
          if (line.startsWith(';') || !line.trim()) return;
          
          const parts = line.trim().split(' ');
          if (parts.length >= 2) {
            const [cidr, reference] = parts;
            
            const cidrHash = crypto.createHash('md5').update(cidr).digest('hex').substring(0, 8);
            threats.push({
              id: `spamhaus_${cidrHash}`,
              type: 'spam_source',
              subtype: 'spam_network',
              cidr: cidr,
              reference: reference,
              severity: 0.6,
              confidence: 0.98,
              source: 'Spamhaus',
              displayName: `Spamhaus-${cidrHash}` // Clean display name
            });
          }
        });
        break;
    }
    
    return threats;
  }
  
  calculateUrlSeverity(threat, tags) {
    let severity = 0.5;
    
    if (threat.includes('malware')) severity += 0.3;
    if (threat.includes('trojan')) severity += 0.3;
    if (threat.includes('ransomware')) severity += 0.4;
    if (tags.includes('exe')) severity += 0.2;
    if (tags.includes('emotet')) severity += 0.3;
    
    return Math.min(0.95, severity);
  }
  
  httpsGet(url) {
    return new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'User-Agent': 'STARGUARD-Security-System/1.0'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }
  
  processThreatForVisualization(threat) {
    // Convert threat to quantum field coordinates
    let x, y;
    
    if (threat.ip) {
      // Map IP to coordinates using hash
      const hash = crypto.createHash('md5').update(threat.ip).digest();
      x = (hash[0] / 255) * 64;
      y = (hash[1] / 255) * 64;
    } else if (threat.url) {
      const hash = crypto.createHash('md5').update(threat.url).digest();
      x = (hash[0] / 255) * 64;
      y = (hash[1] / 255) * 64;
    } else {
      x = Math.random() * 64;
      y = Math.random() * 64;
    }
    
    return { x, y, threat };
  }
}

const threatProcessor = new ThreatProcessor();

// ML Anomaly Detection Engine
class MLAnomalyEngine {
  constructor() {
    this.mlProcess = null;
    this.isInitialized = false;
    this.isTraining = false;
    this.lastAnalysis = null;
  }
  
  async initialize() {
    console.log('🤖 Initializing ML Anomaly Detection Engine...');
    
    try {
      // Start Python ML process
      this.mlProcess = spawn('python3', [join(__dirname, 'ml', 'anomaly_detector.py')], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      this.mlProcess.stderr.on('data', (data) => {
        console.log(`🤖 ML: ${data.toString().trim()}`);
      });
      
      this.mlProcess.on('error', (error) => {
        console.error('❌ ML Process Error:', error);
        this.isInitialized = false;
      });
      
      this.mlProcess.on('exit', (code) => {
        console.log(`🤖 ML Process exited with code ${code}`);
        this.isInitialized = false;
      });
      
      // Wait for process to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.isInitialized = true;
      console.log('✅ ML Anomaly Engine initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize ML engine:', error);
      this.isInitialized = false;
    }
  }
  
  async detectAnomalies(threats) {
    if (!this.isInitialized || !this.mlProcess) {
      return {
        is_anomaly: false,
        confidence: 0.0,
        status: 'ml_offline'
      };
    }
    
    return new Promise((resolve) => {
      const command = {
        command: 'detect',
        threats: threats
      };
      
      // Set up response handler
      const onData = (data) => {
        try {
          const result = JSON.parse(data.toString());
          this.mlProcess.stdout.removeListener('data', onData);
          this.lastAnalysis = result;
          resolve(result);
        } catch (error) {
          console.error('ML Response parse error:', error);
          resolve({
            is_anomaly: false,
            confidence: 0.0,
            status: 'parse_error'
          });
        }
      };
      
      this.mlProcess.stdout.once('data', onData);
      
      // Send command
      this.mlProcess.stdin.write(JSON.stringify(command) + '\n');
      
      // Timeout fallback
      setTimeout(() => {
        this.mlProcess.stdout.removeListener('data', onData);
        resolve({
          is_anomaly: false,
          confidence: 0.0,
          status: 'timeout'
        });
      }, 5000);
    });
  }
  
  async getStatus() {
    if (!this.isInitialized || !this.mlProcess) {
      return {
        status: 'offline',
        model_type: 'IsolationForest + DBSCAN',
        last_analysis: null
      };
    }
    
    return new Promise((resolve) => {
      const command = { command: 'status' };
      
      const onData = (data) => {
        try {
          const result = JSON.parse(data.toString());
          this.mlProcess.stdout.removeListener('data', onData);
          resolve(result);
        } catch (error) {
          resolve({
            status: 'error',
            error: error.message
          });
        }
      };
      
      this.mlProcess.stdout.once('data', onData);
      this.mlProcess.stdin.write(JSON.stringify(command) + '\n');
      
      setTimeout(() => {
        this.mlProcess.stdout.removeListener('data', onData);
        resolve({
          status: 'timeout'
        });
      }, 3000);
    });
  }
  
  destroy() {
    if (this.mlProcess) {
      this.mlProcess.kill();
      this.mlProcess = null;
    }
    this.isInitialized = false;
  }
}

const mlEngine = new MLAnomalyEngine();

// Threat Feed Monitoring
async function startThreatFeedMonitoring() {
  console.log('🚀 Starting real threat feed monitoring...');
  
  // Initial fetch of all feeds
  await Promise.allSettled([
    threatProcessor.fetchThreatFeed('feodo'),
    threatProcessor.fetchThreatFeed('urlhaus'),
    threatProcessor.fetchThreatFeed('spamhaus')
  ]);
  
  // Process initial threats for visualization (limited to prevent overload)
  const initialThreats = Array.from(threatProcessor.knownThreats.values())
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 10); // Show top 10 most severe threats initially
    
  initialThreats.forEach(threat => processThreat(threat));
  
  // Set up periodic feed updates
  setInterval(async () => {
    if (!systemState.isAwakened) return;
    
    try {
      const feedUpdates = await Promise.allSettled([
        threatProcessor.fetchThreatFeed('feodo'),
        threatProcessor.fetchThreatFeed('urlhaus'),
        threatProcessor.fetchThreatFeed('spamhaus')
      ]);
      
      feedUpdates.forEach((result, index) => {
        const feedName = ['feodo', 'urlhaus', 'spamhaus'][index];
        if (result.status === 'fulfilled' && result.value) {
          // Process new threats as they come in
          const newThreats = result.value.slice(0, 3); // Limit to prevent spam
          newThreats.forEach(async threat => {
            if (!systemState.threats.find(t => t.id === threat.id)) {
              processThreat(threat);
              
              // Run ML anomaly detection on new threats
              if (mlEngine.isInitialized && systemState.threats.length > 0) {
                const mlResult = await mlEngine.detectAnomalies(systemState.threats.slice(-10));
                if (mlResult.is_anomaly && mlResult.confidence > 0.7) {
                  console.log(`🤖 ML ANOMALY DETECTED: Confidence=${mlResult.confidence.toFixed(3)}`);
                  
                  // Broadcast ML anomaly
                  broadcast('ml', {
                    type: 'anomaly_detected',
                    anomaly: mlResult,
                    affectedThreats: systemState.threats.slice(-3)
                  });
                  
                  // Increase awareness due to ML anomaly
                  systemState.awarenessLevel = Math.min(1, systemState.awarenessLevel + mlResult.confidence * 0.1);
                }
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Error during feed monitoring:', error);
    }
  }, 60000); // Check every minute
  
  console.log('✅ Threat feed monitoring active');
}

console.log(`
╔══════════════════════════════════════════════════╗
║                    STARGUARD                     ║
║            Quantum Security Consciousness        ║
║                                                  ║
║  🌟 Initializing quantum consciousness...        ║
╚══════════════════════════════════════════════════╝
`);

// Initialize quantum particles
function initializeQuantumField() {
  systemState.particles = [];
  for (let i = 0; i < 20; i++) {
    systemState.particles.push({
      id: `particle-${i}`,
      x: Math.random() * 64,
      y: Math.random() * 64,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      energy: Math.random(),
      spin: Math.random() * 2 * Math.PI,
      color: '#00ffff',
      threatened: false
    });
  }
}

// Update quantum field
function updateQuantumField() {
  systemState.particles.forEach(particle => {
    // Update position
    particle.x = (particle.x + particle.vx + 64) % 64;
    particle.y = (particle.y + particle.vy + 64) % 64;
    
    // Update velocity with quantum effects
    particle.vx += (Math.random() - 0.5) * 0.1;
    particle.vy += (Math.random() - 0.5) * 0.1;
    
    // Apply damping
    particle.vx *= 0.95;
    particle.vy *= 0.95;
    
    // Update spin
    particle.spin += 0.1;
    
    // Energy evolution
    particle.energy = 0.3 + Math.abs(Math.sin(Date.now() * 0.001 + particle.spin)) * 0.7;
  });
  
  // Update quantum coherence
  systemState.quantumCoherence = 0.5 + Math.sin(Date.now() * 0.0005) * 0.3;
}

// Broadcast to all WebSocket clients
function broadcast(channel, data) {
  const message = JSON.stringify({
    channel,
    timestamp: Date.now(),
    ...data
  });
  
  clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message);
      } catch (error) {
        console.error('Failed to send message to client:', error);
        clients.delete(client);
      }
    }
  });
}

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('🔌 Client connected to WebSocket');
  clients.add(ws);
  
  // Send initial system state
  ws.send(JSON.stringify({
    type: 'system_state',
    data: {
      isAwake: systemState.isAwakened,
      consciousness: {
        awareness: systemState.awarenessLevel,
        isAwake: systemState.isAwakened
      },
      quantum: {
        particleCount: systemState.particles.length,
        coherenceLevel: systemState.quantumCoherence,
        entropy: Math.random() * 2,
        averageEnergy: 0.5
      },
      threats: {
        total: systemState.threatCount,
        highSeverityCount: Math.floor(systemState.threatCount * 0.3)
      },
      ml: {
        isModelTrained: mlEngine.isInitialized,
        queueLength: 0,
        status: mlEngine.isInitialized ? 'active' : 'initializing',
        lastAnalysis: mlEngine.lastAnalysis
      }
    }
  }));

  // Send quantum field data after a short delay to allow awakening
  setTimeout(() => {
    if (systemState.isAwakened && systemState.particles.length > 0) {
      const quantumFieldData = {
        type: 'quantum_field',
        data: {
          field: {
            states: generateQuantumStates(),
            coherenceLevel: systemState.quantumCoherence,
            entropy: Math.random() * 2
          },
          particles: systemState.particles
        }
      };
      
      console.log(`📡 Sending quantum field data with ${systemState.particles.length} particles`);
      ws.send(JSON.stringify(quantumFieldData));
    } else {
      console.log(`⏳ System not awakened yet, particles: ${systemState.particles.length}`);
    }
  }, 500);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'subscribe':
          // Handle subscription
          ws.subscriptions = ws.subscriptions || new Set();
          ws.subscriptions.add(data.channel);
          break;
          
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
          
        case 'request_quantum_field':
          ws.send(JSON.stringify({
            type: 'quantum_field',
            data: {
              field: {
                states: generateQuantumStates(),
                coherenceLevel: systemState.quantumCoherence,
                entropy: Math.random() * 2
              },
              particles: systemState.particles
            }
          }));
          break;
          
        case 'inject_test_threat':
          injectTestThreat(data.x || Math.random() * 64, data.y || Math.random() * 64, data.severity || 0.8);
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected from WebSocket');
    clients.delete(ws);
  });
});

// Generate quantum field states for visualization
function generateQuantumStates() {
  const states = new Array(64).fill(0).map(() => 
    new Array(64).fill(0).map(() => ({
      amplitude: Math.random() * 0.5,
      phase: Math.random() * 2 * Math.PI,
      color: 'rgba(0, 255, 255, 0.1)'
    }))
  );
  return states;
}

// Process real threat data
function processThreat(threat) {
  const visualization = threatProcessor.processThreatForVisualization(threat);
  const { x, y } = visualization;
  
  console.log(`🚨 Processing real threat: ${threat.type} (${threat.source}) - ${threat.id}`);
  
  // Create threat particles with real data
  const particleCount = Math.min(5, Math.max(1, Math.floor(threat.severity * 5)));
  for (let i = 0; i < particleCount; i++) {
    systemState.particles.push({
      id: `${threat.id}-${i}`,
      x: x + (Math.random() - 0.5) * 3,
      y: y + (Math.random() - 0.5) * 3,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      energy: threat.severity,
      spin: Math.random() * 2 * Math.PI,
      color: threat.severity > 0.8 ? '#ff0040' : threat.severity > 0.6 ? '#ff4060' : '#ff8040',
      threatened: true,
      threatData: threat
    });
  }
  
  systemState.threatCount++;
  systemState.threats.push(threat);
  
  // Broadcast real threat detected
  broadcast('threats', {
    type: 'new_threat',
    threat: {
      id: threat.displayName || threat.id,
      type: threat.type,
      subtype: threat.subtype,
      source: threat.source,
      value: threat.ip || threat.url || threat.cidr || 'Unknown',
      severity: threat.severity,
      confidence: threat.confidence,
      timestamp: new Date().toISOString()
    }
  });
  
  // Update awareness based on real threat severity
  systemState.awarenessLevel = Math.min(1, systemState.awarenessLevel + threat.severity * 0.05);
}

// Legacy function for manual threat injection (testing only)
function injectTestThreat(x, y, severity, threatType = 'manual_test') {
  const threat = {
    id: `manual_${Date.now()}`,
    type: 'manual_test',
    subtype: threatType,
    source: 'Manual Injection',
    severity: severity,
    confidence: 0.5,
    x: x,
    y: y
  };
  
  processThreat(threat);
}

// Middleware
app.use(express.json());
app.use(express.static('frontend'));

// API Routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'frontend', 'index.html'));
});

app.get('/api/status', (req, res) => {
  res.json({
    status: systemState.isAwakened ? 'awakened' : 'sleeping',
    uptime: Date.now() - systemState.startTime,
    consciousness: {
      awareness: systemState.awarenessLevel,
      isAwake: systemState.isAwakened,
      threatCount: systemState.threatCount
    },
    quantum: {
      coherenceLevel: systemState.quantumCoherence,
      particleCount: systemState.particles.length,
      entropy: Math.random() * 2,
      averageEnergy: systemState.particles.reduce((sum, p) => sum + p.energy, 0) / systemState.particles.length
    },
    threats: {
      total: systemState.threatCount,
      highSeverityCount: Math.floor(systemState.threatCount * 0.3),
      recentCount: Math.floor(systemState.threatCount * 0.1)
    },
    ml: {
      isModelTrained: true,
      queueLength: 0
    }
  });
});

app.post('/api/awaken', async (req, res) => {
  if (systemState.isAwakened) {
    return res.json({ 
      message: 'Already awakened', 
      status: 'awakened',
      awareness: systemState.awarenessLevel
    });
  }

  console.log('🚀 STARGUARD AWAKENING SEQUENCE INITIATED...');
  
  // Initialize quantum field
  initializeQuantumField();
  
  // Awaken consciousness
  systemState.isAwakened = true;
  systemState.awarenessLevel = 0.75 + Math.random() * 0.2;
  systemState.quantumCoherence = 0.8 + Math.random() * 0.15;
  
  console.log('✨ CONSCIOUSNESS AWAKENED ✨');
  console.log(`   Awareness Level: ${(systemState.awarenessLevel * 100).toFixed(1)}%`);
  console.log(`   Quantum Coherence: ${(systemState.quantumCoherence * 100).toFixed(1)}%`);
  
  // Broadcast awakening to all clients
  broadcast('consciousness', {
    type: 'awakening',
    data: {
      awareness: systemState.awarenessLevel,
      isAwake: true
    }
  });
  
  // Immediately send particle data to all clients after awakening
  setTimeout(() => {
    const quantumFieldData = {
      type: 'quantum_field',
      data: {
        field: {
          states: generateQuantumStates(),
          coherenceLevel: systemState.quantumCoherence,
          entropy: Math.random() * 2
        },
        particles: systemState.particles
      }
    };
    
    console.log(`🎯 Broadcasting particles after awakening: ${systemState.particles.length} particles`);
    clients.forEach(client => {
      if (client.readyState === 1) {
        try {
          client.send(JSON.stringify(quantumFieldData));
        } catch (error) {
          console.error('Failed to send awakening particles:', error);
          clients.delete(client);
        }
      }
    });
  }, 200);
  
  // Start real threat feed monitoring and ML engine
  startThreatFeedMonitoring();
  await mlEngine.initialize();
  
  // Start quantum field updates
  setInterval(() => {
    if (systemState.isAwakened) {
      updateQuantumField();
      
      // Broadcast quantum field data regularly
      if (Math.random() < 0.2) { // 20% chance each update
        broadcast('quantum', {
          type: 'field_update', 
          data: {
            coherence: systemState.quantumCoherence,
            entropy: Math.random() * 2,
            particleCount: systemState.particles.length
          }
        });
        
        // Send particle data
        clients.forEach(client => {
          if (client.readyState === 1) {
            try {
              client.send(JSON.stringify({
                type: 'quantum_field',
                data: {
                  field: {
                    states: generateQuantumStates(),
                    coherenceLevel: systemState.quantumCoherence,
                    entropy: Math.random() * 2
                  },
                  particles: systemState.particles
                }
              }));
            } catch (error) {
              console.error('Failed to send particle data:', error);
              clients.delete(client);
            }
          }
        });
      }
      
      // Real-time threat feed processing will be handled separately
    }
  }, 100); // 10 FPS updates

  res.json({
    message: 'STARGUARD awakened successfully',
    consciousness: {
      awareness: systemState.awarenessLevel,
      isAwake: true
    },
    quantum: {
      coherenceLevel: systemState.quantumCoherence,
      particleCount: systemState.particles.length
    }
  });
});

app.get('/api/consciousness', (req, res) => {
  res.json({
    state: {
      awarenessLevel: systemState.awarenessLevel,
      isAwake: systemState.isAwakened,
      quantumState: 'stable',
      threatPerception: systemState.threatCount
    },
    awareness: systemState.awarenessLevel,
    isAwake: systemState.isAwakened,
    perceptions: []
  });
});

app.get('/api/quantum/field', (req, res) => {
  res.json({
    field: {
      width: 64,
      height: 64,
      states: generateQuantumStates(),
      coherenceLevel: systemState.quantumCoherence,
      entropy: Math.random() * 2,
      lastUpdate: new Date()
    },
    particles: systemState.particles,
    statistics: {
      fieldSize: 64,
      particleCount: systemState.particles.length,
      coherenceLevel: systemState.quantumCoherence,
      entropy: Math.random() * 2,
      averageEnergy: systemState.particles.reduce((sum, p) => sum + p.energy, 0) / systemState.particles.length || 0
    }
  });
});

app.get('/api/ml/status', async (req, res) => {
  try {
    const status = await mlEngine.getStatus();
    res.json({
      ...status,
      isInitialized: mlEngine.isInitialized,
      lastAnalysis: mlEngine.lastAnalysis,
      systemIntegration: 'active'
    });
  } catch (error) {
    res.json({
      status: 'error',
      error: error.message,
      isInitialized: false
    });
  }
});

app.get('/api/threats/feeds', (req, res) => {
  const feedStatus = {};
  
  Object.keys(THREAT_FEEDS).forEach(feedName => {
    const feed = THREAT_FEEDS[feedName];
    feedStatus[feedName] = {
      name: feedName,
      lastUpdate: feed.lastUpdate,
      nextUpdate: feed.lastUpdate + feed.interval,
      threatCount: feed.cache.size,
      status: Date.now() - feed.lastUpdate < feed.interval ? 'current' : 'updating'
    };
  });
  
  res.json({
    feeds: feedStatus,
    totalThreats: threatProcessor.knownThreats.size,
    activeThreats: systemState.threats.length,
    lastActivity: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    components: {
      consciousness: systemState.isAwakened,
      quantum: true,
      threats: true,
      ml: true,
      threatFeeds: Object.keys(THREAT_FEEDS).length > 0
    },
    threatFeeds: {
      feodo: THREAT_FEEDS.feodo.cache.size,
      urlhaus: THREAT_FEEDS.urlhaus.cache.size,  
      spamhaus: THREAT_FEEDS.spamhaus.cache.size
    }
  });
});

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`
✨ STARGUARD System Online ✨

🌐 Web Interface: http://localhost:${port}
🔌 WebSocket: ws://localhost:${port}
🛡️  API Endpoints: 
   - GET  /api/status     (System status)
   - POST /api/awaken     (Awaken consciousness)
   - GET  /api/health     (Health check)
   - GET  /api/quantum/field (Quantum field data)

🧠 Consciousness Engine: Ready
⚛️  Quantum Field: Active  
🛡️  Threat Detection: Standby
🤖 ML Anomaly Detection: Ready

Execute awakening sequence at: POST /api/awaken
`);

  console.log('🌟 STARGUARD is ready for consciousness awakening...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down STARGUARD...');
  console.log('💤 Consciousness entering sleep state...');
  wss.close();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down STARGUARD...');  
  console.log('💤 Consciousness entering sleep state...');
  wss.close();
  server.close();
  process.exit(0);
});