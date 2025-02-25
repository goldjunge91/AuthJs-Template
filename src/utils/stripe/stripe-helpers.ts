// Import namespaced oder verwende spezifische Importe
import * as CookieConsentLib from 'vanilla-cookieconsent';

export function formatAmountForDisplay(
  amount: number,
  currency: string,
): string {
  const numberFormat = new Intl.NumberFormat(['Eur'], {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  });
  return numberFormat.format(amount);
}

export function formatAmountForStripe(
  amount: number,
  currency: string,
): number {
  const numberFormat = new Intl.NumberFormat(['Eur'], {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}

/**
 * Logs the user's cookie consent by retrieving the current cookie data
 * and user preferences using the CookieConsent API.
 * Adjust the endpoint URL as needed.
 *
 * Assumes that a global CookieConsent object is available with
 * getCookie() and getUserPreferences() methods.
 */
export function logConsent(): void {
  // Sicherheitscheck für Browser-Umgebung
  if (typeof window === 'undefined') return;

  try {
    // Verwende das globale Objekt, das von der Bibliothek bereitgestellt wird
    // @ts-ignore - Falls TypeScript Probleme mit dem globalen Objekt hat
    const cookieConsent = window.CookieConsent || CookieConsentLib;

    // Retrieve all the fields
    const cookie = cookieConsent.getCookie();
    const preferences = cookieConsent.getUserPreferences();

    // Save only the selected fields
    const userConsent = {
      consentId: cookie?.consentId,
      acceptType: preferences?.acceptType,
      acceptedCategories: preferences?.acceptedCategories,
      rejectedCategories: preferences?.rejectedCategories,
    };

    // Send the data to your backend.
    fetch('/api/cookie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userConsent),
    });
  } catch (error) {
    console.error('Error logging consent:', error);
  }
}
