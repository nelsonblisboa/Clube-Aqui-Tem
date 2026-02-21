import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Store,
    LogOut,
    Search,
    Plus,
    Tag,
    Edit,
    Trash,
    CheckCircle,
    XCircle,
    Calendar,
    Percent,
    UserCheck,
    ArrowRight,
    Zap,
    LayoutDashboard,
    Image as ImageIcon,
    Upload,
    Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface PartnerSession {
    id: string;
    email: string;
    nome_estabelecimento: string;
    responsavel: string;
}

interface Discount {
    id: string;
    titulo: string;
    descricao: string;
    percentual_desconto: number;
    regras: string;
    codigo_cupom: string;
    validade_inicio: string;
    validade_fim: string;
    limite_uso: number | null;
    usos_realizados: number;
    ativo: boolean;
    categorias: string[];
    imagem_url: string | null;
}

const DashboardParceiro = () => {
    const [partner, setPartner] = useState<PartnerSession | null>(null);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [cpfSearch, setCpfSearch] = useState('');
    const [searchResult, setSearchResult] = useState<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showNewDiscountDialog, setShowNewDiscountDialog] = useState(false);
    const navigate = useNavigate();

    // Form states para novo desconto
    const [newDiscount, setNewDiscount] = useState({
        titulo: '',
        descricao: '',
        percentual_desconto: 10,
        regras: '',
        codigo_cupom: '',
        validade_inicio: '',
        validade_fim: '',
        limite_uso: '',
        categorias: [] as string[],
        imagem_url: ''
    });

    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        // Verificar se está logado
        const partnerSession = localStorage.getItem('partner_session');
        if (!partnerSession) {
            navigate('/login-parceiro');
            return;
        }

        const partnerData = JSON.parse(partnerSession);
        setPartner(partnerData);
        loadDiscounts(partnerData.id);
    }, [navigate]);

    const loadDiscounts = async (partnerId: string) => {
        try {
            const { data, error } = await supabase
                .from('partner_discounts')
                .select('*')
                .eq('partner_id', partnerId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setDiscounts(data || []);
        } catch (error: any) {
            console.error('Error loading discounts:', error);
            toast.error('Erro ao carregar descontos');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('partner_session');
        toast.success('Você saiu da sua conta');
        navigate('/login-parceiro');
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
        setCpfSearch(formatCPF(e.target.value));
    };

    const handleSearchCPF = async () => {
        if (!cpfSearch || !partner) return;

        setSearchLoading(true);
        setSearchResult(null);

        try {
            const cleanCPF = cpfSearch.replace(/\D/g, '');

            // Chamar function do Supabase para validar CPF
            const { data, error } = await (supabase.rpc as any)('validate_subscriber_cpf', {
                p_cpf: cleanCPF,
                p_partner_id: partner.id
            });

            if (error) throw error;

            if (data && data.length > 0) {
                setSearchResult(data[0]);
                if (data[0].valido) {
                    toast.success(`Associado encontrado: ${data[0].nome}`);
                } else {
                    toast.error(data[0].mensagem);
                }
            }
        } catch (error: any) {
            console.error('Error searching CPF:', error);
            toast.error('Erro ao consultar CPF');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 2MB');
            return;
        }

        // Preview local imediato para melhor UX
        const localUrl = URL.createObjectURL(file);
        setImagePreview(localUrl);

        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `discounts/${fileName}`;

            // Bucket name changed to 'partner-assets' to be more consistent
            const { error: uploadError } = await supabase.storage
                .from('partner-assets')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('partner-assets')
                .getPublicUrl(filePath);

            if (!data?.publicUrl) throw new Error('Falha ao gerar URL pública');

            setNewDiscount(prev => ({ ...prev, imagem_url: data.publicUrl }));
            toast.success('Imagem enviada para o servidor!');
        } catch (error: any) {
            console.error('Upload error:', error);
            setImagePreview(null);
            toast.error('Erro ao subir imagem. O bucket "partner-assets" deve existir no Supabase.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCreateDiscount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!partner) return;

        try {
            const { error } = await (supabase.from('partner_discounts') as any)
                .insert({
                    partner_id: partner.id,
                    titulo: newDiscount.titulo,
                    descricao: newDiscount.descricao,
                    percentual_desconto: newDiscount.percentual_desconto,
                    regras: newDiscount.regras,
                    codigo_cupom: newDiscount.codigo_cupom || null,
                    validade_inicio: newDiscount.validade_inicio || null,
                    validade_fim: newDiscount.validade_fim || null,
                    limite_uso: newDiscount.limite_uso ? parseInt(newDiscount.limite_uso) : null,
                    categorias: newDiscount.categorias.length > 0 ? newDiscount.categorias : null,
                    imagem_url: newDiscount.imagem_url || null
                });

            if (error) throw error;

            toast.success('Desconto publicado com sucesso!');
            setShowNewDiscountDialog(false);
            setNewDiscount({
                titulo: '', descricao: '', percentual_desconto: 10, regras: '',
                codigo_cupom: '', validade_inicio: '', validade_fim: '', limite_uso: '', categorias: [], imagem_url: ''
            });
            setImagePreview(null);
            loadDiscounts(partner.id);
        } catch (error: any) {
            console.error('Error creating discount:', error);
            toast.error('Erro ao criar desconto');
        }
    };

    const toggleDiscountStatus = async (discountId: string, currentStatus: boolean) => {
        try {
            const { error } = await (supabase.from('partner_discounts') as any)
                .update({ ativo: !currentStatus })
                .eq('id', discountId);

            if (error) throw error;

            toast.success(`Desconto ${!currentStatus ? 'ativado' : 'desativado'}!`);
            if (partner) loadDiscounts(partner.id);
        } catch (error: any) {
            console.error('Error toggling discount:', error);
            toast.error('Erro ao alterar status');
        }
    };

    const deleteDiscount = async (discountId: string) => {
        if (!confirm('Excluir permanentemente este desconto?')) return;

        try {
            const { error } = await (supabase.from('partner_discounts') as any)
                .delete()
                .eq('id', discountId);

            if (error) throw error;

            toast.success('Desconto excluído');
            if (partner) loadDiscounts(partner.id);
        } catch (error: any) {
            console.error('Error deleting discount:', error);
            toast.error('Erro ao excluir');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-medium">Sincronizando painel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
            <SEO
                title={`Painel: ${partner?.nome_estabelecimento}`}
                description="Gerencie seus descontos e valide associados do Clube Aqui Tem Vantagens e Benefícios."
            />
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium mb-4 border border-white/20">
                                <LayoutDashboard className="w-4 h-4 text-accent" />
                                Painel do Parceiro Oficial
                            </div>
                            <h1 className="text-4xl md:text-5xl font-brand font-bold text-white mb-2">
                                {partner?.nome_estabelecimento}
                            </h1>
                            <p className="text-primary-foreground/80 text-lg">
                                Bem-vindo, <strong>{partner?.responsavel}</strong>. Vamos gerenciar suas ofertas hoje?
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <Button
                                variant="outline"
                                className="bg-white/5 border-white/20 text-white hover:bg-white hover:text-primary h-14 px-8 rounded-2xl transition-all"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Sair do Painel
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            <main className="flex-grow container mx-auto px-4 -mt-12 pb-24 relative z-20">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Validação de Associado Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="border border-border shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                            <div className="bg-accent/5 p-8 border-b border-border flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-brand font-bold text-primary flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Search className="w-5 h-5 text-primary" />
                                        </div>
                                        Validar Associado
                                    </h2>
                                    <p className="text-muted-foreground mt-1">Consulte o CPF para aplicar o benefício com segurança.</p>
                                </div>
                                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-border shadow-sm">
                                    <UserCheck className="w-5 h-5 text-green-600" />
                                    <span className="text-xs font-bold text-primary">VALIDE ANTES DE VENDER</span>
                                </div>
                            </div>

                            <CardContent className="p-8 md:p-10">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Input
                                            id="cpf-search"
                                            placeholder="Digite o CPF do cliente (000.000.000-00)"
                                            value={cpfSearch}
                                            onChange={handleCPFChange}
                                            maxLength={14}
                                            className="h-16 pl-6 rounded-2xl border-border bg-muted/20 focus:bg-white text-lg font-medium"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSearchCPF}
                                        disabled={searchLoading || !cpfSearch}
                                        variant="hero"
                                        className="h-16 px-10 text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        {searchLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                                Consultando...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5 mr-3" />
                                                Verificar Agora
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <AnimatePresence>
                                    {searchResult && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-8"
                                        >
                                            <div className={`p-8 rounded-[2rem] border-2 transition-all ${searchResult.valido
                                                ? "bg-green-50 border-green-200"
                                                : "bg-red-50 border-red-200"
                                                }`}>
                                                <div className="flex flex-col md:flex-row items-center gap-6">
                                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${searchResult.valido ? "bg-green-500" : "bg-red-500"
                                                        }`}>
                                                        {searchResult.valido
                                                            ? <CheckCircle className="w-10 h-10 text-white" />
                                                            : <XCircle className="w-10 h-10 text-white" />
                                                        }
                                                    </div>
                                                    <div className="flex-1 text-center md:text-left">
                                                        <h3 className={`text-2xl font-brand font-bold mb-1 ${searchResult.valido ? "text-green-800" : "text-red-800"
                                                            }`}>
                                                            {searchResult.valido ? "Associado Confirmado!" : "Acesso Negado"}
                                                        </h3>
                                                        {searchResult.valido ? (
                                                            <div className="space-y-1">
                                                                <p className="text-green-700/80 font-medium">Nome: <span className="text-green-900 font-bold uppercase">{searchResult.nome}</span></p>
                                                                <p className="text-green-700/80 text-sm italic">Este associado está em dia com o Clube e apto a receber descontos.</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-red-700/80 font-medium">{searchResult.mensagem}</p>
                                                        )}
                                                    </div>
                                                    {searchResult.valido && (
                                                        <div className="shrink-0 bg-white/50 px-6 py-3 rounded-2xl border border-green-200">
                                                            <span className="text-[10px] font-black text-green-800 uppercase tracking-widest block mb-1">Status Global</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                                <span className="font-bold text-green-700">ATIVO</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Gerenciar Descontos Section */}
                    <section>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <Tag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-brand font-bold text-primary">Suas Ofertas Ativas</h2>
                                    <p className="text-muted-foreground">O que os associados veem no aplicativo</p>
                                </div>
                            </div>

                            <Dialog open={showNewDiscountDialog} onOpenChange={setShowNewDiscountDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="hero" className="h-14 px-8 rounded-2xl shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all">
                                        <Plus className="w-5 h-5 mr-3" />
                                        Criar Nova Oferta
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0">
                                    <div className="bg-primary p-8 text-white">
                                        <DialogTitle className="text-2xl font-brand font-bold">Nova Campanha</DialogTitle>
                                        <DialogDescription className="text-white/60">Lance um benefício exclusivo para atrair novos clientes.</DialogDescription>
                                    </div>
                                    <form onSubmit={handleCreateDiscount} className="p-8 space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="titulo" className="font-bold text-primary">Título Chamativo *</Label>
                                                <Input
                                                    id="titulo"
                                                    value={newDiscount.titulo}
                                                    onChange={(e) => setNewDiscount({ ...newDiscount, titulo: e.target.value })}
                                                    placeholder="Ex: 20% OFF em Toda a Loja"
                                                    className="h-12 rounded-xl"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <Label className="font-bold text-primary">Imagem da Oferta (Premium) *</Label>
                                                <div
                                                    className="border-2 border-dashed border-border rounded-2xl p-4 text-center hover:bg-muted/30 transition-all cursor-pointer relative min-h-[160px] flex flex-col items-center justify-center gap-2 overflow-hidden"
                                                    onClick={() => document.getElementById('image-upload')?.click()}
                                                >
                                                    {imagePreview || newDiscount.imagem_url ? (
                                                        <div className="absolute inset-0 group">
                                                            <img loading="lazy" src={imagePreview || newDiscount.imagem_url || ''} alt="Preview" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <p className="text-white font-bold text-sm">Trocar Imagem</p>
                                                            </div>
                                                            {uploadingImage && (
                                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                                                                {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin text-accent" /> : <ImageIcon className="w-6 h-6 text-accent" />}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-bold text-primary">
                                                                    {uploadingImage ? 'Subindo imagem...' : 'Clique para subir uma foto'}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">JPG ou PNG até 2MB</p>
                                                            </div>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        id="image-upload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        disabled={uploadingImage}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="descricao" className="font-bold text-primary">O que é a oferta? *</Label>
                                                <Textarea
                                                    id="descricao"
                                                    value={newDiscount.descricao}
                                                    onChange={(e) => setNewDiscount({ ...newDiscount, descricao: e.target.value })}
                                                    placeholder="Descreva detalhes do benefício..."
                                                    className="rounded-xl min-h-[100px]"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="percentual" className="font-bold text-primary">% Desconto</Label>
                                                    <div className="relative">
                                                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            id="percentual"
                                                            type="number"
                                                            min="5"
                                                            max="50"
                                                            value={newDiscount.percentual_desconto}
                                                            onChange={(e) => setNewDiscount({ ...newDiscount, percentual_desconto: parseInt(e.target.value) })}
                                                            className="h-12 pl-12 rounded-xl"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="codigo" className="font-bold text-primary">Cupom (Opcional)</Label>
                                                    <Input
                                                        id="codigo"
                                                        value={newDiscount.codigo_cupom}
                                                        onChange={(e) => setNewDiscount({ ...newDiscount, codigo_cupom: e.target.value.toUpperCase() })}
                                                        placeholder="Ex: MAIS20"
                                                        className="h-12 rounded-xl font-bold tracking-widest"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label htmlFor="regras" className="font-bold text-primary">Regras e Restrições</Label>
                                                </div>
                                                <Textarea
                                                    id="regras"
                                                    value={newDiscount.regras}
                                                    onChange={(e) => setNewDiscount({ ...newDiscount, regras: e.target.value })}
                                                    placeholder="Ex: • Apresentar CPF no local..."
                                                    className="rounded-xl min-h-[120px] text-sm"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="inicio" className="font-bold text-primary text-xs uppercase">Data Início</Label>
                                                    <Input id="inicio" type="date" value={newDiscount.validade_inicio} onChange={(e) => setNewDiscount({ ...newDiscount, validade_inicio: e.target.value })} className="h-11 rounded-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="fim" className="font-bold text-primary text-xs uppercase">Data Fim</Label>
                                                    <Input id="fim" type="date" value={newDiscount.validade_fim} onChange={(e) => setNewDiscount({ ...newDiscount, validade_fim: e.target.value })} className="h-11 rounded-xl" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4 border-t">
                                            <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setShowNewDiscountDialog(false)}>Cancelar</Button>
                                            <Button type="submit" variant="hero" className="flex-[2] h-12 rounded-xl shadow-lg">Publicar Oferta Agora</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {discounts.length === 0 ? (
                            <Card className="border-2 border-dashed border-muted rounded-[2.5rem] bg-white">
                                <CardContent className="p-20 text-center">
                                    <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Zap className="w-12 h-12 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-2xl font-brand font-bold text-primary mb-2">Sua Vitrine está Vazia</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                        Comece a oferecer descontos agora para ganhar visibilidade entre nossos milhares de associados.
                                    </p>
                                    <Button variant="hero" size="lg" className="rounded-2xl" onClick={() => setShowNewDiscountDialog(true)}>
                                        Criar meu Primeiro Desconto
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {discounts.map((discount, index) => (
                                    <motion.div
                                        key={discount.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 + index * 0.05 }}
                                    >
                                        <Card className={`h-full border border-border shadow-sm hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] overflow-hidden bg-white flex flex-col ${!discount.ativo ? 'grayscale opacity-70' : ''}`}>
                                            <div className="bg-accent/5 p-8 pb-4 relative">
                                                <div className="absolute top-6 right-6 flex flex-col items-center">
                                                    <div className="bg-accent text-white px-4 py-2 rounded-2xl shadow-lg shadow-accent/20">
                                                        <span className="font-brand font-black text-2xl">-{discount.percentual_desconto}%</span>
                                                    </div>
                                                </div>
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-6 border border-accent/10 overflow-hidden">
                                                    {discount.imagem_url ? (
                                                        <img loading="lazy" src={discount.imagem_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        discount.ativo ? <Zap className="w-7 h-7 text-accent" /> : <XCircle className="w-7 h-7 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold text-primary line-clamp-1">{discount.titulo}</h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className={`w-2 h-2 rounded-full ${discount.ativo ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${discount.ativo ? "text-green-600" : "text-gray-500"}`}>
                                                        {discount.ativo ? "Campanha Ativa" : "Pausada"}
                                                    </span>
                                                </div>
                                            </div>

                                            <CardContent className="p-8 pt-4 space-y-6 flex-grow flex flex-col">
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                    {discount.descricao}
                                                </p>

                                                <div className="space-y-4 flex-grow">
                                                    {discount.codigo_cupom && (
                                                        <div className="bg-primary/5 p-4 rounded-2xl border-2 border-dashed border-primary/20 text-center">
                                                            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">CÓDIGO ATIVO</p>
                                                            <code className="text-lg font-brand font-black text-primary tracking-[3px]">{discount.codigo_cupom}</code>
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        {discount.validade_fim && (
                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                <Calendar className="w-4 h-4 text-primary/40" />
                                                                <span>Expira em: <strong className="text-primary/70">{new Date(discount.validade_fim).toLocaleDateString('pt-BR')}</strong></span>
                                                            </div>
                                                        )}
                                                        {discount.limite_uso && (
                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                <Percent className="w-4 h-4 text-primary/40" />
                                                                <span>Resgates: <strong className="text-primary/70">{discount.usos_realizados} de {discount.limite_uso}</strong></span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-6 border-t border-border mt-auto">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 h-12 rounded-xl text-xs font-bold"
                                                        onClick={() => toggleDiscountStatus(discount.id, discount.ativo)}
                                                    >
                                                        {discount.ativo ? 'Pausar' : 'Ativar'}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-12 h-12 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 p-0"
                                                        onClick={() => deleteDiscount(discount.id)}
                                                    >
                                                        <Trash className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DashboardParceiro;
