import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const PartnerForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    estabelecimento: "",
    responsavel: "",
    telefone: "",
    email: "",
    endereco: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Cadastro Recebido!",
      description: "Entraremos em contato em breve para confirmar sua parceria.",
    });
    setFormData({
      estabelecimento: "",
      responsavel: "",
      telefone: "",
      email: "",
      endereco: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <section id="parceiro" className="py-16 md:py-24 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-card-hover animate-fade-in-up">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <Store size={32} className="text-accent-foreground" />
              </div>
              <CardTitle className="text-3xl md:text-4xl text-primary">
                Seja um Parceiro
              </CardTitle>
              <CardDescription className="text-lg">
                Divulgue seu comércio <span className="font-bold text-accent">gratuitamente</span> no Clube Aqui Tem e atraia novos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="estabelecimento">Nome do Estabelecimento</Label>
                  <Input
                    id="estabelecimento"
                    placeholder="Ex: Padaria São José"
                    value={formData.estabelecimento}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Nome do Responsável</Label>
                  <Input
                    id="responsavel"
                    placeholder="Seu nome completo"
                    value={formData.responsavel}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, número, bairro, cidade"
                    value={formData.endereco}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button variant="hero" size="lg" type="submit" className="w-full text-lg">
                  Quero ser Parceiro
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PartnerForm;
