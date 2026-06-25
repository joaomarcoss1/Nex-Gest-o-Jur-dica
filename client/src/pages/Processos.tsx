import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Briefcase, CalendarClock, CheckCircle2, Clock, FileText, Plus, Scale, Timer, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, type Prioridade, type TarefaProcesso, type TarefaStatus, useNexData } from "@/lib/nexData";

const statusProcessoColors: Record<string, string> = {
  "Em análise": "bg-amber-100 text-amber-700 border-amber-200",
  "Em andamento": "bg-blue-100 text-blue-700 border-blue-200",
  Audiência: "bg-purple-100 text-purple-700 border-purple-200",
  Recurso: "bg-orange-100 text-orange-700 border-orange-200",
  Cumprimento: "bg-teal-100 text-teal-700 border-teal-200",
  Encerrado: "bg-slate-100 text-slate-600 border-slate-200",
};
const statusTarefa: TarefaStatus[] = ["Pendente", "Em andamento", "Aguardando cliente", "Aguardando tribunal", "Concluída", "Atrasada", "Cancelada"];
const prioridades: Prioridade[] = ["Baixa", "Média", "Alta", "Crítica"];

function NovaTarefaDialog({ open, onClose, processoId }: { open: boolean; onClose: () => void; processoId: string }) {
  const { state, adicionarTarefa } = useNexData();
  const [form, setForm] = useState({
    titulo: "",
    responsavelId: state.funcionarios[0]?.id ?? "",
    prioridade: "Média" as Prioridade,
    status: "Pendente" as TarefaStatus,
    prazo: new Date().toISOString().slice(0, 10),
    tempoEstimado: "2",
    tempoGasto: "0",
    observacoes: "",
  });
  const salvar = () => {
    if (!form.titulo.trim()) return toast.error("Informe o título da tarefa.");
    adicionarTarefa({
      processoId,
      titulo: form.titulo,
      responsavelId: form.responsavelId,
      prioridade: form.prioridade,
      status: form.status,
      prazo: form.prazo,
      tempoEstimado: Number(form.tempoEstimado || 0),
      tempoGasto: Number(form.tempoGasto || 0),
      observacoes: form.observacoes,
    });
    toast.success("Tarefa operacional criada para o processo.");
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Nova tarefa do processo</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2"><Label>Título *</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
          <div><Label>Responsável</Label><Select value={form.responsavelId} onValueChange={(v) => setForm({ ...form, responsavelId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{state.funcionarios.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome} · {f.setor}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Prioridade</Label><Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v as Prioridade })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{prioridades.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TarefaStatus })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statusTarefa.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Prazo</Label><Input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} /></div>
          <div><Label>Tempo estimado (h)</Label><Input type="number" value={form.tempoEstimado} onChange={(e) => setForm({ ...form, tempoEstimado: e.target.value })} /></div>
          <div><Label>Tempo gasto (h)</Label><Input type="number" value={form.tempoGasto} onChange={(e) => setForm({ ...form, tempoGasto: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Observações</Label><Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={salvar}>Salvar tarefa</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Processos() {
  const { state, getNomeFuncionario, atualizarTarefa } = useNexData();
  const [selected, setSelected] = useState(state.processos[0]?.id ?? "");
  const [novaTarefa, setNovaTarefa] = useState(false);
  const processo = state.processos.find((p) => p.id === selected) ?? state.processos[0];
  const tarefas = state.tarefas.filter((t) => t.processoId === processo?.id);
  const documentos = state.documentos.filter((d) => d.processoId === processo?.id);
  const concluidas = tarefas.filter((t) => t.status === "Concluída").length;
  const tempoTotal = tarefas.reduce((acc, t) => acc + t.tempoGasto, 0);

  if (!processo) return <div className="p-8">Nenhum processo encontrado.</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><Badge className="bg-primary/10 text-primary border-0 mb-2">Gestão processual operacional</Badge><h1 className="text-2xl lg:text-3xl font-black tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Processos, tarefas e desempenho</h1><p className="text-sm text-muted-foreground mt-1">Acompanhe responsáveis, prazos, tarefas, documentos e carga de trabalho de cada processo.</p></div>
        <div className="flex gap-2"><Select value={selected} onValueChange={setSelected}><SelectTrigger className="w-full lg:w-[360px]"><SelectValue /></SelectTrigger><SelectContent>{state.processos.map((p) => <SelectItem key={p.id} value={p.id}>{p.numero} · {p.cliente}</SelectItem>)}</SelectContent></Select><Button onClick={() => setNovaTarefa(true)} className="nex-gradient-premium text-white"><Plus className="w-4 h-4" /> Tarefa</Button></div>
      </div>

      <Card className="hero-card text-white overflow-hidden">
        <CardContent className="p-6 lg:p-7">
          <div className="flex flex-col xl:flex-row gap-6 xl:items-center justify-between">
            <div>
              <Badge className="bg-white/10 text-white border-white/10 mb-3">{processo.area}</Badge>
              <p className="text-sm text-white/60 font-mono">{processo.numero}</p>
              <h2 className="text-2xl font-black mt-1">{processo.cliente}</h2>
              <p className="text-white/70">{processo.tribunal} · Valor da causa {formatCurrency(processo.valorCausa)}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-[520px] max-w-full">
              <div className="rounded-2xl bg-white/10 border border-white/10 p-4"><p className="text-xs text-white/60">Status</p><p className="font-black">{processo.status}</p></div>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-4"><p className="text-xs text-white/60">Tarefas</p><p className="font-black">{tarefas.length}</p></div>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-4"><p className="text-xs text-white/60">Concluídas</p><p className="font-black">{concluidas}</p></div>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-4"><p className="text-xs text-white/60">Tempo gasto</p><p className="font-black">{tempoTotal.toFixed(1)}h</p></div>
            </div>
          </div>
          <div className="mt-6"><div className="flex justify-between text-xs mb-2"><span>Progresso processual</span><b>{processo.progresso}%</b></div><Progress value={processo.progresso} className="h-2" /></div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tarefas" className="space-y-5">
        <TabsList className="flex flex-wrap h-auto p-1 bg-card border"><TabsTrigger value="tarefas"><CheckCircle2 className="w-4 h-4 mr-2" /> Tarefas</TabsTrigger><TabsTrigger value="responsaveis"><Users className="w-4 h-4 mr-2" /> Responsáveis</TabsTrigger><TabsTrigger value="documentos"><FileText className="w-4 h-4 mr-2" /> Documentos</TabsTrigger><TabsTrigger value="linha"><CalendarClock className="w-4 h-4 mr-2" /> Linha do tempo</TabsTrigger></TabsList>
        <TabsContent value="tarefas">
          <Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Tarefas do processo</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Tarefa</TableHead><TableHead>Responsável</TableHead><TableHead>Status</TableHead><TableHead>Prioridade</TableHead><TableHead>Prazo</TableHead><TableHead>Tempo</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader><TableBody>{tarefas.map((t: TarefaProcesso) => <TableRow key={t.id}><TableCell className="font-semibold max-w-[260px] truncate">{t.titulo}</TableCell><TableCell>{getNomeFuncionario(t.responsavelId)}</TableCell><TableCell><Badge variant="outline">{t.status}</Badge></TableCell><TableCell><Badge className={cn("border-0", t.prioridade === "Crítica" ? "bg-red-100 text-red-700" : t.prioridade === "Alta" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700")}>{t.prioridade}</Badge></TableCell><TableCell>{new Date(`${t.prazo}T00:00:00`).toLocaleDateString("pt-BR")}</TableCell><TableCell>{t.tempoGasto}/{t.tempoEstimado}h</TableCell><TableCell>{t.status !== "Concluída" && <Button size="sm" variant="outline" onClick={() => { atualizarTarefa(t.id, { status: "Concluída", tempoGasto: Math.max(t.tempoGasto, t.tempoEstimado) }); toast.success("Tarefa concluída."); }}>Concluir</Button>}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </TabsContent>
        <TabsContent value="responsaveis"><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{processo.responsaveis.map((id) => { const f = state.funcionarios.find((item) => item.id === id); if (!f) return null; return <Card key={id} className="premium-card"><CardContent className="p-5"><div className="flex gap-3"><div className="w-12 h-12 rounded-2xl nex-gradient text-white flex items-center justify-center font-black">{f.avatar}</div><div><p className="font-black">{f.nome}</p><p className="text-sm text-muted-foreground">{f.cargo} · {f.setor}</p><p className="text-xs text-muted-foreground mt-2">{f.email}</p></div></div></CardContent></Card>; })}</div></TabsContent>
        <TabsContent value="documentos"><Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Documentos vinculados</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Documento</TableHead><TableHead>Tipo</TableHead><TableHead>Origem</TableHead><TableHead>Status</TableHead><TableHead>Envio</TableHead></TableRow></TableHeader><TableBody>{documentos.map((d) => <TableRow key={d.id}><TableCell className="font-semibold">{d.nome}</TableCell><TableCell>{d.tipo}</TableCell><TableCell>{d.origem}</TableCell><TableCell><Badge variant="outline">{d.status}</Badge></TableCell><TableCell>{new Date(`${d.dataEnvio}T00:00:00`).toLocaleDateString("pt-BR")}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></TabsContent>
        <TabsContent value="linha"><div className="space-y-3">{tarefas.map((t) => <Card key={t.id} className="premium-card"><CardContent className="p-4 flex gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div><div><p className="font-black">{t.titulo}</p><p className="text-sm text-muted-foreground">{t.status} · responsável: {getNomeFuncionario(t.responsavelId)} · {t.tempoGasto}h gastas</p><p className="text-xs text-muted-foreground mt-1">{t.observacoes}</p></div></CardContent></Card>)}</div></TabsContent>
      </Tabs>
      <NovaTarefaDialog open={novaTarefa} onClose={() => setNovaTarefa(false)} processoId={processo.id} />
    </div>
  );
}
