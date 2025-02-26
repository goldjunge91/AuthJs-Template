Teilaufgabe 5: Frontend – Übersichtsseite & Bezahlung (Schritt 6, Stripe)

Ziel:
	•	Letzte Seite zeigt alle Eingaben + führt den Stripe Payment Flow durch.
	•	Bei Erfolg: Weiterleitung zu Dankeseite. Bei Fehler: Retry.

Aufgabenpakete:
	1.	Übersicht
	•	Zeige: Fahrzeugklasse, Pakete, Optionen, Preis, persönliche Daten, Termin.
	2.	Stripe Elements
	•	Integriere Kreditkartenfeld, o. ä.
	•	Payment Intent erstellen (ggf. via Server Action / API „POST /api/checkout“).
	3.	Bestätigung & Fehlerhandling
	•	Bei erfolgreicher Zahlung: Temporäre Seite/Loading (Stripe callback).
	•	Bei Fehler: Fehlermeldung, Button zum erneuten Versuch.

Erwartetes Ergebnis:
	•	Komplette Bestellübersicht.
	•	Stripe-Zahlung in Sandbox möglich (Test-Kreditkarten).
	•	Redirect/Feedback bei Erfolg oder Fehler.

Prüfung:
	•	Mock oder Test-Mode in Stripe => Zahlung durchspielen.
	•	Falls Payment abgelehnt (z. B. Test-Card für Fehler), korrekte Reaktion.