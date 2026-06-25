import type { ElementType } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Briefcase,
  Users,
  DollarSign,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Clock,
  Scale,
  Timer,
  FileText,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, useNexData } from "@/lib/nexData";

const faturamentoData = [
  { mes: "Jan", receita: 42000, despesa: 18000 },
  { mes: "Fev", receita: 52000, despesa: 21000 },
  { mes: "Mar", receita: 61000, despesa: 24000 },
  { mes: "Abr", receita: 57000, despesa: 22000 },
  { mes: "Mai", receita: 74000, despesa: 27000 },
  { mes: "Jun", receita: 89000, despesa: 31000 },
];

const statusColors: Record<string, string> = {
  "Em análise": "bg-amber-100 text-amber-700 border-amber-200",
  "Em andamento": "bg-blue-100 text-blue-700 border-blue-200",
  Audiência: "bg-purple-100 text-purple-700 border-purple-200",
  Recurso: "bg-orange-100 text-orange-700 border-orange-200",
  Cumprimento: "bg-teal-100 text-teal-700 border-teal-200",
  Encerrado: "bg-slate-100 text-slate-600 border-slate-200",
};

function KpiCard({ title, value, subtitle, icon: Icon, tone, trend }: { title: string; value: string | number; subtitle: string; icon: ElementType; tone: "blue" | "gold" | "green" | "red" | "dark"; trend?: string }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    gold: "bg-amber-50 text-amber-600 border-amber-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
    dark: "bg-slate-900 text-white border-slate-800",
  };
  return (
    <Card className="premium-card card-hover overflow-hidden">
      <CardContent className="p-5 relative">
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-primary/5" />
        <div className="flex items-start justify-between gap-3 relative">
          <div>
            <p className="text-sm text-muted-foreground font-semibold">{title}</p>
            <p className="text-2xl font-black mt-1 tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            {trend && <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600"><ArrowUpRight className="w-3.5 h-3.5" />{trend}</div>}
          </div>
          <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-sm", tones[tone])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { state, indicadores, getNomeFuncionario } = useNexData();
  const hoje = new Date().toISOString().slice(0, 10);
  const areaData = Object.values(state.processos.reduce<Record<string, { name: string; value: number; color: string }>>((acc, processo, index) => {
    const palette = ["#0F6FFF", "#F5B400", "#10B981", "#8B5CF6", "#EF4444", "#0F172A"];
    acc[processo.area] ??= { name: processo.area, value: 0, color: palette[index % palette.length] };
    acc[processo.area].value += 1;
    return acc;
  }, {}));

  const desempenhoData = state.funcionarios.map((f) => {
    const tarefas = state.tarefas.filter((t) => t.responsavelId === f.id);
    return {
      nome: f.nome.split(" ")[0],
      concluidas: tarefas.filter((t) => t.status === "Concluída").length,
      pendentes: tarefas.filter((t) => t.status !== "Concluída" && t.status !== "Cancelada").length,
    };
  });

  const tarefasCriticas = state.tarefas.filter((t) => t.prioridade === "Crítica" || t.prazo <= hoje).slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <div className="hero-card p-6 lg:p-7 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('/nexlabs-logo.jpeg')", backgroundSize: "420px", backgroundRepeat: "no-repeat", backgroundPosition: "right -80px center" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <Badge className="bg-white/12 text-white border-white/10 mb-3">Gestão Jurídica Nex · Painel Executivo</Badge>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Controle completo do escritório</h1>
            <p className="text-white/75 mt-2 max-w-2xl">Processos, funcionários, ponto, folha, documentos digitalizados e desempenho operacional com a estética corporativa da NexLabs.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[260px]">
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur"><p className="text-xs text-white/60">Hoje</p><p className="font-bold">{format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</p></div>
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur"><p className="text-xs text-white/60">Segurança</p><p className="font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-[#F5B400]" />LGPD</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Processos ativos" value={indicadores.processosAtivos} subtitle="Carteira operacional" icon={Briefcase} tone="blue" trend="+12% no mês" />
        <KpiCard title="Receita prevista" value={formatCurrency(indicadores.receitaPrevista)} subtitle="Honorários estimados" icon={DollarSign} tone="gold" trend="CMV jurídico controlado" />
        <KpiCard title="Funcionários presentes" value={indicadores.presentes} subtitle={`${indicadores.ausentes} ausentes ou sem ponto`} icon={Timer} tone="green" />
        <KpiCard title="Docs pendentes" value={indicadores.documentosPendentes} subtitle="Recebidos pelo portal" icon={FileText} tone="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="premium-card xl:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base font-black">Faturamento e custos do escritório</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={275}>
              <AreaChart data={faturamentoData}>
                <defs>
                  <linearGradient id="receitaNex" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0F6FFF" stopOpacity={0.24} /><stop offset="95%" stopColor="#0F6FFF" stopOpacity={0} /></linearGradient>
                  <linearGradient id="despesaNex" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F5B400" stopOpacity={0.26} /><stop offset="95%" stopColor="#F5B400" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${Number(v) / 1000}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="receita" name="Receita" stroke="#0F6FFF" strokeWidth={3} fill="url(#receitaNex)" />
                <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#F5B400" strokeWidth={3} fill="url(#despesaNex)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-2"><CardTitle className="text-base font-black">Processos por área</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={areaData} innerRadius={56} outerRadius={86} paddingAngle={3} dataKey="value">
                  {areaData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">{areaData.map((a) => <div key={a.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />{a.name}</span><b>{a.value}</b></div>)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="premium-card xl:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-base font-black">Produtividade da equipe por processo</CardTitle><Button size="sm" variant="outline">Ver relatório</Button></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={245}>
              <BarChart data={desempenhoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="concluidas" name="Concluídas" fill="#0F6FFF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pendentes" name="Pendentes" fill="#F5B400" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-2"><CardTitle className="text-base font-black">Prazos e tarefas críticas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {tarefasCriticas.map((tarefa) => (
              <div key={tarefa.id} className="p-3 rounded-2xl border bg-card/70 hover:bg-muted/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{tarefa.titulo}</p>
                    <p className="text-xs text-muted-foreground">{getNomeFuncionario(tarefa.responsavelId)} · {format(new Date(`${tarefa.prazo}T00:00:00`), "dd/MM/yyyy")}</p>
                    <Badge variant="outline" className="mt-2 text-[10px]">{tarefa.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {state.processos.map((processo) => (
          <Card key={processo.id} className="premium-card card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="w-11 h-11 rounded-2xl nex-gradient flex items-center justify-center text-white shadow-lg"><Scale className="w-5 h-5" /></div>
                <Badge variant="outline" className={cn("text-xs", statusColors[processo.status])}>{processo.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-mono">{processo.numero}</p>
              <h3 className="font-black mt-1">{processo.cliente}</h3>
              <p className="text-sm text-muted-foreground">{processo.area} · {processo.tribunal}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs"><span>Andamento</span><b>{processo.progresso}%</b></div>
                <Progress value={processo.progresso} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="rounded-xl bg-muted/60 p-2"><Clock className="w-3.5 h-3.5 mb-1 text-primary" />Prazo: {format(new Date(`${processo.prazoCritico}T00:00:00`), "dd/MM")}</div>
                <div className="rounded-xl bg-muted/60 p-2"><Users className="w-3.5 h-3.5 mb-1 text-primary" />{processo.responsaveis.length} envolvidos</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
