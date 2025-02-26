Teilaufgabe 2: Frontend – Fahrzeugklasse & Paketwahl (Schritt 1 & 2)

Ziel:
	•	UI und State-Management für Schritt 1 (Fahrzeugklasse) und Schritt 2 (Pakete).
	•	Auswahl und Speicherung in einem globalen State (z. B. React Context).

Aufgabenpakete:
	1.	Seite/Komponente „Fahrzeugklasse“
	•	Dropdown/Radio-Buttons für die Klassen (kleinwagen, mittelklasse, suv, transporter).
	•	Weiter-Knopf.
	2.	Seite/Komponente „Pakete“
	•	Anzeige von Paketen (z. B. via JSON-Props oder aus DB) mit Titel, Beschreibung, Dauer, Preis.
	•	Filter oder UI, um nur die zur gewählten Fahrzeugklasse passenden Pakete anzuzeigen.
	•	Mehrfachauswahl oder Einzelwahl erlauben – je nach Konzept.
	3.	React Context / globaler State
	•	Speichern von vehicleClass und selectedPackages.
	4.	Navigationsfluss
	•	Nach Auswahl Schritt 1 => Schritt 2 => (Weiter zu Schritt 3, noch leer).

Erwartetes Ergebnis:
	•	Zwei funktionierende Seiten/Komponenten für Schritt 1 & 2.
	•	Persistierung der Auswahl in einem globalen State (z. B. BookingContext).
	•	UI-Tests: User kann Fahrzeugklasse wählen, Pakete sehen und auswählen, dann zur nächsten Seite navigieren.

Prüfung:
	•	Korrekte Darstellung der Pakete.
	•	Der gewählte Fahrzeugtyp beeinflusst die Paketliste.
	•	State bleibt erhalten beim Navigieren zwischen Schritt 1 & 2.