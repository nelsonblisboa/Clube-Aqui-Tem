import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Schema de validação para segurança
const partnerSchema = z.object({
  estabelecimento: z.string()
    .trim()
    .min(2, "Nome do estabelecimento muito curto")
    .max(100, "Nome do estabelecimento muito longo"),
  responsavel: z.string()
    .trim()
    .min(2, "Nome do responsável muito curto")
    .max(100, "Nome do responsável muito longo"),
  telefone: z.string()
    .trim()
    .min(10, "Telefone inválido")
    .max(15, "Telefone muito longo")
    .regex(/^[\d\s()+-]+$/, "Telefone contém caracteres inválidos"),
  email: z.string()
    .trim()
    .email("Email inválido")
    .max(100, "Email muito longo"),
  endereco: z.string()
    .trim()
    .min(10, "Endereço muito curto")
    .max(200, "Endereço muito longo"),
});

// Rate limiting simples no cliente
const RATE_LIMIT_MS = 60000; // 1 minuto
const MAX_ATTEMPTS = 3;
const submissionAttempts: number[] = [];

const checkRateLimit = (): boolean => {
  const now = Date.now();
  // Remove tentativas antigas
  while (submissionAttempts.length > 0 && now - submissionAttempts[0] > RATE_LIMIT_MS) {
    submissionAttempts.shift();
  }
  
  if (submissionAttempts.length >= MAX_ATTEMPTS) {
    return false;
  }
  
  submissionAttempts.push(now);
  return true;
};

const PartnerForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    estabelecimento: "",
    responsavel: "",
    telefone: "",
    email: "",
    endereco: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Verificar rate limit
    if (!checkRateLimit()) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde 1 minuto antes de tentar novamente.",
        variant: "destructive",
      });
      return;
    }
    
    // Validar dados
    const validationResult = partnerSchema.safeParse(formData);
    
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      
      toast({
        title: "Dados inválidos",
        description: validationResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Converter para o tipo correto antes de inserir
      const partnerData = {
        estabelecimento: validationResult.data.estabelecimento,
        responsavel: validationResult.data.responsavel,
        telefone: validationResult.data.telefone,
        email: validationResult.data.email,
        endereco: validationResult.data.endereco,
      };

      const { error } = await supabase
        .from('partners')
        .insert([partnerData]);

      if (error) throw error;

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
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao enviar seu cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
    // Limpar erro do campo ao digitar
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
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
                    maxLength={100}
                    className={errors.estabelecimento ? "border-red-500" : ""}
                  />
                  {errors.estabelecimento && (
                    <p className="text-sm text-red-500">{errors.estabelecimento}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Nome do Responsável</Label>
                  <Input
                    id="responsavel"
                    placeholder="Seu nome completo"
                    value={formData.responsavel}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className={errors.responsavel ? "border-red-500" : ""}
                  />
                  {errors.responsavel && (
                    <p className="text-sm text-red-500">{errors.responsavel}</p>
                  )}
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
                      maxLength={15}
                      className={errors.telefone ? "border-red-500" : ""}
                    />
                    {errors.telefone && (
                      <p className="text-sm text-red-500">{errors.telefone}</p>
                    )}
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
                      maxLength={100}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
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
                    maxLength={200}
                    className={errors.endereco ? "border-red-500" : ""}
                  />
                  {errors.endereco && (
                    <p className="text-sm text-red-500">{errors.endereco}</p>
                  )}
                </div>
                <Button 
                  variant="hero" 
                  size="lg" 
                  type="submit" 
                  className="w-full text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Quero ser Parceiro"}
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
