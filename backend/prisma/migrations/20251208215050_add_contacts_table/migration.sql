/*
  Warnings:

  - You are about to drop the `commande` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `commandeproduit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `paiement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `produit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `utilisateur` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `commande`;

-- DropTable
DROP TABLE `commandeproduit`;

-- DropTable
DROP TABLE `paiement`;

-- DropTable
DROP TABLE `produit`;

-- DropTable
DROP TABLE `reservation`;

-- DropTable
DROP TABLE `utilisateur`;

-- CreateTable
CREATE TABLE `utilisateurs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(20) NULL,
    `adresse` VARCHAR(191) NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'CLIENT') NOT NULL DEFAULT 'CLIENT',
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,

    UNIQUE INDEX `utilisateurs_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `ordre` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `prix` DOUBLE NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `disponible` BOOLEAN NOT NULL DEFAULT true,
    `stock` INTEGER NULL,
    `poids` DOUBLE NULL,
    `unite` VARCHAR(191) NULL DEFAULT 'kg',
    `categorieId` INTEGER NOT NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,

    INDEX `produits_categorieId_fkey`(`categorieId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commandes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(191) NOT NULL,
    `utilisateurId` INTEGER NOT NULL,
    `dateCommande` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statut` ENUM('EN_COURS', 'CONFIRMEE', 'PREPAREE', 'LIVREE', 'ANNULEE') NOT NULL DEFAULT 'EN_COURS',
    `total` DOUBLE NOT NULL DEFAULT 0,
    `notes` VARCHAR(191) NULL,

    UNIQUE INDEX `commandes_numero_key`(`numero`),
    INDEX `commandes_utilisateurId_fkey`(`utilisateurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commande_produits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `commandeId` INTEGER NOT NULL,
    `produitId` INTEGER NOT NULL,
    `quantite` INTEGER NOT NULL DEFAULT 1,
    `prixUnitaire` DOUBLE NOT NULL,

    INDEX `commande_produits_commandeId_fkey`(`commandeId`),
    INDEX `commande_produits_produitId_fkey`(`produitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(191) NOT NULL,
    `utilisateurId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `heure` VARCHAR(191) NOT NULL,
    `nbPersonnes` INTEGER NOT NULL,
    `salle` VARCHAR(191) NULL,
    `telephone` VARCHAR(20) NULL,
    `commentaires` VARCHAR(191) NULL,
    `statut` ENUM('EN_ATTENTE', 'CONFIRMEE', 'ANNULEE') NOT NULL DEFAULT 'EN_ATTENTE',
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reservations_numero_key`(`numero`),
    INDEX `reservations_utilisateurId_fkey`(`utilisateurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paiements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(191) NOT NULL,
    `commandeId` INTEGER NULL,
    `montant` DOUBLE NOT NULL,
    `modePaiement` ENUM('CARTE', 'MOBILE_MONEY', 'PAYDUNYA', 'FUSION_MONEY', 'ESPECES') NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'REUSSI', 'ECHEC', 'REMBOURSE') NOT NULL DEFAULT 'EN_ATTENTE',
    `referenceExterne` VARCHAR(191) NULL,
    `donneesCallback` TEXT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `datePaiement` DATETIME(3) NULL,

    UNIQUE INDEX `paiements_numero_key`(`numero`),
    INDEX `paiements_commandeId_fkey`(`commandeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actualites` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `contenu` TEXT NOT NULL,
    `extrait` VARCHAR(500) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `categorie` VARCHAR(191) NOT NULL DEFAULT 'Actualités',
    `auteur` VARCHAR(191) NOT NULL DEFAULT 'Administration — La Boucherie Fine',
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `datePublication` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,
    `vues` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `actualites_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(20) NULL,
    `sujet` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `statut` ENUM('NON_LU', 'LU', 'EN_TRAITEMENT', 'TRAITE') NOT NULL DEFAULT 'NON_LU',
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,
    `reponse` TEXT NULL,
    `dateReponse` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `lu` BOOLEAN NOT NULL DEFAULT false,
    `donnees` TEXT NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `produits` ADD CONSTRAINT `produits_categorieId_fkey` FOREIGN KEY (`categorieId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commandes` ADD CONSTRAINT `commandes_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commande_produits` ADD CONSTRAINT `commande_produits_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `commandes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commande_produits` ADD CONSTRAINT `commande_produits_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `produits`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiements` ADD CONSTRAINT `paiements_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `commandes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
