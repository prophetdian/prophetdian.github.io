CREATE TABLE `postLikes` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `postLikes_id` PRIMARY KEY(`id`),
  CONSTRAINT `postLikes_unique` UNIQUE(`postId`, `userId`)
);

CREATE TABLE `postComments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `userId` int NOT NULL,
  `content` longtext NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `postComments_id` PRIMARY KEY(`id`)
);
