import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  date,
  datetime,
} from "drizzle-orm/mysql-core";

// ─── USERS / FUNCIONÁRIOS ────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "socio", "advogado", "estagiario", "financeiro", "rh", "cliente", "user"]).default("user").notNull(),
  cargo: varchar("cargo", { length: 100 }),
  telefone: varchar("telefone", { length: 20 }),
  oab: varchar("oab", { length: 30 }),
  ativo: boolean("ativo").default(true),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── CLIENTES ────────────────────────────────────────────────────────────────
export const clientes = mysqlTable("clientes", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["pf", "pj"]).notNull().default("pf"),
  // PF
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  rg: varchar("rg", { length: 20 }),
  dataNascimento: date("dataNascimento"),
  // PJ
  razaoSocial: varchar("razaoSocial", { length: 255 }),
  nomeFantasia: varchar("nomeFantasia", { length: 255 }),
  cnpj: varchar("cnpj", { length: 18 }),
  inscricaoEstadual: varchar("inscricaoEstadual", { length: 30 }),
  responsavel: varchar("responsavel", { length: 255 }),
  // Contato
  telefone: varchar("telefone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  email: varchar("email", { length: 320 }),
  // Endereço
  cep: varchar("cep", { length: 10 }),
  logradouro: varchar("logradouro", { length: 255 }),
  numero: varchar("numero", { length: 20 }),
  complemento: varchar("complemento", { length: 100 }),
  bairro: varchar("bairro", { length: 100 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  // Status
  status: mysqlEnum("status", ["ativo", "inativo", "prospecto"]).default("ativo"),
  observacoes: text("observacoes"),
  advogadoResponsavelId: int("advogadoResponsavelId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

// ─── PROCESSOS ───────────────────────────────────────────────────────────────
export const processos = mysqlTable("processos", {
  id: int("id").autoincrement().primaryKey(),
  numeroCnj: varchar("numeroCnj", { length: 30 }),
  tribunal: varchar("tribunal", { length: 100 }),
  vara: varchar("vara", { length: 100 }),
  classeProcessual: varchar("classeProcessual", { length: 100 }),
  areaJuridica: mysqlEnum("areaJuridica", [
    "civil", "trabalhista", "criminal", "tributario", "previdenciario",
    "empresarial", "familia", "consumidor", "ambiental", "administrativo", "outro"
  ]).default("civil"),
  clienteId: int("clienteId").notNull(),
  advogadoResponsavelId: int("advogadoResponsavelId"),
  partesAdversas: text("partesAdversas"),
  valorCausa: decimal("valorCausa", { precision: 15, scale: 2 }),
  status: mysqlEnum("status", [
    "em_analise", "em_andamento", "audiencia", "recurso",
    "cumprimento_sentenca", "encerrado"
  ]).default("em_analise"),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  dataDistribuicao: date("dataDistribuicao"),
  dataEncerramento: date("dataEncerramento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Processo = typeof processos.$inferSelect;
export type InsertProcesso = typeof processos.$inferInsert;

// ─── MOVIMENTAÇÕES DO PROCESSO ───────────────────────────────────────────────
export const movimentacoes = mysqlTable("movimentacoes", {
  id: int("id").autoincrement().primaryKey(),
  processoId: int("processoId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["andamento", "documento", "audiencia", "prazo", "despacho", "sentenca", "recurso", "outro"]).default("andamento"),
  dataMovimentacao: datetime("dataMovimentacao").notNull(),
  usuarioId: int("usuarioId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Movimentacao = typeof movimentacoes.$inferSelect;
export type InsertMovimentacao = typeof movimentacoes.$inferInsert;

// ─── PRAZOS ──────────────────────────────────────────────────────────────────
export const prazos = mysqlTable("prazos", {
  id: int("id").autoincrement().primaryKey(),
  processoId: int("processoId"),
  clienteId: int("clienteId"),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["prazo_fatal", "audiencia", "reuniao", "tarefa", "compromisso"]).default("prazo_fatal"),
  dataVencimento: datetime("dataVencimento").notNull(),
  status: mysqlEnum("status", ["pendente", "concluido", "cancelado"]).default("pendente"),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "critica"]).default("media"),
  responsavelId: int("responsavelId"),
  local: varchar("local", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Prazo = typeof prazos.$inferSelect;
export type InsertPrazo = typeof prazos.$inferInsert;

// ─── FINANCEIRO: LANÇAMENTOS ─────────────────────────────────────────────────
export const lancamentos = mysqlTable("lancamentos", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["receita", "despesa"]).notNull(),
  categoria: mysqlEnum("categoria", [
    "honorario", "consultoria", "contrato", "acordo",
    "custa_processual", "deslocamento", "salario", "tributo",
    "aluguel", "material", "tecnologia", "outro"
  ]).notNull(),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  dataVencimento: date("dataVencimento"),
  dataPagamento: date("dataPagamento"),
  status: mysqlEnum("status", ["pendente", "pago", "vencido", "cancelado"]).default("pendente"),
  processoId: int("processoId"),
  clienteId: int("clienteId"),
  responsavelId: int("responsavelId"),
  formaPagamento: mysqlEnum("formaPagamento", ["pix", "boleto", "cartao", "transferencia", "dinheiro", "outro"]),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lancamento = typeof lancamentos.$inferSelect;
export type InsertLancamento = typeof lancamentos.$inferInsert;

// ─── DOCUMENTOS ──────────────────────────────────────────────────────────────
export const documentos = mysqlTable("documentos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["peticao", "contrato", "procuracao", "certidao", "comprovante", "parecer", "recurso", "outro"]).default("outro"),
  url: text("url"),
  fileKey: varchar("fileKey", { length: 255 }),
  tamanho: int("tamanho"),
  mimeType: varchar("mimeType", { length: 100 }),
  processoId: int("processoId"),
  clienteId: int("clienteId"),
  usuarioId: int("usuarioId"),
  publico: boolean("publico").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Documento = typeof documentos.$inferSelect;
export type InsertDocumento = typeof documentos.$inferInsert;

// ─── MENSAGENS / CHAT INTERNO ────────────────────────────────────────────────
export const mensagens = mysqlTable("mensagens", {
  id: int("id").autoincrement().primaryKey(),
  remetenteId: int("remetenteId").notNull(),
  destinatarioId: int("destinatarioId"),
  conteudo: text("conteudo").notNull(),
  tipo: mysqlEnum("tipo", ["interno", "cliente", "notificacao"]).default("interno"),
  lida: boolean("lida").default(false),
  processoId: int("processoId"),
  clienteId: int("clienteId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Mensagem = typeof mensagens.$inferSelect;
export type InsertMensagem = typeof mensagens.$inferInsert;

// ─── NOTIFICAÇÕES ────────────────────────────────────────────────────────────
export const notificacoes = mysqlTable("notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem"),
  tipo: mysqlEnum("tipo", ["prazo", "audiencia", "financeiro", "processo", "sistema"]).default("sistema"),
  lida: boolean("lida").default(false),
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;

// ─── PONTO ELETRÔNICO ────────────────────────────────────────────────────────
export const pontos = mysqlTable("pontos", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  data: date("data").notNull(),
  entrada: datetime("entrada"),
  inicioIntervalo: datetime("inicioIntervalo"),
  fimIntervalo: datetime("fimIntervalo"),
  saida: datetime("saida"),
  totalHoras: decimal("totalHoras", { precision: 5, scale: 2 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ponto = typeof pontos.$inferSelect;
export type InsertPonto = typeof pontos.$inferInsert;

// ─── TAREFAS ─────────────────────────────────────────────────────────────────
export const tarefas = mysqlTable("tarefas", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  status: mysqlEnum("status", ["pendente", "em_andamento", "concluida", "cancelada"]).default("pendente"),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "critica"]).default("media"),
  processoId: int("processoId"),
  clienteId: int("clienteId"),
  responsavelId: int("responsavelId"),
  dataVencimento: datetime("dataVencimento"),
  dataConclusao: datetime("dataConclusao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tarefa = typeof tarefas.$inferSelect;
export type InsertTarefa = typeof tarefas.$inferInsert;

// ─── ATENDIMENTOS (CRM) ──────────────────────────────────────────────────────
export const atendimentos = mysqlTable("atendimentos", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId").notNull(),
  usuarioId: int("usuarioId"),
  tipo: mysqlEnum("tipo", ["consulta", "reuniao", "ligacao", "email", "whatsapp", "outro"]).default("consulta"),
  titulo: varchar("titulo", { length: 255 }),
  descricao: text("descricao"),
  dataAtendimento: datetime("dataAtendimento").notNull(),
  duracao: int("duracao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Atendimento = typeof atendimentos.$inferSelect;
export type InsertAtendimento = typeof atendimentos.$inferInsert;

// ─── EXTENSÕES SAAS NEX: SETORES, FOLHA, ASSINATURAS E DOCUMENTOS ───────────
// Estas tabelas complementam o modo demo local e deixam a base pronta para
// produção com banco relacional, LGPD, auditoria e integrações futuras.
export const setoresEscritorio = mysqlTable("setores_escritorio", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const folhasPagamento = mysqlTable("folhas_pagamento", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  competencia: varchar("competencia", { length: 7 }).notNull(),
  salarioBase: decimal("salarioBase", { precision: 15, scale: 2 }).notNull(),
  diasTrabalhados: int("diasTrabalhados").default(0),
  faltas: int("faltas").default(0),
  atrasosHoras: decimal("atrasosHoras", { precision: 7, scale: 2 }).default("0"),
  horasExtras: decimal("horasExtras", { precision: 7, scale: 2 }).default("0"),
  descontos: decimal("descontos", { precision: 15, scale: 2 }).default("0"),
  bonificacoes: decimal("bonificacoes", { precision: 15, scale: 2 }).default("0"),
  valorLiquido: decimal("valorLiquido", { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["aberta", "fechada", "paga", "cancelada"]).default("aberta"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assinaturasDigitais = mysqlTable("assinaturas_digitais", {
  id: int("id").autoincrement().primaryKey(),
  pessoaTipo: mysqlEnum("pessoaTipo", ["funcionario", "advogado", "cliente", "socio"]).notNull(),
  pessoaId: varchar("pessoaId", { length: 120 }).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  papel: varchar("papel", { length: 120 }),
  documentoId: int("documentoId"),
  assinaturaUrl: text("assinaturaUrl"),
  hash: varchar("hash", { length: 120 }).notNull(),
  ip: varchar("ip", { length: 80 }),
  status: mysqlEnum("status", ["valida", "revogada"]).default("valida"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const protocolosDocumentos = mysqlTable("protocolos_documentos", {
  id: int("id").autoincrement().primaryKey(),
  documentoId: int("documentoId").notNull(),
  processoId: int("processoId"),
  numeroProtocolo: varchar("numeroProtocolo", { length: 120 }).notNull(),
  tribunalOrgao: varchar("tribunalOrgao", { length: 160 }),
  responsavelId: int("responsavelId"),
  comprovanteUrl: text("comprovanteUrl"),
  observacao: text("observacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SetorEscritorio = typeof setoresEscritorio.$inferSelect;
export type InsertSetorEscritorio = typeof setoresEscritorio.$inferInsert;
export type FolhaPagamento = typeof folhasPagamento.$inferSelect;
export type InsertFolhaPagamento = typeof folhasPagamento.$inferInsert;
export type AssinaturaDigitalDb = typeof assinaturasDigitais.$inferSelect;
export type InsertAssinaturaDigitalDb = typeof assinaturasDigitais.$inferInsert;
export type ProtocoloDocumento = typeof protocolosDocumentos.$inferSelect;
export type InsertProtocoloDocumento = typeof protocolosDocumentos.$inferInsert;

// ─── PRECIFICAÇÃO JURÍDICA AVANÇADA ─────────────────────────────────────────
export const precificacaoConfiguracoes = mysqlTable("precificacao_configuracoes", {
  id: int("id").autoincrement().primaryKey(),
  escritorioId: int("escritorioId"),
  aluguel: decimal("aluguel", { precision: 15, scale: 2 }).default("0"),
  energia: decimal("energia", { precision: 15, scale: 2 }).default("0"),
  agua: decimal("agua", { precision: 15, scale: 2 }).default("0"),
  internet: decimal("internet", { precision: 15, scale: 2 }).default("0"),
  sistemas: decimal("sistemas", { precision: 15, scale: 2 }).default("0"),
  contador: decimal("contador", { precision: 15, scale: 2 }).default("0"),
  marketing: decimal("marketing", { precision: 15, scale: 2 }).default("0"),
  materialEscritorio: decimal("materialEscritorio", { precision: 15, scale: 2 }).default("0"),
  manutencao: decimal("manutencao", { precision: 15, scale: 2 }).default("0"),
  impostosFixos: decimal("impostosFixos", { precision: 15, scale: 2 }).default("0"),
  folhaFuncionarios: decimal("folhaFuncionarios", { precision: 15, scale: 2 }).default("0"),
  proLaboreSocios: decimal("proLaboreSocios", { precision: 15, scale: 2 }).default("0"),
  outros: decimal("outros", { precision: 15, scale: 2 }).default("0"),
  horasProdutivasMes: decimal("horasProdutivasMes", { precision: 8, scale: 2 }).default("176"),
  margemLucroDesejada: decimal("margemLucroDesejada", { precision: 5, scale: 2 }).default("35"),
  impostosVariaveisPercentual: decimal("impostosVariaveisPercentual", { precision: 5, scale: 2 }).default("8"),
  reservaRiscoPercentual: decimal("reservaRiscoPercentual", { precision: 5, scale: 2 }).default("6"),
  custoKm: decimal("custoKm", { precision: 8, scale: 2 }).default("1.65"),
  seccionalOab: varchar("seccionalOab", { length: 20 }).default("OAB-MA"),
  anoTabela: int("anoTabela").default(2026),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const precificacaoServicos = mysqlTable("precificacao_servicos", {
  id: int("id").autoincrement().primaryKey(),
  codigo: varchar("codigo", { length: 120 }).notNull().unique(),
  areaDireito: varchar("areaDireito", { length: 80 }).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  pisoOab: decimal("pisoOab", { precision: 15, scale: 2 }).default("0"),
  percentualExito: decimal("percentualExito", { precision: 6, scale: 4 }).default("0"),
  fonteReferencia: text("fonteReferencia"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const propostasHonorarios = mysqlTable("propostas_honorarios", {
  id: int("id").autoincrement().primaryKey(),
  processoId: int("processoId"),
  clienteId: int("clienteId"),
  responsavelId: int("responsavelId"),
  areaDireito: varchar("areaDireito", { length: 80 }).notNull(),
  servicoCodigo: varchar("servicoCodigo", { length: 120 }).notNull(),
  valorCausa: decimal("valorCausa", { precision: 15, scale: 2 }).default("0"),
  complexidade: int("complexidade").default(3),
  urgencia: int("urgencia").default(3),
  risco: int("risco").default(3),
  horasTecnicas: decimal("horasTecnicas", { precision: 8, scale: 2 }).default("0"),
  horasAdministrativas: decimal("horasAdministrativas", { precision: 8, scale: 2 }).default("0"),
  horasDeslocamento: decimal("horasDeslocamento", { precision: 8, scale: 2 }).default("0"),
  kmTotal: decimal("kmTotal", { precision: 10, scale: 2 }).default("0"),
  despesasDiretas: decimal("despesasDiretas", { precision: 15, scale: 2 }).default("0"),
  custoOperacional: decimal("custoOperacional", { precision: 15, scale: 2 }).default("0"),
  pisoOabAplicado: decimal("pisoOabAplicado", { precision: 15, scale: 2 }).default("0"),
  valorMinimoTecnico: decimal("valorMinimoTecnico", { precision: 15, scale: 2 }).default("0"),
  valorRecomendado: decimal("valorRecomendado", { precision: 15, scale: 2 }).default("0"),
  valorPremium: decimal("valorPremium", { precision: 15, scale: 2 }).default("0"),
  entradaSugerida: decimal("entradaSugerida", { precision: 15, scale: 2 }).default("0"),
  honorarioExito: decimal("honorarioExito", { precision: 15, scale: 2 }).default("0"),
  margemRealEstimada: decimal("margemRealEstimada", { precision: 8, scale: 2 }).default("0"),
  payloadCalculo: text("payloadCalculo"),
  status: mysqlEnum("status", ["rascunho", "enviada", "aprovada", "recusada", "cancelada"]).default("rascunho"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PrecificacaoConfiguracao = typeof precificacaoConfiguracoes.$inferSelect;
export type InsertPrecificacaoConfiguracao = typeof precificacaoConfiguracoes.$inferInsert;
export type PrecificacaoServico = typeof precificacaoServicos.$inferSelect;
export type InsertPrecificacaoServico = typeof precificacaoServicos.$inferInsert;
export type PropostaHonorarios = typeof propostasHonorarios.$inferSelect;
export type InsertPropostaHonorarios = typeof propostasHonorarios.$inferInsert;
