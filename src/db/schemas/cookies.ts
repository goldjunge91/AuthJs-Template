import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const cookies = sqliteTable('cookies', {
  // id: text('id').$defaultFn(() => crypto.randomUUID()).primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  value: text('value').notNull(),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  userInput: text('user_input'),
  storedAt: integer('stored_at', { mode: 'timestamp_ms' }).notNull(),
});

// export type cookies = typeof cookies.$inferSelect;  cookieName: text('cookie_name').notNull().references(() => cookies.name),
export type CookieSelect = typeof cookies.$inferSelect;
