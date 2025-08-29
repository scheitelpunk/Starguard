import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebSocket } from 'ws';
import { Type, Static } from '@sinclair/typebox';
import { QuantumSwarmSystem } from '../quantum-swarm/QuantumSwarmSystem.js';
import { QuantumNeuralProcessor } from '../quantum-swarm/QuantumNeuralProcessor.js';
import { QuantumSecurityAnalyzer } from '../quantum-swarm/QuantumSecurityAnalyzer.js';
import { QuantumThreatDetector } from '../quantum-swarm/QuantumThreatDetector.js';
import { QuantumCoherence } from '../quantum-swarm/QuantumCoherence.js';

// Request/Response schemas for validation
const ThreatQuerySchema = Type.Object({
  severity: Type.Optional(Type.Union([
    Type.Literal('low'),
    Type.Literal('medium'),
    Type.Literal('high'),
    Type.Literal('critical')
  ])),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000 })),
  offset: Type.Optional(Type.Number({ minimum: 0 })),
  timeframe: Type.Optional(Type.String()),
  source: Type.Optional(Type.String())
});

const QuantumAnalysisRequestSchema = Type.Object({
  data: Type.String(),
  analysisType: Type.Union([
    Type.Literal('threat'),
    Type.Literal('anomaly'),
    Type.Literal('pattern'),
    Type.Literal('behavioral')
  ]),
  priority: Type.Optional(Type.Union([
    Type.Literal('low'),
    Type.Literal('medium'),
    Type.Literal('high'),
    Type.Literal('critical')
  ])),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any()))
});

const SwarmConfigSchema = Type.Object({
  topology: Type.Union([
    Type.Literal('mesh'),
    Type.Literal('hierarchical'),
    Type.Literal('ring'),
    Type.Literal('star')
  ]),
  agentCount: Type.Number({ minimum: 1, maximum: 100 }),
  coherenceLevel: Type.Number({ minimum: 0, maximum: 1 }),
  quantumEntanglement: Type.Optional(Type.Boolean()),
  adaptiveScaling: Type.Optional(Type.Boolean())
});

type ThreatQuery = Static<typeof ThreatQuerySchema>;
type QuantumAnalysisRequest = Static<typeof QuantumAnalysisRequestSchema>;
type SwarmConfig = Static<typeof SwarmConfigSchema>;

interface WebSocketConnection {
  id: string;
  socket: WebSocket;
  subscriptions: Set<string>;
  lastHeartbeat: number;
}

export class QuantumRoutes {
  private quantumSwarm: QuantumSwarmSystem;
  private neuralProcessor: QuantumNeuralProcessor;
  private securityAnalyzer: QuantumSecurityAnalyzer;
  private threatDetector: QuantumThreatDetector;
  private quantumCoherence: QuantumCoherence;
  private wsConnections: Map<string, WebSocketConnection> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor() {
    this.quantumSwarm = new QuantumSwarmSystem();
    this.neuralProcessor = new QuantumNeuralProcessor();
    this.securityAnalyzer = new QuantumSecurityAnalyzer();
    this.threatDetector = new QuantumThreatDetector();
    this.quantumCoherence = new QuantumCoherence();

    // Start heartbeat for WebSocket connections
    this.heartbeatInterval = setInterval(() => {
      this.heartbeatCheck();
    }, 30000); // 30 seconds
  }

  async register(fastify: FastifyInstance): Promise<void> {
    // Register WebSocket support
    await fastify.register(require('@fastify/websocket'));

    // Health check endpoint
    fastify.get('/api/quantum/health', {
      schema: {
        response: {
          200: Type.Object({
            status: Type.String(),
            timestamp: Type.String(),
            services: Type.Object({
              swarm: Type.String(),
              neural: Type.String(),
              security: Type.String(),
              threatDetection: Type.String(),
              coherence: Type.String()
            }),
            metrics: Type.Object({
              activeConnections: Type.Number(),
              processingLoad: Type.Number(),
              memoryUsage: Type.Number()
            })
          })
        }
      }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const [swarmStatus, neuralStatus, securityStatus, threatStatus, coherenceStatus] = await Promise.all([
          this.quantumSwarm.getSystemHealth(),
          this.neuralProcessor.getProcessingStatus(),
          this.securityAnalyzer.getAnalysisStatus(),
          this.threatDetector.getDetectionStatus(),
          this.quantumCoherence.getCoherenceStatus()
        ]);

        reply.send({
          status: 'operational',
          timestamp: new Date().toISOString(),
          services: {
            swarm: swarmStatus.status,
            neural: neuralStatus.status,
            security: securityStatus.status,
            threatDetection: threatStatus.status,
            coherence: coherenceStatus.status
          },
          metrics: {
            activeConnections: this.wsConnections.size,
            processingLoad: process.cpuUsage().user / 1000000, // Convert to seconds
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // Convert to MB
          }
        });
      } catch (error) {
        fastify.log.error('Health check failed:', error);
        reply.code(500).send({
          error: 'Health check failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Real-time threat data endpoint
    fastify.get('/api/quantum/threats', {
      schema: {
        querystring: ThreatQuerySchema,
        response: {
          200: Type.Object({
            threats: Type.Array(Type.Object({
              id: Type.String(),
              type: Type.String(),
              severity: Type.String(),
              confidence: Type.Number(),
              timestamp: Type.String(),
              source: Type.String(),
              description: Type.String(),
              coordinates: Type.Object({
                x: Type.Number(),
                y: Type.Number(),
                z: Type.Number()
              }),
              quantumSignature: Type.String(),
              metadata: Type.Record(Type.String(), Type.Any())
            })),
            pagination: Type.Object({
              total: Type.Number(),
              limit: Type.Number(),
              offset: Type.Number(),
              hasMore: Type.Boolean()
            }),
            statistics: Type.Object({
              severityDistribution: Type.Record(Type.String(), Type.Number()),
              typeDistribution: Type.Record(Type.String(), Type.Number()),
              averageConfidence: Type.Number()
            })
          })
        }
      }
    }, async (request: FastifyRequest<{ Querystring: ThreatQuery }>, reply: FastifyReply) => {
      try {
        const { severity, limit = 50, offset = 0, timeframe, source } = request.query;

        const threats = await this.threatDetector.getThreats({
          severity,
          limit,
          offset,
          timeframe,
          source
        });

        const statistics = await this.threatDetector.getThreatStatistics();

        reply.send({
          threats: threats.data.map(threat => ({
            ...threat,
            coordinates: this.generateQuantumCoordinates(threat),
            quantumSignature: this.generateQuantumSignature(threat)
          })),
          pagination: threats.pagination,
          statistics
        });
      } catch (error) {
        fastify.log.error('Failed to fetch threats:', error);
        reply.code(500).send({
          error: 'Failed to fetch threats',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Quantum analysis endpoint
    fastify.post('/api/quantum/analyze', {
      schema: {
        body: QuantumAnalysisRequestSchema,
        response: {
          200: Type.Object({
            analysisId: Type.String(),
            status: Type.String(),
            results: Type.Object({
              threatLevel: Type.String(),
              confidence: Type.Number(),
              anomalies: Type.Array(Type.Object({
                type: Type.String(),
                severity: Type.String(),
                description: Type.String(),
                location: Type.String()
              })),
              patterns: Type.Array(Type.Object({
                pattern: Type.String(),
                frequency: Type.Number(),
                significance: Type.Number()
              })),
              recommendations: Type.Array(Type.String()),
              quantumCoherence: Type.Number(),
              neuralActivation: Type.Array(Type.Number())
            }),
            timestamp: Type.String(),
            processingTime: Type.Number()
          })
        }
      }
    }, async (request: FastifyRequest<{ Body: QuantumAnalysisRequest }>, reply: FastifyReply) => {
      try {
        const startTime = Date.now();
        const { data, analysisType, priority = 'medium', metadata } = request.body;

        // Parallel analysis across quantum systems
        const [securityAnalysis, neuralAnalysis, coherenceAnalysis] = await Promise.all([
          this.securityAnalyzer.analyzeData(data, analysisType),
          this.neuralProcessor.processData(data, analysisType),
          this.quantumCoherence.analyzeCoherence(data)
        ]);

        const analysisId = this.generateAnalysisId();
        const processingTime = Date.now() - startTime;

        // Combine results
        const results = {
          threatLevel: this.determineThreatLevel(securityAnalysis, neuralAnalysis),
          confidence: this.calculateConfidence(securityAnalysis, neuralAnalysis, coherenceAnalysis),
          anomalies: [...securityAnalysis.anomalies, ...neuralAnalysis.anomalies],
          patterns: neuralAnalysis.patterns || [],
          recommendations: this.generateRecommendations(securityAnalysis, neuralAnalysis),
          quantumCoherence: coherenceAnalysis.coherenceLevel,
          neuralActivation: neuralAnalysis.activationPattern || []
        };

        // Broadcast to WebSocket clients if high priority
        if (priority === 'high' || priority === 'critical') {
          this.broadcastToClients('analysis-complete', {
            analysisId,
            results,
            priority
          });
        }

        reply.send({
          analysisId,
          status: 'completed',
          results,
          timestamp: new Date().toISOString(),
          processingTime
        });
      } catch (error) {
        fastify.log.error('Analysis failed:', error);
        reply.code(500).send({
          error: 'Analysis failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Quantum swarm configuration endpoint
    fastify.post('/api/quantum/swarm/configure', {
      schema: {
        body: SwarmConfigSchema,
        response: {
          200: Type.Object({
            configurationId: Type.String(),
            status: Type.String(),
            swarmMetrics: Type.Object({
              agentCount: Type.Number(),
              topology: Type.String(),
              coherenceLevel: Type.Number(),
              efficiency: Type.Number(),
              responseTime: Type.Number()
            }),
            message: Type.String()
          })
        }
      }
    }, async (request: FastifyRequest<{ Body: SwarmConfig }>, reply: FastifyReply) => {
      try {
        const config = request.body;
        
        const configurationId = await this.quantumSwarm.configure(config);
        const metrics = await this.quantumSwarm.getSwarmMetrics();

        // Broadcast configuration change to clients
        this.broadcastToClients('swarm-reconfigured', {
          configurationId,
          config,
          metrics
        });

        reply.send({
          configurationId,
          status: 'configured',
          swarmMetrics: metrics,
          message: `Quantum swarm configured with ${config.agentCount} agents in ${config.topology} topology`
        });
      } catch (error) {
        fastify.log.error('Swarm configuration failed:', error);
        reply.code(500).send({
          error: 'Swarm configuration failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Real-time particle data endpoint
    fastify.get('/api/quantum/particles', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const particles = await this.generateQuantumParticles();
        reply.send({
          particles,
          timestamp: new Date().toISOString(),
          fieldStrength: await this.quantumCoherence.getFieldStrength()
        });
      } catch (error) {
        fastify.log.error('Failed to generate particles:', error);
        reply.code(500).send({
          error: 'Failed to generate particles',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // WebSocket endpoint for real-time updates
    fastify.register(async (fastify) => {
      fastify.get('/api/quantum/ws', { websocket: true }, (connection, request) => {
        const connectionId = this.generateConnectionId();
        const wsConnection: WebSocketConnection = {
          id: connectionId,
          socket: connection.socket,
          subscriptions: new Set(),
          lastHeartbeat: Date.now()
        };

        this.wsConnections.set(connectionId, wsConnection);

        connection.socket.on('message', (message) => {
          try {
            const data = JSON.parse(message.toString());
            this.handleWebSocketMessage(connectionId, data);
          } catch (error) {
            fastify.log.error('WebSocket message parse error:', error);
          }
        });

        connection.socket.on('close', () => {
          this.wsConnections.delete(connectionId);
        });

        connection.socket.on('error', (error) => {
          fastify.log.error('WebSocket error:', error);
          this.wsConnections.delete(connectionId);
        });

        // Send initial connection confirmation
        connection.socket.send(JSON.stringify({
          type: 'connection',
          connectionId,
          timestamp: new Date().toISOString()
        }));
      });
    });
  }

  private generateQuantumCoordinates(threat: any): { x: number; y: number; z: number } {
    // Generate quantum-influenced coordinates based on threat characteristics
    const hash = this.hashString(threat.id + threat.type + threat.severity);
    return {
      x: (Math.sin(hash * 0.01) * 100),
      y: (Math.cos(hash * 0.01) * 100),
      z: (Math.sin(hash * 0.02) * 50)
    };
  }

  private generateQuantumSignature(threat: any): string {
    // Generate unique quantum signature for visualization
    const signature = `QS-${threat.severity.toUpperCase()}-${Date.now().toString(36)}-${threat.id.slice(-6)}`;
    return signature;
  }

  private async generateQuantumParticles() {
    // Generate particle data for Three.js visualization
    const particleCount = 1000;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        position: {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
          z: (Math.random() - 0.5) * 200
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2
        },
        energy: Math.random(),
        type: Math.floor(Math.random() * 4), // 0-3 for different particle types
        coherence: Math.random()
      });
    }

    return particles;
  }

  private determineThreatLevel(securityAnalysis: any, neuralAnalysis: any): string {
    const securityScore = securityAnalysis.riskScore || 0;
    const neuralScore = neuralAnalysis.anomalyScore || 0;
    const combinedScore = (securityScore + neuralScore) / 2;

    if (combinedScore >= 0.8) return 'critical';
    if (combinedScore >= 0.6) return 'high';
    if (combinedScore >= 0.4) return 'medium';
    return 'low';
  }

  private calculateConfidence(securityAnalysis: any, neuralAnalysis: any, coherenceAnalysis: any): number {
    const weights = {
      security: 0.4,
      neural: 0.4,
      coherence: 0.2
    };

    return (
      (securityAnalysis.confidence || 0) * weights.security +
      (neuralAnalysis.confidence || 0) * weights.neural +
      (coherenceAnalysis.coherenceLevel || 0) * weights.coherence
    );
  }

  private generateRecommendations(securityAnalysis: any, neuralAnalysis: any): string[] {
    const recommendations: string[] = [];

    if (securityAnalysis.riskScore > 0.7) {
      recommendations.push('Immediate security assessment required');
      recommendations.push('Isolate affected systems');
    }

    if (neuralAnalysis.anomalyScore > 0.6) {
      recommendations.push('Deploy additional monitoring agents');
      recommendations.push('Increase neural pattern analysis frequency');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue standard monitoring protocols');
    }

    return recommendations;
  }

  private handleWebSocketMessage(connectionId: string, data: any) {
    const connection = this.wsConnections.get(connectionId);
    if (!connection) return;

    switch (data.type) {
      case 'subscribe':
        if (data.channel) {
          connection.subscriptions.add(data.channel);
        }
        break;

      case 'unsubscribe':
        if (data.channel) {
          connection.subscriptions.delete(data.channel);
        }
        break;

      case 'heartbeat':
        connection.lastHeartbeat = Date.now();
        connection.socket.send(JSON.stringify({
          type: 'heartbeat-ack',
          timestamp: new Date().toISOString()
        }));
        break;

      case 'get-particles':
        this.sendParticleUpdate(connectionId);
        break;

      case 'get-threats':
        this.sendThreatUpdate(connectionId);
        break;
    }
  }

  private async sendParticleUpdate(connectionId: string) {
    const connection = this.wsConnections.get(connectionId);
    if (!connection) return;

    try {
      const particles = await this.generateQuantumParticles();
      connection.socket.send(JSON.stringify({
        type: 'particle-update',
        data: particles,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to send particle update:', error);
    }
  }

  private async sendThreatUpdate(connectionId: string) {
    const connection = this.wsConnections.get(connectionId);
    if (!connection) return;

    try {
      const threats = await this.threatDetector.getThreats({ limit: 100 });
      connection.socket.send(JSON.stringify({
        type: 'threat-update',
        data: threats.data.map(threat => ({
          ...threat,
          coordinates: this.generateQuantumCoordinates(threat),
          quantumSignature: this.generateQuantumSignature(threat)
        })),
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to send threat update:', error);
    }
  }

  private broadcastToClients(eventType: string, data: any) {
    const message = JSON.stringify({
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    });

    this.wsConnections.forEach((connection) => {
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.send(message);
      }
    });
  }

  private heartbeatCheck() {
    const now = Date.now();
    const timeout = 60000; // 60 seconds

    this.wsConnections.forEach((connection, connectionId) => {
      if (now - connection.lastHeartbeat > timeout) {
        connection.socket.terminate();
        this.wsConnections.delete(connectionId);
      }
    });
  }

  private generateAnalysisId(): string {
    return `QA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConnectionId(): string {
    return `QWS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  public cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.wsConnections.forEach((connection) => {
      connection.socket.terminate();
    });
    this.wsConnections.clear();
  }
}

// Export the routes registration function
export default async function quantumRoutes(fastify: FastifyInstance) {
  const routes = new QuantumRoutes();
  await routes.register(fastify);

  // Cleanup on server close
  fastify.addHook('onClose', async () => {
    routes.cleanup();
  });
}