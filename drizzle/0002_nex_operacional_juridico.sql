-- Extensões para versão SaaS premium: setores, folha, documentos, protocolos e assinaturas.
CREATE TABLE IF NOT EXISTS setores_escritorio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS folhas_pagamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NOT NULL,
  competencia VARCHAR(7) NOT NULL,
  salarioBase DECIMAL(15,2) NOT NULL,
  diasTrabalhados INT DEFAULT 0,
  faltas INT DEFAULT 0,
  atrasosHoras DECIMAL(7,2) DEFAULT 0,
  horasExtras DECIMAL(7,2) DEFAULT 0,
  descontos DECIMAL(15,2) DEFAULT 0,
  bonificacoes DECIMAL(15,2) DEFAULT 0,
  valorLiquido DECIMAL(15,2) NOT NULL,
  status ENUM('aberta','fechada','paga','cancelada') DEFAULT 'aberta',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS assinaturas_digitais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pessoaTipo ENUM('funcionario','advogado','cliente','socio') NOT NULL,
  pessoaId VARCHAR(120) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  papel VARCHAR(120),
  documentoId INT,
  assinaturaUrl TEXT,
  hash VARCHAR(120) NOT NULL,
  ip VARCHAR(80),
  status ENUM('valida','revogada') DEFAULT 'valida',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS protocolos_documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documentoId INT NOT NULL,
  processoId INT,
  numeroProtocolo VARCHAR(120) NOT NULL,
  tribunalOrgao VARCHAR(160),
  responsavelId INT,
  comprovanteUrl TEXT,
  observacao TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE documentos ADD COLUMN statusDocumento ENUM('recebido','em_analise','pendente_correcao','aprovado','protocolado','arquivado') DEFAULT 'recebido';
ALTER TABLE documentos ADD COLUMN origemDocumento ENUM('camera','upload','editor') DEFAULT 'upload';
ALTER TABLE documentos ADD COLUMN qualidade INT DEFAULT 0;
ALTER TABLE documentos ADD COLUMN hashIntegridade VARCHAR(120);
ALTER TABLE documentos ADD COLUMN observacaoInterna TEXT;
