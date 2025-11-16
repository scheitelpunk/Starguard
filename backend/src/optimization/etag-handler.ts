import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { Logger } from '../utils/logger.js';

export interface ETagConfig {
  weak: boolean;           // Use weak ETags (W/"...")
  algorithm: string;       // Hash algorithm (md5, sha1, sha256)
  skip: (req: FastifyRequest) => boolean;  // Function to skip ETag generation
}

const DEFAULT_CONFIG: ETagConfig = {
  weak: false,
  algorithm: 'md5',
  skip: (req) => req.method !== 'GET' && req.method !== 'HEAD',
};

/**
 * ETagHandler - HTTP caching with ETag support
 *
 * Features:
 * - Strong and weak ETags
 * - Conditional requests (If-None-Match)
 * - Automatic 304 Not Modified responses
 * - Configurable hash algorithms
 * - Cache hit tracking
 */
export class ETagHandler {
  private logger: Logger;
  private config: ETagConfig;
  private stats = {
    generated: 0,
    hits: 0,
    misses: 0,
    skipped: 0,
  };

  constructor(config: Partial<ETagConfig> = {}) {
    this.logger = new Logger('etag-handler');
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register ETag middleware with Fastify
   */
  register(fastify: FastifyInstance): void {
    fastify.addHook('onSend', async (request, reply, payload) => {
      return this.handleETag(request, reply, payload);
    });

    this.logger.info('ETag handler registered', {
      weak: this.config.weak,
      algorithm: this.config.algorithm,
    });
  }

  /**
   * Handle ETag generation and validation
   */
  private async handleETag(
    request: FastifyRequest,
    reply: FastifyReply,
    payload: any
  ): Promise<any> {
    // Skip if configured to skip
    if (this.config.skip(request)) {
      this.stats.skipped++;
      return payload;
    }

    // Skip if already has ETag
    if (reply.getHeader('etag')) {
      return payload;
    }

    // Generate ETag from payload
    const etag = this.generateETag(payload);
    if (!etag) {
      return payload;
    }

    // Set ETag header
    reply.header('ETag', etag);
    this.stats.generated++;

    // Check if client has matching ETag
    const clientETag = request.headers['if-none-match'];
    if (clientETag && this.matches(etag, clientETag)) {
      this.stats.hits++;

      // Return 304 Not Modified
      reply.code(304);
      return '';
    }

    this.stats.misses++;
    return payload;
  }

  /**
   * Generate ETag from payload
   */
  generateETag(payload: any): string | null {
    try {
      let data: string;

      if (typeof payload === 'string') {
        data = payload;
      } else if (Buffer.isBuffer(payload)) {
        data = payload.toString();
      } else if (typeof payload === 'object') {
        data = JSON.stringify(payload);
      } else {
        return null;
      }

      const hash = crypto
        .createHash(this.config.algorithm)
        .update(data)
        .digest('hex');

      return this.config.weak ? `W/"${hash}"` : `"${hash}"`;
    } catch (error) {
      this.logger.error('Failed to generate ETag', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Check if ETags match
   */
  private matches(etag: string, clientETag: string): boolean {
    // Handle multiple ETags in If-None-Match
    const clientETags = clientETag.split(',').map(e => e.trim());

    // Wildcard match
    if (clientETags.includes('*')) {
      return true;
    }

    // Exact match
    if (clientETags.includes(etag)) {
      return true;
    }

    // Weak comparison (ignore W/ prefix)
    const normalizedETag = etag.replace(/^W\//, '');
    return clientETags.some(ce => ce.replace(/^W\//, '') === normalizedETag);
  }

  /**
   * Get statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      generated: 0,
      hits: 0,
      misses: 0,
      skipped: 0,
    };
  }
}

/**
 * Create and export ETag handler
 */
export function setupETag(
  fastify: FastifyInstance,
  config?: Partial<ETagConfig>
): ETagHandler {
  const handler = new ETagHandler(config);
  handler.register(fastify);
  return handler;
}

export default ETagHandler;
