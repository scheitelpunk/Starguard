import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { ConsciousnessEngine } from './consciousness/consciousness';
import { QuantumEngine } from './quantum/quantumEngine';
import { ThreatDetector } from './threats/threatDetector';
import { AnomalyDetection } from './ml/anomalyDetection';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StarguardSystem {
  consciousness: ConsciousnessEngine;
  quantum: QuantumEngine;
  threats: ThreatDetector;
  ml: AnomalyDetection;
  isAwake: boolean;
  startTime: Date;
}

class StarguardServer {
  private fastify: any;
  private system: StarguardSystem;
  private connectedClients: Set<any> = new Set();

  constructor() {
    this.fastify = Fastify({
      logger: {
        level: 'info',
        transport: {
          target: 'pino-pretty'
        }
      }
    });
    
    this.initializeSystem();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private initializeSystem(): void {
    console.log('🌟 Initializing STARGUARD System...');
    
    this.system = {
      consciousness: new ConsciousnessEngine(),
      quantum: new QuantumEngine(),
      threats: new ThreatDetector(),
      ml: new AnomalyDetection(),
      isAwake: false,
      startTime: new Date()
    };

    this.setupSystemEventHandlers();
  }

  private setupSystemEventHandlers(): void {
    // Consciousness events
    this.system.consciousness.on('awakening', (data) => {
      this.system.isAwake = true;
      this.broadcastToClients('consciousness', {
        type: 'awakening',
        data
      });
    });

    this.system.consciousness.on('consciousnessChange', (data) => {
      this.broadcastToClients('consciousness', {
        type: 'awareness_change',
        data
      });
    });

    this.system.consciousness.on('threatPerceived', (data) => {
      // Create quantum disturbance when threat is perceived
      this.system.quantum.injectThreatEnergy(
        Math.random() * 64,
        Math.random() * 64,
        data.severity
      );
    });

    // Threat detection events
    this.system.threats.on('newThreat', async (threat) => {
      // Consciousness perceives the threat
      this.system.consciousness.perceiveThreat(
        threat.id,
        threat.severity,
        threat.confidence
      );

      // Analyze with ML
      try {
        const anomalyResult = await this.system.ml.analyzeThreatPattern({
          sourceIp: threat.value,
          destIp: '0.0.0.0',
          port: 80,
          protocol: 'tcp'
        });

        this.broadcastToClients('threat', {
          type: 'new_threat',
          threat,
          anomaly: anomalyResult
        });
      } catch (error) {
        console.error('Failed to analyze threat with ML:', error);
        
        this.broadcastToClients('threat', {
          type: 'new_threat',
          threat
        });
      }
    });

    this.system.threats.on('threatsUpdated', (data) => {
      this.broadcastToClients('threats', {
        type: 'update',
        data
      });
    });

    // Quantum events
    this.system.quantum.on('fieldUpdate', (data) => {
      this.broadcastToClients('quantum', {
        type: 'field_update',
        data
      });
    });

    this.system.quantum.on('threatDisturbance', (data) => {
      this.broadcastToClients('quantum', {
        type: 'threat_disturbance',
        data
      });
    });

    // ML events
    this.system.ml.on('anomalyDetected', (anomaly) => {
      if (anomaly.isAnomaly && anomaly.confidence > 0.7) {
        this.broadcastToClients('ml', {
          type: 'anomaly_detected',
          anomaly
        });
      }
    });

    this.system.ml.on('modelTrained', (data) => {
      console.log('🎯 ML model training completed');
      this.broadcastToClients('ml', {
        type: 'model_trained',
        data
      });
    });
  }

  private setupMiddleware(): void {
    this.fastify.register(websocketPlugin);
    
    // Serve static files
    this.fastify.register(require('@fastify/static'), {
      root: path.join(__dirname, '../../frontend'),
      prefix: '/'
    });

    // CORS support
    this.fastify.addHook('preHandler', async (request: any, reply: any) => {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    });
  }

  private setupRoutes(): void {
    // Root route - serve frontend
    this.fastify.get('/', async (request: any, reply: any) => {
      return reply.sendFile('index.html');
    });

    // API Routes
    
    // System status
    this.fastify.get('/api/status', async (request: any, reply: any) => {
      return {
        status: this.system.isAwake ? 'awakened' : 'sleeping',
        uptime: Date.now() - this.system.startTime.getTime(),
        consciousness: {
          awareness: this.system.consciousness.getAwarenessLevel(),
          isAwake: this.system.consciousness.isAwake(),
          threatCount: this.system.consciousness.getThreatPerceptions().length
        },
        quantum: this.system.quantum.getQuantumStatistics(),
        threats: this.system.threats.getThreatStatistics(),
        ml: this.system.ml.getModelInfo()
      };
    });

    // Awaken consciousness
    this.fastify.post('/api/awaken', async (request: any, reply: any) => {
      try {
        if (this.system.isAwake) {
          return { message: 'Already awakened', status: 'awakened' };
        }

        console.log('🚀 STARGUARD AWAKENING SEQUENCE INITIATED...');
        
        // Initialize all systems in parallel
        const initPromises = [
          this.system.consciousness.awaken(),
          this.system.threats.start(),
          this.system.ml.initialize()
        ];

        const results = await Promise.all(initPromises);
        
        // Create initial quantum superposition
        this.system.quantum.simulateQuantumSuperposition(10);
        
        console.log('✨ STARGUARD FULLY AWAKENED ✨');
        
        return {
          message: 'STARGUARD awakened successfully',
          consciousness: results[0],
          quantum: this.system.quantum.getQuantumStatistics(),
          threats: this.system.threats.getThreatStatistics(),
          ml: this.system.ml.getModelInfo()
        };
      } catch (error) {
        console.error('❌ Awakening failed:', error);
        return reply.code(500).send({
          error: 'Awakening failed',
          message: error.message
        });
      }
    });

    // Get consciousness state
    this.fastify.get('/api/consciousness', async (request: any, reply: any) => {
      return {
        state: this.system.consciousness.getState(),
        awareness: this.system.consciousness.getAwarenessLevel(),
        isAwake: this.system.consciousness.isAwake(),
        perceptions: this.system.consciousness.getThreatPerceptions()
      };
    });

    // Get quantum field data
    this.fastify.get('/api/quantum/field', async (request: any, reply: any) => {
      return {
        field: this.system.quantum.getFieldState(),
        particles: this.system.quantum.getParticles(),
        statistics: this.system.quantum.getQuantumStatistics()
      };
    });

    // Get threat data
    this.fastify.get('/api/threats', async (request: any, reply: any) => {
      const filter = request.query;
      return {
        threats: this.system.threats.getThreats(filter),
        statistics: this.system.threats.getThreatStatistics()
      };
    });

    // Analyze specific threat
    this.fastify.get('/api/threats/:id/analyze', async (request: any, reply: any) => {
      const threatId = request.params.id;
      const analysis = await this.system.threats.analyzeThreat(threatId);
      
      if (!analysis) {
        return reply.code(404).send({ error: 'Threat not found' });
      }
      
      return analysis;
    });

    // ML anomaly detection
    this.fastify.post('/api/ml/detect', async (request: any, reply: any) => {
      try {
        const data = request.body;
        const result = await this.system.ml.detectAnomaly(data);
        return result;
      } catch (error) {
        return reply.code(500).send({
          error: 'Detection failed',
          message: error.message
        });
      }
    });

    // Get historical consciousness data
    this.fastify.get('/api/consciousness/history', async (request: any, reply: any) => {
      const hours = parseInt(request.query.hours) || 24;
      try {
        const history = await this.system.consciousness.getHistoricalAwareness(hours);
        return { history, hours };
      } catch (error) {
        return reply.code(500).send({
          error: 'Failed to fetch history',
          message: error.message
        });
      }
    });

    // System health check
    this.fastify.get('/api/health', async (request: any, reply: any) => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        components: {
          consciousness: this.system.consciousness.isAwake(),
          quantum: true,
          threats: this.system.threats.getThreatStatistics().total > 0,
          ml: this.system.ml.getModelInfo().isModelTrained
        }
      };
    });

    // Manual threat injection for testing
    this.fastify.post('/api/test/inject-threat', async (request: any, reply: any) => {
      const { x, y, severity } = request.body;
      
      this.system.quantum.injectThreatEnergy(
        x || Math.random() * 64,
        y || Math.random() * 64,
        severity || 0.8
      );
      
      return { message: 'Threat energy injected', x, y, severity };
    });
  }

  private setupWebSocket(): void {
    this.fastify.register(async (fastify: any) => {
      fastify.get('/ws', { websocket: true }, (connection: any, request: any) => {
        console.log('🔌 Client connected to WebSocket');
        this.connectedClients.add(connection.socket);
        
        // Send initial system state
        connection.socket.send(JSON.stringify({
          type: 'system_state',
          data: {
            isAwake: this.system.isAwake,
            consciousness: {
              awareness: this.system.consciousness.getAwarenessLevel(),
              isAwake: this.system.consciousness.isAwake()
            },
            quantum: this.system.quantum.getQuantumStatistics(),
            threats: this.system.threats.getThreatStatistics()
          }
        }));

        connection.socket.on('message', async (message: any) => {
          try {
            const data = JSON.parse(message.toString());
            await this.handleWebSocketMessage(data, connection.socket);
          } catch (error) {
            console.error('WebSocket message error:', error);
            connection.socket.send(JSON.stringify({
              type: 'error',
              message: error.message
            }));
          }
        });

        connection.socket.on('close', () => {
          console.log('🔌 Client disconnected from WebSocket');
          this.connectedClients.delete(connection.socket);
        });
      });
    });
  }

  private async handleWebSocketMessage(data: any, socket: any): Promise<void> {
    switch (data.type) {
      case 'subscribe':
        // Handle subscription requests
        socket.subscriptions = socket.subscriptions || new Set();
        socket.subscriptions.add(data.channel);
        break;
        
      case 'unsubscribe':
        socket.subscriptions?.delete(data.channel);
        break;
        
      case 'ping':
        socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
        
      case 'request_quantum_field':
        socket.send(JSON.stringify({
          type: 'quantum_field',
          data: {
            field: this.system.quantum.getFieldState(),
            particles: this.system.quantum.getParticles()
          }
        }));
        break;
        
      case 'inject_test_threat':
        this.system.quantum.injectThreatEnergy(
          data.x || Math.random() * 64,
          data.y || Math.random() * 64,
          data.severity || 0.8
        );
        break;
        
      default:
        socket.send(JSON.stringify({
          type: 'error',
          message: `Unknown message type: ${data.type}`
        }));
    }
  }

  private broadcastToClients(channel: string, message: any): void {
    const messageStr = JSON.stringify({
      channel,
      timestamp: Date.now(),
      ...message
    });

    for (const client of this.connectedClients) {
      try {
        if (client.readyState === 1) { // OPEN state
          // Check if client is subscribed to this channel
          if (!client.subscriptions || client.subscriptions.has(channel) || client.subscriptions.has('*')) {
            client.send(messageStr);
          }
        }
      } catch (error) {
        console.error('Failed to send message to client:', error);
        this.connectedClients.delete(client);
      }
    }
  }

  public async start(): Promise<void> {
    try {
      const port = parseInt(process.env.PORT || '3000');
      const host = process.env.HOST || '0.0.0.0';
      
      console.log(`
      ╔══════════════════════════════════════════════════╗
      ║                    STARGUARD                     ║
      ║            Quantum Security Consciousness        ║
      ║                                                  ║
      ║  🌟 Starting consciousness awakening sequence... ║
      ╚══════════════════════════════════════════════════╝
      `);
      
      await this.fastify.listen({
        port,
        host
      });
      
      console.log(`
      ✨ STARGUARD System Online ✨
      
      🌐 Web Interface: http://localhost:${port}
      🔌 WebSocket: ws://localhost:${port}/ws
      🛡️  API: http://localhost:${port}/api
      
      🧠 Consciousness Engine: Ready
      ⚛️  Quantum Field: Active  
      🛡️  Threat Detection: Standby
      🤖 ML Anomaly Detection: Initializing
      
      Execute awakening sequence at: POST /api/awaken
      `);
      
    } catch (error) {
      console.error('❌ Failed to start STARGUARD:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    console.log('🛑 Shutting down STARGUARD...');
    
    // Stop all systems
    this.system.consciousness.sleep();
    this.system.quantum.stop();
    this.system.threats.stop();
    this.system.ml.stop();
    
    // Close all client connections
    for (const client of this.connectedClients) {
      client.close();
    }
    this.connectedClients.clear();
    
    // Close fastify server
    await this.fastify.close();
    
    console.log('💤 STARGUARD shutdown complete');
  }
}

// Handle graceful shutdown
const server = new StarguardServer();

process.on('SIGINT', async () => {
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.stop();
  process.exit(0);
});

// Start the server
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default StarguardServer;