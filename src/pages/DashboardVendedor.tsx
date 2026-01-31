import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    LayoutDashboard,
    LogOut,
    Users,
    TrendingUp,
    DollarSign,
    Target,
    Search,
    UserCheck,
    Calendar,
    Copy,
    ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SellerSession {
    id: string;
    email: string;
    name: string;
    slug: string;
    phone: string;
}

const DashboardVendedor = () => {
    const [seller, setSeller] = useState<SellerSession | null>(null);
    const [leads, setLeads] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // Commission settings (simulated for now, could be in DB)
    const COMMISSION_RATE = 0.15; // 15%
    const TICKET_VALUE = 19.90;

    useEffect(() => {
        const session = localStorage.getItem('seller_session');
        if (!session) {
            navigate('/login-vendedor');
            return;
        }
        const sellerData = JSON.parse(session);
        setSeller(sellerData);
        fetchData(sellerData.id);
    }, [navigate]);

    const fetchData = async (sellerId: string) => {
        try {
            setLoading(true);

            // Fetch Leads
            const { data: leadsData, error: leadsError } = await supabase
                .from('leads' as any)
                .select('*')
                .eq('seller_id', sellerId)
                .order('created_at', { ascending: false });

            if (leadsError) throw leadsError;

            // Fetch Sales (Subscribers)
            const { data: salesData, error: salesError } = await supabase
                .from('subscribers' as any)
                .select('*')
                .eq('seller_id', sellerId)
                .order('created_at', { ascending: false });

            if (salesError) throw salesError;

            setLeads(leadsData || []);
            setSales(salesData || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Erro ao carregar dados do dashboard.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('seller_session');
        navigate('/login-vendedor');
    };

    const copyLink = () => {
        if (!seller) return;
        const link = `${window.location.origin}/?ref=${seller.slug}`;
        navigator.clipboard.writeText(link);
        toast.success("Link de vendas copiado!");
    };

    const filteredLeads = leads.filter(l =>
        l.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.telefone.includes(searchTerm)
    );

    const filteredSales = sales.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cpf.includes(searchTerm)
    );

    const totalCommission = sales.filter(s => s.status === 'approved').length * (TICKET_VALUE * COMMISSION_RATE);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Ativo</Badge>;
            case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Pendente</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Cancelado</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium">Carregando suas vendas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
            <SEO title={`Dashboard - ${seller?.name}`} description="Painel de vendas do parceiro Clube Aqui Tem Vantagens e Benefícios" />
            <Header />

            {/* Hero / Header Section */}
            <section className="pt-32 pb-20 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium mb-4 border border-white/20">
                                <LayoutDashboard className="w-4 h-4 text-accent" />
                                Área do Vendedor
                            </div>
                            <h1 className="text-3xl md:text-5xl font-brand font-bold text-white mb-2">
                                Olá, {seller?.name} 👋
                            </h1>
                            <p className="text-primary-foreground/80 md:text-lg">
                                Acompanhe seu desempenho e comissões em tempo real.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 flex flex-col gap-4 min-w-[300px]"
                        >
                            <div className="space-y-1">
                                <span className="text-xs uppercase font-bold text-white/60 tracking-widest">Seu Link de Vendas</span>
                                <div className="flex items-center gap-2 bg-black/20 p-2 pl-4 rounded-xl border border-white/10">
                                    <code className="text-accent text-sm font-mono truncate flex-1">
                                        clubeaquitem.com/?ref={seller?.slug}
                                    </code>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:text-accent hover:bg-white/10" onClick={copyLink}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:text-accent hover:bg-white/10" onClick={() => window.open(`/?ref=${seller?.slug}`, '_blank')}>
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <main className="flex-grow container mx-auto px-4 -mt-10 pb-20 relative z-20">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Vendas Aprovadas", value: sales.filter(s => s.status === 'approved').length, icon: UserCheck, color: "text-green-600", bg: "bg-green-100" },
                            { label: "Leads Capturados", value: leads.length, icon: Target, color: "text-blue-600", bg: "bg-blue-100" },
                            { label: "Conversão", value: `${leads.length > 0 ? ((sales.length / leads.length) * 100).toFixed(1) : 0}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
                            { label: "Comissão Mensal Estimada a Receber", value: `R$ ${totalCommission.toFixed(2)}`, icon: DollarSign, color: "text-accent", bg: "bg-orange-100" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="border-none shadow-xl rounded-[2rem] h-full hover:scale-[1.02] transition-transform">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}>
                                            <stat.icon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase font-black text-muted-foreground tracking-wider">{stat.label}</p>
                                            <h3 className="text-2xl font-brand font-black text-primary">{stat.value}</h3>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Main Content Tabs */}
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-border overflow-hidden">
                        <Tabs defaultValue="sales" className="w-full">
                            <div className="p-8 pb-0 border-b border-border flex flex-col lg:flex-row items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl font-brand font-bold text-primary">Relatórios Detalhados</h2>
                                    <p className="text-muted-foreground">Gerencie seus contatos e fechamentos</p>
                                </div>
                                <div className="flex items-center gap-4 w-full lg:w-auto">
                                    <TabsList className="bg-muted/50 p-1 rounded-xl h-auto">
                                        <TabsTrigger value="sales" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white gap-2">
                                            <UserCheck className="w-4 h-4" /> Vendas Confirmadas
                                        </TabsTrigger>
                                        <TabsTrigger value="leads" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white gap-2">
                                            <Target className="w-4 h-4" /> Leads (Interessados)
                                        </TabsTrigger>
                                    </TabsList>
                                    <div className="relative hidden md:block">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar nome, email, cpf..."
                                            className="pl-9 rounded-xl w-[250px] bg-muted/20 focus:bg-white transition-all"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-0">
                                <TabsContent value="sales" className="m-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted/20">
                                                <TableRow className="border-none hover:bg-transparent">
                                                    <TableHead className="pl-8 py-5 font-bold uppercase text-xs">Cliente</TableHead>
                                                    <TableHead className="py-5 font-bold uppercase text-xs">CPF (Parcial)</TableHead>
                                                    <TableHead className="py-5 font-bold uppercase text-xs">Origem</TableHead>
                                                    <TableHead className="py-5 font-bold uppercase text-xs">Data Venda</TableHead>
                                                    <TableHead className="pr-8 py-5 font-bold uppercase text-xs text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredSales.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                                            Nenhuma venda encontrada com os filtros atuais.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredSales.map((sale) => (
                                                        <TableRow key={sale.id} className="hover:bg-muted/5 border-border/50">
                                                            <TableCell className="pl-8 font-medium">
                                                                <div className="flex flex-col">
                                                                    <span className="text-primary font-bold">{sale.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{sale.email}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">
                                                                {sale.cpf.slice(0, 3)}.***.***-{sale.cpf.slice(-2)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="font-mono text-[10px]">
                                                                    {sale.source || "Link Direto"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">
                                                                {new Date(sale.created_at).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="pr-8 text-right">
                                                                {getStatusBadge(sale.status)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="leads" className="m-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted/20">
                                                <TableRow className="border-none hover:bg-transparent">
                                                    <TableHead className="pl-8 py-5 font-bold uppercase text-xs">Lead</TableHead>
                                                    <TableHead className="py-5 font-bold uppercase text-xs">WhatsApp</TableHead>
                                                    <TableHead className="py-5 font-bold uppercase text-xs">Origem</TableHead>
                                                    <TableHead className="py-5 font-bold uppercase text-xs">Data</TableHead>
                                                    <TableHead className="pr-8 py-5 font-bold uppercase text-xs text-right">Ação</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredLeads.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                                            Nenhum lead encontrado ainda.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredLeads.map((lead) => (
                                                        <TableRow key={lead.id} className="hover:bg-muted/5 border-border/50">
                                                            <TableCell className="pl-8 font-medium">
                                                                <div className="flex flex-col">
                                                                    <span className="text-primary font-bold">{lead.nome_completo}</span>
                                                                    <span className="text-xs text-muted-foreground">{lead.email}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">
                                                                {lead.telefone}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="text-[10px]">
                                                                    {lead.source || "Captura"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">
                                                                {new Date(lead.created_at).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="pr-8 text-right">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 text-xs gap-2 border-green-200 text-green-700 hover:bg-green-50"
                                                                    onClick={() => window.open(`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`, '_blank')}
                                                                >
                                                                    Chamar no Zap
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    <div className="text-center pb-8">
                        <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 gap-2" onClick={handleLogout}>
                            <LogOut className="w-4 h-4" /> Sair do Sistema
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DashboardVendedor;
