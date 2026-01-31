import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Associar from "./pages/Associar";
import LeadCapture from "./pages/LeadCapture";
import LandingPage from "./pages/LandingPage";
import PagamentoSucesso from "./pages/PagamentoSucesso";
import PagamentoErro from "./pages/PagamentoErro";
import PagamentoPendente from "./pages/PagamentoPendente";
import AreaMembros from "./pages/AreaMembros";
import NotFound from "./pages/NotFound";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Contato from "./pages/Contato";
import LoginParceiro from "./pages/LoginParceiro";
import DashboardParceiro from "./pages/DashboardParceiro";
import LoginVendedor from "./pages/LoginVendedor";
import DashboardVendedor from "./pages/DashboardVendedor";
import SejaParceiro from "./pages/SejaParceiro";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import CuponsDesconto from "./pages/CuponsDesconto";
import BackToTop from "./components/BackToTop";
import ScrollToTop from "./components/ScrollToTop";
import ReferralTracker from "./components/ReferralTracker";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ScrollToTop />
          <ReferralTracker />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BackToTop />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
