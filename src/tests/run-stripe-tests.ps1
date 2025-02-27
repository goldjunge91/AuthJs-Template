# Stripe-Integrationstests ausführen
# Dieses Skript führt die Stripe-Integrationstests mit PowerShell aus

# Farben für die Ausgabe
$GREEN = [ConsoleColor]::Green
$RED = [ConsoleColor]::Red
$YELLOW = [ConsoleColor]::Yellow

# Konfiguration
$BASE_URL = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:3000" }
$API_TEST_KEY = if ($env:API_TEST_KEY) { $env:API_TEST_KEY } else { "test-api-key" }
$SESSION_ID = ""

Write-Host "Stripe-Integrationstests starten..." -ForegroundColor $YELLOW
Write-Host "BASE_URL: $BASE_URL" -ForegroundColor $YELLOW

# Datum für den Test (morgen, 10:00 Uhr)
$TOMORROW = (Get-Date).AddDays(1).Date.AddHours(10).ToString("yyyy-MM-ddTHH:mm:ss.000Z")

Write-Host "Test-Datum: $TOMORROW" -ForegroundColor $YELLOW

# 1. Checkout Session erstellen
Write-Host "`n1. Checkout Session erstellen..." -ForegroundColor $YELLOW

$body = @{
    vehicleClass = "SUV"
    selectedPackage = "Premium"
    additionalOptions = @("Innenreinigung", "Polsterreinigung")
    dateTime = $TOMORROW
    customerDetails = @{
        firstName = "Test"
        lastName = "Kunde"
        email = "test@example.com"
        phone = "+49123456789"
        street = "Teststraße"
        streetNumber = "123"
        city = "Teststadt"
    }
    calculatedPrice = @{
        basePrice = 99.99
        additionalPrice = 49.99
        totalPrice = 149.98
    }
    duration = 120
} | ConvertTo-Json -Depth 10

$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = $API_TEST_KEY
}

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/stripe/checkout" -Method Post -Headers $headers -Body $body
    $SESSION_ID = $response.session_id
    
    if (-not $SESSION_ID) {
        Write-Host "Fehler: Keine Session-ID erhalten" -ForegroundColor $RED
        exit 1
    } else {
        Write-Host "Session-ID erhalten: $SESSION_ID" -ForegroundColor $GREEN
    }
} catch {
    Write-Host "Fehler beim Erstellen der Checkout-Session: $_" -ForegroundColor $RED
    exit 1
}

# 2. Buchungsdaten abrufen
Write-Host "`n2. Buchungsdaten abrufen..." -ForegroundColor $YELLOW

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/stripe/get-booking?session_id=$SESSION_ID" -Method Get -Headers @{ "x-api-key" = $API_TEST_KEY }
    Write-Host "Buchungsdaten erfolgreich abgerufen" -ForegroundColor $GREEN
} catch {
    Write-Host "Fehler beim Abrufen der Buchungsdaten: $_" -ForegroundColor $RED
}

# 3. Buchung stornieren
Write-Host "`n3. Buchung stornieren..." -ForegroundColor $YELLOW

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/stripe/cancel-booking?session_id=$SESSION_ID" -Method Post -Headers @{ "x-api-key" = $API_TEST_KEY }
    Write-Host "Buchung erfolgreich storniert" -ForegroundColor $GREEN
} catch {
    Write-Host "Fehler beim Stornieren der Buchung: $_" -ForegroundColor $RED
}

# 4. Dynamische Routen testen (nur Hinweis, da dies manuell getestet werden muss)
Write-Host "`n4. Dynamische Routen testen" -ForegroundColor $YELLOW
Write-Host "Bitte teste die folgenden URLs manuell im Browser:" -ForegroundColor $YELLOW
Write-Host "- $BASE_URL/booking/success/$SESSION_ID" -ForegroundColor $YELLOW
Write-Host "- $BASE_URL/booking/cancel/$SESSION_ID" -ForegroundColor $YELLOW

Write-Host "`nTests abgeschlossen!" -ForegroundColor $GREEN

# Speichere die Session-ID für andere Tests
$env:SESSION_ID = $SESSION_ID
Write-Host "Die SESSION_ID wurde in der Umgebungsvariable gespeichert: $SESSION_ID" -ForegroundColor $GREEN 