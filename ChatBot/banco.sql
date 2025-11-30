
DROP TABLE IF EXISTS `Usuario`;
DROP TABLE IF EXISTS `Empresa`;
DROP TABLE IF EXISTS `Administrador`;

CREATE TABLE `Administrador` (
    `id_admin` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    UNIQUE INDEX `Administrador_email_key`(`email`),
    PRIMARY KEY (`id_admin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Empresa` (
    `id_empresa` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_empresa` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `token_api` VARCHAR(191) NOT NULL,
    UNIQUE INDEX `Empresa_cnpj_key`(`cnpj`),
    UNIQUE INDEX `Empresa_token_api`(`token_api`),
    PRIMARY KEY (`id_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Usuario` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `telefone` VARCHAR(20) DEFAULT NULL,
    `papel` ENUM('administrador','funcionario') NOT NULL,
    `atividade` ENUM('ativo','inativo') NOT NULL,
    `id_empresa` INTEGER NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX `usuario_telefone`(`telefone`),
    PRIMARY KEY (`id_user`),
    KEY `fk_admempresa_empresa` (`id_empresa`),
    CONSTRAINT `fk_admempresa_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `Empresa` (`id_empresa`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

