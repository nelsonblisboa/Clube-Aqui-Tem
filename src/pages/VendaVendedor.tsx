import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
    CheckCircle,
    Loader2,
    ShieldCheck,
    Zap,
    Lock,
    Play,
    Star,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    ArrowDown,
    Menu,
    X,
    AlertTriangle,
    XCircle
} from "lucide-react";
import logo from "@/assets/logo.png";
import horizonLogo from "@/assets/horizon-logo.png";
import portoSeguroLogo from "@/assets/porto-seguro-logo.png";
import happyImg from "@/assets/happy_savings_celebration.png";
import { z } from "zod";
import SEO from "@/components/SEO";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";

// Schema e Interfaces
const associadoSchema = z.object({
    nome_completo: z.string().trim().min(3, "Nome completo obrigatório").max(100),
    telefone: z.string().trim().min(10, "WhatsApp obrigatório").max(15),
    email: z.string().trim().email("Email inválido").max(255),
    endereco: z.string().trim().min(5, "Endereço obrigatório").max(200),
    cpf: z.string().trim().min(11, "CPF obrigatório").max(14),
});

interface Seller {
    id: string;
    name: string;
    phone: string;
    slug: string;
}

const FAQ = [
    { q: "Isso funciona mesmo para quem nunca usou benefícios antes?", a: "Sim! O Clube foi desenhado para ser extremamente simples. Basta apresentar seu CPF ou a carteirinha digital nas farmácias e parceiros para ter o desconto na hora." },
    { q: "Tenho fidelidade ou multa se cancelar?", a: "Absolutamente não. Acreditamos na liberdade. Você pode cancelar a qualquer momento sem pagar multas absurdas. Confiamos tanto que você vai amar que deixamos a porta destrancada." },
    { q: "Como acesso a Telemedicina?", a: "Imediatamente após a compra, você recebe acesso ao nosso aplicativo. Lá, com um clique, você fala com um médico 24h por dia, sem filas e sem custo adicional." },
    { q: "Quais farmácias aceitam?", a: "Estamos integrados com as maiores redes do Brasil: Drogasil, Droga Raia, Pague Menos, Pacheco e milhares de outras. Provavelmente a farmácia da sua esquina aceita." },
];

const VendaVendedor = () => {
    const location = useLocation();
    const { toast } = useToast();
    const [seller, setSeller] = useState<Seller | null>(null);
    const [loadingSeller, setLoadingSeller] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Estados do Formulário de Venda
    const [paymentType, setPaymentType] = useState<"annual" | "monthly">("annual");
    const [formData, setFormData] = useState({ nome_completo: "", telefone: "", email: "", endereco: "", cpf: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados de UI e Modais
    const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
    const [leadFormData, setLeadFormData] = useState({ name: "", phone: "", email: "" });
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [showExitIntent, setShowExitIntent] = useState(false);
    const [hasShownExitIntent, setHasShownExitIntent] = useState(false);

    // Preços
    const currentPrice = 19.99;
    const annualPrice = (currentPrice * 12).toFixed(2);

    // Referência do Vendedor
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const ref = params.get("ref");

        const fetchSeller = async () => {
            if (ref) {
                try {
                    const { data } = await supabase
                        .from("sellers" as any)
                        .select("id, name, phone, slug")
                        .eq("slug", ref)
                        .eq("status", "active")
                        .maybeSingle();

                    if (data) {
                        // Type assertion since we know the shape from our select
                        const sellerData = data as unknown as Seller;
                        setSeller(sellerData);
                        localStorage.setItem("clube_ref_seller_id", sellerData.id);
                    }
                } catch (err) { console.error(err); }
            }
            setLoadingSeller(false);
        };
        fetchSeller();
    }, [location]);

    // Exit Intent Logic
    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasShownExitIntent) {
                setShowExitIntent(true);
                setHasShownExitIntent(true);
            }
        };
        const handleTouchDevice = () => {
            // Fallback for mobile: show after 20 seconds if not converted
            setTimeout(() => {
                if (!hasShownExitIntent) {
                    setShowExitIntent(true);
                    setHasShownExitIntent(true);
                }
            }, 20000);
        };

        document.addEventListener("mouseleave", handleMouseLeave);
        handleTouchDevice();

        return () => document.removeEventListener("mouseleave", handleMouseLeave);
    }, [hasShownExitIntent]);

    // Formatters
    const formatCPF = (v: string) => v.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").substring(0, 14);
    const formatPhone = (v: string) => v.replace(/\D/g, "").replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3").substring(0, 15);

    // Trackers
    const trackEvent = async (type: 'whatsapp_click' | 'checkout_intent') => {
        if (!seller) return;
        supabase.from('seller_events' as any).insert({ seller_id: seller.id, event_type: type }).then(() => { });
    };

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "cpf") setFormData(p => ({ ...p, [name]: formatCPF(value) }));
        else if (name === "telefone") setFormData(p => ({ ...p, [name]: formatPhone(value) }));
        else setFormData(p => ({ ...p, [name]: value }));
    };

    const handleLeadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "phone") setLeadFormData(p => ({ ...p, [name]: formatPhone(value) }));
        else setLeadFormData(p => ({ ...p, [name]: value }));
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        trackEvent('checkout_intent');

        try {
            const validated = associadoSchema.parse(formData);
            const cpfClean = validated.cpf.replace(/\D/g, "");
            const amount = paymentType === "annual" ? parseFloat(annualPrice) : currentPrice;
            const externalRef = `associado_${Date.now()}_${cpfClean}`;

            const { data: pref, error: prefErr } = await supabase.functions.invoke("create-mercadopago-preference", {
                body: {
                    amount,
                    description: `Assinatura Clube - Via ${seller?.name || "Site"}`,
                    email: validated.email,
                    external_reference: externalRef
                }
            });
            if (prefErr) throw prefErr;

            await supabase.from("subscribers" as any).upsert({
                name: validated.nome_completo,
                email: validated.email,
                phone: validated.telefone,
                address: validated.endereco,
                cpf: cpfClean,
                discount_applied: true,
                external_reference: externalRef,
                mercadopago_preference_id: pref.id,
                seller_id: seller?.id,
                source: new URLSearchParams(location.search).get("source") || new URLSearchParams(location.search).get("utm_source") || "Link Vendedor",
            }, { onConflict: 'cpf' });

            window.location.href = pref.init_point;
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const fErrors: any = {};
                error.errors.forEach(err => fErrors[err.path[0]] = err.message);
                setErrors(fErrors);
                toast({ variant: "destructive", title: "Corrija os erros", description: "Verifique os campos em vermelho." });
            } else {
                toast({ variant: "destructive", title: "Erro", description: "Falha ao processar. Tente novamente." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seller) return;
        setIsLoading(true);

        try {
            await supabase.from('leads').insert({
                nome_completo: leadFormData.name,
                email: leadFormData.email,
                telefone: leadFormData.phone,
                source: `ExitIntent/Dialog: ${seller.name}`,
                seller_id: seller.id
            });
            trackEvent('whatsapp_click');

            const phone = seller.phone.replace(/\D/g, "");
            const msg = `Olá ${seller.name}, baixei o guia/tenho interesse no Clube e quero tirar dúvidas!`;
            window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, "_blank");
            setIsLeadDialogOpen(false);
            setShowExitIntent(false);
        } catch (e) {
            console.error(e);
            window.open(`https://wa.me/55${seller.phone.replace(/\D/g, "")}`, "_blank");
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToCheckout = () => {
        document.getElementById("checkout-section")?.scrollIntoView({ behavior: "smooth" });
    };

    // Countdown Logic
    const [timeLeft, setTimeLeft] = useState({ m: 14, s: 59 });
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.s > 0) return { ...prev, s: prev.s - 1 };
                if (prev.m > 0) return { m: prev.m - 1, s: 59 };
                return { m: 15, s: 0 }; // Reset fake
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (loadingSeller) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;

    return (
        <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden selection:bg-primary/20 pt-16">
            <SEO title="Oferta Exclusiva | Clube Aqui Tem" description="Economize R$ 800/mês com saúde e lazer." />

            {/* 1. TOPO / URGÊNCIA (Barra Fixa - Aumentada) */}
            <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 animate-gradient-x text-white py-4 fixed top-0 w-full z-50 shadow-2xl shadow-orange-500/30 flex items-center justify-center">
                <div className="container px-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-center">
                    <div className="flex items-center gap-2 animate-pulse">
                        <AlertTriangle className="w-6 h-6 fill-yellow-300 text-yellow-900" />
                        <span className="font-black text-sm md:text-lg uppercase tracking-wide drop-shadow-sm">
                            ATENÇÃO: Oferta Relâmpago Encerrando
                        </span>
                    </div>

                    <div className="flex items-center gap-3 bg-black/20 px-6 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                        <div className="text-center">
                            <span className="block font-black text-xl md:text-2xl leading-none font-mono">00</span>
                            <span className="text-[8px] uppercase font-bold opacity-80">HRS</span>
                        </div>
                        <span className="font-black text-xl">:</span>
                        <div className="text-center">
                            <span className="block font-black text-xl md:text-2xl leading-none font-mono text-yellow-300">
                                {String(timeLeft.m).padStart(2, '0')}
                            </span>
                            <span className="text-[8px] uppercase font-bold opacity-80">MIN</span>
                        </div>
                        <span className="font-black text-xl">:</span>
                        <div className="text-center">
                            <span className="block font-black text-xl md:text-2xl leading-none font-mono text-yellow-300">
                                {String(timeLeft.s).padStart(2, '0')}
                            </span>
                            <span className="text-[8px] uppercase font-bold opacity-80">SEG</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. HEADER MINIMALISTA (Logo + Vendedor) */}
            {/* 2. HEADER MINIMALISTA (Logo + Vendedor) */}
            <header className="pt-14 pb-6 container mx-auto px-4 flex flex-col md:flex-row justify-between items-center relative z-40 gap-4">
                <div className="flex items-center gap-3">
                    <img loading="lazy" src={logo} alt="Clube Aqui Tem" className="h-12 md:h-16 w-auto drop-shadow-sm" />
                    <div className="flex flex-col">
                        <span className="font-brand font-black text-xl md:text-2xl text-primary leading-none">Clube Aqui Tem</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Vantagens e Benefícios</span>
                    </div>
                </div>

                {seller && (
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-border shadow-sm">
                        <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
                        </div>
                        <p className="text-xs uppercase font-bold text-muted-foreground">
                            Atendimento Oficial: <span className="text-primary font-black">{seller.name}</span>
                        </p>
                    </div>
                )}
            </header>

            {/* 3. HERO / VSL */}
            <section className="pt-6 pb-16 px-4 text-center max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight mb-4 text-primary">
                        Pare de Jogar <span className="text-white bg-accent px-2 rounded -rotate-1 inline-block transform shadow-lg shadow-accent/30">Dinheiro Fora</span> Todos os Dias.
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                        Aproveite agora o Clube Aqui Tem e garanta até <strong>70% de desconto</strong> em medicamentos e comércios locais — corra, os benefícios não esperam!
                    </p>
                </motion.div>

                {/* VSL PLACEHOLDER */}
                {/* STATIC HERO IMAGE */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative w-full aspect-video md:aspect-[21/9] bg-white rounded-[2rem] shadow-2xl shadow-primary/10 overflow-hidden mb-10 border-4 border-white ring-1 ring-border"
                >
                    <img loading="lazy" src={happyImg} alt="Economia e Felicidade" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-8 text-white text-left">
                        <p className="font-brand font-black text-xl md:text-2xl drop-shadow-lg">
                            "A melhor decisão financeira que tomei este ano!"
                        </p>
                        <div className="flex text-yellow-400 gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400" />)}
                        </div>
                    </div>
                </motion.div>

                <Button
                    onClick={scrollToCheckout}
                    className="w-full md:w-auto h-16 md:h-20 px-8 md:px-12 text-xl md:text-2xl rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-[0_10px_30px_rgba(22,101,52,0.4)] hover:shadow-[0_15px_40px_rgba(22,101,52,0.5)] transition-all hover:-translate-y-1"
                >
                    SIM! QUERO ECONOMIZAR AGORA
                    <ArrowDown className="ml-3 w-6 h-6 animate-bounce" />
                </Button>
                <div className="flex justify-center gap-6 mt-6 opacity-60 grayscale items-center">
                    <img loading="lazy" src={horizonLogo} className="h-6" alt="Horizon" />
                    <img loading="lazy" src={portoSeguroLogo} className="h-5" alt="Porto" />
                    <span className="text-xs font-bold text-muted-foreground">Garantia de Gigantes</span>
                </div>
            </section>

            {/* 4. A DOR / PROBLEMA (Revamped) */}
            <section className="py-24 bg-white border-y border-slate-100 relative">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-100 rounded-full blur-3xl opacity-50" />
                            <h2 className="text-sm font-black text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 animate-pulse" />
                                Alerta Financeiro
                            </h2>
                            <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-[1.1]">
                                Você sente que seu dinheiro está <span className="text-red-600 underline decoration-wavy decoration-red-300">derretendo?</span>
                            </h3>
                            <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
                                <p className="opacity-90">
                                    É frustrante. Você trabalha o mês inteiro, mas quando precisa comprar um remédio básico, deixa <strong className="text-red-500">R$ 100,00 no balcão</strong> da farmácia em segundos.
                                </p>
                                <p className="opacity-90">
                                    E o medo de alguém da família adoecer de madrugada? Encarar uma UPA lotada ou pagar <strong className="text-red-500">R$ 400,00 numa consulta</strong> particular não deveria ser suas únicas opções.
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                            <h4 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                    <Lock size={20} />
                                </div>
                                O Segredo dos 2%
                            </h4>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3 opacity-60">
                                    <XCircle className="w-5 h-5 text-red-400 mt-1 shrink-0" />
                                    <p className="text-sm line-through decoration-red-400">Pagar preço cheio em remédios</p>
                                </div>
                                <div className="flex items-start gap-3 opacity-60">
                                    <XCircle className="w-5 h-5 text-red-400 mt-1 shrink-0" />
                                    <p className="text-sm line-through decoration-red-400">Depender da sorte na saúde pública</p>
                                </div>
                                <div className="h-px bg-slate-200 my-2" />
                                <div className="flex items-start gap-3 font-bold text-slate-800">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                                    <p className="text-sm">Ter o poder de compra de grandes empresas</p>
                                </div>
                                <div className="flex items-start gap-3 font-bold text-slate-800">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                                    <p className="text-sm">Blindar o patrimônio da sua família</p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-orange-500">
                                <p className="text-sm font-bold text-slate-700 italic">
                                    "O sistema tradicional lucra com sua falta de informação. Nós estamos aqui para quebrar esse ciclo agora."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. A SOLUÇÃO (Mecanismo Único - Revamped) */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto px-4 max-w-6xl relative z-10">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-4"
                        >
                            O Poder da Comunidade
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                            Muito Mais que Benefícios.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">É Inteligência Financeira.</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Esqueça as mensalidades abusivas dos planos e as taxas escondidas dos bancos.
                            Nós criamos um <span className="font-bold text-slate-800">sistema blindado</span> de proteção e economia real.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: "Economia Instantânea",
                                headline: "Seu CPF vale Ouro",
                                desc: "Basta digitar seu CPF no caixa da farmácia (Drogasil, Raia, etc.) e ver o preço despencar até 70% na hora. A economia de uma única compra já paga sua mensalidade do ano todo.",
                                color: "text-yellow-600",
                                bg: "bg-yellow-100",
                                border: "border-yellow-200"
                            },
                            {
                                icon: ShieldCheck,
                                title: "Saúde Ilimitada",
                                headline: "Médico no Bolso 24h",
                                desc: "Esqueça UPAs lotadas. Com um toque no celular, você fala com clínicos e pediatras sem limite de uso e sem pagar nenhum centavo a mais por consulta.",
                                color: "text-blue-600",
                                bg: "bg-blue-100",
                                border: "border-blue-200"
                            },
                            {
                                icon: Lock,
                                title: "Segurança Total",
                                headline: "Blindagem Familiar",
                                desc: "Você protegido contra imprevistos com Seguro de Acidentes Pessoais (R$ 10k), Auxílio Funeral e ainda concorre a sorteios de R$ 5.000 todo mês pela Loteria Federal.",
                                color: "text-primary",
                                bg: "bg-green-100",
                                border: "border-green-200"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                whileHover={{ y: -10 }}
                                className={`bg-white p-8 rounded-[2.5rem] shadow-xl border-2 ${item.border} hover:shadow-2xl transition-all duration-300 flex flex-col items-start h-full group`}
                            >
                                <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} mb-8 group-hover:scale-110 transition-transform`}>
                                    <item.icon size={32} strokeWidth={2.5} />
                                </div>
                                <div className="mb-4">
                                    <span className={`text-xs font-black uppercase tracking-widest ${item.color} mb-2 block`}>{item.headline}</span>
                                    <h3 className="text-2xl font-black text-slate-900">{item.title}</h3>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-lg mb-6">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. A OFERTA IRRESISTÍVEL (STACK) */}
            <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />

                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                    <h2 className="text-center text-3xl md:text-4xl font-black mb-12">Vamos Empilhar Tudo O Que Você Leva:</h2>

                    <div className="space-y-4 mb-12">
                        {[
                            { name: "Acesso ao Clube de Descontos Premium", value: "R$ 29,90/mês" },
                            { name: "Plataforma de Telemedicina 24h Ilimitada", value: "R$ 89,90/mês" },
                            { name: "Seguro de Acidentes Pessoais (Porto)", value: "R$ 49,90/mês" },
                            { name: "Assistência Funeral Familiar", value: "R$ 35,00/mês" },
                            { name: "Sorteios Mensais de Capitalização", value: "Bônus Exclusivo" },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-primary-foreground/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />
                                    <span className="font-bold text-lg">{item.name}</span>
                                </div>
                                <span className="text-primary-foreground/60 line-through decoration-red-500 decoration-2">{item.value}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 text-xl md:text-2xl font-black">
                            <span>Valor Total Real:</span>
                            <span className="text-primary-foreground/60 line-through">R$ 204,70 /mês</span>
                        </div>
                    </div>

                    <div className="bg-card text-card-foreground rounded-[3rem] p-8 md:p-12 text-center shadow-[0_0_60px_rgba(255,255,255,0.1)] relative" id="checkout-section">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase text-sm shadow-lg tracking-widest border-2 border-primary">
                            Oferta Exclusiva Hoje
                        </div>
                        <p className="text-lg font-bold text-muted-foreground mb-2">Leve TUDO isso por apenas:</p>
                        <div className="flex items-center justify-center gap-2 mb-8">
                            <span className="text-6xl md:text-8xl font-black tracking-tighter text-foreground">19</span>
                            <div className="flex flex-col items-start px-2">
                                <span className="text-2xl md:text-4xl font-black text-muted-foreground line-through">R$ 204</span>
                                <span className="text-3xl md:text-5xl font-black">,99</span>
                            </div>
                        </div>

                        {/* FORMULÁRIO DE CHECKOUT INTEGRADO */}
                        <form onSubmit={handleCheckoutSubmit} className="max-w-md mx-auto space-y-4 text-left">
                            <div className="space-y-4 mb-6 bg-muted/50 p-6 rounded-2xl border border-border">
                                <p className="text-center font-black text-sm uppercase tracking-widest text-muted-foreground mb-4">Dados Seguros para Ativação</p>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase font-bold text-muted-foreground">Nome Completo</Label>
                                    <Input name="nome_completo" value={formData.nome_completo} onChange={handleInputChange} className={`bg-background h-12 ${errors.nome_completo ? "border-red-500" : ""}`} placeholder="Como no seu RG" />
                                    {errors.nome_completo && <span className="text-red-500 text-xs">{errors.nome_completo}</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase font-bold text-muted-foreground">CPF</Label>
                                        <Input name="cpf" value={formData.cpf} onChange={handleInputChange} className={`bg-background h-12 ${errors.cpf ? "border-red-500" : ""}`} placeholder="000.000.000-00" maxLength={14} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase font-bold text-muted-foreground">WhatsApp</Label>
                                        <Input name="telefone" value={formData.telefone} onChange={handleInputChange} className={`bg-background h-12 ${errors.telefone ? "border-red-500" : ""}`} placeholder="(00) 00000-0000" maxLength={15} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase font-bold text-muted-foreground">E-mail</Label>
                                    <Input name="email" value={formData.email} onChange={handleInputChange} className={`bg-background h-12 ${errors.email ? "border-red-500" : ""}`} placeholder="Para receber o acesso" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase font-bold text-muted-foreground">Cidade/Estado</Label>
                                    <Input name="endereco" value={formData.endereco} onChange={handleInputChange} className={`bg-background h-12 ${errors.endereco ? "border-red-500" : ""}`} placeholder="Ex: São Paulo, SP" />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-16 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-lg ring-4 ring-primary/20 transition-all hover:scale-[1.02]"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : "QUERO MINHA VAGA AGORA"}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-bold mt-4">
                                <Lock size={12} /> Pagamento 100% Seguro via MercadoPago
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* PROVA SOCIAL E FAQ */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-center text-3xl font-black mb-12">Perguntas Frequentes</h2>
                    <div className="space-y-4">
                        {FAQ.map((item, i) => (
                            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                                >
                                    <span className="font-bold text-slate-900 pr-4">{item.q}</span>
                                    {openFaqIndex === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                <AnimatePresence>
                                    {openFaqIndex === i && (
                                        <motion.div
                                            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                                            className="overflow-hidden bg-white text-slate-600"
                                        >
                                            <div className="p-6 pt-0 border-t border-slate-100/50 leading-relaxed">
                                                {item.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* GARANTIA */}
            <section className="py-12 bg-slate-50 text-center border-t border-slate-200">
                <div className="container px-4">
                    <img loading="lazy" src={logo} className="h-8 mx-auto grayscale opacity-30 mb-4" alt="Logo" />
                    <p className="text-sm text-slate-400">© 2024 Clube Aqui Tem. Todos os direitos reservados. <br />Política de Privacidade • Termos de Uso</p>
                </div>
            </section>

            {/* FLOAT BUTTON WHATSAPP */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsLeadDialogOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] flex items-center justify-center hover:bg-[#128C7E] transition-all"
                title="Falar no WhatsApp"
            >
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                <MessageSquare className="w-8 h-8 fill-white" />
            </motion.button>

            {/* EXIT INTENT DIALOG / LEAD MAGNET */}
            <Dialog open={showExitIntent || isLeadDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    setShowExitIntent(false);
                    setIsLeadDialogOpen(false);
                }
            }}>
                <DialogContent className="max-w-md rounded-[2rem] border-none p-0 overflow-hidden bg-white">
                    <div className="bg-orange-500 p-8 text-center text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black uppercase mb-2">Espere! Não vá ainda...</h2>
                            <p className="text-white/90 text-sm font-medium">Você tem dúvidas sobre se o Clube é para você? Fale diretamente com {seller?.name || "nosso consultor"} antes de decidir.</p>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full bg-black/10 z-0"></div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-50"></div>
                    </div>
                    <div className="p-8">
                        <form onSubmit={handleLeadSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">Seu Nome</Label>
                                <Input name="name" value={leadFormData.name} onChange={handleLeadChange} className="rounded-xl h-12 bg-slate-50" placeholder="Nome Completo" required />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">WhatsApp</Label>
                                <Input name="phone" value={leadFormData.phone} onChange={handleLeadChange} className="rounded-xl h-12 bg-slate-50" placeholder="(00) 99999-9999" required maxLength={15} />
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black shadow-lg">
                                {isLoading ? <Loader2 className="animate-spin" /> : "QUERO TIRAR UMA DÚVIDA"}
                            </Button>
                            <p className="text-center text-[10px] text-slate-400 mt-4">Não enviaremos spam. Apenas contato humano.</p>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default VendaVendedor;
