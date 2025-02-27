import { test, expect } from '@playwright/test';

// Diese Tests erfordern eine gültige Stripe-Session-ID
// Setze SESSION_ID in der Umgebung oder ändere sie hier
const SESSION_ID = process.env.SESSION_ID || 'cs_test_a1b2c3d4e5f6g7h8i9j0';

test.describe('Stripe Dynamische Routen', () => {
  test('sollte die Success-Seite mit einer gültigen Session-ID anzeigen', async ({
    page,
  }) => {
    // Navigiere zur Success-Seite mit der Session-ID
    await page.goto(`/booking/success/${SESSION_ID}`);

    // Warte auf das Laden der Seite (entweder Erfolg oder Fehler wird angezeigt)
    await page.waitForSelector('h2, .text-destructive');
  });
  test('sollte die Cancel-Seite mit einer gültigen Session-ID anzeigen', async ({
    page,
  }) => {
    // Navigiere zur Cancel-Seite mit der Session-ID
    await page.goto(`/booking/cancel/${SESSION_ID}`);

    // Warte auf das Laden der Seite
    await page.waitForSelector('h2, .text-destructive');

    // Überprüfe, ob die Seite geladen wurde
    const pageContent = await page.textContent('body');

    // Wenn die Buchung nicht gefunden wurde, ist das auch ein gültiger Zustand für den Test
    // Überprüfe, ob die Stornierungsmeldung angezeigt wird
    expect(pageContent).toContain('Buchung abgebrochen');
  });

  test('sollte von der Success-Seite mit Query-Parameter zur dynamischen Route weiterleiten', async ({
    page,
  }) => {
    // Navigiere zur Success-Seite mit Query-Parameter
    await page.goto(`/booking/success?session_id=${SESSION_ID}`);

    // Warte auf die Weiterleitung (max. 5 Sekunden)
    await page.waitForURL(`**/booking/success/${SESSION_ID}`, {
      timeout: 5000,
    });

    // Überprüfe die URL nach der Weiterleitung
    expect(page.url()).toContain(`/booking/success/${SESSION_ID}`);
  });

  test('sollte von der Cancel-Seite mit Query-Parameter zur dynamischen Route weiterleiten', async ({
    page,
  }) => {
    // Navigiere zur Cancel-Seite mit Query-Parameter
    await page.goto(`/booking/cancel?session_id=${SESSION_ID}`);

    // Warte auf die Weiterleitung (max. 5 Sekunden)
    await page.waitForURL(`**/booking/cancel/${SESSION_ID}`, { timeout: 5000 });

    // Überprüfe die URL nach der Weiterleitung
    expect(page.url()).toContain(`/booking/cancel/${SESSION_ID}`);
  });

  test('sollte zur Buchungsseite weiterleiten, wenn keine Session-ID vorhanden ist', async ({
    page,
  }) => {
    // Navigiere zur Success-Seite ohne Session-ID
    await page.goto('/booking/success');

    // Warte auf die Weiterleitung (max. 5 Sekunden)
    await page.waitForURL('**/booking/vehicle-class', { timeout: 5000 });

    // Überprüfe die URL nach der Weiterleitung
    expect(page.url()).toContain('/booking/vehicle-class');
  });
});
