#!/bin/bash

# Stripe-Integrationstests ausführen
# Dieses Skript führt die Stripe-Integrationstests mit curl aus

# Farben für die Ausgabe
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Konfiguration
BASE_URL=${BASE_URL:-"http://localhost:3000"}
API_TEST_KEY=${API_TEST_KEY:-"test-api-key"}
SESSION_ID=""

echo -e "${YELLOW}Stripe-Integrationstests starten...${NC}"
echo -e "${YELLOW}BASE_URL: ${BASE_URL}${NC}"

# Datum für den Test (morgen, 10:00 Uhr)
TOMORROW=$(date -d "tomorrow 10:00" +"%Y-%m-%dT%H:%M:%S.000Z")
if [ $? -ne 0 ]; then
  # Fallback für macOS
  TOMORROW=$(date -v+1d -v10H -v0M -v0S +"%Y-%m-%dT%H:%M:%S.000Z")
fi

echo -e "${YELLOW}Test-Datum: ${TOMORROW}${NC}"

# 1. Checkout Session erstellen
echo -e "\n${YELLOW}1. Checkout Session erstellen...${NC}"
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

# 2. Buchungsdaten abrufen
echo -e "\n${YELLOW}2. Buchungsdaten abrufen...${NC}"
RESPONSE=$(curl -s -X GET "${BASE_URL}/api/stripe/get-booking?session_id=${SESSION_ID}" \
  -H "x-api-key: ${API_TEST_KEY}")

if echo $RESPONSE | grep -q "dateTime"; then
  echo -e "${GREEN}Buchungsdaten erfolgreich abgerufen${NC}"
else
  echo -e "${RED}Fehler beim Abrufen der Buchungsdaten${NC}"
  echo -e "${RED}Response: ${RESPONSE}${NC}"
fi

# 3. Buchung stornieren
echo -e "\n${YELLOW}3. Buchung stornieren...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/stripe/cancel-booking?session_id=${SESSION_ID}" \
  -H "x-api-key: ${API_TEST_KEY}")

if echo $RESPONSE | grep -q "success"; then
  echo -e "${GREEN}Buchung erfolgreich storniert${NC}"
else
  echo -e "${RED}Fehler beim Stornieren der Buchung${NC}"
  echo -e "${RED}Response: ${RESPONSE}${NC}"
fi

# 4. Dynamische Routen testen (nur Hinweis, da dies manuell getestet werden muss)
echo -e "\n${YELLOW}4. Dynamische Routen testen${NC}"
echo -e "${YELLOW}Bitte teste die folgenden URLs manuell im Browser:${NC}"
echo -e "${YELLOW}- ${BASE_URL}/booking/success/${SESSION_ID}${NC}"
echo -e "${YELLOW}- ${BASE_URL}/booking/cancel/${SESSION_ID}${NC}"

echo -e "\n${GREEN}Tests abgeschlossen!${NC}" 