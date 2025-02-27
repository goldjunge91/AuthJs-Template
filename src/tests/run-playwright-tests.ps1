# Playwright-Tests für Stripe-Integration ausführen
# Dieses Skript führt die Playwright-Tests für die dynamischen Routen aus

# Farben für die Ausgabe
$GREEN = [ConsoleColor]::Green
$RED = [ConsoleColor]::Red
$YELLOW = [ConsoleColor]::Yellow

# Konfiguration
$BASE_URL = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:3000" }
$SESSION_ID = if ($env:SESSION_ID) { $env:SESSION_ID } else { "" }

Write-Host "Playwright-Tests für Stripe-Integration starten..." -ForegroundColor $YELLOW
Write-Host "BASE_URL: $BASE_URL" -ForegroundColor $YELLOW

# Prüfe, ob npx verfügbar ist
try {
    $null = Get-Command npx -ErrorAction Stop
} catch {
    Write-Host "npx ist nicht installiert. Bitte installiere Node.js und npm." -ForegroundColor $RED
    exit 1
}

# Wenn keine Session-ID angegeben wurde, erstelle eine mit Invoke-RestMethod
if (-not $SESSION_ID) {
    Write-Host "Keine Session-ID angegeben. Versuche, eine zu erstellen..." -ForegroundColor $YELLOW
    
    # API-Key für Tests
    $API_TEST_KEY = if ($env:API_TEST_KEY) { $env:API_TEST_KEY } else { "test-api-key" }
    
    # Datum für den Test (morgen, 10:00 Uhr)
    $TOMORROW = (Get-Date).AddDays(1).Date.AddHours(10).ToString("yyyy-MM-ddTHH:mm:ss.000Z")
    
    Write-Host "Test-Datum: $TOMORROW" -ForegroundColor $YELLOW
    
    # Checkout Session erstellen
    Write-Host "Checkout Session erstellen..." -ForegroundColor $YELLOW
    
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
}

# Setze die Umgebungsvariable für Playwright
$env:SESSION_ID = $SESSION_ID
$env:BASE_URL = $BASE_URL

# Führe die Playwright-Tests aus
Write-Host "`nPlaywright-Tests ausführen..." -ForegroundColor $YELLOW
npx playwright test src/tests/stripe-routes.spec.ts

# Zeige den Testbericht an
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nTests erfolgreich abgeschlossen!" -ForegroundColor $GREEN
    Write-Host "Testbericht anzeigen mit: npx playwright show-report" -ForegroundColor $YELLOW
} else {
    Write-Host "`nTests fehlgeschlagen!" -ForegroundColor $RED
    Write-Host "Testbericht anzeigen mit: npx playwright show-report" -ForegroundColor $YELLOW
    Write-Host "Debug-Modus: npx playwright test src/tests/stripe-routes.spec.ts --debug" -ForegroundColor $YELLOW
} 