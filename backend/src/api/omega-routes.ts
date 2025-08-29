import { FastifyInstance } from 'fastify';
import { OmegaProtocolCoordinator } from '../omega-protocol/omega-coordinator.js';

export class OmegaRoutes {
  private omega: OmegaProtocolCoordinator;

  constructor() {
    this.omega = new OmegaProtocolCoordinator();
  }

  async register(fastify: FastifyInstance): Promise<void> {
    // Register WebSocket support
    await fastify.register(require('@fastify/websocket'));

    // OMEGA Protocol endpoints
    fastify.post('/api/omega/initialize', async (request, reply) => {
      this.omega.initializeOmegaField();
      return { status: 'OMEGA_ACTIVE', message: 'Protocol initialized from void' };
    });

    fastify.post('/api/omega/analyze', async (request, reply) => {
      const analysis = await this.omega.analyzeSecurityFromMathematicalVoid(request.body);
      return analysis;
    });

    fastify.get('/api/omega/riemann/weak-keys', async (request, reply) => {
      const { certificates } = request.query as any;
      const { RiemannZetaAnalyzer } = await import('../omega-protocol/riemann-analyzer.js');
      const analyzer = new RiemannZetaAnalyzer();
      const results = certificates.map((cert: any) => analyzer.analyzeRSAKey(cert));
      return { weakKeys: results.filter((r: any) => r.isWeak) };
    });

    // OMEGA WebSocket endpoint for real-time updates
    fastify.register(async (fastifyInstance) => {
      fastifyInstance.get('/api/omega/stream', { websocket: true }, (connection, request) => {
        this.omega.on('omega-alert', (data) => {
          connection.socket.send(JSON.stringify({
            type: 'OMEGA_ALERT',
            ...data
          }));
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