# Tests für die Stripe-Integration ausführen
# Dieses Skript führt alle Tests für die Stripe-Integration aus

# Farben für die Ausgabe
$GREEN = [ConsoleColor]::Green
$RED = [ConsoleColor]::Red
$YELLOW = [ConsoleColor]::Yellow

# Konfiguration
$BASE_URL = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:3000" }
$API_TEST_KEY = if ($env:API_TEST_KEY) { $env:API_TEST_KEY } else { "test-api-key" }

Write-Host "Tests für die Stripe-Integration starten..." -ForegroundColor $YELLOW
Write-Host "BASE_URL: $BASE_URL" -ForegroundColor $YELLOW
Write-Host "API_TEST_KEY: $API_TEST_KEY" -ForegroundColor $YELLOW

# 1. Prüfe, ob die Anwendung läuft
Write-Host "`n1. Prüfe, ob die Anwendung läuft..." -ForegroundColor $YELLOW
try {
    $response = Invoke-WebRequest -Uri $BASE_URL -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Anwendung läuft auf $BASE_URL" -ForegroundColor $GREEN
} catch {
    Write-Host "WARNUNG: Die Anwendung scheint nicht zu laufen auf $BASE_URL" -ForegroundColor $RED
    Write-Host "Bitte starte die Anwendung mit 'npm run dev' in einem separaten Terminal" -ForegroundColor $RED
    $continue = Read-Host "Möchtest du trotzdem fortfahren? (j/n)"
    if ($continue -ne "j") {
        exit 1
    }
}

# 2. Führe Vitest-Tests aus
Write-Host "`n2. Vitest-Tests ausführen..." -ForegroundColor $YELLOW
try {
    npx vitest run
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Vitest-Tests erfolgreich abgeschlossen!" -ForegroundColor $GREEN
    } else {
        Write-Host "Vitest-Tests fehlgeschlagen!" -ForegroundColor $RED
    }
} catch {
    Write-Host "Fehler beim Ausführen der Vitest-Tests: $_" -ForegroundColor $RED
}

# 3. Führe Playwright-Tests aus
Write-Host "`n3. Playwright-Tests ausführen..." -ForegroundColor $YELLOW
$env:BASE_URL = $BASE_URL
$env:API_TEST_KEY = $API_TEST_KEY

try {
    npx playwright test
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Playwright-Tests erfolgreich abgeschlossen!" -ForegroundColor $GREEN
    } else {
        Write-Host "Playwright-Tests fehlgeschlagen!" -ForegroundColor $RED
    }
    Write-Host "Testbericht anzeigen mit: npx playwright show-report" -ForegroundColor $YELLOW
} catch {
    Write-Host "Fehler beim Ausführen der Playwright-Tests: $_" -ForegroundColor $RED
}

# 4. Manuelle Tests (Hinweis)
Write-Host "`n4. Manuelle Tests" -ForegroundColor $YELLOW
Write-Host "Bitte führe die folgenden manuellen Tests durch:" -ForegroundColor $YELLOW
Write-Host "- Starte einen vollständigen Buchungsprozess im Browser" -ForegroundColor $YELLOW
Write-Host "- Schließe die Zahlung in Stripe ab (im Testmodus)" -ForegroundColor $YELLOW
Write-Host "- Überprüfe, ob du zur Success-Seite weitergeleitet wirst" -ForegroundColor $YELLOW
Write-Host "- Überprüfe, ob die Buchungsdaten korrekt angezeigt werden" -ForegroundColor $YELLOW
Write-Host "- Überprüfe in der Datenbank, ob der Buchungsstatus auf 'confirmed' gesetzt wurde" -ForegroundColor $YELLOW
Write-Host "- Überprüfe, ob ein Kalendereintrag erstellt wurde" -ForegroundColor $YELLOW

Write-Host "`nAlle Tests abgeschlossen!" -ForegroundColor $GREEN 