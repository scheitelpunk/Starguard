import { createClient, RedisClientType } from 'redis';
import winston from 'winston';

let redisClient: RedisClientType | null = null;

export async function connectRedis(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }
  
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = createClient({ url });
  
  redisClient.on('error', (err) => {
    winston.error('Redis Client Error', err);
  });
  
  redisClient.on('connect', () => {
    winston.info('Redis Client Connected');
  });
  
  try {
    await redisClient.connect();
    
    await redisClient.set('starguard:status', 'awakening', {
      EX: 60
    });
    
    return redisClient;
  } catch (error) {
    winston.error('Redis connection failed:', error);
    throw error;
  }
}

export function getRedisClient(): RedisClientType {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redisClient;
}

export async function cacheConsciousnessState(state: any): Promise<void> {
  const client = getRedisClient();
  const key = `consciousness:state:${state.id}`;
  
  await client.set(key, JSON.stringify(state), {
    EX: 300
  });
}

export async function cacheThreatAnalysis(threatId: string, analysis: any): Promise<void> {
  const client = getRedisClient();
  const key = `threat:analysis:${threatId}`;
  
  await client.set(key, JSON.stringify(analysis), {
    EX: 3600
  });
}

export async function getCachedThreatAnalysis(threatId: string): Promise<any | null> {
  const client = getRedisClient();
  const key = `threat:analysis:${threatId}`;
  
  const cached = await client.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}