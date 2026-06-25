import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { BarChart3, Briefcase, Download, FileSpreadsheet, FileText, ShieldCheck, Timer, Users, WalletCards } from "lucide-react";
import { assinaturasTableHtml, desempenhoTableHtml, documentosTableHtml, exportarExcelHtml, exportarPdfCorporativo, folhaTableHtml, formatCurrency, type NexState, useNexData } from "@/lib/nexData";

function reportProcessosHtml(data: NexState) {
  return `<div class="cards"><div class="card"><small>Processos</small><b>${data.processos.length}</b></div><div class="card"><small>Clientes</small><b>${new Set(data.processos.map((p) => p.cliente)).size}</b></div><div class="card"><small>Documentos</small><b>${data.documentos.length}</b></div><div class="card"><small>Tarefas</small><b>${data.tarefas.length}</b></div></div><h2>Relatório de processos</h2><table><thead><tr><th>Número</th><th>Cliente</th><th>Área</th><th>Tribunal</th><th>Status</th><th>Valor da causa</th><th>Progresso</th></tr></thead><tbody>${data.processos.map((p) => `<tr><td>${p.numero}</td><td>${p.cliente}</td><td>${p.area}</td><td>${p.tribunal}</td><td>${p.status}</td><td>${formatCurrency(p.valorCausa)}</td><td>${p.progresso}%</td></tr>`).join("")}</tbody></table>`;
}

function reportPontoHtml(data: NexState) {
  return `<div class="cards"><div class="card"><small>Registros</small><b>${data.pontos.length}</b></div><div class="card"><small>Com justificativa</small><b>${data.pontos.filter((p) => p.justificativa).length}</b></div><div class="card"><small>Setores</small><b>${new Set(data.pontos.map((p) => p.setor)).size}</b></div><div class="card"><small>Funcionários</small><b>${data.funcionarios.length}</b></div></div><h2>Relatório de ponto eletrônico</h2><table><thead><tr><th>Data</th><th>Hora</th><th>Funcionário</th><th>Setor</th><th>Registro</th><th>Justificativa</th></tr></thead><tbody>${data.pontos.map((p) => `<tr><td>${p.data}</td><td>${p.hora}</td><td>${data.funcionarios.find((f) => f.id === p.funcionarioId)?.nome ?? ""}</td><td>${p.setor}</td><td>${p.tipo}</td><td>${p.justificativa ?? ""}</td></tr>`).join("")}</tbody></table>`;
}

const fluxo = [
  { mes: "Jan", receita: 42000, despesa: 18000 },
  { mes: "Fev", receita: 52000, despesa: 21000 },
  { mes: "Mar", receita: 61000, despesa: 24000 },
  { mes: "Abr", receita: 57000, despesa: 22000 },
  { mes: "Mai", receita: 74000, despesa: 27000 },
  { mes: "Jun", receita: 89000, despesa: 31000 },
];

export default function Relatorios() {
  const { state, indicadores } = useNexData();
  const [competencia, setCompetencia] = useState(new Date().toISOString().slice(0, 7));
  const areaData = Object.values(state.processos.reduce<Record<string, { name: string; value: number; color: string }>>((acc, p, i) => {
    const colors = ["#0F6FFF", "#F5B400", "#10B981", "#8B5CF6", "#EF4444"];
    acc[p.area] ??= { name: p.area, value: 0, color: colors[i % colors.length] };
    acc[p.area].value += 1;
    return acc;
  }, {}));
  const desempenho = state.funcionarios.map((f) => {
    const tarefas = state.tarefas.filter((t) => t.responsavelId === f.id);
    return { nome: f.nome.split(" ")[0], tarefas: tarefas.length, concluidas: tarefas.filter((t) => t.status === "Concluída").length };
  });

  const processosHtml = reportProcessosHtml(state);
  const pontoHtml = reportPontoHtml(state);
  const desempenhoHtml = desempenhoTableHtml(state);
  const folhaHtml = folhaTableHtml(state, competencia);
  const documentosHtml = documentosTableHtml(state);
  const assinaturasHtml = assinaturasTableHtml(state);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><Badge className="bg-primary/10 text-primary border-0 mb-2">Relatórios corporativos</Badge><h1 className="text-2xl lg:text-3xl font-black tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Relatórios Premium NexLabs</h1><p className="text-sm text-muted-foreground mt-1">PDF com cabeçalho, cores da NexLabs, assinatura discreta e exportação Excel compatível.</p></div>
        <div className="flex flex-wrap gap-2"><Button onClick={() => exportarPdfCorporativo("Relatório Executivo", "Visão geral do escritório", processosHtml)} className="nex-gradient-premium text-white"><Download className="w-4 h-4" /> Relatório geral</Button></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="premium-card"><CardContent className="p-5"><Briefcase className="w-9 h-9 p-2 rounded-xl bg-blue-50 text-blue-600 mb-3" /><p className="text-sm text-muted-foreground">Processos ativos</p><p className="text-2xl font-black">{indicadores.processosAtivos}</p></CardContent></Card>
        <Card className="premium-card"><CardContent className="p-5"><Users className="w-9 h-9 p-2 rounded-xl bg-emerald-50 text-emerald-600 mb-3" /><p className="text-sm text-muted-foreground">Funcionários</p><p className="text-2xl font-black">{state.funcionarios.length}</p></CardContent></Card>
        <Card className="premium-card"><CardContent className="p-5"><Timer className="w-9 h-9 p-2 rounded-xl bg-amber-50 text-amber-600 mb-3" /><p className="text-sm text-muted-foreground">Registros de ponto</p><p className="text-2xl font-black">{state.pontos.length}</p></CardContent></Card>
        <Card className="premium-card"><CardContent className="p-5"><WalletCards className="w-9 h-9 p-2 rounded-xl bg-slate-900 text-white mb-3" /><p className="text-sm text-muted-foreground">Receita prevista</p><p className="text-2xl font-black">{formatCurrency(indicadores.receitaPrevista)}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="processos" className="space-y-5">
        <TabsList className="flex flex-wrap h-auto p-1 bg-card border"><TabsTrigger value="processos"><Briefcase className="w-4 h-4 mr-2" /> Processos</TabsTrigger><TabsTrigger value="financeiro"><WalletCards className="w-4 h-4 mr-2" /> Financeiro</TabsTrigger><TabsTrigger value="ponto"><Timer className="w-4 h-4 mr-2" /> Ponto</TabsTrigger><TabsTrigger value="desempenho"><BarChart3 className="w-4 h-4 mr-2" /> Desempenho</TabsTrigger><TabsTrigger value="folha"><FileText className="w-4 h-4 mr-2" /> Folha</TabsTrigger><TabsTrigger value="documentos"><ShieldCheck className="w-4 h-4 mr-2" /> Docs/Assinaturas</TabsTrigger></TabsList>

        <TabsContent value="processos" className="space-y-4">
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => exportarPdfCorporativo("Relatório de Processos", "Controle processual e documentos", processosHtml)}><FileText className="w-4 h-4" /> PDF</Button><Button variant="outline" onClick={() => exportarExcelHtml("relatorio-processos", processosHtml)}><FileSpreadsheet className="w-4 h-4" /> Excel</Button></div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5"><Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Processos por área</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={areaData} dataKey="value" innerRadius={65} outerRadius={100}>{areaData.map((a) => <Cell key={a.name} fill={a.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card><Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Tabela de processos</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Área</TableHead><TableHead>Status</TableHead><TableHead>Valor</TableHead></TableRow></TableHeader><TableBody>{state.processos.map((p) => <TableRow key={p.id}><TableCell className="font-semibold">{p.cliente}</TableCell><TableCell>{p.area}</TableCell><TableCell>{p.status}</TableCell><TableCell>{formatCurrency(p.valorCausa)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div>
        </TabsContent>

        <TabsContent value="financeiro"><Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Fluxo financeiro</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={320}><AreaChart data={fluxo}><defs><linearGradient id="financeiroBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0F6FFF" stopOpacity={0.24} /><stop offset="95%" stopColor="#0F6FFF" stopOpacity={0} /></linearGradient><linearGradient id="financeiroGold" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F5B400" stopOpacity={0.24} /><stop offset="95%" stopColor="#F5B400" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="mes" /><YAxis tickFormatter={(v) => `R$${Number(v) / 1000}k`} /><Tooltip formatter={(v: number) => formatCurrency(v)} /><Area type="monotone" dataKey="receita" stroke="#0F6FFF" strokeWidth={3} fill="url(#financeiroBlue)" /><Area type="monotone" dataKey="despesa" stroke="#F5B400" strokeWidth={3} fill="url(#financeiroGold)" /></AreaChart></ResponsiveContainer></CardContent></Card></TabsContent>

        <TabsContent value="ponto" className="space-y-4"><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => exportarPdfCorporativo("Relatório de Ponto", "Frequência, atrasos e justificativas", pontoHtml)}><FileText className="w-4 h-4" /> PDF</Button><Button variant="outline" onClick={() => exportarExcelHtml("relatorio-ponto", pontoHtml)}><FileSpreadsheet className="w-4 h-4" /> Excel</Button></div><Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Registros recentes</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Hora</TableHead><TableHead>Funcionário</TableHead><TableHead>Setor</TableHead><TableHead>Tipo</TableHead></TableRow></TableHeader><TableBody>{state.pontos.map((p) => <TableRow key={p.id}><TableCell>{p.data}</TableCell><TableCell className="font-mono font-bold">{p.hora}</TableCell><TableCell>{state.funcionarios.find((f) => f.id === p.funcionarioId)?.nome}</TableCell><TableCell>{p.setor}</TableCell><TableCell>{p.tipo}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></TabsContent>

        <TabsContent value="desempenho" className="space-y-4"><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => exportarPdfCorporativo("Relatório de Desempenho", "Produtividade por funcionário e processo", desempenhoHtml)}><FileText className="w-4 h-4" /> PDF</Button><Button variant="outline" onClick={() => exportarExcelHtml("relatorio-desempenho", desempenhoHtml)}><FileSpreadsheet className="w-4 h-4" /> Excel</Button></div><Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Equipe por tarefas</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={desempenho}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="nome" /><YAxis /><Tooltip /><Bar dataKey="tarefas" fill="#F5B400" radius={[6, 6, 0, 0]} /><Bar dataKey="concluidas" fill="#0F6FFF" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card></TabsContent>

        <TabsContent value="folha" className="space-y-4"><div className="flex flex-wrap justify-end gap-2"><Select value={competencia} onValueChange={setCompetencia}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={new Date().toISOString().slice(0, 7)}>{new Date().toISOString().slice(0, 7)}</SelectItem><SelectItem value="2026-06">2026-06</SelectItem><SelectItem value="2026-05">2026-05</SelectItem></SelectContent></Select><Button variant="outline" onClick={() => exportarPdfCorporativo("Folha de Pagamento", `Competência ${competencia}`, folhaHtml)}><FileText className="w-4 h-4" /> PDF</Button><Button variant="outline" onClick={() => exportarExcelHtml(`folha-${competencia}`, folhaHtml)}><FileSpreadsheet className="w-4 h-4" /> Excel</Button></div><Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Relatório da folha</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Gere a folha na aba Funcionários para preencher esta competência. A exportação sairá com cabeçalho, cores e rodapé NexLabs.</p></CardContent></Card></TabsContent>

        <TabsContent value="documentos" className="space-y-4"><div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => exportarPdfCorporativo("Relatório de Documentos", "Documentos digitalizados, protocolos e qualidade", documentosHtml)}><FileText className="w-4 h-4" /> PDF documentos</Button><Button variant="outline" onClick={() => exportarExcelHtml("relatorio-documentos", documentosHtml)}><FileSpreadsheet className="w-4 h-4" /> Excel documentos</Button><Button variant="outline" onClick={() => exportarPdfCorporativo("Relatório de Assinaturas", "Assinaturas digitais válidas", assinaturasHtml)}><ShieldCheck className="w-4 h-4" /> PDF assinaturas</Button></div><Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Documentos e assinaturas</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Documento</TableHead><TableHead>Cliente</TableHead><TableHead>Status</TableHead><TableHead>Qualidade</TableHead><TableHead>Assinaturas</TableHead></TableRow></TableHeader><TableBody>{state.documentos.map((d) => <TableRow key={d.id}><TableCell className="font-semibold">{d.nome}</TableCell><TableCell>{d.cliente}</TableCell><TableCell>{d.status}</TableCell><TableCell>{d.qualidade ?? 0}%</TableCell><TableCell>{d.assinaturasIds?.length ?? 0}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
