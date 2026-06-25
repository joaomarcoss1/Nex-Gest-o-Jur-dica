import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import NexLayout from "./components/NexLayout";
import { Loader2 } from "lucide-react";

// Pages
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Processos from "./pages/Processos";
import Financeiro from "./pages/Financeiro";
import Agenda from "./pages/Agenda";
import PortalCliente from "./pages/PortalCliente";
import Funcionarios from "./pages/Funcionarios";
import Comunicacao from "./pages/Comunicacao";
import Relatorios from "./pages/Relatorios";
import Documentos from "./pages/Documentos";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl nex-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Carregando Gestão Jurídica Nex...</p>
        </div>
      </div>
    );
  }

  // Modo demonstração/local: o app abre diretamente no VS Code mesmo sem OAuth externo.
  // O backend também cria um usuário demo quando não existe sessão autenticada.
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <NexLayout>
      <Switch>
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/clientes" component={Clientes} />
        <Route path="/processos" component={Processos} />
        <Route path="/financeiro" component={Financeiro} />
        <Route path="/agenda" component={Agenda} />
        <Route path="/portal-cliente" component={PortalCliente} />
        <Route path="/funcionarios" component={Funcionarios} />
        <Route path="/documentos" component={Documentos} />
        <Route path="/comunicacao" component={Comunicacao} />
        <Route path="/relatorios" component={Relatorios} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </NexLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AuthGuard>
            <AppRoutes />
          </AuthGuard>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
