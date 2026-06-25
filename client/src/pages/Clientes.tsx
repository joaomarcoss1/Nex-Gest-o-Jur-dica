import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus, Search, Users, Building2, Phone, Mail, MapPin,
  Eye, Edit, Filter, UserCheck, UserX, UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  ativo: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inativo: "bg-gray-100 text-gray-600 border-gray-200",
  prospecto: "bg-blue-100 text-blue-700 border-blue-200",
};

const statusLabels: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  prospecto: "Prospecto",
};

function ClienteCard({ cliente, onView }: { cliente: any; onView: (c: any) => void }) {
  return (
    <Card className="card-hover border-border/60 cursor-pointer" onClick={() => onView(cliente)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm",
            cliente.tipo === "pj" ? "bg-violet-500" : "bg-primary"
          )}>
            {cliente.tipo === "pj" ? <Building2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm truncate">{cliente.nome}</h3>
              <Badge variant="outline" className={cn("text-xs", statusColors[cliente.status ?? "ativo"])}>
                {statusLabels[cliente.status ?? "ativo"]}
              </Badge>
              <Badge variant="outline" className="text-xs bg-muted">
                {cliente.tipo === "pj" ? "PJ" : "PF"}
              </Badge>
            </div>
            {cliente.tipo === "pj" && cliente.cnpj && (
              <p className="text-xs text-muted-foreground mt-0.5">CNPJ: {cliente.cnpj}</p>
            )}
            {cliente.tipo === "pf" && cliente.cpf && (
              <p className="text-xs text-muted-foreground mt-0.5">CPF: {cliente.cpf}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {cliente.telefone && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" /> {cliente.telefone}
                </span>
              )}
              {cliente.email && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="w-3 h-3" /> {cliente.email}
                </span>
              )}
              {cliente.cidade && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {cliente.cidade}/{cliente.estado}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); onView(cliente); }}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NovoClienteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tipo, setTipo] = useState<"pf" | "pj">("pf");
  const [form, setForm] = useState<Record<string, string>>({});
  const utils = trpc.useUtils();
  const criar = trpc.clientes.criar.useMutation({
    onSuccess: () => {
      toast.success("Cliente cadastrado com sucesso!");
      utils.clientes.listar.invalidate();
      onClose();
      setForm({});
    },
    onError: (e) => toast.error("Erro ao cadastrar: " + e.message),
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) return toast.error("Nome é obrigatório");
    criar.mutate({ tipo, nome: form.nome, ...form } as any);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Novo Cliente
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={tipo === "pf" ? "default" : "outline"} onClick={() => setTipo("pf")} className="gap-2">
              <Users className="w-4 h-4" /> Pessoa Física
            </Button>
            <Button type="button" variant={tipo === "pj" ? "default" : "outline"} onClick={() => setTipo("pj")} className="gap-2">
              <Building2 className="w-4 h-4" /> Pessoa Jurídica
            </Button>
          </div>

          {tipo === "pf" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Nome Completo *</Label><Input value={form.nome ?? ""} onChange={(e) => set("nome", e.target.value)} placeholder="Nome completo" /></div>
              <div><Label>CPF</Label><Input value={form.cpf ?? ""} onChange={(e) => set("cpf", e.target.value)} placeholder="000.000.000-00" /></div>
              <div><Label>RG</Label><Input value={form.rg ?? ""} onChange={(e) => set("rg", e.target.value)} placeholder="RG" /></div>
              <div><Label>Data de Nascimento</Label><Input type="date" value={form.dataNascimento ?? ""} onChange={(e) => set("dataNascimento", e.target.value)} /></div>
              <div><Label>Status</Label>
                <Select value={form.status ?? "ativo"} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="prospecto">Prospecto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Razão Social *</Label><Input value={form.nome ?? ""} onChange={(e) => set("nome", e.target.value)} placeholder="Razão social" /></div>
              <div><Label>Nome Fantasia</Label><Input value={form.nomeFantasia ?? ""} onChange={(e) => set("nomeFantasia", e.target.value)} /></div>
              <div><Label>CNPJ</Label><Input value={form.cnpj ?? ""} onChange={(e) => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00" /></div>
              <div><Label>Inscrição Estadual</Label><Input value={form.inscricaoEstadual ?? ""} onChange={(e) => set("inscricaoEstadual", e.target.value)} /></div>
              <div><Label>Responsável</Label><Input value={form.responsavel ?? ""} onChange={(e) => set("responsavel", e.target.value)} /></div>
            </div>
          )}

          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-2 text-muted-foreground">Contato</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Telefone</Label><Input value={form.telefone ?? ""} onChange={(e) => set("telefone", e.target.value)} placeholder="(00) 00000-0000" /></div>
              <div><Label>WhatsApp</Label><Input value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} placeholder="(00) 00000-0000" /></div>
              <div className="col-span-2"><Label>E-mail</Label><Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="email@exemplo.com" /></div>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-2 text-muted-foreground">Endereço</p>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>CEP</Label><Input value={form.cep ?? ""} onChange={(e) => set("cep", e.target.value)} placeholder="00000-000" /></div>
              <div className="col-span-2"><Label>Logradouro</Label><Input value={form.logradouro ?? ""} onChange={(e) => set("logradouro", e.target.value)} /></div>
              <div><Label>Número</Label><Input value={form.numero ?? ""} onChange={(e) => set("numero", e.target.value)} /></div>
              <div><Label>Complemento</Label><Input value={form.complemento ?? ""} onChange={(e) => set("complemento", e.target.value)} /></div>
              <div><Label>Bairro</Label><Input value={form.bairro ?? ""} onChange={(e) => set("bairro", e.target.value)} /></div>
              <div><Label>Cidade</Label><Input value={form.cidade ?? ""} onChange={(e) => set("cidade", e.target.value)} /></div>
              <div><Label>Estado</Label><Input value={form.estado ?? ""} onChange={(e) => set("estado", e.target.value)} maxLength={2} placeholder="SP" /></div>
            </div>
          </div>

          <div><Label>Observações</Label><Textarea value={form.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value)} rows={2} /></div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={criar.isPending}>
              {criar.isPending ? "Salvando..." : "Cadastrar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Clientes() {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [novoOpen, setNovoOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);

  const { data: clientes, isLoading } = trpc.clientes.listar.useQuery(
    statusFiltro !== "todos" ? { status: statusFiltro } : undefined
  );

  const filtrados = clientes?.filter((c) =>
    !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.email?.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf?.includes(busca) || c.cnpj?.includes(busca)
  ) ?? [];

  const ativos = clientes?.filter((c) => c.status === "ativo").length ?? 0;
  const inativos = clientes?.filter((c) => c.status === "inativo").length ?? 0;
  const prospectos = clientes?.filter((c) => c.status === "prospecto").length ?? 0;

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>CRM Jurídico</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestão de clientes e relacionamentos</p>
        </div>
        <Button onClick={() => setNovoOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Ativos", value: ativos, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Inativos", value: inativos, icon: UserX, color: "text-gray-600", bg: "bg-gray-50" },
          { label: "Prospectos", value: prospectos, icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", s.bg)}>
                <s.icon className={cn("w-4.5 h-4.5", s.color)} size={18} />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nome, CPF, CNPJ ou e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
            <SelectItem value="prospecto">Prospectos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Nenhum cliente encontrado</p>
          <p className="text-sm mt-1">Cadastre o primeiro cliente clicando em "Novo Cliente"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtrados.map((c) => (
            <ClienteCard key={c.id} cliente={c} onView={setClienteSelecionado} />
          ))}
        </div>
      )}

      <NovoClienteDialog open={novoOpen} onClose={() => setNovoOpen(false)} />

      {/* Detail Dialog */}
      {clienteSelecionado && (
        <Dialog open={!!clienteSelecionado} onOpenChange={() => setClienteSelecionado(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {clienteSelecionado.tipo === "pj" ? <Building2 className="w-5 h-5 text-violet-500" /> : <Users className="w-5 h-5 text-primary" />}
                {clienteSelecionado.nome}
                <Badge variant="outline" className={cn("text-xs ml-2", statusColors[clienteSelecionado.status ?? "ativo"])}>
                  {statusLabels[clienteSelecionado.status ?? "ativo"]}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="dados">
              <TabsList className="w-full">
                <TabsTrigger value="dados" className="flex-1">Dados</TabsTrigger>
                <TabsTrigger value="contato" className="flex-1">Contato</TabsTrigger>
                <TabsTrigger value="historico" className="flex-1">Histórico</TabsTrigger>
              </TabsList>
              <TabsContent value="dados" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  {clienteSelecionado.tipo === "pf" ? (
                    <>
                      {clienteSelecionado.cpf && <div><p className="text-xs text-muted-foreground">CPF</p><p className="font-medium">{clienteSelecionado.cpf}</p></div>}
                      {clienteSelecionado.rg && <div><p className="text-xs text-muted-foreground">RG</p><p className="font-medium">{clienteSelecionado.rg}</p></div>}
                      {clienteSelecionado.dataNascimento && <div><p className="text-xs text-muted-foreground">Nascimento</p><p className="font-medium">{format(new Date(clienteSelecionado.dataNascimento), "dd/MM/yyyy")}</p></div>}
                    </>
                  ) : (
                    <>
                      {clienteSelecionado.cnpj && <div><p className="text-xs text-muted-foreground">CNPJ</p><p className="font-medium">{clienteSelecionado.cnpj}</p></div>}
                      {clienteSelecionado.responsavel && <div><p className="text-xs text-muted-foreground">Responsável</p><p className="font-medium">{clienteSelecionado.responsavel}</p></div>}
                    </>
                  )}
                  <div><p className="text-xs text-muted-foreground">Cadastrado em</p><p className="font-medium">{format(new Date(clienteSelecionado.createdAt), "dd/MM/yyyy")}</p></div>
                </div>
                {clienteSelecionado.observacoes && (
                  <div><p className="text-xs text-muted-foreground mb-1">Observações</p><p className="text-sm bg-muted/50 rounded-lg p-3">{clienteSelecionado.observacoes}</p></div>
                )}
              </TabsContent>
              <TabsContent value="contato" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  {clienteSelecionado.telefone && <div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium">{clienteSelecionado.telefone}</p></div>}
                  {clienteSelecionado.whatsapp && <div><p className="text-xs text-muted-foreground">WhatsApp</p><p className="font-medium">{clienteSelecionado.whatsapp}</p></div>}
                  {clienteSelecionado.email && <div className="col-span-2"><p className="text-xs text-muted-foreground">E-mail</p><p className="font-medium">{clienteSelecionado.email}</p></div>}
                </div>
                {clienteSelecionado.logradouro && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Endereço</p>
                    <p className="text-sm">{clienteSelecionado.logradouro}, {clienteSelecionado.numero} {clienteSelecionado.complemento}</p>
                    <p className="text-sm">{clienteSelecionado.bairro} - {clienteSelecionado.cidade}/{clienteSelecionado.estado} - CEP: {clienteSelecionado.cep}</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="historico" className="mt-3">
                <AtendimentosTab clienteId={clienteSelecionado.id} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AtendimentosTab({ clienteId }: { clienteId: number }) {
  const { data, isLoading } = trpc.clientes.atendimentos.useQuery({ clienteId });
  const [form, setForm] = useState({ titulo: "", descricao: "", tipo: "consulta", dataAtendimento: "" });
  const utils = trpc.useUtils();
  const criar = trpc.clientes.criarAtendimento.useMutation({
    onSuccess: () => { utils.clientes.atendimentos.invalidate(); setForm({ titulo: "", descricao: "", tipo: "consulta", dataAtendimento: "" }); },
  });

  const tipoLabels: Record<string, string> = { consulta: "Consulta", reuniao: "Reunião", ligacao: "Ligação", email: "E-mail", whatsapp: "WhatsApp", outro: "Outro" };

  return (
    <div className="space-y-3">
      <div className="bg-muted/40 rounded-lg p-3 space-y-2">
        <p className="text-sm font-medium">Registrar Atendimento</p>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Título" value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} />
          <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(tipoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="datetime-local" value={form.dataAtendimento} onChange={(e) => setForm((p) => ({ ...p, dataAtendimento: e.target.value }))} className="col-span-2" />
          <Textarea placeholder="Descrição..." value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} rows={2} className="col-span-2" />
        </div>
        <Button size="sm" onClick={() => criar.mutate({ clienteId, ...form, tipo: form.tipo as any })} disabled={!form.dataAtendimento || criar.isPending}>Registrar</Button>
      </div>
      {isLoading ? <Skeleton className="h-20 w-full" /> : data?.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum atendimento registrado</p>
      ) : (
        <div className="space-y-2">
          {data?.map((a) => (
            <div key={a.id} className="flex gap-3 p-3 rounded-lg bg-muted/40">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{a.titulo || tipoLabels[a.tipo ?? "consulta"]}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(a.dataAtendimento), "dd/MM/yyyy HH:mm")} · {tipoLabels[a.tipo ?? "consulta"]}</p>
                {a.descricao && <p className="text-xs mt-1">{a.descricao}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
