import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus, Calendar, Clock, MapPin, AlertTriangle, CheckCircle2,
  Scale, Users, Briefcase, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isPast, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  prazo_fatal: { label: "Prazo Fatal", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  audiencia: { label: "Audiência", icon: Scale, color: "text-purple-600", bg: "bg-purple-50" },
  reuniao: { label: "Reunião", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  tarefa: { label: "Tarefa", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
  compromisso: { label: "Compromisso", icon: Calendar, color: "text-teal-600", bg: "bg-teal-50" },
};

const prioridadeConfig: Record<string, { label: string; color: string }> = {
  baixa: { label: "Baixa", color: "bg-green-100 text-green-700 border-green-200" },
  media: { label: "Média", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  alta: { label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-200" },
  critica: { label: "Crítica", color: "bg-red-100 text-red-700 border-red-200" },
};

function getDateLabel(date: Date) {
  if (isToday(date)) return "Hoje";
  if (isTomorrow(date)) return "Amanhã";
  return format(date, "dd/MM/yyyy");
}

function PrazoCard({ prazo, onConcluir }: { prazo: any; onConcluir: (id: number) => void }) {
  const tipo = tipoConfig[prazo.tipo ?? "compromisso"];
  const prioridade = prioridadeConfig[prazo.prioridade ?? "media"];
  const TipoIcon = tipo.icon;
  const vencimento = new Date(prazo.dataVencimento);
  const vencido = isPast(vencimento) && prazo.status === "pendente";
  return (
    <Card className={cn("border-border/60 card-hover", vencido && "border-red-200 bg-red-50/30")}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", tipo.bg)}>
            <TipoIcon className={cn("w-4 h-4", tipo.color)} size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium truncate">{prazo.titulo}</p>
              <Badge variant="outline" className={cn("text-xs", prioridade.color)}>{prioridade.label}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={cn("flex items-center gap-1 text-xs font-medium", vencido ? "text-red-600" : isToday(vencimento) ? "text-amber-600" : "text-muted-foreground")}>
                <Clock className="w-3 h-3" />
                {getDateLabel(vencimento)} {format(vencimento, "HH:mm")}
              </span>
              {prazo.local && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {prazo.local}
                </span>
              )}
            </div>
            {prazo.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{prazo.descricao}</p>}
          </div>
          {prazo.status === "pendente" && (
            <Button size="sm" variant="ghost" className="flex-shrink-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => onConcluir(prazo.id)}>
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
          {prazo.status === "concluido" && (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NovoPrazoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<Record<string, string>>({ tipo: "prazo_fatal", prioridade: "media" });
  const { data: processos } = trpc.processos.listar.useQuery();
  const utils = trpc.useUtils();
  const criar = trpc.prazos.criar.useMutation({
    onSuccess: () => { toast.success("Compromisso criado!"); utils.prazos.listar.invalidate(); onClose(); setForm({ tipo: "prazo_fatal", prioridade: "media" }); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Novo Compromisso</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Título *</Label><Input value={form.titulo ?? ""} onChange={(e) => set("titulo", e.target.value)} placeholder="Título do compromisso" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(tipoConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.prioridade} onValueChange={(v) => set("prioridade", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(prioridadeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Data e Hora *</Label><Input type="datetime-local" value={form.dataVencimento ?? ""} onChange={(e) => set("dataVencimento", e.target.value)} /></div>
            <div className="col-span-2"><Label>Local</Label><Input value={form.local ?? ""} onChange={(e) => set("local", e.target.value)} placeholder="Local do compromisso" /></div>
            <div className="col-span-2">
              <Label>Processo Vinculado</Label>
              <Select value={form.processoId ?? ""} onValueChange={(v) => set("processoId", v)}>
                <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
                <SelectContent>{processos?.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.numeroCnj || `Processo #${p.id}`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Descrição</Label><Textarea value={form.descricao ?? ""} onChange={(e) => set("descricao", e.target.value)} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => criar.mutate({ ...form, processoId: form.processoId ? Number(form.processoId) : undefined } as any)} disabled={!form.titulo || !form.dataVencimento || criar.isPending}>
            {criar.isPending ? "Salvando..." : "Criar Compromisso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Agenda() {
  const [novoOpen, setNovoOpen] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("pendente");

  const { data: prazos, isLoading } = trpc.prazos.listar.useQuery(
    statusFiltro !== "todos" ? { status: statusFiltro } : undefined
  );
  const utils = trpc.useUtils();
  const atualizar = trpc.prazos.atualizar.useMutation({
    onSuccess: () => utils.prazos.listar.invalidate(),
  });

  const filtrados = prazos?.filter((p) => tipoFiltro === "todos" || p.tipo === tipoFiltro) ?? [];

  const hoje = filtrados.filter((p) => isToday(new Date(p.dataVencimento)));
  const semana = filtrados.filter((p) => {
    const d = new Date(p.dataVencimento);
    const fim = addDays(new Date(), 7);
    return d > new Date() && d <= fim;
  });
  const futuros = filtrados.filter((p) => new Date(p.dataVencimento) > addDays(new Date(), 7));
  const vencidos = filtrados.filter((p) => isPast(new Date(p.dataVencimento)) && p.status === "pendente");

  const handleConcluir = (id: number) => {
    atualizar.mutate({ id, data: { status: "concluido" } });
    toast.success("Compromisso concluído!");
  };

  // Mini calendar for current week
  const hoje_date = new Date();
  const inicioSemana = startOfWeek(hoje_date, { weekStartsOn: 0 });
  const fimSemana = endOfWeek(hoje_date, { weekStartsOn: 0 });
  const diasSemana = eachDayOfInterval({ start: inicioSemana, end: fimSemana });

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>Agenda Jurídica</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Prazos, audiências e compromissos</p>
        </div>
        <Button onClick={() => setNovoOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Novo Compromisso</Button>
      </div>

      {/* Week view */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Semana de {format(inicioSemana, "d 'de' MMM", { locale: ptBR })} a {format(fimSemana, "d 'de' MMM", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {diasSemana.map((dia) => {
              const eventos = prazos?.filter((p) => {
                const d = new Date(p.dataVencimento);
                return d.toDateString() === dia.toDateString();
              }) ?? [];
              return (
                <div key={dia.toISOString()} className={cn(
                  "rounded-lg p-2 text-center min-h-16 transition-colors",
                  isToday(dia) ? "bg-primary/10 border border-primary/30" : "bg-muted/30 hover:bg-muted/50"
                )}>
                  <p className="text-[10px] text-muted-foreground uppercase">{format(dia, "EEE", { locale: ptBR })}</p>
                  <p className={cn("text-sm font-bold", isToday(dia) ? "text-primary" : "")}>{format(dia, "d")}</p>
                  {eventos.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {eventos.slice(0, 2).map((e) => (
                        <div key={e.id} className={cn("w-full h-1.5 rounded-full", tipoConfig[e.tipo ?? "compromisso"].bg.replace("bg-", "bg-").replace("-50", "-400"))} />
                      ))}
                      {eventos.length > 2 && <p className="text-[9px] text-muted-foreground">+{eventos.length - 2}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {Object.entries(tipoConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="concluido">Concluídos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="space-y-4">
          {vencidos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" /> Vencidos ({vencidos.length})
              </h3>
              <div className="space-y-2">{vencidos.map((p) => <PrazoCard key={p.id} prazo={p} onConcluir={handleConcluir} />)}</div>
            </div>
          )}
          {hoje.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4" /> Hoje ({hoje.length})
              </h3>
              <div className="space-y-2">{hoje.map((p) => <PrazoCard key={p.id} prazo={p} onConcluir={handleConcluir} />)}</div>
            </div>
          )}
          {semana.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" /> Próximos 7 dias ({semana.length})
              </h3>
              <div className="space-y-2">{semana.map((p) => <PrazoCard key={p.id} prazo={p} onConcluir={handleConcluir} />)}</div>
            </div>
          )}
          {futuros.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" /> Futuros ({futuros.length})
              </h3>
              <div className="space-y-2">{futuros.map((p) => <PrazoCard key={p.id} prazo={p} onConcluir={handleConcluir} />)}</div>
            </div>
          )}
          {filtrados.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>Nenhum compromisso encontrado</p>
            </div>
          )}
        </div>
      )}

      <NovoPrazoDialog open={novoOpen} onClose={() => setNovoOpen(false)} />
    </div>
  );
}
