import { FastifyInstance } from 'fastify';
import swagger, { SwaggerOptions } from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export const swaggerConfig: SwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'STARGUARD2 Enterprise Security API',
      description: `
# STARGUARD2 API Documentation

Advanced quantum-enhanced security platform with consciousness-driven threat detection and biometric authentication.

## Features

- **Quantum Security**: Quantum field monitoring and adaptive defense mechanisms
- **Biometric Authentication**: Multi-modal biometric scanning with continuous verification
- **Threat Detection**: Real-time threat scanning and anomaly detection
- **Consciousness Engine**: AI-driven security analysis with consciousness metrics
- **OMEGA Protocol**: Mathematical void-based security analysis using Riemann Hypothesis
- **Real-time Updates**: WebSocket streaming for live security events

## Authentication

Most endpoints require JWT Bearer token authentication. Obtain a token through the biometric authentication flow.

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting

API requests are rate-limited to 100 requests per minute per IP address.

## Versioning

Current API version: 1.0.0

## Support

- GitHub: https://github.com/starguard2/starguard2
- Issues: https://github.com/starguard2/starguard2/issues
      `,
      version: '1.0.0',
      contact: {
        name: 'Starguard2 Team',
        email: 'security@starguard.io',
        url: 'https://github.com/starguard2/starguard2'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      termsOfService: 'https://starguard.io/terms'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://staging-api.starguard.io',
        description: 'Staging server'
      },
      {
        url: 'https://api.starguard.io',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Biometric authentication and session management'
      },
      {
        name: 'Threats',
        description: 'Threat detection and scanning operations'
      },
      {
        name: 'Quantum',
        description: 'Quantum field monitoring and defense systems'
      },
      {
        name: 'Consciousness',
        description: 'AI consciousness metrics and analysis'
      },
      {
        name: 'OMEGA Protocol',
        description: 'Mathematical void-based security analysis'
      },
      {
        name: 'Health',
        description: 'System health and monitoring'
      },
      {
        name: 'WebSocket',
        description: 'Real-time streaming endpoints'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token obtained from biometric scan'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for service-to-service authentication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          },
          required: ['error']
        },
        BiometricScanRequest: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'User identifier',
              example: 'user_12345'
            },
            biometricId: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Biometric session identifier',
              example: 'bio_abc123'
            },
            voicePattern: {
              type: 'array',
              items: { type: 'number' },
              description: 'Voice biometric pattern data',
              example: [0.1, 0.2, 0.3, 0.4, 0.5]
            },
            facialFeatures: {
              type: 'array',
              items: { type: 'number' },
              description: 'Facial feature vectors',
              example: [0.8, 0.7, 0.9, 0.6]
            },
            behaviorMetrics: {
              type: 'object',
              properties: {
                keystrokePattern: {
                  type: 'array',
                  items: { type: 'number' },
                  description: 'Keystroke dynamics pattern',
                  example: [120, 150, 130, 140]
                },
                mouseMovement: {
                  type: 'array',
                  items: { type: 'number' },
                  description: 'Mouse movement pattern',
                  example: [1.2, 2.3, 1.5, 2.1]
                },
                screenTime: {
                  type: 'number',
                  minimum: 0,
                  maximum: 86400000,
                  description: 'Screen time in milliseconds',
                  example: 3600000
                }
              }
            },
            score: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Initial confidence score',
              example: 0.85
            },
            timestamp: {
              type: 'number',
              description: 'Unix timestamp in milliseconds',
              example: 1699999999000
            }
          },
          required: ['userId', 'biometricId', 'score', 'timestamp']
        },
        BiometricScanResponse: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Generated session identifier',
              example: 'sess_xyz789'
            },
            authenticated: {
              type: 'boolean',
              description: 'Authentication status',
              example: true
            },
            score: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Authentication confidence score',
              example: 0.92
            },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Risk assessment level',
              example: 'low'
            }
          }
        },
        ThreatScanRequest: {
          type: 'object',
          properties: {
            target: {
              type: 'string',
              pattern: '^[a-zA-Z0-9._:/-]+$',
              description: 'Scan target (IP, domain, or path)',
              example: '192.168.1.1'
            },
            type: {
              type: 'string',
              enum: ['port', 'vulnerability', 'malware', 'network'],
              description: 'Type of scan to perform',
              example: 'port'
            }
          },
          required: ['target', 'type']
        },
        ThreatScanResponse: {
          type: 'object',
          properties: {
            scanId: {
              type: 'string',
              description: 'Unique scan identifier',
              example: 'scan_abc123'
            },
            status: {
              type: 'string',
              enum: ['initiated', 'running', 'completed', 'failed'],
              description: 'Scan status',
              example: 'initiated'
            },
            estimatedDuration: {
              type: 'number',
              description: 'Estimated duration in milliseconds',
              example: 30000
            }
          }
        },
        QuantumFieldData: {
          type: 'object',
          properties: {
            nodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'node_1' },
                  position: {
                    type: 'array',
                    items: { type: 'number' },
                    minItems: 3,
                    maxItems: 3,
                    example: [10.5, 20.3, -5.7]
                  },
                  status: {
                    type: 'string',
                    enum: ['secure', 'warning', 'threat', 'offline'],
                    example: 'secure'
                  },
                  connections: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['node_2', 'node_3']
                  },
                  quantumState: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1,
                    example: 0.87
                  },
                  threatLevel: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1,
                    example: 0.12
                  }
                }
              }
            },
            edges: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  source: { type: 'string', example: 'node_1' },
                  target: { type: 'string', example: 'node_2' },
                  strength: { type: 'number', example: 0.75 },
                  encrypted: { type: 'boolean', example: true }
                }
              }
            },
            fieldMetrics: {
              type: 'object',
              properties: {
                coherence: { type: 'number', example: 0.92 },
                entanglement: { type: 'number', example: 0.85 },
                stability: { type: 'number', example: 0.88 },
                defenseDnaStrength: { type: 'number', example: 0.95 }
              }
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['operational', 'degraded', 'down'],
              example: 'operational'
            },
            timestamp: {
              type: 'number',
              description: 'Current timestamp',
              example: 1699999999000
            },
            services: {
              type: 'object',
              properties: {
                threatDetection: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'active' }
                  }
                },
                consciousness: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'active' },
                    awareness: { type: 'number', example: 0.75 }
                  }
                },
                quantumEngine: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'active' },
                    coherence: { type: 'number', example: 0.85 }
                  }
                },
                anomalyDetection: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'active' }
                  }
                }
              }
            }
          }
        }
      }
    },
    security: []
  }
};

export const swaggerUiConfig = {
  routePrefix: '/api/docs',
  uiConfig: {
    docExpansion: 'list' as const,
    deepLinking: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai' as const
    },
    tryItOutEnabled: true
  },
  staticCSP: true,
  transformStaticCSP: (header: string) => header,
  exposeRoute: true
};

export async function registerSwagger(fastify: FastifyInstance): Promise<void> {
  // Register Swagger
  await fastify.register(swagger, swaggerConfig);

  // Register Swagger UI
  await fastify.register(swaggerUi, swaggerUiConfig);

  // Add route to get OpenAPI spec as JSON
  fastify.get('/api/openapi.json', async (request, reply) => {
    return fastify.swagger();
  });

  // Add route to get OpenAPI spec as YAML
  fastify.get('/api/openapi.yaml', async (request, reply) => {
    reply.type('text/yaml');
    return fastify.swagger({ yaml: true });
  });
}
