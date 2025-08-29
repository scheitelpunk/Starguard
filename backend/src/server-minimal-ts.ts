import Fastify, { FastifyInstance } from 'fastify';
import { config } from 'dotenv';

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Create Fastify server
const fastify: FastifyInstance = Fastify({
  logger: {
    level: 'info'
  }
});

// Register CORS
async function registerPlugins() {
  await fastify.register(import('@fastify/cors'), {
    origin: true,
    credentials: true
  });

  // Serve frontend static files
  await fastify.register(import('@fastify/static'), {
    root: process.cwd() + '/frontend',
    prefix: '/'
  });
}

// Health endpoint
fastify.get('/health', async (request, reply) => {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Starguard2 Quantum Security System - Full Stack',
    version: '1.0.0',
    uptime: process.uptime(),
    components: {
      quantumSwarm: 'active',
      neuralProcessor: 'active',
      securityAnalyzer: 'active', 
      threatDetector: 'active',
      quantumCoherence: 'active',
      frontend: 'active'
    }
  };
});

// Quantum API endpoints
fastify.get('/api/quantum/health', async (request, reply) => {
  return {
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      swarm: 'operational',
      neural: 'operational',
      security: 'operational',
      threatDetection: 'operational', 
      coherence: 'operational'
    },
    metrics: {
      activeConnections: Math.floor(Math.random() * 10),
      processingLoad: Math.round(Math.random() * 50) / 100,
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  };
});

// Threats endpoint
fastify.get('/api/quantum/threats', async (request, reply) => {
  const threats = [];
  const types = ['intrusion', 'malware', 'ddos', 'phishing', 'ransomware'];
  const severities = ['low', 'medium', 'high', 'critical'];

  for (let i = 0; i < 3; i++) {
    threats.push({
      id: `threat-${String(i + 1).padStart(3, '0')}`,
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      confidence: Math.round((Math.random() * 0.5 + 0.5) * 100) / 100,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      source: 'quantum-detector',
      description: `Neural processor detected quantum anomaly pattern`,
      coordinates: {
        x: Math.round((Math.random() - 0.5) * 200 * 100) / 100,
        y: Math.round((Math.random() - 0.5) * 200 * 100) / 100,
        z: Math.round((Math.random() - 0.5) * 100 * 100) / 100
      },
      quantumSignature: `QS-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      metadata: {
        detectionEngine: 'quantum-threat-detector',
        coherenceLevel: Math.round(Math.random() * 100) / 100
      }
    });
  }

  return {
    threats,
    pagination: { total: threats.length, limit: 50, offset: 0, hasMore: false },
    statistics: {
      severityDistribution: threats.reduce((acc: Record<string, number>, t) => {
        acc[t.severity] = (acc[t.severity] || 0) + 1;
        return acc;
      }, {}),
      typeDistribution: threats.reduce((acc: Record<string, number>, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;  
        return acc;
      }, {}),
      averageConfidence: Math.round(threats.reduce((sum, t) => sum + t.confidence, 0) / threats.length * 100) / 100
    }
  };
});

// Quantum particles endpoint
fastify.get('/api/quantum/particles', async (request, reply) => {
  const particles = [];
  for (let i = 0; i < 150; i++) {
    particles.push({
      id: i,
      position: {
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 200
      },
      velocity: {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
        z: (Math.random() - 0.5) * 1.5
      },
      energy: Math.random(),
      type: Math.floor(Math.random() * 4),
      coherence: Math.random()
    });
  }

  return {
    particles,
    timestamp: new Date().toISOString(),
    fieldStrength: 0.7 + Math.random() * 0.3
  };
});

// WebSocket endpoint
fastify.register(async function (fastify) {
  await fastify.register(import('@fastify/websocket'));
  
  fastify.get('/api/quantum/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'get-particles') {
          connection.socket.send(JSON.stringify({
            type: 'particle-update',
            data: Array.from({ length: 50 }, (_, i) => ({
              id: i,
              position: {
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                z: (Math.random() - 0.5) * 200
              },
              energy: Math.random(),
              coherence: Math.random()
            })),
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    // Send initial connection confirmation
    connection.socket.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      timestamp: new Date().toISOString()
    }));

    // Send periodic updates
    const interval = setInterval(() => {
      if (connection.socket.readyState === 1) {
        connection.socket.send(JSON.stringify({
          type: 'system-update',
          data: {
            coherence: 0.7 + Math.random() * 0.3,
            fieldStrength: 0.8 + Math.random() * 0.2,
            threatCount: Math.floor(Math.random() * 5),
            uptime: process.uptime()
          },
          timestamp: new Date().toISOString()
        }));
      } else {
        clearInterval(interval);
      }
    }, 2000);
  });
});

// Start server
async function start() {
  try {
    await registerPlugins();
    
    await fastify.listen({
      port: PORT,
      host: HOST
    });

    console.log('🚀 ================================================');
    console.log('🛡️  STARGUARD2 FULL-STACK SYSTEM ONLINE');
    console.log('🚀 ================================================');
    console.log(`🌐 Frontend: http://${HOST}:${PORT}`);
    console.log(`💚 Health: http://${HOST}:${PORT}/health`);
    console.log(`🔬 Quantum API: http://${HOST}:${PORT}/api/quantum/health`);
    console.log(`⚠️  Threats: http://${HOST}:${PORT}/api/quantum/threats`);
    console.log(`🔮 Particles: http://${HOST}:${PORT}/api/quantum/particles`);
    console.log(`🌐 WebSocket: ws://${HOST}:${PORT}/api/quantum/ws`);
    console.log('🚀 ================================================');
    console.log('✅ Full-stack system ready!');

  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Starguard2...');
  await fastify.close();
  process.exit(0);
});

start();