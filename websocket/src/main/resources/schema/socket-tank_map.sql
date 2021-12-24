-- MySQL dump 10.13  Distrib 8.0.26, for Win64 (x86_64)
--
-- Host: 116.63.170.134    Database: socket-tank
-- ------------------------------------------------------
-- Server version	5.5.64-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `map`
--

DROP TABLE IF EXISTS `map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `map` (
  `id` int(11) NOT NULL DEFAULT '0',
  `sub_id` int(11) NOT NULL DEFAULT '0',
  `name` varchar(128) NOT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  `data` text NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT NULL,
  `secret` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `index` (`id`,`sub_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `map`
--

LOCK TABLES `map` WRITE;
/*!40000 ALTER TABLE `map` DISABLE KEYS */;
INSERT INTO `map` VALUES (3,1,'3-1',16,13,'#地图大小: 地图宽度x地图高度\nmap_size=16x13\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank05:6,tank06:6,tank07:4,tank08:3,tank09:3\n\n#初始电脑数量\ncomputer_start=3\n\n\n#地图布局\n#0：空， 1：砖， 2：铁 ，3：河 ，4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\n2222E22EE22E2222\n2222001001002222\n2000022002200002\nE01002000020010E\n2000020440200002\n2010000110000102\n2010114114110102\n2120114114110212\n2020000110000202\n2011001111001102\n2221000000001222\n0000001111000000\n00410P1KK1P01400\n','2021-01-22 03:48:15',NULL,'123456'),(3,2,'3-2',29,17,'#地图大小: 地图宽度x地图高度\nmap_size=29x17\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank06:13,tank08:5,tank07:13,tank09:10\n\n#初始电脑数量\ncomputer_start=6\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\n22222222222222222222222222222\n2000E000000000E000000000E0002\n20031300313003130031300313002\n20012100121001210012100121002\n20031300313003130031300313002\n2000E0440004400044000440E0002\n20000044000440004400044000002\n20031300313003130031300313002\n20012100121001210012100121002\n20031300313003130031300313002\n20000044000440E04400044000002\n20000044000440004400044000002\n20031300313003130031300313002\n2001K1001K100121001K1001K1002\n20031300313003130031300313002\n2000P000000000P000000000P0002\n22222222222222222222222222222','2020-12-19 10:58:53',NULL,'123456'),(3,3,'3-3',32,20,'#地图大小: 地图宽度x地图高度\nmap_size=32x20\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank06:15,tank07:5,tank08:15,tank09:10\n\n#初始电脑数量\ncomputer_start=7\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\n22222222222222222222222222222222\n200000000000000EE000000000000002\n20000000111111111111111100000002\n20333330144444444444444103333302\n20000000141111111111114100000002\n20303030141444444444414103030302\n20000000141411111111414100000002\n20303030141414444441414103030302\n20000000141414000041414100000002\n2EP000001414140KK041414100000PE2\n2EP000001414140KK041414100000PE2\n20000000141414000041414100000002\n20303030141414444441414103030302\n20000000141411111111414100000002\n20303030141444444444414103030302\n20000000141111111111114100000002\n20333330144444444444444103333302\n20000000111111111111111100000002\n200000000000000EE000000000000002\n22222222222222222222222222222222\n','2020-07-06 15:01:48',NULL,'123456'),(3,4,'3-4',50,20,'#地图大小: 地图宽度x地图高度\nmap_size=50x20\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank06:15,tank07:8,tank08:8,tank09:8\n\n#初始电脑数量\ncomputer_start=5\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\n00000044442222000022000002222200000111110003444444\n44444411114444000022111110000000000000000003000E00\n0000000000E000333322111114444440033000000003000000\n00000000004444444444222220000000033000000003000000\n22222333334444444444222220000000033P00000004444444\n33322222444440000000000000000000001110001112211111\n22222000000000004444442222221111110000001K10111332\n3300111P004444400001111122220000010001111111444444\n44441K14433300000000011112222300000000011110004422\n22111111444400000222211112233444000000111100004412\n11110002222334442221111000003444000000112233444000\n00220000000334442220000000002244400000112233000444\n11111110000334442220000000011444440000000033000444\n000022244443344400001111111000000044444333000E0000\n22223334444000004444110001100004400044433300044221\n33444444400000000000221111144440000000000000004000\n1110000044400E022200000033300000111102222200003333\n11100000333000000221110000300000222220111100003000\n11100000220000000022000003000004444333001111222033\n22334440001112233300000000001111222233000111122200\n11330004440003322200002221110000333322000222211100\n00000002223332220000111000000000002222000000000222\n\n        ','2020-05-14 07:26:22','2020-05-19 05:57:14','123456'),(1,1,'CM1',13,13,'#地图大小: 地图宽度x地图高度\nmap_size=13x13\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank05:15,tank06:3,tank07:1,tank08:1\n\n#初始电脑数量\ncomputer_start=3\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\nE00000E00000E\n0101010101010\n0101012101010\n0101010101010\n0101000001010\n0000010100000\n2011100011102\n0000010100000\n0101011101010\n0101010101010\n0101000001010\n0000011100000\n0000P1K1P0000\n','2020-06-03 01:15:12',NULL,'123456'),(1,2,'CM2',13,13,'#地图大小: 地图宽度x地图高度\nmap_size=13x13\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank05:14,tank06:3,tank07:1,tank08:1,tank09:1\n\n#初始电脑数量\ncomputer_start=3\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\nE00200E20000E\n0102000101010\n0100001101210\n0001000102010\n4001002001412\n4400010020400\n0111444200410\n0002410101010\n2102010100010\n0101011101210\n0101000000000\n0100011101010\n0101P1K1P1110\n','2020-06-03 12:09:43',NULL,'123456'),(1,3,'CM3',21,13,'#地图大小: 地图宽度x地图高度\nmap_size=21x13\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank05:7,tank06:6,tank07:3,tank08:3,tank09:2\n\n#初始电脑数量\ncomputer_start=4\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\nE000100000E001000000E\n044410000000000000222\n144400001101111100000\n444411111001000111114\n040000012200000004440\n433333330000033333334\n111000000011100000000\n000000000000100000000\n000000004444400000400\n000000004111400444400\n1002000041K1400444444\n110200004111400444404\n2110000P44444P1000000','2020-06-03 12:16:10',NULL,'123456'),(1,4,'CM4',15,13,'#地图大小: 地图宽度x地图高度\nmap_size=15x13\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank05:8,tank06:8,tank07:3,tank08:3,tank09:2\n\n#初始电脑数量\ncomputer_start=4\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\nE444022E001110E\n001001111004444\n201100100033343\n200100110030000\n100000000030000\n001003343330000\n111003101100111\n000003000000000\n333343020000000\n000001111110200\n000000000000111\n101110000011100\n101K1P111P1K100\n','2020-05-14 07:05:21','2020-05-19 05:58:29','123456'),(1,5,'CM5',30,20,'#地图大小: 地图宽度x地图高度\nmap_size=30x20\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank05:9,tank06:8,tank07:8,tank08:8,tank09:1\n\n#初始电脑数量\ncomputer_start=5\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\nE0441000000001110000000010440E\n024411111000333330001111104420\n001010000000111110000000100000\n001330011000004000001100033000\n001330010000004000000100033000\n001000030000444440000300000000\n000000030000022200000300000000\n00422103004000P000400300122400\n434110040041011101400400011434\n434114440041P1K1P1400444011434\n434110040041011101400400011434\n00422103004000P000400300122400\n000000030000022200000300000000\n000000030000444440000300000000\n001000010000004000000100000000\n001330011000004000001100033000\n001330000000111110000000033000\n001010000000333330000000100000\n024411111000111110001111104420\nE0441000000001110000000010440E\n','2020-05-14 04:13:28','2020-05-16 21:56:48','123456'),(2,1,'M2-1',23,13,'#地图大小: 地图宽度x地图高度\nmap_size=23x13\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank05:10,tank06:4,tank07:2,tank08:2,tank09:2\n\n#初始电脑数量\ncomputer_start=3\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\nE0000000000E0000000000E\n44400044414441000000400\n33344411114441444444400\n33333444414411004444400\n31111111111111333333400\n33144444244412111333340\n11111131111111111113334\n11111331111113333114444\n11333333333133333313333\n13333333344444443343444\n44334444400000004404000\n00440000001110000000000\n000000000P1K1P000000000','2020-07-07 02:43:21',NULL,'123456'),(2,2,'M2-2',15,13,'#地图大小: 地图宽度x地图高度\nmap_size=15x13\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank05:8,tank06:8,tank07:3,tank08:3\n\n#初始电脑数量\ncomputer_start=3\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\n1000001K1000001\n221110111011122\n001010010010100\n011110040011110\n010000444000010\nP0001444441000P\nE0021444441200E\n010014444410010\n010000444000010\n011210040012110\n000111111111000\n400110000011004\n4400100E0010044','2020-07-06 11:53:31',NULL,'123456'),(2,3,'M2-3',21,19,'#地图大小: 地图宽度x地图高度\nmap_size=21x19\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank05:6,tank06:5,tank07:5,tank08:5,tank09:3\n#初始电脑数量\ncomputer_start=4\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\n22221110P1K1P01112222\n211112000111000211112\n212200000000000002212\n20E000012000210000E02\n200023312000213320002\n200023312000213320002\n200044442000244440002\n202023322020223320202\n200033333000333330002\n200044444000444440002\n200033333000333330002\n202023322020223320202\n200044442000244440002\n200023312000213320002\n200023312000213320002\n20E000012000210000E02\n222200000000000002222\n222222000111000222222\n2222222P21K12P2222222\n','2020-07-06 12:23:16',NULL,'123456'),(2,4,'M2-4',23,13,'#地图大小: 地图宽度x地图高度\nmap_size=23x13\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank05:9,tank08:9,tank09:4\n\n#初始电脑数量\ncomputer_start=4\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\nE000000000414000000000E\n00001000041114000020000\n00011100411111400222000\n00001004111111140020000\n00000004100P00140000000\n00004441104140114440000\nE00444111P1K1P11144400E\n00004441104140114440000\n00000004100P00140000000\n00004004111111140010000\n00044400411111400111000\n00004000041114000010000\nE000000000414000000000E','2020-07-06 12:49:12',NULL,'123456'),(2,5,'M2-5',27,15,'#地图大小: 地图宽度x地图高度\nmap_size=27x15\n\n#玩家数量\nplayers=5\n\n#电脑数量： 格式为 类型:数量，用逗号分隔\ncomputers=tank05:5,tank06:10,tank07:6,tank08:6,tank09:4\n\n#初始电脑数量\ncomputer_start=5\n\n\n#地图布局\n#0：空 1：砖 2：铁 3：河 4：草\n#K：玩家基地 P：玩家出生点 E：电脑出生点 C：电脑基地\n\nmap_content=\n111111111111111111111111111\n10044400001KKK10000111020E1\n100004000011111000011100001\n10000200000PPP0000001110001\n100002111111114440000200001\n133003333333330443333333331\n100000000000000001000010001\n1E0002004444000001111111001\n100002000444000001101111001\n100000000000000000000044401\n133333330003333333330333331\n100000000000000000111100001\n100000000200000011111100001\n1E0000000200E000000000000E1\n111111111111111111111111111\n','2020-07-06 13:24:13',NULL,'123456');
/*!40000 ALTER TABLE `map` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-12-17 14:12:46