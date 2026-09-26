-- CyberGuard Bénin — schéma de base de données (conception initiale)
-- Correspond aux classes : Utilisateur/Administrateur, Analyse, Controle, ParametreScore
--
-- NOTE : la source de vérité est désormais les migrations Laravel
-- (backend/database/migrations/). Ce fichier reste comme document de
-- conception ; les migrations ajoutent quelques colonnes techniques
-- (email_verified_at, remember_token, created_at/updated_at).
--
-- NOTE : le backend utilise encore les noms historiques "resultats_verification"
-- (table + modèle ResultatVerification) et "poids_headers". Ce document de
-- conception les a renommés en "controles" et "poids_en_tetes" ; l'alignement
-- du code viendra dans un second temps.

CREATE DATABASE IF NOT EXISTS cyberguard_benin
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cyberguard_benin;

CREATE TABLE utilisateurs (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom               VARCHAR(150) NOT NULL,
  email             VARCHAR(190) NOT NULL UNIQUE,
  mot_de_passe      VARCHAR(255) NOT NULL,
  role              ENUM('utilisateur', 'administrateur') NOT NULL DEFAULT 'utilisateur',
  statut            ENUM('actif', 'desactive') NOT NULL DEFAULT 'actif',
  date_inscription  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE analyses (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id      BIGINT UNSIGNED NOT NULL,
  url                 VARCHAR(255) NOT NULL,
  date_analyse        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  score               TINYINT UNSIGNED NULL,
  niveau_risque       ENUM('bon', 'moyen', 'faible') NULL,
  statut              ENUM('en_cours', 'terminee', 'echec') NOT NULL DEFAULT 'en_cours',
  chemin_rapport_pdf  VARCHAR(255) NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_analyses_utilisateur FOREIGN KEY (utilisateur_id)
    REFERENCES utilisateurs(id) ON DELETE CASCADE,
  INDEX idx_analyses_utilisateur (utilisateur_id)
) ENGINE=InnoDB;

CREATE TABLE controles (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  analyse_id      BIGINT UNSIGNED NOT NULL,
  type            VARCHAR(50) NOT NULL,
  statut          ENUM('conforme', 'non_conforme') NOT NULL,
  description     TEXT NOT NULL,
  recommandation  TEXT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_controles_analyse FOREIGN KEY (analyse_id)
    REFERENCES analyses(id) ON DELETE CASCADE,
  INDEX idx_controles_analyse (analyse_id)
) ENGINE=InnoDB;

CREATE TABLE parametres_score (
  id                     TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  poids_https            TINYINT UNSIGNED NOT NULL DEFAULT 20,
  poids_certificat_ssl   TINYINT UNSIGNED NOT NULL DEFAULT 15,
  poids_en_tetes         TINYINT UNSIGNED NOT NULL DEFAULT 25,
  poids_cookies          TINYINT UNSIGNED NOT NULL DEFAULT 10,
  poids_vulnerabilites   TINYINT UNSIGNED NOT NULL DEFAULT 15,
  poids_fichiers_exposes TINYINT UNSIGNED NOT NULL DEFAULT 10,
  poids_email_securise   TINYINT UNSIGNED NOT NULL DEFAULT 5,
  seuil_bon              TINYINT UNSIGNED NOT NULL DEFAULT 75,
  seuil_moyen            TINYINT UNSIGNED NOT NULL DEFAULT 40,
  updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_single_row CHECK (id = 1)
) ENGINE=InnoDB;

INSERT INTO parametres_score (id) VALUES (1);
