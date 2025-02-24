import { redis } from './redis-cache-db';

export async function cache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 60 * 60, // 1 hour default
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;

  const fresh = await fn();
  await redis.set(key, fresh, { ex: ttl });
  return fresh;
}

export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key);
}
