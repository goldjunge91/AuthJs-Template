CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`stripe_session_id` text NOT NULL,
	`calendar_event_id` text,
	`date` text NOT NULL,
	`time_slot` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`customer_email` text NOT NULL,
	`customer_name` text NOT NULL,
	`street` text NOT NULL,
	`street_number` text NOT NULL,
	`city` text NOT NULL,
	`phone` text NOT NULL,
	`package_type` text NOT NULL,
	`additional_options` text,
	`price` integer NOT NULL,
	`created_at` integer DEFAULT 1740532399017 NOT NULL,
	`updated_at` integer DEFAULT 1740532399017 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_stripe_session_id_unique` ON `bookings` (`stripe_session_id`);