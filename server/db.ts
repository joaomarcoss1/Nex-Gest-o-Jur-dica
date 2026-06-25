import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  atendimentos,
  clientes,
  documentos,
  lancamentos,
  mensagens,
  movimentacoes,
  notificacoes,
  pontos,
  prazos,
  processos,
  tarefas,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listarFuncionarios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── CLIENTES ────────────────────────────────────────────────────────────────
export async function listarClientes(filtro?: { status?: string; busca?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conds: ReturnType<typeof eq>[] = [];
  if (filtro?.status) conds.push(eq(clientes.status, filtro.status as any));
  const base = db.select().from(clientes);
  const result = conds.length ? await base.where(and(...conds)).orderBy(desc(clientes.createdAt)) : await base.orderBy(desc(clientes.createdAt));
  return result;
}

export async function getClienteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
  return result[0];
}

export async function criarCliente(data: typeof clientes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(clientes).values(data);
  return result;
}

export async function atualizarCliente(id: number, data: Partial<typeof clientes.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(clientes).set(data).where(eq(clientes.id, id));
}

// ─── PROCESSOS ───────────────────────────────────────────────────────────────
export async function listarProcessos(filtro?: { status?: string; clienteId?: number; areaJuridica?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conds: ReturnType<typeof eq>[] = [];
  if (filtro?.status) conds.push(eq(processos.status, filtro.status as any));
  if (filtro?.clienteId) conds.push(eq(processos.clienteId, filtro.clienteId));
  if (filtro?.areaJuridica) conds.push(eq(processos.areaJuridica, filtro.areaJuridica as any));
  const base = db.select().from(processos);
  return conds.length ? base.where(and(...conds)).orderBy(desc(processos.createdAt)) : base.orderBy(desc(processos.createdAt));
}

export async function getProcessoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(processos).where(eq(processos.id, id)).limit(1);
  return result[0];
}

export async function criarProcesso(data: typeof processos.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(processos).values(data);
}

export async function atualizarProcesso(id: number, data: Partial<typeof processos.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(processos).set(data).where(eq(processos.id, id));
}

export async function listarMovimentacoes(processoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(movimentacoes).where(eq(movimentacoes.processoId, processoId)).orderBy(desc(movimentacoes.dataMovimentacao));
}

export async function criarMovimentacao(data: typeof movimentacoes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(movimentacoes).values(data);
}

// ─── PRAZOS / AGENDA ─────────────────────────────────────────────────────────
export async function listarPrazos(filtro?: { status?: string; responsavelId?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conds: ReturnType<typeof eq>[] = [];
  if (filtro?.status) conds.push(eq(prazos.status, filtro.status as any));
  if (filtro?.responsavelId) conds.push(eq(prazos.responsavelId, filtro.responsavelId));
  const base = db.select().from(prazos);
  return conds.length ? base.where(and(...conds)).orderBy(prazos.dataVencimento) : base.orderBy(prazos.dataVencimento);
}

export async function criarPrazo(data: typeof prazos.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(prazos).values(data);
}

export async function atualizarPrazo(id: number, data: Partial<typeof prazos.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(prazos).set(data).where(eq(prazos.id, id));
}

// ─── FINANCEIRO ──────────────────────────────────────────────────────────────
export async function listarLancamentos(filtro?: { tipo?: string; status?: string; clienteId?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conds: ReturnType<typeof eq>[] = [];
  if (filtro?.tipo) conds.push(eq(lancamentos.tipo, filtro.tipo as any));
  if (filtro?.status) conds.push(eq(lancamentos.status, filtro.status as any));
  if (filtro?.clienteId) conds.push(eq(lancamentos.clienteId, filtro.clienteId));
  const base = db.select().from(lancamentos);
  return conds.length ? base.where(and(...conds)).orderBy(desc(lancamentos.createdAt)) : base.orderBy(desc(lancamentos.createdAt));
}

export async function criarLancamento(data: typeof lancamentos.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(lancamentos).values(data);
}

export async function atualizarLancamento(id: number, data: Partial<typeof lancamentos.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(lancamentos).set(data).where(eq(lancamentos.id, id));
}

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  const [totalProcessos] = await db.select({ count: sql<number>`count(*)` }).from(processos);
  const [processosAtivos] = await db.select({ count: sql<number>`count(*)` }).from(processos).where(
    or(eq(processos.status, "em_andamento"), eq(processos.status, "em_analise"), eq(processos.status, "audiencia"), eq(processos.status, "recurso"))!
  );
  const [processosEncerrados] = await db.select({ count: sql<number>`count(*)` }).from(processos).where(eq(processos.status, "encerrado"));
  const [totalClientes] = await db.select({ count: sql<number>`count(*)` }).from(clientes).where(eq(clientes.status, "ativo"));
  const [honorariosAReceber] = await db.select({ total: sql<number>`COALESCE(SUM(valor), 0)` }).from(lancamentos).where(and(eq(lancamentos.tipo, "receita"), eq(lancamentos.status, "pendente"))!);
  const [honorariosRecebidos] = await db.select({ total: sql<number>`COALESCE(SUM(valor), 0)` }).from(lancamentos).where(and(eq(lancamentos.tipo, "receita"), eq(lancamentos.status, "pago"))!);
  const [tarefasPendentes] = await db.select({ count: sql<number>`count(*)` }).from(tarefas).where(eq(tarefas.status, "pendente"));
  const agora = new Date();
  const inicioSemana = new Date(agora);
  inicioSemana.setDate(agora.getDate() - agora.getDay());
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 7);
  const [audienciasSemana] = await db.select({ count: sql<number>`count(*)` }).from(prazos).where(
    and(eq(prazos.tipo, "audiencia"), gte(prazos.dataVencimento, inicioSemana), lte(prazos.dataVencimento, fimSemana))!
  );
  return {
    totalProcessos: Number(totalProcessos?.count ?? 0),
    processosAtivos: Number(processosAtivos?.count ?? 0),
    processosEncerrados: Number(processosEncerrados?.count ?? 0),
    totalClientes: Number(totalClientes?.count ?? 0),
    honorariosAReceber: Number(honorariosAReceber?.total ?? 0),
    honorariosRecebidos: Number(honorariosRecebidos?.total ?? 0),
    tarefasPendentes: Number(tarefasPendentes?.count ?? 0),
    audienciasSemana: Number(audienciasSemana?.count ?? 0),
  };
}

// ─── TAREFAS ─────────────────────────────────────────────────────────────────
export async function listarTarefas(filtro?: { status?: string; responsavelId?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conds: ReturnType<typeof eq>[] = [];
  if (filtro?.status) conds.push(eq(tarefas.status, filtro.status as any));
  if (filtro?.responsavelId) conds.push(eq(tarefas.responsavelId, filtro.responsavelId));
  const base = db.select().from(tarefas);
  return conds.length ? base.where(and(...conds)).orderBy(desc(tarefas.createdAt)) : base.orderBy(desc(tarefas.createdAt));
}

export async function criarTarefa(data: typeof tarefas.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(tarefas).values(data);
}

export async function atualizarTarefa(id: number, data: Partial<typeof tarefas.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(tarefas).set(data).where(eq(tarefas.id, id));
}

// ─── MENSAGENS ───────────────────────────────────────────────────────────────
export async function listarMensagens(usuarioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mensagens)
    .where(or(eq(mensagens.remetenteId, usuarioId), eq(mensagens.destinatarioId, usuarioId))!)
    .orderBy(desc(mensagens.createdAt));
}

export async function criarMensagem(data: typeof mensagens.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(mensagens).values(data);
}

// ─── NOTIFICAÇÕES ────────────────────────────────────────────────────────────
export async function listarNotificacoes(usuarioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notificacoes).where(eq(notificacoes.usuarioId, usuarioId)).orderBy(desc(notificacoes.createdAt)).limit(50);
}

export async function marcarNotificacaoLida(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notificacoes).set({ lida: true }).where(eq(notificacoes.id, id));
}

// ─── DOCUMENTOS ──────────────────────────────────────────────────────────────
export async function listarDocumentos(filtro?: { processoId?: number; clienteId?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conds: ReturnType<typeof eq>[] = [];
  if (filtro?.processoId) conds.push(eq(documentos.processoId, filtro.processoId));
  if (filtro?.clienteId) conds.push(eq(documentos.clienteId, filtro.clienteId));
  const base = db.select().from(documentos);
  return conds.length ? base.where(and(...conds)).orderBy(desc(documentos.createdAt)) : base.orderBy(desc(documentos.createdAt));
}

export async function criarDocumento(data: typeof documentos.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(documentos).values(data);
}

// ─── PONTO ───────────────────────────────────────────────────────────────────
export async function getPontoHoje(usuarioId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const hoje = new Date().toISOString().split("T")[0];
  const result = await db.select().from(pontos).where(and(eq(pontos.usuarioId, usuarioId), eq(pontos.data, hoje as any))!).limit(1);
  return result[0];
}

export async function upsertPonto(data: typeof pontos.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(pontos).values(data).onDuplicateKeyUpdate({ set: data });
}

// ─── ATENDIMENTOS ────────────────────────────────────────────────────────────
export async function listarAtendimentos(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(atendimentos).where(eq(atendimentos.clienteId, clienteId)).orderBy(desc(atendimentos.dataAtendimento));
}

export async function criarAtendimento(data: typeof atendimentos.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(atendimentos).values(data);
}
