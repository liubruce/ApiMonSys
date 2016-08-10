-- MySQL dump 10.13  Distrib 5.6.24, for osx10.8 (x86_64)
--
-- Host: localhost    Database: apimonitor
-- ------------------------------------------------------
-- Server version	5.6.24

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `apimonitordata`
--

DROP TABLE IF EXISTS `apimonitordata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `apimonitordata` (
  `monitor_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `create_time` bigint(20) NOT NULL,
  `response_time` float NOT NULL,
  `status` int(11) NOT NULL,
  `task_id` bigint(20) NOT NULL,
  PRIMARY KEY (`monitor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15527 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `apimonitordata20160722`
--

DROP TABLE IF EXISTS `apimonitordata20160722`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `apimonitordata20160722` (
  `monitor_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `create_time` bigint(20) NOT NULL,
  `response_time` float NOT NULL,
  `status` int(11) NOT NULL,
  `task_id` bigint(20) NOT NULL,
  `availrate` tinyint(4) DEFAULT NULL,
  `correctrate` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`monitor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15727 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `apimonitordata20160723`
--

DROP TABLE IF EXISTS `apimonitordata20160723`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `apimonitordata20160723` (
  `monitor_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `create_time` bigint(20) NOT NULL,
  `response_time` float NOT NULL,
  `status` int(11) NOT NULL,
  `task_id` bigint(20) NOT NULL,
  `availrate` bigint(20) DEFAULT NULL,
  `correctrate` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`monitor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16958 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `apimonitordata20160724`
--

DROP TABLE IF EXISTS `apimonitordata20160724`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `apimonitordata20160724` (
  `monitor_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `create_time` bigint(20) NOT NULL,
  `response_time` float NOT NULL,
  `status` int(11) NOT NULL,
  `task_id` bigint(20) NOT NULL,
  `availrate` bigint(20) DEFAULT NULL,
  `correctrate` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`monitor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15847 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `apimonitordata20160725`
--

DROP TABLE IF EXISTS `apimonitordata20160725`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `apimonitordata20160725` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `create_time` bigint(20) NOT NULL,
  `response_time` float NOT NULL,
  `status` int(11) NOT NULL,
  `task_id` bigint(20) NOT NULL,
  `availrate` bigint(20) DEFAULT NULL,
  `correctrate` bigint(20) DEFAULT NULL,
  `monitorid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16473 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `apimonitordata20160726`
--

DROP TABLE IF EXISTS `apimonitordata20160726`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `apimonitordata20160726` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `create_time` bigint(20) NOT NULL,
  `response_time` float NOT NULL,
  `status` int(11) NOT NULL,
  `task_id` bigint(20) NOT NULL,
  `availrate` bigint(20) DEFAULT NULL,
  `correctrate` bigint(20) DEFAULT NULL,
  `monitorid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18685 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `apimonitordata20160727`
--

DROP TABLE IF EXISTS `apimonitordata20160727`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `apimonitordata20160727` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `create_time` bigint(20) NOT NULL,
  `response_time` float NOT NULL,
  `status` int(11) NOT NULL,
  `task_id` bigint(20) NOT NULL,
  `availrate` bigint(20) DEFAULT NULL,
  `correctrate` bigint(20) DEFAULT NULL,
  `monitorid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16685 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `apimonitordata_hour20160727`
--

DROP TABLE IF EXISTS `apimonitordata_hour20160727`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `apimonitordata_hour20160727` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `monitorid` bigint(20) DEFAULT NULL,
  `task_id` bigint(20) NOT NULL,
  `hourtime` bigint(20) NOT NULL,
  `min_response_time` float NOT NULL,
  `max_response_time` float NOT NULL,
  `available` bigint(20) DEFAULT NULL,
  `correctness` bigint(20) DEFAULT NULL,
  `total` int(11) DEFAULT NULL,
  `total_response_time` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15208 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taskapiinfo`
--

DROP TABLE IF EXISTS `taskapiinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taskapiinfo` (
  `task_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `api_method` varchar(255) DEFAULT NULL,
  `api_type` varchar(255) DEFAULT NULL,
  `api_url` varchar(255) DEFAULT NULL,
  `create_time` bigint(20) NOT NULL,
  `frequency` tinyint(4) NOT NULL,
  `status` tinyint(4) DEFAULT NULL,
  `task_desc` varchar(255) DEFAULT NULL,
  `task_name` varchar(255) DEFAULT NULL,
  `update_time` bigint(20) NOT NULL,
  `monitorids` varchar(255) DEFAULT NULL,
  `application_id` bigint(20) DEFAULT NULL,
  `operationname varchar(100) DEFAULT NULL,
  `params` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`task_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

alter table taskapiinfo add column operationname varchar(100);
alter table taskapiinfo add column params varchar(150);


/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


DROP TABLE IF EXISTS `taskfaultinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taskfaultinfo` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) NOT NULL,
  `monitorid` bigint(20) DEFAULT NULL,
  `fault_time` bigint(20) NOT NULL,
  `errormessage` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;




DROP TABLE IF EXISTS `monitorsite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `monitorsite` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(50) DEFAULT NULL,
  `monitor_name` varchar(80) NOT NULL,
  `monitor_desc` varchar(200) NOT NULL,
  `status` varchar(30) ,
  `heartbeat_time` bigint(20),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
alter table monitorsite add column address varchar(50);
alter table monitorsite add column port varchar(10);

DROP TABLE IF EXISTS `tasklinkmonitor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tasklinkmonitor` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) NOT NULL,
  `monitor_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

create table `application`(
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app_desc` varchar(255) DEFAULT NULL,
  `app_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
)ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

insert into  application set app_name='CRM系统', app_desc='CRM系统';

insert into  application set app_name='Boss计费系统', app_desc='Boss计费系统';

-- Dump completed on 2016-07-27 22:43:22
