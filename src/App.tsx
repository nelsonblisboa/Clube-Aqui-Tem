import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import BackToTop from "./components/BackToTop";
import ScrollToTop from "./components/ScrollToTop";
import ReferralTracker from "./components/ReferralTracker";

// Lazy loading das páginas para melhorar a performance inicial
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Admin = lazy(() => import("./pages/Admin"));
const Associar = lazy(() => import("./pages/Associar"));
const LeadCapture = lazy(() => import("./pages/LeadCapture"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const PagamentoSucesso = lazy(() => import("./pages/PagamentoSucesso"));
const PagamentoErro = lazy(() => import("./pages/PagamentoErro"));
const PagamentoPendente = lazy(() => import("./pages/PagamentoPendente"));
const AreaMembros = lazy(() => import("./pages/AreaMembros"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EsqueciSenha = lazy(() => import("./pages/EsqueciSenha"));
const RedefinirSenha = lazy(() => import("./pages/RedefinirSenha"));
const Contato = lazy(() => import("./pages/Contato"));
const LoginParceiro = lazy(() => import("./pages/LoginParceiro"));
const DashboardParceiro = lazy(() => import("./pages/DashboardParceiro"));
const LoginVendedor = lazy(() => import("./pages/LoginVendedor"));
const DashboardVendedor = lazy(() => import("./pages/DashboardVendedor"));
const SejaParceiro = lazy(() => import("./pages/SejaParceiro"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const CuponsDesconto = lazy(() => import("./pages/CuponsDesconto"));
const ValidarAssinatura = lazy(() => import("./pages/ValidarAssinatura"));
const TesteAssinatura = lazy(() => import("./pages/TesteAssinatura"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Performance: evita refetch desnecessário
      staleTime: 1000 * 60 * 5, // 5 minutos de cache em memória
    }
  }
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          basename={window.location.pathname.includes('/Clube-Aqui-Tem') ? '/Clube-Aqui-Tem' : '/'}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ScrollToTop />
          <ReferralTracker />
          <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/associar" element={<Associar />} />
              <Route path="/lp" element={<LandingPage />} />
              <Route path="/pagamento-sucesso" element={<PagamentoSucesso />} />
              <Route path="/pagamento-erro" element={<PagamentoErro />} />
              <Route path="/pagamento-pendente" element={<PagamentoPendente />} />
              <Route path="/minha-conta" element={<AreaMembros />} />
              <Route path="/esqueci-senha" element={<EsqueciSenha />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/login-parceiro" element={<LoginParceiro />} />
              <Route path="/dashboard-parceiro" element={<DashboardParceiro />} />
              <Route path="/login-vendedor" element={<LoginVendedor />} />
              <Route path="/dashboard-vendedor" element={<DashboardVendedor />} />
              <Route path="/seja-parceiro" element={<SejaParceiro />} />
              <Route path="/termos-de-uso" element={<Termos />} />
              <Route path="/politica-de-privacidade" element={<Privacidade />} />
              <Route path="/cupons" element={<CuponsDesconto />} />
              <Route path="/validar-assinatura" element={<ValidarAssinatura />} />
              <Route path="/teste-assinatura" element={<TesteAssinatura />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <BackToTop />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
