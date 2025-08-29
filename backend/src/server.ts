import Fastify, { FastifyInstance } from 'fastify';
import { config } from 'dotenv';
import quantumRoutes from './api/quantum-routes.js';

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Fastify server instance
const fastify: FastifyInstance = Fastify({
  logger: {
    level: NODE_ENV === 'production' ? 'warn' : 'info',
    prettyPrint: NODE_ENV !== 'production',
  },
  trustProxy: true,
  maxParamLength: 200,
  bodyLimit: 1048576 * 10, // 10MB
});

// Register plugins and middleware
async function registerPlugins(): Promise<void> {
  // CORS support
  await fastify.register(import('@fastify/cors'), {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://starguard2.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // Security headers
  await fastify.register(import('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", 'ws:', 'wss:'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  // Rate limiting
  await fastify.register(import('@fastify/rate-limit'), {
    max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 100,
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
    redis: process.env.REDIS_URL ? { url: process.env.REDIS_URL } : undefined,
  });

  // JWT support (for future authentication)
  await fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'development-secret-key-change-in-production',
    sign: {
      expiresIn: '24h',
    },
  });

  // Multipart form data support
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 3,
    },
  });

  // Static file serving (for production builds)
  if (NODE_ENV === 'production') {
    await fastify.register(import('@fastify/static'), {
      root: '/app/public',
      prefix: '/public/',
    });
  }

  // Swagger documentation
  if (NODE_ENV !== 'production') {
    await fastify.register(import('@fastify/swagger'), {
      swagger: {
        info: {
          title: 'Starguard2 API',
          description: 'Enterprise Security API with Quantum Computing Integration',
          version: '1.0.0',
        },
        host: `localhost:${PORT}`,
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'quantum', description: 'Quantum security endpoints' },
          { name: 'threats', description: 'Threat detection endpoints' },
          { name: 'analysis', description: 'Security analysis endpoints' },
          { name: 'swarm', description: 'Quantum swarm endpoints' },
        ],
      },
    });

    await fastify.register(import('@fastify/swagger-ui'), {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, _request, _reply) => {
        return swaggerObject;
      },
      transformSpecificationClone: true,
    });
  }

  // Register quantum routes
  await fastify.register(quantumRoutes);
}

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };

  reply.send(healthCheck);
});

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  const { statusCode = 500 } = error;

  fastify.log.error(
    {
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      headers: request.headers,
    },
    'Request error'
  );

  const errorResponse = {
    error: true,
    message: error.message || 'Internal Server Error',
    statusCode,
    timestamp: new Date().toISOString(),
    path: request.url,
    ...(NODE_ENV !== 'production' && {
      stack: error.stack,
      details: error.cause,
    }),
  };

  reply.status(statusCode).send(errorResponse);
});

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: true,
    message: 'Route not found',
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: request.url,
    method: request.method,
  });
});

// Graceful shutdown handler
process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully...');
  try {
    await fastify.close();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM, shutting down gracefully...');
  try {
    await fastify.close();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  fastify.log.fatal('Uncaught exception:', error);
  process.exit(1);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  fastify.log.fatal('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
async function start(): Promise<void> {
  try {
    await registerPlugins();

    // Start listening
    await fastify.listen({
      port: PORT,
      host: HOST,
    });

    fastify.log.info(`Server listening on http://${HOST}:${PORT}`);
    fastify.log.info(`Environment: ${NODE_ENV}`);

    if (NODE_ENV !== 'production') {
      fastify.log.info(`Swagger docs available at http://${HOST}:${PORT}/docs`);
    }
  } catch (error) {
    fastify.log.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default fastify;