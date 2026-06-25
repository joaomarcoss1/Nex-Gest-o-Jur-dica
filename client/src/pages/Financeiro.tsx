import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Calculator, DollarSign, FileText, FileSpreadsheet, Fuel, Percent, Scale, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { exportarExcelHtml, exportarPdfCorporativo, formatCurrency, useNexData } from "@/lib/nexData";
import {
  areaLabels,
  calculateLegalPricing,
  defaultCaseInput,
  defaultOfficeCosts,
  money,
  oabMaReference,
  pricingHtml,
  servicoLabels,
  type AreaDireito,
  type CasePricingInput,
  type OfficeCostConfig,
  type ServicoJuridico,
} from "@/lib/legalPricing";

const fluxo = [
  { mes: "Jan", receita: 42000, despesa: 18000 },
  { mes: "Fev", receita: 52000, despesa: 21000 },
  { mes: "Mar", receita: 61000, despesa: 24000 },
  { mes: "Abr", receita: 57000, despesa: 22000 },
  { mes: "Mai", receita: 74000, despesa: 27000 },
  { mes: "Jun", receita: 89000, despesa: 31000 },
];

const officeFields: Array<{ key: keyof OfficeCostConfig; label: string; help?: string }> = [
  { key: "aluguel", label: "Aluguel" },
  { key: "energia", label: "Energia" },
  { key: "agua", label: "Água" },
  { key: "internet", label: "Internet" },
  { key: "sistemas", label: "Sistemas e tecnologia" },
  { key: "contador", label: "Contador/consultorias" },
  { key: "marketing", label: "Marketing" },
  { key: "materialEscritorio", label: "Material de escritório" },
  { key: "manutencao", label: "Manutenção" },
  { key: "impostosFixos", label: "Impostos fixos" },
  { key: "folhaFuncionarios", label: "Folha dos funcionários" },
  { key: "proLaboreSocios", label: "Pró-labore dos sócios" },
  { key: "outros", label: "Outros custos" },
];

const caseExpenseFields: Array<{ key: keyof CasePricingInput; label: string }> = [
  { key: "custas", label: "Custas processuais" },
  { key: "copiasDigitalizacoes", label: "Cópias/digitalizações" },
  { key: "certidoes", label: "Certidões" },
  { key: "diligenciasTerceiros", label: "Diligências de terceiros" },
  { key: "alimentacao", label: "Alimentação" },
  { key: "hospedagem", label: "Hospedagem" },
  { key: "estacionamento", label: "Estacionamento" },
  { key: "outrasDespesas", label: "Outras despesas" },
];

const serviceOptions = Object.entries(servicoLabels) as Array<[ServicoJuridico, string]>;
const areaOptions = Object.entries(areaLabels) as Array<[AreaDireito, string]>;

function NumberInput({ label, value, onChange, prefix }: { label: string; value: number; onChange: (value: number) => void; prefix?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{prefix}</span>}
        <Input className={prefix ? "pl-9" : undefined} type="number" value={value} onChange={(e) => onChange(Number(e.target.value || 0))} />
      </div>
    </div>
  );
}

function Kpi({ title, value, subtitle, tone = "blue" }: { title: string; value: string; subtitle: string; tone?: "blue" | "gold" | "dark" | "green" }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    gold: "bg-amber-50 text-amber-700 border-amber-100",
    dark: "bg-slate-900 text-white border-slate-800",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  return (
    <Card className="premium-card card-hover overflow-hidden">
      <CardContent className="p-5">
        <div className={`rounded-2xl border p-4 ${styles[tone]}`}>
          <p className="text-xs opacity-75 font-semibold">{title}</p>
          <p className="text-2xl font-black mt-1">{value}</p>
          <p className="text-xs opacity-70 mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Financeiro() {
  const { indicadores } = useNexData();
  const [office, setOffice] = useState<OfficeCostConfig>(defaultOfficeCosts);
  const [caso, setCaso] = useState<CasePricingInput>(defaultCaseInput);
  const result = useMemo(() => calculateLegalPricing(office, caso), [office, caso]);
  const html = useMemo(() => pricingHtml(caso, result), [caso, result]);
  const oabRef = oabMaReference[caso.servico];

  const setOfficeValue = (key: keyof OfficeCostConfig, value: number) => setOffice((prev) => ({ ...prev, [key]: value }));
  const setCaseValue = <K extends keyof CasePricingInput>(key: K, value: CasePricingInput[K]) => setCaso((prev) => ({ ...prev, [key]: value }));

  const costChart = result.breakdown.filter((b) => ["Horas internas alocadas", "Mão de obra por profissional", "Despesas diretas", "Eventos jurídicos", "Piso OAB/referência"].includes(b.item)).map((b) => ({ item: b.item.replace(" por profissional", ""), valor: Math.round(b.valor) }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <Badge className="bg-[#F5B400]/15 text-[#9b6e00] border-0 mb-2">Precificador jurídico robusto</Badge>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Financeiro e Precificação Jurídica</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">Calcule honorários com custo real do escritório, mão de obra, aluguel, energia, funcionários, gasolina, urgência, complexidade, risco, audiências, delegacia, tribunais e referência OAB configurável.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => exportarPdfCorporativo("Precificação Jurídica", "Custo real, piso OAB e proposta comercial", html)}><FileText className="w-4 h-4" /> PDF</Button>
          <Button className="nex-gradient-premium text-white" onClick={() => exportarExcelHtml("precificacao-juridica-completa", html)}><FileSpreadsheet className="w-4 h-4" /> Excel</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi title="Custo/hora real" value={money(result.custoHoraEscritorio)} subtitle="Baseado nos custos fixos mensais" tone="blue" />
        <Kpi title="Mínimo técnico" value={money(result.minimoTecnico)} subtitle="Cobre custo, risco e piso ético" tone="gold" />
        <Kpi title="Recomendado" value={money(result.recomendado)} subtitle="Preço comercial ideal" tone="dark" />
        <Kpi title="Margem estimada" value={`${result.margemRealEstimada.toFixed(1)}%`} subtitle="Após impostos e reserva de risco" tone="green" />
      </div>

      <Tabs defaultValue="precificador" className="space-y-5">
        <TabsList className="flex flex-wrap h-auto p-1 bg-card border">
          <TabsTrigger value="precificador"><Calculator className="w-4 h-4 mr-2" /> Caso e honorários</TabsTrigger>
          <TabsTrigger value="custos"><WalletCards className="w-4 h-4 mr-2" /> Centro de custos</TabsTrigger>
          <TabsTrigger value="matriz"><Scale className="w-4 h-4 mr-2" /> Matriz OAB/serviços</TabsTrigger>
          <TabsTrigger value="fluxo"><DollarSign className="w-4 h-4 mr-2" /> Fluxo</TabsTrigger>
        </TabsList>

        <TabsContent value="precificador" className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <Card className="premium-card xl:col-span-2">
              <CardHeader><CardTitle className="text-base font-black">Dados do caso</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Área do direito</Label><Select value={caso.area} onValueChange={(v) => setCaseValue("area", v as AreaDireito)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{areaOptions.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1.5"><Label>Serviço jurídico</Label><Select value={caso.servico} onValueChange={(v) => setCaseValue("servico", v as ServicoJuridico)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{serviceOptions.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div>
                  <NumberInput label="Valor da causa/proveito econômico" prefix="R$" value={caso.valorCausa} onChange={(v) => setCaseValue("valorCausa", v)} />
                  <NumberInput label="Horas técnicas do advogado" value={caso.horasTecnicas} onChange={(v) => setCaseValue("horasTecnicas", v)} />
                  <NumberInput label="Horas administrativas" value={caso.horasAdministrativas} onChange={(v) => setCaseValue("horasAdministrativas", v)} />
                  <NumberInput label="Horas de deslocamento" value={caso.horasDeslocamento} onChange={(v) => setCaseValue("horasDeslocamento", v)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border bg-muted/30 p-4">
                  <div><Label>Complexidade: {caso.complexidade}/5</Label><Slider value={[caso.complexidade]} onValueChange={([v]) => setCaseValue("complexidade", v)} min={1} max={5} step={1} className="mt-3" /></div>
                  <div><Label>Urgência: {caso.urgencia}/5</Label><Slider value={[caso.urgencia]} onValueChange={([v]) => setCaseValue("urgencia", v)} min={1} max={5} step={1} className="mt-3" /></div>
                  <div><Label>Risco: {caso.risco}/5</Label><Slider value={[caso.risco]} onValueChange={([v]) => setCaseValue("risco", v)} min={1} max={5} step={1} className="mt-3" /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <NumberInput label="Audiências de conciliação" value={caso.audienciasConciliacao} onChange={(v) => setCaseValue("audienciasConciliacao", v)} />
                  <NumberInput label="Audiências de instrução" value={caso.audienciasInstrucao} onChange={(v) => setCaseValue("audienciasInstrucao", v)} />
                  <NumberInput label="Audiências de custódia" value={caso.audienciasCustodia} onChange={(v) => setCaseValue("audienciasCustodia", v)} />
                  <NumberInput label="Idas à delegacia" value={caso.idasDelegacia} onChange={(v) => setCaseValue("idasDelegacia", v)} />
                  <NumberInput label="Idas ao tribunal/fórum" value={caso.idasTribunal} onChange={(v) => setCaseValue("idasTribunal", v)} />
                  <NumberInput label="KM total rodado" value={caso.kmTotal} onChange={(v) => setCaseValue("kmTotal", v)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {caseExpenseFields.map((field) => <NumberInput key={field.key} label={field.label} prefix="R$" value={Number(caso[field.key] || 0)} onChange={(v) => setCaseValue(field.key, v as never)} />)}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant={caso.plantao ? "default" : "outline"} className={caso.plantao ? "nex-gradient-premium text-white" : undefined} onClick={() => setCaseValue("plantao", !caso.plantao)}>Plantão/fora do expediente</Button>
                  <Button type="button" variant={caso.foraComarca ? "default" : "outline"} className={caso.foraComarca ? "nex-gradient-premium text-white" : undefined} onClick={() => setCaseValue("foraComarca", !caso.foraComarca)}>Fora da comarca</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader><CardTitle className="text-base font-black">Proposta sugerida</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl bg-blue-50 border p-4"><p className="text-xs text-blue-700">Valor mínimo técnico</p><p className="text-2xl font-black text-blue-800">{money(result.minimoTecnico)}</p></div>
                <div className="rounded-2xl bg-amber-50 border p-4"><p className="text-xs text-amber-700">Valor recomendado</p><p className="text-2xl font-black text-amber-800">{money(result.recomendado)}</p></div>
                <div className="rounded-2xl bg-slate-900 border p-4 text-white"><p className="text-xs text-white/60">Valor premium</p><p className="text-2xl font-black">{money(result.premium)}</p></div>
                <Table><TableBody>
                  <TableRow><TableCell>Entrada</TableCell><TableCell className="font-bold">{money(result.entradaSugerida)}</TableCell></TableRow>
                  <TableRow><TableCell>3x</TableCell><TableCell className="font-bold">{money(result.parcelasSugeridas[0])}</TableCell></TableRow>
                  <TableRow><TableCell>6x</TableCell><TableCell className="font-bold">{money(result.parcelasSugeridas[1])}</TableCell></TableRow>
                  <TableRow><TableCell>Êxito</TableCell><TableCell className="font-bold">{money(result.honorarioExito)}</TableCell></TableRow>
                </TableBody></Table>
                {result.alertas.map((alerta) => <div key={alerta} className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />{alerta}</div>)}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Composição do preço</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={costChart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="item" tick={{ fontSize: 10 }} /><YAxis tickFormatter={(v) => `R$ ${Number(v) / 1000}k`} /><Tooltip formatter={(v) => money(Number(v))} /><Bar dataKey="valor" radius={[8, 8, 0, 0]} fill="#0F6FFF" /></BarChart></ResponsiveContainer></CardContent></Card>
            <Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Breakdown técnico</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Valor</TableHead><TableHead>Observação</TableHead></TableRow></TableHeader><TableBody>{result.breakdown.map((b) => <TableRow key={b.item}><TableCell className="font-semibold">{b.item}</TableCell><TableCell>{money(b.valor)}</TableCell><TableCell className="text-xs text-muted-foreground">{b.observacao}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="custos" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="premium-card lg:col-span-2"><CardHeader><CardTitle className="text-base font-black">Custos fixos mensais do escritório</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{officeFields.map((field) => <NumberInput key={field.key} label={field.label} prefix="R$" value={Number(office[field.key])} onChange={(v) => setOfficeValue(field.key, v)} />)}</CardContent></Card>
            <Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Parâmetros de lucratividade</CardTitle></CardHeader><CardContent className="space-y-4"><NumberInput label="Horas produtivas por mês" value={office.horasProdutivasMes} onChange={(v) => setOfficeValue("horasProdutivasMes", v)} /><NumberInput label="Margem desejada (%)" value={office.margemLucroDesejada} onChange={(v) => setOfficeValue("margemLucroDesejada", v)} /><NumberInput label="Impostos variáveis (%)" value={office.impostosVariaveisPercentual} onChange={(v) => setOfficeValue("impostosVariaveisPercentual", v)} /><NumberInput label="Reserva de risco (%)" value={office.reservaRiscoPercentual} onChange={(v) => setOfficeValue("reservaRiscoPercentual", v)} /><NumberInput label="Custo por KM" prefix="R$" value={office.custoKm} onChange={(v) => setOfficeValue("custoKm", v)} /><div className="rounded-2xl bg-slate-900 text-white p-4"><p className="text-xs text-white/60">Custo fixo mensal</p><p className="text-2xl font-black">{money(result.custoFixoMensal)}</p><p className="text-xs text-white/60 mt-1">Custo/hora: {money(result.custoHoraEscritorio)}</p></div></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="matriz" className="space-y-5">
          <Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Matriz inicial de serviços e pisos configuráveis</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Serviço</TableHead><TableHead>Piso/referência</TableHead><TableHead>Êxito sugerido</TableHead><TableHead>Fonte/observação</TableHead></TableRow></TableHeader><TableBody>{serviceOptions.map(([key, label]) => <TableRow key={key} className={caso.servico === key ? "bg-blue-50" : undefined}><TableCell className="font-semibold">{label}</TableCell><TableCell>{money(oabMaReference[key].minimo)}</TableCell><TableCell>{(oabMaReference[key].percentualExito * 100).toFixed(0)}%</TableCell><TableCell className="text-xs text-muted-foreground">{oabMaReference[key].fonte}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
          <Card className="premium-card"><CardContent className="p-5 flex gap-3"><Scale className="w-8 h-8 text-primary flex-shrink-0" /><div><p className="font-black">Referência selecionada</p><p className="text-sm text-muted-foreground">{servicoLabels[caso.servico]} usa piso de {money(oabRef.minimo)} e honorário de êxito sugerido de {(oabRef.percentualExito * 100).toFixed(0)}%. Em produção, essa matriz deve ser editável por seccional, ano, área, cidade e política comercial do escritório.</p></div></CardContent></Card>
        </TabsContent>

        <TabsContent value="fluxo"><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5"><Card className="premium-card"><CardContent className="p-5"><TrendingUp className="w-9 h-9 p-2 rounded-xl bg-emerald-50 text-emerald-600 mb-3" /><p className="text-sm text-muted-foreground">Receita prevista</p><p className="text-2xl font-black">{formatCurrency(indicadores.receitaPrevista)}</p></CardContent></Card><Card className="premium-card"><CardContent className="p-5"><TrendingDown className="w-9 h-9 p-2 rounded-xl bg-red-50 text-red-600 mb-3" /><p className="text-sm text-muted-foreground">Custos fixos mensais</p><p className="text-2xl font-black">{money(result.custoFixoMensal)}</p></CardContent></Card><Card className="premium-card"><CardContent className="p-5"><Percent className="w-9 h-9 p-2 rounded-xl bg-amber-50 text-amber-600 mb-3" /><p className="text-sm text-muted-foreground">Margem do caso</p><p className="text-2xl font-black">{result.margemRealEstimada.toFixed(1)}%</p></CardContent></Card><Card className="premium-card"><CardContent className="p-5"><Fuel className="w-9 h-9 p-2 rounded-xl bg-blue-50 text-blue-600 mb-3" /><p className="text-sm text-muted-foreground">Deslocamento</p><p className="text-2xl font-black">{money(result.custoDeslocamento)}</p></CardContent></Card></div><Card className="premium-card"><CardHeader><CardTitle className="text-base font-black">Fluxo de caixa projetado</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={320}><AreaChart data={fluxo}><defs><linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0F6FFF" stopOpacity={0.25} /><stop offset="95%" stopColor="#0F6FFF" stopOpacity={0} /></linearGradient><linearGradient id="d" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F5B400" stopOpacity={0.25} /><stop offset="95%" stopColor="#F5B400" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="mes" /><YAxis tickFormatter={(v) => `R$ ${Number(v) / 1000}k`} /><Tooltip formatter={(v) => money(Number(v))} /><Area type="monotone" dataKey="receita" stroke="#0F6FFF" fill="url(#r)" /><Area type="monotone" dataKey="despesa" stroke="#F5B400" fill="url(#d)" /></AreaChart></ResponsiveContainer><div className="mt-5"><div className="flex justify-between text-sm mb-2"><span>Saúde financeira projetada</span><b>{Math.min(100, Math.max(0, Math.round(result.margemRealEstimada * 2)))}%</b></div><Progress value={Math.min(100, Math.max(0, result.margemRealEstimada * 2))} /></div></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
