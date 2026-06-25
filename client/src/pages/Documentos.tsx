import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import SignaturePad from "@/components/SignaturePad";
import { cn } from "@/lib/utils";
import {
  assinaturasTableHtml,
  documentosTableHtml,
  exportarExcelHtml,
  exportarPdfCorporativo,
  type DocumentoCliente,
  type DocumentoStatus,
  useNexData,
} from "@/lib/nexData";
import { toast } from "sonner";
import { CheckCircle2, Download, Edit3, FileCheck2, FilePenLine, FileSpreadsheet, FileText, PenLine, ScanLine, ShieldCheck } from "lucide-react";

const statusOptions: DocumentoStatus[] = ["Recebido", "Em análise", "Pendente correção", "Aprovado", "Protocolado", "Arquivado"];

const statusStyle: Record<DocumentoStatus, string> = {
  Recebido: "bg-blue-100 text-blue-700 border-blue-200",
  "Em análise": "bg-amber-100 text-amber-700 border-amber-200",
  "Pendente correção": "bg-red-100 text-red-700 border-red-200",
  Aprovado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Protocolado: "bg-violet-100 text-violet-700 border-violet-200",
  Arquivado: "bg-slate-100 text-slate-600 border-slate-200",
};

function applyImageEdit(src: string, brightness: number, contrast: number, rotation: number) {
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const rotated = rotation % 180 !== 0;
      canvas.width = rotated ? img.height : img.width;
      canvas.height = rotated ? img.width : img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(src);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(92%)`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.filter = "none";
      ctx.fillStyle = "rgba(255,255,255,.92)";
      ctx.fillRect(22, canvas.height - 50, 360, 28);
      ctx.fillStyle = "#0B1F3A";
      ctx.font = "bold 16px Arial";
      ctx.fillText("Editado no Gestão Jurídica Nex", 34, canvas.height - 31);
      resolve(canvas.toDataURL("image/jpeg", 0.94));
    };
    img.src = src;
  });
}

function DocumentoEditor({ documento, open, onClose }: { documento: DocumentoCliente | null; open: boolean; onClose: () => void }) {
  const { state, atualizarDocumento, protocolarDocumento, salvarAssinatura } = useNexData();
  const [brightness, setBrightness] = useState([108]);
  const [contrast, setContrast] = useState([118]);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus] = useState<DocumentoStatus>(documento?.status ?? "Em análise");
  const [observacao, setObservacao] = useState(documento?.observacaoInterna ?? "");
  const [protocolo, setProtocolo] = useState(documento?.protocolo ?? "");
  const [assinanteId, setAssinanteId] = useState(state.funcionarios[0]?.id ?? "");

  if (!documento) return null;
  const processo = state.processos.find((p) => p.id === documento.processoId);
  const assinante = state.funcionarios.find((f) => f.id === assinanteId);

  const salvarEdicao = async () => {
    const preview = documento.preview ? await applyImageEdit(documento.preview, brightness[0], contrast[0], rotation) : documento.preview;
    atualizarDocumento(documento.id, {
      preview,
      status,
      observacaoInterna: observacao,
      editadoPor: assinante?.nome ?? "Advogado responsável",
      origem: preview ? "Editor" : documento.origem,
      qualidade: Math.min(99, Math.max(documento.qualidade ?? 88, Math.round((brightness[0] + contrast[0]) / 2 - 12))),
    });
    toast.success("Documento revisado, editado e salvo no processo.");
  };

  const protocolar = () => {
    if (!protocolo.trim()) return toast.error("Informe o número do protocolo.");
    protocolarDocumento(documento.id, protocolo);
    toast.success("Documento marcado como protocolado.");
  };

  const assinar = (dataUrl: string) => {
    if (!assinante) return toast.error("Selecione o advogado/funcionário assinante.");
    salvarAssinatura({
      pessoaTipo: assinante.cargo === "Advogado" || assinante.cargo === "Advogado auxiliar" ? "advogado" : assinante.cargo === "Sócio" ? "socio" : "funcionario",
      pessoaId: assinante.id,
      nome: assinante.nome,
      papel: assinante.cargo,
      assinaturaDataUrl: dataUrl,
      documentoId: documento.id,
    });
    toast.success("Assinatura digital vinculada ao documento.");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FilePenLine className="w-5 h-5 text-primary" /> Revisar, editar e assinar documento</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Card className="premium-card overflow-hidden">
            <CardHeader><CardTitle className="text-base font-black">Pré-visualização editável</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-slate-950/95 min-h-[420px] flex items-center justify-center overflow-hidden">
                {documento.preview ? (
                  <img
                    src={documento.preview}
                    alt={documento.nome}
                    className="max-h-[540px] w-full object-contain transition-all duration-300"
                    style={{ filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%)`, transform: `rotate(${rotation}deg)` }}
                  />
                ) : (
                  <div className="text-center text-white/70 p-8"><FileText className="w-14 h-14 mx-auto mb-3" /> Documento sem imagem demonstrativa.</div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Brilho: {brightness[0]}%</Label><Slider value={brightness} onValueChange={setBrightness} min={70} max={150} step={1} className="mt-3" /></div>
                <div><Label>Contraste: {contrast[0]}%</Label><Slider value={contrast} onValueChange={setContrast} min={70} max={170} step={1} className="mt-3" /></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setRotation((r) => (r + 90) % 360)}>Girar 90°</Button>
                <Button onClick={salvarEdicao} className="nex-gradient-premium text-white"><Edit3 className="w-4 h-4" /> Aplicar edição</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="premium-card">
              <CardHeader><CardTitle className="text-base font-black">Dados jurídicos</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Cliente</p><b>{documento.cliente}</b></div>
                  <div className="rounded-2xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Processo</p><b>{processo?.numero ?? "Não vinculado"}</b></div>
                  <div className="rounded-2xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Qualidade</p><b>{documento.qualidade ?? 0}%</b></div>
                  <div className="rounded-2xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Assinaturas</p><b>{documento.assinaturasIds?.length ?? 0}</b></div>
                </div>
                <div><Label>Status</Label><Select value={status} onValueChange={(v) => setStatus(v as DocumentoStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Observação interna do advogado</Label><Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={4} placeholder="Ex.: ajustar nitidez, solicitar nova via, aprovado para protocolo..." /></div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-end"><div><Label>Número do protocolo</Label><Input value={protocolo} onChange={(e) => setProtocolo(e.target.value)} placeholder="Ex.: TJMA-2026-000123" /></div><Button onClick={protocolar} variant="outline"><FileCheck2 className="w-4 h-4" /> Protocolar</Button></div>
              </CardContent>
            </Card>
            <Card className="premium-card">
              <CardHeader><CardTitle className="text-base font-black flex items-center gap-2"><PenLine className="w-5 h-5 text-primary" /> Assinatura digital</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Assinante</Label><Select value={assinanteId} onValueChange={setAssinanteId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{state.funcionarios.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome} · {f.cargo}</SelectItem>)}</SelectContent></Select></div>
                <SignaturePad label="Assinatura do advogado/funcionário" onSave={assinar} height={150} />
              </CardContent>
            </Card>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Fechar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Documentos() {
  const { state } = useNexData();
  const [selected, setSelected] = useState<DocumentoCliente | null>(null);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const documentosHtml = documentosTableHtml(state);
  const assinaturasHtml = assinaturasTableHtml(state);

  const filtrados = useMemo(() => state.documentos.filter((d) => {
    const texto = `${d.nome} ${d.cliente} ${d.tipo} ${d.protocolo ?? ""}`.toLowerCase();
    const matchBusca = texto.includes(busca.toLowerCase());
    const matchStatus = statusFiltro === "todos" || d.status === statusFiltro;
    return matchBusca && matchStatus;
  }), [state.documentos, busca, statusFiltro]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><Badge className="bg-primary/10 text-primary border-0 mb-2"><ScanLine className="w-3.5 h-3.5 mr-1" /> Central documental</Badge><h1 className="text-2xl lg:text-3xl font-black tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Documentos, protocolos e assinaturas</h1><p className="text-sm text-muted-foreground mt-1">Revise documentos enviados pelo cliente, edite a imagem digitalizada, protocole, assine e anexe ao processo.</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => exportarPdfCorporativo("Relatório de Documentos", "Documentos, qualidade, protocolos e anexos", documentosHtml)}><Download className="w-4 h-4" /> PDF</Button><Button variant="outline" onClick={() => exportarExcelHtml("documentos-protocolos", documentosHtml)}><FileSpreadsheet className="w-4 h-4" /> Excel</Button></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="premium-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Documentos</p><p className="text-2xl font-black">{state.documentos.length}</p></CardContent></Card>
        <Card className="premium-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-2xl font-black">{state.documentos.filter((d) => ["Recebido", "Em análise", "Pendente correção"].includes(d.status)).length}</p></CardContent></Card>
        <Card className="premium-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Protocolados</p><p className="text-2xl font-black">{state.documentos.filter((d) => d.status === "Protocolado").length}</p></CardContent></Card>
        <Card className="premium-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Assinaturas válidas</p><p className="text-2xl font-black">{state.assinaturas.filter((a) => a.status === "Válida").length}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="documentos" className="space-y-5">
        <TabsList className="flex flex-wrap h-auto p-1 bg-card border"><TabsTrigger value="documentos"><FileText className="w-4 h-4 mr-2" /> Documentos</TabsTrigger><TabsTrigger value="assinaturas"><ShieldCheck className="w-4 h-4 mr-2" /> Assinaturas</TabsTrigger></TabsList>
        <TabsContent value="documentos" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3"><Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar documento, cliente, protocolo..." /><Select value={statusFiltro} onValueChange={setStatusFiltro}><SelectTrigger className="w-full md:w-56"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os status</SelectItem>{statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <Card className="premium-card"><CardContent className="p-0 overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Documento</TableHead><TableHead>Cliente</TableHead><TableHead>Status</TableHead><TableHead>Qualidade</TableHead><TableHead>Protocolo</TableHead><TableHead>Assinaturas</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader><TableBody>{filtrados.map((d) => <TableRow key={d.id}><TableCell><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div><div><p className="font-black">{d.nome}</p><p className="text-xs text-muted-foreground">{d.tipo} · {d.origem} · {d.hash}</p></div></div></TableCell><TableCell>{d.cliente}</TableCell><TableCell><Badge variant="outline" className={cn("text-xs", statusStyle[d.status])}>{d.status}</Badge></TableCell><TableCell>{d.qualidade ?? 0}%</TableCell><TableCell>{d.protocolo ?? "—"}</TableCell><TableCell>{d.assinaturasIds?.length ?? 0}</TableCell><TableCell><Button size="sm" onClick={() => setSelected(d)} className="nex-gradient-premium text-white"><Edit3 className="w-4 h-4" /> Revisar</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </TabsContent>
        <TabsContent value="assinaturas" className="space-y-4">
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => exportarPdfCorporativo("Relatório de Assinaturas", "Validação eletrônica de advogados, funcionários e clientes", assinaturasHtml)}><Download className="w-4 h-4" /> PDF</Button><Button variant="outline" onClick={() => exportarExcelHtml("assinaturas-digitais", assinaturasHtml)}><FileSpreadsheet className="w-4 h-4" /> Excel</Button></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{state.assinaturas.map((a) => <Card key={a.id} className="premium-card"><CardContent className="p-5"><div className="flex justify-between gap-3"><div><p className="font-black">{a.nome}</p><p className="text-sm text-muted-foreground">{a.papel} · {new Date(a.dataAssinatura).toLocaleString("pt-BR")}</p></div><Badge className="bg-emerald-100 text-emerald-700 border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> {a.status}</Badge></div><img src={a.assinaturaDataUrl} alt="Assinatura" className="mt-3 h-24 w-full object-contain bg-white rounded-xl border" /><p className="text-xs text-muted-foreground mt-2 break-all">Hash: {a.hash}</p></CardContent></Card>)}</div>
        </TabsContent>
      </Tabs>

      <DocumentoEditor documento={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
