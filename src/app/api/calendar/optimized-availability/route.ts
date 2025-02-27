import { NextResponse } from 'next/server';
import { getGoogleCalendar } from '@/utils/google/google-calendar';
import { getAvailableSlotsWithTravelTime } from '@/actions/booking/enhanced-availability-utils';
import { toLocalTime } from '@/actions/booking/time-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log(
      '🔎 Incoming request parameters:',
      Object.fromEntries(searchParams),
    );

    const dateParam = searchParams.get('date');
    const durationParam = searchParams.get('duration');
    const addressParam = searchParams.get('address');

    if (!dateParam || !durationParam || !addressParam) {
      console.log('⚠️ Missing parameters:', {
        dateParam,
        durationParam,
        addressParam,
      });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      );
    }

    const date = new Date(dateParam);
    const duration = parseInt(durationParam, 10);
    const address = decodeURIComponent(addressParam);
    console.log('📅 Processing request for:', {
      date: date.toISOString(),
      duration,
      address,
    });

    // Get existing appointments with addresses
    console.log('📆 Fetching Google Calendar events...');
    const calendar = await getGoogleCalendar();
    const response = await calendar.events.list({
      calendarId: process.env.AUTH_CALENDAR_ID,
      timeMin: new Date(date).toISOString(),
      timeMax: new Date(
        date.getTime() + 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    console.log(`📊 Found ${events.length} calendar events`);

    // Transform events to include locations
    const appointmentsWithLocations = events
      .filter(
        (event: {
          start: { dateTime: any };
          end: { dateTime: any };
          location: any;
        }) => event.start?.dateTime && event.end?.dateTime && event.location,
      )
      .map((event: { start: any; end: any; location: any }) => ({
        start: toLocalTime(new Date(event.start!.dateTime!)),
        end: toLocalTime(new Date(event.end!.dateTime!)),
        address: event.location || '',
      }));
    console.log(
      `📍 Processed ${appointmentsWithLocations.length} events with locations`,
    );

    // Get available slots considering travel time
    console.log('🚗 Calculating availability with travel times...');
    const availableSlots = await getAvailableSlotsWithTravelTime(
      date,
      appointmentsWithLocations,
      duration,
      address,
    );

    const formattedSlots = availableSlots
      .filter((slot) => slot.isAvailable)
      .filter((slot) => {
        const slotDate = new Date(slot.start);
        return slotDate.toDateString() === date.toDateString();
      })
      .map((slot) => ({
        time: slot.formattedStart,
        dateTime: slot.start.toISOString(),
        isAvailable: true,
      }));

    console.log(
      `✨ Found ${formattedSlots.length} available slots for the requested date`,
    );

    return NextResponse.json({
      success: true,
      availableSlots: formattedSlots,
    });
  } catch (error) {
    console.error('❌ Error fetching optimized availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 },
    );
  }
}
