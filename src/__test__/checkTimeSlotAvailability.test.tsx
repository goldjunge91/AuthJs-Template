// import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// import { checkTimeSlotAvailability } from '@/actions/booking/check-time-slot-availability';

// // Mock für Google Calendar
// vi.mock('@/utils/google/get-google-calendar', () => ({
//   getGoogleCalendar: vi.fn(),
// }));

// describe('Terminverfügbarkeit prüfen', () => {
//   const mockCalendar = {
//     events: {
//       list: vi.fn(),
//     },
//   };

//   beforeEach(() => {
//     vi.clearAllMocks();
//     redisMock.get.mockReset();
//     redisMock.set.mockReset();
//   });

//   afterEach(() => {
//     vi.restoreAllMocks();
//   });

//   it('soll true zurückgeben, wenn kein Terminkonflikt besteht', async () => {
//     // Keine Events in der Antwort
//     mockCalendar.events.list.mockResolvedValue({
//       data: { items: [] },
//     });

//     const startTime = new Date('2023-10-10T10:00:00Z');
//     const endTime = new Date('2023-10-10T11:00:00Z');

//     console.log('Prüfe Verfügbarkeit für:', { startTime, endTime });

//     const result = await checkTimeSlotAvailability(startTime, endTime);
//     expect(result).toBe(true);
//   });

//   it('soll false zurückgeben, wenn es einen Terminkonflikt gibt', async () => {
//     // Event mit Überschneidung
//     mockCalendar.events.list.mockResolvedValue({
//       data: {
//         items: [
//           {
//             start: { dateTime: '2023-10-10T10:30:00Z' },
//             end: { dateTime: '2023-10-10T11:30:00Z' },
//           },
//         ],
//       },
//     });

//     const startTime = new Date('2023-10-10T10:00:00Z');
//     const endTime = new Date('2023-10-10T11:00:00Z');

//     console.log('Prüfe Verfügbarkeit für:', { startTime, endTime });

//     const result = await checkTimeSlotAvailability(startTime, endTime);
//     expect(result).toBe(false);
//   });

//   it('soll einen Fehler werfen, wenn der API-Call fehlschlägt', async () => {
//     // API-Fehler simulieren
//     mockCalendar.events.list.mockRejectedValue(new Error('API-Fehler'));

//     const startTime = new Date('2023-10-10T10:00:00Z');
//     const endTime = new Date('2023-10-10T11:00:00Z');

//     await expect(checkTimeSlotAvailability(startTime, endTime)).rejects.toThrow(
//       'API-Fehler',
//     );
//   });

//   it('soll Termine für den gesamten Tag abfragen', async () => {
//     // Mock für list-Funktion mit Argument-Capture
//     mockCalendar.events.list.mockResolvedValue({
//       data: { items: [] },
//     });

//     const startTime = new Date('2023-10-10T10:00:00Z');
//     const endTime = new Date('2023-10-10T11:00:00Z');

//     await checkTimeSlotAvailability(startTime, endTime);

//     // Prüfe, ob die list-Funktion mit den erwarteten Parametern aufgerufen wurde
//     expect(mockCalendar.events.list).toHaveBeenCalledWith(
//       expect.objectContaining({
//         timeMin: expect.any(String),
//         timeMax: expect.any(String),
//       }),
//     );
//   });
// });
