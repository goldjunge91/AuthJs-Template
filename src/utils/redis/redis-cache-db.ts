import { Redis } from '@upstash/redis';

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error('UPSTASH_REDIS key/url is not defined');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  automaticDeserialization: false, // Improves Edge compatibility
});
