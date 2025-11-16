import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyCompress from '@fastify/compress';
import { createBrotliCompress, createGzip, createDeflate } from 'zlib';
import { Logger } from '../utils/logger.js';

export interface CompressionConfig {
  threshold: number;        // Minimum response size to compress (bytes)
  level: number;           // Compression level (1-9)
  brotli: boolean;         // Enable brotli compression
  memLevel: number;        // Memory level for zlib
  encodings: string[];     // Supported encodings
  customTypes: RegExp[];   // Additional MIME types to compress
}

const DEFAULT_CONFIG: CompressionConfig = {
  threshold: 1024,          // 1KB minimum
  level: 6,                 // Balanced compression
  brotli: true,             // Enable brotli for modern browsers
  memLevel: 8,              // Default memory level
  encodings: ['br', 'gzip', 'deflate'],
  customTypes: [
    /application\/json/,
    /text\/.*/,
    /application\/javascript/,
    /application\/xml/,
  ],
};

/**
 * CompressionPlugin - High-performance response compression
 *
 * Features:
 * - Brotli compression (best ratio)
 * - Gzip compression (wide support)
 * - Deflate compression (fallback)
 * - Smart content-type detection
 * - Configurable compression levels
 * - Performance metrics
 */
export class CompressionPlugin {
  private logger: Logger;
  private config: CompressionConfig;
  private stats = {
    compressed: 0,
    uncompressed: 0,
    bytesSaved: 0,
    compressionRatio: 0,
  };

  constructor(config: Partial<CompressionConfig> = {}) {
    this.logger = new Logger('compression');
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register compression plugin with Fastify
   */
  async register(fastify: FastifyInstance): Promise<void> {
    try {
      await fastify.register(fastifyCompress, {
        global: true,
        threshold: this.config.threshold,
        encodings: this.config.encodings,
        brotliOptions: {
          params: {
            [require('zlib').constants.BROTLI_PARAM_MODE]: require('zlib').constants.BROTLI_MODE_TEXT,
            [require('zlib').constants.BROTLI_PARAM_QUALITY]: this.config.level,
          },
        },
        zlibOptions: {
          level: this.config.level,
          memLevel: this.config.memLevel,
        },
        customTypes: this.config.customTypes,
        removeContentLengthHeader: true,
      });

      // Add hooks for tracking compression stats
      fastify.addHook('onSend', async (request, reply, payload) => {
        return this.trackCompression(request, reply, payload);
      });

      this.logger.info('Compression plugin registered', {
        threshold: this.config.threshold,
        level: this.config.level,
        brotli: this.config.brotli,
      });
    } catch (error) {
      this.logger.error('Failed to register compression plugin', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Track compression statistics
   */
  private trackCompression(
    request: FastifyRequest,
    reply: FastifyReply,
    payload: any
  ): any {
    const contentEncoding = reply.getHeader('content-encoding');

    if (contentEncoding) {
      this.stats.compressed++;

      // Estimate original size
      const originalSize = typeof payload === 'string'
        ? Buffer.byteLength(payload)
        : payload?.length || 0;

      // Get compressed size from content-length header
      const compressedSize = Number(reply.getHeader('content-length')) || 0;

      if (originalSize && compressedSize) {
        this.stats.bytesSaved += (originalSize - compressedSize);
        this.stats.compressionRatio =
          this.stats.bytesSaved / (this.stats.compressed * 1000);
      }
    } else {
      this.stats.uncompressed++;
    }

    return payload;
  }

  /**
   * Get compression statistics
   */
  getStats() {
    const total = this.stats.compressed + this.stats.uncompressed;
    return {
      ...this.stats,
      compressionRate: total > 0 ? (this.stats.compressed / total) * 100 : 0,
      averageRatio: this.stats.compressionRatio,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      compressed: 0,
      uncompressed: 0,
      bytesSaved: 0,
      compressionRatio: 0,
    };
  }

  /**
   * Manually compress data (for WebSocket or custom scenarios)
   */
  async compress(data: string | Buffer, encoding: 'br' | 'gzip' | 'deflate' = 'gzip'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const buffer = typeof data === 'string' ? Buffer.from(data) : data;
      const chunks: Buffer[] = [];

      let compressor;
      switch (encoding) {
        case 'br':
          compressor = createBrotliCompress({
            params: {
              [require('zlib').constants.BROTLI_PARAM_QUALITY]: this.config.level,
            },
          });
          break;
        case 'gzip':
          compressor = createGzip({ level: this.config.level });
          break;
        case 'deflate':
          compressor = createDeflate({ level: this.config.level });
          break;
      }

      compressor.on('data', (chunk) => chunks.push(chunk));
      compressor.on('end', () => resolve(Buffer.concat(chunks)));
      compressor.on('error', reject);

      compressor.write(buffer);
      compressor.end();
    });
  }

  /**
   * Check if content should be compressed
   */
  shouldCompress(contentType: string, size: number): boolean {
    if (size < this.config.threshold) {
      return false;
    }

    return this.config.customTypes.some(regex => regex.test(contentType));
  }
}

/**
 * Create and export compression middleware
 */
export async function setupCompression(
  fastify: FastifyInstance,
  config?: Partial<CompressionConfig>
): Promise<CompressionPlugin> {
  const plugin = new CompressionPlugin(config);
  await plugin.register(fastify);
  return plugin;
}

export default CompressionPlugin;
