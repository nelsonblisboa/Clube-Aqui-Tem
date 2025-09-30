import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const LoginArea = () => {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    email: "",
    senha: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Login em desenvolvimento",
      description: "Esta funcionalidade estará disponível em breve!",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.id]: e.target.value,
    });
  };

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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    value={credentials.senha}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button variant="default" size="lg" type="submit" className="w-full text-lg">
                  Entrar
                </Button>
                <div className="text-center">
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Esqueci minha senha
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LoginArea;
