import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Home, Mail, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PagamentoPendente = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <SEO
        title="Aguardando Confirmação - Clube Aqui Tem"
        description="Seu pagamento foi recebido e está sendo processado. Em breve você terá acesso total."
      />
      <Header />

      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
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
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold border border-amber-200 shadow-sm">
                <Clock className="w-4 h-4" />
                Aguardando Compensação
              </div>
              <h1 className="text-4xl md:text-5xl font-brand font-black text-primary leading-tight">
                Quase lá! <br />
                <span className="text-amber-600 underline underline-offset-8 decoration-amber-600/30">Processando tudo.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Seu pedido foi recebido com sucesso. Agora só estamos aguardando a confirmação da operadora ou compensação do boleto.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">Aviso por E-mail</h4>
                    <p className="text-xs text-muted-foreground">Enviaremos uma notificação assim que o acesso for liberado.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">Acesso Seguro</h4>
                    <p className="text-xs text-muted-foreground">Sua segurança é nossa prioridade. O processamento é criptografado.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link to="/">
                  <Button variant="hero" size="lg" className="h-14 px-10 text-lg rounded-2xl shadow-xl shadow-accent/20 group">
                    Voltar para o Início
                    <Home className="w-5 h-5 ml-2" />
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
                  <div className="bg-amber-600 p-12 text-center text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Zap className="w-32 h-32" />
                    </div>
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-2xl"
                    >
                      <Clock className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-brand font-bold mb-2">Aguardando...</h3>
                    <p className="text-amber-100/70">Estamos quase confirmando tudo.</p>
                  </div>
                  <div className="p-10 space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-primary text-center">Prazos de compensação:</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-3xl bg-muted/30 text-center border border-muted">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">PIX / Cartão</p>
                          <p className="font-bold text-primary">Imediato</p>
                        </div>
                        <div className="p-4 rounded-3xl bg-muted/30 text-center border border-muted">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Boleto Bancário</p>
                          <p className="font-bold text-primary">até 3 dias</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-center text-muted-foreground italic leading-relaxed">
                      "Não se preocupe, entraremos em contato via e-mail assim que o sistema liberar seu acesso."
                    </p>
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

export default PagamentoPendente;
