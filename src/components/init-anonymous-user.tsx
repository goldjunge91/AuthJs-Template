'use client';

import { useEffect } from 'react';

export function InitAnonymousUser() {
  useEffect(() => {
    const createAnonymousUser = async () => {
      try {
        // Check if already authenticated - add this to prevent unnecessary requests
        const authStatus = await fetch('/api/auth/session');
        const authData = await authStatus.json();

        // Skip anonymous user creation if already authenticated
        if (authData.user) {
          console.log(
            'User already authenticated, skipping anonymous user creation',
          );
          return;
        }

        // URL length check (keep this part)
        const currentUrl = window.location.href;
        if (currentUrl.length > 2000) {
          console.error('URL ist zu lang:', currentUrl.length);
          if (currentUrl.includes('callbackUrl')) {
            const baseUrl = window.location.origin;
            const pathname = window.location.pathname;
            window.location.href = `${baseUrl}${pathname}`;
            return;
          }
        }

        // Make the request with proper error handling
        const response = await fetch('/api/setup/anonymous-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // If the response is a redirect to login/sign-in, don't treat as error
          if (response.status === 401 || response.status === 403) {
            console.log('Authentication required for anonymous user creation');
            return;
          }
          throw new Error(`HTTP-Fehler: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          console.log('Anonymer Benutzer bereit:', data.message);
        } else {
          console.error('Fehler bei der Initialisierung:', data.error);
        }
      } catch (error) {
        console.error('Fehler bei der Anfrage:', error);
      }
    };

    createAnonymousUser();
  }, []);

  return null;
}
