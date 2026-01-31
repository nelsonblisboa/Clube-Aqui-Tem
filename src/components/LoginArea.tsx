import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Sparkles, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import membersImg from "@/assets/happy_members_clube_1769198845511.png";

const LoginArea = () => {
  const navigate = useNavigate();

  return (
    <section id="login" className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">

          {/* Coluna da Imagem e Mensagem Motivadora */}
          <div className="order-2 lg:order-1 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

              {/* Selo de Preço Dinâmico */}
              <motion.div
                initial={{ scale: 0, rotate: -20, x: 20, y: 20 }}
                animate={{ scale: 1, rotate: -8, x: 0, y: 0 }}
                whileHover={{ scale: 1.1, rotate: 0 }}
                className="absolute -top-6 -right-4 z-20"
              >
                <div className="bg-accent text-white px-6 py-3 rounded-2xl shadow-[0_10px_25px_rgba(255,145,0,0.5)] border-4 border-white transform-gpu">
                  <div className="flex flex-col items-center leading-none text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Apenas</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold">R$</span>
                      <span className="text-3xl font-black tracking-tighter">19,99</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Mensais</span>
                  </div>
                </div>
                {/* Brilho animado no selo */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-full h-full skew-x-12"
                />
              </motion.div>

              <img
                src={membersImg}
                alt="Associados Felizes"
                className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3] lg:aspect-auto"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-primary/10">
                <div className="flex items-center gap-2 text-primary font-bold mb-1">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span>Economia que transforma!</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Junte-se a milhares de famílias que já economizam mais de R$ 500,00 por mês.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Acesso Imediato</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Cupons Exclusivos</span>
              </div>
            </div>
          </div>

          {/* Coluna do Card de Login */}
          <div className="order-1 lg:order-2">
            <Card className="shadow-2xl border-primary/10 animate-fade-in-up relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <LogIn size={32} className="text-primary" />
                </div>
                <CardTitle className="text-3xl font-brand font-bold text-primary">
                  Área do Associado
                </CardTitle>
                <CardDescription className="text-base pt-2">
                  Acesse seus cupons e benefícios exclusivos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-secondary/50 p-4 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground italic">
                    "O melhor investimento para o bem-estar da minha família."
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => navigate("/minha-conta")}
                    className="w-full text-lg shadow-accent h-14 group"
                  >
                    <LogIn className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    Entrar na Minha Conta
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Ainda não é parte?</span>
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <p className="text-sm text-balance">
                      Aproveite telemedicina, descontos e seguros por apenas <span className="font-bold text-primary text-lg">R$19,99/mês</span>
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/associar")}
                      className="w-full border-2 hover:bg-primary hover:text-white transition-colors"
                    >
                      Assinar Agora e Economizar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LoginArea;
