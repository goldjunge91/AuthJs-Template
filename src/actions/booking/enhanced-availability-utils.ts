import { format } from 'date-fns';
import { TimeSlot, getAvailableTimeSlots } from './availability-utils';
import { calculateTravelTime } from '@/utils/maps/distance-matrix';

interface AppointmentWithLocation {
  start: Date;
  end: Date;
  address: string;
}

/**
 * Gets available time slots considering travel time between appointments
 * @param requestedDate - The specific date to check for availability
 * @param existingAppointments - Array of existing appointments with location information
 * @param newAppointmentDuration - Duration of the new appointment in minutes
 * @param newAppointmentAddress - Address of the new appointment location
 * @returns Array of available time slots that account for travel time
 */
export async function getAvailableSlotsWithTravelTime(
  requestedDate: Date,
  existingAppointments: AppointmentWithLocation[],
  newAppointmentDuration: number,
  newAppointmentAddress: string,
): Promise<TimeSlot[]> {
  // Validiere das Eingabedatum
  if (isNaN(requestedDate.getTime())) {
    console.error('❌ Ungültiges Datum:', requestedDate);
    throw new Error('Invalid date provided');
  }

  console.log('\n🔄 ---- NEUE VERFÜGBARKEITSANFRAGE ----');
  console.log('📅 Angefragtes Datum:', format(requestedDate, 'dd.MM.yyyy'));
  console.log('⏱️ Gewünschte Dauer:', newAppointmentDuration, 'Minuten');
  console.log('📍 Zieladresse:', newAppointmentAddress);

  const appointmentsForRequestedDate = existingAppointments.filter(
    (appt) =>
      format(appt.start, 'yyyy-MM-dd') === format(requestedDate, 'yyyy-MM-dd'),
  );

  console.log('\n📋 Existierende Termine für diesen Tag:');
  appointmentsForRequestedDate.slice(0, 10).forEach((appt) => {
    console.log(
      `   • ${format(appt.start, 'HH:mm')} - ${format(appt.end, 'HH:mm')}`,
    );
    console.log(`     📍 ${appt.address}`);
  });
  if (appointmentsForRequestedDate.length > 10) {
    console.log(
      `   ... und ${appointmentsForRequestedDate.length - 10} weitere Termine`,
    );
  }

  const businessHours = {
    start: 8,
    end: 20,
  };

  const baseSlots = getAvailableTimeSlots(
    requestedDate,
    appointmentsForRequestedDate.map((appt) => ({
      start: appt.start.toISOString(),
      end: appt.end.toISOString(),
    })),
    // @ts-ignore fixme
    businessHours,
  );

  console.log(`\n📊 Basis-Zeitfenster gefunden: ${baseSlots.length}`);
  const slotsToShow = Math.min(10, baseSlots.length);
  if (slotsToShow > 0) {
    console.log(`Zeige erste ${slotsToShow} Basis-Zeitfenster:`);
    baseSlots.slice(0, slotsToShow).forEach((slot) => {
      console.log(
        `   • ${format(slot.start, 'HH:mm')} - isAvailable: ${slot.isAvailable}`,
      );
    });
    if (baseSlots.length > 10) {
      console.log(`   ... und ${baseSlots.length - 10} weitere Zeitfenster`);
    }
  }

  let analyzedSlotsCount = 0;
  const processedSlots = await Promise.all(
    baseSlots.map(async (slot) => {
      if (!slot.isAvailable) return { ...slot, isAvailable: false };

      const shouldLog = analyzedSlotsCount < 10;
      analyzedSlotsCount++;

      if (shouldLog) {
        console.log(`\n📊 ---- ANALYSE ZEITFENSTER ${analyzedSlotsCount} ----`);
        console.log(
          `⏰ Prüfe Slot: ${format(slot.start, 'HH:mm')} - ${format(
            new Date(slot.start.getTime() + newAppointmentDuration * 60000),
            'HH:mm',
          )}`,
        );
      }

      const prevAppointment = appointmentsForRequestedDate.find(
        (appt) => appt.end <= slot.start,
      );

      const potentialEndTime = new Date(
        slot.start.getTime() + newAppointmentDuration * 60000,
      );
      const nextAppointment = appointmentsForRequestedDate.find(
        (appt) => appt.start >= potentialEndTime,
      );

      let totalDriveTime = 0;
      let slotIsAvailable = true;

      try {
        const [prevTravelTime, nextTravelTime] = await Promise.all([
          prevAppointment
            ? calculateTravelTime(
                prevAppointment.address,
                newAppointmentAddress,
              )
            : null,
          nextAppointment
            ? calculateTravelTime(
                newAppointmentAddress,
                nextAppointment.address,
              )
            : null,
        ]);

        if (prevAppointment && prevTravelTime) {
          const timeGapAfterPrev =
            (slot.start.getTime() - prevAppointment.end.getTime()) / 60000;
          if (shouldLog) {
            console.log('\n🔄 Vorheriger Termin:');
            console.log(`   • Ende: ${format(prevAppointment.end, 'HH:mm')}`);
            console.log(`   • Fahrzeit: ${prevTravelTime.duration}min`);
            console.log(`   • Zeitlücke: ${Math.round(timeGapAfterPrev)}min`);
          }

          totalDriveTime += prevTravelTime.duration;
          if (timeGapAfterPrev < prevTravelTime.duration) {
            slotIsAvailable = false;
            if (shouldLog)
              console.log('❌ Nicht genug Zeit nach vorherigem Termin');
          }
        }

        if (slotIsAvailable && nextAppointment && nextTravelTime) {
          const timeGapBeforeNext =
            (nextAppointment.start.getTime() - potentialEndTime.getTime()) /
            60000;
          if (shouldLog) {
            console.log('\n🔄 Nächster Termin:');
            console.log(
              `   • Start: ${format(nextAppointment.start, 'HH:mm')}`,
            );
            console.log(`   • Fahrzeit: ${nextTravelTime.duration}min`);
            console.log(`   • Zeitlücke: ${Math.round(timeGapBeforeNext)}min`);
          }

          totalDriveTime += nextTravelTime.duration;
          if (timeGapBeforeNext < nextTravelTime.duration) {
            slotIsAvailable = false;
            if (shouldLog)
              console.log('❌ Nicht genug Zeit vor nächstem Termin');
          }
        }

        if (shouldLog) {
          console.log(
            `\n📊 Zusammenfassung für ${format(slot.start, 'HH:mm')}:`,
          );
          console.log(`   • Gesamtfahrzeit: ${totalDriveTime}min`);
          console.log(
            `   • ${slotIsAvailable ? '✅ Verfügbar' : '❌ Nicht verfügbar'}`,
          );
        }

        return { ...slot, isAvailable: slotIsAvailable };
      } catch (error) {
        console.error('❌ Fehler bei der Slot-Analyse:', error);
        return { ...slot, isAvailable: false };
      }
    }),
  );

  const availableSlots = processedSlots.filter((slot) => slot.isAvailable);
  console.log(
    `\n🎯 Endergebnis: ${availableSlots.length} verfügbare Zeitfenster`,
  );

  if (availableSlots.length > 0) {
    console.log('\n✅ Erste 10 verfügbare Zeitfenster:');
    availableSlots.slice(0, 10).forEach((slot) => {
      console.log(`   • ${format(slot.start, 'HH:mm')}`);
    });
    if (availableSlots.length > 10) {
      console.log(
        `   ... und ${availableSlots.length - 10} weitere verfügbare Zeitfenster`,
      );
    }
  }

  return processedSlots;
}
