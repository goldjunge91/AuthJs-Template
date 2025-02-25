// import { describe, it, expect, beforeAll } from 'vitest';

// // Wichtig: Zuerst den Mock importieren
// import { redisMock } from './mocks/redis-mock';
// // Dann erst die gemockte Abhängigkeit importieren
// import { redis } from '@/utils/redis/redis-cache-db';

// describe('Redis Connection', () => {
//   beforeAll(async () => {
//     console.log('Redis-Konfiguration:', {
//       URL_DEFINED: !!process.env.UPSTASH_REDIS_REST_URL,
//       TOKEN_DEFINED: !!process.env.UPSTASH_REDIS_REST_TOKEN,
//     });
//   });

//   it('sollte einen Wert speichern und abrufen können', async () => {
//     const testKey = 'test_key_' + Date.now();
//     const testValue = 'test_value';

//     console.log('Redis-Mock wird verwendet...');

//     // Den Mock für diesen Test konfigurieren
//     redisMock.get.mockResolvedValueOnce(testValue);

//     // Test mit gemockter Redis-Instanz
//     await redis.set(testKey, testValue);
//     const retrievedValue = await redis.get(testKey);

//     // Prüfungen
//     expect(retrievedValue).toBe(testValue);
//     expect(redisMock.set).toHaveBeenCalled();
//     expect(redisMock.get).toHaveBeenCalled();
//   });
// });
