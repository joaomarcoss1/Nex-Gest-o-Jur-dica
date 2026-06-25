import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  atualizarCliente,
  atualizarLancamento,
  atualizarPrazo,
  atualizarProcesso,
  atualizarTarefa,
  criarAtendimento,
  criarCliente,
  criarDocumento,
  criarLancamento,
  criarMensagem,
  criarMovimentacao,
  criarPrazo,
  criarProcesso,
  criarTarefa,
  getDashboardStats,
  getClienteById,
  getPontoHoje,
  getProcessoById,
  getUserByOpenId,
  listarAtendimentos,
  listarClientes,
  listarDocumentos,
  listarFuncionarios,
  listarLancamentos,
  listarMensagens,
  listarMovimentacoes,
  listarNotificacoes,
  listarPrazos,
  listarProcessos,
  listarTarefas,
  marcarNotificacaoLida,
  upsertPonto,
} from "./db";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── DASHBOARD ─────────────────────────────────────────────────────────────
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return getDashboardStats();
    }),
    prazosUrgentes: protectedProcedure.query(async () => {
      const todos = await listarPrazos({ status: "pendente" });
      const agora = new Date();
      const limite = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
      return todos.filter((p) => new Date(p.dataVencimento) <= limite).slice(0, 5);
    }),
    tarefasRecentes: protectedProcedure.query(async () => {
      return listarTarefas({ status: "pendente" });
    }),
  }),

  // ─── CLIENTES ──────────────────────────────────────────────────────────────
  clientes: router({
    listar: protectedProcedure
      .input(z.object({ status: z.string().optional(), busca: z.string().optional() }).optional())
      .query(async ({ input }) => listarClientes(input)),
    buscarPorId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getClienteById(input.id)),
    criar: protectedProcedure
      .input(z.object({
        tipo: z.enum(["pf", "pj"]),
        nome: z.string().min(1),
        cpf: z.string().optional(),
        rg: z.string().optional(),
        dataNascimento: z.string().optional(),
        razaoSocial: z.string().optional(),
        nomeFantasia: z.string().optional(),
        cnpj: z.string().optional(),
        inscricaoEstadual: z.string().optional(),
        responsavel: z.string().optional(),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().optional(),
        cep: z.string().optional(),
        logradouro: z.string().optional(),
        numero: z.string().optional(),
        complemento: z.string().optional(),
        bairro: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        status: z.enum(["ativo", "inativo", "prospecto"]).optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await criarCliente(input as any);
        return { success: true };
      }),
    atualizar: protectedProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input }) => {
        await atualizarCliente(input.id, input.data);
        return { success: true };
      }),
    atendimentos: protectedProcedure
      .input(z.object({ clienteId: z.number() }))
      .query(async ({ input }) => listarAtendimentos(input.clienteId)),
    criarAtendimento: protectedProcedure
      .input(z.object({
        clienteId: z.number(),
        tipo: z.enum(["consulta", "reuniao", "ligacao", "email", "whatsapp", "outro"]).optional(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        dataAtendimento: z.string(),
        duracao: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await criarAtendimento({ ...input, usuarioId: ctx.user.id, dataAtendimento: new Date(input.dataAtendimento) });
        return { success: true };
      }),
  }),

  // ─── PROCESSOS ─────────────────────────────────────────────────────────────
  processos: router({
    listar: protectedProcedure
      .input(z.object({ status: z.string().optional(), clienteId: z.number().optional(), areaJuridica: z.string().optional() }).optional())
      .query(async ({ input }) => listarProcessos(input)),
    buscarPorId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getProcessoById(input.id)),
    criar: protectedProcedure
      .input(z.object({
        numeroCnj: z.string().optional(),
        tribunal: z.string().optional(),
        vara: z.string().optional(),
        classeProcessual: z.string().optional(),
        areaJuridica: z.enum(["civil","trabalhista","criminal","tributario","previdenciario","empresarial","familia","consumidor","ambiental","administrativo","outro"]).optional(),
        clienteId: z.number(),
        advogadoResponsavelId: z.number().optional(),
        partesAdversas: z.string().optional(),
        valorCausa: z.string().optional(),
        status: z.enum(["em_analise","em_andamento","audiencia","recurso","cumprimento_sentenca","encerrado"]).optional(),
        descricao: z.string().optional(),
        observacoes: z.string().optional(),
        dataDistribuicao: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await criarProcesso(input as any);
        return { success: true };
      }),
    atualizar: protectedProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input }) => {
        await atualizarProcesso(input.id, input.data);
        return { success: true };
      }),
    movimentacoes: protectedProcedure
      .input(z.object({ processoId: z.number() }))
      .query(async ({ input }) => listarMovimentacoes(input.processoId)),
    criarMovimentacao: protectedProcedure
      .input(z.object({
        processoId: z.number(),
        titulo: z.string(),
        descricao: z.string().optional(),
        tipo: z.enum(["andamento","documento","audiencia","prazo","despacho","sentenca","recurso","outro"]).optional(),
        dataMovimentacao: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await criarMovimentacao({ ...input, usuarioId: ctx.user.id, dataMovimentacao: new Date(input.dataMovimentacao) });
        return { success: true };
      }),
  }),

  // ─── PRAZOS / AGENDA ───────────────────────────────────────────────────────
  prazos: router({
    listar: protectedProcedure
      .input(z.object({ status: z.string().optional(), responsavelId: z.number().optional() }).optional())
      .query(async ({ input }) => listarPrazos(input)),
    criar: protectedProcedure
      .input(z.object({
        processoId: z.number().optional(),
        clienteId: z.number().optional(),
        titulo: z.string(),
        descricao: z.string().optional(),
        tipo: z.enum(["prazo_fatal","audiencia","reuniao","tarefa","compromisso"]).optional(),
        dataVencimento: z.string(),
        prioridade: z.enum(["baixa","media","alta","critica"]).optional(),
        responsavelId: z.number().optional(),
        local: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await criarPrazo({ ...input, dataVencimento: new Date(input.dataVencimento) });
        return { success: true };
      }),
    atualizar: protectedProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input }) => {
        await atualizarPrazo(input.id, input.data);
        return { success: true };
      }),
  }),

  // ─── FINANCEIRO ────────────────────────────────────────────────────────────
  financeiro: router({
    listar: protectedProcedure
      .input(z.object({ tipo: z.string().optional(), status: z.string().optional(), clienteId: z.number().optional() }).optional())
      .query(async ({ input }) => listarLancamentos(input)),
    criar: protectedProcedure
      .input(z.object({
        tipo: z.enum(["receita", "despesa"]),
        categoria: z.enum(["honorario","consultoria","contrato","acordo","custa_processual","deslocamento","salario","tributo","aluguel","material","tecnologia","outro"]),
        descricao: z.string(),
        valor: z.string(),
        dataVencimento: z.string().optional(),
        status: z.enum(["pendente","pago","vencido","cancelado"]).optional(),
        processoId: z.number().optional(),
        clienteId: z.number().optional(),
        formaPagamento: z.enum(["pix","boleto","cartao","transferencia","dinheiro","outro"]).optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await criarLancamento({ ...input, responsavelId: ctx.user.id } as any);
        return { success: true };
      }),
    atualizar: protectedProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input }) => {
        await atualizarLancamento(input.id, input.data);
        return { success: true };
      }),
  }),

  // ─── TAREFAS ───────────────────────────────────────────────────────────────
  tarefas: router({
    listar: protectedProcedure
      .input(z.object({ status: z.string().optional(), responsavelId: z.number().optional() }).optional())
      .query(async ({ input }) => listarTarefas(input)),
    criar: protectedProcedure
      .input(z.object({
        titulo: z.string(),
        descricao: z.string().optional(),
        prioridade: z.enum(["baixa","media","alta","critica"]).optional(),
        processoId: z.number().optional(),
        clienteId: z.number().optional(),
        dataVencimento: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await criarTarefa({ ...input, responsavelId: ctx.user.id, dataVencimento: input.dataVencimento ? new Date(input.dataVencimento) : undefined });
        return { success: true };
      }),
    atualizar: protectedProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input }) => {
        await atualizarTarefa(input.id, input.data);
        return { success: true };
      }),
  }),

  // ─── DOCUMENTOS ────────────────────────────────────────────────────────────
  documentos: router({
    listar: protectedProcedure
      .input(z.object({ processoId: z.number().optional(), clienteId: z.number().optional() }).optional())
      .query(async ({ input }) => listarDocumentos(input)),
    criar: protectedProcedure
      .input(z.object({
        nome: z.string(),
        tipo: z.enum(["peticao","contrato","procuracao","certidao","comprovante","parecer","recurso","outro"]).optional(),
        url: z.string().optional(),
        processoId: z.number().optional(),
        clienteId: z.number().optional(),
        publico: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await criarDocumento({ ...input, usuarioId: ctx.user.id });
        return { success: true };
      }),
  }),

  // ─── MENSAGENS / COMUNICAÇÃO ───────────────────────────────────────────────
  mensagens: router({
    listar: protectedProcedure.query(async ({ ctx }) => listarMensagens(ctx.user.id)),
    enviar: protectedProcedure
      .input(z.object({
        destinatarioId: z.number().optional(),
        conteudo: z.string(),
        tipo: z.enum(["interno","cliente","notificacao"]).optional(),
        processoId: z.number().optional(),
        clienteId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await criarMensagem({ ...input, remetenteId: ctx.user.id });
        return { success: true };
      }),
  }),

  // ─── NOTIFICAÇÕES ──────────────────────────────────────────────────────────
  notificacoes: router({
    listar: protectedProcedure.query(async ({ ctx }) => listarNotificacoes(ctx.user.id)),
    marcarLida: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await marcarNotificacaoLida(input.id);
        return { success: true };
      }),
  }),

  // ─── FUNCIONÁRIOS ──────────────────────────────────────────────────────────
  funcionarios: router({
    listar: protectedProcedure.query(async () => listarFuncionarios()),
    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        cargo: z.string().optional(),
        telefone: z.string().optional(),
        oab: z.string().optional(),
        role: z.enum(["admin","socio","advogado","estagiario","financeiro","rh","cliente","user"]).optional(),
        ativo: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const { id, ...data } = input;
        await db.update(users).set(data).where(eq(users.id, id));
        return { success: true };
      }),
  }),

  // ─── PONTO ELETRÔNICO ──────────────────────────────────────────────────────
  ponto: router({
    hoje: protectedProcedure.query(async ({ ctx }) => getPontoHoje(ctx.user.id)),
    registrar: protectedProcedure
      .input(z.object({
        tipo: z.enum(["entrada", "inicio_intervalo", "fim_intervalo", "saida"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const agora = new Date();
        const hoje = agora.toISOString().split("T")[0];
        const pontoAtual = await getPontoHoje(ctx.user.id);
        const update: Record<string, unknown> = { usuarioId: ctx.user.id, data: hoje };
        if (input.tipo === "entrada") update.entrada = agora;
        if (input.tipo === "inicio_intervalo") update.inicioIntervalo = agora;
        if (input.tipo === "fim_intervalo") update.fimIntervalo = agora;
        if (input.tipo === "saida") update.saida = agora;
        if (pontoAtual) {
          const db = await getDb();
          if (db) {
            const { pontos } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            await db.update(pontos).set(update).where(eq(pontos.id, pontoAtual.id));
          }
        } else {
          await upsertPonto(update as any);
        }
        return { success: true };
      }),
  }),

  // ─── NEX AI ────────────────────────────────────────────────────────────────
  nexAi: router({
    chat: protectedProcedure
      .input(z.object({
        mensagem: z.string(),
        contexto: z.string().optional(),
        historico: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `Você é a Nex AI, assistente jurídica inteligente integrada ao sistema Gestão Jurídica Nex. 
Você auxilia advogados e escritórios de advocacia com:
- Pesquisa de jurisprudência e legislação brasileira
- Análise de documentos jurídicos
- Sugestões de peças processuais (petições, recursos, contratos, procurações, pareceres)
- Análise de riscos processuais
- Identificação de prazos críticos
- Orientações sobre procedimentos jurídicos

Responda sempre em português brasileiro, de forma profissional, clara e objetiva.
${input.contexto ? `\nContexto adicional: ${input.contexto}` : ""}`;

        const messages = [
          ...(input.historico || []),
          { role: "user" as const, content: input.mensagem },
        ];

        const result = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        });
        const resposta = result.choices[0]?.message?.content ?? "Desculpe, não consegui processar sua solicitação.";
        return { resposta };
      }),
  }),
});

export type AppRouter = typeof appRouter;
