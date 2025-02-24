import CookieConsent from 'vanilla-cookieconsent';

export default function logConsent() {
  // Retrieve all the fields
  const cookie = CookieConsent.getCookie();
  const preferences = CookieConsent.getUserPreferences();

  // In this example we're saving only 4 fields
  const userConsent = {
    consentId: cookie.consentId,
    acceptType: preferences.acceptType,
    acceptedCategories: preferences.acceptedCategories,
    rejectedCategories: preferences.rejectedCategories,
  };

  // Send the data to your backend
  // replace "/your-endpoint-url" with your API
  fetch('/api/cookie', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userConsent),
  });
}
