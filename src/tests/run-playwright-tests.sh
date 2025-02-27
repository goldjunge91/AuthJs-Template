#!/bin/bash

# Playwright-Tests für Stripe-Integration ausführen
# Dieses Skript führt die Playwright-Tests für die dynamischen Routen aus

# Farben für die Ausgabe
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Konfiguration
BASE_URL=${BASE_URL:-"http://localhost:3000"}
SESSION_ID=${SESSION_ID:-""}

echo -e "${YELLOW}Playwright-Tests für Stripe-Integration starten...${NC}"
echo -e "${YELLOW}BASE_URL: ${BASE_URL}${NC}"

# Prüfe, ob Playwright installiert ist
if ! command -v npx &> /dev/null; then
  echo -e "${RED}npx ist nicht installiert. Bitte installiere Node.js und npm.${NC}"
  exit 1
fi

# Wenn keine Session-ID angegeben wurde, erstelle eine mit curl
if [ -z "$SESSION_ID" ]; then
  echo -e "${YELLOW}Keine Session-ID angegeben. Versuche, eine zu erstellen...${NC}"
  
  # API-Key für Tests
  API_TEST_KEY=${API_TEST_KEY:-"test-api-key"}
  
  # Datum für den Test (morgen, 10:00 Uhr)
  TOMORROW=$(date -d "tomorrow 10:00" +"%Y-%m-%dT%H:%M:%S.000Z")
  if [ $? -ne 0 ]; then
    # Fallback für macOS
    TOMORROW=$(date -v+1d -v10H -v0M -v0S +"%Y-%m-%dT%H:%M:%S.000Z")
  fi
  
  echo -e "${YELLOW}Test-Datum: ${TOMORROW}${NC}"
  
  # Checkout Session erstellen
  echo -e "${YELLOW}Checkout Session erstellen...${NC}"
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

# Setze die Umgebungsvariable für Playwright
export SESSION_ID=$SESSION_ID
export BASE_URL=$BASE_URL

# Führe die Playwright-Tests aus
echo -e "\n${YELLOW}Playwright-Tests ausführen...${NC}"
npx playwright test src/tests/stripe-routes.spec.ts

# Zeige den Testbericht an
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}Tests erfolgreich abgeschlossen!${NC}"
  echo -e "${YELLOW}Testbericht anzeigen mit: npx playwright show-report${NC}"
else
  echo -e "\n${RED}Tests fehlgeschlagen!${NC}"
  echo -e "${YELLOW}Testbericht anzeigen mit: npx playwright show-report${NC}"
  echo -e "${YELLOW}Debug-Modus: npx playwright test src/tests/stripe-routes.spec.ts --debug${NC}"
fi 