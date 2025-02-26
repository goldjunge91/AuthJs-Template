CREATE TABLE `cookies` (
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`value` text NOT NULL,
	`expires` integer NOT NULL,
	`user_input` text,
	`stored_at` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`service_type` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`status` text DEFAULT 'pending',
	`vehicle_class` text NOT NULL,
	`total_amount` integer,
	`stripe_payment_id` text,
	`stripe_session_id` text,
	`google_calendar_event_id` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DROP TABLE `authenticator`;--> statement-breakpoint
DROP TABLE `verificationToken`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);