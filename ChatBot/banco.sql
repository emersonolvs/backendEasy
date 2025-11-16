DROP TABLE IF EXISTS `Feedback`;
DROP TABLE IF EXISTS `Notificacoes`;
DROP TABLE IF EXISTS `ResumoConversa`;
DROP TABLE IF EXISTS `DespesasFixas`;
DROP TABLE IF EXISTS `CustosVariaveis`;
DROP TABLE IF EXISTS `ReceitasOperacionais`;
DROP TABLE IF EXISTS `Receitas`;
DROP TABLE IF EXISTS `ContasPagar`;
DROP TABLE IF EXISTS `ConfiguracaoERP`;
DROP TABLE IF EXISTS `Solicitacao`;
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

CREATE TABLE `Solicitacao` (
    `id_solicitacao` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_solicitacao` ENUM('recibo', 'despesa', 'relatorio') NOT NULL,
    `data_solicitacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('sucesso', 'erro', 'pendente') NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    PRIMARY KEY (`id_solicitacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ConfiguracaoERP` (
    `id_config` INTEGER NOT NULL AUTO_INCREMENT,
    `url_api` VARCHAR(191) NULL,
    `token_api` VARCHAR(191) NULL,
    `status` ENUM('ativo', 'inativo') NOT NULL,
    `id_empresa` INTEGER NOT NULL,
    UNIQUE INDEX `ConfiguracaoERP_id_empresa_key`(`id_empresa`),
    PRIMARY KEY (`id_config`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ContasPagar` (
    `id_conta` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(10,2) NOT NULL,
    `data_vencimento` DATE NOT NULL,
    `data_pagamento` DATE NULL,
    `status` ENUM('pendente', 'pago', 'vencido') NOT NULL DEFAULT 'pendente',
    `id_empresa` INTEGER NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_conta`),
    KEY `fk_contas_empresa` (`id_empresa`),
    CONSTRAINT `fk_contas_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `Empresa` (`id_empresa`) ON DELETE CASCADE
);

CREATE TABLE `Receitas` (
    `id_receita` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(10,2) NOT NULL,
    `data_recebimento` DATE NOT NULL,
    `categoria` VARCHAR(100) NULL,
    `id_empresa` INTEGER NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_receita`),
    KEY `fk_receitas_empresa` (`id_empresa`),
    CONSTRAINT `fk_receitas_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `Empresa` (`id_empresa`) ON DELETE CASCADE
);

CREATE TABLE `ReceitasOperacionais` (
    `id_receita_op` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(10,2) NOT NULL,
    `data_recebimento` DATE NOT NULL,
    `mes` INTEGER NOT NULL,
    `ano` INTEGER NOT NULL,
    `id_empresa` INTEGER NOT NULL,
    PRIMARY KEY (`id_receita_op`),
    KEY `fk_receitasop_empresa` (`id_empresa`),
    CONSTRAINT `fk_receitasop_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `Empresa` (`id_empresa`) ON DELETE CASCADE
);

CREATE TABLE `CustosVariaveis` (
    `id_custo` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(10,2) NOT NULL,
    `data` DATE NOT NULL,
    `mes` INTEGER NOT NULL,
    `ano` INTEGER NOT NULL,
    `id_empresa` INTEGER NOT NULL,
    PRIMARY KEY (`id_custo`),
    KEY `fk_custos_empresa` (`id_empresa`),
    CONSTRAINT `fk_custos_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `Empresa` (`id_empresa`) ON DELETE CASCADE
);

CREATE TABLE `DespesasFixas` (
    `id_despesa` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(10,2) NOT NULL,
    `tipo` ENUM('operacional', 'administrativa', 'comercial') NOT NULL,
    `data` DATE NOT NULL,
    `mes` INTEGER NOT NULL,
    `ano` INTEGER NOT NULL,
    `id_empresa` INTEGER NOT NULL,
    PRIMARY KEY (`id_despesa`),
    KEY `fk_despesas_empresa` (`id_empresa`),
    CONSTRAINT `fk_despesas_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `Empresa` (`id_empresa`) ON DELETE CASCADE
);

CREATE TABLE `ResumoConversa` (
    `id_resumo` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `resumo_texto` TEXT NOT NULL,
    `data_conversa` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tipo_consulta` ENUM('relatorio_completo', 'detalhamento_financeiro', 'duvidas', 'horario', 'suporte') NOT NULL,
    PRIMARY KEY (`id_resumo`),
    KEY `fk_resumo_usuario` (`id_usuario`),
    CONSTRAINT `fk_resumo_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_user`) ON DELETE CASCADE
);

CREATE TABLE `Notificacoes` (
    `id_notificacao` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `mensagem` TEXT NOT NULL,
    `tipo` ENUM('vencimento', 'faturamento', 'geral') NOT NULL,
    `data_envio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `dias_vencimento` INTEGER NULL,
    PRIMARY KEY (`id_notificacao`),
    KEY `fk_notificacoes_usuario` (`id_usuario`),
    CONSTRAINT `fk_notificacoes_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_user`) ON DELETE CASCADE
);

CREATE TABLE `Feedback` (
    `id_feedback` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `avaliacao` ENUM('1', '2', '3', '4', '5') NOT NULL,
    `comentario` TEXT NULL,
    `data_feedback` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id_feedback`),
    KEY `fk_feedback_usuario` (`id_usuario`),
    CONSTRAINT `fk_feedback_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_user`) ON DELETE CASCADE
);

ALTER TABLE `Solicitacao`
ADD CONSTRAINT `Solicitacao_id_usuario_fkey`
FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ConfiguracaoERP`
ADD CONSTRAINT `ConfiguracaoERP_id_empresa_fkey`
FOREIGN KEY (`id_empresa`) REFERENCES `Empresa` (`id_empresa`) ON DELETE RESTRICT ON UPDATE CASCADE;
