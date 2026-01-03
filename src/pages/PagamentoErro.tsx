import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const PagamentoErro = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-8 px-4">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-destructive/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-destructive/20 shadow-xl text-center">
            <CardHeader className="pb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <XCircle className="w-14 h-14 text-destructive" />
              </motion.div>

              <CardTitle className="text-2xl md:text-3xl font-brand text-destructive">
                Pagamento não realizado
              </CardTitle>
              <CardDescription className="text-base font-body">
                Houve um problema ao processar seu pagamento
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h4 className="font-brand font-semibold text-foreground">Possíveis motivos:</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground text-left">
                  <li>• Dados do cartão incorretos</li>
                  <li>• Saldo insuficiente</li>
                  <li>• Cartão bloqueado ou vencido</li>
                  <li>• Problema temporário de conexão</li>
                </ul>
              </div>

              <div className="flex items-center justify-center gap-2">
                <img src={logo} alt="Clube Aqui Tem" className="h-8 w-auto" />
                <span className="font-brand text-lg">
                  <span className="text-primary font-bold">Clube</span>
                  <span className="text-accent font-extrabold"> Aqui Tem</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/associar" className="flex-1">
                  <Button variant="hero" size="lg" className="w-full shadow-accent">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Tentar Novamente
                  </Button>
                </Link>
                <Link to="/" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <Home className="w-5 h-5 mr-2" />
                    Voltar ao Início
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

export default PagamentoErro;
