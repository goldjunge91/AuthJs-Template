DROP INDEX "authenticator_credentialID_unique";--> statement-breakpoint
DROP INDEX "bookings_stripe_session_id_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `bookings` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT 1740629205012;--> statement-breakpoint
CREATE UNIQUE INDEX `authenticator_credentialID_unique` ON `authenticator` (`credentialID`);--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_stripe_session_id_unique` ON `bookings` (`stripe_session_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);