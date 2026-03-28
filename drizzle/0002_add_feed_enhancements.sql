CREATE TABLE `postReactions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `userId` int NOT NULL,
  `emoji` varchar(10) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `postReactions_id` PRIMARY KEY(`id`)
);

CREATE TABLE `postHashtags` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `hashtag` varchar(100) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `postHashtags_id` PRIMARY KEY(`id`)
);

CREATE TABLE `postCategories` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `category` varchar(50) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `postCategories_id` PRIMARY KEY(`id`)
);

CREATE TABLE `postAnalytics` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `viewCount` int NOT NULL DEFAULT 0,
  `shareCount` int NOT NULL DEFAULT 0,
  `engagementScore` decimal(10,2) NOT NULL DEFAULT '0',
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `postAnalytics_id` PRIMARY KEY(`id`)
);

CREATE TABLE `commentReplies` (
  `id` int AUTO_INCREMENT NOT NULL,
  `commentId` int NOT NULL,
  `userId` int NOT NULL,
  `content` longtext NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `commentReplies_id` PRIMARY KEY(`id`)
);
