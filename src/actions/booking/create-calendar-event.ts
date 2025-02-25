import { getGoogleCalendar } from '@/utils/google/google-calendar';
import { BookingState } from '../../app/booking/_lib/_types/index';

export async function createCalendarEvent(booking: BookingState) {
  console.log('Erstelle Kalendereintrag:', booking);
  try {
    const calendar = await getGoogleCalendar();
    const endTime = new Date(
      booking.dateTime.getTime() + booking.duration * 60000,
    );

    const event = {
      summary: `Fahrzeugaufbereitung - ${booking.vehicleClass}`,
      description: `
Kunde: ${booking.contactDetails.firstName} ${booking.contactDetails.lastName}
Email: ${booking.contactDetails.email}
Telefon: ${booking.contactDetails.phone}

Adresse:
${booking.contactDetails.street} ${booking.contactDetails.number}
${booking.contactDetails.postalCode} ${booking.contactDetails.city}

Fahrzeug: ${booking.vehicleClass}
Pakete: ${booking.selectedPackages.join(', ')}
Zusatzoptionen: ${booking.selectedOptions.join(', ')}
      `.trim(),
      location: `${booking.contactDetails.street} ${booking.contactDetails.number}, ${booking.contactDetails.postalCode} ${booking.contactDetails.city}`,
      start: {
        dateTime: booking.dateTime.toISOString(),
        timeZone: 'Europe/Berlin',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Berlin',
      },
    };

    console.log('Event Daten:', event);
    const response = await calendar.events.insert({
      calendarId: process.env.AUTH_CALENDAR_ID,
      requestBody: event,
    });

    console.log('Kalendereintrag erfolgreich erstellt:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('Fehler beim Erstellen des Kalendereintrags:', error);
    throw error;
  }
}

// import { getGoogleCalendar } from '../../utils/google/get-google-calendar';

// export async function createCalendarEvent(booking: {
//   dateTime: Date;
//   duration: number;
//   vehicleClass: string;
//   customerName: string;
//   customerEmail: string;
//   packages: string[];
// }) {
//   console.log('Erstelle Kalendereintrag:', booking);
//   try {
//     const calendar = await getGoogleCalendar();
//     const endTime = new Date(
//       booking.dateTime.getTime() + booking.duration * 60000,
//     );

//     const event = {
//       summary: `Fahrzeugaufbereitung - ${booking.vehicleClass}`,
//       description: `
//   Kunde: ${booking.customerName}
//   Email: ${booking.customerEmail}
//   Fahrzeug: ${booking.vehicleClass}
//   Pakete: ${booking.packages.join(', ')}
//         `.trim(),
//       start: {
//         dateTime: booking.dateTime.toISOString(),
//         timeZone: 'Europe/Berlin',
//       },
//       end: {
//         dateTime: endTime.toISOString(),
//         timeZone: 'Europe/Berlin',
//       },
//     };

//     console.log('Event Daten:', event);
//     const response = await calendar.events.insert({
//       calendarId: process.env.AUTH_CALENDAR_ID,
//       requestBody: event,
//     });

//     console.log('Kalendereintrag erfolgreich erstellt:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Fehler beim Erstellen des Kalendereintrags:', error);
//     throw error;
//   }
// }
