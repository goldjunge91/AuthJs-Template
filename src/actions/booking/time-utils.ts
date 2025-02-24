import { fromZonedTime, toZonedTime } from 'date-fns-tz';
/**
 * fromZonedTime
Given a date and any time zone, returns the equivalent Date in the current system time zone and the equivalent UTC time internally. An invalid date string or time zone will result in an Invalid Date.

fromZonedTime(date: Date|Number|String, timeZone: String): Date
Say a user is asked to input the date/time and time zone of an event. A date/time picker will typically return a Date instance with the chosen date, in the user's local time zone, and a select input might provide the actual IANA time zone name.

In order to work with this info effectively it is necessary to find the equivalent UTC time:

import { fromZonedTime } from 'date-fns-tz'

const date = getDatePickerValue() // e.g. 2014-06-25 10:00:00 (picked in any time zone)
const timeZone = getTimeZoneValue() // e.g. America/Los_Angeles

const utcDate = fromZonedTime(date, timeZone) // In June 10am in Los Angeles is 5pm UTC

postToServer(utcDate.toISOString(), timeZone) // post 2014-06-25T17:00:00.000Z, America/Los_Angeles
toZonedTime
Returns a Date which will format as the local time of any time zone from a specific UTC time or date in the current system time zone. An invalid date string or time zone will result in an Invalid Date.

toZonedTime(date: Date|Number|String, timeZone: String): Date
 */
const TIMEZONE = 'Europe/Berlin';

/**
 * Converts a UTC date to the local date in the specified timezone.
 * @param date - The date in UTC.
 * @returns The corresponding local date.
 */
export function toLocalTime(date: Date): Date {
  return toZonedTime(date, TIMEZONE);
}

/**
 * Converts a local date in the specified timezone to UTC.
 * @param date - The local date.
 * @returns The corresponding date in UTC.
 */
export function toUTC(date: Date): Date {
  return fromZonedTime(date, TIMEZONE);
}
