import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import SignaturePad from "@/components/SignaturePad";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Plus,
  Users,
  UserCheck,
  Mail,
  Phone,
  Clock,
  DollarSign,
  Search,
  Timer,
  FileSpreadsheet,
  FileText,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Building2,
  BriefcaseBusiness,
  PenLine,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  cargos,
  desempenhoTableHtml,
  exportarExcelHtml,
  exportarPdfCorporativo,
  folhaTableHtml,
  formatCurrency,
  setores,
  type Cargo,
  type Funcionario,
  type PontoTipo,
  type Setor,
  assinaturasTableHtml,
  useNexData,
} from "@/lib/nexData";

const pontoLabel: Record<PontoTipo, string> = {
  entrada: "Entrada",
  saida_intervalo: "Saída intervalo",
  retorno_intervalo: "Retorno intervalo",
  saida: "Saída final",
};

const statusColor: Record<Funcionario["status"], string> = {
  Ativo: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Férias: "bg-blue-100 text-blue-700 border-blue-200",
  Licença: "bg-amber-100 text-amber-700 border-amber-200",
  Inativo: "bg-slate-100 text-slate-600 border-slate-200",
};

function FuncionarioCard({ funcionario }: { funcionario: Funcionario }) {
  return (
    <Card className="premium-card card-hover">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl nex-gradient flex items-center justify-center flex-shrink-0 text-white font-black shadow-lg">{funcionario.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black truncate">{funcionario.nome}</h3>
              <Badge variant="outline" className={cn("text-[10px]", statusColor[funcionario.status])}>{funcionario.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{funcionario.cargo} · {funcionario.setor}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{funcionario.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{funcionario.telefone}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="rounded-xl bg-muted/60 p-2"><p className="text-[10px] text-muted-foreground">Salário</p><p className="font-bold text-sm">{formatCurrency(funcionario.salarioBase)}</p></div>
              <div className="rounded-xl bg-muted/60 p-2"><p className="text-[10px] text-muted-foreground">Jornada</p><p className="font-bold text-sm truncate">{funcionario.jornada}</p></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NovoFuncionarioDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { adicionarFuncionario } = useNexData();
  const [form, setForm] = useState({
    nome: "",
    cargo: "Advogado" as Cargo,
    setor: "Advocacia" as Setor,
    email: "",
    telefone: "",
    oab: "",
    salarioBase: "3500",
    valorHora: "25",
    jornada: "09h às 18h",
    tipoVinculo: "CLT" as Funcionario["tipoVinculo"],
    status: "Ativo" as Funcionario["status"],
  });

  const salvar = () => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do funcionário.");
      return;
    }
    adicionarFuncionario({
      ...form,
      salarioBase: Number(form.salarioBase || 0),
      valorHora: Number(form.valorHora || 0),
      oab: form.oab || undefined,
    });
    toast.success("Funcionário cadastrado no setor selecionado.");
    onClose();
    setForm((s) => ({ ...s, nome: "", email: "", telefone: "", oab: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Novo funcionário</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2"><Label>Nome completo *</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
          <div><Label>Cargo</Label><Select value={form.cargo} onValueChange={(v) => setForm({ ...form, cargo: v as Cargo })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{cargos.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Setor</Label><Select value={form.setor} onValueChange={(v) => setForm({ ...form, setor: v as Setor })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{setores.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>E-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Telefone</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
          <div><Label>OAB</Label><Input value={form.oab} onChange={(e) => setForm({ ...form, oab: e.target.value })} placeholder="Opcional" /></div>
          <div><Label>Jornada</Label><Input value={form.jornada} onChange={(e) => setForm({ ...form, jornada: e.target.value })} /></div>
          <div><Label>Salário base</Label><Input type="number" value={form.salarioBase} onChange={(e) => setForm({ ...form, salarioBase: e.target.value })} /></div>
          <div><Label>Valor por hora</Label><Input type="number" value={form.valorHora} onChange={(e) => setForm({ ...form, valorHora: e.target.value })} /></div>
          <div><Label>Vínculo</Label><Select value={form.tipoVinculo} onValueChange={(v) => setForm({ ...form, tipoVinculo: v as Funcionario["tipoVinculo"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["CLT", "Contrato", "Associado", "Estágio", "Sócio"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Funcionario["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Ativo", "Férias", "Licença", "Inativo"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={salvar} className="nex-gradient-premium text-white">Salvar funcionário</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PontoPanel() {
  const { state, registrarPonto } = useNexData();
  const [funcionarioId, setFuncionarioId] = useState(state.funcionarios[0]?.id ?? "");
  const [tipo, setTipo] = useState<PontoTipo>("entrada");
  const [justificativa, setJustificativa] = useState("");
  const [observacao, setObservacao] = useState("");
  const hoje = new Date().toISOString().slice(0, 10);
  const pontosHoje = state.pontos.filter((p) => p.data === hoje);

  const bater = () => {
    if (!funcionarioId) return;
    registrarPonto(funcionarioId, tipo, justificativa, observacao);
    toast.success(`${pontoLabel[tipo]} registrada com sucesso.`);
    setJustificativa("");
    setObservacao("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <Card className="premium-card xl:col-span-1">
        <CardHeader><CardTitle className="text-base font-black flex items-center gap-2"><Timer className="w-5 h-5 text-primary" /> Registro de ponto</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Funcionário</Label><Select value={funcionarioId} onValueChange={setFuncionarioId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{state.funcionarios.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome} · {f.setor}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Tipo de registro</Label><Select value={tipo} onValueChange={(v) => setTipo(v as PontoTipo)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(pontoLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Justificativa de atraso ou ajuste</Label><Textarea value={justificativa} onChange={(e) => setJustificativa(e.target.value)} placeholder="Obrigatório se houver atraso acima da tolerância." /></div>
          <div><Label>Observação</Label><Input value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex.: audiência externa" /></div>
          <Button onClick={bater} className="w-full h-11 nex-gradient-premium text-white shadow-lg"><Clock className="w-4 h-4" /> Bater ponto agora</Button>
        </CardContent>
      </Card>

      <Card className="premium-card xl:col-span-2">
        <CardHeader><CardTitle className="text-base font-black">Painel do gestor · frequência de hoje</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="rounded-2xl border bg-emerald-50 p-3"><p className="text-xs text-emerald-700">Entradas</p><p className="text-xl font-black text-emerald-700">{pontosHoje.filter((p) => p.tipo === "entrada").length}</p></div>
            <div className="rounded-2xl border bg-amber-50 p-3"><p className="text-xs text-amber-700">Justificativas</p><p className="text-xl font-black text-amber-700">{pontosHoje.filter((p) => p.justificativa).length}</p></div>
            <div className="rounded-2xl border bg-blue-50 p-3"><p className="text-xs text-blue-700">Setores</p><p className="text-xl font-black text-blue-700">{new Set(pontosHoje.map((p) => p.setor)).size}</p></div>
            <div className="rounded-2xl border bg-slate-50 p-3"><p className="text-xs text-slate-700">Registros</p><p className="text-xl font-black text-slate-700">{pontosHoje.length}</p></div>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Hora</TableHead><TableHead>Funcionário</TableHead><TableHead>Setor</TableHead><TableHead>Registro</TableHead><TableHead>Justificativa</TableHead></TableRow></TableHeader>
            <TableBody>{pontosHoje.map((p) => {
              const f = state.funcionarios.find((func) => func.id === p.funcionarioId);
              return <TableRow key={p.id}><TableCell className="font-mono font-bold">{p.hora}</TableCell><TableCell>{f?.nome ?? "—"}</TableCell><TableCell>{p.setor}</TableCell><TableCell><Badge variant="outline">{pontoLabel[p.tipo]}</Badge></TableCell><TableCell className="max-w-[220px] truncate">{p.justificativa ?? "—"}</TableCell></TableRow>;
            })}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function FolhaPanel() {
  const { state, gerarFolha } = useNexData();
  const [competencia, setCompetencia] = useState(new Date().toISOString().slice(0, 7));
  const folhas = state.folhas.filter((f) => f.competencia === competencia);
  const total = folhas.reduce((acc, f) => acc + f.liquido, 0);
  const html = folhaTableHtml(state, competencia);

  const gerar = () => {
    gerarFolha(competencia);
    toast.success("Folha de pagamento gerada com cálculo de faltas, atrasos, extras e descontos.");
  };

  return (
    <Card className="premium-card">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div><CardTitle className="text-base font-black flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Folha de pagamento</CardTitle><p className="text-sm text-muted-foreground mt-1">Geração por competência com exportação corporativa.</p></div>
        <div className="flex flex-wrap gap-2"><Input type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)} className="w-40" /><Button onClick={gerar}>Gerar folha</Button><Button variant="outline" onClick={() => exportarPdfCorporativo("Folha de Pagamento", `Competência ${competencia}`, html)}><FileText className="w-4 h-4" /> PDF</Button><Button variant="outline" onClick={() => exportarExcelHtml(`folha-${competencia}`, html)}><FileSpreadsheet className="w-4 h-4" /> Excel</Button></div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4"><div className="rounded-2xl border bg-blue-50 p-4"><p className="text-xs text-blue-700">Competência</p><p className="font-black text-blue-800">{competencia}</p></div><div className="rounded-2xl border bg-amber-50 p-4"><p className="text-xs text-amber-700">Funcionários</p><p className="font-black text-amber-800">{folhas.length || state.funcionarios.length}</p></div><div className="rounded-2xl border bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Total líquido</p><p className="font-black text-emerald-800">{formatCurrency(total)}</p></div></div>
        <Table>
          <TableHeader><TableRow><TableHead>Funcionário</TableHead><TableHead>Salário</TableHead><TableHead>Dias</TableHead><TableHead>Faltas</TableHead><TableHead>Atrasos</TableHead><TableHead>Extras</TableHead><TableHead>Descontos</TableHead><TableHead>Líquido</TableHead></TableRow></TableHeader>
          <TableBody>{folhas.length ? folhas.map((f) => {
            const func = state.funcionarios.find((item) => item.id === f.funcionarioId);
            return <TableRow key={f.id}><TableCell className="font-semibold">{func?.nome}</TableCell><TableCell>{formatCurrency(f.salarioBase)}</TableCell><TableCell>{f.diasTrabalhados}</TableCell><TableCell>{f.faltas}</TableCell><TableCell>{f.atrasosHoras}h</TableCell><TableCell>{f.horasExtras}h</TableCell><TableCell>{formatCurrency(f.descontos)}</TableCell><TableCell className="font-black">{formatCurrency(f.liquido)}</TableCell></TableRow>;
          }) : <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Clique em “Gerar folha” para calcular a competência.</TableCell></TableRow>}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DesempenhoPanel() {
  const { state, getNomeFuncionario } = useNexData();
  const rows = useMemo(() => state.funcionarios.map((f) => {
    const tarefas = state.tarefas.filter((t) => t.responsavelId === f.id);
    const concluidas = tarefas.filter((t) => t.status === "Concluída").length;
    const atrasadas = tarefas.filter((t) => t.status === "Atrasada" || (t.status !== "Concluída" && t.prazo < new Date().toISOString().slice(0, 10))).length;
    const tempo = tarefas.reduce((acc, t) => acc + t.tempoGasto, 0);
    const score = tarefas.length ? Math.max(0, Math.round((concluidas / tarefas.length) * 100 - atrasadas * 8)) : 0;
    return { f, tarefas: tarefas.length, concluidas, atrasadas, tempo, score };
  }).sort((a, b) => b.score - a.score), [state]);

  const html = desempenhoTableHtml(state);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <Card className="premium-card xl:col-span-2">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"><CardTitle className="text-base font-black flex items-center gap-2"><Trophy className="w-5 h-5 text-[#F5B400]" /> Desempenho por funcionário e processo</CardTitle><div className="flex gap-2"><Button variant="outline" onClick={() => exportarPdfCorporativo("Relatório de Desempenho", "Equipe por processo, setor e produtividade", html)}><FileText className="w-4 h-4" /> PDF</Button><Button variant="outline" onClick={() => exportarExcelHtml("desempenho-equipe", html)}><FileSpreadsheet className="w-4 h-4" /> Excel</Button></div></CardHeader>
        <CardContent className="space-y-4">
          {rows.map((r, index) => <div key={r.f.id} className="rounded-2xl border bg-card/70 p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl nex-gradient flex items-center justify-center text-white font-black">{index + 1}</div><div><p className="font-black">{r.f.nome}</p><p className="text-xs text-muted-foreground">{r.f.setor} · {r.f.cargo} · {r.tempo.toFixed(1)}h registradas em tarefas</p></div></div><Badge className="bg-[#F5B400]/15 text-[#9b6e00] border-0">Score {r.score}%</Badge></div><div className="mt-3"><Progress value={r.score} className="h-2" /></div><div className="grid grid-cols-3 gap-2 mt-3 text-xs"><div className="rounded-xl bg-muted/60 p-2"><b>{r.tarefas}</b><br />tarefas</div><div className="rounded-xl bg-muted/60 p-2"><b>{r.concluidas}</b><br />concluídas</div><div className="rounded-xl bg-muted/60 p-2"><b>{r.atrasadas}</b><br />atrasadas</div></div></div>)}
        </CardContent>
      </Card>
      <Card className="premium-card">
        <CardHeader><CardTitle className="text-base font-black">Tarefas por processo</CardTitle></CardHeader>
        <CardContent className="space-y-3">{state.tarefas.map((t) => {
          const processo = state.processos.find((p) => p.id === t.processoId);
          return <div key={t.id} className="p-3 rounded-2xl border bg-card/70"><div className="flex items-center justify-between gap-2"><p className="font-bold text-sm truncate">{t.titulo}</p><Badge variant="outline" className="text-[10px]">{t.status}</Badge></div><p className="text-xs text-muted-foreground mt-1">{processo?.cliente} · {getNomeFuncionario(t.responsavelId)}</p><p className="text-xs text-muted-foreground">Estimado {t.tempoEstimado}h · Gasto {t.tempoGasto}h</p></div>;
        })}</CardContent>
      </Card>
    </div>
  );
}

function AssinaturasPanel() {
  const { state, salvarAssinatura } = useNexData();
  const [funcionarioId, setFuncionarioId] = useState(state.funcionarios[0]?.id ?? "");
  const funcionario = state.funcionarios.find((f) => f.id === funcionarioId);
  const html = assinaturasTableHtml(state);

  const salvar = (dataUrl: string) => {
    if (!funcionario) return toast.error("Selecione um funcionário ou advogado.");
    salvarAssinatura({
      pessoaTipo: funcionario.cargo === "Advogado" || funcionario.cargo === "Advogado auxiliar" ? "advogado" : funcionario.cargo === "Sócio" ? "socio" : "funcionario",
      pessoaId: funcionario.id,
      nome: funcionario.nome,
      papel: `${funcionario.cargo} · ${funcionario.setor}`,
      assinaturaDataUrl: dataUrl,
    });
    toast.success("Assinatura digital do colaborador salva com hash de validação.");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <Card className="premium-card xl:col-span-1">
        <CardHeader><CardTitle className="text-base font-black flex items-center gap-2"><PenLine className="w-5 h-5 text-primary" /> Cadastro de assinatura</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Funcionário/advogado</Label><Select value={funcionarioId} onValueChange={setFuncionarioId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{state.funcionarios.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome} · {f.cargo}</SelectItem>)}</SelectContent></Select></div>
          <div className="rounded-2xl border bg-blue-50 p-4 text-sm text-blue-800"><ShieldCheck className="w-5 h-5 mb-2" /><b>Validação:</b><br />cada assinatura recebe hash, data/hora, pessoa vinculada e pode ser anexada a documentos processuais.</div>
          <SignaturePad label="Assinatura digital do colaborador" onSave={salvar} height={170} />
        </CardContent>
      </Card>
      <Card className="premium-card xl:col-span-2">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"><CardTitle className="text-base font-black flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600" /> Assinaturas cadastradas</CardTitle><div className="flex gap-2"><Button variant="outline" onClick={() => exportarPdfCorporativo("Relatório de Assinaturas", "Validação eletrônica da equipe", html)}><FileText className="w-4 h-4" /> PDF</Button><Button variant="outline" onClick={() => exportarExcelHtml("assinaturas-equipe", html)}><FileSpreadsheet className="w-4 h-4" /> Excel</Button></div></CardHeader>
        <CardContent className="space-y-3">
          {state.assinaturas.filter((a) => a.pessoaTipo !== "cliente").length ? state.assinaturas.filter((a) => a.pessoaTipo !== "cliente").map((a) => <div key={a.id} className="rounded-2xl border bg-card/70 p-4"><div className="flex flex-col md:flex-row md:items-center justify-between gap-3"><div><p className="font-black">{a.nome}</p><p className="text-xs text-muted-foreground">{a.papel} · {new Date(a.dataAssinatura).toLocaleString("pt-BR")}</p><p className="text-[11px] text-muted-foreground break-all mt-1">Hash: {a.hash}</p></div><Badge className="bg-emerald-100 text-emerald-700 border-0">{a.status}</Badge></div><img src={a.assinaturaDataUrl} alt="Assinatura" className="mt-3 h-20 w-full object-contain bg-white rounded-xl border" /></div>) : <div className="text-center py-10 text-muted-foreground">Nenhuma assinatura de colaborador cadastrada ainda.</div>}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Funcionarios() {
  const [novoOpen, setNovoOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [setorFiltro, setSetorFiltro] = useState<string>("todos");
  const { state, indicadores } = useNexData();

  const filtrados = state.funcionarios.filter((f) => {
    const matchBusca = f.nome.toLowerCase().includes(busca.toLowerCase()) || f.cargo.toLowerCase().includes(busca.toLowerCase());
    const matchSetor = setorFiltro === "todos" || f.setor === setorFiltro;
    return matchBusca && matchSetor;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><Badge className="bg-primary/10 text-primary border-0 mb-2">Operação interna</Badge><h1 className="text-2xl lg:text-3xl font-black tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Funcionários, ponto e folha</h1><p className="text-sm text-muted-foreground mt-1">Controle de setores, jornada, folha de pagamento e desempenho em cada processo.</p></div>
        <Button onClick={() => setNovoOpen(true)} className="nex-gradient-premium text-white shadow-lg"><Plus className="w-4 h-4" /> Novo funcionário</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="premium-card"><CardContent className="p-4 flex items-center gap-3"><Users className="w-9 h-9 p-2 rounded-xl bg-blue-50 text-blue-600" /><div><p className="text-xs text-muted-foreground">Equipe ativa</p><p className="text-xl font-black">{state.funcionarios.filter((f) => f.status === "Ativo").length}</p></div></CardContent></Card>
        <Card className="premium-card"><CardContent className="p-4 flex items-center gap-3"><UserCheck className="w-9 h-9 p-2 rounded-xl bg-emerald-50 text-emerald-600" /><div><p className="text-xs text-muted-foreground">Presentes hoje</p><p className="text-xl font-black">{indicadores.presentes}</p></div></CardContent></Card>
        <Card className="premium-card"><CardContent className="p-4 flex items-center gap-3"><Building2 className="w-9 h-9 p-2 rounded-xl bg-amber-50 text-amber-600" /><div><p className="text-xs text-muted-foreground">Setores</p><p className="text-xl font-black">{setores.length}</p></div></CardContent></Card>
        <Card className="premium-card"><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="w-9 h-9 p-2 rounded-xl bg-red-50 text-red-600" /><div><p className="text-xs text-muted-foreground">Atrasos/pendências</p><p className="text-xl font-black">{state.pontos.filter((p) => p.justificativa).length}</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="equipe" className="space-y-5">
        <TabsList className="flex flex-wrap h-auto p-1 bg-card border"><TabsTrigger value="equipe"><BriefcaseBusiness className="w-4 h-4 mr-2" /> Equipe e setores</TabsTrigger><TabsTrigger value="ponto"><Timer className="w-4 h-4 mr-2" /> Ponto eletrônico</TabsTrigger><TabsTrigger value="folha"><DollarSign className="w-4 h-4 mr-2" /> Folha PDF/Excel</TabsTrigger><TabsTrigger value="desempenho"><Trophy className="w-4 h-4 mr-2" /> Desempenho</TabsTrigger><TabsTrigger value="assinaturas"><ShieldCheck className="w-4 h-4 mr-2" /> Assinaturas</TabsTrigger></TabsList>

        <TabsContent value="equipe" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar funcionário, cargo ou setor..." className="pl-9" /></div><Select value={setorFiltro} onValueChange={setSetorFiltro}><SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os setores</SelectItem>{setores.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{filtrados.map((f) => <FuncionarioCard key={f.id} funcionario={f} />)}</div>
        </TabsContent>
        <TabsContent value="ponto"><PontoPanel /></TabsContent>
        <TabsContent value="folha"><FolhaPanel /></TabsContent>
        <TabsContent value="desempenho"><DesempenhoPanel /></TabsContent>
        <TabsContent value="assinaturas"><AssinaturasPanel /></TabsContent>
      </Tabs>

      <NovoFuncionarioDialog open={novoOpen} onClose={() => setNovoOpen(false)} />
    </div>
  );
}
