import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Shield, CreditCard, CheckCircle, Loader2, Gift, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const associadoSchema = z.object({
  nome_completo: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  telefone: z.string().trim().min(10, "Telefone inválido").max(15, "Telefone inválido"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  endereco: z.string().trim().min(10, "Endereço deve ser mais detalhado").max(200, "Endereço muito longo"),
  cpf: z.string().trim().min(11, "CPF inválido").max(14, "CPF inválido"),
});

const Associar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const hasShownPopup = useRef(false);
  const [formData, setFormData] = useState({
    nome_completo: "",
    telefone: "",
    email: "",
    endereco: "",
    cpf: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if form is empty
  const isFormEmpty = () => {
    return !formData.nome_completo && !formData.telefone && !formData.email && !formData.endereco && !formData.cpf;
  };

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownPopup.current && !discountApplied) {
        setShowExitPopup(true);
        hasShownPopup.current = true;
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFormEmpty() && !discountApplied) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [discountApplied]);

  const handleApplyDiscount = () => {
    setDiscountApplied(true);
    setShowExitPopup(false);
    toast({
      title: "🎉 Desconto aplicado!",
      description: "Você ganhou 5% de desconto! Novo valor: R$18,99/mês",
    });
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cpf") {
      formattedValue = formatCPF(value);
    } else if (name === "telefone") {
      formattedValue = formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData = associadoSchema.parse(formData);

      // Call edge function to create Mercado Pago preference
      const { data, error } = await supabase.functions.invoke("create-mercadopago-preference", {
        body: {
          payer: {
            name: validatedData.nome_completo,
            email: validatedData.email,
            phone: validatedData.telefone,
            address: validatedData.endereco,
            cpf: validatedData.cpf.replace(/\D/g, ""),
          },
          discountApplied,
        },
      });

      if (error) {
        throw new Error(error.message || "Erro ao processar pagamento");
      }

      if (data?.init_point) {
        toast({
          title: "Redirecionando para pagamento",
          description: "Você será redirecionado para o Mercado Pago",
        });
        
        // Redirect to Mercado Pago checkout
        window.location.href = data.init_point;
      } else {
        throw new Error("URL de pagamento não recebida");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: "Por favor, corrija os campos destacados",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao processar sua solicitação",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto max-w-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Clube Aqui Tem" className="h-10 w-auto" />
            <span className="font-brand text-xl">
              <span className="text-primary font-bold">Clube</span>
              <span className="text-accent font-extrabold"> Aqui Tem</span>
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-brand text-primary">
                Torne-se um Associado
              </CardTitle>
              <CardDescription className="text-base font-body">
                Preencha seus dados para finalizar a assinatura
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Benefits reminder */}
              {discountApplied && (
                <div className="bg-green-500/10 rounded-xl p-4 mb-4 border border-green-500/30 flex items-center gap-3">
                  <Gift className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-700">🎉 Desconto de 5% aplicado!</p>
                    <p className="text-sm text-green-600">De <s>R$19,99</s> por apenas <strong>R$18,99/mês</strong></p>
                  </div>
                </div>
              )}

              <div className="bg-accent/10 rounded-xl p-4 mb-6 border border-accent/20">
                <h4 className="font-brand font-semibold text-accent mb-2">
                  Por apenas {discountApplied ? "R$18,99" : "R$19,99"}/mês você terá:
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Descontos de até 50% em centenas de parceiros</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Telemedicina e orientação de saúde 24h</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Assistência residencial e automotiva</span>
                  </li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_completo">Nome Completo *</Label>
                  <Input
                    id="nome_completo"
                    name="nome_completo"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={formData.nome_completo}
                    onChange={handleChange}
                    className={errors.nome_completo ? "border-destructive" : ""}
                    required
                  />
                  {errors.nome_completo && (
                    <p className="text-sm text-destructive">{errors.nome_completo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={handleChange}
                    maxLength={14}
                    className={errors.cpf ? "border-destructive" : ""}
                    required
                  />
                  {errors.cpf && (
                    <p className="text-sm text-destructive">{errors.cpf}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-destructive" : ""}
                      required
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={handleChange}
                      maxLength={15}
                      className={errors.telefone ? "border-destructive" : ""}
                      required
                    />
                    {errors.telefone && (
                      <p className="text-sm text-destructive">{errors.telefone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo *</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    type="text"
                    placeholder="Rua, número, bairro, cidade - UF"
                    value={formData.endereco}
                    onChange={handleChange}
                    className={errors.endereco ? "border-destructive" : ""}
                    required
                  />
                  {errors.endereco && (
                    <p className="text-sm text-destructive">{errors.endereco}</p>
                  )}
                </div>

                {/* Security badge */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Seus dados estão protegidos e o pagamento é processado pelo Mercado Pago</span>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full text-lg shadow-accent"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Ir para Pagamento - {discountApplied ? "R$18,99" : "R$19,99"}/mês
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Ao continuar, você concorda com nossos{" "}
                  <Link to="#" className="text-primary hover:underline">Termos de Uso</Link>
                  {" "}e{" "}
                  <Link to="#" className="text-primary hover:underline">Política de Privacidade</Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exit Intent Popup */}
        <Dialog open={showExitPopup} onOpenChange={setShowExitPopup}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10 text-accent" />
              </div>
              <DialogTitle className="text-2xl font-brand text-center">
                Espere! Temos uma oferta especial 🎁
              </DialogTitle>
              <DialogDescription className="text-center text-base pt-2">
                Não vá embora ainda! Complete seu cadastro agora e ganhe <span className="font-bold text-accent">5% de desconto</span> no primeiro mês!
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl p-6 text-center my-4">
              <p className="text-muted-foreground mb-2">De <s className="text-lg">R$19,99/mês</s></p>
              <p className="text-3xl font-brand font-bold text-accent">R$18,99/mês</p>
              <p className="text-sm text-muted-foreground mt-2">Economia de R$1,00 por mês!</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={handleApplyDiscount}
              >
                <Gift className="w-5 h-5 mr-2" />
                Quero meu desconto de 5%!
              </Button>
              <Button 
                variant="ghost" 
                className="text-muted-foreground"
                onClick={() => setShowExitPopup(false)}
              >
                Não, obrigado
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-2">
              ⏰ Oferta válida apenas agora!
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Associar;
