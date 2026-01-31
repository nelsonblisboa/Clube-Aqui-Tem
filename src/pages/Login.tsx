import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Shield, ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", senha: "" });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: roles } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roles) {
        navigate("/admin");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.senha,
      });

      if (error) throw error;

      const { data: roles } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roles) {
        await supabase.auth.signOut();
        throw new Error("Acesso negado. Apenas administradores podem acessar.");
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o painel operacional...",
      });

      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Falha na Autenticação",
        description: error.message || "Credenciais não reconhecidas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <SEO
        title="Área Administrativa"
        description="Acesso restrito para administradores do Clube Aqui Tem."
      />
      <Header />

      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold bg-white px-5 py-2.5 rounded-2xl border border-border shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Retornar ao Início
            </Link>
          </div>

          <Card className="border border-border shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
            <div className="bg-primary/95 p-10 text-center text-white relative flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
                <Shield className="w-10 h-10 text-accent" />
              </div>
              <h1 className="text-2xl font-brand font-bold tracking-tight">Administrador</h1>
              <p className="text-white/60 text-sm mt-1">Painel Governança & Controle</p>
            </div>

            <CardContent className="p-10">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="font-bold text-primary ml-1 uppercase text-[10px] tracking-widest">E-mail Corporativo</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@clubeaquitem.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="h-14 pl-12 rounded-2xl border-border bg-muted/30 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-senha" className="font-bold text-primary ml-1 uppercase text-[10px] tracking-widest">Chave de Acesso</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
                    <Input
                      id="login-senha"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.senha}
                      onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })}
                      className="h-14 pl-12 rounded-2xl border-border bg-muted/30 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full h-15 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                  disabled={loading}
                >
                  <LogIn className="mr-3 h-5 w-5" />
                  {loading ? "Processando..." : "Entrar no Painel"}
                </Button>

                <div className="pt-8 text-center flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/5 rounded-full border border-green-500/10">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Conexão Monitorada e Segura</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground max-w-[240px] leading-relaxed">
                    Tentativas de acesso não autorizado são registradas. <strong>IP: {window.location.hostname}</strong>
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
};

export default Login;
