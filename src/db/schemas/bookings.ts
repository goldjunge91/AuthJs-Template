import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm'; // Import 'sql' from the base package
import { users } from './users';

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }), // ✅ Correct auto-increment syntax
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' }),
  stripeSessionId: text('stripe_session_id').notNull().unique(),
  calendarEventId: text('calendar_event_id'),
  date: text('date').notNull(), // Format: YYYY-MM-DD
  timeSlot: text('time_slot').notNull(), // Format: HH:MM
  status: text('status').notNull().default('pending'), // pending, confirmed, cancelled, expired
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name').notNull(),
  /* 🔹 Personal Information */
  street: text('street').notNull(),
  streetNumber: text('street_number').notNull(),
  city: text('city').notNull(),
  phone: text('phone').notNull(),
  packageType: text('package_type').notNull(),
  additionalOptions: text('additional_options'),
  /* 🔹 Price Field */
  price: integer('price').notNull(), // Stored in cents for accuracy

  createdAt: integer('created_at').notNull().default(Date.now()), // ✅ Uses Unix timestamp
  // updatedAt: integer('updated_at').notNull().default(Date.now()), // ✅ Uses Unix timestamp
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type InsertBooking = typeof bookings.$inferInsert;
export type SelectBooking = typeof bookings.$inferSelect;

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
}));
