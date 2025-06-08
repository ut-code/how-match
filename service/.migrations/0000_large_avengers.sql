CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`browser_id` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_browser_id_unique` ON `accounts` (`browser_id`);--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`participant_id` text NOT NULL,
	`project_id` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`browser_id` text NOT NULL,
	`project_id` text NOT NULL,
	`is_admin` integer NOT NULL,
	`roles_count` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`closed_at` text,
	`multiple_roles` integer NOT NULL,
	`drop_too_many_roles` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` text PRIMARY KEY NOT NULL,
	`participant_id` text NOT NULL,
	`role_id` text NOT NULL,
	`score` integer NOT NULL,
	`project_id` text NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`min` integer NOT NULL,
	`max` integer NOT NULL,
	`project_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
