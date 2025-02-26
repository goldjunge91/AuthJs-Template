import { sql } from 'drizzle-orm';
import {
  integer,
  SQLiteColumn,
  sqliteTable,
  SQLiteTableWithColumns,
  text,
} from 'drizzle-orm/sqlite-core';

export const appointments = sqliteTable('appointments', {
  id: text('id')
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  serviceType: text('service_type', {
    enum: ['basic', 'premium', 'luxus'],
  }).notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  status: text('status', {
    enum: ['pending', 'confirmed', 'cancelled'],
  }).default('pending'),
  vehicleClass: text('vehicle_class').notNull(),
  totalAmount: integer('total_amount'),
  stripePaymentId: text('stripe_payment_id'),
  stripeSessionId: text('stripe_session_id'),
  googleCalendarEventId: text('google_calendar_event_id'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type InsertAppointment = typeof appointments.$inferInsert;
export type SelectAppointment = typeof appointments.$inferSelect;
