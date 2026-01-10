import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const PagamentoSucesso = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-8 px-4">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-primary/20 shadow-xl text-center">
            <CardHeader className="pb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-14 h-14 text-primary" />
              </motion.div>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <PartyPopper className="w-6 h-6 text-accent" />
                <span className="text-accent font-brand font-bold">Parabéns!</span>
                <PartyPopper className="w-6 h-6 text-accent" />
              </div>

              <CardTitle className="text-2xl md:text-3xl font-brand text-primary">
                Pagamento Confirmado!
              </CardTitle>
              <CardDescription className="text-base font-body">
                Você agora é um associado do Clube Aqui Tem
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                <h4 className="font-brand font-semibold text-foreground mb-2">Próximos passos:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Você receberá um email com seus dados de acesso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Baixe o app ou acesse o portal de associados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Comece a aproveitar seus descontos exclusivos!</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-center gap-2">
                <img src={logo} alt="Clube Aqui Tem" className="h-8 w-auto" />
                <span className="font-brand text-lg">
                  <span className="text-primary font-bold">Clube</span>
                  <span className="text-accent font-extrabold"> Aqui Tem</span>
                </span>
              </div>

              <div className="space-y-3">
                <Link to="/minha-conta">
                  <Button variant="hero" size="lg" className="w-full shadow-accent">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Acessar Minha Conta
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full">
                    <Home className="w-5 h-5 mr-2" />
                    Voltar para o Início
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PagamentoSucesso;
