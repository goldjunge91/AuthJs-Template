# Alle Tests für die Stripe-Integration ausführen
# Dieses Skript führt alle Tests für die Stripe-Integration aus

# Farben für die Ausgabe
$GREEN = [ConsoleColor]::Green
$RED = [ConsoleColor]::Red
$YELLOW = [ConsoleColor]::Yellow

# Konfiguration
$BASE_URL = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:3000" }
$API_TEST_KEY = if ($env:API_TEST_KEY) { $env:API_TEST_KEY } else { "test-api-key" }
$SESSION_ID = ""

Write-Host "Alle Tests für die Stripe-Integration starten..." -ForegroundColor $YELLOW
Write-Host "BASE_URL: $BASE_URL" -ForegroundColor $YELLOW
Write-Host "API_TEST_KEY: $API_TEST_KEY" -ForegroundColor $YELLOW

# 1. Führe die PowerShell-Tests aus
Write-Host "`n1. PowerShell-Tests ausführen..." -ForegroundColor $YELLOW
& "$PSScriptRoot\run-stripe-tests.ps1"

# Hole die Session-ID aus der Umgebungsvariable
$SESSION_ID = $env:SESSION_ID

if (-not $SESSION_ID) {
    Write-Host "Keine Session-ID aus den PowerShell-Tests erhalten. Erstelle eine neue..." -ForegroundColor $RED
    
    # Datum für den Test (morgen, 10:00 Uhr)
    $TOMORROW = (Get-Date).AddDays(1).Date.AddHours(10).ToString("yyyy-MM-ddTHH:mm:ss.000Z")
    
    # Checkout Session erstellen
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

# 2. Führe die Playwright-Tests aus
Write-Host "`n2. Playwright-Tests ausführen..." -ForegroundColor $YELLOW
$env:SESSION_ID = $SESSION_ID
& "$PSScriptRoot\run-playwright-tests.ps1"

# 3. Manuelle Tests (Hinweis)
Write-Host "`n3. Manuelle Tests" -ForegroundColor $YELLOW
Write-Host "Bitte führe die folgenden manuellen Tests durch:" -ForegroundColor $YELLOW
Write-Host "- Starte einen vollständigen Buchungsprozess im Browser" -ForegroundColor $YELLOW
Write-Host "- Schließe die Zahlung in Stripe ab (im Testmodus)" -ForegroundColor $YELLOW
Write-Host "- Überprüfe, ob du zur Success-Seite weitergeleitet wirst" -ForegroundColor $YELLOW
Write-Host "- Überprüfe, ob die Buchungsdaten korrekt angezeigt werden" -ForegroundColor $YELLOW
Write-Host "- Überprüfe in der Datenbank, ob der Buchungsstatus auf 'confirmed' gesetzt wurde" -ForegroundColor $YELLOW
Write-Host "- Überprüfe, ob ein Kalendereintrag erstellt wurde" -ForegroundColor $YELLOW

Write-Host "`nAlle Tests abgeschlossen!" -ForegroundColor $GREEN 