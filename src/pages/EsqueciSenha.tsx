import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Mail, Shield, User, KeyRound, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const EsqueciSenha = () => {
    const navigate = useNavigate();
    const [cpf, setCpf] = useState("");
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const cleanCPF = cpf.replace(/\D/g, '');

            // Use any to bypass strict RPC types that might be missing in generator
            const { data, error } = await (supabase.rpc as any)('create_password_reset_token', {
                p_cpf: cleanCPF
            });

            if (error) throw error;

            if (data && data.success) {
                // Em produção, enviar email com link
                // Por enquanto, mostrar token (APENAS PARA DESENVOLVIMENTO)
                console.log('Reset token:', data.token);

                toast.success('Instruções enviadas!', {
                    description: 'Verifique seu email para redefinir sua senha.'
                });

                // Redirecionar para página de redefinição com token (simulação)
                setTimeout(() => {
                    navigate(`/redefinir-senha?token=${data.token}`);
                }, 2000);
            } else {
                toast.error(data?.message || 'CPF não encontrado');
            }
        } catch (error: any) {
            console.error('Error:', error);
            toast.error('Erro ao processar solicitação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
            <SEO
                title="Recuperar Senha"
                description="Recupere o acesso à sua conta do Clube Aqui Tem."
            />
            <Header />

            <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="mb-8 text-center">
                        <Link
                            to="/minha-conta"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold bg-white px-4 py-2 rounded-full border border-border shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Login
                        </Link>
                    </div>

                    <Card className="border border-border shadow-2xl rounded-3xl overflow-hidden bg-white">
                        <div className="bg-primary p-10 text-center text-white relative">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                                <KeyRound className="w-10 h-10 text-accent" />
                            </div>
                            <h1 className="text-2xl font-brand font-bold tracking-tight">Recuperar Acesso</h1>
                            <p className="text-white/60 text-sm mt-1">Recupere sua senha de associado</p>
                        </div>

                        <CardContent className="p-8 md:p-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="cpf" className="font-bold text-primary ml-1">CPF cadastrado</Label>
                                    <div className="relative">
                                        <Input
                                            id="cpf"
                                            type="text"
                                            value={cpf}
                                            onChange={handleCPFChange}
                                            placeholder="000.000.000-00"
                                            className="h-12 pl-10 rounded-xl border-border bg-muted/20 focus:bg-white"
                                            maxLength={14}
                                            required
                                        />
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="hero"
                                    className="w-full h-14 text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Mail className="w-5 h-5 mr-1" />
                                            Enviar Instruções
                                        </span>
                                    )}
                                </Button>

                                <div className="bg-muted/30 rounded-2xl p-4 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-primary shrink-0" />
                                    <p>
                                        <strong>Segurança em primeiro lugar.</strong> Nunca compartilhamos seus dados. Seus dados estão protegidos por criptografia de ponta a ponta.
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

export default EsqueciSenha;
