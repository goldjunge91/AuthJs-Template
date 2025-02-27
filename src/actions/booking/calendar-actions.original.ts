// 'use server';

// import { getGoogleCalendar } from '@/utils/google/google-calendar';
// import { hasOverlap } from '@/actions/booking/has-overlap';
// import { format, addMinutes, addHours } from 'date-fns';
// import { cache } from '@/utils/redis/cache';

// const BUSINESS_HOURS = {
//   start: 9, // 9:00
//   end: 17, // 17:00
// };

// // Zeitintervall in Minuten (15 Minuten statt 60)
// const TIME_SLOT_INTERVAL = 15;

// // Termindauer in Minuten
// const APPOINTMENT_DURATION = 60; // 60 Minuten

// // Mindestvorlaufzeit für Buchungen in Stunden
// const MIN_BOOKING_HOURS_IN_ADVANCE = 12;

// // Prüft, ob ein bestimmtes Datum ein Wochenendtag ist
// function isWeekend(date: Date): boolean {
//   const day = date.getDay();
//   return day === 0 || day === 6; // 0 = Sonntag, 6 = Samstag
// }

// /**
//  * Holt besetzte Zeitslots aus dem Google-Kalender für einen Zeitraum
//  */
// export async function getBusyTimeSlots(
//   startDate: Date,
//   endDate: Date,
// ): Promise<string[]> {
//   console.log(
//     `🔍 getBusyTimeSlots aufgerufen für: ${startDate.toISOString()} bis ${endDate.toISOString()}`,
//   );

//   // Validierung der Eingabeparameter
//   if (
//     !startDate ||
//     !endDate ||
//     isNaN(startDate.getTime()) ||
//     isNaN(endDate.getTime())
//   ) {
//     console.error('❌ Start- und Endzeit müssen angegeben werden', {
//       startDate,
//       endDate,
//     });
//     throw new Error('Start- und Endzeit müssen angegeben werden');
//   }

//   const cacheKey = `busy-slots:${startDate.toISOString()}:${endDate.toISOString()}`;

//   return cache(
//     cacheKey,
//     async () => {
//       try {
//         console.log(
//           `📅 Suche besetzte Slots zwischen ${startDate.toISOString()} und ${endDate.toISOString()}`,
//         );

//         console.log('🔄 Initialisiere Google Calendar Client...');
//         const calendar = await getGoogleCalendar();

//         if (!calendar) {
//           console.error('❌ Kalender-Client konnte nicht initialisiert werden');
//           return [];
//         }
//         console.log('✅ Google Calendar Client erfolgreich initialisiert');

//         console.log(
//           `🔍 Rufe Kalender-Events ab für Kalender-ID: ${process.env.AUTH_CALENDAR_ID || 'primary'}`,
//         );
//         // Kalendertermine für den angegebenen Zeitraum abrufen
//         const response = await calendar.events.list({
//           calendarId: process.env.AUTH_CALENDAR_ID || 'primary',
//           timeMin: startDate.toISOString(),
//           timeMax: endDate.toISOString(),
//           singleEvents: true,
//           orderBy: 'startTime',
//         });

//         const events = response.data.items || [];
//         console.log(`✅ ${events.length} Termine gefunden`);

//         if (events.length > 0) {
//           console.log('📋 Erste 3 Events (oder weniger):');
//           events.slice(0, 3).forEach((event, index) => {
//             console.log(`  Event ${index + 1}:`, {
//               summary: event.summary,
//               start: event.start?.dateTime || event.start?.date,
//               end: event.end?.dateTime || event.end?.date,
//             });
//           });
//         }

//         // Alle möglichen Zeitslots für den Zeitraum erstellen
//         const allSlots: Date[] = [];
//         console.log('🔄 Generiere alle möglichen Zeitslots...');

//         // Berechne die früheste mögliche Buchungszeit (jetzt + MIN_BOOKING_HOURS_IN_ADVANCE)
//         const earliestBookingTime = addHours(
//           new Date(),
//           MIN_BOOKING_HOURS_IN_ADVANCE,
//         );
//         console.log(
//           `⏰ Früheste Buchungszeit: ${earliestBookingTime.toISOString()}`,
//         );

//         // Für jeden Tag im Zeitraum
//         const currentDate = new Date(startDate);
//         while (currentDate <= endDate) {
//           // Wochenenden überspringen
//           if (!isWeekend(currentDate)) {
//             // Für jede Stunde innerhalb der Geschäftszeiten
//             for (
//               let hour = BUSINESS_HOURS.start;
//               hour <= BUSINESS_HOURS.end;
//               hour++
//             ) {
//               // Für jedes 15-Minuten-Intervall innerhalb der Stunde
//               for (let minute = 0; minute < 60; minute += TIME_SLOT_INTERVAL) {
//                 const slotDate = new Date(currentDate);
//                 slotDate.setHours(hour, minute, 0, 0);

//                 // Nur Termine berücksichtigen, die mindestens MIN_BOOKING_HOURS_IN_ADVANCE Stunden in der Zukunft liegen
//                 if (slotDate >= earliestBookingTime) {
//                   allSlots.push(slotDate);
//                 }
//               }
//             }
//           }

//           // Zum nächsten Tag
//           currentDate.setDate(currentDate.getDate() + 1);
//         }

//         console.log(`✅ ${allSlots.length} mögliche Zeitslots generiert`);

//         // Besetzte Slots identifizieren
//         console.log('🔄 Identifiziere besetzte Zeitslots...');
//         const busySlots = allSlots.filter((slot) => {
//           // Endzeit des Slots berechnen (Slot + Termindauer)
//           const endSlot = addMinutes(slot, APPOINTMENT_DURATION);

//           // Prüfen, ob der Slot mit einem bestehenden Termin überlappt
//           return events.some((event: any) => {
//             if (!event.start?.dateTime || !event.end?.dateTime) return false;

//             return hasOverlap(
//               slot,
//               endSlot,
//               event.start.dateTime,
//               event.end.dateTime,
//             );
//           });
//         });

//         console.log(`✅ ${busySlots.length} besetzte Zeitslots identifiziert`);

//         // Formatiere die Slots für die Rückgabe (als yyyy-MM-ddTHH:mm String)
//         const formattedBusySlots = busySlots.map((slot) =>
//           format(slot, "yyyy-MM-dd'T'HH:mm"),
//         );
//         console.log(
//           `📤 Gebe ${formattedBusySlots.length} besetzte Zeitslots zurück`,
//         );

//         return formattedBusySlots;
//       } catch (error: unknown) {
//         console.error('❌ Fehler beim Abrufen belegter Zeitslots:', error);
//         if (
//           error &&
//           typeof error === 'object' &&
//           'response' in error &&
//           error.response &&
//           typeof error.response === 'object' &&
//           'data' in error.response
//         ) {
//           console.error('❌ API-Fehlerantwort:', error.response.data);
//         }
//         return [];
//       }
//     },
//     300,
//   ); // 5 Minuten Cache
// }

// /**
//  * Prüft die Verfügbarkeit eines bestimmten Zeitslots
//  */
// export async function checkTimeSlotAvailable(
//   date: Date,
//   time: string,
// ): Promise<boolean> {
//   console.log(
//     `🔍 checkTimeSlotAvailable aufgerufen für: ${date.toISOString()} um ${time}`,
//   );
//   try {
//     const [hours, minutes] = time.split(':').map(Number);
//     const slotStart = new Date(date);
//     slotStart.setHours(hours, minutes, 0, 0);

//     console.log(`🔄 Prüfe Verfügbarkeit für Slot: ${slotStart.toISOString()}`);

//     // Prüfe, ob der Zeitslot mindestens MIN_BOOKING_HOURS_IN_ADVANCE Stunden in der Zukunft liegt
//     const earliestBookingTime = addHours(
//       new Date(),
//       MIN_BOOKING_HOURS_IN_ADVANCE,
//     );
//     if (slotStart < earliestBookingTime) {
//       console.log(
//         `⚠️ Slot liegt weniger als ${MIN_BOOKING_HOURS_IN_ADVANCE} Stunden in der Zukunft`,
//       );
//       return false;
//     }

//     const busySlots = await getBusyTimeSlots(
//       new Date(date.setHours(0, 0, 0, 0)),
//       new Date(date.setHours(23, 59, 59, 999)),
//     );

//     const slotKey = format(slotStart, "yyyy-MM-dd'T'HH:mm");
//     const isAvailable = !busySlots.includes(slotKey);

//     console.log(
//       `✅ Slot ${slotKey} ist ${isAvailable ? 'verfügbar' : 'nicht verfügbar'}`,
//     );

//     return isAvailable;
//   } catch (error) {
//     console.error('❌ Fehler bei der Verfügbarkeitsprüfung:', error);
//     return false;
//   }
// }

// /**
//  * Gibt verfügbare Zeitslots für einen bestimmten Tag zurück
//  */
// export async function getAvailableTimeSlotsForDay(
//   date: Date,
// ): Promise<string[]> {
//   console.log(
//     `🔍 getAvailableTimeSlotsForDay aufgerufen für: ${date.toISOString()}`,
//   );

//   // Sicherstellen, dass ein gültiges Datum übergeben wurde
//   if (!date || isNaN(date.getTime())) {
//     console.error('❌ Ungültiges Datum übergeben:', date);
//     throw new Error('Ungültiges Datum');
//   }

//   // Wenn es ein Wochenende ist, direkt leeres Array zurückgeben
//   if (isWeekend(date)) {
//     console.log('⚠️ Datum ist ein Wochenende, keine verfügbaren Slots');
//     return [];
//   }

//   // Erstelle eine Kopie des Datums, um Referenzprobleme zu vermeiden
//   const dateCopy = new Date(date);

//   console.log('🔄 Hole besetzte Zeitslots...');
//   const busySlots = await getBusyTimeSlots(
//     new Date(dateCopy.setHours(0, 0, 0, 0)),
//     new Date(new Date(date).setHours(23, 59, 59, 999)),
//   );
//   console.log(`✅ ${busySlots.length} besetzte Slots gefunden`);

//   const availableSlots: string[] = [];
//   console.log('🔄 Generiere verfügbare Zeitslots...');

//   // Berechne die früheste mögliche Buchungszeit (jetzt + MIN_BOOKING_HOURS_IN_ADVANCE)
//   const earliestBookingTime = addHours(
//     new Date(),
//     MIN_BOOKING_HOURS_IN_ADVANCE,
//   );
//   console.log(`⏰ Früheste Buchungszeit: ${earliestBookingTime.toISOString()}`);

//   // Für jede Stunde innerhalb der Geschäftszeiten
//   for (let hour = BUSINESS_HOURS.start; hour <= BUSINESS_HOURS.end; hour++) {
//     // Für jedes 15-Minuten-Intervall innerhalb der Stunde
//     for (let minute = 0; minute < 60; minute += TIME_SLOT_INTERVAL) {
//       const slotDate = new Date(date);
//       slotDate.setHours(hour, minute, 0, 0);

//       // Nur Termine berücksichtigen, die mindestens MIN_BOOKING_HOURS_IN_ADVANCE Stunden in der Zukunft liegen
//       if (slotDate >= earliestBookingTime) {
//         const slotKey = format(slotDate, "yyyy-MM-dd'T'HH:mm");

//         if (!busySlots.includes(slotKey)) {
//           availableSlots.push(format(slotDate, 'HH:mm'));
//         }
//       }
//     }
//   }

//   console.log(
//     `📤 ${availableSlots.length} verfügbare Zeitslots gefunden: ${JSON.stringify(availableSlots)}`,
//   );

//   return availableSlots;
// }
