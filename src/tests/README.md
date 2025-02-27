# Stripe-Integrationstests

Diese Dokumentation beschreibt die Tests für die Stripe-Integration und die dynamischen Routen für Success und Cancel.

## Postman-Tests

Die Datei `stripe-integration.postman.json` enthält eine Postman-Testsammlung, die die wichtigsten Funktionen der Stripe-Integration testet.

### Voraussetzungen

1. [Postman](https://www.postman.com/downloads/) installiert
2. Die Anwendung läuft lokal auf Port 3000
3. Stripe-Testmodus ist konfiguriert

### Einrichtung

1. Importiere die Datei `stripe-integration.postman.json` in Postman
2. Erstelle eine Umgebung in Postman mit folgenden Variablen:
   - `BASE_URL`: Die Basis-URL deiner Anwendung (Standard: `http://localhost:3000`)
   - `API_TEST_KEY`: Der API-Schlüssel für Tests (aus deiner `.env`-Datei)
   - `SESSION_ID`: Wird automatisch nach dem ersten Test gesetzt
   - `STRIPE_WEBHOOK_SIGNATURE`: Für Webhook-Tests (optional)

### Testfälle

Die Testsammlung enthält folgende Tests:

1. **Checkout Session erstellen**

   - Sendet eine Anfrage an `/api/stripe/checkout`
   - Erstellt eine neue Checkout-Session und speichert die Buchung in der Datenbank
   - Überprüft, ob die Antwort eine Session-ID und eine URL enthält

2. **Buchungsdaten abrufen**

   - Sendet eine Anfrage an `/api/stripe/get-booking`
   - Ruft die Buchungsdaten anhand der Session-ID ab
   - Überprüft, ob die Antwort die erwarteten Buchungsdaten enthält

3. **Buchung stornieren**

   - Sendet eine Anfrage an `/api/stripe/cancel-booking`
   - Storniert eine Buchung anhand der Session-ID
   - Überprüft, ob die Stornierung erfolgreich war

4. **Webhook-Test (Simulation)**
   - Sendet eine Anfrage an `/api/stripe/webhook`
   - Simuliert einen Stripe-Webhook für eine abgeschlossene Checkout-Session
   - Hinweis: Dieser Test wird in der Praxis fehlschlagen, da die Signatur nicht korrekt ist

### Ausführung

1. Öffne die Testsammlung in Postman
2. Wähle die erstellte Umgebung aus
3. Führe die Tests in der angegebenen Reihenfolge aus (Runner oder manuell)

## Manuelle Tests

Zusätzlich zu den Postman-Tests sollten folgende manuelle Tests durchgeführt werden:

### Test der dynamischen Routen

1. **Success-Route testen**

   - Starte einen Checkout-Prozess und schließe ihn erfolgreich ab
   - Überprüfe, ob du zur dynamischen Route `/booking/success/{CHECKOUT_SESSION_ID}` weitergeleitet wirst
   - Überprüfe, ob die Buchungsdaten korrekt angezeigt werden

2. **Cancel-Route testen**
   - Starte einen Checkout-Prozess und breche ihn ab
   - Überprüfe, ob du zur dynamischen Route `/booking/cancel/{CHECKOUT_SESSION_ID}` weitergeleitet wirst
   - Überprüfe, ob die Stornierungsmeldung korrekt angezeigt wird

### Test des Webhooks

1. **Webhook mit Stripe CLI testen**
   - Installiere die [Stripe CLI](https://stripe.com/docs/stripe-cli)
   - Führe `stripe listen --forward-to localhost:3000/api/stripe/webhook` aus
   - Führe einen Testcheckout durch und überprüfe, ob der Webhook korrekt verarbeitet wird
   - Überprüfe in der Datenbank, ob der Buchungsstatus auf "confirmed" gesetzt wurde
   - Überprüfe, ob ein Kalendereintrag erstellt wurde

## Fehlerbehebung

### Häufige Probleme

1. **431 Request Header Fields Too Large**

   - Dieses Problem tritt auf, wenn die Header zu groß sind
   - Lösung: Überprüfe die Größe der Session-ID und anderer Parameter in den URLs

2. **Webhook-Signatur ungültig**

   - Dieses Problem tritt auf, wenn die Webhook-Signatur nicht korrekt ist
   - Lösung: Verwende die Stripe CLI zum Testen von Webhooks

3. **Weiterleitung funktioniert nicht**
   - Überprüfe, ob die dynamischen Routen korrekt konfiguriert sind
   - Überprüfe, ob die Middleware die Routen korrekt behandelt
   - Überprüfe die URLs in der Stripe-Checkout-Konfiguration
