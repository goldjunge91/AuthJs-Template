import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique().notNull(),
  username: text('username'),
  password: text('password'),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  role: text('role').default('USER'),
  image: text('image'),
  totpSecret: text('totpSecret'),
  isTotpEnabled: integer('isTotpEnabled', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// export const accounts = sqliteTable(
//   'account',
//   {
//     userId: text('userId')
//       .notNull()
//       .references(() => users.id, { onDelete: 'cascade' }),
//     type: text('type').$type<AdapterAccountType>().notNull(),
//     provider: text('provider').notNull(),
//     providerAccountId: text('providerAccountId').notNull(),
//     refresh_token: text('refresh_token'),
//     access_token: text('access_token'),
//     expires_at: integer('expires_at'),
//     token_type: text('token_type'),
//     scope: text('scope'),
//     id_token: text('id_token'),
//     session_state: text('session_state'),
//   },
//   account => ({
//     compoundKey: primaryKey({
//       columns: [account.provider, account.providerAccountId],
//     }),
//   }),
// );

// export const accountsRelations = relations(accounts, ({ one }) => ({
//   user: one(users, { fields: [accounts.userId], references: [users.id] }),
// }));

// export const usersRelations = relations(users, ({ many }) => ({
//   accounts: many(accounts),
// }));

// export const sessions = sqliteTable('session', {
//   sessionToken: text('sessionToken').primaryKey(),
//   userId: text('userId')
//     .notNull()
//     .references(() => users.id, { onDelete: 'cascade' }),
//   expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
// });

// export const verificationTokens = sqliteTable(
//   'verificationToken',
//   {
//     identifier: text('identifier').notNull(),
//     token: text('token').notNull(),
//     expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
//     createdAt: text('created_at')
//       .default(sql`(CURRENT_TIMESTAMP)`)
//       .notNull(),
//   },
//   vt => ({
//     compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
//   }),
// );

// export const authenticators = sqliteTable(
//   'authenticator',
//   {
//     credentialID: text('credentialID').notNull().unique(),
//     userId: text('userId')
//       .notNull()
//       .references(() => users.id, { onDelete: 'cascade' }),
//     providerAccountId: text('providerAccountId').notNull(),
//     credentialPublicKey: text('credentialPublicKey').notNull(),
//     counter: integer('counter').notNull(),
//     credentialDeviceType: text('credentialDeviceType').notNull(),
//     credentialBackedUp: integer('credentialBackedUp', {
//       mode: 'boolean',
//     }).notNull(),
//     transports: text('transports'),
//   },
//   authenticator => ({
//     compositePK: primaryKey({
//       columns: [authenticator.userId, authenticator.credentialID],
//     }),
//   }),
// );

// export const bookings = sqliteTable('bookings', {
//   id: integer('id').primaryKey({ autoIncrement: true }),
//   stripeSessionId: text('stripe_session_id').notNull().unique(),
//   date: text('date').notNull(),
//   timeSlot: text('time_slot').notNull(),
//   status: text('status').notNull().default('pending'),
//   customerEmail: text('customer_email'),
//   customerName: text('customer_name'),
//   packageType: text('package_type'),
//   calendarEventId: text('calendar_event_id'),
//   createdAt: integer('created_at', { mode: 'timestamp' })
//     .notNull()
//     .default(sql`CURRENT_TIMESTAMP`),
//   updatedAt: integer('updated_at', { mode: 'timestamp' })
//     .notNull()
//     .default(sql`CURRENT_TIMESTAMP`),
// });
