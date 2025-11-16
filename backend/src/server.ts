import Fastify, { FastifyInstance } from 'fastify';
import { config } from 'dotenv';
import agentRoutes from './api/agent-routes.js';
import cryptoAnalysisRoutes from './api/crypto-analysis-routes.js';
import { Logger } from './utils/logger.js';

const logger = new Logger('starguard-server');
const requestLogger = new Logger('http');

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Fastify server instance
const fastify: FastifyInstance = Fastify({
  logger: NODE_ENV === 'production' ? false : {
    level: 'info'
  },
  trustProxy: true,
  maxParamLength: 200,
  bodyLimit: 1048576 * 10 // 10MB
});

// Register plugins
async function registerPlugins() {
  try {
    // Register routes
    await fastify.register(agentRoutes, { prefix: '/api/agents' });
    await fastify.register(cryptoAnalysisRoutes, { prefix: '/api/crypto-analysis' });

    logger.info('All plugins registered successfully');
  } catch (error) {
    logger.error('Error registering plugins:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

// Start server
async function start() {
  try {
    await registerPlugins();

    await fastify.listen({ port: PORT, host: HOST });
    logger.info(`Server listening on ${HOST}:${PORT}`);
    logger.info(`Environment: ${NODE_ENV}`);
  } catch (error) {
    logger.error('Error starting server:', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await fastify.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await fastify.close();
  process.exit(0);
});

// Start the server
start();
