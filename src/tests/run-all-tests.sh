#!/bin/bash

# Alle Tests für die Stripe-Integration ausführen
# Dieses Skript führt alle Tests für die Stripe-Integration aus

# Farben für die Ausgabe
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Konfiguration
BASE_URL=${BASE_URL:-"http://localhost:3000"}
API_TEST_KEY=${API_TEST_KEY:-"test-api-key"}
SESSION_ID=""

echo -e "${YELLOW}Alle Tests für die Stripe-Integration starten...${NC}"
echo -e "${YELLOW}BASE_URL: ${BASE_URL}${NC}"
echo -e "${YELLOW}API_TEST_KEY: ${API_TEST_KEY}${NC}"

# 1. Führe die Bash-Tests aus
echo -e "\n${YELLOW}1. Bash-Tests ausführen...${NC}"
chmod +x src/tests/run-stripe-tests.sh
./src/tests/run-stripe-tests.sh

# Speichere die Session-ID aus den Bash-Tests
SESSION_ID=$(grep -o "Session-ID erhalten: [^ ]*" /tmp/stripe-tests.log | sed 's/Session-ID erhalten: //')

if [ -z "$SESSION_ID" ]; then
  echo -e "${RED}Keine Session-ID aus den Bash-Tests erhalten. Erstelle eine neue...${NC}"
  
  # Datum für den Test (morgen, 10:00 Uhr)
  TOMORROW=$(date -d "tomorrow 10:00" +"%Y-%m-%dT%H:%M:%S.000Z")
  if [ $? -ne 0 ]; then
    # Fallback für macOS
    TOMORROW=$(date -v+1d -v10H -v0M -v0S +"%Y-%m-%dT%H:%M:%S.000Z")
  fi
  
  # Checkout Session erstellen
  RESPONSE=$(curl -s -X POST "${BASE_URL}/api/stripe/checkout" \
    -H "Content-Type: application/json" \
    -H "x-api-key: ${API_TEST_KEY}" \
    -d '{
      "vehicleClass": "SUV",
      "selectedPackage": "Premium",
      "additionalOptions": ["Innenreinigung", "Polsterreinigung"],
      "dateTime": "'"${TOMORROW}"'",
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
    }')
  
  # Extrahiere die Session-ID
  SESSION_ID=$(echo $RESPONSE | grep -o '"session_id":"[^"]*' | sed 's/"session_id":"//')
  
  if [ -z "$SESSION_ID" ]; then
    echo -e "${RED}Fehler: Keine Session-ID erhalten${NC}"
    echo -e "${RED}Response: ${RESPONSE}${NC}"
    exit 1
  else
    echo -e "${GREEN}Session-ID erhalten: ${SESSION_ID}${NC}"
  fi
fi

# 2. Führe die Playwright-Tests aus
echo -e "\n${YELLOW}2. Playwright-Tests ausführen...${NC}"
export SESSION_ID=$SESSION_ID
chmod +x src/tests/run-playwright-tests.sh
./src/tests/run-playwright-tests.sh

# 3. Manuelle Tests (Hinweis)
echo -e "\n${YELLOW}3. Manuelle Tests${NC}"
echo -e "${YELLOW}Bitte führe die folgenden manuellen Tests durch:${NC}"
echo -e "${YELLOW}- Starte einen vollständigen Buchungsprozess im Browser${NC}"
echo -e "${YELLOW}- Schließe die Zahlung in Stripe ab (im Testmodus)${NC}"
echo -e "${YELLOW}- Überprüfe, ob du zur Success-Seite weitergeleitet wirst${NC}"
echo -e "${YELLOW}- Überprüfe, ob die Buchungsdaten korrekt angezeigt werden${NC}"
echo -e "${YELLOW}- Überprüfe in der Datenbank, ob der Buchungsstatus auf 'confirmed' gesetzt wurde${NC}"
echo -e "${YELLOW}- Überprüfe, ob ein Kalendereintrag erstellt wurde${NC}"

echo -e "\n${GREEN}Alle Tests abgeschlossen!${NC}" 