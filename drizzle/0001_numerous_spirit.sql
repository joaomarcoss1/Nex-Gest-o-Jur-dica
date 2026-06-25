CREATE TABLE `atendimentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`usuarioId` int,
	`tipo` enum('consulta','reuniao','ligacao','email','whatsapp','outro') DEFAULT 'consulta',
	`titulo` varchar(255),
	`descricao` text,
	`dataAtendimento` datetime NOT NULL,
	`duracao` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `atendimentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('pf','pj') NOT NULL DEFAULT 'pf',
	`nome` varchar(255) NOT NULL,
	`cpf` varchar(14),
	`rg` varchar(20),
	`dataNascimento` date,
	`razaoSocial` varchar(255),
	`nomeFantasia` varchar(255),
	`cnpj` varchar(18),
	`inscricaoEstadual` varchar(30),
	`responsavel` varchar(255),
	`telefone` varchar(20),
	`whatsapp` varchar(20),
	`email` varchar(320),
	`cep` varchar(10),
	`logradouro` varchar(255),
	`numero` varchar(20),
	`complemento` varchar(100),
	`bairro` varchar(100),
	`cidade` varchar(100),
	`estado` varchar(2),
	`status` enum('ativo','inativo','prospecto') DEFAULT 'ativo',
	`observacoes` text,
	`advogadoResponsavelId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` enum('peticao','contrato','procuracao','certidao','comprovante','parecer','recurso','outro') DEFAULT 'outro',
	`url` text,
	`fileKey` varchar(255),
	`tamanho` int,
	`mimeType` varchar(100),
	`processoId` int,
	`clienteId` int,
	`usuarioId` int,
	`publico` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lancamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('receita','despesa') NOT NULL,
	`categoria` enum('honorario','consultoria','contrato','acordo','custa_processual','deslocamento','salario','tributo','aluguel','material','tecnologia','outro') NOT NULL,
	`descricao` varchar(255) NOT NULL,
	`valor` decimal(15,2) NOT NULL,
	`dataVencimento` date,
	`dataPagamento` date,
	`status` enum('pendente','pago','vencido','cancelado') DEFAULT 'pendente',
	`processoId` int,
	`clienteId` int,
	`responsavelId` int,
	`formaPagamento` enum('pix','boleto','cartao','transferencia','dinheiro','outro'),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lancamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mensagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`remetenteId` int NOT NULL,
	`destinatarioId` int,
	`conteudo` text NOT NULL,
	`tipo` enum('interno','cliente','notificacao') DEFAULT 'interno',
	`lida` boolean DEFAULT false,
	`processoId` int,
	`clienteId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mensagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `movimentacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processoId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` enum('andamento','documento','audiencia','prazo','despacho','sentenca','recurso','outro') DEFAULT 'andamento',
	`dataMovimentacao` datetime NOT NULL,
	`usuarioId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `movimentacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text,
	`tipo` enum('prazo','audiencia','financeiro','processo','sistema') DEFAULT 'sistema',
	`lida` boolean DEFAULT false,
	`link` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pontos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`data` date NOT NULL,
	`entrada` datetime,
	`inicioIntervalo` datetime,
	`fimIntervalo` datetime,
	`saida` datetime,
	`totalHoras` decimal(5,2),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pontos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prazos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processoId` int,
	`clienteId` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` enum('prazo_fatal','audiencia','reuniao','tarefa','compromisso') DEFAULT 'prazo_fatal',
	`dataVencimento` datetime NOT NULL,
	`status` enum('pendente','concluido','cancelado') DEFAULT 'pendente',
	`prioridade` enum('baixa','media','alta','critica') DEFAULT 'media',
	`responsavelId` int,
	`local` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prazos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numeroCnj` varchar(30),
	`tribunal` varchar(100),
	`vara` varchar(100),
	`classeProcessual` varchar(100),
	`areaJuridica` enum('civil','trabalhista','criminal','tributario','previdenciario','empresarial','familia','consumidor','ambiental','administrativo','outro') DEFAULT 'civil',
	`clienteId` int NOT NULL,
	`advogadoResponsavelId` int,
	`partesAdversas` text,
	`valorCausa` decimal(15,2),
	`status` enum('em_analise','em_andamento','audiencia','recurso','cumprimento_sentenca','encerrado') DEFAULT 'em_analise',
	`descricao` text,
	`observacoes` text,
	`dataDistribuicao` date,
	`dataEncerramento` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `processos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tarefas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`status` enum('pendente','em_andamento','concluida','cancelada') DEFAULT 'pendente',
	`prioridade` enum('baixa','media','alta','critica') DEFAULT 'media',
	`processoId` int,
	`clienteId` int,
	`responsavelId` int,
	`dataVencimento` datetime,
	`dataConclusao` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tarefas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','socio','advogado','estagiario','financeiro','rh','cliente','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `cargo` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `telefone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `oab` varchar(30);--> statement-breakpoint
ALTER TABLE `users` ADD `ativo` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;