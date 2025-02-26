Teilaufgabe 4: Frontend – Terminwahl (Schritt 5, Google Calendar, SSR)

Ziel:
	•	Kalender- oder Listenansicht, um verfügbare Termine in Europa/Berlin-Zeit zu zeigen.
	•	SSR-Abfrage an Google Calendar, um freie Slots zu ermitteln.

Aufgabenpakete:
	1.	Serverseitige Funktion / API
	•	Minimaler Endpunkt (oder Server Action) „GET /api/calendar“: Holt freie Zeiten aus Google Calendar (mithilfe Refresh Token, API Key).
	•	Antwort: Liste verfügbarer Zeitfenster (z. B. Datum + Uhrzeit, in Berlin-Zeit).
	2.	Seite/Komponente „Terminwahl“
	•	Ruft via SSR oder Client-Fetch die verfügbaren Slots ab.
	•	Darstellung in Kalender-Form oder Dropdowns.
	•	User wählt Slot => Speichere selectedDateTime im State.
	3.	Zeitzone:
	•	Achte auf Umwandlung in UTC <-> Berlin, stelle aber dem User nur Berlin-Zeiten dar.

Erwartetes Ergebnis:
	•	Fertige Seite für Schritt 5 (Termin).
	•	Funktionierende Google Calendar-Anbindung, die verfügbare Slots ausgibt.
	•	Nutzer kann Termin auswählen, Daten werden im globalen State gespeichert.

Prüfung:
	•	Aufruf der Kalender-API klappt.
	•	Zeitzonen (Berlin) werden korrekt angezeigt.
	•	User kann einen Termin erfolgreich auswählen.