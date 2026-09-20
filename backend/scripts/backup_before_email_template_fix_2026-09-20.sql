-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: hirondelle_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `templatesconfig`
--

DROP TABLE IF EXISTS `templatesconfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `templatesconfig` (
  `id` varchar(191) NOT NULL DEFAULT 'default',
  `emails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`emails`)),
  `invoices` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`invoices`)),
  `tickets` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tickets`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `listViews` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`listViews`)),
  `certificates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`certificates`)),
  `csvXml` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`csvXml`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templatesconfig`
--

LOCK TABLES `templatesconfig` WRITE;
/*!40000 ALTER TABLE `templatesconfig` DISABLE KEYS */;
INSERT INTO `templatesconfig` VALUES ('default','{\"waitingList\":{\"subject\":\"Wartelistenplatz: {EVENT_TITLE}\",\"bodyHtml\":\"\\n        <h3>Hallo {BOOKING_NAME},</h3>\\n        <p>vielen Dank für Ihr Interesse an <strong>{EVENT_TITLE}</strong>.</p>\\n        <p>Da die Veranstaltung derzeit ausgebucht ist, haben wir Sie auf die Warteliste gesetzt.</p>\\n        <p>Sobald ein Platz frei wird, werden wir Sie umgehend informieren.</p>\\n        <br/>\\n        <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>\\n      \"},\"bookingConfirmation\":{\"subject\":\"Buchungsbestätigung: {EVENT_TITLE}\",\"bodyHtml\":\"\\n          <h3>Hallo {BOOKING_NAME},</h3>\\n          <p>vielen Dank für Ihre Buchung.</p>\\n          <br/>\\n          {EVENT_DETAILS}\\n          <br/>\\n          {BOOKING_DETAILS}\\n          <br/>\\n          <p>Im Anhang finden Sie Ihre Rechnung und Ihr Ticket.</p>\\n          <hr/>\\n          <p>Die Kursgebühr wird 4 Wochen vor Kursbeginn fällig. Bei Kurzfristbuchungen (ab vier Wochen vor Kursbeginn) wird der gesamte Kurspreis sofort fällig.</p>\\n          <p>Wir führen eine echte Warteliste (der Kurs ist dann tatsächlich ausgebucht). Buchungen auf Warteliste sind daher erst zu bezahlen, wenn die Teilnahme auch sicher - und der Platz verbindlich bestätigt ist.</p>\\n          <p><strong>Bankverbindung</strong><br/>\\n          Kontoinhaber: Alexander Schlink<br/>\\n          Sparkasse Südpfalz<br/>\\n          IBAN: DE32 5485 0010 1700 1976 41<br/>\\n          BIC: SOLADES1SUW</p>\\n          <hr/>\\n          <p style=\\\"color: #ff0000;\\\">Wir empfehlen zur Absicherung für Stornos / Absagen den Abschluss einer Seminarversicherung bzw. für unsere mehrtätigen Kurse / Reisen zusätzlich eine Reiseversicherung. Infos dazu findet ihr auf unserer Seite <a href=\\\"https://www.fs-hirondelle.de/infos/versicherungen\\\" style=\\\"color: #ff0000;\\\">https://www.fs-hirondelle.de/infos/versicherungen</a>.</p>\\n          <hr/>\\n          <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>\\n        \"}}','{}','{}','2026-08-28 02:38:04.827','2026-09-20 08:02:44.553','null','null','null');
/*!40000 ALTER TABLE `templatesconfig` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-20 13:34:00
