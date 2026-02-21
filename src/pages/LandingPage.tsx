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
  BadgeCheck,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Zap,
  Play,
  Phone
} from "lucide-react";
import logo from "@/assets/logo.png";
import horizonLogo from "@/assets/horizon-logo.png";
import portoSeguroLogo from "@/assets/porto-seguro-logo.png";
import heroImg from "@/assets/landing_hero_family_shopping_1769204213600.png";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";

const leadSchema = z.object({
  nome_completo: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  telefone: z.string().trim().min(10, "Telefone inválido").max(15, "Telefone inválido"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
});

const LandingPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const hasShownPopup = useRef(false);
  const [formData, setFormData] = useState({
    nome_completo: "",
    telefone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 42, seconds: 35 });

  // Countdown timer para urgência
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = leadSchema.parse(formData);
      const sellerId = localStorage.getItem("clube_ref_seller_id");
      const { error } = await supabase.from("leads" as any).insert([{
        nome_completo: validatedData.nome_completo,
        telefone: validatedData.telefone,
        email: validatedData.email,
        source: "landing_page_magnetica",
        seller_id: sellerId
      }]);

      if (error) throw error;

      setShowSuccessPopup(true);
      setFormData({ nome_completo: "", telefone: "", email: "" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro no cadastro", description: "Verifique os dados e tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <SEO
        title="Clube Aqui Tem | Economize 50% em Tudo"
        description="Junte-se ao maior clube de benefícios e economize até R$800 por mês em compras do dia a dia."
      />

      {/* Ultra-Dynamic Urgency Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white text-primary py-2 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)] relative z-30 border-b border-accent/30 overflow-hidden"
      >
        {/* Animated Background Shine */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent w-1/2 skew-x-12 z-0"
        />

        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          {/* Left Side: Offer */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/20"
            >
              <Zap className="w-6 h-6 text-primary fill-primary" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent leading-none">Oportunidade de Elite</span>
              <span className="text-sm md:text-lg font-black text-primary tracking-tighter">
                Sua Vaga VIP: <span className="text-accent underline decoration-accent/30 underline-offset-4">50% DE DESCONTO</span> Liberado agora!
              </span>
            </div>
          </div>

          {/* Middle: Scrolling Benefits (Marquee effect) */}
          <div className="hidden lg:flex items-center gap-6 overflow-hidden max-w-md">
            <motion.div
              animate={{ x: [0, -500] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="flex items-center gap-8 whitespace-nowrap text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]"
            >
              <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Sem Fidelidade</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Ativação Imediata</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> +500 Lojas Parceiras</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Telemedicina 24h</span>
              {/* Repeat for smooth loop */}
              <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Sem Fidelidade</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Ativação Imediata</span>
            </motion.div>
          </div>

          {/* Right Side: Timer */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl shadow-inner">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Expira em:</span>
              <div className="flex gap-1 font-mono text-xl font-black text-primary">
                <span className="bg-primary text-white px-1.5 rounded-md min-w-[28px] text-center shadow-sm">{String(countdown.hours).padStart(2, '0')}</span>
                <span className="text-primary animate-pulse">:</span>
                <span className="bg-primary text-white px-1.5 rounded-md min-w-[28px] text-center shadow-sm">{String(countdown.minutes).padStart(2, '0')}</span>
                <span className="text-primary animate-pulse">:</span>
                <span className="bg-accent text-primary px-1.5 rounded-md min-w-[28px] text-center shadow-md shadow-accent/20 animate-pulse">{String(countdown.seconds).padStart(2, '0')}</span>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-accent hover:bg-accent/90 text-primary font-black rounded-xl hidden sm:flex shadow-lg shadow-accent/20 border-none"
              onClick={() => document.getElementById('capture-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              GARANTIR AGORA
            </Button>
          </div>
        </div>
      </motion.div>

      <main className="flex-grow">

        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-primary">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,215,0,0.15),transparent_50%)]"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-[100px]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full text-white/90 text-sm font-semibold mb-8 border border-white/10 shadow-lg shadow-black/20"
                >
                  <span className="flex h-2 w-2 rounded-full bg-accent animate-ping"></span>
                  <Users className="w-4 h-4 text-accent" />
                  +10k Associados Economizando Hoje
                </motion.div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-brand font-black text-white leading-[1.1] mb-8 tracking-tight">
                  Pare de Gastar <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/50">Dinheiro à Toa</span> e <br />
                  <span className="text-accent relative">
                    Economize ATÉ 50%
                    <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                      <path d="M0 7C30 7 70 7 100 2" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </svg>
                  </span> em Tudo!
                </h1>

                <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-xl font-medium">
                  Transforme sua rotina: recupere até <span className="text-white font-bold">R$800,00 por mês</span> no que você já consome. Sem mudar seus hábitos, apenas seu preço.
                </p>

                <div className="flex justify-center sm:justify-start">
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full sm:w-auto h-16 px-10 text-xl shadow-2xl shadow-accent/20 hover:scale-105 transition-all group rounded-2xl"
                    onClick={() => document.getElementById('capture-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Garanta Sua Vaga
                    <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="mt-12 flex items-center gap-4 text-white/40 text-xs font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2 border-r border-white/10 pr-4">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    7 Dias de Garantia
                  </span>
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    Acesso Imediato
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative lg:ml-auto"
              >
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white/5">
                  <img loading="lazy" src={heroImg} alt="Família Feliz Economizando" className="w-full h-auto object-cover scale-[1.02]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>

                  {/* Glass Card Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/20 backdrop-blur-2xl border border-white/30 p-6 rounded-[2rem] hidden md:block shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center">
                          <CheckCircle className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <p className="text-white font-bold">Economia Ativada</p>
                          <p className="text-white/80 text-xs">Membro VIP Ativo</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-accent font-black text-2xl">-R$ 842,00</p>
                        <p className="text-white/60 text-[10px] uppercase font-bold tracking-tighter">Economia Mensal</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements with better organization */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 bg-accent text-primary p-6 rounded-[2.5rem] shadow-2xl shadow-accent/30 rotate-12 hidden lg:block z-20 border-4 border-white"
                >
                  <p className="font-black text-4xl leading-none">-50%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-center mt-1 opacity-70">Garantido</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-10 -left-10 bg-white p-6 rounded-[2.5rem] shadow-2xl -rotate-6 hidden lg:block z-20"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-slate-${i + 1}00 flex items-center justify-center text-[10px] font-bold text-slate-400 overflow-hidden`}>
                          <img loading="lazy" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                        </div>
                      ))}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-primary leading-tight">Comunidade VIP</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Junte-se a 10k+ membros</p>
                    </div>
                  </div>
                </motion.div>

                {/* Visual Glow behind image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent/10 blur-[120px] rounded-full z-0"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5. CAPTURA DE LEADS - High Conversion Form */}
        <section id="capture-form" className="py-16 md:py-24 lg:py-32 bg-[#F0FDF4] scroll-mt-24 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-100/30 -skew-x-12 translate-x-1/2 hidden lg:block"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-10 shadow-inner"
                >
                  <Gift className="w-10 h-10 text-accent animate-bounce" />
                </motion.div>
                <h2 className="text-4xl md:text-6xl font-brand font-black text-primary mb-6 leading-[1.1] tracking-tight">Receba sua Vaga <br /><span className="text-accent underline decoration-accent/30 underline-offset-8">Exclusiva</span></h2>
                <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-lg">
                  Preencha seus dados para receber nosso <span className="text-primary font-bold">Guia de Economia Doméstica</span> e garantir sua vaga com 50% de desconto no primeiro mês.
                </p>

                <div className="space-y-6">
                  {[
                    "Liberação imediata no WhatsApp",
                    "Acesso ao Guia PDF Grátis",
                    "Sem compromisso ou carência"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                      <Zap className="w-4 h-4 text-accent" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <Card className="border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] p-8 md:p-12 bg-white border border-slate-100">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-black text-primary text-xs uppercase tracking-widest ml-1">Seu Nome Completo</Label>
                      <Input
                        placeholder="Ex: João Silva"
                        name="nome_completo"
                        value={formData.nome_completo}
                        onChange={handleChange}
                        className="h-16 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-lg font-medium"
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-black text-primary text-xs uppercase tracking-widest ml-1">WhatsApp</Label>
                        <Input
                          placeholder="(00) 00000-0000"
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleChange}
                          className="h-16 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-lg font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-black text-primary text-xs uppercase tracking-widest ml-1">E-mail</Label>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="h-16 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-lg font-medium"
                          required
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button
                        type="submit"
                        variant="hero"
                        className="w-full h-20 rounded-[1.5rem] text-xl font-black shadow-2xl shadow-accent/20 hover:scale-[1.02] transition-all group"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            PROCESSANDO...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            LIBERAR MEU ACESSO E GUIA
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                      </Button>
                      <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6">
                        🔒 Dados protegidos e criptografados. Sem Spam.
                      </p>
                    </div>
                  </form>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 2. PROVA SOCIAL (LOGOS + NUMBERS) */}
        <section className="py-16 bg-primary border-y border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <p className="text-center text-white/50 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-12">Benefícios Garantidos por Líderes de Mercado</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-24">
              <img loading="lazy" src={horizonLogo} alt="Horizon" className="h-[40px] sm:h-[60px] md:h-[100px] lg:h-[120px] w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-all duration-500" />
              <img loading="lazy" src={portoSeguroLogo} alt="Porto Seguro" className="h-[40px] sm:h-[60px] md:h-[100px] lg:h-[120px] w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-all duration-500" />
              <div className="h-12 w-px bg-white/10 hidden lg:block"></div>
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-brand font-black text-white tracking-tight">10k+</span>
                <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest mt-1">Membros Ativos</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-brand font-black text-white tracking-tight">R$12M</span>
                <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest mt-1">Economia Total</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BENEFÍCIOS CLAROS */}
        <section className="py-24 md:py-32 bg-[#F8FAFC]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-accent font-black text-xs uppercase tracking-[0.3em] mb-4 block"
              >
                Vantagens Exclusivas
              </motion.span>
              <h2 className="text-4xl md:text-6xl font-brand font-black text-primary mb-6 tracking-tight">Sua Vida Muito <br className="hidden md:block" /> Mais Barata</h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">Não é sobre gastar menos, é sobre comprar as mesmas coisas <br className="hidden md:block" /> pagando a metade do preço com benefícios de elite.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  icon: TrendingUp,
                  title: "Economia Real e Imediata",
                  desc: "Descontos de até 50% em farmácias, supermercados e lazer que você já consome hoje.",
                  gradient: "from-emerald-500 to-teal-600",
                  shadow: "shadow-emerald-200"
                },
                {
                  icon: Phone,
                  title: "Telemedicina 24h Ilimitada",
                  desc: "Consultas médicas por vídeo sem custo adicional para você e sua família, a qualquer hora.",
                  gradient: "from-blue-500 to-indigo-600",
                  shadow: "shadow-blue-200"
                },
                {
                  icon: ShieldCheck,
                  title: "Proteção e Seguros",
                  desc: "Assistência residencial, guincho e seguro de vida inclusos na sua assinatura mensal.",
                  gradient: "from-orange-500 to-red-600",
                  shadow: "shadow-orange-200"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-[2.5rem] p-6 group bg-white relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <CardContent className="p-4 relative z-10">
                      <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-8 shadow-xl ${item.shadow} group-hover:scale-110 transition-transform duration-500`}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-brand font-black text-primary mb-4 tracking-tight leading-none">{item.title}</h3>
                      <p className="text-slate-500 font-medium leading-relaxed mb-6">{item.desc}</p>
                      <div className="h-1.5 w-12 bg-slate-100 rounded-full group-hover:w-20 group-hover:bg-accent transition-all duration-500"></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. OFERTA IRRESISTÍVEL - Premium Transformation */}
        <section className="py-16 md:py-24 lg:py-32 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent opacity-[0.1] blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white opacity-[0.05] blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_100px_150px_-50px_rgba(0,0,0,0.5)]"
            >
              <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
                <div className="p-10 lg:p-20 border-b lg:border-b-0 lg:border-r border-white/10">
                  <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-accent/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    Melhor Custo-Benefício
                  </div>
                  <h2 className="text-4xl md:text-6xl font-brand font-black mb-10 leading-tight tracking-tight">Plano Individual <br /><span className="text-accent underline decoration-accent/30 underline-offset-8">com Carência Reduzida</span></h2>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                    {[
                      "Cartão Virtual Imediato",
                      "Rede com +500 Lojas",
                      "Telemedicina 24h Ilimitada",
                      "Assistências pra você e sua Familia",
                      "Seguro de Vida Incluso",
                      "Descontos de até 50%"
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                          <CheckCircle className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-lg opacity-70 font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-inner">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shrink-0 shadow-lg rotate-3">
                        <Gift className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-accent font-black text-sm uppercase tracking-widest mb-1">
                          BÔNUS ESPECIAL ATIVADO
                        </p>
                        <p className="text-white/60 text-sm leading-relaxed">
                          Garanta agora e ganhe o nosso <span className="text-white font-bold underline underline-offset-2">Guia de Economia Doméstica</span> digital gratuitamente junto com seu acesso.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-10 lg:p-20 bg-accent text-primary flex flex-col justify-center text-center relative overflow-hidden group">
                  {/* Decorative circles */}
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-700"></div>

                  <div className="relative z-10">
                    <p className="text-xs font-black uppercase tracking-[0.4em] mb-6 opacity-60">Acesso Premium</p>
                    <div className="mb-8">
                      <span className="text-2xl font-black text-white/60 line-through mr-3">R$ 39,90</span>
                      <div className="flex items-start justify-center">
                        <span className="text-xl md:text-3xl font-black mt-2 md:mt-4 mr-1">R$</span>
                        <span className="text-7xl md:text-9xl lg:text-[10rem] font-brand font-black tracking-tighter leading-none">19</span>
                        <div className="text-left mt-2 md:mt-4 border-l-4 border-primary/20 pl-4 ml-4">
                          <span className="text-3xl md:text-5xl font-black block leading-none">,99</span>
                          <span className="block text-xs font-black uppercase tracking-widest mt-2">por mês</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-primary/70 mb-12 text-sm font-bold bg-white/20 py-3 px-6 rounded-full inline-block backdrop-blur-md">
                      Economize seu investimento já no primeiro dia!
                    </p>
                    <Button
                      className="w-full h-20 rounded-[1.5rem] bg-white text-primary hover:bg-slate-50 text-2xl font-black border-none shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition-all"
                      onClick={() => document.getElementById('capture-form')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Resgatar Oferta Agora
                    </Button>
                    <div className="mt-8 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest opacity-60">
                      <ShieldCheck className="w-5 h-5" />
                      Garantia de 7 Dias
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 6. AUTORIDADE SECTION */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
              <div>
                <img loading="lazy" src={logo} alt="Clube Aqui Tem" className="h-20 w-auto mb-8" />
                <h2 className="text-4xl font-brand font-bold text-primary mb-6">Por que confiar em nós?</h2>
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p>O <strong>Clube Aqui Tem</strong> nasceu com uma missão clara: dar poder de compra real para as famílias brasileiras.</p>
                  <p>Hoje, somos parceiros oficiais da <strong>Horizon Corretora</strong> e oferecemos benefícios garantidos pela <strong>Porto Seguro</strong>, trazendo a segurança de gigantes do mercado para o seu dia a dia.</p>
                  <p>Nossa plataforma já processou milhões em descontos e ajudamos milhares de pessoas a viverem melhor sem precisar trabalhar mais para isso.</p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-white rounded-[3rem] p-4 shadow-2xl shadow-primary/10 relative z-10">
                  <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <BadgeCheck className="w-32 h-32 text-white opacity-20" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                      <p className="text-5xl font-brand font-black mb-2">Padrão</p>
                      <p className="text-xl font-bold tracking-widest uppercase mb-4 opacity-70">Excelência</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-accent text-accent" />)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl z-0"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. REFORÇO FINAL + CTA */}
        <section className="py-32 bg-primary text-white text-center overflow-hidden relative">
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl md:text-6xl font-brand font-bold mb-8">Sua Nova Vida <span className="text-accent underline">Começa Hoje</span></h2>
            <p className="text-xl opacity-70 max-w-2xl mx-auto mb-12">Assine agora, economize amanhã. Se em 7 dias você não amar a economia, devolvemos cada centavo.</p>
            <Button
              variant="hero"
              size="lg"
              className="h-20 px-16 text-2xl font-black rounded-3xl shadow-3xl shadow-black/20 animate-pulse"
              onClick={() => document.getElementById('capture-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Sim, Quero Minha Vaga de Membro!
            </Button>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-24">
              <img loading="lazy" src={horizonLogo} alt="Horizon" className="h-[40px] sm:h-[60px] md:h-[100px] lg:h-[120px] w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-all duration-500" />
              <img loading="lazy" src={portoSeguroLogo} alt="Porto Seguro" className="h-[40px] sm:h-[60px] md:h-[100px] lg:h-[120px] w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-all duration-500" />
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Exit Intent Popup - Ultra Premium Refinement */}
      <Dialog open={showExitPopup} onOpenChange={setShowExitPopup}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] p-0 overflow-hidden bg-white sm:h-auto">
          <div className="grid md:grid-cols-[1.2fr_1fr] h-full sm:min-h-[450px]">
            {/* Left Side: Impactful Visual */}
            <div className="relative bg-primary p-10 flex flex-col justify-center text-white text-center overflow-hidden min-h-[300px] md:min-h-full">
              {/* Abstract decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.3),transparent_70%)]"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

              <div className="relative z-10 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 6 }}
                  className="w-24 h-24 bg-accent rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(245,158,11,0.4)] border-4 border-white/20"
                >
                  <AlertTriangle className="w-12 h-12 text-primary" />
                </motion.div>
                <DialogTitle className="text-3xl lg:text-4xl font-brand font-black mb-4 leading-tight tracking-tight">
                  Espere! <br /> <span className="text-accent underline decoration-accent/30 underline-offset-4">Não Vá Ainda.</span>
                </DialogTitle>
                <DialogDescription className="text-white/70 text-lg leading-relaxed font-medium">
                  Você está prestes a deixar <span className="text-white font-bold">R$ 800,00 por mês</span> na mesa. Deixe-nos provar o valor do Clube.
                </DialogDescription>
              </div>
            </div>

            {/* Right Side: Irresistible Offer Form Shortcut or Reward */}
            <div className="p-10 flex flex-col justify-center bg-white">
              <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:border-accent/20">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                  <Gift className="w-6 h-6 text-primary animate-bounce" />
                </div>
                <p className="text-[#14532d] font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Bônus de Saída
                </p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  Ganhe um <span className="text-primary font-bold">Cupom Extra de Boas-vindas</span> se decidir entrar agora nos próximos 2 minutos.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  variant="hero"
                  className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-accent/20 hover:scale-105 transition-all group"
                  onClick={() => {
                    setShowExitPopup(false);
                    document.getElementById('capture-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  QUERO MEU PRESENTE
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <button
                  className="w-full py-3 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
                  onClick={() => setShowExitPopup(false)}
                >
                  Não, prefiro continuar pagando caro
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-4 opacity-50 grayscale scale-90">
                <img loading="lazy" src={logo} alt="Logo" className="h-6 w-auto" />
                <div className="h-4 w-px bg-slate-200"></div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-2.5 h-2.5 fill-accent text-accent" />)}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Popup */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-md rounded-3xl p-10 text-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <DialogTitle className="text-3xl font-brand font-bold text-primary mb-4">Quase Tudo Pronto!</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground mb-8">
            Seus dados foram recebidos. Enviamos agora mesmo o <strong>Guia de Economia</strong> para o seu e-mail.
            <br /><br />
            Fique atento ao seu <span className="text-green-600 font-bold">WhatsApp</span>, pois um consultor entrará em contato para liberar seu acesso.
          </DialogDescription>
          <Button variant="hero" className="w-full h-14 rounded-2xl" onClick={() => setShowSuccessPopup(false)}>Entendido!</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;