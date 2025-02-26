'use client';

import { useEffect, useState } from 'react';

export function InitAnonymousUser() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const createAnonymousUser = async () => {
      try {
        const response = await fetch('/api/setup/anonymous-user', {
          method: 'POST',
        });
        const data = await response.json();

        if (data.success) {
          console.log('Anonymer Benutzer bereit:', data.message);
          setInitialized(true);
        } else {
          console.error(
            'Fehler bei der Initialisierung des anonymen Benutzers:',
            data.error,
          );
        }
      } catch (error) {
        console.error('Fehler bei der Anfrage:', error);
      }
    };

    createAnonymousUser();
  }, []);

  return null; // Diese Komponente rendert nichts
}
