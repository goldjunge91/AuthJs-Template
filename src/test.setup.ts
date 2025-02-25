import { vi, beforeAll, afterEach } from 'vitest';
import * as dotenv from 'dotenv';
// .env-Datei direkt zu Beginn der Tests laden
dotenv.config({ path: '.env' });

// test.setup.ts

// Set timezone to ensure consistent date handling in tests
beforeAll(() => {
  // Set timezone to UTC for consistent date handling
  process.env.TZ = 'UTC';
});

// Clean up mocks after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  vi.resetModules();
});

// Global mock for fetch if you're using it
global.fetch = vi.fn();

// If you're using DOM testing
// if (typeof window !== 'undefined') {
// Add any browser-specific mocks or configurations
// }
// expect.extend({
//   toBeWithinRange(received, floor, ceiling) {
//     const pass = received >= floor && received <= ceiling;
//     if (pass) {
//       return {
//         message: () =>
//           `expected ${received} not to be within range ${floor} - ${ceiling}`,
//         pass: true,
//       };
//     } else {
//       return {
//         message: () =>
//           `expected ${received} to be within range ${floor} - ${ceiling}`,
//         pass: false,
//       };
//     }
//   },
// });
