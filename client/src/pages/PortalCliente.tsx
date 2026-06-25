import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import SignaturePad from "@/components/SignaturePad";
import { toast } from "sonner";
import { Camera, CheckCircle2, FileScan, FileText, Lock, MessageSquare, RefreshCcw, RotateCw, Scale, Send, ShieldCheck, Sparkles, Upload, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { calcularQualidadeDocumento, useNexData } from "@/lib/nexData";

const statusConfig: Record<string, string> = {
  "Em análise": "bg-amber-100 text-amber-700 border-amber-200",
  "Em andamento": "bg-blue-100 text-blue-700 border-blue-200",
  Audiência: "bg-purple-100 text-purple-700 border-purple-200",
  Recurso: "bg-orange-100 text-orange-700 border-orange-200",
  Cumprimento: "bg-teal-100 text-teal-700 border-teal-200",
  Encerrado: "bg-slate-100 text-slate-600 border-slate-200",
};

const tiposDocumento = ["RG", "CPF", "CNH", "Comprovante de residência", "Procuração", "Contrato", "Comprovante de pagamento", "Certidão", "Documento do processo", "Outros"];

function enhanceCanvas(source: HTMLVideoElement | HTMLImageElement, brightness = 108, contrast = 118, rotation = 0) {
  const canvas = document.createElement("canvas");
  const width = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
  const height = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
  const rotated = rotation % 180 !== 0;
  canvas.width = rotated ? (height || 720) : (width || 1280);
  canvas.height = rotated ? (width || 1280) : (height || 720);
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.filter = `contrast(${contrast}%) brightness(${brightness}%) saturate(92%)`;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(source, -(width || 1280) / 2, -(height || 720) / 2, width || 1280, height || 720);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = "none";
  ctx.strokeStyle = "rgba(15,111,255,.9)";
  ctx.lineWidth = Math.max(4, canvas.width * 0.006);
  const pad = Math.max(24, canvas.width * 0.035);
  ctx.strokeRect(pad, pad, canvas.width - pad * 2, canvas.height - pad * 2);
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.fillRect(pad, canvas.height - pad - 42, 470, 32);
  ctx.fillStyle = "#0B1F3A";
  ctx.font = "bold 18px Arial";
  ctx.fillText("Digitalizado pelo Gestão Jurídica Nex", pad + 12, canvas.height - pad - 20);
  return canvas.toDataURL("image/jpeg", 0.94);
}

function enhanceExistingDataUrl(src: string, brightness = 108, contrast = 118, rotation = 0) {
  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(enhanceCanvas(image, brightness, contrast, rotation));
    image.onerror = () => resolve(src);
    image.src = src;
  });
}

function ScannerCliente() {
  const { state, adicionarDocumento, salvarAssinatura } = useNexData();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [processoId, setProcessoId] = useState(state.processos[0]?.id ?? "");
  const [tipo, setTipo] = useState("RG");
  const [nome, setNome] = useState("");
  const [observacao, setObservacao] = useState("");
  const [assinaturaCliente, setAssinaturaCliente] = useState("");
  const [brightness, setBrightness] = useState([108]);
  const [contrast, setContrast] = useState([118]);
  const [rotation, setRotation] = useState(0);

  const processo = state.processos.find((p) => p.id === processoId) ?? state.processos[0];

  const pararCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraAtiva(false);
  };

  useEffect(() => () => pararCamera(), []);

  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraAtiva(true);
      toast.success("Câmera aberta. Posicione o documento dentro da moldura.");
    } catch {
      toast.error("Não foi possível abrir a câmera. Use o upload como alternativa.");
    }
  };

  const capturar = () => {
    if (!videoRef.current) return;
    const dataUrl = enhanceCanvas(videoRef.current, brightness[0], contrast[0], rotation);
    setPreview(dataUrl);
    pararCamera();
    toast.success("Documento capturado e tratado com correção de luz, contraste e bordas.");
  };

  const carregarArquivo = (file: File) => {
    const img = new Image();
    img.onload = () => {
      setPreview(enhanceCanvas(img, brightness[0], contrast[0], rotation));
      toast.success("Imagem importada e melhorada pelo scanner Nex.");
    };
    img.src = URL.createObjectURL(file);
  };

  const aplicarEdicao = async () => {
    if (!preview) return;
    const edited = await enhanceExistingDataUrl(preview, brightness[0], contrast[0], rotation);
    setPreview(edited);
    toast.success("Ajustes aplicados ao documento antes do envio.");
  };

  const enviar = () => {
    if (!processo) return toast.error("Selecione um processo.");
    if (!preview) return toast.error("Capture ou envie uma imagem do documento.");
    const docId = adicionarDocumento({
      processoId: processo.id,
      cliente: processo.cliente,
      tipo,
      nome: nome || `${tipo} - ${processo.cliente}.pdf`,
      origem: "Câmera",
      preview,
      descricao: observacao || "Documento enviado pelo cliente via scanner do portal.",
      qualidade: calcularQualidadeDocumento(preview),
    });
    if (assinaturaCliente) {
      salvarAssinatura({ pessoaTipo: "cliente", pessoaId: processo.cliente, nome: processo.cliente, papel: "Cliente", assinaturaDataUrl: assinaturaCliente, documentoId: docId });
    }
    toast.success("Documento digitalizado, assinado e enviado ao escritório.");
    setPreview("");
    setNome("");
    setObservacao("");
    setAssinaturaCliente("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <Card className="premium-card xl:col-span-2 overflow-hidden">
        <CardHeader><CardTitle className="text-base font-black flex items-center gap-2"><FileScan className="w-5 h-5 text-primary" /> Scanner inteligente de documentos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="scanner-frame min-h-[360px] flex items-center justify-center overflow-hidden relative">
            {cameraAtiva ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-6 rounded-2xl border-2 border-[#F5B400] shadow-[0_0_0_9999px_rgba(0,0,0,.35)]" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"><Button onClick={capturar} className="nex-gradient-premium text-white"><Camera className="w-4 h-4" /> Capturar</Button><Button variant="secondary" onClick={pararCamera}>Cancelar</Button></div>
              </>
            ) : preview ? (
              <img src={preview} alt="Documento digitalizado" className="max-h-[460px] w-full object-contain rounded-2xl transition-all duration-300" style={{ filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%)`, transform: `rotate(${rotation}deg)` }} />
            ) : (
              <div className="text-center p-8"><div className="w-16 h-16 rounded-3xl nex-gradient flex items-center justify-center mx-auto mb-4 shadow-xl"><Camera className="w-8 h-8 text-white" /></div><h3 className="font-black text-lg">Digitalização pela câmera</h3><p className="text-sm text-muted-foreground max-w-lg mx-auto mt-1">O cliente fotografa o documento, o sistema melhora a imagem, corrige luz/contraste, simula corte de bordas, cria registro com hash e vincula ao processo para o advogado revisar e editar.</p><div className="flex flex-wrap justify-center gap-2 mt-5"><Button onClick={iniciarCamera} className="nex-gradient-premium text-white"><Camera className="w-4 h-4" /> Abrir câmera</Button><Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4" /> Upload</Button></div></div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) carregarArquivo(file); }} />
          {preview && (
            <div className="rounded-2xl border bg-card/70 p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Brilho: {brightness[0]}%</Label><Slider value={brightness} onValueChange={setBrightness} min={70} max={150} step={1} className="mt-3" /></div>
                <div><Label>Contraste: {contrast[0]}%</Label><Slider value={contrast} onValueChange={setContrast} min={70} max={170} step={1} className="mt-3" /></div>
              </div>
              <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setRotation((r) => (r + 90) % 360)}><RotateCw className="w-4 h-4" /> Girar</Button><Button variant="outline" onClick={aplicarEdicao}><Sparkles className="w-4 h-4" /> Aplicar melhoria</Button><Button onClick={enviar} className="nex-gradient-premium text-white"><Send className="w-4 h-4" /> Enviar ao escritório</Button><Button variant="outline" onClick={() => setPreview("")}><RefreshCcw className="w-4 h-4" /> Refazer</Button></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader><CardTitle className="text-base font-black">Dados do envio</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Processo</Label><Select value={processoId} onValueChange={setProcessoId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{state.processos.map((p) => <SelectItem key={p.id} value={p.id}>{p.cliente} · {p.area}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Tipo de documento</Label><Select value={tipo} onValueChange={setTipo}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{tiposDocumento.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Nome do arquivo</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Opcional" /></div>
          <div><Label>Observação ao advogado</Label><Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex.: este é o RG atualizado, comprovante de residência atual..." rows={3} /></div>
          <div className="rounded-2xl border bg-blue-50 p-4 text-sm text-blue-800"><Sparkles className="w-5 h-5 mb-2" /><b>Tratamento automático:</b><br />nitidez, contraste, iluminação, marcação de bordas, hash de integridade e preparação para OCR.</div>
          <SignaturePad label="Assinatura eletrônica do cliente" onSave={setAssinaturaCliente} height={135} />
          {assinaturaCliente && <Badge className="bg-emerald-100 text-emerald-700 border-0"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Assinatura capturada</Badge>}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PortalCliente() {
  const { state } = useNexData();
  const [mensagem, setMensagem] = useState("");

  const enviarMensagem = () => {
    if (!mensagem.trim()) return;
    toast.success("Mensagem enviada ao escritório.");
    setMensagem("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><Badge className="bg-emerald-100 text-emerald-700 border-0 mb-2"><Lock className="w-3.5 h-3.5 mr-1" /> Área segura do cliente</Badge><h1 className="text-2xl lg:text-3xl font-black tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Portal do Cliente</h1><p className="text-sm text-muted-foreground mt-1">Acompanhamento de processos, comunicação e envio de documentos digitalizados pela câmera.</p></div>
      </div>

      <Card className="hero-card text-white"><CardContent className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/10 flex items-center justify-center"><UserCircle className="w-9 h-9" /></div><div><h2 className="text-2xl font-black">Olá, Cliente Nex</h2><p className="text-white/70">Acompanhe seus processos em tempo real, assine documentos e envie digitalizações sem precisar ir ao escritório.</p></div></div><div className="grid grid-cols-3 gap-3"><div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center"><p className="text-xl font-black">{state.processos.length}</p><p className="text-xs text-white/60">processos</p></div><div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center"><p className="text-xl font-black">{state.documentos.length}</p><p className="text-xs text-white/60">docs</p></div><div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center"><p className="text-xl font-black">{state.assinaturas.length}</p><p className="text-xs text-white/60">assinaturas</p></div></div></CardContent></Card>

      <Tabs defaultValue="scanner" className="space-y-5">
        <TabsList className="flex flex-wrap h-auto p-1 bg-card border"><TabsTrigger value="scanner"><Camera className="w-4 h-4 mr-2" /> Scanner</TabsTrigger><TabsTrigger value="processos"><Scale className="w-4 h-4 mr-2" /> Processos</TabsTrigger><TabsTrigger value="documentos"><FileText className="w-4 h-4 mr-2" /> Documentos</TabsTrigger><TabsTrigger value="mensagens"><MessageSquare className="w-4 h-4 mr-2" /> Mensagens</TabsTrigger></TabsList>
        <TabsContent value="scanner"><ScannerCliente /></TabsContent>
        <TabsContent value="processos"><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{state.processos.map((p) => <Card key={p.id} className="premium-card card-hover"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-mono text-muted-foreground">{p.numero}</p><h3 className="font-black mt-1">{p.cliente}</h3><p className="text-sm text-muted-foreground">{p.area} · {p.tribunal}</p></div><Badge variant="outline" className={cn("text-xs", statusConfig[p.status])}>{p.status}</Badge></div><div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Andamento atualizado pelo escritório</div></CardContent></Card>)}</div></TabsContent>
        <TabsContent value="documentos"><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{state.documentos.map((d) => <Card key={d.id} className="premium-card"><CardContent className="p-5 flex gap-4"><div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"><FileText className="w-6 h-6 text-primary" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><p className="font-black truncate">{d.nome}</p><Badge variant="outline">{d.status}</Badge></div><p className="text-sm text-muted-foreground">{d.tipo} · {d.cliente} · {d.origem} · Qualidade {d.qualidade ?? 0}%</p>{d.preview && <img src={d.preview} alt={d.nome} className="mt-3 max-h-32 rounded-xl border object-cover" />}</div></CardContent></Card>)}</div></TabsContent>
        <TabsContent value="mensagens"><Card className="premium-card max-w-3xl"><CardHeader><CardTitle className="text-base font-black">Enviar mensagem ao escritório</CardTitle></CardHeader><CardContent className="space-y-3"><Textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Digite sua dúvida ou informe sobre o documento enviado..." rows={5} /><Button onClick={enviarMensagem} className="nex-gradient-premium text-white"><Send className="w-4 h-4" /> Enviar mensagem</Button></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
