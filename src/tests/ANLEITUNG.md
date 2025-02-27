# Anleitung zur Ausführung der Tests

Diese Anleitung beschreibt, wie du die Tests für die Stripe-Integration und die dynamischen Routen ausführen kannst.

## Voraussetzungen

1. Node.js und npm installiert
2. Die Anwendung ist konfiguriert mit:
   - Stripe API-Schlüssel (Testmodus)
   - Google Calendar API-Schlüssel
   - Datenbank-Verbindung

## PowerShell-Tests (für Windows)

### Ausführung der PowerShell-Skripte

1. Öffne PowerShell
2. Navigiere zum Projektverzeichnis
3. Führe das Skript aus:

```powershell
# Einzelne Tests ausführen
.\src\tests\run-stripe-tests.ps1

# Playwright-Tests ausführen
.\src\tests\run-playwright-tests.ps1

# Alle Tests ausführen
.\src\tests\run-all-tests.ps1
```

4. Optional: Setze Umgebungsvariablen:

```powershell
$env:BASE_URL = "https://deine-domain.de"
$env:API_TEST_KEY = "dein-api-key"
.\src\tests\run-all-tests.ps1
```

## Postman-Tests (Fehlerbehebung)

Falls die Postman-Tests nicht funktionieren, kannst du folgende Schritte zur Fehlerbehebung durchführen:

### Manuelle API-Tests mit Postman

1. Erstelle eine neue Sammlung in Postman
2. Füge folgende Anfragen hinzu:

#### 1. Checkout Session erstellen

- Methode: POST
- URL: {{BASE_URL}}/api/stripe/checkout
- Header:
  - Content-Type: application/json
  - x-api-key: {{API_TEST_KEY}}
- Body (raw, JSON):

```json
{
  "vehicleClass": "SUV",
  "selectedPackage": "Premium",
  "additionalOptions": ["Innenreinigung", "Polsterreinigung"],
  "dateTime": "2023-12-31T10:00:00.000Z",
  "customerDetails": {
    "firstName": "Test",
    "lastName": "Kunde",
    "email": "test@example.com",
    "phone": "+49123456789",
    "street": "Teststraße",
    "streetNumber": "123",
    "city": "Teststadt"
  },
  "calculatedPrice": {
    "basePrice": 99.99,
    "additionalPrice": 49.99,
    "totalPrice": 149.98
  },
  "duration": 120
}
```

#### 2. Buchungsdaten abrufen

- Methode: GET
- URL: {{BASE_URL}}/api/stripe/get-booking?session_id={{SESSION_ID}}
- Header:
  - x-api-key: {{API_TEST_KEY}}

#### 3. Buchung stornieren

- Methode: POST
- URL: {{BASE_URL}}/api/stripe/cancel-booking?session_id={{SESSION_ID}}
- Header:
  - x-api-key: {{API_TEST_KEY}}

### Einrichtung der Umgebung

1. Erstelle eine neue Umgebung in Postman
2. Füge folgende Variablen hinzu:
   - `BASE_URL`: `http://localhost:3000` (oder deine Basis-URL)
   - `API_TEST_KEY`: Dein API-Testschlüssel aus der `.env`-Datei
   - `SESSION_ID`: Wird nach dem ersten Test manuell gesetzt

## Playwright-Tests

### Installation von Playwright

1. Öffne ein Terminal oder PowerShell
2. Navigiere zum Projektverzeichnis
3. Installiere Playwright:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Ausführung der Playwright-Tests

1. Starte die Anwendung in einem separaten Terminal:

```bash
npm run dev
```

2. Führe die Tests aus:

```bash
# Setze eine gültige Session-ID (optional)
$env:SESSION_ID = "cs_test_deine_session_id"  # PowerShell
# ODER
export SESSION_ID=cs_test_deine_session_id    # Bash

# Führe die Tests aus
npx playwright test src/tests/stripe-routes.spec.ts
```

3. Sieh dir den Testbericht an:

```bash
npx playwright show-report
```

## Manuelle Tests

Zusätzlich zu den automatisierten Tests solltest du folgende manuelle Tests durchführen:

1. Starte einen vollständigen Buchungsprozess im Browser
2. Schließe die Zahlung in Stripe ab (im Testmodus)
3. Überprüfe, ob du zur Success-Seite weitergeleitet wirst
4. Überprüfe, ob die Buchungsdaten korrekt angezeigt werden
5. Überprüfe in der Datenbank, ob der Buchungsstatus auf "confirmed" gesetzt wurde
6. Überprüfe, ob ein Kalendereintrag erstellt wurde

## Stripe Webhook-Tests

Für Tests mit Stripe-Webhooks:

1. Installiere die [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Führe folgenden Befehl aus:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

3. Führe einen Testcheckout durch und überprüfe die Logs

## Fehlerbehebung

### Playwright-Fehler

Wenn du Fehler mit Playwright bekommst:

1. Stelle sicher, dass die Anwendung läuft
2. Überprüfe, ob die Session-ID gültig ist
3. Führe die Tests im Debug-Modus aus:

```bash
npx playwright test src/tests/stripe-routes.spec.ts --debug
```

### API-Fehler

Bei Fehlern mit den API-Anfragen:

1. Überprüfe, ob der API-Schlüssel korrekt ist
2. Stelle sicher, dass die Anwendung läuft
3. Überprüfe die Netzwerkanfragen im Browser-Entwicklertool
4. Prüfe die Server-Logs auf Fehler
