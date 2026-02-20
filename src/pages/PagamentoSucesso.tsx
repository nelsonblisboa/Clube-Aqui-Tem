import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, PartyPopper, ArrowRight, Zap, Download, Sparkles, FileSignature } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PagamentoSucesso = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <SEO
        title="Pagamento Confirmado - Clube Aqui Tem"
        description="Parabéns! Seu pagamento foi confirmado e você agora faz parte do maior clube de benefícios."
      />
      <Header />

      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Information Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold border border-green-200 shadow-sm">
                <Sparkles className="w-4 h-4" />
                Transação Aprovada
              </div>
              <h1 className="text-4xl md:text-6xl font-brand font-black text-primary leading-tight">
                Bem-vindo ao <br />
                <span className="text-accent underline underline-offset-8 decoration-accent/30">Clube Aqui Tem!</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Parabéns! Você acaba de garantir acesso exclusivo aos melhores descontos e benefícios da região.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Acesse o Web App</h4>
                    <p className="text-sm text-muted-foreground">Sua carteirinha digital já está disponível.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm border border-accent/20">
                    <Zap className="w-6 h-6 text-accent group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Economia Imediata</h4>
                    <p className="text-sm text-muted-foreground">Apresente seu CPF nos parceiros e economize.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm border border-blue-200">
                    <FileSignature className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Assinatura Digital</h4>
                    <p className="text-sm text-muted-foreground">Enviamos o contrato para seu e-mail e WhatsApp.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link to="/minha-conta" className="flex-1">
                  <Button variant="hero" size="lg" className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-accent/20 group">
                    Acessar minha conta
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full h-14 text-lg rounded-2xl border-2">
                    Explorar Parceiros
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Visual Card Side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white group hover:translate-y-[-8px] transition-all duration-500">
                <CardContent className="p-0">
                  <div className="bg-primary p-12 text-center text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <PartyPopper className="w-32 h-32" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-2xl"
                    >
                      <CheckCircle className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-brand font-bold mb-2">Tudo Pronto!</h3>
                    <p className="text-primary-foreground/70">Sua assinatura está ativa.</p>
                  </div>
                  <div className="p-10 space-y-6">
                    <div className="flex justify-between items-center py-4 border-b border-muted">
                      <span className="text-muted-foreground">Status da Assinatura</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Ativo</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-muted">
                      <span className="text-muted-foreground">Data de Início</span>
                      <span className="font-bold text-primary">{new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-3xl border border-muted-foreground/10">
                      <p className="text-sm text-center italic text-muted-foreground">
                        "O Clube Aqui Tem transforma cada compra em uma oportunidade de economia."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PagamentoSucesso;
