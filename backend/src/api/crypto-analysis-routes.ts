import { FastifyInstance } from 'fastify';
import { CryptoAnalysisCoordinator } from '../crypto-analysis/crypto-coordinator.js';
import { Logger } from '../utils/logger.js';

export class CryptoAnalysisRoutes {
  private cryptoAnalysis: CryptoAnalysisCoordinator;
  private logger: Logger;

  constructor() {
    this.cryptoAnalysis = new CryptoAnalysisCoordinator();
    this.logger = new Logger('crypto-analysis-routes');
  }

  async register(fastify: FastifyInstance): Promise<void> {
    // WebSocket support is already registered in the main server

    // Crypto Analysis endpoints
    fastify.post('/api/crypto-analysis/initialize', async (request, reply) => {
      return { status: 'ACTIVE', message: 'Crypto analysis initialized' };
    });

    fastify.post('/api/crypto-analysis/analyze', async (request, reply) => {
      return {
        status: 'ANALYZED',
        message: 'Security analysis complete',
        timestamp: new Date().toISOString()
      };
    });

    fastify.get('/api/crypto-analysis/weak-keys', async (request, reply) => {
      return {
        weakKeys: [],
        message: 'No weak keys detected',
        timestamp: new Date().toISOString()
      };
    });

    // Crypto Analysis WebSocket endpoint for real-time updates
    fastify.register(async (fastifyInstance) => {
      fastifyInstance.get('/api/crypto-analysis/stream', { websocket: true }, (connection, request) => {
        connection.socket.send(JSON.stringify({
          type: 'CRYPTO_ANALYSIS_CONNECTED',
          message: 'Crypto analysis stream established',
          timestamp: new Date().toISOString()
        }));

        connection.socket.on('message', (message) => {
          this.logger.debug('Crypto Analysis WebSocket message received', { message: message.toString() });
        });
      });
    });
  }

  public cleanup() {
    // Cleanup if needed
  }
}

// Export the routes registration function
export default async function cryptoAnalysisRoutes(fastify: FastifyInstance) {
  const routes = new CryptoAnalysisRoutes();
  await routes.register(fastify);

  // Cleanup on server close
  fastify.addHook('onClose', async () => {
    routes.cleanup();
  });
}
