BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS `users` (
	`id`	INTEGER NOT NULL,
	`bot`	INTEGER NOT NULL,
	`username`	TEXT NOT NULL,
	`discriminator`	TEXT NOT NULL,
	PRIMARY KEY(`id`)
);
CREATE TABLE IF NOT EXISTS `user_mentions` (
	`user_id`	INTEGER NOT NULL,
	`message_id`	INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS `role_mentions` (
	`role_id`	INTEGER NOT NULL,
	`message_id`	INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS `reactions` (
	`message_id`	INTEGER NOT NULL,
	`user_id`	INTEGER NOT NULL,
	`emoji`	TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS `messages` (
	`id`	INTEGER NOT NULL,
	`author_id`	INTEGER NOT NULL,
	`channel_id`	INTEGER NOT NULL,
	`timestamp`	INTEGER NOT NULL,
	`content`	TEXT NOT NULL,
	PRIMARY KEY(`id`)
);
CREATE UNIQUE INDEX IF NOT EXISTS `unique_user_mentions` ON `user_mentions` (
	`user_id`,
	`message_id`
);
CREATE UNIQUE INDEX IF NOT EXISTS `unique_role_mentions` ON `role_mentions` (
	`role_id`,
	`message_id`
);
CREATE UNIQUE INDEX IF NOT EXISTS `unique_reactions` ON `reactions` (
	`message_id`,
	`user_id`,
	`emoji`
);
COMMIT;
