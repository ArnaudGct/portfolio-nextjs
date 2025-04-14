-- CreateTable
CREATE TABLE `avis` (
    `id_avis` INTEGER NOT NULL AUTO_INCREMENT,
    `commentaire` VARCHAR(500) NOT NULL,
    `client` VARCHAR(50) NOT NULL,
    `plateforme` VARCHAR(50) NOT NULL,
    `date` VARCHAR(50) NULL,
    `afficher` BOOLEAN NOT NULL,

    PRIMARY KEY (`id_avis`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id_cat` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(50) NOT NULL,
    `afficher` BOOLEAN NOT NULL,

    PRIMARY KEY (`id_cat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creations` (
    `id_crea` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(100) NOT NULL,
    `description` VARCHAR(3500) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `lien` VARCHAR(500) NOT NULL,
    `date` VARCHAR(50) NOT NULL,
    `media_webm` VARCHAR(100) NOT NULL,
    `media_mp4` VARCHAR(100) NOT NULL,
    `duree` VARCHAR(25) NOT NULL,
    `afficher_competences` VARCHAR(50) NOT NULL,
    `afficher` BOOLEAN NOT NULL,
    `derniere_modification` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id_crea`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `experiences` (
    `id_exp` INTEGER NOT NULL AUTO_INCREMENT,
    `date_debut` VARCHAR(50) NOT NULL,
    `date_fin` VARCHAR(10) NOT NULL,
    `titre` VARCHAR(150) NOT NULL,
    `description` VARCHAR(10000) NOT NULL,
    `url_img` VARCHAR(250) NOT NULL,
    `position_img` VARCHAR(50) NOT NULL,
    `position` VARCHAR(10) NOT NULL,
    `categorie` VARCHAR(25) NOT NULL,
    `img_logo` VARCHAR(250) NOT NULL,
    `nom_entreprise` VARCHAR(50) NOT NULL,
    `url_entreprise` VARCHAR(1000) NOT NULL,
    `type_emploi` VARCHAR(50) NOT NULL,
    `poste_actuel` INTEGER NOT NULL,
    `afficher` INTEGER NOT NULL,

    PRIMARY KEY (`id_exp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq` (
    `id_faq` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(250) NOT NULL,
    `reponse` VARCHAR(1000) NOT NULL,
    `afficher` BOOLEAN NOT NULL,

    PRIMARY KEY (`id_faq`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `photos_experiences` (
    `id_photo` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(100) NOT NULL,
    `url` VARCHAR(1000) NOT NULL,
    `date` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_photo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags_creations` (
    `id_tag` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(50) NOT NULL,
    `afficher_competences` BOOLEAN NOT NULL,

    PRIMARY KEY (`id_tag`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilisateurs` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `img` VARCHAR(250) NOT NULL,
    `email` VARCHAR(50) NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(50) NOT NULL,
    `role` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
