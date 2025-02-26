Teilaufgabe 1: Grundlegende Datenstruktur & Projekt-Setup

Ziel:
	•	Festlegen der Datenmodelle (z. B. mit Prisma) und Grundstruktur des Projekts (Next.js AppRouter).
	•	Aufsetzen von Redis (Uppstash) sowie aller relevanten ENV-Variablen (z. B. DB, Google Calendar, Stripe).

Aufgabenpakete:
	1.	Projekt initialisieren
	•	Next.js 15, TypeScript, TailwindCSS (inkl. ShadcnUI).
	•	Prisma einrichten, Postgres als DB.
	•	ENV-Variablen-Struktur für Google Calendar (Refresh Token, API Key), Stripe Keys, Redis etc.
	2.	Prisma-Modelle definieren
		Drizzle ORM Postgres in einem docker container 
	•	Beispiel: User, Booking, Package, Option (basierend auf JSON-Struktur).
	•	Migrations ausführen, um DB-Tabellen anzulegen.
	3.	Redis (Uppstash) einbinden
	•	Optionale Cache-Utility erstellen (z. B. cache.ts).
	4.	Struktur der Next.js-Ordner
	•	/app-Router (z. B. app/pages, app/api, etc.).
	•	Evtl. globale Layouts, _app.tsx-Ersatz, etc.

Erwartetes Ergebnis:
	•	Ein lauffähiges Next.js-Projekt mit korrekter Ordnerstruktur.
	•	Bereits angelegte Prisma-Modelle und funktionierende DB-Verbindung.
	•	Integriertes Tailwind und ShadcnUI.
	•	Redis-Setup (Uppstash) – geprüft, ob Verbindung klappt.

Prüfung:
	•	Lokaler Start (npm run dev) funktioniert ohne Fehler.
	•	Migrationen erfolgreich (npx prisma migrate dev).
	•	Falls .env-Datei eingerichtet, sind die Keys für Google Calendar & Stripe nur Platzhalter, aber korrekt eingebunden.