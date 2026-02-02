import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowLeft, Shield, CreditCard, CheckCircle, Loader2, Gift, X, Star, Handshake } from "lucide-react";
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
  cep: z.string().trim().min(8, "CEP inválido").max(9, "CEP inválido"),
  rua: z.string().trim().min(3, "Rua é obrigatória").max(150, "Rua muito longa"),
  numero: z.string().trim().min(1, "Número é obrigatório").max(10, "Número muito longo"),
  complemento: z.string().trim().max(50, "Complemento muito longo").optional(),
  bairro: z.string().trim().min(2, "Bairro é obrigatório").max(100, "Bairro muito longo"),
  cidade: z.string().trim().min(2, "Cidade é obrigatória").max(100, "Cidade muito longa"),
  estado: z.string().trim().length(2, "Estado deve ter 2 letras"),
  cpf: z.string().trim().min(11, "CPF inválido").max(14, "CPF inválido"),
});

const Associar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [paymentType, setPaymentType] = useState<"annual" | "monthly">("annual");
  const hasShownPopup = useRef(false);
  const [formData, setFormData] = useState({
    nome_completo: "",
    telefone: "",
    email: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cpf: "",
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pricing
  const monthlyPrice = discountApplied ? 18.99 : 19.99;
  const annualPrice = discountApplied ? 227.88 : 239.88;

  // Check if form is empty
  const isFormEmpty = () => {
    return !formData.nome_completo && !formData.telefone && !formData.email && !formData.cep && !formData.cpf;
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

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const searchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          variant: "destructive",
          title: "CEP não encontrado",
          description: "Verifique o CEP digitado e tente novamente",
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));

      toast({
        title: "Endereço encontrado!",
        description: "Preencha apenas o número e complemento",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar CEP",
        description: "Tente novamente em alguns instantes",
      });
    } finally {
      setLoadingCep(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cpf") {
      formattedValue = formatCPF(value);
    } else if (name === "telefone") {
      formattedValue = formatPhone(value);
    } else if (name === "cep") {
      formattedValue = formatCEP(value);
      if (formattedValue.replace(/\D/g, "").length === 8) {
        searchCEP(formattedValue);
      }
    } else if (name === "estado") {
      formattedValue = value.toUpperCase().slice(0, 2);
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
      const cpfClean = validatedData.cpf.replace(/\D/g, "");

      // Calculate amount
      const baseMonthlyPrice = 19.99;
      const discountedMonthlyPrice = 18.99;
      const monthlyPrice = discountApplied ? discountedMonthlyPrice : baseMonthlyPrice;
      const amount = paymentType === "annual" ? monthlyPrice * 12 : monthlyPrice;

      // Generate external reference
      const externalReference = `associado_${Date.now()}_${cpfClean}`;

      console.log("Creating payment preference...");

      // Call simplified Edge Function
      // Montar endereço completo
      const enderecoCompleto = `${validatedData.rua}, ${validatedData.numero}${validatedData.complemento ? ', ' + validatedData.complemento : ''} - ${validatedData.bairro}, ${validatedData.cidade} - ${validatedData.estado}, CEP: ${validatedData.cep}`;

      const { data, error } = await supabase.functions.invoke("create-mercadopago-preference", {
        body: {
          amount: amount,
          description: paymentType === "annual"
            ? `Clube Aqui Tem - Plano Anual (${discountApplied ? '5% OFF' : 'Valor integral'})`
            : `Clube Aqui Tem - Plano Mensal (${discountApplied ? '5% OFF' : 'Valor integral'})`,
          email: validatedData.email,
          external_reference: externalReference,
        },
      });

      if (error) {
        console.error("Edge Function error:", error);
        throw new Error(error.message || "Erro ao processar pagamento");
      }

      if (!data || !data.init_point) {
        throw new Error("URL de pagamento não recebida");
      }

      console.log("Payment preference created successfully");

      // Save to database
      const sellerId = localStorage.getItem("clube_ref_seller_id");

      const { error: dbError } = await supabase
        .from("subscribers" as any)
        .upsert({
          name: validatedData.nome_completo,
          email: validatedData.email,
          phone: validatedData.telefone,
          address: enderecoCompleto,
          cpf: cpfClean,
          discount_applied: discountApplied,
          external_reference: externalReference,
          mercadopago_preference_id: data.id,
          seller_id: sellerId,
          source: searchParams.get("source") || searchParams.get("utm_source") || "Orgânico",
        }, {
          onConflict: 'cpf',
          ignoreDuplicates: false
        });

      if (dbError) {
        console.warn("Database save failed, but payment can proceed:", dbError);
      }

      toast({
        title: "Redirecionando para pagamento",
        description: "Você será redirecionado para o Mercado Pago",
      });

      // Redirect to Mercado Pago
      window.location.href = data.init_point;
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
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <SEO
        title="Torne-se um Associado"
        description="Junte-se ao Clube Aqui Tem e aproveite descontos exclusivos em saúde, lazer e serviços."
      />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium mb-6 border border-white/20">
              <Star className="w-4 h-4 text-accent" />
              Mais de 5.000 Associados Satisfeitos
            </div>
            <h1 className="text-4xl md:text-5xl font-brand font-bold text-white mb-6">
              Sua Jornada de <span className="text-accent underline underline-offset-8 decoration-accent/30">Economia</span> Começa Aqui
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
              Complete seu cadastro em menos de 2 minutos e tenha acesso imediato a todos os benefícios do maior clube de vantagens da região.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-grow container mx-auto px-4 -mt-10 pb-24 relative z-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-border shadow-xl rounded-3xl overflow-hidden bg-white">
              <div className="bg-primary/5 p-8 border-b border-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-brand font-bold text-primary flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      Finalizar Assinatura
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Escolha seu plano e preencha seus dados com segurança.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-border shadow-sm">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-bold text-primary">AMBIENTE 100% SEGURO</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-8 md:p-12">
                {/* Benefits reminder */}
                {discountApplied && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/10 rounded-2xl p-6 mb-8 border-2 border-green-500/20 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-green-700 text-lg">🎉 Desconto Especial Ativado!</p>
                      <p className="text-green-600">Sua mensalidade baixou de R$19,99 para apenas <strong>R$18,99</strong>!</p>
                    </div>
                  </motion.div>
                )}

                {/* Payment Type Selection */}
                <div className="space-y-4 mb-10">
                  <Label className="text-lg font-bold text-primary block mb-2">Selecione seu Plano:</Label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all ${paymentType === "annual"
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                        : "border-border hover:border-primary/50 bg-white"
                        }`}
                      onClick={() => setPaymentType("annual")}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                        MAIS ECONÔMICO
                      </div>
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Plano Anual</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentType === "annual" ? "border-primary" : "border-border"}`}>
                            {paymentType === "annual" && <div className="w-3 h-3 rounded-full bg-primary" />}
                          </div>
                        </div>
                        <div className="mt-auto">
                          <div className="text-3xl font-brand font-bold text-primary">
                            R${annualPrice.toFixed(2).replace(".", ",")}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Equivale a <strong>R${(annualPrice / 12).toFixed(2).replace(".", ",")}</strong>/mês
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`rounded-2xl p-6 border-2 cursor-pointer transition-all ${paymentType === "monthly"
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                        : "border-border hover:border-primary/50 bg-white"
                        }`}
                      onClick={() => setPaymentType("monthly")}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Plano Mensal</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentType === "monthly" ? "border-primary" : "border-border"}`}>
                            {paymentType === "monthly" && <div className="w-3 h-3 rounded-full bg-primary" />}
                          </div>
                        </div>
                        <div className="mt-auto">
                          <div className="text-3xl font-brand font-bold text-primary">
                            R${monthlyPrice.toFixed(2).replace(".", ",")}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Cobrança recorrente mensal
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-6 mb-10 border border-border">
                  <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    Vantagens Inclusas no seu Plano:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-foreground/80">
                    {[
                      "Descontos de até 50% em lojas",
                      "Telemedicina 24h ilimitada",
                      "Seguro de Vida e Assistências",
                      "Clube de Vantagens completo"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome_completo" className="font-bold text-primary">Nome Completo *</Label>
                    <Input
                      id="nome_completo"
                      name="nome_completo"
                      placeholder="Como impresso no seu documento"
                      value={formData.nome_completo}
                      onChange={handleChange}
                      className={`h-12 rounded-xl ${errors.nome_completo ? "border-destructive ring-1 ring-destructive" : ""}`}
                      required
                    />
                    {errors.nome_completo && (
                      <p className="text-xs text-destructive font-medium">{errors.nome_completo}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="font-bold text-primary">CPF *</Label>
                      <Input
                        id="cpf"
                        name="cpf"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={handleChange}
                        maxLength={14}
                        className={`h-12 rounded-xl ${errors.cpf ? "border-destructive ring-1 ring-destructive" : ""}`}
                        required
                      />
                      {errors.cpf && (
                        <p className="text-xs text-destructive font-medium">{errors.cpf}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="font-bold text-primary">WhatsApp *</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={handleChange}
                        maxLength={15}
                        className={`h-12 rounded-xl ${errors.telefone ? "border-destructive ring-1 ring-destructive" : ""}`}
                        required
                      />
                      {errors.telefone && (
                        <p className="text-xs text-destructive font-medium">{errors.telefone}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold text-primary">E-mail para Acesso *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seuMelhor@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`h-12 rounded-xl ${errors.email ? "border-destructive ring-1 ring-destructive" : ""}`}
                      required
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive font-medium">{errors.email}</p>
                    )}
                  </div>

                  {/* CEP */}
                  <div className="space-y-2">
                    <Label htmlFor="cep" className="font-bold text-primary">CEP *</Label>
                    <div className="relative">
                      <Input
                        id="cep"
                        name="cep"
                        placeholder="00000-000"
                        value={formData.cep}
                        onChange={handleChange}
                        maxLength={9}
                        className={`h-12 rounded-xl ${errors.cep ? "border-destructive ring-1 ring-destructive" : ""}`}
                        required
                      />
                      {loadingCep && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    {errors.cep && (
                      <p className="text-xs text-destructive font-medium">{errors.cep}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Digite seu CEP para buscar o endereço automaticamente</p>
                  </div>

                  {/* Rua e Número */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="rua" className="font-bold text-primary">Rua/Avenida *</Label>
                      <Input
                        id="rua"
                        name="rua"
                        placeholder="Nome da rua"
                        value={formData.rua}
                        onChange={handleChange}
                        className={`h-12 rounded-xl ${errors.rua ? "border-destructive ring-1 ring-destructive" : ""}`}
                        required
                      />
                      {errors.rua && (
                        <p className="text-xs text-destructive font-medium">{errors.rua}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numero" className="font-bold text-primary">Número *</Label>
                      <Input
                        id="numero"
                        name="numero"
                        placeholder="123"
                        value={formData.numero}
                        onChange={handleChange}
                        className={`h-12 rounded-xl ${errors.numero ? "border-destructive ring-1 ring-destructive" : ""}`}
                        required
                      />
                      {errors.numero && (
                        <p className="text-xs text-destructive font-medium">{errors.numero}</p>
                      )}
                    </div>
                  </div>

                  {/* Complemento */}
                  <div className="space-y-2">
                    <Label htmlFor="complemento" className="font-bold text-primary">Complemento</Label>
                    <Input
                      id="complemento"
                      name="complemento"
                      placeholder="Apto, Bloco, etc. (opcional)"
                      value={formData.complemento}
                      onChange={handleChange}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  {/* Bairro, Cidade e Estado */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bairro" className="font-bold text-primary">Bairro *</Label>
                      <Input
                        id="bairro"
                        name="bairro"
                        placeholder="Bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                        className={`h-12 rounded-xl ${errors.bairro ? "border-destructive ring-1 ring-destructive" : ""}`}
                        required
                      />
                      {errors.bairro && (
                        <p className="text-xs text-destructive font-medium">{errors.bairro}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cidade" className="font-bold text-primary">Cidade *</Label>
                      <Input
                        id="cidade"
                        name="cidade"
                        placeholder="Cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        className={`h-12 rounded-xl ${errors.cidade ? "border-destructive ring-1 ring-destructive" : ""}`}
                        required
                      />
                      {errors.cidade && (
                        <p className="text-xs text-destructive font-medium">{errors.cidade}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado" className="font-bold text-primary">UF *</Label>
                      <Input
                        id="estado"
                        name="estado"
                        placeholder="SP"
                        value={formData.estado}
                        onChange={handleChange}
                        maxLength={2}
                        className={`h-12 rounded-xl ${errors.estado ? "border-destructive ring-1 ring-destructive" : ""}`}
                        required
                      />
                      {errors.estado && (
                        <p className="text-xs text-destructive font-medium">{errors.estado}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full h-16 text-xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        Preparando Checkout Seguro...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-6 h-6 mr-2" />
                        Finalizar e Pagar Agora
                      </>
                    )}
                  </Button>

                  <div className="flex flex-col items-center gap-6 mt-10 pt-8 border-t border-border">
                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#009EE3] flex items-center justify-center shadow-sm">
                          <Handshake className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-[10px] font-black text-[#003569] uppercase tracking-tighter">mercado</span>
                          <span className="text-[13px] font-black text-[#009EE3] -mt-0.5">pago</span>
                        </div>
                      </div>
                      <div className="w-px h-6 bg-border/60" />
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <Shield className="w-4 h-4 text-green-600" />
                        Checkout 100% Seguro
                      </div>
                    </div>
                    <p className="text-[11px] text-center text-muted-foreground max-w-sm">
                      Ao prosseguir, você concorda com o contrato de 12 meses e nossos{" "}
                      <Link to="/termos-de-uso" className="text-primary font-bold hover:underline">Termos de Uso</Link>
                      {" "}e{" "}
                      <Link to="/politica-de-privacidade" className="text-primary font-bold hover:underline">Política de Privacidade</Link>.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Exit Intent Popup */}
      <Dialog open={showExitPopup} onOpenChange={setShowExitPopup}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary p-8 text-center text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Gift className="w-24 h-24" />
            </div>
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10 rotate-3">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-brand font-bold mb-2 relative z-10">
              Não perca essa chance! 🎁
            </DialogTitle>
            <DialogDescription className="text-white/80 text-lg relative z-10">
              Complete seu cadastro agora e ganhe um desconto especial imediato.
            </DialogDescription>
          </div>

          <div className="p-8 text-center bg-white">
            <div className="bg-accent/5 rounded-2xl p-6 border-2 border-dashed border-accent/20 mb-8">
              <p className="text-muted-foreground text-sm uppercase font-black tracking-widest mb-1">Valor Exclusivo</p>
              <div className="flex items-center justify-center gap-2">
                <s className="text-muted-foreground text-xl">R$19,99</s>
                <span className="text-4xl font-brand font-black text-accent">R$18,99</span>
              </div>
              <p className="text-accent font-bold mt-2">Você economiza o ano todo!</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="hero"
                size="lg"
                className="w-full h-14 text-lg shadow-lg"
                onClick={handleApplyDiscount}
              >
                Ativar meu Desconto Agora!
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-primary h-12"
                onClick={() => setShowExitPopup(false)}
              >
                Prefiro pagar o valor normal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Associar;
