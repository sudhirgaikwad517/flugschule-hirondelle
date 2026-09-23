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
-- Table structure for table `newsletterconfig`
--

DROP TABLE IF EXISTS `newsletterconfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `newsletterconfig` (
  `id` varchar(191) NOT NULL DEFAULT 'default',
  `smtpHost` varchar(191) DEFAULT NULL,
  `smtpPort` varchar(191) DEFAULT NULL,
  `smtpUser` varchar(191) DEFAULT NULL,
  `smtpPass` varchar(191) DEFAULT NULL,
  `fromEmail` varchar(191) DEFAULT NULL,
  `fromName` varchar(191) DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `queueBatchSize` int(11) NOT NULL DEFAULT 50,
  `queuePauseSeconds` int(11) NOT NULL DEFAULT 0,
  `queueMaxRetries` int(11) NOT NULL DEFAULT 2,
  `requireConfirmation` tinyint(1) NOT NULL DEFAULT 0,
  `unsubscribeTitle` varchar(191) DEFAULT NULL,
  `unsubscribeColor` varchar(191) NOT NULL DEFAULT '#00a4ff',
  `gdprExportEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `gdprDeleteEnabled` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletterconfig`
--

LOCK TABLES `newsletterconfig` WRITE;
/*!40000 ALTER TABLE `newsletterconfig` DISABLE KEYS */;
INSERT INTO `newsletterconfig` VALUES ('default','w0118399.kasserver.com','587','m03255b8','b896SxtZgkO7#kF3V4Uw','info@fs-hirondelle.de','Flugschule Hirondelle','2026-09-01 17:28:17.260',50,0,2,0,NULL,'#00a4ff',1,1);
/*!40000 ALTER TABLE `newsletterconfig` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-23 16:36:15
