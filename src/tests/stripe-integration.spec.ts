import { test, expect, APIRequestContext } from '@playwright/test';

// Konfiguration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_TEST_KEY = process.env.API_TEST_KEY || 'test-api-key';
let SESSION_ID: string;

// Hilfsfunktion zum Erstellen einer Checkout-Session
async function createCheckoutSession(request: APIRequestContext) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const response = await request.post(`${BASE_URL}/api/stripe/checkout`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_TEST_KEY,
    },
    data: {
      vehicleClass: 'SUV',
      selectedPackage: 'Premium',
      additionalOptions: ['Innenreinigung', 'Polsterreinigung'],
      dateTime: tomorrow.toISOString(),
      customerDetails: {
        firstName: 'Test',
        lastName: 'Kunde',
        email: 'test@example.com',
        phone: '+49123456789',
        street: 'Teststraße',
        streetNumber: '123',
        city: 'Teststadt',
      },
      calculatedPrice: {
        basePrice: 99.99,
        additionalPrice: 49.99,
        totalPrice: 149.98,
      },
      duration: 120,
    },
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return data.session_id;
}

test.describe('Stripe Integration', () => {
  // Vor allen Tests eine Checkout-Session erstellen
  test.beforeAll(async ({ request }) => {
    SESSION_ID = await createCheckoutSession(request);
    console.log(`Checkout-Session erstellt: ${SESSION_ID}`);
  });

  test('sollte eine Checkout-Session erstellen', async () => {
    expect(SESSION_ID).toBeDefined();
  });

  test('sollte Buchungsdaten abrufen können', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/stripe/get-booking?session_id=${SESSION_ID}`,
      {
        headers: {
          'x-api-key': API_TEST_KEY,
        },
      },
    );

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('dateTime');
    expect(data).toHaveProperty('vehicleClass');
  });

  test('sollte zur Success-Seite mit Session-ID weiterleiten', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/booking/success?session_id=${SESSION_ID}`);

    // Warte auf die Weiterleitung
    await page.waitForURL(`**/booking/success/${SESSION_ID}`, {
      timeout: 5000,
    });

    // Überprüfe die URL nach der Weiterleitung
    expect(page.url()).toContain(`/booking/success/${SESSION_ID}`);
  });

  test('sollte zur Cancel-Seite mit Session-ID weiterleiten', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/booking/cancel?session_id=${SESSION_ID}`);

    // Warte auf die Weiterleitung
    await page.waitForURL(`**/booking/cancel/${SESSION_ID}`, { timeout: 5000 });

    // Überprüfe die URL nach der Weiterleitung
    expect(page.url()).toContain(`/booking/cancel/${SESSION_ID}`);
  });

  test('sollte eine Buchung stornieren können', async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}/api/stripe/cancel-booking?session_id=${SESSION_ID}`,
      {
        headers: {
          'x-api-key': API_TEST_KEY,
        },
      },
    );

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
  });
});
