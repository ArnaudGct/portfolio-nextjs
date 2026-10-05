-- CreateTable
CREATE TABLE `trustpilot_reviews` (
    `id` VARCHAR(64) NOT NULL,
    `client` VARCHAR(100) NOT NULL,
    `contenu` TEXT NOT NULL,
    `rating` INTEGER NOT NULL,
    `date_publication` DATETIME(3) NOT NULL,
    `review_url` VARCHAR(500) NOT NULL,
    `afficher` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `last_seen_at` DATETIME(3) NOT NULL,

    INDEX `trustpilot_reviews_date_publication_idx`(`date_publication`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
