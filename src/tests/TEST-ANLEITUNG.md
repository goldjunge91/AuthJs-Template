# Anleitung für automatisierte Tests mit Playwright und Vitest

Diese Anleitung beschreibt, wie du die automatisierten Tests für die Stripe-Integration und die dynamischen Routen mit Playwright und Vitest ausführen kannst.

## Voraussetzungen

1. Node.js und npm installiert
2. Die Anwendung ist konfiguriert mit:
   - Stripe API-Schlüssel (Testmodus)
   - Google Calendar API-Schlüssel
   - Datenbank-Verbindung

## Installation der Testabhängigkeiten

Installiere die benötigten Pakete:

```bash
npm install --save-dev @playwright/test vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
npx playwright install
```

## Ausführen der Tests

### Vitest (Unit-Tests)

Vitest wird für Unit-Tests verwendet, um einzelne Funktionen und Komponenten zu testen.

```bash
# Alle Unit-Tests ausführen
npm run test

# Tests im Watch-Modus ausführen (bei Änderungen werden Tests automatisch neu ausgeführt)
npm run test:watch

# Tests mit UI ausführen
npm run test:ui

# Tests mit Coverage-Bericht ausführen
npm run test:coverage
```

### Playwright (E2E-Tests)

Playwright wird für End-to-End-Tests verwendet, um die Anwendung in einem echten Browser zu testen.

```bash
# Starte die Anwendung in einem separaten Terminal
npm run dev

# Alle E2E-Tests ausführen
npm run test:e2e

# Tests mit UI ausführen
npm run test:e2e:ui

# Testbericht anzeigen
npx playwright show-report
```

### Alle Tests ausführen

Mit dem folgenden Befehl kannst du alle Tests (Unit-Tests und E2E-Tests) ausführen:

```bash
npm run test:all
```

## Teststruktur

### Unit-Tests (Vitest)

Unit-Tests befinden sich in der Datei `src/tests/stripe-utils.test.ts`. Sie testen die Hilfsfunktionen für die Stripe-Integration.

Beispiel für einen Unit-Test:

```typescript
import { describe, it, expect } from 'vitest';
import { formatAmountForStripe } from '@/utils/stripe/stripe-helpers';

describe('Stripe Hilfsfunktionen', () => {
  describe('formatAmountForStripe', () => {
    it('sollte den Betrag korrekt für EUR formatieren', () => {
      expect(formatAmountForStripe(10.99, 'eur')).toBe(1099);
    });
  });
});
```

### E2E-Tests (Playwright)

E2E-Tests befinden sich in der Datei `src/tests/stripe-integration.spec.ts`. Sie testen die Stripe-Integration und die dynamischen Routen.

Beispiel für einen E2E-Test:

```typescript
import { test, expect } from '@playwright/test';

test('sollte zur Success-Seite mit Session-ID weiterleiten', async ({
  page,
}) => {
  await page.goto(`${BASE_URL}/booking/success?session_id=${SESSION_ID}`);

  // Warte auf die Weiterleitung
  await page.waitForURL(`**/booking/success/${SESSION_ID}`);

  // Überprüfe die URL nach der Weiterleitung
  expect(page.url()).toContain(`/booking/success/${SESSION_ID}`);
});
```

## Konfiguration

### Vitest-Konfiguration

Die Vitest-Konfiguration befindet sich in der Datei `vitest.config.ts` im Hauptverzeichnis des Projekts.

### Playwright-Konfiguration

Die Playwright-Konfiguration befindet sich in der Datei `playwright.config.ts` im Hauptverzeichnis des Projekts.

## Fehlerbehebung

### Vitest-Fehler

Wenn du Fehler mit Vitest bekommst:

1. Stelle sicher, dass alle Abhängigkeiten installiert sind
2. Überprüfe die Imports in den Testdateien
3. Führe die Tests im Debug-Modus aus:

```bash
npx vitest --debug
```

### Playwright-Fehler

Wenn du Fehler mit Playwright bekommst:

1. Stelle sicher, dass die Anwendung läuft
2. Überprüfe, ob die Session-ID gültig ist
3. Führe die Tests im Debug-Modus aus:

```bash
npx playwright test --debug
```

## Weitere Ressourcen

- [Vitest-Dokumentation](https://vitest.dev/guide/)
- [Playwright-Dokumentation](https://playwright.dev/docs/intro)
- [Testing Library-Dokumentation](https://testing-library.com/docs/)
