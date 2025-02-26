Teilaufgabe 6: Backend-Integration – Kalenderfinalisierung & Stripe Webhooks

Ziel:
	•	Wenn Zahlung erfolgreich:
	1.	Termin endgültig in Google Calendar eintragen (z. B. „Booking for [Name/CarClass]“).
	2.	Daten (Pakete, Optionen, Kunde, Termin) in Postgres speichern.
	•	Stripe-Webhooks (optional) zur doppelten Sicherung.

Aufgabenpakete:
	1.	„Payment Success“-Flow
	•	Im Stripe Success Callback oder Webhook die Buchung in DB speichern.
	•	Google Calendar finalisieren (Event anlegen mit Adresse etc.).
	2.	Fehlerhandling (Webhook)
	•	Payment-Ereignisse von Stripe (z. B. payment_intent.failed) abfangen.
	•	Bei Fehler => Termin NICHT finalisieren.
	3.	DB-Eintrag
	•	Speichere relevanten Kontext: userId (wenn eingeloggt), Kontaktdaten, Termin, Pakete, Optionen, Preis, PaymentStatus etc.

Erwartetes Ergebnis:
	•	Bei erfolgreicher Zahlung ist alles in DB + Calendar.
	•	Webhooks richtig konfiguriert (optional).
	•	Keine Doppelbuchungen durch parallele Zugriffe.

Prüfung:
	•	Stripe Dashboard: Testkauf -> Event in Google Calendar -> DB-Datensatz => Passt.
	•	Payment-Status = succeeded -> Booking eingetragen.