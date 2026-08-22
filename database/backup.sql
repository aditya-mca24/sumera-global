-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: surema_fashion
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` char(36) NOT NULL ,
  `user_id` char(36) NOT NULL,
  `full_name` text NOT NULL,
  `phone` text NOT NULL,
  `line1` text NOT NULL,
  `line2` text DEFAULT NULL,
  `city` text NOT NULL,
  `state` text NOT NULL,
  `pincode` text NOT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'India',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `fk_addresses_user` (`user_id`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES ('aef02a3d-1a21-4f46-9284-678b2cc1ce49','b39165b1-25fc-4576-8d67-27763c9389ec','raghu','9307176322','n5-sbra iit kanpur',NULL,'kanpur','uttar pradesh','123456','India',1,'2026-07-26 12:12:03.221058'),('e40e19ea-6e69-428d-8fcd-c3bedf7decf0','386402d9-c54b-4262-9a84-3efbc399eba4','Aditya Kumar','7897264494','Kalyanpur',NULL,'Kanpur','Uttar Pradesh','208017','India',0,'2026-08-17 10:33:10.709323');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` char(36) NOT NULL ,
  `title` text NOT NULL,
  `subtitle` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `link_url` text DEFAULT NULL,
  `button_text` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES ('04663d1b-845e-4357-b19f-880c9fedf80a','Winter Hoodies 2026','Hoodies','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/category-images/1784052567274-pn6krstwui.png',NULL,'Shop Now',4,1,'2026-07-08 06:12:38.668015'),('471d44b9-c654-4bc2-a719-a4e90ec1094b','Summer Collection 2026','Breezy styles for sunny days','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/category-images/1784048935967-stmpq8vu1l8.png','/shop?category=dresses','Explore',2,1,'2026-07-02 05:36:03.868472'),('838c86cc-8b5d-434f-96dd-0a0501f342b7','New Season, New You','Discover the latest fashion trends','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/category-images/1784052341921-6zhodcbdvkp.png','/shop','Shop Now',3,1,'2026-07-02 05:36:03.868472'),('baf7c870-134b-4d98-a9bf-31f3a471ca26','Bulk Orders Welcome','Manufacturing-grade quality at scale','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/category-images/1783790278325-g57a4cnkfr5.png','/bulk-order','Get Quote',1,1,'2026-07-02 05:36:03.868472');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bulk_orders`
--

DROP TABLE IF EXISTS `bulk_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bulk_orders` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `company_name` text DEFAULT NULL,
  `contact_name` text DEFAULT NULL,
  `email` text NOT NULL,
  `phone` text DEFAULT NULL,
  `product_type` text DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `sizes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sizes`)),
  `colors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`colors`)),
  `customization` text DEFAULT NULL,
  `delivery_location` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending' CHECK (`status` in ('pending','confirmed','dispatched','delivered','cancelled')),
  `quotation_amount` decimal(10,2) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `fk_bulk_orders_user` (`user_id`),
  CONSTRAINT `fk_bulk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bulk_orders`
--

LOCK TABLES `bulk_orders` WRITE;
/*!40000 ALTER TABLE `bulk_orders` DISABLE KEYS */;
INSERT INTO `bulk_orders` VALUES ('663236bd-8cb5-4835-bfc5-b6fdaab50649',NULL,'asdfgh','asdfghj','test@1gmail.com','7963214521','Kurtis',99,NULL,NULL,'qwertyuiop[asdfghjkl','mumbai','Business Type: Wholesaler. wssfv bdgv wvgbsh','confirmed',20000.00,'2026-07-12 08:59:16.398803','2026-07-12 08:59:16.398803'),('92c64399-5479-48b0-9326-ffb6589ae5c9',NULL,NULL,'aditya kumar','adityakumar16uiet@gmail.com','7485963215','Kurtis',55,'[\"XS\",\"L\",\"XL\",\"XXL\"]','[\"Red\",\"Navy\",\"Black\",\"White\"]',NULL,'delhi',NULL,'dispatched',10000.00,'2026-07-07 12:16:30.857179','2026-07-09 09:53:14.701000'),('bea14e7e-7f6c-45a6-8780-25d2a47f2b9c','4f079a69-dd94-492b-8674-d5219be85afe','sdghfg','ghdjggg','test@gmail.com','7894612377','Other',740,'[\"XS\",\"3XL\",\"XXL\",\"Free Size\"]','[\"Blue\",\"Red\",\"White\",\"Black\"]',NULL,'qwertyuiop[',NULL,'pending',NULL,'2026-07-26 22:56:46.644327','2026-07-26 22:56:46.644327');
/*!40000 ALTER TABLE `bulk_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` char(36) NOT NULL ,
  `user_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `variant_id` char(36) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `fk_cart_user` (`user_id`),
  KEY `fk_cart_product` (`product_id`),
  KEY `fk_cart_variant` (`variant_id`),
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES ('169d870c-a8e6-460f-9bb5-99ec91b2a90f','386402d9-c54b-4262-9a84-3efbc399eba4','a7e23dfb-ed5d-44d8-9cc1-e28b634968a4',NULL,1,'2026-08-19 17:43:47.585166'),('21735a37-ff63-4a75-9c3c-4f824a9da237','4f079a69-dd94-492b-8674-d5219be85afe','a7e23dfb-ed5d-44d8-9cc1-e28b634968a4',NULL,2,'2026-07-26 23:08:20.371274'),('50e8933e-2a1d-465b-bd61-368756ceabe6','4f079a69-dd94-492b-8674-d5219be85afe','53794d2d-38af-4580-9357-ae0c59cddabf',NULL,1,'2026-07-26 23:08:02.901852'),('84c90ffb-7b8c-45c6-a6fc-cba7600ccc43','4f079a69-dd94-492b-8674-d5219be85afe','45aea74b-e29b-4bef-91df-a86f41122f0d',NULL,1,'2026-07-26 23:07:39.583422'),('8e61ad9e-0a2a-4a99-a19d-856021a582dd','4f079a69-dd94-492b-8674-d5219be85afe','7cfa62c0-1630-4fa8-b60c-fa3318b1717f',NULL,1,'2026-07-26 23:07:49.580181'),('a8d7dd09-201d-4bd0-a40e-95ff4c623a98','4f079a69-dd94-492b-8674-d5219be85afe','f89f3efb-b377-41c5-9fe5-f1a18aac2cb6',NULL,2,'2026-07-26 23:07:16.882889'),('b16e711e-1de7-47ea-b266-ee1a902364a7','386402d9-c54b-4262-9a84-3efbc399eba4','45aea74b-e29b-4bef-91df-a86f41122f0d',NULL,1,'2026-08-17 11:08:03.526688'),('e186f1a6-8830-4613-9acc-4f7706d7a636','386402d9-c54b-4262-9a84-3efbc399eba4','f89f3efb-b377-41c5-9fe5-f1a18aac2cb6',NULL,1,'2026-08-17 18:49:46.675848');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` char(36) NOT NULL,
  `name` text NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('01aa65c7-aba8-422c-8891-82a92ee6fbd2','Dresses','dresses','Beautiful dresses for every occasion','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjJE7VK9x3rOb0h_lgAmsiVLJyTaYtjVP0k5US9cBrqQ&s=10',7,1,'2026-07-02 05:36:03.868472'),('27504774-1835-4bd1-9b69-bb7726cacc55','Western Tops','western-tops','Trendy western-style tops for every occasion','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/category-images/1783798064082-9ofcircv6pn.png',1,1,'2026-07-02 05:36:03.868472'),('5540b035-3459-4d3b-ac86-937f6b3f1674','Kurtis','kurtis','Elegant kurtis blending tradition and comfort','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThUS3xov4GcBUSaraf2Rerf5p8OSjWva76w7fuqWQxUw&s=1040.jpeg?auto=compress&cs=tinysrgb&w=600',6,1,'2026-07-02 05:36:03.868472'),('656c0351-70bc-4910-9af6-099bb7b671d0','Cord Sets','cord-sets','Matching co-ordinated sets for effortless style','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn4DJhNtrYHOC3JLUv4p9CyMc8ZlQnzPwKEAUS-7Nbuw&s=10',3,1,'2026-07-02 05:36:03.868472'),('73440505-c23f-440a-9d86-c2520eec2642','T-Shirts','t-shirts','Comfortable and casual t-shirts','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/category-images/1783798155924-9l72qhf09j.png',4,1,'2026-07-02 05:36:03.868472'),('babcafde-5174-4072-9c55-d4a08c115ee1','Crop Tops','crop-tops','Stylish crop tops for a modern look','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/category-images/1783798107909-zl00p2q6kjh.png',2,1,'2026-07-02 05:36:03.868472'),('c5d0418f-da55-4a0e-ac0e-ebb81c2a491f','Hoodies','hoodies',NULL,'https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/category-images/1783969773551-l73mrra8ki.jpg',8,1,'2026-07-11 19:30:04.640658'),('ed433ee4-f027-41cb-adb3-89a667c70291','Jeans','jeans','Premium quality jeans for all fits','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCuWDTZduQ9OX-5dd_dUqrbb_xG-p8g6e_go1DLm-5BA&s=10',5,1,'2026-07-02 05:36:03.868472');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` char(36) NOT NULL ,
  `code` varchar(100) NOT NULL,
  `type` varchar(20) NOT NULL CHECK (`type` in ('fixed','percentage')),
  `value` decimal(10,2) NOT NULL,
  `min_order_value` decimal(10,2) DEFAULT 0.00,
  `max_uses` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `expires_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES ('411f6a88-7f76-4574-848e-55efbbb75cf6','WINTER15','percentage',15.00,1000.00,100,0,1,'2026-08-10 00:00:00.000000','2026-07-09 11:52:47.327408'),('a31157b9-e503-4260-b838-141d14b54dc4','FLAT200','fixed',200.00,1000.00,500,0,1,NULL,'2026-07-02 05:37:29.458799'),('bbf0e3d8-f523-4768-a105-fbd393a5eb22','SUREMA20','percentage',20.00,1500.00,200,0,1,NULL,'2026-07-02 05:37:29.458799'),('f6b7f405-1f17-46ae-aaa8-1215acf77436','WELCOME10','percentage',10.00,500.00,1000,1,1,NULL,'2026-07-02 05:37:29.458799');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verification_tokens`
--

DROP TABLE IF EXISTS `email_verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification_tokens` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_token` (`user_id`,`token_hash`),
  CONSTRAINT `email_verification_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification_tokens`
--

LOCK TABLES `email_verification_tokens` WRITE;
/*!40000 ALTER TABLE `email_verification_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
INSERT INTO `newsletter_subscribers` VALUES ('37ca76ce-be85-4ed9-8eec-433933ca7208','adityakumar16iitk@gmail.com',1,'2026-07-12 03:41:33.973669');
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` char(36) NOT NULL ,
  `order_id` char(36) NOT NULL,
  `product_id` char(36) DEFAULT NULL,
  `product_name` text NOT NULL,
  `product_image` text DEFAULT NULL,
  `variant_size` text DEFAULT NULL,
  `variant_color` text DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `fk_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES ('0e1a8d16-b37f-4dbb-b052-5de8f3e5e3ad','1796f26f-a09a-4077-9d49-3278268ea3de','f89f3efb-b377-41c5-9fe5-f1a18aac2cb6','new black tops','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/f89f3efb-b377-41c5-9fe5-f1a18aac2cb6/1783792292926-g66nfcmia8.png',NULL,NULL,1,399.00,399.00,'2026-07-26 12:12:14.767952'),('0fa4d22b-532e-4eb4-b904-ffc3bd29273f','1796f26f-a09a-4077-9d49-3278268ea3de','4ec01050-019f-4dda-b81f-dccbf3ca36bf','Full Sleeve Purple Girls Crop Hoodies','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg24kEuj6W1SQoVZl1gOTnlqQvcB4iDPPFTFsffscZJQ&s=10',NULL,NULL,2,399.00,798.00,'2026-07-26 12:12:14.763525'),('112109aa-eebe-4cd0-8bb2-a8f52e6cd73f','35b89e5d-f81b-4986-aa97-68a579dcb2a0','45aea74b-e29b-4bef-91df-a86f41122f0d','blue fabric dresses','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/45aea74b-e29b-4bef-91df-a86f41122f0d/1783600904564-z1j4cn7uhn.png',NULL,NULL,1,599.00,599.00,'2026-08-17 10:37:55.912658'),('3d21f7c0-3271-43bc-b751-ac0aabb0666e','35b89e5d-f81b-4986-aa97-68a579dcb2a0','7cfa62c0-1630-4fa8-b60c-fa3318b1717f','Kurti - Black Chanderi Floral Style','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/7cfa62c0-1630-4fa8-b60c-fa3318b1717f/1783792396972-6am0pw2xk6.png',NULL,NULL,1,799.00,799.00,'2026-08-17 10:37:55.902300'),('6b1552e4-e22c-4a6e-bdcf-67f01170fec7','e4732bf4-0b51-40ee-b18e-83f5f66149b9','45aea74b-e29b-4bef-91df-a86f41122f0d','blue fabric dresses','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/45aea74b-e29b-4bef-91df-a86f41122f0d/1783591140733-rnbmyh6o9n.jpg',NULL,NULL,1,599.00,599.00,'2026-08-17 11:16:04.378975'),('97ef2a3a-140b-4d48-b2fb-7d46dab8496c','35b89e5d-f81b-4986-aa97-68a579dcb2a0','a7e23dfb-ed5d-44d8-9cc1-e28b634968a4','Hoodies For Women','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/a7e23dfb-ed5d-44d8-9cc1-e28b634968a4/1783969984967-pryf04au4bk.jpg',NULL,NULL,1,499.00,499.00,'2026-08-17 10:37:55.898350'),('9abd629b-e3c5-4707-b058-bb74613f8bf6','e4732bf4-0b51-40ee-b18e-83f5f66149b9','45aea74b-e29b-4bef-91df-a86f41122f0d','blue fabric dresses','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/45aea74b-e29b-4bef-91df-a86f41122f0d/1783600904564-z1j4cn7uhn.png',NULL,NULL,1,599.00,599.00,'2026-08-17 11:16:04.381826'),('b31f5047-b750-460c-9a5c-bda6a0920655','cd9f0ddb-30b6-4cf1-b2ca-e00e85b01647','4651bd83-48df-4e14-8be3-52807bc46d31','Shop Trendy Western Tops','https://assets.myntassets.com/w_200,q_50,,dpr_3,fl_progressive,f_webp/assets/images/2025/NOVEMBER/22/QbijvVj1_43d8025aadae495ca5cae4f1a016d840.jpg',NULL,NULL,1,499.00,499.00,'2026-08-17 11:07:53.257993'),('ca1f82c1-40fd-4ab2-81cc-18182e7f9ae6','1796f26f-a09a-4077-9d49-3278268ea3de','45aea74b-e29b-4bef-91df-a86f41122f0d','blue fabric dresses','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/45aea74b-e29b-4bef-91df-a86f41122f0d/1783600904564-z1j4cn7uhn.png',NULL,NULL,1,599.00,599.00,'2026-07-26 12:12:14.772245'),('cb9144ac-a000-4025-b04f-d6fcf8a52a92','35b89e5d-f81b-4986-aa97-68a579dcb2a0','4b173e81-939a-411f-a865-014f628c11de','Blue Chanderi Floral Rayon Kaftan','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/4b173e81-939a-411f-a865-014f628c11de/1784049212328-kucmc8g8bem.png',NULL,NULL,1,999.00,999.00,'2026-08-17 10:37:55.905418'),('ee94f03e-d4c5-4f60-b480-2424cf650e77','35b89e5d-f81b-4986-aa97-68a579dcb2a0','45aea74b-e29b-4bef-91df-a86f41122f0d','blue fabric dresses','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/45aea74b-e29b-4bef-91df-a86f41122f0d/1783591140733-rnbmyh6o9n.jpg',NULL,NULL,1,599.00,599.00,'2026-08-17 10:37:55.910174');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` char(36) NOT NULL ,
  `user_id` char(36) NOT NULL,
  `status` varchar(20) DEFAULT 'pending' CHECK (`status` in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  `payment_method` text DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT 'pending' CHECK (`payment_status` in ('pending','paid','failed','refunded')),
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT 0.00,
  `shipping` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `coupon_code` text DEFAULT NULL,
  `shipping_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`shipping_address`)),
  `notes` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `fk_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('1796f26f-a09a-4077-9d49-3278268ea3de','b39165b1-25fc-4576-8d67-27763c9389ec','pending','cod','pending',1796.00,0.00,0.00,1796.00,NULL,'{\"full_name\":\"raghu\",\"phone\":\"9307176322\",\"line1\":\"n5-sbra iit kanpur\",\"line2\":\"\",\"city\":\"kanpur\",\"state\":\"uttar pradesh\",\"pincode\":\"123456\",\"country\":\"India\"}',NULL,'2026-07-26 12:12:14.757408','2026-07-26 12:12:14.757408'),('35b89e5d-f81b-4986-aa97-68a579dcb2a0','386402d9-c54b-4262-9a84-3efbc399eba4','pending','upi','pending',3495.00,0.00,0.00,3495.00,NULL,'{\"full_name\":\"16_Aditya Kumar\",\"phone\":\"7897264494\",\"line1\":\"Kalyanpur\",\"line2\":\"\",\"city\":\"Kanpur\",\"state\":\"Uttar Pradesh\",\"pincode\":\"208017\",\"country\":\"India\"}',NULL,'2026-08-17 10:37:55.891395','2026-08-17 10:37:55.891395'),('cd9f0ddb-30b6-4cf1-b2ca-e00e85b01647','386402d9-c54b-4262-9a84-3efbc399eba4','pending','cod','pending',499.00,0.00,79.00,578.00,NULL,'{\"full_name\":\"Aditya Kumar\",\"phone\":\"7897264494\",\"line1\":\"Kalyanpur\",\"line2\":\"\",\"city\":\"Kanpur\",\"state\":\"Uttar Pradesh\",\"pincode\":\"208017\",\"country\":\"India\"}',NULL,'2026-08-17 11:07:53.253967','2026-08-17 11:07:53.253967'),('e4732bf4-0b51-40ee-b18e-83f5f66149b9','386402d9-c54b-4262-9a84-3efbc399eba4','pending','debit_card','pending',1198.00,0.00,0.00,1198.00,NULL,'{\"full_name\":\"Aditya Kumar\",\"phone\":\"7897264494\",\"line1\":\"Kalyanpur\",\"line2\":\"\",\"city\":\"Kanpur\",\"state\":\"Uttar Pradesh\",\"pincode\":\"208017\",\"country\":\"India\"}',NULL,'2026-08-17 11:16:04.375325','2026-08-17 11:16:04.375325');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_token` (`user_id`,`token_hash`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES ('02510200-74da-4b44-8807-e12e7eda33e5','b39165b1-25fc-4576-8d67-27763c9389ec','e0165db0f2155505a63681d15c24ee874179d16f0bd1e5c34dc7eb22268e0eee','2026-07-29 04:37:32','2026-07-29 09:37:32'),('e1f3eaa9-5170-40a2-a359-9b6be35f9650','386402d9-c54b-4262-9a84-3efbc399eba4','34c14851927889f9a2c17b978e397be59694675679b3361d282d53b17c9b3612','2026-08-10 09:29:31','2026-08-10 14:29:31');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` char(36) NOT NULL ,
  `product_id` char(36) NOT NULL,
  `url` text NOT NULL,
  `alt_text` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `fk_images_product` (`product_id`),
  CONSTRAINT `fk_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES ('01486df0-263a-414f-af1a-31061d096060','7cfa62c0-1630-4fa8-b60c-fa3318b1717f','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/7cfa62c0-1630-4fa8-b60c-fa3318b1717f/1783792398571-hiuadcqpnif.jpg',NULL,1,0,'2026-07-11 17:53:19.810823'),('044ecd46-88f4-42d5-b85a-0ab3ffaeb8c6','5ef48090-2b47-482d-a783-0bbf5f80da7f','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCuWDTZduQ9OX-5dd_dUqrbb_xG-p8g6e_go1DLm-5BA&s=10','High-Rise Slim Jeans',0,1,'2026-07-02 11:49:49.482515'),('0aa6ff7c-4bba-4723-94a9-f921f796586c','fe69b332-f2b6-4fbb-bd71-e12ddfcd696e','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/fe69b332-f2b6-4fbb-bd71-e12ddfcd696e/1784049512650-6553akqxz47.jpg',NULL,1,0,'2026-07-14 17:18:33.655809'),('21bf8ee8-cca3-4035-8e4d-c88cf3f40401','9305d872-3567-430f-8fbb-99358084a32a','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/9305d872-3567-430f-8fbb-99358084a32a/1784049252925-v3xfbju6vje.png',NULL,0,1,'2026-07-14 17:14:15.761839'),('221591ed-c048-4aa4-8246-ace8b5b3050e','6bae3401-abd5-4793-a421-3df2d9e4187d','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/6bae3401-abd5-4793-a421-3df2d9e4187d/1784050125864-d0cxafdreb9.png',NULL,0,1,'2026-07-14 17:28:47.223784'),('30b0cb0b-7788-4069-bd76-239c9034e985','13821ea1-530b-4bf5-beb3-0ab624bf0530','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/13821ea1-530b-4bf5-beb3-0ab624bf0530/1784049340026-o1m9abx961e.png',NULL,0,1,'2026-07-28 16:36:26.267846'),('3af1f0f3-e4c8-47fd-9492-d6d71b23973d','45aea74b-e29b-4bef-91df-a86f41122f0d','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/45aea74b-e29b-4bef-91df-a86f41122f0d/1783591140733-rnbmyh6o9n.jpg',NULL,0,1,'2026-08-10 10:59:12.759512'),('3b35214f-4563-4e0f-bcb8-4626a3bbb670','e9d5cd58-60ee-44d2-babc-eccdd81ea881','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKRPICZ6t7CjnDpq2p0tTnrvapaXeP_M8HyU1k98_-qw&s=10',NULL,1,0,'2026-07-08 09:51:43.573936'),('3bfa8c2c-e2a2-4954-beb6-79e0fe114551','a7e23dfb-ed5d-44d8-9cc1-e28b634968a4','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/a7e23dfb-ed5d-44d8-9cc1-e28b634968a4/1783969984967-pryf04au4bk.jpg',NULL,0,1,'2026-08-10 11:34:07.130755'),('3c208d9a-2492-439e-94f7-366280d8f4fe','9349baf9-d061-4cd6-b9a6-00a92403e227','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/9349baf9-d061-4cd6-b9a6-00a92403e227/1784049757743-a5r53ipsj5.jpg',NULL,1,0,'2026-07-14 17:22:38.091926'),('450f11a9-8fa6-4c4e-b3f5-c07b3564f6f3','26c9ac6e-2c73-4b04-8965-90d2e3a66392','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/26c9ac6e-2c73-4b04-8965-90d2e3a66392/1784049900151-9vfwwftv50a.jpg',NULL,0,0,'2026-07-14 17:25:00.875984'),('4ab9e6de-f832-4540-8988-fbb272cf7ebb','d3351307-9329-4415-849c-8ba5ad4e3408','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/d3351307-9329-4415-849c-8ba5ad4e3408/1784049843596-k3lx67hma8.png',NULL,0,1,'2026-07-14 17:24:04.897544'),('4ba81dad-12e6-4c8f-96bc-f9dd36f9aee7','d3351307-9329-4415-849c-8ba5ad4e3408','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/d3351307-9329-4415-849c-8ba5ad4e3408/1784049845798-3lwe45x1ht3.jpg',NULL,1,0,'2026-07-14 17:24:06.135497'),('4ef7a6da-0053-461f-969e-06be4ed05d5f','84cf709f-dcff-407d-97b5-7a4d3e4d7c24','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/84cf709f-dcff-407d-97b5-7a4d3e4d7c24/1784049405069-efmy2k778p.png',NULL,0,1,'2026-08-10 10:58:44.307686'),('60e555b2-0414-488c-aad3-a98cc8ba28f5','4b173e81-939a-411f-a865-014f628c11de','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/4b173e81-939a-411f-a865-014f628c11de/1784049216800-sa0j1vp45uj.jpg',NULL,1,0,'2026-07-14 17:13:37.205431'),('6c323a50-0604-4b85-ba28-724d77d40379','84cf709f-dcff-407d-97b5-7a4d3e4d7c24','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/84cf709f-dcff-407d-97b5-7a4d3e4d7c24/1784049407593-pnogcbxwaw.jpg',NULL,1,0,'2026-08-10 10:58:44.311164'),('6f45a0c5-4d3b-4066-9423-7159bbee725c','53794d2d-38af-4580-9357-ae0c59cddabf','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/53794d2d-38af-4580-9357-ae0c59cddabf/1783792345563-ikfl3ty9h4q.png',NULL,0,1,'2026-08-09 23:11:28.948003'),('76df7d84-bd22-4b88-afa5-7f5156212886','fe69b332-f2b6-4fbb-bd71-e12ddfcd696e','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/fe69b332-f2b6-4fbb-bd71-e12ddfcd696e/1784049509370-75n293oj5zs.png',NULL,0,1,'2026-07-14 17:18:31.742857'),('7ed128d9-352b-4d7f-9605-685d2637d47e','fec0c901-82ae-4d9b-b99f-772ab69eadb3','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/fec0c901-82ae-4d9b-b99f-772ab69eadb3/1784049468577-tddterhr2q.jpg',NULL,0,0,'2026-07-14 17:17:49.002728'),('8cd235f9-234c-452c-9b71-8b6e38663d8a','4ec01050-019f-4dda-b81f-dccbf3ca36bf','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg24kEuj6W1SQoVZl1gOTnlqQvcB4iDPPFTFsffscZJQ&s=10',NULL,0,1,'2026-07-08 09:41:36.377193'),('92c247f9-c712-45e3-a89e-86dc70c188dc','e9d5cd58-60ee-44d2-babc-eccdd81ea881','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM32jE9mI8Sf1ax8X6EGzGWW6EOevuvbvrDTWxJLt_dA&s',NULL,2,0,'2026-07-08 09:51:43.573936'),('92d50ffa-77c7-42ba-a77f-77f7b8c3db83','d584599b-6989-4dfa-a9c3-f1ac196b4b0b','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/d584599b-6989-4dfa-a9c3-f1ac196b4b0b/1783591170702-u88alhlpqz.jpg',NULL,0,1,'2026-07-09 09:59:30.581072'),('a0b47536-10e9-494d-9985-4375b1c33ad6','fec0c901-82ae-4d9b-b99f-772ab69eadb3','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn4DJhNtrYHOC3JLUv4p9CyMc8ZlQnzPwKEAUS-7Nbuw&s=10','Pastel Co-ord Set',0,0,'2026-07-02 11:48:31.132174'),('aa19d6d4-899f-45fd-985d-6822344ca453','7cfa62c0-1630-4fa8-b60c-fa3318b1717f','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/7cfa62c0-1630-4fa8-b60c-fa3318b1717f/1783792396972-6am0pw2xk6.png',NULL,0,1,'2026-07-11 17:53:18.450740'),('ab5d72a5-bde0-4df5-b1b9-298b77b95b9d','b668ea74-925d-4e15-b380-17ffeb76c13e','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShOIYBmm5aZXT6CjI8diDBYyTIQ5pZeUseZvS79i_VQA&s=10',NULL,1,0,'2026-07-08 09:43:57.258027'),('ac34280f-3d20-4e6d-a84f-b8e0bd69cb75','f89f3efb-b377-41c5-9fe5-f1a18aac2cb6','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/f89f3efb-b377-41c5-9fe5-f1a18aac2cb6/1783792295930-vs6qmdkom8d.jpg',NULL,1,0,'2026-08-10 19:41:43.439151'),('ae939c28-9d47-4ca3-a220-991a29974ca5','b668ea74-925d-4e15-b380-17ffeb76c13e','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS4pKGzHmNRyjrEAcnS8jcJap15r9vHnucl4Mo1vaXMg&s=10',NULL,2,0,'2026-07-08 09:43:57.258027'),('b7c076e1-b916-40fd-b8fa-691ae22bd719','e9d5cd58-60ee-44d2-babc-eccdd81ea881','https://www.wforwoman.com/cdn/shop/files/22AUW31261G-211282_6.jpg?v=1721335494&width=1500',NULL,0,1,'2026-07-08 09:51:43.573936'),('b85c0907-db06-4357-9735-7ed75879c7ce','6bae3401-abd5-4793-a421-3df2d9e4187d','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/6bae3401-abd5-4793-a421-3df2d9e4187d/1784050128128-ctw9irakq3.jpg',NULL,1,0,'2026-07-14 17:28:48.338631'),('ba636016-4bec-4a9c-bcee-4bce89c54cd1','b668ea74-925d-4e15-b380-17ffeb76c13e','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxMlMTaY89uaMOCD1iAEUXTzjl_hxkEmFznJEdzGF92A&s=10',NULL,3,0,'2026-07-08 09:43:57.258027'),('bea3501f-7ebe-486c-9edd-a8fc07817319','26c9ac6e-2c73-4b04-8965-90d2e3a66392','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/26c9ac6e-2c73-4b04-8965-90d2e3a66392/1784049723770-8sqk0sv0fhk.png',NULL,0,1,'2026-07-14 17:22:06.662313'),('c333a557-e238-4e30-9c9b-8a1fd5c8e684','b668ea74-925d-4e15-b380-17ffeb76c13e','https://m.media-amazon.com/images/I/61XAwV1pYXL._AC_UL1500_.jpg',NULL,0,1,'2026-07-08 09:43:57.258027'),('c37cea5b-e4d0-4bdb-a30c-3ac3c2c458fe','f89f3efb-b377-41c5-9fe5-f1a18aac2cb6','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/f89f3efb-b377-41c5-9fe5-f1a18aac2cb6/1783792292926-g66nfcmia8.png',NULL,0,1,'2026-08-10 19:41:43.436421'),('c82bd65b-9d99-4bc6-94a2-ba54f0f6aa28','0231abe7-1958-4bec-bd44-28fe04d1dae7','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLCrUrkTtu92qeMR2Rjo5XodhgtEmnnmwd7YRRK2SHgg&s=10',NULL,0,1,'2026-07-08 06:28:47.427174'),('d8af4386-2980-49d6-b8f9-2d844b986847','4651bd83-48df-4e14-8be3-52807bc46d31','https://assets.myntassets.com/w_200,q_50,,dpr_3,fl_progressive,f_webp/assets/images/2025/NOVEMBER/22/QbijvVj1_43d8025aadae495ca5cae4f1a016d840.jpg',NULL,0,1,'2026-07-08 09:47:47.845327'),('d99c3dc1-eb1f-4dc0-bba4-36cbd641aa63','9305d872-3567-430f-8fbb-99358084a32a','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/9305d872-3567-430f-8fbb-99358084a32a/1784049256670-18zuabgdqxi.jpg',NULL,1,0,'2026-07-14 17:14:18.238065'),('e119f592-fdf3-4a43-9271-a01e10e3baf8','53794d2d-38af-4580-9357-ae0c59cddabf','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/53794d2d-38af-4580-9357-ae0c59cddabf/1783792347747-x0allwnkj8c.jpg',NULL,1,0,'2026-08-09 23:11:28.956813'),('e236b928-e667-429a-984e-afb9cbdbe3ac','4b173e81-939a-411f-a865-014f628c11de','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/4b173e81-939a-411f-a865-014f628c11de/1784049212328-kucmc8g8bem.png',NULL,0,1,'2026-07-14 17:13:35.891172'),('ec99554a-aab8-4ff0-82bf-9bafed491652','45aea74b-e29b-4bef-91df-a86f41122f0d','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/45aea74b-e29b-4bef-91df-a86f41122f0d/1783600904564-z1j4cn7uhn.png',NULL,1,1,'2026-08-10 10:59:12.763274'),('f0401d2a-abec-4eb3-b4b7-6230d3a677ed','13821ea1-530b-4bf5-beb3-0ab624bf0530','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/13821ea1-530b-4bf5-beb3-0ab624bf0530/1784049343543-zsl4yobavi.jpg',NULL,1,0,'2026-07-28 16:36:26.271517'),('fa46960d-2dab-45b1-a879-b69179b8429a','9349baf9-d061-4cd6-b9a6-00a92403e227','https://btqnohyudjmjubhamatx.supabase.co/storage/v1/object/public/product-images/9349baf9-d061-4cd6-b9a6-00a92403e227/1784049754350-at9ohqpswpe.png',NULL,0,1,'2026-07-14 17:22:36.782566');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` char(36) NOT NULL ,
  `product_id` char(36) NOT NULL,
  `size` text DEFAULT NULL,
  `color` text DEFAULT NULL,
  `color_hex` text DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `fk_variants_product` (`product_id`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES ('0cc63d90-fb62-4dfb-910f-1fdeb8fd84da','53794d2d-38af-4580-9357-ae0c59cddabf','L',NULL,NULL,1,'2026-08-09 23:11:28.964818'),('0ef3ddd2-8287-4b41-9746-89397d18a088','fe69b332-f2b6-4fbb-bd71-e12ddfcd696e','M','Multicolor','#FF6B6B',18,'2026-07-02 11:36:24.009741'),('116d3091-4d3d-4bc4-8036-9122b8957a96','d584599b-6989-4dfa-a9c3-f1ac196b4b0b','M','Black','#000000',35,'2026-07-03 05:32:59.820552'),('11a801c8-781b-46a7-9b12-6dcf0bccad1b','4651bd83-48df-4e14-8be3-52807bc46d31','L',NULL,NULL,0,'2026-07-08 09:47:48.048066'),('201c7768-ed2c-460d-8930-3456517aa9c8','9349baf9-d061-4cd6-b9a6-00a92403e227','L','White','#FFFFFF',45,'2026-07-02 11:50:57.707208'),('249d4b10-4cce-4aee-867b-871bb6d0b541','9349baf9-d061-4cd6-b9a6-00a92403e227','XXL','White','#FFFFFF',20,'2026-07-02 11:50:57.707208'),('2a13240f-28f1-4c09-b07e-7d482d940cce','4ec01050-019f-4dda-b81f-dccbf3ca36bf','S',NULL,NULL,0,'2026-07-08 09:41:36.619790'),('2c57f164-bad7-4f25-85af-ff39f28d09a8','26c9ac6e-2c73-4b04-8965-90d2e3a66392','M','White','#FFFFFF',25,'2026-07-02 11:34:46.349079'),('2fbf3622-b1f2-473b-8310-4274ed3f8e48','6bae3401-abd5-4793-a421-3df2d9e4187d','XL','Rust','#C46E3A',8,'2026-07-02 11:46:08.234126'),('31f89701-973e-42a7-82c8-b143d926ca90','26c9ac6e-2c73-4b04-8965-90d2e3a66392','L','White','#FFFFFF',20,'2026-07-02 11:34:46.349079'),('331180e3-ef03-4ace-81be-7f427d1e7f7e','45aea74b-e29b-4bef-91df-a86f41122f0d','',NULL,NULL,6,'2026-08-10 10:59:12.768826'),('358bc554-4334-4c8a-88a3-de732ff749ce','d3351307-9329-4415-849c-8ba5ad4e3408','XL','Navy','#1B2A4A',12,'2026-07-02 11:37:36.394531'),('3ab9a59b-20c3-4d38-820d-a29fff8222db','26c9ac6e-2c73-4b04-8965-90d2e3a66392','XS','White','#FFFFFF',15,'2026-07-02 11:34:46.349079'),('3e1c67b7-4411-4dad-844d-5558162e1357','84cf709f-dcff-407d-97b5-7a4d3e4d7c24','S','aqua',NULL,1,'2026-08-10 10:58:44.317891'),('444aeb05-8816-4480-9d25-38234205c5ab','6bae3401-abd5-4793-a421-3df2d9e4187d','L','Rust','#C46E3A',17,'2026-07-02 11:46:08.234126'),('4b6d662a-0cef-4c96-bd45-d063a79dc204','fe69b332-f2b6-4fbb-bd71-e12ddfcd696e','XL','Multicolor','#FF6B6B',10,'2026-07-02 11:36:24.009741'),('4c922712-d87c-458d-aaf6-08cd4c2791cd','7cfa62c0-1630-4fa8-b60c-fa3318b1717f','S',NULL,NULL,0,'2026-07-08 12:33:57.490247'),('504b45bc-b362-46b8-8a7b-3fd5b0f7b67e','6bae3401-abd5-4793-a421-3df2d9e4187d','S','Rust','#C46E3A',10,'2026-07-02 11:46:08.234126'),('50b5c492-bb2d-47b7-847a-d9b04d408d83','9349baf9-d061-4cd6-b9a6-00a92403e227','S','Black','#000000',40,'2026-07-02 11:50:57.707208'),('53c46450-7254-48bc-8a8d-65fefb983d2d','9305d872-3567-430f-8fbb-99358084a32a','L',NULL,NULL,0,'2026-07-08 10:32:44.678346'),('541d0b35-d89b-457a-8984-b38c43692e86','0231abe7-1958-4bec-bd44-28fe04d1dae7','S',NULL,NULL,0,'2026-07-08 06:28:47.669088'),('5ca70540-8dfb-4097-99f9-e091490ef0f9','d3351307-9329-4415-849c-8ba5ad4e3408','S','Navy','#1B2A4A',15,'2026-07-02 11:37:36.394531'),('63d2dea4-6310-480e-ac38-8eb05a2274ef','e9d5cd58-60ee-44d2-babc-eccdd81ea881','XXL',NULL,NULL,0,'2026-07-08 09:51:43.785612'),('67e64579-0957-4c79-a171-9201a8612a78','9349baf9-d061-4cd6-b9a6-00a92403e227','XL','White','#FFFFFF',30,'2026-07-02 11:50:57.707208'),('71227027-244d-4db2-b43d-09b2fb28f853','d584599b-6989-4dfa-a9c3-f1ac196b4b0b','XL','Black','#000000',8,'2026-07-03 05:32:59.820552'),('75018357-3afe-4284-96a2-219d5a6b2331','9349baf9-d061-4cd6-b9a6-00a92403e227','M','Black','#000000',55,'2026-07-02 11:50:57.707208'),('79988a6c-19ac-4330-bb4d-844ca5beb9c9','fec0c901-82ae-4d9b-b99f-772ab69eadb3','L','Lavender','#E6CFFF',15,'2026-07-02 11:48:31.347193'),('7cda6bdd-bb32-46ad-ac6e-337acabae453','d584599b-6989-4dfa-a9c3-f1ac196b4b0b','XS','Black','#000000',12,'2026-07-03 05:32:59.820552'),('82c4abab-9af0-481c-86a0-24f553b38457','5ef48090-2b47-482d-a783-0bbf5f80da7f','32','Blue','#5B8FBE',18,'2026-07-02 11:49:49.712588'),('849cb2f6-8b93-4dc6-a51c-7330d48dd501','26c9ac6e-2c73-4b04-8965-90d2e3a66392','XL','White','#FFFFFF',10,'2026-07-02 11:34:46.349079'),('84d1a52f-95ca-41ef-bab6-1f69c8e8b6ea','d3351307-9329-4415-849c-8ba5ad4e3408','M','Navy','#1B2A4A',25,'2026-07-02 11:37:36.394531'),('8a2f51e4-2f2c-4226-95f5-68d7bb334a38','d584599b-6989-4dfa-a9c3-f1ac196b4b0b','S','Black','#000000',28,'2026-07-03 05:32:59.820552'),('8e5c3d20-89db-4dd7-bb31-b3f2bbbad9c0','d3351307-9329-4415-849c-8ba5ad4e3408','L','Navy','#1B2A4A',20,'2026-07-02 11:37:36.394531'),('918d788d-f572-4f10-beb3-c0defc67c680','fec0c901-82ae-4d9b-b99f-772ab69eadb3','S','Lavender','#E6CFFF',10,'2026-07-02 11:48:31.347193'),('92724266-ac10-4317-ad3d-32703f653e76','4b173e81-939a-411f-a865-014f628c11de','L',NULL,NULL,0,'2026-07-08 12:32:34.825748'),('99f4129f-30bf-4dac-a2bf-006939b6b279','b668ea74-925d-4e15-b380-17ffeb76c13e','S',NULL,NULL,0,'2026-07-08 09:43:57.468280'),('9cde3759-a996-4890-86da-754ff8566027','f89f3efb-b377-41c5-9fe5-f1a18aac2cb6','',NULL,NULL,1,'2026-08-10 19:41:43.443762'),('a2ab7318-fc4d-495f-afa8-56a6a19d8896','6bae3401-abd5-4793-a421-3df2d9e4187d','M','Rust','#C46E3A',22,'2026-07-02 11:46:08.234126'),('b59c5fdf-b7c8-41ab-b1e5-6bae89db8bba','fec0c901-82ae-4d9b-b99f-772ab69eadb3','M','Lavender','#E6CFFF',20,'2026-07-02 11:48:31.347193'),('baf7bed4-dab0-4de7-a158-2c7054e61d83','13821ea1-530b-4bf5-beb3-0ab624bf0530','M',NULL,NULL,0,'2026-07-08 10:31:04.226788'),('c7eb7d5c-1ef6-4587-97b4-7a0e8ed9ad2b','5ef48090-2b47-482d-a783-0bbf5f80da7f','30','Blue','#5B8FBE',20,'2026-07-02 11:49:49.712588'),('cedd4a50-331a-47bb-b8a5-14cf4dd6cd82','5ef48090-2b47-482d-a783-0bbf5f80da7f','28','Blue','#5B8FBE',15,'2026-07-02 11:49:49.712588'),('d00389f7-2162-44c5-94c0-4fce29445006','26c9ac6e-2c73-4b04-8965-90d2e3a66392','S','White','#FFFFFF',30,'2026-07-02 11:34:46.349079'),('d0f15a19-1db0-4938-ab8a-ed2b9159ae37','a7e23dfb-ed5d-44d8-9cc1-e28b634968a4','s,m,l','black','#F4C456',12,'2026-08-10 11:34:07.139152'),('d15cbd35-45a9-4043-8759-85abfd32eb49','5ef48090-2b47-482d-a783-0bbf5f80da7f','26','Blue','#5B8FBE',8,'2026-07-02 11:49:49.712588'),('d3db200d-61a1-486f-a13c-850a5be75abf','5ef48090-2b47-482d-a783-0bbf5f80da7f','34','Blue','#5B8FBE',12,'2026-07-02 11:49:49.712588'),('ddb6f70d-5990-439f-a1f6-0ebcdd4fa81b','fe69b332-f2b6-4fbb-bd71-e12ddfcd696e','L','Multicolor','#FF6B6B',15,'2026-07-02 11:36:24.009741'),('e35c7e17-3f3d-44ce-8364-bda76b71036c','9349baf9-d061-4cd6-b9a6-00a92403e227','L','Black','#000000',38,'2026-07-02 11:50:57.707208'),('f17b204d-b351-4096-8751-3cbb9c957bba','fe69b332-f2b6-4fbb-bd71-e12ddfcd696e','S','Multicolor','#FF6B6B',12,'2026-07-02 11:36:24.009741'),('f42dc461-5c48-4704-8672-7c649ba9d5d1','9349baf9-d061-4cd6-b9a6-00a92403e227','M','White','#FFFFFF',60,'2026-07-02 11:50:57.707208'),('f5071938-1315-4426-853d-9e81a1b6c716','9349baf9-d061-4cd6-b9a6-00a92403e227','XL','Black','#000000',25,'2026-07-02 11:50:57.707208'),('f51465c9-66dc-47b8-b544-90f2a07918a7','d584599b-6989-4dfa-a9c3-f1ac196b4b0b','L','Black','#000000',18,'2026-07-03 05:32:59.820552'),('fa27a63b-25b1-4e72-bd16-50d73e9bd6d1','9349baf9-d061-4cd6-b9a6-00a92403e227','S','White','#FFFFFF',50,'2026-07-02 11:50:57.707208');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` char(36) NOT NULL ,
  `category_id` char(36) DEFAULT NULL,
  `name` text NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `compare_price` decimal(10,2) DEFAULT NULL,
  `sku` text DEFAULT NULL,
  `brand` text DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `is_featured` tinyint(1) DEFAULT 0,
  `is_new_arrival` tinyint(1) DEFAULT 0,
  `is_best_seller` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `rating` decimal(3,2) DEFAULT 0.00,
  `review_count` int(11) DEFAULT 0,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6),
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('0231abe7-1958-4bec-bd44-28fe04d1dae7','c5d0418f-da55-4a0e-ac0e-ebb81c2a491f','Winter Hoodies','winter-hoodies',NULL,599.00,799.00,'13','Surema','[\"Winter\"]',1,1,0,1,0.00,0,'2026-07-08 06:28:47.171409','2026-07-08 06:28:47.767000',NULL),('13821ea1-530b-4bf5-beb3-0ab624bf0530','5540b035-3459-4d3b-ac86-937f6b3f1674','Cotton Kurtis','cotton-kurtis',NULL,699.00,899.00,'14','Surema','[]',0,1,1,1,0.00,0,'2026-07-08 10:31:03.783840','2026-07-08 10:31:04.095000',NULL),('26c9ac6e-2c73-4b04-8965-90d2e3a66392','27504774-1835-4bd1-9b69-bb7726cacc55','Floral Puff Sleeve Top','floral-puff-sleeve-top','Beautiful floral puff sleeve top perfect for casual outings.',899.00,1299.00,NULL,'Surema','[\"floral\",\"western\",\"casual\"]',1,1,0,1,4.50,128,'2026-07-02 05:37:29.458799','2026-07-02 11:34:46.383000',NULL),('45aea74b-e29b-4bef-91df-a86f41122f0d','01aa65c7-aba8-422c-8891-82a92ee6fbd2','blue fabric dresses','blue-fabric-dresses',NULL,599.00,698.00,'16','Surema','[\"summer\"]',0,1,1,1,0.00,0,'2026-07-09 07:24:37.325632','2026-07-09 07:24:37.325632',NULL),('4651bd83-48df-4e14-8be3-52807bc46d31','27504774-1835-4bd1-9b69-bb7726cacc55','Shop Trendy Western Tops','shop-trendy-western-tops',NULL,499.00,599.00,'10','Surema',NULL,0,0,0,1,0.00,0,'2026-07-08 09:47:47.625295','2026-07-08 09:47:48.241000',NULL),('4b173e81-939a-411f-a865-014f628c11de','01aa65c7-aba8-422c-8891-82a92ee6fbd2','Blue Chanderi Floral Rayon Kaftan','blue-chanderi-floral-rayon-kaftan',NULL,999.00,1299.00,'7','Surema','[\"summer\"]',0,1,1,1,0.00,0,'2026-07-08 12:32:34.273286','2026-07-08 12:32:34.751000',NULL),('4ec01050-019f-4dda-b81f-dccbf3ca36bf','c5d0418f-da55-4a0e-ac0e-ebb81c2a491f','Full Sleeve Purple Girls Crop Hoodies','full-sleeve-purple-girls-crop-hoodies',NULL,399.00,599.00,'5','Surema','[\"Winter\"]',0,1,0,1,0.00,0,'2026-07-08 09:41:36.120834','2026-07-08 09:41:36.691000',NULL),('53794d2d-38af-4580-9357-ae0c59cddabf','01aa65c7-aba8-422c-8891-82a92ee6fbd2','Black Printed Ankle Length Formal','black-printed-ankle-length-formal',NULL,899.00,1299.00,'11','Surema','[\"Summer\",\"winter\"]',0,1,1,1,0.00,0,'2026-07-08 12:55:04.563347','2026-07-09 06:37:55.383000',NULL),('5ef48090-2b47-482d-a783-0bbf5f80da7f','ed433ee4-f027-41cb-adb3-89a667c70291','High-Rise Slim Jeans','high-rise-slim-jeans','Flattering high-rise slim fit jeans in premium denim.',1499.00,2199.00,NULL,'Surema','[\"jeans\",\"slim\",\"denim\"]',1,0,1,1,4.40,203,'2026-07-02 05:37:29.458799','2026-07-02 11:49:49.684000',NULL),('6bae3401-abd5-4793-a421-3df2d9e4187d','01aa65c7-aba8-422c-8891-82a92ee6fbd2','Wrap Midi Dress','wrap-midi-dress','Flattering wrap midi dress perfect for all occasions.',1599.00,2299.00,NULL,'Surema','[\"dress\",\"midi\",\"wrap\"]',1,1,0,1,4.90,178,'2026-07-02 05:37:29.458799','2026-07-02 11:46:07.635000',NULL),('7cfa62c0-1630-4fa8-b60c-fa3318b1717f','01aa65c7-aba8-422c-8891-82a92ee6fbd2','Kurti - Black Chanderi Floral Style','kurti-black-chanderi-floral-style',NULL,799.00,999.00,NULL,'Surema','[\"summer\"]',0,1,1,1,0.00,0,'2026-07-08 12:33:57.024220','2026-07-08 12:33:57.540000',NULL),('84cf709f-dcff-407d-97b5-7a4d3e4d7c24','27504774-1835-4bd1-9b69-bb7726cacc55','Simple Black Color Western Top','simple-black-color-western-top',NULL,699.00,899.00,'12','Surema global fashion','[]',0,1,1,1,0.00,0,'2026-07-08 09:48:34.856238','2026-07-08 09:48:35.419000',NULL),('9305d872-3567-430f-8fbb-99358084a32a','5540b035-3459-4d3b-ac86-937f6b3f1674','All Season Cotton Kurtis','all-season-cotton-kurtis',NULL,699.00,799.00,'11','Surema','[\"Summer\"]',0,1,0,1,0.00,0,'2026-07-08 10:32:44.230950','2026-07-08 10:32:44.790000',NULL),('9349baf9-d061-4cd6-b9a6-00a92403e227','73440505-c23f-440a-9d86-c2520eec2642','Essential Cotton T-Shirt','essential-cotton-tshirt','Super soft 100% cotton t-shirt in classic cut.',399.00,599.00,NULL,'Surema','[\"cotton\",\"basic\",\"casual\"]',0,0,1,1,4.60,412,'2026-07-02 05:37:29.458799','2026-07-02 11:50:57.501000',NULL),('a7e23dfb-ed5d-44d8-9cc1-e28b634968a4','c5d0418f-da55-4a0e-ac0e-ebb81c2a491f','Hoodies For Women','hoodies-for-women',NULL,499.00,699.00,'17','Surema','[\"Winter\"]',1,1,0,1,0.00,0,'2026-07-13 19:13:04.175341','2026-07-13 19:13:04.175341','[]'),('b668ea74-925d-4e15-b380-17ffeb76c13e','c5d0418f-da55-4a0e-ac0e-ebb81c2a491f','GIANTHONG Hoodies for Teen','gianthong-hoodies-for-teen',NULL,499.00,599.00,'8','Surema','[]',0,1,1,1,0.00,0,'2026-07-08 09:43:57.025965','2026-07-08 09:43:57.629000',NULL),('d3351307-9329-4415-849c-8ba5ad4e3408','27504774-1835-4bd1-9b69-bb7726cacc55','Striped Button-Down Shirt','striped-button-down-shirt','Classic striped button-down shirt with relaxed fit.',799.00,1199.00,NULL,'Surema','[\"shirt\",\"stripes\",\"casual\"]',0,1,0,1,4.20,94,'2026-07-02 05:37:29.458799','2026-07-02 11:37:36.431000',NULL),('d584599b-6989-4dfa-a9c3-f1ac196b4b0b','babcafde-5174-4072-9c55-d4a08c115ee1','Tie-Front Crop Top','tie-front-crop-top','Stylish tie-front crop top for a trendy summer look.',649.00,999.00,NULL,'Surema','[\"crop\",\"summer\",\"trendy\"]',1,1,1,1,4.80,256,'2026-07-02 05:37:29.458799','2026-07-03 05:32:58.687000',NULL),('e9d5cd58-60ee-44d2-babc-eccdd81ea881','27504774-1835-4bd1-9b69-bb7726cacc55','Buy Biege Plus Size Western Top','buy-biege-plus-size-western-top',NULL,799.00,997.00,'15','Surema','[\"Summer\"]',0,1,1,1,0.00,0,'2026-07-08 09:51:43.360924','2026-07-08 09:51:43.969000',NULL),('f89f3efb-b377-41c5-9fe5-f1a18aac2cb6','27504774-1835-4bd1-9b69-bb7726cacc55','new black tops','new-black-tops',NULL,399.00,499.00,'20','Surema','[\"summer\"]',0,1,1,1,0.00,0,'2026-07-09 12:18:22.977259','2026-07-11 19:06:29.018000','[]'),('fe69b332-f2b6-4fbb-bd71-e12ddfcd696e','5540b035-3459-4d3b-ac86-937f6b3f1674','Block Print Anarkali Kurti','block-print-anarkali-kurti','Elegant block print anarkali kurti with beautiful flare.',1199.00,1699.00,NULL,'Surema','[\"kurti\",\"anarkali\",\"ethnic\"]',0,1,0,1,4.30,67,'2026-07-02 05:37:29.458799','2026-07-02 11:36:24.069000',NULL),('fec0c901-82ae-4d9b-b99f-772ab69eadb3','656c0351-70bc-4910-9af6-099bb7b671d0','Pastel Co-ord Set','pastel-co-ord-set','Matching pastel co-ord set for effortless everyday style.',1799.00,2499.00,NULL,'Surema','[\"co-ord\",\"pastel\",\"matching\"]',1,0,1,1,4.70,89,'2026-07-02 05:37:29.458799','2026-07-02 11:48:31.401000',NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` char(36) NOT NULL,
  `full_name` text DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6),
  `role` varchar(50) DEFAULT 'user',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_profiles_user` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` char(36) NOT NULL ,
  `product_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `user_name` text DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `title` text DEFAULT NULL,
  `body` text DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `fk_reviews_product` (`product_id`),
  KEY `fk_reviews_user` (`user_id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES ('0c376f1c-8d2f-4c4e-8d7e-97901c5f6880','45aea74b-e29b-4bef-91df-a86f41122f0d','386402d9-c54b-4262-9a84-3efbc399eba4','Aditya kumar',5,'asdfghjkl',NULL,1,'2026-07-25 12:33:49.182603'),('620b9d33-4d78-422e-9348-b6f79fd8a323','4ec01050-019f-4dda-b81f-dccbf3ca36bf','386402d9-c54b-4262-9a84-3efbc399eba4','Aditya kumar',5,'ASDFGHJM','qawedrghjkl',1,'2026-07-25 12:33:03.489438');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL ,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role` varchar(50) DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `is_email_verified` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('386402d9-c54b-4262-9a84-3efbc399eba4','adityakumar16iitk@gmail.com','$2a$10$99nhtjHyAWf9s6EQuIv7C.wXFi/PurgZy5Ir.XWxz0EGEYU323h/.','2026-07-24 17:15:08.498901','Aditya kumar',NULL,NULL,1,'2026-07-24 11:46:45','super_admin',1,0),('47deeb3e-5ab4-40a6-b74c-98a8d8e22b77','testuser_1191105049@example.com','$2a$10$YNp445SwgvcXLyM7KqFsMOhjLm7Gz9ccPAztCMgoDHV4YGRNimHfK','2026-07-24 16:10:43.718533','Test User',NULL,NULL,0,'2026-08-17 05:47:12','user',0,0),('4f079a69-dd94-492b-8674-d5219be85afe','pankaj123@gmail.com','$2a$10$Bl378fOKZuQrpVvbPOEAGO4MTz5kZYZlW0UTKd65th/KHuM2xMDca','2026-07-25 12:29:57.521254','pankaj',NULL,NULL,0,'2026-08-17 05:46:58','user',0,0),('5a949984-61be-4d46-8d5a-d57c744d5a4e','2024aspire110@gmail.com','$2a$10$fq4buK9up31z6VIqYp9/.uQz/QC3lrpdxd0Wl7.U1rCkxOoZmUpUG','2026-08-11 10:43:09.861923','adi',NULL,NULL,1,'2026-08-17 06:48:38','admin',1,0),('917c53a6-3874-4935-8f31-e79de2bfedbc','testuser_1804509779@example.com','$2a$10$PLn.PokmZrZ3fafO0Qk09uK7umsEORonVdrEymXucJIrJV3bQ2/mi','2026-07-24 16:27:18.875296','Test User',NULL,NULL,0,'2026-08-17 06:17:31','user',0,0),('adde5063-6e08-4554-8208-06b2a7ab90df','testuser@example.com','$2a$10$kji.17juMBwyomlkjOECl.ZGRj3Io9ISdFk2WBu8tKLkOdag9tjye','2026-07-24 16:09:55.234002','Test User',NULL,NULL,0,'2026-08-17 05:47:13','user',0,0),('b39165b1-25fc-4576-8d67-27763c9389ec','test123@gmail.com','$2a$10$qtS4N2ip419wOfCx0q4oN.itpfOyJRzyT4KgBY32DJWFnYiWCuSi6','2026-07-24 16:40:59.218182','Aditya Kumar',NULL,NULL,0,'2026-08-17 06:17:25','admin',1,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist_items`
--

DROP TABLE IF EXISTS `wishlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist_items` (
  `id` char(36) NOT NULL ,
  `user_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `fk_wishlist_user` (`user_id`),
  KEY `fk_wishlist_product` (`product_id`),
  CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist_items`
--

LOCK TABLES `wishlist_items` WRITE;
/*!40000 ALTER TABLE `wishlist_items` DISABLE KEYS */;
INSERT INTO `wishlist_items` VALUES ('0b25d5ac-9661-4127-97ba-60e12c994590','b39165b1-25fc-4576-8d67-27763c9389ec','fec0c901-82ae-4d9b-b99f-772ab69eadb3','2026-07-26 12:18:30.193898'),('973273fc-f1a8-47a7-ab9c-6cdad9d1959a','b39165b1-25fc-4576-8d67-27763c9389ec','a7e23dfb-ed5d-44d8-9cc1-e28b634968a4','2026-07-26 22:43:44.364615');
/*!40000 ALTER TABLE `wishlist_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-22 11:47:32