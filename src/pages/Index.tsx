import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import SavingsCounter from "@/components/SavingsCounter";
import Benefits from "@/components/Benefits";
import PartnerCTA from "@/components/PartnerCTA";
import LoginArea from "@/components/LoginArea";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import VendaVendedor from "./VendaVendedor";

const Index = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");

  // Se houver um código de referência (vendedor), mostra a página de vendas personalizada
  if (ref) {
    return <VendaVendedor />;
  }

  return (
    <div className="min-h-screen">
      <SEO
        title="Economize Todos os Dias"
        description="O Clube Aqui Tem Vantagens e Benefícios oferece descontos exclusivos, telemedicina 24h e assistência funeral por apenas R$19,99/mês. Associe-se agora!"
      />
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <SavingsCounter />
        <Benefits />
        <PartnerCTA />
        <LoginArea />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
