// Vitest Setup-Datei
import { afterEach, vi } from 'vitest';

// Bereinige nach jedem Test automatisch
afterEach(() => {
  // Hier würde normalerweise cleanup() aus @testing-library/react aufgerufen werden
  // Wird installiert, wenn @testing-library/react verfügbar ist
});

// Mock für globale Objekte
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock für fetch
global.fetch = vi.fn();

// Mock für localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
