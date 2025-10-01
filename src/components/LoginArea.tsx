import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginArea = () => {
  const navigate = useNavigate();

  return (
    <section id="login" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-card-hover animate-fade-in-up">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <LogIn size={32} className="text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl text-primary">
                Área do Associado
              </CardTitle>
              <CardDescription className="text-base">
                Acesse seus cupons e benefícios exclusivos. Disponível apenas para quem assina o plano de <span className="font-bold text-accent">R$19,99/mês</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-center text-muted-foreground">
                  Cadastre-se para acessar cupons e benefícios exclusivos do Clube Aqui Tem
                </p>
                <Button 
                  variant="default" 
                  size="lg" 
                  onClick={() => navigate("/login")}
                  className="w-full text-lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Acessar Área do Associado
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LoginArea;
