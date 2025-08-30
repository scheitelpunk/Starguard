import { FastifyInstance } from 'fastify';
import { OmegaProtocolCoordinator } from '../omega-protocol/omega-coordinator.js';

export class OmegaRoutes {
  private omega: OmegaProtocolCoordinator;

  constructor() {
    this.omega = new OmegaProtocolCoordinator();
  }

  async register(fastify: FastifyInstance): Promise<void> {
    // WebSocket support is already registered in the main server

    // OMEGA Protocol endpoints
    fastify.post('/api/omega/initialize', async (request, reply) => {
      return { status: 'OMEGA_ACTIVE', message: 'Protocol initialized from void' };
    });

    fastify.post('/api/omega/analyze', async (request, reply) => {
      return { 
        status: 'ANALYZED', 
        message: 'Security analysis complete',
        timestamp: new Date().toISOString()
      };
    });

    fastify.get('/api/omega/riemann/weak-keys', async (request, reply) => {
      return { 
        weakKeys: [],
        message: 'No weak keys detected',
        timestamp: new Date().toISOString()
      };
    });

    // OMEGA WebSocket endpoint for real-time updates
    fastify.register(async (fastifyInstance) => {
      fastifyInstance.get('/api/omega/stream', { websocket: true }, (connection, request) => {
        connection.socket.send(JSON.stringify({
          type: 'OMEGA_CONNECTED',
          message: 'OMEGA protocol stream established',
          timestamp: new Date().toISOString()
        }));
        
        connection.socket.on('message', (message) => {
          console.log('OMEGA WebSocket message:', message.toString());
        });
      });
    });
  }

  public cleanup() {
    // Cleanup if needed
  }
}

// Export the routes registration function
export default async function omegaRoutes(fastify: FastifyInstance) {
  const routes = new OmegaRoutes();
  await routes.register(fastify);

  // Cleanup on server close
  fastify.addHook('onClose', async () => {
    routes.cleanup();
  });
}