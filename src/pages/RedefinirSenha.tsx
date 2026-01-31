import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Shield, KeyRound, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const RedefinirSenha = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [subscriberId, setSubscriberId] = useState<string | null>(null);

    useEffect(() => {
        validateToken();
    }, [token]);

    const validateToken = async () => {
        if (!token) {
            toast.error('Token inválido');
            navigate('/minha-conta');
            return;
        }

        try {
            const { data, error } = await (supabase.rpc as any)('validate_reset_token', {
                p_token: token
            });

            if (error) throw error;

            if (data && data.valid) {
                setSubscriberId(data.subscriber_id);
            } else {
                toast.error(data?.message || 'Token inválido ou expirado');
                navigate('/minha-conta');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erro ao validar token');
            navigate('/minha-conta');
        } finally {
            setValidating(false);
        }
    };

    const hashPassword = async (password: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
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

            // Atualizar senha
            const { error: updateError } = await supabase
                .from('subscribers')
                .update({
                    password_hash: hashedPassword,
                    first_access: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', subscriberId);

            if (updateError) throw updateError;

            // Marcar token como usado
            await (supabase.rpc as any)('mark_token_used', { p_token: token });

            toast.success('Senha redefinida com sucesso!');

            setTimeout(() => {
                navigate('/minha-conta');
            }, 2000);
        } catch (error: any) {
            console.error('Error:', error);
            toast.error('Erro ao redefinir senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
            <SEO
                title="Redefinir Senha"
                description="Crie uma nova senha para sua conta do Clube Aqui Tem."
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
                    {validating ? (
                        <div className="text-center p-12">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">Validando seu acesso seguro...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8 text-center">
                                <Link
                                    to="/minha-conta"
                                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold bg-white px-4 py-2 rounded-full border border-border shadow-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Cancelar e Voltar
                                </Link>
                            </div>

                            <Card className="border border-border shadow-2xl rounded-3xl overflow-hidden bg-white">
                                <div className="bg-accent p-10 text-center text-white relative">
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                                        <Lock className="w-10 h-10 text-white" />
                                    </div>
                                    <h1 className="text-2xl font-brand font-bold tracking-tight text-primary">Nova Senha</h1>
                                    <p className="text-primary/60 text-sm mt-1">Crie uma chave forte e segura</p>
                                </div>

                                <CardContent className="p-8 md:p-10">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="font-bold text-primary ml-1">Nova Senha</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Mínimo 6 caracteres"
                                                    required
                                                    minLength={6}
                                                    className="h-12 pl-10 pr-12 rounded-xl border-border bg-muted/20 focus:bg-white"
                                                />
                                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="font-bold text-primary ml-1">Confirme a Senha</Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Repita a nova senha"
                                                    required
                                                    className="h-12 pl-10 rounded-xl border-border bg-muted/20 focus:bg-white"
                                                />
                                                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="hero"
                                            className="w-full h-14 text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Salvando Nova Senha...
                                                </span>
                                            ) : (
                                                "Redefinir Senha Agora"
                                            )}
                                        </Button>

                                        <div className="bg-muted/30 rounded-2xl p-4 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-primary shrink-0" />
                                            <p>
                                                <strong>Dica de segurança:</strong> Use uma combinação de letras, números e símbolos para uma senha mais robusta.
                                            </p>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default RedefinirSenha;
