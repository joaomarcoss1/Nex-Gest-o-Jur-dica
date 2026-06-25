import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  UserCircle,
  UserCog,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Settings,
  Menu,
  Scale,
  Timer,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", label: "Dashboard Executivo", icon: LayoutDashboard, section: "principal" },
  { path: "/clientes", label: "CRM Jurídico", icon: Users, section: "principal" },
  { path: "/processos", label: "Processos e Tarefas", icon: Briefcase, section: "principal" },
  { path: "/financeiro", label: "Financeiro", icon: DollarSign, section: "principal" },
  { path: "/agenda", label: "Agenda Jurídica", icon: Calendar, section: "principal" },
  { path: "/funcionarios", label: "Ponto, Folha e Equipe", icon: Timer, section: "operacao", badge: "Novo" },
  { path: "/documentos", label: "Docs, Protocolos e Assinaturas", icon: FileCheck2, section: "operacao", badge: "Premium" },
  { path: "/portal-cliente", label: "Portal do Cliente", icon: UserCircle, section: "operacao" },
  { path: "/comunicacao", label: "Comunicação", icon: MessageSquare, section: "operacao" },
  { path: "/relatorios", label: "Relatórios Premium", icon: BarChart3, section: "gestao" },
];

const sectionLabels: Record<string, string> = {
  principal: "Jurídico",
  operacao: "Operação",
  gestao: "Inteligência de Gestão",
};

interface NexLayoutProps {
  children: React.ReactNode;
}

export default function NexLayout({ children }: NexLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const unreadCount = 3;

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "NX";

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-80" style={{ background: "radial-gradient(circle at 20% 8%, rgba(15,111,255,.28), transparent 32%), radial-gradient(circle at 100% 40%, rgba(245,180,0,.18), transparent 28%)" }} />
      <div className={cn("relative flex items-center gap-3 px-4 py-5 border-b border-white/10", collapsed && "justify-center px-2")}>
        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/15 bg-white/5 shadow-xl flex-shrink-0">
          <img src="/nexlabs-logo.jpeg" alt="NexLabs" className="w-full h-full object-cover scale-[1.85]" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-black text-white text-sm leading-tight tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Gestão Jurídica
            </div>
            <div className="text-xs font-extrabold tracking-[.18em]" style={{ color: "#F5B400", fontFamily: "Outfit, sans-serif" }}>
              NEX
            </div>
          </div>
        )}
      </div>

      <nav className="relative flex-1 overflow-y-auto py-4 px-2">
        {["principal", "operacao", "gestao"].map((section) => {
          const items = navItems.filter((i) => i.section === section);
          return (
            <div key={section} className="mb-4">
              {!collapsed && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/35">
                  {sectionLabels[section]}
                </div>
              )}
              {items.map((item) => {
                const isActive = location === item.path || location.startsWith(item.path + "/");
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-all duration-200 group border",
                        isActive
                          ? "bg-white/12 text-white border-white/15 shadow-[0_10px_30px_rgba(15,111,255,.16)]"
                          : "text-white/68 hover:bg-white/8 hover:text-white border-transparent",
                        collapsed && "justify-center px-2"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className={cn("w-4.5 h-4.5 flex-shrink-0 transition-colors", isActive ? "text-[#F5B400]" : "text-white/45 group-hover:text-white")} size={18} />
                      {!collapsed && (
                        <>
                          <span className="text-sm font-semibold flex-1">{item.label}</span>
                          {item.badge && <Badge className="text-[9px] px-1.5 py-0 h-4 bg-[#F5B400]/20 text-[#F5B400] border-0">{item.badge}</Badge>}
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className={cn("relative border-t border-white/10 p-3", collapsed && "flex justify-center")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn("flex items-center gap-3 w-full rounded-xl p-2 hover:bg-white/8 transition-colors", collapsed && "justify-center")}>
              <Avatar className="w-9 h-9 border border-white/10">
                <AvatarFallback className="nex-gradient text-white text-sm font-bold">{initials}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-white truncate">{user?.name || "Usuário Nex"}</p>
                  <p className="text-xs text-white/45 truncate">Administrador</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem><Settings className="w-4 h-4 mr-2" /> Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive"><LogOut className="w-4 h-4 mr-2" /> Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button onClick={() => setCollapsed(!collapsed)} className="relative hidden lg:flex items-center justify-center w-full py-2 border-t border-white/10 text-white/40 hover:text-white hover:bg-white/8 transition-colors">
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden nex-app-bg">
      <aside className={cn("hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out", collapsed ? "w-16" : "w-72")} style={{ background: "linear-gradient(180deg,#05070d 0%,#081327 52%,#06080e 100%)" }}>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 flex flex-col z-10" style={{ background: "linear-gradient(180deg,#05070d 0%,#081327 52%,#06080e 100%)" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-4 lg:px-7 border-b border-border/70 bg-card/85 backdrop-blur-xl">
          <button className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(true)}><Menu className="w-5 h-5" /></button>
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl nex-gradient flex items-center justify-center shadow-lg"><Scale className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-sm font-bold">SaaS jurídico corporativo</p>
              <p className="text-xs text-muted-foreground">Prazos, processos, equipe, folha e documentos em um só lugar.</p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex gap-1.5 border-[#F5B400]/30 bg-[#F5B400]/10 text-[#8a6400]"><ShieldCheck className="w-3.5 h-3.5" /> LGPD Ready</Badge>
            <Link href="/comunicacao">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#F5B400] text-[#0B0B0B] text-[10px] font-black rounded-full flex items-center justify-center">{unreadCount}</span>}
              </Button>
            </Link>
            <Link href="/funcionarios"><Button className="hidden sm:inline-flex nex-gradient-premium text-white shadow-lg">Bater ponto</Button></Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>

        <footer className="flex-shrink-0 border-t border-border/70 px-6 py-2 text-center text-xs text-muted-foreground bg-card/85 backdrop-blur-xl">
          Desenvolvido por <span className="font-bold" style={{ color: "#0F6FFF" }}>NexLabs</span>
        </footer>
      </div>
    </div>
  );
}
