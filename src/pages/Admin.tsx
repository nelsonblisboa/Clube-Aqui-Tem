import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LogOut, Users, Store, CreditCard, CheckCircle, Clock, XCircle, 
  Search, Download, MessageCircle, Smartphone, ShoppingBag, ExternalLink,
  Filter, Target, Copy, FileSpreadsheet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface Partner {
  id: string;
  estabelecimento: string;
  responsavel: string;
  telefone: string;
  email: string;
  endereco: string;
  created_at: string;
}

interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  status: string;
  discount_applied: boolean;
  paid_at: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  source: string;
  converted: boolean;
  notes: string | null;
  created_at: string;
}

// Links externos configuráveis
const EXTERNAL_LINKS = [
  {
    id: "whatsapp",
    name: "Grupo WhatsApp",
    url: "https://chat.whatsapp.com/LINK_DO_SEU_GRUPO", // Substitua pelo link real
    icon: MessageCircle,
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    id: "app",
    name: "App Cupons",
    url: "https://play.google.com/store/apps/details?id=SEU_APP", // Substitua pelo link real
    icon: Smartphone,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "infoprodutos",
    name: "Infoprodutos",
    url: "https://seu-link-de-infoprodutos.com", // Substitua pelo link real
    icon: ShoppingBag,
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    id: "landing-page",
    name: "LP Meta Ads",
    url: "/lp",
    icon: Target,
    color: "bg-orange-500 hover:bg-orange-600",
  },
];

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [partnerSearchTerm, setPartnerSearchTerm] = useState("");
  const [leadSearchTerm, setLeadSearchTerm] = useState("");

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    // Check if user has admin role - UI-only protection, RLS enforces data access
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roles) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar o painel administrativo.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchData = async () => {
    try {
      const [partnersResult, subscribersResult, leadsResult] = await Promise.all([
        supabase.from('partners').select('*').order('created_at', { ascending: false }),
        supabase.from('subscribers').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false })
      ]);

      if (partnersResult.error) {
        throw new Error(partnersResult.error.message);
      }
      if (subscribersResult.error) {
        throw new Error(subscribersResult.error.message);
      }

      if (partnersResult.data) setPartners(partnersResult.data);
      if (subscribersResult.data) setSubscribers(subscribersResult.data);
      if (leadsResult.data) setLeads(leadsResult.data);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Você não tem permissão para visualizar estes dados ou ocorreu um erro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCPF = (cpf: string) => {
    if (cpf.length === 11) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
    }
    return cpf;
  };

  // Função para mascarar dados sensíveis na exportação
  const maskCPF = (cpf: string) => {
    if (cpf.length >= 8) {
      return `***${cpf.slice(3, 6)}***-${cpf.slice(-2)}`;
    }
    return "***";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const getStatusCounts = () => {
    const approved = subscribers.filter(s => s.status === 'approved').length;
    const pending = subscribers.filter(s => s.status === 'pending').length;
    const rejected = subscribers.filter(s => s.status === 'rejected').length;
    return { approved, pending, rejected };
  };

  // Filtros para associados
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(subscriber => {
      const matchesSearch = 
        subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscriber.cpf.includes(searchTerm) ||
        subscriber.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || subscriber.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, searchTerm, statusFilter]);

  // Filtros para parceiros
  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      return (
        partner.estabelecimento.toLowerCase().includes(partnerSearchTerm.toLowerCase()) ||
        partner.responsavel.toLowerCase().includes(partnerSearchTerm.toLowerCase()) ||
        partner.email.toLowerCase().includes(partnerSearchTerm.toLowerCase()) ||
        partner.telefone.includes(partnerSearchTerm)
      );
    });
  }, [partners, partnerSearchTerm]);

  // Filtros para leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      return (
        lead.nome_completo.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
        lead.telefone.includes(leadSearchTerm)
      );
    });
  }, [leads, leadSearchTerm]);

  const copyLandingPageUrl = () => {
    const url = `${window.location.origin}/lp`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!", description: url });
  };

  // Exportar para Excel
  const exportToExcel = () => {
    // Preparar dados de associados (com dados sensíveis mascarados)
    const subscribersData = filteredSubscribers.map(s => ({
      Nome: s.name,
      Email: s.email,
      Telefone: s.phone,
      CPF: maskCPF(s.cpf),
      Endereço: s.address,
      Status: getStatusLabel(s.status),
      Desconto: s.discount_applied ? "5% aplicado" : "Sem desconto",
      "Data Pagamento": s.paid_at ? formatDate(s.paid_at) : "-",
      "Data Cadastro": formatDate(s.created_at),
    }));

    // Preparar dados de parceiros
    const partnersData = filteredPartners.map(p => ({
      Estabelecimento: p.estabelecimento,
      Responsável: p.responsavel,
      Telefone: p.telefone,
      Email: p.email,
      Endereço: p.endereco,
      "Data Cadastro": formatDate(p.created_at),
    }));

    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Adicionar planilha de associados
    const wsSubscribers = XLSX.utils.json_to_sheet(subscribersData);
    XLSX.utils.book_append_sheet(wb, wsSubscribers, "Associados");
    
    // Adicionar planilha de parceiros
    const wsPartners = XLSX.utils.json_to_sheet(partnersData);
    XLSX.utils.book_append_sheet(wb, wsPartners, "Parceiros");

    // Gerar arquivo e download
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `ClubeAquiTem_Dados_${date}.xlsx`);

    toast({
      title: "Exportação concluída",
      description: "Os dados foram exportados para Excel com sucesso.",
    });
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-primary">Painel Administrativo</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Links Externos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Links Rápidos
            </CardTitle>
            <CardDescription>
              Acesse rapidamente as plataformas dos associados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {EXTERNAL_LINKS.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${link.color}`}
                  >
                    <IconComponent className="h-5 w-5" />
                    {link.name}
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Associados</p>
                  <p className="text-2xl font-bold">{subscribers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagos</p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parceiros</p>
                  <p className="text-2xl font-bold">{partners.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leads</p>
                  <p className="text-2xl font-bold text-orange-600">{leads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subscribers" className="w-full">
          <TabsList className="grid w-full md:w-[500px] grid-cols-3">
            <TabsTrigger value="subscribers">
              <CreditCard className="mr-2 h-4 w-4" />
              Associados
            </TabsTrigger>
            <TabsTrigger value="leads">
              <Target className="mr-2 h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="partners">
              <Store className="mr-2 h-4 w-4" />
              Parceiros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscribers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Associados e Status de Pagamento</CardTitle>
                <CardDescription>
                  Mostrando {filteredSubscribers.length} de {subscribers.length} associado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filtros e Busca */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email, CPF ou telefone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="approved">Aprovados</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="rejected">Rejeitados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead>Data Pagamento</TableHead>
                        <TableHead>Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscribers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground">
                            {searchTerm || statusFilter !== "all" 
                              ? "Nenhum associado encontrado com os filtros aplicados"
                              : "Nenhum associado cadastrado ainda"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSubscribers.map((subscriber) => (
                          <TableRow key={subscriber.id}>
                            <TableCell className="font-medium">{subscriber.name}</TableCell>
                            <TableCell>{formatCPF(subscriber.cpf)}</TableCell>
                            <TableCell>{subscriber.email}</TableCell>
                            <TableCell>{subscriber.phone}</TableCell>
                            <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                            <TableCell>
                              {subscriber.discount_applied ? (
                                <Badge variant="secondary" className="bg-accent/10 text-accent">
                                  5% aplicado
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {subscriber.paid_at ? formatDate(subscriber.paid_at) : '-'}
                            </TableCell>
                            <TableCell>{formatDate(subscriber.created_at)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Leads do Meta Ads</CardTitle>
                  <CardDescription>
                    {filteredLeads.length} lead(s) capturados - <Button variant="link" className="p-0 h-auto" onClick={copyLandingPageUrl}><Copy className="w-3 h-3 mr-1" />Copiar link LP</Button>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email ou telefone..."
                      value={leadSearchTerm}
                      onChange={(e) => setLeadSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Fonte</TableHead>
                        <TableHead>Data Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Nenhum lead capturado ainda
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.nome_completo}</TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>{lead.telefone}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{lead.source || "meta_ads"}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(lead.created_at)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Parceiros Cadastrados</CardTitle>
                <CardDescription>
                  Mostrando {filteredPartners.length} de {partners.length} parceiro(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Busca de Parceiros */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por estabelecimento, responsável, email ou telefone..."
                      value={partnerSearchTerm}
                      onChange={(e) => setPartnerSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estabelecimento</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPartners.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            {partnerSearchTerm 
                              ? "Nenhum parceiro encontrado com a busca aplicada"
                              : "Nenhum parceiro cadastrado ainda"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPartners.map((partner) => (
                          <TableRow key={partner.id}>
                            <TableCell className="font-medium">{partner.estabelecimento}</TableCell>
                            <TableCell>{partner.responsavel}</TableCell>
                            <TableCell>{partner.telefone}</TableCell>
                            <TableCell>{partner.email}</TableCell>
                            <TableCell>{partner.endereco}</TableCell>
                            <TableCell>{formatDate(partner.created_at)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
