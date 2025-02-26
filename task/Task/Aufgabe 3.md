Teilaufgabe 3: Frontend – Zusätzliche Optionen & persönliche Daten (Schritt 3 & 4)

Ziel:
	•	Schritt 3: Weitere, zubuchbare Optionen (z. B. „Lackversiegelung“).
	•	Schritt 4: Formular für persönliche Daten (Gast oder registrierter User).

Aufgabenpakete:
	1.	Seite/Komponente „Zusatzoptionen“
	•	Ähnliche Darstellung wie bei Paketen (Checkboxen, Titel, Beschreibung, Preis, etc.).
	•	Nur Optionen zeigen, die zum ausgewählten Paket passen (Feld "package.id").
	•	State: selectedOptions.
	2.	Seite/Komponente „Persönliche Daten“
	•	Felder: Vorname, Nachname, E-Mail, Telefon, Straße, Nr., PLZ, Stadt.
	•	Validierung (z. B. E-Mail-Pattern, Pflichtfelder).
	•	Login optional (wenn User eingeloggt, ggf. Autofill).
	•	State: bookingDetails (Kontaktdaten).

Erwartetes Ergebnis:
	•	Zwei neue Seiten/Komponenten: „Zusatzoptionen“ und „Persönliche Daten“.
	•	Validiertes Formular für die persönlichen Daten.
	•	Im globalen State (Context) werden selectedOptions und bookingDetails sauber gespeichert.

Prüfung:
	•	User kann über den UI-Flow bei Schritt 3 seine Optionen wählen.
	•	Anschließend Schritt 4: Formular korrekt validiert.
	•	Nach „Weiter“ liegen die Daten vollständig vor.