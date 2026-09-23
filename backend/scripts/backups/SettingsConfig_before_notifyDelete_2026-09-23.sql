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
-- Table structure for table `settingsconfig`
--

DROP TABLE IF EXISTS `settingsconfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settingsconfig` (
  `id` varchar(191) NOT NULL DEFAULT 'default',
  `sendmailTeilnehmer` tinyint(1) NOT NULL DEFAULT 1,
  `notifyParticipantsPublish` tinyint(1) NOT NULL DEFAULT 1,
  `notifyParticipantsCancel` tinyint(1) NOT NULL DEFAULT 1,
  `sendmailOwner` tinyint(1) NOT NULL DEFAULT 0,
  `ownerNotificationEmail` varchar(191) DEFAULT NULL,
  `sendmailInvoice` tinyint(1) NOT NULL DEFAULT 1,
  `sendmailTicket` tinyint(1) NOT NULL DEFAULT 1,
  `sendmailCertificate` tinyint(1) NOT NULL DEFAULT 0,
  `bookingStornotage` int(11) NOT NULL DEFAULT 28,
  `rejectionSubject` varchar(191) NOT NULL DEFAULT 'Ihre Buchungsanfrage',
  `updatedAt` datetime(3) NOT NULL,
  `sendmailNewEventGroup` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settingsconfig`
--

LOCK TABLES `settingsconfig` WRITE;
/*!40000 ALTER TABLE `settingsconfig` DISABLE KEYS */;
INSERT INTO `settingsconfig` VALUES ('default',1,1,1,0,NULL,1,1,0,28,'Ihre Buchungsanfrage','2026-09-20 08:34:35.444',1);
/*!40000 ALTER TABLE `settingsconfig` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-23 16:00:43
