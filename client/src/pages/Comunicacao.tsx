import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  MessageSquare, Bell, Send, CheckCheck, AlertTriangle,
  Info, CheckCircle2, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const tipoMsgConfig: Record<string, { label: string; color: string }> = {
  interno: { label: "Interno", color: "bg-blue-100 text-blue-700 border-blue-200" },
  cliente: { label: "Cliente", color: "bg-violet-100 text-violet-700 border-violet-200" },
  notificacao: { label: "Notificação", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

const tipoNotifConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  prazo: { label: "Prazo", icon: AlertTriangle, color: "text-red-500" },
  tarefa: { label: "Tarefa", icon: CheckCircle2, color: "text-blue-500" },
  processo: { label: "Processo", icon: Clock, color: "text-violet-500" },
  financeiro: { label: "Financeiro", icon: Info, color: "text-amber-500" },
  sistema: { label: "Sistema", icon: Info, color: "text-gray-500" },
};

export default function Comunicacao() {
  const { user } = useAuth();
  const [novaMensagem, setNovaMensagem] = useState("");
  const [tipoMsg, setTipoMsg] = useState("interno");

  const { data: mensagens, isLoading: msgsLoading } = trpc.mensagens.listar.useQuery();
  const { data: notificacoes, isLoading: notifsLoading } = trpc.notificacoes.listar.useQuery();
  const utils = trpc.useUtils();

  const enviar = trpc.mensagens.enviar.useMutation({
    onSuccess: () => { toast.success("Mensagem enviada!"); utils.mensagens.listar.invalidate(); setNovaMensagem(""); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const marcarLida = trpc.notificacoes.marcarLida.useMutation({
    onSuccess: () => utils.notificacoes.listar.invalidate(),
  });

  const naoLidas = notificacoes?.filter((n) => !n.lida).length ?? 0;

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>Central de Comunicação</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Mensagens internas, notificações e alertas</p>
        </div>
        {naoLidas > 0 && (
          <Badge className="bg-red-500 text-white text-sm px-3 py-1">
            <Bell className="w-3.5 h-3.5 mr-1" />
            {naoLidas} não lida{naoLidas > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="mensagens">
        <TabsList>
          <TabsTrigger value="mensagens" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Mensagens
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell className="w-4 h-4" /> Notificações
            {naoLidas > 0 && <Badge className="bg-red-500 text-white text-xs px-1.5 py-0 ml-1">{naoLidas}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mensagens" className="mt-4 space-y-4">
          {/* Compose */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Nova Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Select value={tipoMsg} onValueChange={setTipoMsg}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interno">Mensagem Interna</SelectItem>
                    <SelectItem value="cliente">Para Cliente</SelectItem>
                    <SelectItem value="notificacao">Notificação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Digite sua mensagem..."
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                rows={3}
              />
              <Button
                onClick={() => enviar.mutate({ conteudo: novaMensagem, tipo: tipoMsg as any })}
                disabled={!novaMensagem.trim() || enviar.isPending}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {enviar.isPending ? "Enviando..." : "Enviar"}
              </Button>
            </CardContent>
          </Card>

          {/* Messages list */}
          {msgsLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : mensagens?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>Nenhuma mensagem ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mensagens?.map((m) => {
                const isOwn = m.remetenteId === user?.id;
                const tipoInfo = tipoMsgConfig[m.tipo ?? "interno"];
                return (
                  <Card key={m.id} className={cn("border-border/60", isOwn && "border-primary/20 bg-primary/5")}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs",
                          isOwn ? "bg-primary" : "bg-muted-foreground/30"
                        )}>
                          {isOwn ? "Eu" : "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium">{isOwn ? "Você" : "Equipe"}</span>
                            <Badge variant="outline" className={cn("text-xs", tipoInfo.color)}>{tipoInfo.label}</Badge>
                            <span className="text-xs text-muted-foreground ml-auto">{format(new Date(m.createdAt), "dd/MM HH:mm")}</span>
                          </div>
                          <p className="text-sm mt-1">{m.conteudo}</p>
                        </div>
                        {m.lida && <CheckCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-4 space-y-3">
          {naoLidas > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => notificacoes?.filter((n) => !n.lida).forEach((n) => marcarLida.mutate({ id: n.id }))}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" /> Marcar todas como lidas
            </Button>
          )}

          {notifsLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : notificacoes?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notificacoes?.map((n) => {
                const tipoInfo = tipoNotifConfig[n.tipo ?? "sistema"];
                const TipoIcon = tipoInfo.icon;
                return (
                  <Card
                    key={n.id}
                    className={cn("border-border/60 cursor-pointer transition-colors", !n.lida && "border-primary/30 bg-primary/5")}
                    onClick={() => !n.lida && marcarLida.mutate({ id: n.id })}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted")}>
                          <TipoIcon className={cn("w-4 h-4", tipoInfo.color)} size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{n.titulo}</p>
                            {!n.lida && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                          </div>
                          {n.mensagem && <p className="text-xs text-muted-foreground mt-0.5">{n.mensagem}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.createdAt), "dd/MM/yyyy HH:mm")}</p>
                        </div>
                        {n.lida && <CheckCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
