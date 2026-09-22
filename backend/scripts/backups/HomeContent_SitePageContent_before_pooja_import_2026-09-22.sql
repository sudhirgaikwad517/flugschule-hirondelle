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
-- Table structure for table `homecontent`
--

DROP TABLE IF EXISTS `homecontent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `homecontent` (
  `id` varchar(191) NOT NULL DEFAULT 'default',
  `promoCards` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`promoCards`)),
  `teamMembers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`teamMembers`)),
  `teamLink` varchar(191) NOT NULL DEFAULT '/infos/team',
  `hochHinausHtml` longtext NOT NULL,
  `newsEyebrow` varchar(191) NOT NULL DEFAULT 'AKTUELLES',
  `newsTitle` varchar(191) NOT NULL DEFAULT 'NEWS',
  `hochHinausEyebrowPrefix` varchar(191) NOT NULL DEFAULT '...mit dem',
  `hochHinausEyebrowLinkText` varchar(191) NOT NULL DEFAULT 'Team Hirondelle',
  `hochHinausTitle` varchar(191) NOT NULL DEFAULT 'HOCH HINAUS',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `homecontent`
--

LOCK TABLES `homecontent` WRITE;
/*!40000 ALTER TABLE `homecontent` DISABLE KEYS */;
INSERT INTO `homecontent` VALUES ('default','[{\"title\":\"Fliegen Lernen\",\"boldLine\":\"Der Anfang einer neuen Leidenschaft!\",\"description\":\"Reinschnuppern beim 1-Tageskurs oder Schnupperwochenende\",\"image\":\"/images/startbuttons/startbutton_schnuppern.jpg\",\"link\":\"/ausbildung/schnupperkurs\"},{\"title\":\"Shop Geöffnet\",\"boldLine\":\"Mittwoch, 2.9.26 16-19 Uhr\",\"description\":\"Alex und Sarah sind für euch in Weinheim im Laden, bitte unbedingt voranmelden!\",\"image\":\"/images/startbuttons/gutschein.jpg\",\"link\":\"/infos\"},{\"title\":\"On Tour...\",\"boldLine\":\"23.1. - 6.2.2027 | Kolumbien\",\"description\":\"Fliegen über den grünen Landschaften des Valle del Cauca in den besten Fluggebieten von Cali Richtung Medellin...\",\"image\":\"/images/bilder/2-tour-kolumbien/Kolumbien_3997_2.jpg\",\"link\":\"/reisen/kolumbien-tour\"}]','[{\"name\":\"Alex\",\"image\":\"/images/team/schlink.jpg\"},{\"name\":\"Sarah\",\"image\":\"/images/team/sarah.jpg\"},{\"name\":\"Tobi\",\"image\":\"/images/team/tobi.jpg\"},{\"name\":\"Holger\",\"image\":\"/images/team/holger.jpg\"},{\"name\":\"Markus\",\"image\":\"/images/team/markus.jpg\"}]','/infos/team','<p>Willkommen bei der Flugschule Hirondelle, der Gleitschirmschule im Rhein-Main-Neckar Dreieck. Fliegen lernen mit dem <a href=\"/infos/team\">Team Hirondelle</a> heißt: Persönliche und individuelle auf den Schüler zugeschnittene Ausbildung. Unser Team besteht aus sehr erfahrenen und ambitionierten Fluglehrern.</p><p>Alles natürlich an genialen Schulungshängen im Raum Odenwald, Kraichtal, Nahetal und in der Pfalz.</p>','AKTUELLES','NEWS','...mit dem','Team Hirondelle','HOCH HINAUS','2026-09-22 16:55:47.938');
/*!40000 ALTER TABLE `homecontent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sitepagecontent`
--

DROP TABLE IF EXISTS `sitepagecontent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sitepagecontent` (
  `id` varchar(191) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sitepagecontent`
--

LOCK TABLES `sitepagecontent` WRITE;
/*!40000 ALTER TABLE `sitepagecontent` DISABLE KEYS */;
/*!40000 ALTER TABLE `sitepagecontent` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-22 22:25:52
