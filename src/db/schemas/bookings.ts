import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  stripeSessionId: text('stripe_session_id').notNull().unique(),
  date: text('date').notNull(),
  timeSlot: text('time_slot').notNull(),
  status: text('status').notNull().default('pending'),
  customerEmail: text('customer_email'),
  customerName: text('customer_name'),
  packageType: text('package_type'),
  calendarEventId: text('calendar_event_id'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
