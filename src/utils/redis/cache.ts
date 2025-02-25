import { redis } from './redis-cache-db';

/**
 * Hilfsfunktion für einheitliches Logging
 * @param message - Die Nachricht, die geloggt werden soll
 * @param data - Optionale Daten, die mit geloggt werden sollen
 */
function debugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [redis-cache] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

/**
 * Cached das Ergebnis einer Funktion mit angegebener TTL (Time to Live)
 * @param key - Der Cache-Schlüssel
 * @param fn - Die auszuführende Funktion, wenn der Wert nicht im Cache ist
 * @param ttl - Time to Live in Sekunden (Standard: 3600 = 1 Stunde)
 * @returns Den gecachten oder neu berechneten Wert
 */
export async function cache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 3600,
): Promise<T> {
  try {
    // Versuche, aus dem Cache zu lesen
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null) {
        debugLog(`Cache-Hit für Schlüssel: ${key}`);
        return cached;
      }
    } catch (cacheReadError) {
      const errorMessage =
        cacheReadError instanceof Error
          ? cacheReadError.message
          : 'Unbekannter Fehler';
      debugLog(
        `Fehler beim Lesen aus dem Cache für Schlüssel ${key}: ${errorMessage}`,
        {
          error:
            cacheReadError instanceof Error
              ? {
                  name: cacheReadError.name,
                  message: cacheReadError.message,
                  stack: cacheReadError.stack,
                }
              : 'Kein Error-Objekt',
        },
      );
    }

    debugLog(`Cache-Miss für Schlüssel: ${key}, lade frische Daten`);
    const fresh = await fn();

    // Versuche, in den Cache zu schreiben
    try {
      await redis.set(key, fresh, { ex: ttl });
      debugLog(
        `Daten in Cache geschrieben für Schlüssel: ${key}, TTL: ${ttl}s`,
      );
    } catch (cacheWriteError) {
      const errorMessage =
        cacheWriteError instanceof Error
          ? cacheWriteError.message
          : 'Unbekannter Fehler';
      debugLog(
        `Fehler beim Schreiben in den Cache für Schlüssel ${key}: ${errorMessage}`,
        {
          error:
            cacheWriteError instanceof Error
              ? {
                  name: cacheWriteError.name,
                  message: cacheWriteError.message,
                  stack: cacheWriteError.stack,
                }
              : 'Kein Error-Objekt',
        },
      );
    }

    return fresh;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unbekannter Fehler';
    debugLog(
      `Allgemeiner Fehler in der Cache-Funktion für Schlüssel ${key}: ${errorMessage}`,
      {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : 'Kein Error-Objekt',
      },
    );
    throw error;
  }
}

/**
 * Invalidiert einen Cache-Eintrag
 * @param key - Der zu invalidierende Cache-Schlüssel
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
    debugLog(`Cache-Eintrag gelöscht für Schlüssel: ${key}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unbekannter Fehler';
    debugLog(
      `Fehler beim Löschen des Cache-Eintrags für Schlüssel ${key}: ${errorMessage}`,
      {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : 'Kein Error-Objekt',
      },
    );
    throw error;
  }
}

/**
 * Leert den gesamten Cache
 */
export async function clearCache(): Promise<void> {
  try {
    await redis.flushall();
    debugLog('Gesamter Cache gelöscht');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unbekannter Fehler';
    debugLog(`Fehler beim Löschen des gesamten Caches: ${errorMessage}`, {
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : 'Kein Error-Objekt',
    });
    throw error;
  }
}
