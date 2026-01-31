import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Store, ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LoginParceiro = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
            const { data: partner, error } = await supabase
                .from('partner_accounts')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();

            if (error || !partner) {
                console.error('Partner not found:', error);
                toast.error('Email não encontrado ou parceiro inativo.');
                setLoading(false);
                return;
            }

            if (partner.status !== 'active') {
                toast.error('Conta de parceiro inativa. Entre em contato com o suporte.');
                setLoading(false);
                return;
            }

            const hashedPassword = await hashPassword(password);

            if (hashedPassword !== partner.password_hash) {
                toast.error('Senha incorreta');
                setLoading(false);
                return;
            }

            await supabase
                .from('partner_accounts')
                .update({ last_login: new Date().toISOString() })
                .eq('id', partner.id);

            localStorage.setItem('partner_session', JSON.stringify({
                id: partner.id,
                email: partner.email,
                nome_estabelecimento: partner.nome_estabelecimento,
                responsavel: partner.responsavel
            }));

            toast.success(`Bem-vindo, ${partner.responsavel}!`);
            navigate('/dashboard-parceiro');

        } catch (error: any) {
            console.error('Login error:', error);
            toast.error('Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
            <SEO
                title="Login do Parceiro"
                description="Acesse o painel do seu estabelecimento no Clube Aqui Tem e gerencie seus benefícios."
            />
            <Header />

            <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="mb-8 text-center">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold bg-white px-4 py-2 rounded-full border border-border shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Site
                        </Link>
                    </div>

                    <Card className="border border-border shadow-2xl rounded-3xl overflow-hidden bg-white">
                        <div className="bg-primary p-8 text-center text-white relative h-32 flex items-center justify-center">
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                                <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-xl rotate-3">
                                    <Store className="w-10 h-10 text-white" />
                                </div>
                            </div>
                        </div>

                        <CardContent className="pt-16 p-8 md:p-10">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-brand font-bold text-primary mb-2">Área do Parceiro</h1>
                                <p className="text-muted-foreground">Acesse seu painel administrativo</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-bold text-primary ml-1">Email Profissional</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="seu@estabelecimento.com"
                                            className="h-12 pl-12 rounded-xl border-border bg-muted/20 focus:bg-white"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="font-bold text-primary ml-1">Senha de Acesso</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Digite sua senha"
                                            required
                                            className="h-12 pl-12 pr-12 rounded-xl border-border bg-muted/20 focus:bg-white"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Link
                                        to="/parceiro/esqueci-senha"
                                        className="text-xs font-bold text-primary hover:text-accent transition-colors"
                                    >
                                        Esqueceu sua senha?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    variant="hero"
                                    className="w-full h-14 text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    disabled={loading}
                                >
                                    {loading ? 'Autenticando...' : 'Entrar no Painel'}
                                </Button>

                                <div className="text-center pt-8 border-t border-border mt-8">
                                    <p className="text-muted-foreground text-sm mb-4">
                                        Ainda não tem uma parceria?
                                    </p>
                                    <Link
                                        to="/seja-parceiro"
                                        className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all font-bold gap-2"
                                    >
                                        <ShieldCheck className="w-5 h-5" />
                                        Cadastrar Estabelecimento
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="text-center mt-12 text-muted-foreground">
                        <p className="text-sm">
                            <strong>Problemas no acesso?</strong><br />
                            Suporte técnico: <a href="mailto:clubeaquitem.comercial@gmail.com" className="text-primary font-bold hover:underline">clubeaquitem.comercial@gmail.com</a>
                        </p>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default LoginParceiro;
