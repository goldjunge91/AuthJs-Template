DROP INDEX "bookings_stripe_session_id_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "authenticator_credentialID_unique";--> statement-breakpoint
ALTER TABLE `bookings` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT 1740536206411;--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_stripe_session_id_unique` ON `bookings` (`stripe_session_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `authenticator_credentialID_unique` ON `authenticator` (`credentialID`);--> statement-breakpoint
ALTER TABLE `bookings` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL DEFAULT 1740536206411;