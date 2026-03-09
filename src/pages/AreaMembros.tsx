import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";
import {
  CheckCircle,
  Shield,
  Heart,
  Phone,
  Pill,
  Stethoscope,
  Tag,
  Smartphone,
  LogOut,
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  Store,
  MapPin,
  Calendar,
  Percent,
  User,
  Zap,
  Ticket,
  ShieldCheck,
  Camera,
  Upload,
  CreditCard,
  QrCode,
  Download,
  DownloadCloud
} from "lucide-react";
import html2canvas from 'html2canvas';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import horizonLogo from "@/assets/horizon-logo.png";
import portoSeguroLogo from "@/assets/porto-seguro-logo.png";
import happyFamily from "@/assets/happy-family.png";

interface Subscriber {
  id: string;
  name: string;
  email: string;
  cpf: string;
  first_access: boolean;
  photo_url?: string;
  created_at?: string;
  status?: string;
}

interface PartnerDiscount {
  discount_id: string;
  partner_name: string;
  partner_phone: string;
  partner_address: string;
  titulo: string;
  descricao: string;
  percentual_desconto: number;
  regras: string;
  codigo_cupom: string;
  validade_fim: string;
  categorias: string[];
  imagem_url?: string;
}

const AreaMembros = () => {
  const [step, setStep] = useState<'login' | 'create-password' | 'dashboard'>('login');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [partnerDiscounts, setPartnerDiscounts] = useState<PartnerDiscount[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFuneralModal, setShowFuneralModal] = useState(false);
  const [showAccidentModal, setShowAccidentModal] = useState(false);
  const [showTelemedicineModal, setShowTelemedicineModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [showBasketModal, setShowBasketModal] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const savedSubscriber = localStorage.getItem('club_member');
    if (savedSubscriber) {
      setSubscriber(JSON.parse(savedSubscriber));
      setStep('dashboard');
      loadPartnerDiscounts();
    }
  }, []);

  const loadPartnerDiscounts = async () => {
    setLoadingDiscounts(true);
    try {
      const { data, error } = await supabase
        .rpc('get_active_partner_discounts');

      if (error) {
        console.error('Error loading partner discounts:', error);
      } else {
        setPartnerDiscounts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingDiscounts(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanCPF = cpf.replace(/\D/g, '');

      const { data: subscriber, error } = await supabase
        .from('subscribers')
        .select('id, name, email, cpf, password_hash, first_access, photo_url, created_at, status')
        .eq('cpf', cleanCPF)
        .eq('status', 'approved')
        .single();

      if (error || !subscriber) {
        console.error('Subscriber not found:', error);
        toast.error('CPF não encontrado ou pagamento não confirmado.');
        setLoading(false);
        return;
      }

      if (subscriber.first_access || !subscriber.password_hash) {
        if (!password || password === '') {
          setSubscriber(subscriber);
          setStep('create-password');
          setLoading(false);
          return;
        }
      }

      if (!password) {
        toast.error('Senha é obrigatória');
        setLoading(false);
        return;
      }

      const hashedPassword = await hashPassword(password);

      if (hashedPassword !== subscriber.password_hash) {
        toast.error('Senha incorreta');
        setLoading(false);
        return;
      }

      setSubscriber(subscriber);
      localStorage.setItem('club_member', JSON.stringify(subscriber));
      setStep('dashboard');
      loadPartnerDiscounts();
      toast.success('Bem-vindo de volta ao seu Clube!');

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const hashedPassword = await hashPassword(password);

      const { error } = await supabase
        .from('subscribers')
        .update({
          password_hash: hashedPassword,
          first_access: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriber?.id);

      if (error) {
        console.error('Error updating password:', error);
        toast.error('Erro ao criar senha');
        setLoading(false);
        return;
      }

      const updatedSubscriber = { ...subscriber, first_access: false } as Subscriber;
      localStorage.setItem('club_member', JSON.stringify(updatedSubscriber));
      setSubscriber(updatedSubscriber);
      setStep('dashboard');
      loadPartnerDiscounts();
      toast.success('Senha criada com sucesso! Bem-vindo ao clube!');

    } catch (error: any) {
      console.error('Create password error:', error);
      toast.error('Erro ao criar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    const loadingToast = toast.loading('Gerando sua carteirinha...');

    try {
      // Pequeno delay para garantir que imagens foram renderizadas
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = cardRef.current;
      const width = element.offsetWidth;
      const height = element.offsetHeight;

      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        width: width,
        height: height,
        windowWidth: width,
        windowHeight: height,
        onclone: (clonedDoc) => {
          clonedDoc.body.style.margin = '0';
          clonedDoc.body.style.padding = '0';
          const card = clonedDoc.querySelector('.w-\\[340px\\]') as HTMLElement;
          if (card) {
            card.style.transform = 'none';
            card.style.transition = 'none';
            card.style.margin = '0';
            card.style.width = '340px';
            card.style.height = '210px';
            card.style.overflow = 'visible';
          }
        }
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.download = `carteirinha-clube-${subscriber?.name?.split(' ')[0].toLowerCase() || 'membro'}.png`;
      link.href = image;
      link.click();

      toast.success('Carteirinha baixada com sucesso!', { id: loadingToast });
    } catch (error) {
      console.error('Erro ao baixar carteirinha:', error);
      toast.error('Erro ao gerar imagem da carteirinha.', { id: loadingToast });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('club_member');
    setSubscriber(null);
    setCpf('');
    setPassword('');
    setStep('login');
    toast.success('Você saiu da sua conta');
  };

  const benefits = [
    {
      icon: Shield,
      title: "Assistência Funeral Individual",
      description: "Cobertura completa para você em caso de necessidade, garantindo tranquilidade para sua família.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => setShowFuneralModal(true)
    },
    {
      icon: Heart,
      title: "Assistência Acidente Pessoal",
      description: "Proteção financeira em caso de acidentes, com indenização garantida pela Porto Seguro.",
      color: "text-red-500",
      bgColor: "bg-red-50",
      onClick: () => setShowAccidentModal(true)
    },
    {
      icon: Phone,
      title: "Telemedicina 24h",
      description: "Consultas médicas por vídeo ou telefone, disponíveis 24 horas por dia, 7 dias por semana.",
      color: "text-green-600",
      bgColor: "bg-green-50",
      onClick: () => setShowTelemedicineModal(true)
    },
    {
      icon: Pill,
      title: "Descontos em Farmácias",
      description: "Economia garantida em medicamentos nas principais redes de farmácias do país.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => setShowPharmacyModal(true)
    },
    {
      icon: ShieldCheck,
      title: "Auxílio Cesta Básica",
      description: "Amparo e cuidado para sua família com suporte real e imediato em momentos difíceis.",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      onClick: () => setShowBasketModal(true)
    },
    {
      icon: Smartphone,
      title: "Cupons Online",
      description: "Resgate agora descontos exclusivos em grandes lojas: Amazon, Magalu, Ifood e muito mais.",
      color: "text-white",
      bgColor: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-2xl shadow-purple-500/50 border-2 border-white/20 animate-pulse",
      link: "/cupons",
      badge: "NOVO"
    }
  ];

  // Login Screen
  if (step === 'login') {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
        <SEO
          title="Minha Conta"
          description="Acesse sua área exclusiva de associado do Clube Aqui Tem."
        />
        <Header />

        <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md relative z-10"
          >
            <div className="mb-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold bg-white px-4 py-2 rounded-full border border-border shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Início
              </Link>
            </div>

            <Card className="border border-border shadow-2xl rounded-3xl overflow-hidden bg-white">
              <div className="bg-primary p-10 text-center text-white relative">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <User className="w-10 h-10 text-accent" />
                </div>
                <h1 className="text-2xl font-brand font-bold tracking-tight">Área do Associado</h1>
                <p className="text-white/60 text-sm mt-1">Acesse seus benefícios exclusivos</p>
              </div>

              <CardContent className="p-8 md:p-10">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="font-bold text-primary ml-1">CPF cadastrado</Label>
                    <Input
                      id="cpf"
                      type="text"
                      value={cpf}
                      onChange={handleCPFChange}
                      placeholder="000.000.000-00"
                      className="h-12 rounded-xl border-border bg-muted/20 focus:bg-white"
                      maxLength={14}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-bold text-primary ml-1">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Deixe em branco se for o 1º acesso"
                        className="h-12 pr-12 rounded-xl border-border bg-muted/20 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full h-14 text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                    disabled={loading}
                  >
                    {loading ? 'Validando Acesso...' : 'Acessar minha Conta'}
                  </Button>

                  <div className="text-center pt-6">
                    <Link
                      to="/esqueci-senha"
                      className="text-sm font-bold text-primary hover:text-accent transition-colors"
                    >
                      Esqueceu sua senha?
                    </Link>
                  </div>

                  <div className="bg-muted/30 rounded-2xl p-4 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary shrink-0" />
                    <p>
                      <strong>Primeira vez aqui?</strong> Use apenas seu CPF clicando em "Acessar minha Conta". Você será convidado a criar sua senha no próximo passo.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        <Footer />
      </div>
    );
  }

  // Create Password Screen
  if (step === 'create-password') {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md relative z-10"
          >
            <Card className="border border-border shadow-2xl rounded-3xl overflow-hidden bg-white">
              <div className="bg-accent p-10 text-center text-white">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-brand font-bold tracking-tight">Criar sua Chave</h1>
                <p className="text-white/80 text-sm mt-1">Bem-vindo, {subscriber?.name?.split(' ')[0]}!</p>
              </div>

              <CardContent className="p-8 md:p-10">
                <form onSubmit={handleCreatePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="font-bold text-primary ml-1">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        className="h-12 pr-12 rounded-xl border-border bg-muted/20 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-bold text-primary ml-1">Confirme sua Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha acima"
                      required
                      className="h-12 rounded-xl border-border bg-muted/20 focus:bg-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full h-14 text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                    disabled={loading}
                  >
                    {loading ? 'Salvando Senha...' : 'Finalizar e Acessar Agora'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <SEO
        title={`Dashboard de ${subscriber?.name?.split(' ')[0]}`}
        description="Gerencie seus benefícios e resgate cupons de desconto exclusivos."
      />
      <Header />

      {/* Hero Header */}
      <section className="pt-32 pb-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-[140px] translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium mb-4 border border-white/20">
                <Zap className="w-4 h-4 text-accent animate-pulse" />
                Associado Premium Ativo
              </div>
              <h1 className="text-4xl md:text-5xl font-brand font-bold text-white mb-2">
                Olá, <span className="text-accent underline underline-offset-8 decoration-accent/30">{subscriber?.name?.split(' ')[0]}</span>!
              </h1>
              <p className="text-primary-foreground/80 text-lg">
                Seja bem-vindo à sua central de benefícios e economia.
              </p>
            </motion.div>

            {/* VIRTUAL CARD SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotateY: 90 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 50 }}
              className="relative group perspective-1000 mx-auto md:mx-0 flex flex-col items-center gap-4"
            >
              <div
                ref={cardRef}
                className="w-[340px] h-[210px] bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden transform transition-transform duration-500 hover:scale-105 select-none"
              >
                {/* Card Background Effects */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>

                {/* Card Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/95 rounded-xl flex items-center justify-center shadow-lg">
                        <img loading="lazy" src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                      </div>
                      <div>
                        <h3 className="text-white font-brand font-black text-lg leading-none tracking-tight">Clube Aqui Tem</h3>
                        <span className="text-[10px] text-white/50 font-medium uppercase tracking-widest block -mt-0.5">Vantagens e Benefícios</span>
                        <span className="text-[9px] text-white/70 uppercase tracking-widest font-bold block mt-1">Membro Premium</span>
                      </div>
                    </div>
                    <div className="relative group/photo cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 z-20 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !subscriber) return;

                          const loadingToast = toast.loading('Atualizando foto...');
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${subscriber.id}-${Date.now()}.${fileExt}`;

                            const { error: uploadError } = await supabase.storage
                              .from('member-photos')
                              .upload(fileName, file);

                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabase.storage
                              .from('member-photos')
                              .getPublicUrl(fileName);

                            const { error: updateError } = await supabase
                              .from('subscribers')
                              .update({ photo_url: publicUrl })
                              .eq('id', subscriber.id);

                            if (updateError) throw updateError;

                            const updatedSubscriber = { ...subscriber, photo_url: publicUrl };
                            setSubscriber(updatedSubscriber);
                            localStorage.setItem('club_member', JSON.stringify(updatedSubscriber));

                            toast.success('Foto atualizada com sucesso!', { id: loadingToast });
                          } catch (error) {
                            console.error(error);
                            toast.error('Erro ao atualizar foto.', { id: loadingToast });
                          }
                        }}
                      />
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-accent shadow-lg bg-black/50 relative">
                        {subscriber?.photo_url ? (
                          <img loading="lazy" src={subscriber?.photo_url} alt="Foto" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-1">
                            <Camera size={20} />
                            <span className="text-[8px] font-bold">FOTO</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Titular</p>
                      <p className="text-white font-mono font-bold text-lg tracking-wide truncate shadow-sm">{subscriber?.name}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">CPF</p>
                        <p className="text-white/80 font-mono text-sm tracking-widest">{subscriber?.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Desde</p>
                        <p className="text-white/80 font-mono text-sm">{subscriber?.created_at ? new Date(subscriber.created_at).toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }) : '2024'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validity Strip */}
                <div className="absolute bottom-0 w-full bg-accent/90 backdrop-blur text-center py-1">
                  <p className="text-[9px] text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheck size={10} className="text-white" />
                    Validade: Ativa (Mensalidade em Dia)
                  </p>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-primary-foreground/60 text-xs font-medium flex items-center justify-center gap-2">
                  <Camera size={12} />
                  Toque na foto para alterar
                </p>
              </div>

              <Button
                onClick={handleDownloadCard}
                disabled={isDownloading}
                className="bg-accent hover:bg-accent/90 text-primary font-black rounded-xl shadow-lg shadow-accent/20 border-none px-6 h-12 gap-2 mt-2 w-full max-w-[340px]"
              >
                {isDownloading ? (
                  <span className="flex items-center gap-2">
                    <DownloadCloud className="w-5 h-5 animate-bounce" />
                    Gerando Papel de Parede...
                  </span>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Baixar Carteirinha (Foto)
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white hover:text-primary h-14 px-8 rounded-2xl transition-all" onClick={handleLogout}>
                <LogOut className="w-5 h-5 mr-3" />
                Sair da Conta
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="flex-grow container mx-auto px-4 -mt-12 pb-24 relative z-20">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Quick Access Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => {
              const isClickable = benefit.link || (benefit as any).onClick;
              const CardComponent = (
                <Card
                  className={`h-full border border-border bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-[2rem] overflow-hidden group ${isClickable ? 'cursor-pointer ring-2 ring-transparent hover:ring-accent/50' : ''}`}
                  onClick={(benefit as any).onClick}
                >
                  <CardContent className="p-8 relative">
                    {(benefit as any).badge && (
                      <div className="absolute top-6 right-6 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-sm animate-pulse">
                        {(benefit as any).badge}
                      </div>
                    )}
                    <div className={`w-16 h-16 ${benefit.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                      <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                    </div>
                    <h3 className="font-brand font-bold text-xl text-primary mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                    {isClickable && (
                      <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-primary/60 bg-primary/5 px-3 py-1.5 rounded-full w-fit uppercase tracking-widest group-hover:bg-accent group-hover:text-white transition-all duration-300">
                        <Zap className="w-3 h-3 animate-pulse" />
                        Clique para mais detalhes
                      </div>
                    )}
                  </CardContent>
                </Card>
              );

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  {(benefit as any).link ? (
                    <Link to={(benefit as any).link} className="block h-full">
                      {CardComponent}
                    </Link>
                  ) : (
                    CardComponent
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Partner Discounts Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-3xl font-brand font-bold text-primary">Cupons dos Parceiros</h2>
                  <p className="text-muted-foreground">Descontos exclusivos perto de você</p>
                </div>
              </div>
            </div>

            {loadingDiscounts ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse h-64 rounded-[2rem] border-border bg-muted/20" />
                ))}
              </div>
            ) : partnerDiscounts.length === 0 ? (
              <Card className="border-2 border-dashed border-muted rounded-[2.5rem] bg-white">
                <CardContent className="p-20 text-center">
                  <Store className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
                  <h3 className="text-2xl font-brand font-bold text-primary mb-2">Novos Cupons Chegando</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Nossos parceiros locais estão preparando ofertas incríveis! Fique de olho nesta área.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {partnerDiscounts.map((discount, index) => (
                  <motion.div
                    key={discount.discount_id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Card className="h-full border border-border shadow-sm hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] overflow-hidden bg-white">
                      {discount.imagem_url ? (
                        <div className="h-48 w-full overflow-hidden relative">
                          <img loading="lazy"
                            src={discount.imagem_url}
                            alt={discount.titulo}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1.5 rounded-xl shadow-lg font-brand font-black">
                            -{discount.percentual_desconto}%
                          </div>
                        </div>
                      ) : (
                        <div className="bg-accent/5 p-8 pb-4 relative">
                          <div className="absolute top-6 right-6 flex flex-col items-center">
                            <div className="bg-accent text-white px-4 py-2 rounded-2xl shadow-lg shadow-accent/20">
                              <span className="font-brand font-black text-2xl">-{discount.percentual_desconto}%</span>
                            </div>
                          </div>
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-6 border border-accent/10">
                            <Store className="w-7 h-7 text-accent" />
                          </div>
                          <h3 className="text-xl font-bold text-primary line-clamp-1">{discount.titulo}</h3>
                          <p className="text-sm font-black text-accent mt-1 uppercase tracking-tighter">
                            {discount.partner_name}
                          </p>
                        </div>
                      )}

                      <CardContent className="p-8 pt-4 space-y-6">
                        {discount.imagem_url && (
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-primary line-clamp-1">{discount.titulo}</h3>
                            <p className="text-xs font-black text-accent uppercase tracking-tighter">
                              {discount.partner_name}
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground min-h-[3rem] line-clamp-2">
                          {discount.descricao}
                        </p>

                        <div className="space-y-3">
                          {discount.codigo_cupom && (
                            <div className="bg-primary/5 p-4 rounded-2xl border-2 border-dashed border-primary/20 text-center relative overflow-hidden group">
                              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.03] transition-opacity"></div>
                              <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">CÓDIGO EXCLUSIVO</p>
                              <code className="text-lg font-brand font-black text-primary tracking-[3px]">
                                {discount.codigo_cupom}
                              </code>
                            </div>
                          )}

                          <div className="pt-4 border-t border-border flex flex-col gap-3">
                            {discount.partner_phone && (
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                  <Phone className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-medium text-primary/70">{discount.partner_phone}</span>
                              </div>
                            )}

                            {discount.partner_address && (
                              <div className="flex items-start gap-3 text-xs text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                                  <MapPin className="w-3.5 h-3.5" />
                                </div>
                                <span className="line-clamp-1 font-medium text-primary/70">{discount.partner_address}</span>
                              </div>
                            )}

                            {discount.validade_fim && (
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                  <Calendar className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-medium">Até {new Date(discount.validade_fim).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="hero"
                          className="w-full h-14 text-sm font-bold shadow-xl shadow-accent/20 hover:scale-[1.03] active:scale-95 transition-all rounded-2xl"
                          onClick={() => {
                            if (discount.partner_phone) {
                              const phone = discount.partner_phone.replace(/\D/g, '');
                              const message = `Olá! Sou associado do Clube Aqui Tem e gostaria de utilizar meu desconto exclusivo: ${discount.titulo}${discount.codigo_cupom ? ` (Meu Cupom: ${discount.codigo_cupom})` : ''}`;
                              window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
                            }
                          }}
                        >
                          Resgatar este Benefício
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Bottom Info Section */}
          {/* Bottom Info Section */}
          <div className="w-full">
            {/* Coverage Info Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="border border-border bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    <div className="p-10 lg:w-1/2 flex flex-col justify-center items-center text-center">
                      <div className="flex flex-col items-center gap-4 mb-10 pb-6 border-b border-border/50 w-full">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                          <ShieldCheck className="w-8 h-8 text-primary group-hover:text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-brand font-bold text-primary">Sua Cobertura</h3>
                          <p className="text-sm text-muted-foreground">Transparência e segurança total</p>
                        </div>
                      </div>

                      <div className="space-y-12 w-full">
                        <div className="flex flex-wrap justify-center items-center gap-12 opacity-90 group-hover:opacity-100 transition-opacity">
                          <img loading="lazy" src={horizonLogo} alt="Horizon" className="h-24 w-auto object-contain" />
                          <div className="hidden sm:block w-px h-20 bg-border" />
                          <img loading="lazy" src={portoSeguroLogo} alt="Porto Seguro" className="h-16 w-auto object-contain" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-[#F9FAFB] p-6 rounded-2xl border border-border/50">
                          Benefícios de <strong className="text-primary">Saúde e Seguro de Vida</strong> são garantidos pela <strong>Horizon Corretora</strong> em parceria com a <strong className="text-primary">Porto Seguro</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-full">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 lg:hidden"></div>
                      <img loading="lazy"
                        src={happyFamily}
                        alt="Família feliz e segura"
                        className="absolute inset-0 w-full h-full object-cover object-top lg:rounded-r-[2.5rem]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={showFuneralModal} onOpenChange={setShowFuneralModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-primary text-white">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20">
              <Shield className="w-10 h-10 text-accent" />
            </div>
            <DialogTitle className="text-3xl font-brand font-bold text-white">Assistência Funeral Individual</DialogTitle>
            <DialogDescription className="text-white/70 text-lg">
              Passo a Passo: Como acionar a Assistência
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl">
              <p className="text-blue-900 font-medium leading-relaxed">
                🕊️ Sabemos que a perda de um ente querido é um momento delicado e de dor. Por isso, criamos este guia rápido para orientar sua família a utilizar a Assistência Funeral (com cobertura de até <strong>R$ 7.000,00</strong>) da forma mais tranquila possível.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-primary/20">1</div>
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Passo 1: Entre em contato com a Central</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Assim que ocorrer o falecimento, um familiar ou representante deve ligar imediatamente para a Central de Atendimento 24 horas da <strong>HORIZON CORRETORA DE SEGUROS</strong>.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold border border-green-100">
                    <Phone className="w-4 h-4" />
                    0800 100 1701 (Ligação Gratuita)
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-primary/20">2</div>
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Passo 2: Tenha as informações em mãos</h4>
                  <p className="text-muted-foreground mb-3">No momento da ligação, o atendente solicitará alguns dados básicos para iniciar o processo:</p>
                  <ul className="grid gap-2">
                    {['Nome completo do Associado (segurado titular)', 'Número de CPF', 'Local onde ocorreu o óbito (hospital, residência, etc.)', 'Um telefone de contato do familiar responsável'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-2 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-primary/20">3</div>
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Passo 3: Prestação de Serviços</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    A assistência aciona seus parceiros e se encarrega de organizar e pagar todos os trâmites do funeral, respeitando o limite de <strong>R$ 7.000,00</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-primary/20">4</div>
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Passo 4: Deixe a organização conosco</h4>
                  <p className="text-muted-foreground mb-4">A assistência cuidará de todos os detalhes burocráticos e práticos para a despedida. Os serviços garantidos incluem:</p>

                  <div className="grid gap-3">
                    {[
                      { title: "Documentação", text: "Assessoria para liberação do corpo e registro do óbito em cartório." },
                      { title: "Estrutura", text: "Urna/caixão, ornamentação com flores da época, paramentos, coroa de flores e livro de presença." },
                      { title: "Cerimônia", text: "Locação de sala velatória ou capela e o pagamento das taxas de sepultamento ou cremação." },
                      { title: "Transporte", text: "Carro funerário e repatriação (retorno) do corpo caso ocorra durante uma viagem." },
                      { title: "Jazigo", text: "Locação de um jazigo por 3 (três) anos, caso a família não possua um local definitivo." }
                    ].map((service, i) => (
                      <div key={i} className="bg-muted/30 p-4 rounded-xl">
                        <h5 className="font-bold text-primary text-sm mb-1">{service.title}</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">{service.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 mt-4"
              onClick={() => setShowFuneralModal(false)}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAccidentModal} onOpenChange={setShowAccidentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-red-600 text-white">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-brand font-bold text-white">Seguro de Vida por Acidente</DialogTitle>
            <DialogDescription className="text-white/70 text-lg">
              Morte Acidental: O que é e como acionar?
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl">
              <h4 className="font-bold text-red-900 mb-2">O que é essa cobertura?</h4>
              <p className="text-red-800 text-sm leading-relaxed">
                A cobertura de Morte Acidental é uma garantia de proteção financeira e amparo familiar. Ela assegura que, caso o colaborador (segurado) venha a falecer exclusivamente em consequência de um acidente pessoal coberto, os seus beneficiários indicados (ou herdeiros legais) receberão o pagamento de uma indenização no valor do Capital Segurado contratado. Esse valor é pago de uma só vez para ajudar na reestruturação e estabilidade financeira da família.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-red-600/20">1</div>
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Passo 1: Preencher o Aviso de Sinistro</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    É necessário preencher e assinar o formulário oficial chamado **"Aviso de Sinistro"** da Porto Seguro, informando a data, local, hora e a causa do evento.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-red-600/20">2</div>
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Passo 2: Documentação do Segurado</h4>
                  <p className="text-muted-foreground mb-3">Para comprovar o acidente, a seguradora exigirá alguns documentos essenciais do titular falecido:</p>
                  <div className="grid gap-2">
                    {[
                      'Certidão de Óbito (cópia autenticada)',
                      'Cópias simples do RG, CPF e comprovante de endereço',
                      'Boletim de Ocorrência Policial (B.O.) e Laudo do IML (necroscópico)',
                      'Laudo do primeiro atendimento médico hospitalar',
                      'Em caso de acidente de trânsito (motorista), cópia da CNH',
                      'Em caso de acidente de trabalho, cópia da CAT',
                      'Termo de Rescisão (para comprovar vínculo)'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-2 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-red-600/20">3</div>
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Passo 3: Documentação dos Beneficiários</h4>
                  <p className="text-muted-foreground mb-3">As pessoas que vão receber a indenização também precisam enviar:</p>
                  <div className="grid gap-2">
                    {[
                      'Cópias simples do RG, CPF e comprovante de endereço',
                      'Certidão de Casamento atualizada (se cônjuge)',
                      'Autorização para Crédito em Conta'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-2 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-red-600/20">4</div>
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Passo 4: Envio para a Seguradora</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Com toda a documentação reunida e o formulário preenchido, basta encaminhar os arquivos à seguradora para análise final.
                  </p>
                  <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                    <p className="text-sm text-green-800 font-medium flex flex-wrap items-center gap-2">
                      Para acionar a seguradora, entre em contato com a
                      <strong className="text-green-900">HORIZON CORRETORA DE SEGUROS</strong> via WhatsApp:
                    </p>
                    <a
                      href="https://wa.me/5521965443321"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-green-700 font-black hover:underline group"
                    >
                      <Phone className="w-4 h-4" />
                      (21) 96544-3321
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-xl shadow-red-600/20 mt-4"
              onClick={() => setShowAccidentModal(false)}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTelemedicineModal} onOpenChange={setShowTelemedicineModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-green-600 text-white">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-brand font-bold text-white">Telemedicina 24h</DialogTitle>
            <DialogDescription className="text-white/70 text-lg">
              Passo a Passo: Como utilizar a Teleconsulta / Orientação Médica
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-2xl">
              <p className="text-green-900 font-medium leading-relaxed">
                📱 Cuidar da saúde da sua equipe ficou muito mais fácil e acessível. Com o benefício de Teleconsulta - Orientação Médica, o colaborador tem acesso a profissionais de saúde à distância, no conforto de casa. É a opção ideal para tirar dúvidas, receber orientações sobre sintomas ou ter um atendimento primário rápido, sem precisar enfrentar filas em prontos-socorros.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-green-600/20">1</div>
                <div className="flex-grow">
                  <h4 className="font-bold text-primary text-lg mb-2">Passo 1: Verifique a indicação do serviço</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    A orientação médica à distância é indicada para casos de baixa complexidade (como resfriados, alergias, pequenas dores, dúvidas sobre medicamentos, etc.).
                  </p>
                  <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3 max-w-lg">
                    <Zap className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-800 leading-relaxed">
                      <strong>Atenção:</strong> Em caso de acidentes graves ou emergências médicas (como falta de ar intensa ou suspeita de infarto), dirija-se imediatamente ao pronto-socorro presencial mais próximo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-green-600/20">2</div>
                <div className="flex-grow">
                  <h4 className="font-bold text-primary text-lg mb-2">Passo 2: Acesse os Canais de Atendimento</h4>
                  <p className="text-muted-foreground mb-4">
                    Para utilizar a Teleconsulta, o colaborador (segurado) deve realizar o cadastro de seus dados e CPF no portal oficial:
                  </p>
                  <Button
                    variant="hero"
                    className="w-full sm:w-auto h-12 px-8 bg-[#0055c4] hover:bg-[#0044a1] text-white shadow-lg shadow-[#0055c4]/20 rounded-xl"
                    onClick={() => window.open('https://portoseguro.vidaclass.com.br/', '_blank')}
                  >
                    Acessar Portal Telemedicina
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-green-600/20">3</div>
                <div className="flex-grow">
                  <h4 className="font-bold text-primary text-lg mb-2">Passo 3: Fale com o médico</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Após o cadastro inicial, você será direcionado para um profissional de saúde. O médico avaliará seus sintomas, passará as orientações necessárias e, caso preciso, poderá fornecer prescrições médicas (receitas) em formato digital.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <div className="p-6 bg-primary/5 rounded-[1.5rem] border border-primary/10">
                <p className="text-sm text-primary font-medium flex items-center gap-2 mb-3">
                  Qualquer dúvida entre em contato com:
                </p>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-primary/40 leading-none mb-1">HORIZON CORRETORA DE SEGUROS</p>
                      <p className="text-primary font-bold">(21) 96544-3321</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold h-10 rounded-xl px-4 gap-2"
                    onClick={() => window.open('https://wa.me/5521965443321', '_blank')}
                  >
                    Chamar no Whats
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 font-bold text-lg"
              onClick={() => setShowTelemedicineModal(false)}
            >
              Concluir orientação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPharmacyModal} onOpenChange={setShowPharmacyModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-purple-600 text-white">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20">
              <Pill className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-brand font-bold text-white">Descontos em Farmácias</DialogTitle>
            <DialogDescription className="text-white/70 text-lg">
              Programa Sou Mais Saúde - Rede d1000
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-2xl">
              <p className="text-purple-900 font-medium leading-relaxed">
                💊 Como membro exclusivo, você tem acesso ao <strong>Programa Sou Mais Saúde</strong>, uma parceria incrível com a <strong>Rede d1000</strong> que garante descontos especiais para cuidar da sua saúde e qualidade de vida.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-primary text-lg mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-purple-600" />
                  Quais são os descontos garantidos?
                </h4>
                <div className="grid gap-3">
                  {[
                    { label: "Medicamentos Genéricos", value: "40% de desconto" },
                    { label: "Medicamentos de Marca e Similares", value: "15% de desconto" },
                    { label: "Medicamentos OTC (isentos de prescrição)", value: "10% de desconto" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                      <span className="text-sm text-primary font-medium">{item.label}</span>
                      <span className="text-lg font-black text-purple-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-primary text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Onde posso utilizar?
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  A Rede d1000 conta com mais de 220 lojas espalhadas pelos estados do **Rio de Janeiro, Distrito Federal e Mato Grosso**. Você pode aproveitar seus benefícios nas seguintes redes:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {['Drogarias Tamoio', 'Drogasmil', 'Farmalife', 'Drogaria Rosário'].map((rede, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-border/50">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-bold text-primary">{rede}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <h4 className="font-bold text-primary text-lg mb-3">Como garantir o meu desconto?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  O processo é simples e rápido! Basta se dirigir ao balcão de atendimento da farmácia, realizar a sua **identificação imediata informando o seu CPF** e apresentar um documento de identificação com foto no ato da compra.
                </p>
                <div className="mt-4 p-3 bg-white rounded-xl border border-primary/10 text-xs text-primary/70 italic">
                  * O desconto é aplicado de forma automática sobre o Preço Máximo ao Consumidor (PMC) dos medicamentos.
                </div>
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow-xl shadow-purple-600/20"
              onClick={() => setShowPharmacyModal(false)}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBasketModal} onOpenChange={setShowBasketModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-cyan-600 text-white">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-brand font-bold text-white">Auxílio Cesta Básica</DialogTitle>
            <DialogDescription className="text-white/70 text-lg">
              Amparo e Cuidado para a Família
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="bg-cyan-50 border-l-4 border-cyan-500 p-6 rounded-r-2xl">
              <p className="text-cyan-900 font-medium leading-relaxed">
                🛒 Sabemos que a perda de um ente querido traz, além do luto, grandes preocupações com a estabilidade e o sustento do lar. Pensando em oferecer um suporte real e imediato nesse momento de transição, nosso seguro conta com a cobertura de **Auxílio Cesta Básica** em caso de morte do segurado principal.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-cyan-600/20">1</div>
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Como funciona este benefício?</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Trata-se de uma garantia financeira no valor total de <strong>R$ 4.800,00</strong>. Esse valor tem o objetivo de auxiliar a família na aquisição de alimentação básica e ajudar na reestruturação financeira da casa após a falta do colaborador.
                  </p>
                  <p className="mt-2 text-xs text-cyan-700 italic">
                    * O pagamento da indenização pode ser realizado pela seguradora em parcela única ou em parcelas mensais.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-cyan-600/20">2</div>
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Quem tem direito a receber?</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    O valor é pago de forma integral e direta aos beneficiários formalmente indicados pelo colaborador. Caso não tenha feito uma indicação prévia, a indenização será paga aos seus herdeiros legais, conforme determina a legislação brasileira.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-cyan-600/20">3</div>
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Como solicitar?</h4>
                  <p className="text-muted-foreground mb-4">
                    A liberação deste auxílio ocorre em conjunto com o acionamento da cobertura principal de Morte. A família ou o representante legal deve entrar em contato com a <strong>HORIZON CORRETORA DE SEGUROS</strong>:
                  </p>

                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 mb-4">
                    <p className="text-xs text-green-800 font-bold uppercase tracking-wider mb-2">Atendimento via WhatsApp</p>
                    <a
                      href="https://wa.me/5521965443321"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-700 font-black hover:underline text-lg"
                    >
                      <Phone className="w-5 h-5" />
                      (21) 96544-3321
                    </a>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium">Documentação básica exigida:</p>
                  <div className="mt-2 grid gap-2">
                    {['Formulário de Aviso de Sinistro preenchido', 'Certidão de Óbito', 'Cópias do RG e CPF do segurado', 'Documentos dos beneficiários'].map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground bg-gray-50 p-2 rounded-lg">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg shadow-xl shadow-cyan-600/20"
              onClick={() => setShowBasketModal(false)}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreaMembros;
