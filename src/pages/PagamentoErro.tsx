import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, Home, RefreshCw, AlertTriangle, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PagamentoErro = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <SEO
        title="Ops! Algo deu errado - Clube Aqui Tem"
        description="Houve um problema ao processar seu pagamento. Não se preocupe, vamos te ajudar a resolver."
      />
      <Header />

      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
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
              <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-bold border border-destructive/20 shadow-sm">
                <AlertTriangle className="w-4 h-4" />
                Falha no Processamento
              </div>
              <h1 className="text-4xl md:text-5xl font-brand font-black text-primary leading-tight">
                Quase lá! <br />
                <span className="text-destructive underline underline-offset-8 decoration-destructive/30">Houve um erro.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Infelizmente não conseguimos confirmar seu pagamento agora. Mas não se preocupe, seus dados estão seguros.
              </p>

              <div className="bg-white/50 backdrop-blur-sm border border-border p-6 rounded-[2rem] space-y-4">
                <h4 className="font-bold text-primary flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  O que pode ter ocorrido:
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3 italic">• Dados do cartão digitados incorretamente</li>
                  <li className="flex items-center gap-3 italic">• Limite do cartão insuficiente</li>
                  <li className="flex items-center gap-3 italic">• Bloqueio de segurança do seu banco</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/associar" className="flex-1">
                  <Button variant="hero" size="lg" className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-accent/20 group">
                    Tentar novamente
                    <RefreshCw className="w-5 h-5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
                  </Button>
                </Link>
                <a href="https://wa.me/55xxxxxxxxx" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full h-14 text-lg rounded-2xl border-2 border-primary text-primary hover:bg-primary/5 transition-all">
                    Falar no suporte
                    <MessageCircle className="w-5 h-5 ml-2" />
                  </Button>
                </a>
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
                  <div className="bg-[#1A1A1A] p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <AlertTriangle className="w-32 h-32" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="w-24 h-24 bg-destructive/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-destructive/30 shadow-2xl"
                    >
                      <XCircle className="w-12 h-12 text-destructive" />
                    </motion.div>
                    <h3 className="text-3xl font-brand font-bold mb-2 text-white">Ops! Erro 402</h3>
                    <p className="text-white/60 uppercase text-[10px] font-black tracking-[4px]">Pagamento Rejeitado</p>
                  </div>
                  <div className="p-10 text-center">
                    <p className="text-muted-foreground mb-8">
                      Tente usar outro método de pagamento ou verifique com sua operadora de cartão.
                    </p>
                    <Link to="/">
                      <Button variant="ghost" className="text-primary font-bold gap-2">
                        <Home className="w-4 h-4" />
                        Voltar para o Início
                      </Button>
                    </Link>
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

export default PagamentoErro;
