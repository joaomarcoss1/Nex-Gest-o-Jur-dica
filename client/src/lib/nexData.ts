import { useEffect, useMemo, useState } from "react";

export type Setor = "Advocacia" | "Administrativo" | "Financeiro" | "Atendimento" | "Estagiários" | "RH" | "Sócios" | "Operacional";
export type Cargo = "Sócio" | "Advogado" | "Advogado auxiliar" | "Estagiário" | "Secretário" | "Financeiro" | "RH" | "Atendente" | "Operacional";
export type PontoTipo = "entrada" | "saida_intervalo" | "retorno_intervalo" | "saida";
export type TarefaStatus = "Pendente" | "Em andamento" | "Aguardando cliente" | "Aguardando tribunal" | "Concluída" | "Atrasada" | "Cancelada";
export type Prioridade = "Baixa" | "Média" | "Alta" | "Crítica";
export type DocumentoStatus = "Recebido" | "Em análise" | "Pendente correção" | "Aprovado" | "Protocolado" | "Arquivado";
export type OrigemDocumento = "Câmera" | "Upload" | "Editor";
export type TipoPessoaAssinatura = "funcionario" | "advogado" | "cliente" | "socio";

export type Funcionario = {
  id: string;
  nome: string;
  cargo: Cargo;
  setor: Setor;
  email: string;
  telefone: string;
  oab?: string;
  salarioBase: number;
  valorHora: number;
  jornada: string;
  tipoVinculo: "CLT" | "Contrato" | "Associado" | "Estágio" | "Sócio";
  status: "Ativo" | "Férias" | "Licença" | "Inativo";
  avatar: string;
};

export type PontoRegistro = {
  id: string;
  funcionarioId: string;
  setor: Setor;
  tipo: PontoTipo;
  data: string;
  hora: string;
  localizacao: string;
  justificativa?: string;
  observacao?: string;
};

export type ProcessoDemo = {
  id: string;
  numero: string;
  cliente: string;
  area: string;
  tribunal: string;
  status: "Em análise" | "Em andamento" | "Audiência" | "Recurso" | "Cumprimento" | "Encerrado";
  valorCausa: number;
  responsaveis: string[];
  prazoCritico: string;
  progresso: number;
};

export type TarefaProcesso = {
  id: string;
  processoId: string;
  titulo: string;
  responsavelId: string;
  prioridade: Prioridade;
  status: TarefaStatus;
  prazo: string;
  tempoEstimado: number;
  tempoGasto: number;
  observacoes: string;
};

export type DocumentoCliente = {
  id: string;
  processoId: string;
  cliente: string;
  tipo: string;
  nome: string;
  status: DocumentoStatus;
  dataEnvio: string;
  origem: OrigemDocumento;
  preview?: string;
  protocolo?: string;
  descricao?: string;
  qualidade?: number;
  editadoPor?: string;
  ultimaEdicao?: string;
  observacaoInterna?: string;
  assinaturasIds?: string[];
  hash?: string;
};

export type AssinaturaDigital = {
  id: string;
  pessoaTipo: TipoPessoaAssinatura;
  pessoaId: string;
  nome: string;
  papel: string;
  assinaturaDataUrl: string;
  hash: string;
  dataAssinatura: string;
  ipSimulado: string;
  status: "Válida" | "Revogada";
  documentoId?: string;
};

export type FolhaItem = {
  id: string;
  funcionarioId: string;
  competencia: string;
  salarioBase: number;
  diasTrabalhados: number;
  faltas: number;
  atrasosHoras: number;
  horasExtras: number;
  descontos: number;
  bonificacoes: number;
  liquido: number;
};

export type NexState = {
  funcionarios: Funcionario[];
  pontos: PontoRegistro[];
  processos: ProcessoDemo[];
  tarefas: TarefaProcesso[];
  documentos: DocumentoCliente[];
  folhas: FolhaItem[];
  assinaturas: AssinaturaDigital[];
};

const KEY = "gestao-juridica-nex-demo-v3";

export const setores: Setor[] = ["Advocacia", "Administrativo", "Financeiro", "Atendimento", "Estagiários", "RH", "Sócios", "Operacional"];
export const cargos: Cargo[] = ["Sócio", "Advogado", "Advogado auxiliar", "Estagiário", "Secretário", "Financeiro", "RH", "Atendente", "Operacional"];

const hoje = new Date();
const isoToday = hoje.toISOString().slice(0, 10);
const isoTomorrow = new Date(hoje.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const isoWeek = new Date(hoje.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return `NX-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}-${Date.now().toString(36).toUpperCase()}`;
}

export const initialNexState: NexState = {
  funcionarios: [
    { id: "f1", nome: "Dra. Helena Costa", cargo: "Sócio", setor: "Sócios", email: "helena@escritorio.com", telefone: "(98) 98888-1001", oab: "MA 11223", salarioBase: 9800, valorHora: 95, jornada: "09h às 18h", tipoVinculo: "Sócio", status: "Ativo", avatar: "HC" },
    { id: "f2", nome: "Dr. Marcos Vinícius", cargo: "Advogado", setor: "Advocacia", email: "marcos@escritorio.com", telefone: "(98) 98888-1002", oab: "MA 22456", salarioBase: 7200, valorHora: 70, jornada: "08h às 17h", tipoVinculo: "CLT", status: "Ativo", avatar: "MV" },
    { id: "f3", nome: "Larissa Almeida", cargo: "Secretário", setor: "Administrativo", email: "secretaria@escritorio.com", telefone: "(98) 98888-1003", salarioBase: 2600, valorHora: 18, jornada: "08h às 12h / 14h às 18h", tipoVinculo: "CLT", status: "Ativo", avatar: "LA" },
    { id: "f4", nome: "João Pedro Sousa", cargo: "Estagiário", setor: "Estagiários", email: "estagio@escritorio.com", telefone: "(98) 98888-1004", salarioBase: 1200, valorHora: 10, jornada: "13h às 18h", tipoVinculo: "Estágio", status: "Ativo", avatar: "JP" },
    { id: "f5", nome: "Camila Rocha", cargo: "Financeiro", setor: "Financeiro", email: "financeiro@escritorio.com", telefone: "(98) 98888-1005", salarioBase: 3200, valorHora: 22, jornada: "09h às 18h", tipoVinculo: "CLT", status: "Ativo", avatar: "CR" },
  ],
  pontos: [
    { id: "p1", funcionarioId: "f1", setor: "Sócios", tipo: "entrada", data: isoToday, hora: "08:54", localizacao: "Escritório matriz" },
    { id: "p2", funcionarioId: "f2", setor: "Advocacia", tipo: "entrada", data: isoToday, hora: "08:07", localizacao: "Escritório matriz" },
    { id: "p3", funcionarioId: "f3", setor: "Administrativo", tipo: "entrada", data: isoToday, hora: "08:42", localizacao: "Escritório matriz", justificativa: "Trânsito intenso" },
    { id: "p4", funcionarioId: "f4", setor: "Estagiários", tipo: "entrada", data: isoToday, hora: "13:01", localizacao: "Escritório matriz" },
  ],
  processos: [
    { id: "pr1", numero: "0801234-56.2026.8.10.0034", cliente: "Maria das Dores", area: "Cível", tribunal: "TJMA - 2ª Vara", status: "Em andamento", valorCausa: 45000, responsaveis: ["f1", "f4"], prazoCritico: isoTomorrow, progresso: 68 },
    { id: "pr2", numero: "0004321-88.2026.5.16.0001", cliente: "Construtora Alfa Ltda", area: "Trabalhista", tribunal: "TRT 16ª Região", status: "Audiência", valorCausa: 128000, responsaveis: ["f2", "f5"], prazoCritico: isoWeek, progresso: 44 },
    { id: "pr3", numero: "5009876-12.2026.4.01.3700", cliente: "Raimundo Silva", area: "Previdenciário", tribunal: "JFMA", status: "Em análise", valorCausa: 72000, responsaveis: ["f2", "f3"], prazoCritico: isoWeek, progresso: 22 },
  ],
  tarefas: [
    { id: "t1", processoId: "pr1", titulo: "Conferir documentos digitalizados", responsavelId: "f4", prioridade: "Alta", status: "Em andamento", prazo: isoTomorrow, tempoEstimado: 2, tempoGasto: 1.2, observacoes: "Cliente enviou RG e comprovante." },
    { id: "t2", processoId: "pr1", titulo: "Elaborar petição inicial complementar", responsavelId: "f1", prioridade: "Crítica", status: "Pendente", prazo: isoTomorrow, tempoEstimado: 5, tempoGasto: 0, observacoes: "Aguardar validação do contrato." },
    { id: "t3", processoId: "pr2", titulo: "Preparar pauta da audiência", responsavelId: "f2", prioridade: "Alta", status: "Concluída", prazo: isoToday, tempoEstimado: 3, tempoGasto: 2.6, observacoes: "Checklist concluído." },
    { id: "t4", processoId: "pr3", titulo: "Solicitar extrato CNIS ao cliente", responsavelId: "f3", prioridade: "Média", status: "Aguardando cliente", prazo: isoWeek, tempoEstimado: 1, tempoGasto: 0.4, observacoes: "Mensagem enviada pelo portal." },
  ],
  documentos: [
    { id: "d1", processoId: "pr1", cliente: "Maria das Dores", tipo: "RG", nome: "RG - Maria das Dores.pdf", status: "Recebido", dataEnvio: isoToday, origem: "Câmera", qualidade: 94, descricao: "Documento capturado pelo portal do cliente.", hash: "NX-7F91A21C-DEMO" },
    { id: "d2", processoId: "pr2", cliente: "Construtora Alfa Ltda", tipo: "Contrato", nome: "Contrato de prestação de serviço.pdf", status: "Em análise", dataEnvio: isoToday, origem: "Upload", qualidade: 88, descricao: "Contrato aguardando conferência do advogado.", hash: "NX-1AA2C91D-DEMO" },
  ],
  folhas: [],
  assinaturas: [],
};

let sharedState: NexState | null = null;
const subscribers = new Set<(state: NexState) => void>();

function normalizeState(parsed: Partial<NexState> | null | undefined): NexState {
  if (!parsed) return initialNexState;
  return {
    funcionarios: parsed.funcionarios?.length ? parsed.funcionarios : initialNexState.funcionarios,
    pontos: parsed.pontos?.length ? parsed.pontos : initialNexState.pontos,
    processos: parsed.processos?.length ? parsed.processos : initialNexState.processos,
    tarefas: parsed.tarefas?.length ? parsed.tarefas : initialNexState.tarefas,
    documentos: parsed.documentos?.length ? parsed.documentos.map((d) => ({ qualidade: d.qualidade ?? 90, hash: d.hash ?? hashString(`${d.nome}-${d.dataEnvio}`), ...d })) : initialNexState.documentos,
    folhas: parsed.folhas ?? [],
    assinaturas: parsed.assinaturas ?? [],
  };
}

function getSharedState() {
  if (!sharedState) sharedState = readState();
  return sharedState;
}

function setSharedState(updater: NexState | ((state: NexState) => NexState)) {
  const next = typeof updater === "function" ? (updater as (state: NexState) => NexState)(getSharedState()) : updater;
  sharedState = next;
  persist(next);
  subscribers.forEach((listener) => listener(next));
}

function readState(): NexState {
  if (typeof window === "undefined") return initialNexState;
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem("gestao-juridica-nex-demo-v2");
    if (!raw) return initialNexState;
    return normalizeState(JSON.parse(raw) as Partial<NexState>);
  } catch {
    return initialNexState;
  }
}

function persist(state: NexState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

function currency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function getNomeFuncionario(state: NexState, id: string) {
  return state.funcionarios.find((f) => f.id === id)?.nome ?? "Não informado";
}

export function useNexData() {
  const [state, setState] = useState<NexState>(() => getSharedState());

  useEffect(() => {
    const listener = (next: NexState) => setState(next);
    subscribers.add(listener);
    return () => { subscribers.delete(listener); };
  }, []);

  const actions = useMemo(() => ({
    resetarDemo: () => setSharedState(initialNexState),
    adicionarFuncionario: (data: Omit<Funcionario, "id" | "avatar">) => {
      const avatar = data.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
      setSharedState((s) => ({ ...s, funcionarios: [{ ...data, id: uid("func"), avatar }, ...s.funcionarios] }));
    },
    registrarPonto: (funcionarioId: string, tipo: PontoTipo, justificativa?: string, observacao?: string) => {
      setSharedState((s) => {
        const funcionario = s.funcionarios.find((f) => f.id === funcionarioId);
        if (!funcionario) return s;
        const now = new Date();
        const registro: PontoRegistro = {
          id: uid("ponto"),
          funcionarioId,
          setor: funcionario.setor,
          tipo,
          data: now.toISOString().slice(0, 10),
          hora: now.toTimeString().slice(0, 5),
          localizacao: "Escritório matriz / registro web",
          justificativa: justificativa || undefined,
          observacao: observacao || undefined,
        };
        return { ...s, pontos: [registro, ...s.pontos] };
      });
    },
    gerarFolha: (competencia: string) => {
      setSharedState((s) => {
        const folhas: FolhaItem[] = s.funcionarios.filter((f) => f.status !== "Inativo").map((f) => {
          const pontosMes = s.pontos.filter((p) => p.funcionarioId === f.id && p.data.startsWith(competencia));
          const diasComEntrada = new Set(pontosMes.filter((p) => p.tipo === "entrada").map((p) => p.data)).size;
          const atrasos = pontosMes.filter((p) => p.justificativa).length;
          const faltas = Math.max(0, 22 - Math.max(diasComEntrada, 18));
          const horasExtras = Math.max(0, diasComEntrada - 22) * 1.5;
          const descontos = faltas * (f.salarioBase / 22) + atrasos * (f.valorHora * 0.5);
          const bonificacoes = horasExtras * f.valorHora * 1.5;
          const liquido = Math.max(0, f.salarioBase - descontos + bonificacoes);
          return {
            id: `${competencia}_${f.id}`,
            funcionarioId: f.id,
            competencia,
            salarioBase: f.salarioBase,
            diasTrabalhados: diasComEntrada || 22 - faltas,
            faltas,
            atrasosHoras: atrasos * 0.5,
            horasExtras,
            descontos: Number(descontos.toFixed(2)),
            bonificacoes: Number(bonificacoes.toFixed(2)),
            liquido: Number(liquido.toFixed(2)),
          };
        });
        const semCompetencia = s.folhas.filter((f) => f.competencia !== competencia);
        return { ...s, folhas: [...folhas, ...semCompetencia] };
      });
    },
    adicionarDocumento: (documento: Omit<DocumentoCliente, "id" | "dataEnvio" | "status" | "hash">) => {
      const id = uid("doc");
      setSharedState((s) => ({
        ...s,
        documentos: [{ ...documento, id, dataEnvio: new Date().toISOString().slice(0, 10), status: "Recebido", qualidade: documento.qualidade ?? 92, hash: hashString(`${documento.nome}-${documento.cliente}`), assinaturasIds: documento.assinaturasIds ?? [] }, ...s.documentos],
      }));
      return id;
    },
    atualizarDocumento: (id: string, data: Partial<DocumentoCliente>) => {
      setSharedState((s) => ({ ...s, documentos: s.documentos.map((d) => d.id === id ? { ...d, ...data, ultimaEdicao: new Date().toISOString() } : d) }));
    },
    protocolarDocumento: (id: string, protocolo: string) => {
      setSharedState((s) => ({ ...s, documentos: s.documentos.map((d) => d.id === id ? { ...d, protocolo, status: "Protocolado", ultimaEdicao: new Date().toISOString() } : d) }));
    },
    salvarAssinatura: (data: Omit<AssinaturaDigital, "id" | "hash" | "dataAssinatura" | "ipSimulado" | "status">) => {
      const assinatura: AssinaturaDigital = {
        ...data,
        id: uid("ass"),
        hash: hashString(`${data.nome}-${data.papel}-${data.assinaturaDataUrl.slice(0, 64)}`),
        dataAssinatura: new Date().toISOString(),
        ipSimulado: "registro-local-demo",
        status: "Válida",
      };
      setSharedState((s) => {
        const docs = assinatura.documentoId
          ? s.documentos.map((d) => d.id === assinatura.documentoId ? { ...d, assinaturasIds: Array.from(new Set([...(d.assinaturasIds ?? []), assinatura.id])) } : d)
          : s.documentos;
        return { ...s, assinaturas: [assinatura, ...s.assinaturas], documentos: docs };
      });
      return assinatura;
    },
    revogarAssinatura: (id: string) => {
      setSharedState((s) => ({ ...s, assinaturas: s.assinaturas.map((a) => a.id === id ? { ...a, status: "Revogada" } : a) }));
    },
    atualizarTarefa: (id: string, data: Partial<TarefaProcesso>) => {
      setSharedState((s) => ({ ...s, tarefas: s.tarefas.map((t) => t.id === id ? { ...t, ...data } : t) }));
    },
    adicionarTarefa: (data: Omit<TarefaProcesso, "id">) => {
      setSharedState((s) => ({ ...s, tarefas: [{ ...data, id: uid("tar") }, ...s.tarefas] }));
    },
  }), []);

  const indicadores = useMemo(() => {
    const hojeIso = new Date().toISOString().slice(0, 10);
    const entradasHoje = new Set(state.pontos.filter((p) => p.data === hojeIso && p.tipo === "entrada").map((p) => p.funcionarioId));
    const presentes = state.funcionarios.filter((f) => entradasHoje.has(f.id)).length;
    const ausentes = state.funcionarios.filter((f) => f.status === "Ativo" && !entradasHoje.has(f.id)).length;
    const receitaPrevista = state.processos.reduce((acc, p) => acc + p.valorCausa * 0.12, 0);
    const tarefasConcluidas = state.tarefas.filter((t) => t.status === "Concluída").length;
    const tarefasAtrasadas = state.tarefas.filter((t) => t.status === "Atrasada" || (t.status !== "Concluída" && t.prazo < hojeIso)).length;
    const documentosPendentes = state.documentos.filter((d) => d.status === "Recebido" || d.status === "Em análise").length;
    const assinaturasValidas = state.assinaturas.filter((a) => a.status === "Válida").length;
    const docsProtocolados = state.documentos.filter((d) => d.status === "Protocolado").length;
    return {
      presentes,
      ausentes,
      receitaPrevista,
      tarefasConcluidas,
      tarefasAtrasadas,
      documentosPendentes,
      processosAtivos: state.processos.filter((p) => p.status !== "Encerrado").length,
      clientesAtivos: new Set(state.processos.map((p) => p.cliente)).size,
      assinaturasValidas,
      docsProtocolados,
    };
  }, [state]);

  return { state, ...actions, indicadores, getNomeFuncionario: (id: string) => getNomeFuncionario(state, id) };
}

export function formatCurrency(value: number) {
  return currency(value);
}

export function calcularQualidadeDocumento(dataUrl?: string) {
  if (!dataUrl) return 82;
  const base = Math.min(98, Math.max(72, Math.round(dataUrl.length / 12000)) + 74);
  return base;
}

function buildCorporateHtml(title: string, subtitle: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title><style>
  body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#111827;background:#f4f7fb} .page{max-width:1040px;margin:24px auto;background:white;border:1px solid #dce4f2;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(15,111,255,.12)}
  .header{background:linear-gradient(135deg,#061020 0%,#0F6FFF 62%,#F5B400 100%);color:white;padding:28px 34px;display:flex;justify-content:space-between;align-items:center}.brand{font-size:24px;font-weight:800}.brand span{color:#F5B400}.sub{font-size:13px;opacity:.9;margin-top:4px}.meta{text-align:right;font-size:12px;opacity:.9}
  .content{padding:28px 34px}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}.card{border:1px solid #e7edf7;border-radius:14px;padding:14px;background:#fbfdff}.card b{display:block;font-size:20px;color:#0F6FFF;margin-top:4px}.card small{color:#64748b} h2{font-size:17px;margin:22px 0 10px;color:#0B1F3A} table{width:100%;border-collapse:collapse;font-size:12px}th{background:#0B1F3A;color:white;text-align:left;padding:10px}td{border-bottom:1px solid #edf2f7;padding:10px}tr:nth-child(even)td{background:#f8fafc}.footer{border-top:1px solid #e7edf7;padding:14px 34px;font-size:11px;color:#64748b;display:flex;justify-content:space-between}.gold{color:#F5B400;font-weight:700}.signature{border:1px solid #dce4f2;border-radius:14px;padding:12px;margin-top:12px;background:#fbfdff}
  @media print{body{background:white}.page{box-shadow:none;margin:0;border-radius:0;max-width:none}.no-print{display:none}}
  </style></head><body><div class="page"><div class="header"><div><div class="brand">Gestão Jurídica <span>Nex</span></div><div class="sub">${subtitle}</div></div><div class="meta">Emitido em<br/><strong>${new Date().toLocaleString("pt-BR")}</strong></div></div><div class="content">${body}</div><div class="footer"><span>Documento corporativo gerado pelo Gestão Jurídica Nex</span><span>Desenvolvido por <b>NexLabs</b></span></div></div><script>window.onload=()=>setTimeout(()=>window.print(),400)</script></body></html>`;
}

export function exportarPdfCorporativo(title: string, subtitle: string, body: string) {
  const html = buildCorporateHtml(title, subtitle, body);
  const win = window.open("", "_blank");
  if (!win) {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    downloadBlob(blob, `${title.toLowerCase().replace(/\s+/g, "-")}.html`);
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

export function exportarExcelHtml(filename: string, tableHtml: string) {
  const html = `<html><head><meta charset="utf-8"/></head><body>${tableHtml}</body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  downloadBlob(blob, `${filename}.xls`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function folhaTableHtml(state: NexState, competencia: string) {
  const rows = state.folhas.filter((f) => f.competencia === competencia);
  const total = rows.reduce((acc, f) => acc + f.liquido, 0);
  return `<div class="cards"><div class="card"><small>Competência</small><b>${competencia}</b></div><div class="card"><small>Colaboradores</small><b>${rows.length}</b></div><div class="card"><small>Total líquido</small><b>${currency(total)}</b></div><div class="card"><small>Status</small><b>Gerada</b></div></div><h2>Folha de pagamento</h2><table><thead><tr><th>Funcionário</th><th>Salário</th><th>Dias</th><th>Faltas</th><th>Atrasos</th><th>Extras</th><th>Descontos</th><th>Bonificações</th><th>Líquido</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${getNomeFuncionario(state, r.funcionarioId)}</td><td>${currency(r.salarioBase)}</td><td>${r.diasTrabalhados}</td><td>${r.faltas}</td><td>${r.atrasosHoras}h</td><td>${r.horasExtras}h</td><td>${currency(r.descontos)}</td><td>${currency(r.bonificacoes)}</td><td><b>${currency(r.liquido)}</b></td></tr>`).join("")}</tbody></table>`;
}

export function desempenhoTableHtml(state: NexState) {
  const rows = state.funcionarios.map((f) => {
    const tarefas = state.tarefas.filter((t) => t.responsavelId === f.id);
    const concluidas = tarefas.filter((t) => t.status === "Concluída").length;
    const atrasadas = tarefas.filter((t) => t.status === "Atrasada" || (t.status !== "Concluída" && t.prazo < new Date().toISOString().slice(0, 10))).length;
    const tempo = tarefas.reduce((acc, t) => acc + t.tempoGasto, 0);
    const score = tarefas.length ? Math.max(0, Math.round((concluidas / tarefas.length) * 100 - atrasadas * 8)) : 0;
    return { f, total: tarefas.length, concluidas, atrasadas, tempo, score };
  }).sort((a, b) => b.score - a.score);
  return `<div class="cards"><div class="card"><small>Equipe</small><b>${state.funcionarios.length}</b></div><div class="card"><small>Tarefas</small><b>${state.tarefas.length}</b></div><div class="card"><small>Concluídas</small><b>${state.tarefas.filter((t) => t.status === "Concluída").length}</b></div><div class="card"><small>Atrasadas</small><b>${state.tarefas.filter((t) => t.status === "Atrasada").length}</b></div></div><h2>Desempenho por funcionário</h2><table><thead><tr><th>Funcionário</th><th>Setor</th><th>Cargo</th><th>Tarefas</th><th>Concluídas</th><th>Atrasadas</th><th>Tempo gasto</th><th>Score</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r.f.nome}</td><td>${r.f.setor}</td><td>${r.f.cargo}</td><td>${r.total}</td><td>${r.concluidas}</td><td>${r.atrasadas}</td><td>${r.tempo.toFixed(1)}h</td><td><b>${r.score}%</b></td></tr>`).join("")}</tbody></table>`;
}

export function documentosTableHtml(state: NexState) {
  return `<div class="cards"><div class="card"><small>Documentos</small><b>${state.documentos.length}</b></div><div class="card"><small>Protocolados</small><b>${state.documentos.filter((d) => d.status === "Protocolado").length}</b></div><div class="card"><small>Assinados</small><b>${state.documentos.filter((d) => (d.assinaturasIds ?? []).length > 0).length}</b></div><div class="card"><small>Pendentes</small><b>${state.documentos.filter((d) => ["Recebido", "Em análise", "Pendente correção"].includes(d.status)).length}</b></div></div><h2>Documentos e protocolos</h2><table><thead><tr><th>Documento</th><th>Cliente</th><th>Processo</th><th>Status</th><th>Qualidade</th><th>Protocolo</th><th>Assinaturas</th><th>Hash</th></tr></thead><tbody>${state.documentos.map((d) => `<tr><td>${d.nome}</td><td>${d.cliente}</td><td>${state.processos.find((p) => p.id === d.processoId)?.numero ?? "-"}</td><td>${d.status}</td><td>${d.qualidade ?? 0}%</td><td>${d.protocolo ?? "-"}</td><td>${(d.assinaturasIds ?? []).length}</td><td>${d.hash ?? "-"}</td></tr>`).join("")}</tbody></table>`;
}

export function assinaturasTableHtml(state: NexState) {
  return `<div class="cards"><div class="card"><small>Assinaturas</small><b>${state.assinaturas.length}</b></div><div class="card"><small>Válidas</small><b>${state.assinaturas.filter((a) => a.status === "Válida").length}</b></div><div class="card"><small>Funcionários</small><b>${state.assinaturas.filter((a) => a.pessoaTipo === "funcionario" || a.pessoaTipo === "advogado" || a.pessoaTipo === "socio").length}</b></div><div class="card"><small>Clientes</small><b>${state.assinaturas.filter((a) => a.pessoaTipo === "cliente").length}</b></div></div><h2>Validação de assinaturas digitais</h2><table><thead><tr><th>Nome</th><th>Papel</th><th>Tipo</th><th>Data</th><th>Status</th><th>Documento</th><th>Hash</th></tr></thead><tbody>${state.assinaturas.map((a) => `<tr><td>${a.nome}</td><td>${a.papel}</td><td>${a.pessoaTipo}</td><td>${new Date(a.dataAssinatura).toLocaleString("pt-BR")}</td><td>${a.status}</td><td>${state.documentos.find((d) => d.id === a.documentoId)?.nome ?? "Assinatura de perfil"}</td><td>${a.hash}</td></tr>`).join("")}</tbody></table>`;
}
