import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Streamdown } from "streamdown";
import {
  Sparkles, Send, RotateCcw, Scale, FileText, Search,
  BookOpen, Gavel, Lightbulb, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const sugestoes = [
  { icon: Search, label: "Pesquisar jurisprudência", prompt: "Pesquise jurisprudência recente do STJ sobre responsabilidade civil por danos morais em relações de consumo." },
  { icon: FileText, label: "Analisar cláusula contratual", prompt: "Analise esta cláusula contratual e identifique possíveis riscos jurídicos: 'O contratante renuncia expressamente ao direito de arrependimento previsto no CDC.'" },
  { icon: Gavel, label: "Sugerir peça processual", prompt: "Sugira os principais argumentos e estrutura para uma petição inicial de ação de indenização por danos morais decorrentes de negativação indevida." },
  { icon: BookOpen, label: "Explicar instituto jurídico", prompt: "Explique de forma clara o instituto da prescrição intercorrente no processo civil brasileiro após o CPC/2015." },
  { icon: Scale, label: "Análise de viabilidade", prompt: "Analise a viabilidade de uma ação revisional de contrato bancário com juros abusivos. Quais são os fundamentos jurídicos e chances de êxito?" },
  { icon: Lightbulb, label: "Estratégia processual", prompt: "Quais são as melhores estratégias processuais para defesa em ação de cobrança de dívida prescrita?" },
];

export default function NexAI() {
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState<Message[]>([]);
  const [carregando, setCarregando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = trpc.nexAi.chat.useMutation({
    onSuccess: (data) => {
      setHistorico((prev) => [...prev, { role: "assistant", content: String(data.resposta), timestamp: new Date() }]);
      setCarregando(false);
    },
    onError: (e) => {
      setHistorico((prev) => [...prev, {
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        timestamp: new Date(),
      }]);
      setCarregando(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historico, carregando]);

  const enviar = (texto?: string) => {
    const msg = texto ?? mensagem;
    if (!msg.trim() || carregando) return;

    const novaMsg: Message = { role: "user", content: msg, timestamp: new Date() };
    const novoHistorico = [...historico, novaMsg];
    setHistorico(novoHistorico);
    setMensagem("");
    setCarregando(true);

    chat.mutate({
      mensagem: msg,
      historico: historico.map((m) => ({ role: m.role, content: String(m.content) })),
    });
  };

  const limpar = () => {
    setHistorico([]);
    setMensagem("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 gap-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>
              Nex AI
              <Badge className="ml-2 text-xs bg-amber-100 text-amber-700 border border-amber-200">Beta</Badge>
            </h1>
            <p className="text-xs text-muted-foreground">Assistente jurídico inteligente powered by IA</p>
          </div>
        </div>
        {historico.length > 0 && (
          <Button variant="outline" size="sm" onClick={limpar} className="gap-2">
            <RotateCcw className="w-3.5 h-3.5" /> Nova conversa
          </Button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {historico.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>Como posso ajudar?</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Sou a Nex AI, sua assistente jurídica inteligente. Posso ajudar com pesquisa de jurisprudência,
                análise de documentos, sugestão de peças processuais e muito mais.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
              {sugestoes.map((s) => (
                <button
                  key={s.label}
                  onClick={() => enviar(s.prompt)}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-card hover:bg-muted/50 hover:border-primary/30 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <s.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{s.prompt}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {historico.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-card border border-border/60 rounded-tl-sm"
                )}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none text-foreground">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p className={cn("text-xs mt-1.5", msg.role === "user" ? "text-white/60" : "text-muted-foreground")}>
                    {format(msg.timestamp, "HH:mm")}
                  </p>
                </div>
              </div>
            ))}

            {carregando && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <Card className="border-border/60 max-w-[80%]">
                  <CardContent className="p-3 space-y-2">
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-56" />
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <div className="relative flex gap-2 items-end bg-card border border-border/60 rounded-2xl p-3 focus-within:border-primary/50 transition-colors">
          <Textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Faça uma pergunta jurídica... (Enter para enviar, Shift+Enter para nova linha)"
            rows={1}
            className="flex-1 border-0 shadow-none resize-none focus-visible:ring-0 bg-transparent p-0 min-h-[24px] max-h-32"
          />
          <Button
            onClick={() => enviar()}
            disabled={!mensagem.trim() || carregando}
            size="icon"
            className="flex-shrink-0 rounded-xl w-9 h-9"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Nex AI pode cometer erros. Verifique informações importantes com fontes oficiais.
        </p>
      </div>
    </div>
  );
}
