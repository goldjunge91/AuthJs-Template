import { Redis } from '@upstash/redis';

// Redis-Client initialisieren
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Cache-Wrapper für Redis
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  },

  async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    try {
      if (expireInSeconds) {
        await redis.set(key, value, { ex: expireInSeconds });
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  },
};
