-- Event module Matukio-parity schema migration (2026-09-20)
-- Adds: Event.extraFeeOptions, Event.customFieldValues, Event.detailImageUrl,
-- Event.views, Event.bookingNumber (idempotent - safe to re-run), and the new
-- EventFile table for per-event file attachments.
--
-- Run against production with:
--   mysql -h <host> -u <user> -p <database> < migration_2026-09-20_event_matukio_parity.sql
--
-- Take a backup first, e.g.:
--   mysqldump -h <host> -u <user> -p <database> Event > backup_before_event_matukio_parity_2026-09-20.sql

ALTER TABLE `event`
  ADD COLUMN IF NOT EXISTS `extraFeeOptions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `customFieldValues` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `detailImageUrl` varchar(191) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `views` int(11) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `bookingNumber` varchar(191) DEFAULT NULL;

CREATE TABLE IF NOT EXISTS `eventfile` (
  `id` varchar(191) NOT NULL,
  `eventId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `EventFile_eventId_fkey` (`eventId`),
  CONSTRAINT `EventFile_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `event` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
