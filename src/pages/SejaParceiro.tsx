import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Store, ArrowLeft, CheckCircle, Upload, Image as ImageIcon, X, ShieldCheck, Mail, Phone, MapPin, Building2, User, FileSignature } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SejaParceiro = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome_estabelecimento: '',
        responsavel: '',
        email: '',
        telefone: '',
        cnpj: '',
        endereco: '',
        senha: '',
        confirmarSenha: ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("A imagem deve ter no máximo 2MB");
                return;
            }
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const hashPassword = async (password: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const uploadLogo = async (): Promise<string | null> => {
        if (!logoFile) return null;

        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `partners/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
            .from('partner-logos')
            .upload(filePath, logoFile);

        if (uploadError) {
            console.error('Error uploading logo:', uploadError);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('partner-logos')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (formData.senha !== formData.confirmarSenha) {
                toast.error('As senhas não coincidem');
                setLoading(false);
                return;
            }

            if (formData.senha.length < 6) {
                toast.error('A senha deve ter pelo menos 6 caracteres');
                setLoading(false);
                return;
            }

            const { data: existingPartner } = await (supabase as any)
                .from('partner_accounts')
                .select('email')
                .eq('email', formData.email.toLowerCase())
                .maybeSingle();

            if (existingPartner) {
                toast.error('Este email já está cadastrado');
                setLoading(false);
                return;
            }

            let logoUrl = null;
            if (logoFile) {
                logoUrl = await uploadLogo();
                if (!logoUrl) {
                    toast.error('Erro ao enviar o logo. Tente novamente.');
                    setLoading(false);
                    return;
                }
            }

            const hashedPassword = await hashPassword(formData.senha);

            const { error } = await (supabase as any)
                .from('partner_accounts')
                .insert({
                    email: formData.email.toLowerCase(),
                    password_hash: hashedPassword,
                    nome_estabelecimento: formData.nome_estabelecimento,
                    responsavel: formData.responsavel,
                    telefone: formData.telefone,
                    cnpj: formData.cnpj,
                    endereco: formData.endereco,
                    status: 'pending',
                    first_access: true,
                    logo_url: logoUrl
                });

            if (error) {
                console.error('Error creating partner:', error);
                toast.error('Erro ao cadastrar. Tente novamente.');
                setLoading(false);
                return;
            }

            // Enviar solicitação de assinatura automaticamente
            // Buscamos o ID do parceiro recém-criado (ou usamos o email se id não retornado)
            const { data: newAccount } = await (supabase as any)
                .from('partner_accounts')
                .select('id')
                .eq('email', formData.email.toLowerCase())
                .single();

            if (newAccount) {
                console.log('Invoking signature function for partner:', newAccount.id);
                const { data: funcData, error: funcError } = await supabase.functions.invoke('assinafy-signature', {
                    body: { type: 'partner', id: newAccount.id }
                });

                if (funcError) {
                    console.error('Error invoking signature function:', funcError);
                    toast.error('Erro de conexão ao processar contrato. Tente novamente.');
                } else if (funcData?.success === false) {
                    console.error('Signature function logic error:', funcData);
                    toast.error(`Erro no Contrato: ${funcData.error} (v${funcData.version})`);
                } else {
                    console.log('Signature function success:', funcData);
                }
            }

            setSuccess(true);
            toast.success('Cadastro realizado! Verifique seu e-mail para assinar o contrato.');

            setTimeout(() => {
                navigate('/login-parceiro');
            }, 5000);

        } catch (error: any) {
            console.error('Signup error:', error);
            toast.error('Erro ao cadastrar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.id]: e.target.value
        }));
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center py-20 px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md"
                    >
                        <Card className="border-none shadow-2xl text-center p-10 rounded-[3rem] bg-white overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-accent"></div>
                            <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <FileSignature className="w-12 h-12 text-green-600" />
                            </div>
                            <CardTitle className="text-3xl font-brand font-bold text-primary mb-4">
                                Candidatura Enviada!
                            </CardTitle>
                            <CardDescription className="text-lg text-foreground/70 mb-8 leading-relaxed">
                                Recebemos seus dados com sucesso.
                                <br /><br />
                                <strong>Importante:</strong> Enviamos agora mesmo um <strong>Contrato de Parceria Digital</strong> para o e-mail <strong>{formData.email}</strong> via Assinafy.
                                <br /><br />
                                Por favor, verifique sua caixa de entrada (e spam) para realizar a assinatura e ativar seu acesso.
                            </CardDescription>
                            <div className="space-y-4">
                                <Button
                                    onClick={() => navigate('/login-parceiro')}
                                    className="w-full h-14 text-lg font-bold bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 transition-all"
                                >
                                    Ir para Área do Parceiro
                                </Button>
                                <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-accent" /> Assinatura Digital Segura via Assinafy
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
            <SEO
                title="Seja um Parceiro"
                description="Cadastre sua empresa no Clube Aqui Tem e divulgue sua marca gratuitamente para milhares de associados."
            />
            <Header />

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
                            <Store className="w-4 h-4 text-accent" />
                            Expansão Comercial e Visibilidade
                        </div>
                        <h1 className="text-4xl md:text-5xl font-brand font-bold text-white mb-6">
                            Traga seu Negócio para o <br className="hidden md:block" />
                            <span className="text-accent underline underline-offset-8 decoration-accent/30">Clube Aqui Tem</span>
                        </h1>
                        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
                            Divulgue sua marca gratuitamente para nossos associados e aumente seu fluxo de clientes. Simples, rápido e eficiente.
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
                                <h2 className="text-2xl font-brand font-bold text-primary flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-primary" />
                                    </div>
                                    Formulário de Candidatura
                                </h2>
                                <p className="text-muted-foreground mt-2">
                                    Preencha os dados abaixo para iniciar sua jornada conosco.
                                </p>
                            </div>

                            <CardContent className="p-8 md:p-12">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <section>
                                        <Label className="text-base font-bold text-primary mb-4 block">Identidade Visual</Label>
                                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all group relative">
                                            {logoPreview ? (
                                                <div className="relative">
                                                    <img loading="lazy"
                                                        src={logoPreview}
                                                        alt="Preview"
                                                        className="w-40 h-40 object-contain rounded-2xl border-4 border-white bg-white shadow-xl"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={removeLogo}
                                                        className="absolute -top-3 -right-3 bg-destructive text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="cursor-pointer flex flex-col items-center gap-3"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-accent shadow-sm group-hover:scale-110 transition-transform">
                                                        <Upload className="w-10 h-10" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-primary">Logotipo da Empresa</p>
                                                        <p className="text-sm text-muted-foreground">Arraste ou clique para enviar (PNG ou JPG)</p>
                                                        <p className="text-xs text-muted-foreground/60 mt-1">Tamanho máximo: 2MB</p>
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                                            <Building2 className="w-5 h-5 text-accent" />
                                            <h3 className="font-bold text-primary">Dados do Estabelecimento</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <Label htmlFor="nome_estabelecimento">Nome Fantasia *</Label>
                                                <div className="relative mt-1">
                                                    <Store className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="nome_estabelecimento"
                                                        className="pl-10 h-12 rounded-xl"
                                                        value={formData.nome_estabelecimento}
                                                        onChange={handleChange}
                                                        placeholder="Ex: Padaria Pão de Mel"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
                                                <div className="relative mt-1">
                                                    <ShieldCheck className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="cnpj"
                                                        className="pl-10 h-12 rounded-xl"
                                                        value={formData.cnpj}
                                                        onChange={handleChange}
                                                        placeholder="00.000.000/0000-00"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
                                                <div className="relative mt-1">
                                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="telefone"
                                                        type="tel"
                                                        className="pl-10 h-12 rounded-xl"
                                                        value={formData.telefone}
                                                        onChange={handleChange}
                                                        placeholder="(00) 00000-0000"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <Label htmlFor="endereco">Localização Completa *</Label>
                                                <div className="relative mt-1">
                                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                    <Textarea
                                                        id="endereco"
                                                        className="pl-10 rounded-xl min-h-[100px] pt-3"
                                                        value={formData.endereco}
                                                        onChange={handleChange}
                                                        placeholder="Rua, Número, Bairro, Cidade - Estado"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                                            <User className="w-5 h-5 text-accent" />
                                            <h3 className="font-bold text-primary">Acesso ao Painel do Parceiro</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="responsavel">Nome do Responsável *</Label>
                                                <div className="relative mt-1">
                                                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="responsavel"
                                                        className="pl-10 h-12 rounded-xl"
                                                        value={formData.responsavel}
                                                        onChange={handleChange}
                                                        placeholder="Nome completo"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="email">Email de Acesso *</Label>
                                                <div className="relative mt-1">
                                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        className="pl-10 h-12 rounded-xl"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="seuemail@exemplo.com"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="senha">Senha *</Label>
                                                <Input
                                                    id="senha"
                                                    type="password"
                                                    className="h-12 rounded-xl mt-1"
                                                    value={formData.senha}
                                                    onChange={handleChange}
                                                    placeholder="Mínimo 6 caracteres"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="confirmarSenha">Repetir Senha *</Label>
                                                <Input
                                                    id="confirmarSenha"
                                                    type="password"
                                                    className="h-12 rounded-xl mt-1"
                                                    value={formData.confirmarSenha}
                                                    onChange={handleChange}
                                                    placeholder="Confirme sua senha"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <div className="pt-6">
                                        <Button
                                            type="submit"
                                            variant="hero"
                                            className="w-full h-14 text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                            disabled={loading}
                                        >
                                            {loading ? 'Processando Candidatura...' : 'Enviar Candidatura Agora'}
                                        </Button>
                                        <p className="text-center text-xs text-muted-foreground mt-4">
                                            Ao enviar, você concorda com nossos Termos de Parceria e Política de Privacidade.
                                        </p>
                                    </div>

                                    <div className="text-center pt-8 border-t border-border mt-8">
                                        <p className="text-muted-foreground mb-4">
                                            Já possui uma parceria ativa?
                                        </p>
                                        <Link
                                            to="/login-parceiro"
                                            className="inline-flex items-center justify-center h-11 px-8 rounded-xl border border-accent text-accent hover:bg-accent/5 transition-colors font-bold"
                                        >
                                            Acessar Área do Parceiro
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="mt-12 text-center text-muted-foreground max-w-2xl mx-auto">
                        <p className="text-sm">
                            <strong>Tem alguma dúvida específica?</strong><br />
                            Nossa equipe comercial está pronta para te ajudar através do email:<br />
                            <a href="mailto:clubeaquitem.comercial@gmail.com" className="text-primary font-bold hover:underline">
                                clubeaquitem.comercial@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SejaParceiro;
