import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import horizonLogo from "@/assets/horizon-logo.png";
import portoSeguroLogo from "@/assets/porto-seguro-logo.png";

interface Subscriber {
  id: string;
  name: string;
  email: string;
  cpf: string;
  first_access: boolean;
}

const AreaMembros = () => {
  const [step, setStep] = useState<'login' | 'create-password' | 'dashboard'>('login');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedSubscriber = localStorage.getItem('club_member');
    if (savedSubscriber) {
      setSubscriber(JSON.parse(savedSubscriber));
      setStep('dashboard');
    }
  }, []);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanCPF = cpf.replace(/\D/g, '');
      
      const { data, error } = await supabase.functions.invoke('member-auth', {
        body: { 
          action: 'login',
          cpf: cleanCPF,
          password 
        }
      });

      if (error) throw error;

      if (data.success) {
        if (data.firstAccess) {
          setSubscriber(data.subscriber);
          setStep('create-password');
        } else {
          setSubscriber(data.subscriber);
          localStorage.setItem('club_member', JSON.stringify(data.subscriber));
          setStep('dashboard');
          toast.success('Bem-vindo de volta!');
        }
      } else {
        toast.error(data.message || 'CPF não encontrado ou não autorizado');
      }
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
      const { data, error } = await supabase.functions.invoke('member-auth', {
        body: { 
          action: 'create-password',
          subscriberId: subscriber?.id,
          password 
        }
      });

      if (error) throw error;

      if (data.success) {
        localStorage.setItem('club_member', JSON.stringify(subscriber));
        setStep('dashboard');
        toast.success('Senha criada com sucesso! Bem-vindo ao clube!');
      } else {
        toast.error(data.message || 'Erro ao criar senha');
      }
    } catch (error: any) {
      console.error('Create password error:', error);
      toast.error('Erro ao criar senha');
    } finally {
      setLoading(false);
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
      bgColor: "bg-blue-50"
    },
    {
      icon: Heart,
      title: "Assistência Acidente Pessoal",
      description: "Proteção financeira em caso de acidentes, com indenização garantida.",
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      icon: Phone,
      title: "Telemedicina 24h",
      description: "Consultas médicas por vídeo ou telefone, disponíveis 24 horas por dia, 7 dias por semana.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Pill,
      title: "Descontos em Farmácias",
      description: "Economia garantida em medicamentos nas principais redes de farmácias do país.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Stethoscope,
      title: "Descontos em Consultas Médicas",
      description: "Consultas com especialistas a preços reduzidos em clínicas parceiras.",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    },
    {
      icon: Tag,
      title: "Cupons de Desconto Exclusivos",
      description: "Descontos de 5% a 50% em estabelecimentos comerciais locais parceiros.",
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ];

  // Login Screen
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-8 px-4">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img src={logo} alt="Clube Aqui Tem" className="h-12 w-auto" />
              </div>
              <CardTitle className="text-2xl font-brand text-primary">
                Área do Associado
              </CardTitle>
              <CardDescription>
                Acesse seus benefícios exclusivos
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={cpf}
                    onChange={handleCPFChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Primeiro acesso? Digite apenas seu CPF e deixe a senha em branco.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full shadow-accent"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Create Password Screen
  if (step === 'create-password') {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-8 px-4">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl font-brand text-primary">
                Crie sua Senha
              </CardTitle>
              <CardDescription>
                Olá, {subscriber?.name?.split(' ')[0]}! Crie uma senha para proteger sua conta.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirme a Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full shadow-accent"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Senha e Acessar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Clube Aqui Tem" className="h-10 w-auto" />
            <span className="font-brand text-lg hidden sm:block">
              <span className="text-primary font-bold">Clube</span>
              <span className="text-accent font-extrabold"> Aqui Tem</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Olá, {subscriber?.name?.split(' ')[0]}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white border-0">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-4">
                <CheckCircle className="w-12 h-12" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-brand font-bold">
                    Bem-vindo ao Clube Aqui Tem!
                  </h1>
                  <p className="text-white/90">
                    Você é um associado ativo e tem acesso a todos os benefícios.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-brand font-bold text-primary mb-6">
            Seus Benefícios Exclusivos
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${benefit.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                      <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                    </div>
                    <h3 className="font-brand font-semibold text-lg mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* App Access Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-2 border-accent/30">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-10 h-10 text-accent" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-brand font-bold text-primary mb-2">
                    Acesse seus Cupons de Desconto
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Baixe o aplicativo para resgatar cupons de desconto exclusivos de 5% a 50% 
                    em estabelecimentos comerciais locais parceiros.
                  </p>
                  <Button variant="hero" size="lg" className="shadow-accent" disabled>
                    <Smartphone className="w-5 h-5 mr-2" />
                    App em Breve
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    O aplicativo está sendo desenvolvido e estará disponível em breve!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Partners Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-muted/50">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-lg font-brand font-semibold text-center mb-6">
                Benefícios garantidos por nossos parceiros
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                <div className="text-center">
                  <img 
                    src={horizonLogo} 
                    alt="Horizon Corretora de Seguros" 
                    className="h-20 w-auto mx-auto mb-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Horizon Corretora de Seguros
                  </p>
                </div>
                <div className="text-center">
                  <img 
                    src={portoSeguroLogo} 
                    alt="Porto Seguro" 
                    className="h-12 w-auto mx-auto mb-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Porto Seguro
                  </p>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Os benefícios de Assistência Funeral, Acidente Pessoal, Telemedicina 24h e 
                Descontos em Farmácias são garantidos pela Horizon Corretores de Seguros, 
                parceira da Porto Seguro.
              </p>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={logo} alt="Clube Aqui Tem" className="h-8 w-auto" />
            <span className="font-brand">
              <span className="text-primary font-bold">Clube</span>
              <span className="text-accent font-extrabold"> Aqui Tem</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Clube Aqui Tem. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AreaMembros;
