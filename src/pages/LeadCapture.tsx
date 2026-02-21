import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Gift,
  X,
  CheckCircle,
  Loader2,
  Percent,
  Timer,
  Star,
  Users,
  TrendingUp,
  ShoppingBag,
  Heart,
  Car,
  Utensils,
  Sparkles,
  AlertTriangle,
  BadgeCheck
} from "lucide-react";
import logo from "@/assets/logo.png";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

const leadSchema = z.object({
  nome_completo: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  telefone: z.string().trim().min(10, "Telefone inválido").max(15, "Telefone inválido"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
});

// Discount examples for simulator
const discountCategories = [
  { name: "Restaurantes", icon: Utensils, color: "text-orange-500" },
  { name: "Farmácias", icon: Heart, color: "text-red-500" },
  { name: "Combustível", icon: Car, color: "text-blue-500" },
  { name: "Lojas", icon: ShoppingBag, color: "text-purple-500" },
  { name: "Beleza", icon: Sparkles, color: "text-pink-500" },
];

// Happy customer images from Unsplash (real people with coupons/shopping)
const happyCustomers = [
  {
    src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80",
    name: "Maria S.",
    savings: "R$847",
    quote: "Economizei muito no supermercado!"
  },
  {
    src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
    name: "João P.",
    savings: "R$523",
    quote: "Os descontos em farmácias são incríveis!"
  },
  {
    src: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400&q=80",
    name: "Ana L.",
    savings: "R$1.245",
    quote: "Não vivo mais sem o Clube Aqui Tem!"
  },
];

const LeadCapture = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [discountPercent, setDiscountPercent] = useState([25]);
  const [monthlySpend, setMonthlySpend] = useState([500]);
  const hasShownPopup = useRef(false);
  const [formData, setFormData] = useState({
    nome_completo: "",
    telefone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % happyCustomers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownPopup.current) {
        setShowExitPopup(true);
        hasShownPopup.current = true;
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "telefone") {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = leadSchema.parse(formData);

      const sellerId = localStorage.getItem("clube_ref_seller_id");

      const { error: dbError } = await supabase
        .from("leads")
        .insert({
          nome_completo: validatedData.nome_completo,
          email: validatedData.email,
          telefone: validatedData.telefone,
          source: "meta_ads",
          seller_id: sellerId,
        });

      if (dbError) {
        throw new Error("Erro ao salvar dados");
      }

      setShowSuccessPopup(true);
      setFormData({ nome_completo: "", telefone: "", email: "" });

      toast({
        title: "🎉 Cadastro realizado!",
        description: "Em breve entraremos em contato com você!",
      });
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

  // Calculate savings
  const monthlySavings = (monthlySpend[0] * discountPercent[0]) / 100;
  const yearlySavings = monthlySavings * 12;

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="py-4 px-4 relative z-10">
        <div className="container mx-auto flex justify-center">
          <div className="flex items-center gap-2">
            <img loading="lazy" src={logo} alt="Clube Aqui Tem" className="h-12 w-auto" />
            <span className="font-brand text-2xl">
              <span className="text-primary font-bold">Clube</span>
              <span className="text-accent font-extrabold"> Aqui Tem</span>
            </span>
          </div>
        </div>
      </header>

      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-accent to-accent/80 py-3 px-4 relative z-10">
        <div className="container mx-auto flex items-center justify-center gap-4 text-accent-foreground">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <span className="font-semibold text-sm md:text-base">
            ⚡ VAGAS LIMITADAS! Apenas <span className="font-bold">50 novas vagas</span> nesta região
          </span>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
            <Timer className="w-4 h-4" />
            <span className="font-mono font-bold">
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-semibold">+10.000 famílias economizando</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-brand font-bold leading-tight">
                <span className="text-foreground">Economize até</span>{" "}
                <span className="text-accent">50%</span>{" "}
                <span className="text-foreground">em compras do dia a dia</span>
              </h1>

              <p className="text-lg text-muted-foreground">
                Acesso a <strong>centenas de cupons de desconto</strong> em estabelecimentos
                da sua cidade. Farmácias, restaurantes, postos, lojas e muito mais!
              </p>
            </motion.div>

            {/* Social Proof Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">10K+</p>
                <p className="text-xs text-muted-foreground">Associados</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <Percent className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-accent">50%</p>
                <p className="text-xs text-muted-foreground">Economia</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-xs text-muted-foreground">Parceiros</p>
              </div>
            </motion.div>

            {/* Savings Simulator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border-2 border-primary/20 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-brand font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Simulador de Economia
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Gasto mensal estimado:</Label>
                    <span className="font-bold text-primary">R$ {monthlySpend[0]}</span>
                  </div>
                  <Slider
                    value={monthlySpend}
                    onValueChange={setMonthlySpend}
                    max={2000}
                    min={100}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Desconto médio:</Label>
                    <span className="font-bold text-accent">{discountPercent[0]}%</span>
                  </div>
                  <Slider
                    value={discountPercent}
                    onValueChange={setDiscountPercent}
                    max={50}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="bg-primary/10 rounded-xl p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Economia Mensal</p>
                    <p className="text-2xl font-brand font-bold text-primary">
                      R$ {monthlySavings.toFixed(0)}
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded-xl p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Economia Anual</p>
                    <p className="text-2xl font-brand font-bold text-accent">
                      R$ {yearlySavings.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category icons */}
              <div className="flex justify-center gap-3 mt-6 pt-4 border-t">
                {discountCategories.map((cat, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${cat.color}`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{cat.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Testimonials Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-primary" />
                Pessoas reais, economia real
              </h3>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 items-center"
                >
                  <img loading="lazy"
                    src={happyCustomers[currentTestimonial].src}
                    alt={happyCustomers[currentTestimonial].name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                  />
                  <div className="flex-1">
                    <p className="text-muted-foreground italic mb-2">
                      "{happyCustomers[currentTestimonial].quote}"
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{happyCustomers[currentTestimonial].name}</span>
                      <span className="text-accent font-bold">
                        Economizou {happyCustomers[currentTestimonial].savings}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {happyCustomers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentTestimonial ? "w-6 bg-primary" : "bg-muted-foreground/30"
                      }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="sticky top-8"
          >
            <Card className="border-2 border-accent/30 shadow-2xl shadow-accent/10 overflow-hidden">
              <div className="bg-gradient-to-r from-accent to-accent/80 py-3 px-6 text-center">
                <p className="text-accent-foreground font-semibold flex items-center justify-center gap-2">
                  <Gift className="w-5 h-5" />
                  RECEBA SUA PROPOSTA EXCLUSIVA
                </p>
              </div>

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-brand text-primary">
                  Quero Economizar Agora!
                </CardTitle>
                <CardDescription className="text-base">
                  Preencha seus dados e receba acesso exclusivo
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2">
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
                      className={`h-12 ${errors.nome_completo ? "border-destructive" : ""}`}
                      required
                    />
                    {errors.nome_completo && (
                      <p className="text-sm text-destructive">{errors.nome_completo}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">WhatsApp *</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={handleChange}
                      maxLength={15}
                      className={`h-12 ${errors.telefone ? "border-destructive" : ""}`}
                      required
                    />
                    {errors.telefone && (
                      <p className="text-sm text-destructive">{errors.telefone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`h-12 ${errors.email ? "border-destructive" : ""}`}
                      required
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full text-lg h-14 shadow-accent animate-pulse"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5 mr-2" />
                        QUERO MINHA VAGA GRÁTIS
                      </>
                    )}
                  </Button>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Dados protegidos</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Sem spam</span>
                    </div>
                  </div>
                </form>

                {/* Benefits list */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <p className="font-semibold text-sm text-center mb-4">
                    ✨ O que você vai receber:
                  </p>
                  {[
                    "Cupons de até 50% de desconto",
                    "Acesso a +500 parceiros locais",
                    "Telemedicina 24h inclusa",
                    "Assistência residencial e automotiva",
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Exit Intent Popup */}
      <Dialog open={showExitPopup} onOpenChange={setShowExitPopup}>
        <DialogContent className="sm:max-w-md">
          <button
            onClick={() => setShowExitPopup(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>

          <DialogHeader className="text-center">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <AlertTriangle className="w-10 h-10 text-accent" />
            </div>
            <DialogTitle className="text-2xl font-brand text-center">
              Espere! Você está perdendo dinheiro! 💸
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              <strong className="text-accent">Enquanto você pensa,</strong> outras famílias já estão
              economizando até <strong>R$847 por mês</strong> com nossos cupons!
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl p-6 text-center my-4">
            <p className="text-muted-foreground mb-2">Economia média mensal</p>
            <p className="text-4xl font-brand font-bold text-accent">R$847</p>
            <p className="text-sm text-muted-foreground mt-2">
              Investimento: apenas <strong className="text-primary">R$19,99/mês</strong>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="hero"
              size="lg"
              className="w-full animate-pulse"
              onClick={() => {
                setShowExitPopup(false);
                document.getElementById("nome_completo")?.focus();
              }}
            >
              <Gift className="w-5 h-5 mr-2" />
              QUERO ECONOMIZAR AGORA!
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setShowExitPopup(false)}
            >
              Prefiro continuar gastando mais
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-2">
            ⏰ Vagas limitadas! Garanta a sua agora.
          </p>
        </DialogContent>
      </Dialog>

      {/* Success Popup */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-brand text-center text-primary">
              🎉 Parabéns! Cadastro realizado!
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Você está a um passo de economizar até <strong className="text-accent">50%</strong> nas suas compras!
              <br /><br />
              <strong>Nossa equipe entrará em contato em breve</strong> pelo WhatsApp para
              ativar sua conta e liberar seus cupons exclusivos.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 text-center my-4">
            <p className="font-semibold text-foreground mb-2">📱 Fique atento ao WhatsApp!</p>
            <p className="text-sm text-muted-foreground">
              Entraremos em contato em até 24h para liberar seu acesso.
            </p>
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => setShowSuccessPopup(false)}
          >
            Entendi!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadCapture;
