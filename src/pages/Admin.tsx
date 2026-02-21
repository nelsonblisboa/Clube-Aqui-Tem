import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LogOut, Users, Store, CreditCard, CheckCircle, Clock, XCircle,
  Search, Download, MessageCircle, Smartphone, ShoppingBag, ExternalLink,
  Filter, Target, Copy, FileSpreadsheet, Image as ImageIcon, LayoutDashboard,
  Zap, ArrowRight, UserPlus, TrendingUp, Phone, MapPin, Mail, Building2, ShieldCheck, Calendar,
  Eye, FileText, CreditCard as BillingIcon, MessageSquare, Edit, Trash, Loader2, Tag, Plus, UserCog, RefreshCw, FileSignature, Send, Info, Check, Code
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import * as XLSX from "xlsx";
import CompaniesManager from "@/components/admin/CompaniesManager";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AssinafyManager from "@/components/admin/AssinafyManager";

interface Partner {
  id: string;
  nome_estabelecimento: string;
  responsavel: string;
  telefone: string;
  email: string;
  endereco: string;
  cnpj: string;
  status: string;
  logo_url: string | null;
  created_at: string;
  signature_status?: string;
  signature_url?: string;
  assinafy_document_id?: string;
  assinafy_assignment_id?: string;
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
  company_id?: string;
  source?: string;
  seller_id?: string;
  signature_status?: string;
  signature_url?: string;
  assinafy_document_id?: string;
  assinafy_assignment_id?: string;
}

interface PaymentLog {
  id: string;
  event_id: string;
  action: string;
  payment_id: string;
  external_reference: string;
  status: string;
  payload: any;
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
  seller_id?: string;
}

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  slug: string;
  status: string;
  created_at: string;
  signature_status?: string;
  signature_url?: string;
  assinafy_document_id?: string;
  assinafy_assignment_id?: string;
}

interface AssinafySettings {
  id: string;
  account_id: string;
  api_key: string;
  template_id_subscriber: string;
  template_id_partner: string;
  template_id_seller: string;
  webhook_secret: string;
}

// Links externos configuráveis
const EXTERNAL_LINKS = [
  {
    id: "whatsapp-group",
    name: "Grupo WhatsApp",
    url: "https://chat.whatsapp.com/...", // Link do grupo
    icon: MessageCircle,
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    id: "update-coupons", // ID alterado para identificar a ação
    name: "Atualizar Cupons",
    url: "#", // URL placeholder, será interceptado no onClick
    icon: RefreshCw, // Icone de atualização (precisa importar)
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "infoprodutos",
    name: "Infoprodutos",
    url: "https://infoprodutos.com...", // Liunk
    icon: ShoppingBag,
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    id: "meta-ads",
    name: "LP Meta Ads",
    url: "https://ads.facebook.com/...", // Link
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
  const [allDiscounts, setAllDiscounts] = useState<any[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assinafySettings, setAssinafySettings] = useState<AssinafySettings | null>(null);
  const [isUpdatingAssinafy, setIsUpdatingAssinafy] = useState(false);
  const [activeTab, setActiveTab] = useState("subscribers");
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [isSubscriberDialogOpen, setIsSubscriberDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);

  // Creation states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"subscriber" | "lead" | "partner" | "discount" | "seller" | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isJSONDialogOpen, setIsJSONDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [partnerDiscounts, setPartnerDiscounts] = useState<any[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [totals, setTotals] = useState({ subscribers: 0, partners: 0, leads: 0, sellers: 0 });
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false);
  const [sellerMetrics, setSellerMetrics] = useState<Record<string, { whatsapp: number; checkout: number }>>({});
  const [couponStats, setCouponStats] = useState({ total: 0, lastUpdate: null as string | null });
  const [isUpdatingCoupons, setIsUpdatingCoupons] = useState(false);
  const [scraperProgress, setScraperProgress] = useState(0);
  const [currentPortal, setCurrentPortal] = useState("");

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleaned = phone.replace(/\D/g, '');
    const formatted = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
    window.open(`https://wa.me/${formatted}`, '_blank');
  };

  // Confirmation dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => { },
  });

  const askConfirmation = (title: string, description: string, onConfirm: () => void) => {
    setConfirmConfig({
      isOpen: true,
      title,
      description,
      onConfirm: async () => {
        await onConfirm();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

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
      setLoading(true);

      // Fetch counts separately to get the real global total (bypassing 1000 limit)
      const [
        countSubscribers,
        countPartners,
        countLeads,
        countSellers,
        partnersResult,
        subscribersResult,
        leadsResult,
        altPartnersResult,
        discountsResult,
        sellersResult,
        eventsResult
      ] = await Promise.all([
        supabase.from('subscribers').select('*', { count: 'exact', head: true }),
        supabase.from('partner_accounts' as any).select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('sellers' as any).select('*', { count: 'exact', head: true }),
        supabase.from('partner_accounts' as any).select('*').order('created_at', { ascending: false }),
        supabase.from('subscribers' as any).select('*').order('created_at', { ascending: false }).limit(10000),
        supabase.from('leads' as any).select('*').order('created_at', { ascending: false }),
        supabase.from('partners' as any).select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('partner_discounts' as any).select('*').order('created_at', { ascending: false }),
        supabase.from('sellers' as any).select('*').order('created_at', { ascending: false }),
        supabase.from('seller_events' as any).select('*')
      ]);

      // Fetch external coupons stats separately
      const { count: totalCoupons } = await supabase
        .from('external_coupons' as any)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { data: latestCoupon } = await supabase
        .from('external_coupons' as any)
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch payment logs separately to avoid issues with Promise.all matching
      const { data: logsData } = await supabase
        .from('mercadopago_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsData) {
        setPaymentLogs(logsData as any[]);
      }

      setCouponStats({
        total: totalCoupons || 0,
        lastUpdate: (latestCoupon as any)?.created_at || null
      });

      setTotals({
        subscribers: countSubscribers.count || 0,
        partners: countPartners.count || 0,
        leads: countLeads.count || 0,
        sellers: countSellers.count || 0
      });

      if (sellersResult.data) setSellers(sellersResult.data as any[]);

      // Process seller metrics
      if (eventsResult.data) {
        const metrics: Record<string, { whatsapp: number; checkout: number }> = {};
        eventsResult.data.forEach((event: any) => {
          if (!metrics[event.seller_id]) {
            metrics[event.seller_id] = { whatsapp: 0, checkout: 0 };
          }
          if (event.event_type === 'whatsapp_click') metrics[event.seller_id].whatsapp++;
          if (event.event_type === 'checkout_intent') metrics[event.seller_id].checkout++;
        });
        setSellerMetrics(metrics);
      }

      let allPartners: any[] = [];
      if (partnersResult.data) allPartners = [...allPartners, ...partnersResult.data];
      if (altPartnersResult && altPartnersResult.data) {
        const altData = altPartnersResult.data as any[];
        allPartners = [...allPartners, ...altData.map(p => ({
          ...p,
          nome_estabelecimento: p.estabelecimento || p.nome_estabelecimento,
          status: p.status || 'pending'
        }))];
      }

      const uniquePartners = allPartners.filter((p, index, self) =>
        index === self.findIndex((t) => t.id === p.id)
      );

      setPartners(uniquePartners);
      if (subscribersResult.data) setSubscribers(subscribersResult.data as any[]);
      if (leadsResult.data) setLeads(leadsResult.data as any[]);
      if (discountsResult.data) setAllDiscounts(discountsResult.data as any[]);

      // Fetch Assinafy Settings
      const { data: assinafyData } = await supabase.from('assinafy_settings' as any).select('*').maybeSingle();
      if (assinafyData) setAssinafySettings(assinafyData as any);

    } catch (error) {
      console.error("Fetch Error:", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadPartnerDiscounts = async (partnerId: string) => {
    setLoadingDiscounts(true);
    try {
      const { data, error } = await supabase
        .from('partner_discounts' as any)
        .select('*')
        .eq('partner_id', partnerId);
      if (error) throw error;
      setPartnerDiscounts(data || []);
    } catch (error) {
      console.error("Error loading discounts:", error);
    } finally {
      setLoadingDiscounts(false);
    }
  };

  const handleUpdateSubscriber = async (id: string, updates: any) => {
    try {
      const { error } = await supabase.from('subscribers' as any).update(updates).eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Associado atualizado com sucesso." });
      fetchData();
      setIsSubscriberDialogOpen(false);
      setIsEditing(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao atualizar associado.", variant: "destructive" });
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    askConfirmation(
      "Excluir Associado?",
      "Esta ação é irreversível e removerá todos os dados deste membro do sistema.",
      async () => {
        try {
          const { error } = await supabase.from('subscribers' as any).delete().eq('id', id);
          if (error) throw error;
          toast({ title: "Sucesso", description: "Associado removido." });
          fetchData();
        } catch (error) {
          toast({ title: "Erro", description: "Falha ao remover associado.", variant: "destructive" });
        }
      }
    );
  };

  const handleUpdateLead = async (id: string, updates: any) => {
    try {
      const { error } = await supabase.from('leads').update(updates).eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Lead atualizado." });
      fetchData();
      setIsLeadDialogOpen(false);
      setIsEditing(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao atualizar lead.", variant: "destructive" });
    }
  };

  const handleDeleteLead = async (id: string) => {
    askConfirmation(
      "Excluir Lead?",
      "Deseja realmente remover este lead? Esta ação não pode ser desfeita.",
      async () => {
        try {
          const { error } = await supabase.from('leads').delete().eq('id', id);
          if (error) throw error;
          toast({ title: "Sucesso", description: "Lead removido." });
          fetchData();
        } catch (error) {
          toast({ title: "Erro", description: "Falha ao remover lead.", variant: "destructive" });
        }
      }
    );
  };

  const handleUpdatePartner = async (id: string, updates: any) => {
    try {
      // Filtrar campos para a tabela 'partners' (vitrine pública)
      const partnersData: any = {
        estabelecimento: updates.nome_estabelecimento || updates.estabelecimento,
        responsavel: updates.responsavel,
        telefone: updates.telefone,
        email: updates.email,
        endereco: updates.endereco,
      };

      // Campos para a tabela 'partner_accounts' (autenticação)
      const accountsData: any = {
        nome_estabelecimento: updates.nome_estabelecimento || updates.estabelecimento,
        responsavel: updates.responsavel,
        telefone: updates.telefone,
        email: updates.email,
        endereco: updates.endereco,
        cnpj: updates.cnpj,
        status: updates.status
      };

      // Se houver uma nova senha
      if (updates.password) {
        accountsData.password_hash = await hashPassword(updates.password);
      }

      // Tentar atualizar em ambas as tabelas
      const promises = [
        supabase.from('partner_accounts' as any).update(accountsData).eq('id', id),
        supabase.from('partners' as any).update(partnersData).eq('id', id)
      ];

      await Promise.all(promises);
      toast({ title: "Sucesso", description: "Parceiro atualizado em todas as plataformas." });
      fetchData();
      setIsPartnerDialogOpen(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Update Partner Error:", error);
      toast({ title: "Erro", description: "Falha ao atualizar parceiro.", variant: "destructive" });
    }
  };

  const handleDeletePartner = async (id: string) => {
    askConfirmation(
      "Excluir Parceiro?",
      "Isso removerá o acesso ao painel e todas as ofertas deste parceiro na vitrine.",
      async () => {
        try {
          await Promise.all([
            supabase.from('partner_accounts' as any).delete().eq('id', id),
            supabase.from('partners' as any).delete().eq('id', id)
          ]);
          toast({ title: "Sucesso", description: "Parceiro removido." });
          fetchData();
        } catch (error) {
          toast({ title: "Erro", description: "Falha ao remover parceiro.", variant: "destructive" });
        }
      }
    );
  };

  const handleUpdateDiscount = async (discountId: string, updates: any) => {
    try {
      const { error } = await supabase.from('partner_discounts' as any).update(updates).eq('id', discountId);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Desconto atualizado." });
      if (selectedPartner) loadPartnerDiscounts(selectedPartner.id);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao atualizar desconto.", variant: "destructive" });
    }
  };

  const handleCreateSubscriber = async (data: any) => {
    try {
      const { data: newSub, error } = await supabase.from('subscribers' as any).insert([{
        ...data,
        status: data.status || 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]).select().single();

      if (error) throw error;

      // Enviar solicitação de assinatura automaticamente
      if (newSub) {
        supabase.functions.invoke('assinafy-signature', { body: { type: 'subscriber', id: (newSub as any).id } });
      }
      toast({ title: "Sucesso", description: "Associado criado manualment." });
      fetchData();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao criar associado.", variant: "destructive" });
    }
  };

  const handleCreateLead = async (data: any) => {
    try {
      const { error } = await supabase.from('leads').insert([{
        ...data,
        converted: false,
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Lead cadastrado manualmente." });
      fetchData();
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao cadastrar lead.", variant: "destructive" });
    }
  };

  const handleCreatePartner = async (data: any) => {
    try {
      if (!data.password || data.password.length < 6) {
        toast({ title: "Senha inválida", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
        return;
      }

      const hashedPassword = await hashPassword(data.password);

      // 1. Inserir na conta de autenticação
      const { data: account, error: accError } = await supabase.from('partner_accounts' as any).insert([{
        email: data.email.toLowerCase(),
        password_hash: hashedPassword,
        nome_estabelecimento: data.nome_estabelecimento,
        responsavel: data.responsavel,
        telefone: data.telefone,
        cnpj: data.cnpj || "",
        endereco: data.endereco,
        status: 'active',
        first_access: false
      }]).select().single();

      if (accError) throw accError;

      // 2. Inserir na vitrine pública (usando o mesmo ID para manter vínculo)
      const partnerData = {
        id: (account as any).id,
        email: data.email.toLowerCase(),
        endereco: data.endereco,
        estabelecimento: data.nome_estabelecimento,
        responsavel: data.responsavel,
        telefone: data.telefone,
        created_at: new Date().toISOString()
      };

      const { error: partError } = await supabase.from('partners' as any).insert([partnerData]);
      if (partError) {
        console.warn("Erro ao inserir na vitrine, mas conta foi criada:", partError);
      }

      // Enviar solicitação de assinatura automaticamente
      if (account) {
        supabase.functions.invoke('assinafy-signature', { body: { type: 'partner', id: (account as any).id } });
      }

      toast({ title: "Sucesso", description: "Parceiro cadastrado e conta de acesso criada." });
      fetchData();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Erro", description: error.message || "Falha ao cadastrar parceiro.", variant: "destructive" });
    }
  };

  const handleCreateGlobalDiscount = async (data: any) => {
    try {
      if (!data.partner_id) throw new Error("Selecione um parceiro.");
      const { error } = await supabase.from('partner_discounts' as any).insert([{
        ...data,
        ativo: true,
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Nova oferta cadastrada." });
      fetchData();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Falha ao criar oferta.", variant: "destructive" });
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCPF = (cpf: string) => {
    if (cpf.length === 11) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
    }
    return cpf;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'signed':
        return (
          <Badge className="bg-green-100 text-green-700 border-none px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
            {status === 'signed' ? 'Assinado' : 'Ativo'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
            Pendente
          </Badge>
        );
      case 'rejected':
      case 'declined':
        return (
          <Badge className="bg-red-100 text-red-700 border-none px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
            {status === 'declined' ? 'Recusado' : 'Cancelado'}
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">{status}</Badge>;
    }
  };

  const getSignatureBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline" className="opacity-30">N/A</Badge>;
    switch (status) {
      case 'signed':
        return <Badge className="bg-green-500 text-white border-none text-[9px] font-black uppercase tracking-widest">Assinado</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500 text-white border-none text-[9px] font-black uppercase tracking-widest">Pendente</Badge>;
      case 'declined':
        return <Badge className="bg-red-500 text-white border-none text-[9px] font-black uppercase tracking-widest">Recusado</Badge>;
      default:
        return <Badge variant="outline" className="text-[9px] uppercase">{status}</Badge>;
    }
  };

  const handleResendSignature = async (type: string, item: any) => {
    try {
      if (!item.assinafy_document_id) {
        // Se não tem ID, tenta criar a assinatura do zero
        sonnerToast.loading("Gerando nova solicitação de assinatura...");
        const { data, error } = await supabase.functions.invoke('assinafy-signature', {
          body: { type, id: item.id }
        });
        if (error) throw error;
        sonnerToast.success("Solicitação enviada com sucesso!");
        fetchData();
        return;
      }

      sonnerToast.loading("Reenviando notificação...");
      // Obter settings para usar a API Key diretamente se necessário ou criar uma nova function
      // Por enquanto vamos usar a mesma assinafy-signature que já lida com o registro
      const { error } = await supabase.functions.invoke('assinafy-signature', {
        body: { type, id: item.id }
      });

      if (error) throw error;
      sonnerToast.success("E-mail de assinatura reenviado!");
      fetchData();
    } catch (error: any) {
      console.error("Resend error:", error);
      sonnerToast.error("Falha ao reenviar: " + error.message);
    }
  };

  const statusCounts = useMemo(() => {
    const approved = subscribers.filter(s => s.status === 'approved').length;
    const pending = subscribers.filter(s => s.status === 'pending').length;
    const rejected = subscribers.filter(s => s.status === 'rejected').length;
    return { approved, pending, rejected };
  }, [subscribers]);

  const discountCounts = useMemo(() => {
    const total = allDiscounts.length;
    const active = allDiscounts.filter(d => d.ativo).length;
    const paused = total - active;
    return { total, active, paused };
  }, [allDiscounts]);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(subscriber => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        (subscriber.name?.toLowerCase().includes(lowerSearch) || false) ||
        (subscriber.email?.toLowerCase().includes(lowerSearch) || false) ||
        (subscriber.cpf?.includes(searchTerm) || false) ||
        (subscriber.phone?.includes(searchTerm) || false);
      const matchesStatus = statusFilter === "all" || subscriber.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, searchTerm, statusFilter]);

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        (partner.nome_estabelecimento?.toLowerCase().includes(lowerSearch) || false) ||
        (partner.responsavel?.toLowerCase().includes(lowerSearch) || false) ||
        (partner.email?.toLowerCase().includes(lowerSearch) || false) ||
        (partner.telefone?.includes(searchTerm) || false)
      );
    });
  }, [partners, searchTerm]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        (lead.nome_completo?.toLowerCase().includes(lowerSearch) || false) ||
        (lead.email?.toLowerCase().includes(lowerSearch) || false) ||
        (lead.telefone?.includes(searchTerm) || false)
      );
    });
  }, [leads, searchTerm]);

  const filteredDiscounts = useMemo(() => {
    return allDiscounts.filter(discount => {
      const partner = partners.find(p => p.id === discount.partner_id);
      const partnerName = partner?.nome_estabelecimento || (partner as any)?.estabelecimento || "";
      const lowerSearch = searchTerm.toLowerCase();

      return (
        (discount.titulo?.toLowerCase().includes(lowerSearch) || false) ||
        (discount.descricao?.toLowerCase().includes(lowerSearch) || false) ||
        partnerName.toLowerCase().includes(lowerSearch)
      );
    });
  }, [allDiscounts, partners, searchTerm]);

  const filteredSellers = useMemo(() => {
    return sellers.filter(seller => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        (seller.name?.toLowerCase().includes(lowerSearch) || false) ||
        (seller.email?.toLowerCase().includes(lowerSearch) || false) ||
        (seller.phone?.toLowerCase().includes(lowerSearch) || false) ||
        (seller.slug?.toLowerCase().includes(lowerSearch) || false)
      );
    });
  }, [sellers, searchTerm]);

  const handleCreateSeller = async (data: any) => {
    try {
      const slug = data.slug || generateSlug(data.name);

      // Verificar se slug já existe
      const { data: existing } = await supabase.from('sellers' as any).select('id').eq('slug', slug).maybeSingle();
      if (existing) {
        toast({ title: "Slug em uso", description: "Este nome já está sendo usado para um link de vendedor. Tente outro.", variant: "destructive" });
        return;
      }

      if (!data.password || data.password.length < 6) {
        toast({ title: "Senha obrigatória", description: "Defina uma senha de pelo menos 6 caracteres.", variant: "destructive" });
        return;
      }

      const hashedPassword = await hashPassword(data.password);

      const { data: newSeller, error } = await supabase.from('sellers' as any).insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        slug: slug,
        status: 'active',
        password_hash: hashedPassword
      }]).select().single();

      if (error) throw error;

      // Enviar solicitação de assinatura automaticamente
      if (newSeller) {
        supabase.functions.invoke('assinafy-signature', { body: { type: 'seller', id: (newSeller as any).id } });
      }
      toast({ title: "Sucesso", description: "Vendedor cadastrado com sucesso." });
      fetchData();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Falha ao cadastrar vendedor.", variant: "destructive" });
    }
  };

  const handleUpdateSeller = async (id: string, updates: any) => {
    try {
      const sellerData: any = {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        slug: updates.slug,
        status: updates.status
      };

      if (updates.password && updates.password.length >= 6) {
        sellerData.password_hash = await hashPassword(updates.password);
      }

      const { error } = await supabase.from('sellers' as any).update(sellerData).eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Vendedor atualizado com sucesso." });
      fetchData();
      setIsSellerDialogOpen(false);
      setIsEditing(false);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao atualizar vendedor.", variant: "destructive" });
    }
  };

  const handleDeleteSeller = async (id: string) => {
    askConfirmation(
      "Remover Vendedor?",
      "Todos os vínculos com este vendedor serão perdidos.",
      async () => {
        const { error } = await supabase.from('sellers' as any).delete().eq('id', id);
        if (error) throw error;
        toast({ title: "Removido", description: "Vendedor excluído com sucesso." });
        fetchData();
      }
    );
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Associados Sheet
      const subscribersData = subscribers.map(s => ({
        Nome: s.name,
        Email: s.email,
        Telefone: s.phone,
        CPF: s.cpf,
        Status: s.status,
        Cadastro: formatDate(s.created_at),
      }));
      const wsSubscribers = XLSX.utils.json_to_sheet(subscribersData);
      XLSX.utils.book_append_sheet(wb, wsSubscribers, "Associados");

      // Leads Sheet
      const leadsData = leads.map(l => ({
        Nome: l.nome_completo,
        Email: l.email,
        Telefone: l.telefone,
        Origem: l.source || "Meta Ads",
        Cadastro: formatDate(l.created_at),
      }));
      const wsLeads = XLSX.utils.json_to_sheet(leadsData);
      XLSX.utils.book_append_sheet(wb, wsLeads, "Leads");

      // Parceiros Sheet
      const partnersData = partners.map(p => ({
        Estabelecimento: p.nome_estabelecimento || (p as any).estabelecimento || "N/A",
        Responsável: p.responsavel,
        Email: p.email,
        Telefone: p.telefone,
        Status: p.status === 'active' || p.status === 'approved' ? 'Ativo' : 'Pendente',
        Cadastro: formatDate(p.created_at),
      }));
      const wsPartners = XLSX.utils.json_to_sheet(partnersData);
      XLSX.utils.book_append_sheet(wb, wsPartners, "Parceiros");

      XLSX.writeFile(wb, `Relatorio_Global_Clube_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({ title: "Sucesso!", description: "Relatório global gerado com sucesso." });
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: "Erro!", description: "Falha ao gerar o relatório consolidado.", variant: "destructive" });
    }
  };

  const handleDownloadLeadTemplate = () => {
    const template = [
      {
        nome_completo: "Nome do Lead",
        email: "email@exemplo.com",
        telefone: "21999999999",
        source: "Importação Massa",
        notes: "Interessado em plano familiar"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Modelo_Importacao_Leads.xlsx");
  };

  const handleImportLeads = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast({ title: "Erro", description: "O arquivo está vazio.", variant: "destructive" });
          return;
        }

        const formattedLeads = jsonData.map((item: any) => ({
          nome_completo: item.nome_completo || item.Nome || item["Nome do Lead"] || "",
          email: item.email || item.Email || "",
          telefone: String(item.telefone || item.Telefone || ""),
          source: item.source || item.Origem || "Importação Massa",
          notes: item.notes || item.Notas || "",
          converted: false
        })).filter(lead => lead.nome_completo && (lead.email || lead.telefone));

        if (formattedLeads.length === 0) {
          toast({ title: "Erro", description: "Nenhum lead válido encontrado. Verifique os campos nome e email/telefone.", variant: "destructive" });
          return;
        }

        const { error } = await supabase.from('leads').insert(formattedLeads);
        if (error) throw error;

        toast({ title: "Sucesso!", description: `${formattedLeads.length} leads importados com sucesso.` });
        fetchData();
      } catch (error) {
        console.error("Import error:", error);
        toast({ title: "Erro!", description: "Falha ao processar a planilha. Verifique o formato.", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
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
      <SEO title="Admin - Clube Aqui Tem" description="Painel administrativo oficial." />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium mb-4 border border-white/20">
                <LayoutDashboard className="w-4 h-4 text-accent" />
                Master Admin Dashboard
              </div>
              <h1 className="text-4xl md:text-5xl font-brand font-bold text-white mb-2">Painel de Controle</h1>
              <p className="text-primary-foreground/80 text-lg">Gerencie associados, parceiros e leads em tempo real.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
              <Button
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white hover:text-primary h-14 px-8 rounded-2xl transition-all"
                onClick={exportToExcel}
              >
                <Download className="w-5 h-5 mr-3" />
                Relatório Global
              </Button>
              <Button variant="hero" className="h-14 px-8 rounded-2xl shadow-xl shadow-accent/20" onClick={handleLogout}>
                <LogOut className="w-5 h-5 mr-3" />
                Sair
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="flex-grow container mx-auto px-4 -mt-12 pb-24 relative z-20">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Internal Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
            {[
              { label: "Associados Totais", value: totals.subscribers, icon: Users, color: "bg-blue-500", shadow: "shadow-blue-500/20" },
              { label: "Vendedores Ativos", value: totals.sellers, icon: UserPlus, color: "bg-purple-500", shadow: "shadow-purple-500/20" },
              { label: "Parceiros Ativos", value: totals.partners, icon: Store, color: "bg-indigo-500", shadow: "shadow-indigo-500/20" },
              { label: "Leads Pendentes", value: totals.leads, icon: Target, color: "bg-orange-500", shadow: "shadow-orange-500/20" },
              {
                label: "Descontos Locais",
                value: discountCounts.total,
                subValue: `${discountCounts.active} Ativos / ${discountCounts.paused} Pausados`,
                icon: Tag,
                color: "bg-accent",
                shadow: "shadow-accent/20"
              }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="h-full flex flex-col"
              >
                <Card className={`border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white hover:scale-[1.02] transition-all h-full min-h-[160px]`}>
                  <CardContent className="p-8 h-full flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.shadow}`}>
                        <stat.icon className="w-7 h-7" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-brand font-black text-primary">{stat.value}</h3>
                        {stat.subValue && <p className="text-[10px] font-bold text-accent mt-1">{stat.subValue}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Links Section */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-brand font-bold text-primary">Acessos Rápidos</h2>
                <p className="text-muted-foreground">Plataformas e ferramentas externas</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {EXTERNAL_LINKS.map((link, i) => {
                if (link.id === 'update-coupons') {
                  return (
                    <motion.button
                      key={link.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className={`${link.color} h-full min-h-[96px] rounded-3xl flex flex-col items-center justify-center text-white font-bold gap-2 shadow-xl hover:translate-y-[-5px] transition-all w-full`}
                      onClick={async () => {
                        if (isUpdatingCoupons) return;
                        setIsUpdatingCoupons(true);
                        setScraperProgress(0);
                        setCurrentPortal("Iniciando...");

                        const apiUrl = window.location.hostname === 'localhost'
                          ? 'http://localhost:3000/api/scrape-coupons'
                          : '/api/scrape-coupons';

                        const statusUrl = window.location.hostname === 'localhost'
                          ? 'http://localhost:3000/api/scrape-status'
                          : '/api/scrape-status';

                        toast({
                          title: "Atualização Iniciada",
                          description: "O robô está coletando novas ofertas em 2º plano...",
                          className: "bg-blue-600 text-white border-none"
                        });

                        // Dispara o scraper sem travar o botão aguardando o fetch longo
                        fetch(apiUrl, { method: 'POST' }).catch(err => {
                          console.error("Scraper fire error:", err);
                        });

                        // Polling de progresso
                        const interval = setInterval(async () => {
                          try {
                            const res = await fetch(statusUrl);
                            if (!res.ok) return;
                            const data = await res.json();

                            setScraperProgress(data.progress || 0);
                            setCurrentPortal(data.current_portal || "");

                            if (data.is_running === false && data.progress >= 100) {
                              clearInterval(interval);
                              setIsUpdatingCoupons(false);
                              fetchData();
                              toast({
                                title: "Sucesso",
                                description: "Cupons atualizados!",
                                className: "bg-green-600 text-white border-none"
                              });
                            }

                            if (data.error) {
                              clearInterval(interval);
                              setIsUpdatingCoupons(false);
                              toast({
                                title: "Erro no Scraper",
                                description: data.error,
                                variant: "destructive"
                              });
                            }
                          } catch (e) {
                            console.error("Polling error:", e);
                          }
                        }, 2000);
                      }}
                    >
                      <div className="flex flex-col items-center px-4">
                        {isUpdatingCoupons ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="relative w-10 h-10 mb-1">
                              <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                  className="text-white/20"
                                  strokeDasharray="100, 100"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className="text-white"
                                  strokeDasharray={`${scraperProgress}, 100`}
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                                {scraperProgress}%
                              </div>
                            </div>
                          </div>
                        ) : (
                          <link.icon className="w-6 h-6 mb-2 animate-pulse" />
                        )}

                        <span className="text-[10px] uppercase tracking-tighter text-center leading-tight">
                          {isUpdatingCoupons ? `Processando: ${currentPortal}` : link.name}
                        </span>

                        {couponStats.total > 0 && !isUpdatingCoupons && (
                          <div className="flex flex-col items-center text-[10px] opacity-90 font-medium">
                            <span>{couponStats.total} Ofertas Ativas</span>
                            {couponStats.lastUpdate && (
                              <span className="text-[9px] opacity-75">
                                {new Date(couponStats.lastUpdate).toLocaleString('pt-BR')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  )
                }
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={`${link.color} h-full min-h-[96px] rounded-3xl flex flex-col items-center justify-center text-white font-bold gap-2 shadow-xl hover:translate-y-[-5px] transition-all`}
                  >
                    <link.icon className="w-6 h-6" />
                    <span className="text-xs uppercase tracking-widest">{link.name}</span>
                  </motion.a>
                )
              })}
            </div>
          </section>

          {/* Main Data Section */}
          <section>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-4 rounded-3xl shadow-xl border border-border">
                <div className="flex-1 overflow-x-auto no-scrollbar">
                  <TabsList className="bg-muted/50 p-1 rounded-2xl flex w-max min-w-full">
                    <TabsTrigger value="subscribers" className="rounded-xl px-4 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Associados
                      {searchTerm && <Badge variant="secondary" className="ml-1 px-1 h-4 text-[9px] bg-white/20 text-inherit border-none">{filteredSubscribers.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="leads" className="rounded-xl px-4 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Leads
                      {searchTerm && <Badge variant="secondary" className="ml-1 px-1 h-4 text-[9px] bg-white/20 text-inherit border-none">{filteredLeads.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="partners" className="rounded-xl px-4 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      Parceiros
                      {searchTerm && <Badge variant="secondary" className="ml-1 px-1 h-4 text-[9px] bg-white/20 text-inherit border-none">{filteredPartners.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="sellers" className="rounded-xl px-4 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Vendedores
                      {searchTerm && <Badge variant="secondary" className="ml-1 px-1 h-4 text-[9px] bg-white/20 text-inherit border-none">{filteredSellers.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="rounded-xl px-4 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      Pagamentos
                    </TabsTrigger>
                    <TabsTrigger value="discounts" className="rounded-xl px-4 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Ofertas
                    </TabsTrigger>
                    <TabsTrigger value="companies" className="rounded-xl px-4 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      B2B
                    </TabsTrigger>
                    <TabsTrigger value="assinafy" className="rounded-xl px-4 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2">
                      <FileSignature className="w-4 h-4" />
                      Assinafy
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="relative group w-full xl:w-[280px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Busca global..."
                    className="h-12 pl-12 w-full rounded-2xl border-border bg-[#F9FAFB] focus:bg-white transition-all shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <TabsContent value="subscribers" className="m-0 focus-visible:outline-none">
                    <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                      <div className="bg-primary/5 p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-2xl font-brand font-bold text-primary">Controle de Assinantes</h3>
                            <p className="text-sm text-muted-foreground">Mostrando {searchTerm ? filteredSubscribers.length : totals.subscribers} associados</p>
                          </div>
                          <Button
                            onClick={() => {
                              setCreateType("subscriber");
                              setFormData({ status: 'approved' });
                              setIsCreateDialogOpen(true);
                            }}
                            className="bg-primary text-white hover:bg-primary/90 h-10 px-4 rounded-xl flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Novo Associado
                          </Button>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[180px] h-12 rounded-xl">
                            <SelectValue placeholder="Filtrar Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            <SelectItem value="approved">Ativos</SelectItem>
                            <SelectItem value="pending">Pendentes</SelectItem>
                            <SelectItem value="rejected">Cancelados</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-muted/30">
                              <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">NOME COMPLETO</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">CPF</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">ORIGEM</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">STATUS</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">ASSINATURA</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-right">AÇÕES</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredSubscribers.map((item) => (
                                <TableRow
                                  key={item.id}
                                  className="hover:bg-muted/10 border-border/50 group cursor-pointer transition-colors"
                                  onClick={() => {
                                    setSelectedSubscriber(item);
                                    setIsSubscriberDialogOpen(true);
                                  }}
                                >
                                  <TableCell className="py-6 px-8">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-primary">{item.name}</span>
                                      <span className="text-xs text-muted-foreground">{item.email}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-6 px-8 font-medium text-xs font-mono">{formatCPF(item.cpf)}</TableCell>
                                  <TableCell className="py-6 px-8">
                                    <span className="text-xs font-bold text-primary">
                                      {item.seller_id
                                        ? `Vendedor: ${sellers.find(s => s.id === item.seller_id)?.name || "N/A"}`
                                        : (item.source || "Direto")}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-6 px-8">{getStatusBadge(item.status)}</TableCell>
                                  <TableCell className="py-6 px-8">{getSignatureBadge(item.signature_status)}</TableCell>
                                  <TableCell className="py-6 px-8 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="group-hover:text-primary transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSubscriber(item);
                                          setEditData({ ...item });
                                          setIsEditing(true);
                                          setIsSubscriberDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSubscriber(item.id);
                                        }}
                                      >
                                        <Trash className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="group-hover:text-primary transition-colors"
                                        onClick={() => {
                                          setSelectedSubscriber(item);
                                          setIsEditing(false);
                                          setIsSubscriberDialogOpen(true);
                                        }}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Reenviar Assinatura"
                                        className="text-primary hover:text-primary transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleResendSignature("subscriber", item);
                                        }}
                                      >
                                        <Send className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="leads" className="m-0 focus-visible:outline-none">
                    <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                      <div className="p-8 border-b border-border bg-orange-50/50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="text-2xl font-brand font-bold text-orange-800">Leads & Captação</h3>
                              <p className="text-sm text-orange-600/70">Originados de Campanhas Meta Ads</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  setCreateType("lead");
                                  setFormData({ source: 'Manual' });
                                  setIsCreateDialogOpen(true);
                                }}
                                className="bg-orange-600 text-white hover:bg-orange-700 h-10 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-600/20"
                              >
                                <Plus className="w-4 h-4" />
                                Novo Lead
                              </Button>

                              <Button
                                variant="outline"
                                onClick={handleDownloadLeadTemplate}
                                className="border-orange-200 text-orange-700 hover:bg-orange-100 h-10 px-4 rounded-xl flex items-center gap-2"
                              >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span className="hidden sm:inline">Baixar Modelo</span>
                              </Button>

                              <label className="cursor-pointer">
                                <div className="bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 h-10 px-4 rounded-xl flex items-center gap-2 transition-colors">
                                  <Download className="w-4 h-4 rotate-180" />
                                  <span className="hidden sm:inline">Importar Lista</span>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".xlsx, .xls, .csv"
                                  onChange={handleImportLeads}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-2xl font-bold text-sm text-center">
                            {searchTerm ? filteredLeads.length : totals.leads} Registros Totais
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-muted/30">
                              <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">POTENCIAL CLIENTE</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-center">CONTATO</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-right">AÇÕES</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredLeads.map((lead) => (
                                <TableRow
                                  key={lead.id}
                                  className="hover:bg-orange-50/20 border-border/50 cursor-pointer transition-colors group"
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setIsLeadDialogOpen(true);
                                  }}
                                >
                                  <TableCell className="py-6 px-8 font-bold text-primary">{lead.nome_completo}</TableCell>
                                  <TableCell className="py-6 px-8 text-center">
                                    <div className="flex flex-col items-center">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); openWhatsApp(lead.telefone); }}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-green-600 transition-colors"
                                      >
                                        <MessageSquare className="w-3 h-3" />
                                        {lead.telefone}
                                      </button>
                                      <span className="text-[10px] text-muted-foreground/60">{lead.email}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-6 px-8 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                      <Badge variant="outline" className="hidden sm:inline-flex text-[9px] font-black uppercase tracking-[2px]">{lead.source || "Meta Ads"}</Badge>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-orange-600 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedLead(lead);
                                          setEditData({ ...lead });
                                          setIsEditing(true);
                                          setIsLeadDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteLead(lead.id);
                                        }}
                                      >
                                        <Trash className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="group-hover:text-orange-600 transition-colors"
                                        onClick={() => {
                                          setSelectedLead(lead);
                                          setIsEditing(false);
                                          setIsLeadDialogOpen(true);
                                        }}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="partners" className="m-0 focus-visible:outline-none">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4 text-left">
                        <div>
                          <h2 className="text-3xl font-brand font-bold text-primary">Parceiros Comerciais</h2>
                          <p className="text-muted-foreground">Rede de estabelecimentos conveniados</p>
                        </div>
                        <Button
                          onClick={() => {
                            setCreateType("partner");
                            setFormData({ status: 'active' });
                            setIsCreateDialogOpen(true);
                          }}
                          className="bg-primary text-white hover:bg-primary/90 h-10 px-4 rounded-xl flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Novo Parceiro
                        </Button>
                      </div>
                      <div className="bg-primary/10 text-primary px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest">
                        {searchTerm ? filteredPartners.length : totals.partners} Parceiros registrados
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                      {filteredPartners.length === 0 ? (
                        <Card className="md:col-span-2 lg:col-span-3 p-12 text-center border-dashed border-2 bg-muted/20">
                          <Store className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground">Nenhum parceiro encontrado.</p>
                        </Card>
                      ) : (
                        filteredPartners.map((partner) => (
                          <Card key={partner.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white hover:scale-[1.02] transition-all h-full flex flex-col">
                            <div className="bg-muted/30 p-8 flex justify-center border-b">
                              {partner.logo_url ? (
                                <img loading="lazy" src={partner.logo_url} alt="" className="h-16 w-32 object-contain" />
                              ) : (
                                <div className="h-16 w-32 bg-white rounded-2xl flex items-center justify-center border border-dashed text-muted-foreground/30">
                                  <ImageIcon size={32} />
                                </div>
                              )}
                            </div>
                            <CardContent className="p-8 space-y-4 relative">
                              <div className="flex justify-between items-start gap-4">
                                <h4 className="text-lg font-brand font-black text-primary uppercase tracking-tight leading-tight">
                                  {partner.nome_estabelecimento || (partner as any).estabelecimento || "Sem Nome"}
                                </h4>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge className={`${partner.status === 'active' || partner.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} border-none text-[8px] font-black uppercase px-2 py-0.5`}>
                                    {partner.status === 'active' || partner.status === 'approved' ? 'Ativo' : 'Pendente'}
                                  </Badge>
                                  {getSignatureBadge(partner.signature_status)}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <Users className="w-4 h-4 text-accent" />
                                  <span>Resp: <strong className="text-primary">{partner.responsavel}</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <Phone className="w-4 h-4 text-accent" />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openWhatsApp(partner.telefone); }}
                                    className="hover:text-green-600 transition-colors font-medium flex items-center gap-1"
                                  >
                                    {partner.telefone}
                                    <ExternalLink className="w-2 h-2" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex gap-2 w-full mt-4">
                                <Button
                                  variant="ghost"
                                  className="flex-1 text-[10px] font-bold gap-2 hover:bg-accent/10 hover:text-accent"
                                  onClick={() => {
                                    setSelectedPartner(partner);
                                    setIsEditing(false);
                                    setIsPartnerDialogOpen(true);
                                    loadPartnerDiscounts(partner.id);
                                  }}
                                >
                                  <Eye size={14} />
                                  Gerir
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="flex-1 text-[10px] font-bold gap-2 hover:bg-blue-50 hover:text-blue-600"
                                  onClick={() => {
                                    setSelectedPartner(partner);
                                    setEditData({ ...partner });
                                    setIsEditing(true);
                                    setIsPartnerDialogOpen(true);
                                  }}
                                >
                                  <Edit size={14} />
                                  Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="px-3 h-9 text-red-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeletePartner(partner.id)}
                                >
                                  <Trash size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="px-3 h-9 text-primary hover:bg-primary/5"
                                  title="Reenviar Assinatura"
                                  onClick={() => handleResendSignature("partner", partner)}
                                >
                                  <Send size={14} />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="sellers" className="m-0 focus-visible:outline-none">
                    <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                      <div className="p-8 border-b border-border bg-purple-50/50">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="text-2xl font-brand font-bold text-purple-800">Equipe de Vendas</h3>
                              <p className="text-sm text-purple-600/70">Gestão de vendedores e links de indicação</p>
                            </div>
                            <Button
                              onClick={() => {
                                setCreateType("seller" as any);
                                setFormData({ status: 'active' });
                                setIsCreateDialogOpen(true);
                              }}
                              className="bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20"
                            >
                              <Plus className="w-4 h-4" />
                              Novo Vendedor
                            </Button>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="bg-white border border-purple-200 text-purple-800 px-6 py-2 rounded-2xl shadow-sm">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1">Total Comissões (Mês)</p>
                              <p className="text-xl font-black">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                  filteredSellers.reduce((acc, seller) => {
                                    const approvedSales = subscribers.filter(s => s.seller_id === seller.id && s.status === 'approved').length;
                                    const rawComm = approvedSales * 19.90 * 0.15;
                                    const roundedComm = Math.round(rawComm * 100) / 100;
                                    return acc + roundedComm;
                                  }, 0)
                                )}
                              </p>
                            </div>
                            <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-2xl font-bold text-sm">
                              {searchTerm ? filteredSellers.length : totals.sellers} Ativos
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-muted/30">
                              <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-primary">VENDEDOR</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-primary">LINK DE VENDA</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-center text-primary">PERFORMANCE</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-primary">ASSINATURA</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-right text-primary">AÇÕES</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredSellers.map((seller) => {
                                const sellerSales = subscribers.filter(s => s.seller_id === seller.id).length;
                                const approvedSales = subscribers.filter(s => s.seller_id === seller.id && s.status === 'approved').length;
                                const sellerLeads = leads.filter(l => l.seller_id === seller.id).length;
                                const saleLink = `${window.location.origin}/?ref=${seller.slug}`;
                                const rawCommission = approvedSales * 19.90 * 0.15;
                                const commission = Math.round(rawCommission * 100) / 100;

                                return (
                                  <TableRow key={seller.id} className="hover:bg-purple-50/20 border-border/50 transition-colors group">
                                    <TableCell className="py-6 px-8">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-primary">{seller.name}</span>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                                          <Mail className="w-3 h-3" /> {seller.email}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                      <div className="flex items-center gap-2">
                                        <code className="bg-muted px-3 py-1.5 rounded-lg text-[10px] font-mono border border-border/50 text-muted-foreground truncate max-w-[200px]">
                                          {saleLink}
                                        </code>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-purple-600 hover:bg-purple-50"
                                          onClick={() => {
                                            navigator.clipboard.writeText(saleLink);
                                            toast({ title: "Copiado!", description: "Link de venda copiado para a área de transferência." });
                                          }}
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-green-600 hover:bg-green-50"
                                          onClick={() => openWhatsApp(seller.phone)}
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-center">
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-blue-50 p-2 rounded-lg" title="Leads capturados via formulário">
                                          <p className="font-black text-blue-700">{sellerLeads}</p>
                                          <p className="text-[9px] text-blue-600/70">LEADS FORM</p>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded-lg" title="Cliques no botão WhatsApp">
                                          <p className="font-black text-green-700">{sellerMetrics[seller.id]?.whatsapp || 0}</p>
                                          <p className="text-[9px] text-green-600/70">WHATSAPP</p>
                                        </div>
                                        <div className="bg-orange-50 p-2 rounded-lg" title="Intenções de Venda (Botão Comprar)">
                                          <p className="font-black text-orange-700">{sellerMetrics[seller.id]?.checkout || 0}</p>
                                          <p className="text-[9px] text-orange-600/70">INTENÇÃO</p>
                                        </div>
                                        <div className="bg-purple-50 p-2 rounded-lg" title="Vendas Confirmadas">
                                          <p className="font-black text-purple-700">{approvedSales} <span className="text-purple-400/60 text-[8px]">/ {sellerSales}</span></p>
                                          <p className="text-[9px] text-purple-600/70">ATIVAS</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 whitespace-nowrap">
                                      {getSignatureBadge(seller.signature_status)}
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-primary hover:bg-muted"
                                          onClick={() => {
                                            setSelectedSeller(seller);
                                            setEditData({ ...seller, password: '' });
                                            setIsEditing(true);
                                            setIsSellerDialogOpen(true);
                                          }}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-400 hover:text-red-600"
                                          onClick={() => handleDeleteSeller(seller.id)}
                                        >
                                          <Trash className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          title="Reenviar Assinatura"
                                          className="text-primary hover:text-primary transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleResendSignature("seller", seller);
                                          }}
                                        >
                                          <Send className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Modal de Edição de Vendedor */}
                  <Dialog open={isSellerDialogOpen} onOpenChange={setIsSellerDialogOpen}>
                    <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white text-primary">
                      {selectedSeller && (
                        <>
                          <div className="bg-purple-600 p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                              <UserCog size={100} />
                            </div>
                            <DialogTitle className="text-2xl font-brand font-black relative z-10">Editar Vendedor</DialogTitle>
                            <DialogDescription className="text-white/70 relative z-10">Atualizar dados e credenciais</DialogDescription>
                          </div>
                          <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <Label>WhatsApp</Label>
                                <Input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>E-mail (Login)</Label>
                                <Input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <Label>Slug (Link)</Label>
                                <Input value={editData.slug} onChange={e => setEditData({ ...editData, slug: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <Label>Nova Senha (Opcional)</Label>
                                <Input
                                  type="password"
                                  placeholder="Deixe em branco para manter"
                                  value={editData.password || ""}
                                  onChange={e => setEditData({ ...editData, password: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                              <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsSellerDialogOpen(false)}>Cancelar</Button>
                              <Button
                                variant="hero"
                                className="flex-1 h-12 rounded-xl bg-purple-600 shadow-xl shadow-purple-600/20"
                                onClick={() => handleUpdateSeller(selectedSeller.id, editData)}
                              >
                                Salvar Alterações
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  <TabsContent value="discounts" className="m-0 focus-visible:outline-none">
                    <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                      <div className="bg-primary/5 p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-2xl font-brand font-bold text-primary">Gestão de Ofertas</h3>
                            <p className="text-sm text-muted-foreground">Monitoramento global de descontos ativos no clube</p>
                          </div>
                          <Button
                            onClick={() => {
                              setCreateType("discount");
                              setFormData({ partner_id: '', percentual_desconto: 10 });
                              setIsCreateDialogOpen(true);
                            }}
                            className="bg-accent text-white hover:bg-accent/90 h-10 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-accent/20"
                          >
                            <Plus className="w-4 h-4" />
                            Nova Oferta
                          </Button>
                        </div>
                        <div className="bg-accent/10 text-accent px-6 py-2 rounded-2xl font-black text-sm uppercase tracking-widest">
                          {filteredDiscounts.length} Ofertas
                        </div>
                      </div>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-muted/30">
                              <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">PARCEIRO</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">OFERTA</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">VALOR</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-center">STATUS</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-right">AÇÕES</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredDiscounts.map((discount) => (
                                <TableRow key={discount.id} className="hover:bg-primary/5 border-border/50">
                                  <TableCell className="py-6 px-8 font-bold text-primary">
                                    {partners.find(p => p.id === discount.partner_id)?.nome_estabelecimento ||
                                      (partners.find(p => p.id === discount.partner_id) as any)?.estabelecimento ||
                                      "Parceiro não encontrado"}
                                  </TableCell>
                                  <TableCell className="py-6 px-8">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-primary">{discount.titulo}</span>
                                      <span className="text-xs text-muted-foreground line-clamp-1">{discount.descricao}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-6 px-8">
                                    <Badge className="bg-accent/10 text-accent border-none font-black text-[10px]">
                                      -{discount.percentual_desconto}%
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-6 px-8 text-center">
                                    {discount.ativo ? (
                                      <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-[10px] uppercase">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Ativo
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-[10px] uppercase">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Pausado
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-6 px-8 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:text-primary transition-colors"
                                        onClick={() => {
                                          setSelectedDiscount(discount);
                                          setEditData({ ...discount });
                                          setIsEditing(true);
                                          setIsDiscountDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                        onClick={() => {
                                          askConfirmation(
                                            "Remover Oferta?",
                                            "Deseja excluir este desconto permanentemente?",
                                            async () => {
                                              await supabase.from('partner_discounts' as any).delete().eq('id', discount.id);
                                              fetchData();
                                              toast({ title: "Removido", description: "Oferta excluída com sucesso." });
                                            }
                                          );
                                        }}
                                      >
                                        <Trash className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="assinafy" className="m-0 focus-visible:outline-none">
                    <AssinafyManager settings={assinafySettings} onUpdate={fetchData} />
                  </TabsContent>

                  <TabsContent value="payments" className="m-0 focus-visible:outline-none">
                    <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                      <div className="bg-primary/5 p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-brand font-bold text-primary italic">Status Mercado Pago</h3>
                          <p className="text-sm text-muted-foreground">Últimos 50 eventos processados pelo Webhook</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchData}
                          className="rounded-xl border-primary/20 hover:bg-primary/5 h-10 px-4"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                          Atualizar Atividade
                        </Button>
                      </div>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-muted/30">
                              <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">DATA/HORA</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">EVENTO ID</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">CLIENTE / REFERÊNCIA</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest">STATUS MP</TableHead>
                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-right">PAYLOAD</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paymentLogs.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={5} className="py-20 text-center text-muted-foreground italic">
                                    Nenhum log de pagamento encontrado ainda.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                paymentLogs.map((log) => {
                                  const parts = log.external_reference?.split('_') || [];
                                  const possibleCpf = parts[parts.length - 1];
                                  const subscriber = subscribers.find(s => s.cpf === possibleCpf || s.id === log.external_reference);

                                  return (
                                    <TableRow key={log.id} className="hover:bg-muted/10 border-border/50">
                                      <TableCell className="py-6 px-8 text-xs font-mono">
                                        {new Date(log.created_at).toLocaleString('pt-BR')}
                                      </TableCell>
                                      <TableCell className="py-6 px-8">
                                        <div className="flex flex-col">
                                          <span className="font-bold text-primary">{log.payment_id}</span>
                                          <span className="text-[9px] text-muted-foreground uppercase">{log.action || 'payment.updated'}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-6 px-8">
                                        <div className="flex flex-col">
                                          {subscriber ? (
                                            <>
                                              <span className="font-bold text-primary">{subscriber.name}</span>
                                              <span className="text-xs text-muted-foreground">{formatCPF(subscriber.cpf)}</span>
                                              <span className="text-[10px] text-muted-foreground/60 italic mt-1">Ref: {log.external_reference}</span>
                                            </>
                                          ) : (
                                            <span className="font-medium italic text-xs text-primary/70">{log.external_reference || "N/A"}</span>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-6 px-8">
                                        {getStatusBadge(log.status)}
                                      </TableCell>
                                      <TableCell className="py-6 px-8 text-right">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-[10px] h-8 px-4 rounded-xl border border-primary/10 hover:bg-primary hover:text-white transition-all font-bold"
                                          onClick={() => {
                                            setSelectedLog(log);
                                            setIsJSONDialogOpen(true);
                                          }}
                                        >
                                          <Eye className="w-3.5 h-3.5 mr-2" />
                                          Ver Detalhes
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
              <TabsContent value="companies">
                <CompaniesManager subscribers={subscribers} onUpdate={fetchData} />
              </TabsContent>
            </Tabs>
          </section>

        </div>
      </main >

      <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          {selectedPartner && (
            <>
              <div className="bg-primary p-12 text-white relative">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Building2 size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center p-4 shadow-xl">
                    {selectedPartner.logo_url ? (
                      <img loading="lazy" src={selectedPartner.logo_url} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Store className="text-primary w-10 h-10" />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-brand font-black">{selectedPartner.nome_estabelecimento}</DialogTitle>
                    <DialogDescription className="text-white/70 text-lg">Detalhes da Parceria Comercial</DialogDescription>
                  </div>
                </div>
              </div>

              <div className="p-12 space-y-8 bg-white">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Estabelecimento</Label>
                        <Input value={editData.nome_estabelecimento} onChange={e => setEditData({ ...editData, nome_estabelecimento: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Responsável</Label>
                        <Input value={editData.responsavel} onChange={e => setEditData({ ...editData, responsavel: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>CNPJ</Label>
                        <Input value={editData.cnpj} onChange={e => setEditData({ ...editData, cnpj: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={editData.status} onValueChange={v => setEditData({ ...editData, status: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Ativo (Aprovado)</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="suspended">Suspenso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Endereço</Label>
                        <Input value={editData.endereco} onChange={e => setEditData({ ...editData, endereco: e.target.value })} />
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-6 flex gap-4">
                      <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      <Button variant="hero" className="flex-1 h-14 rounded-2xl shadow-xl shadow-accent/20" onClick={() => handleUpdatePartner(selectedPartner.id, editData)}>Salvar Alterações</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Responsável Legal</p>
                          <div className="flex items-center gap-3 text-primary font-bold">
                            <Users size={18} className="text-accent" />
                            {selectedPartner.responsavel}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contato</p>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold">{selectedPartner.telefone}</span>
                            <span className="text-xs text-muted-foreground">{selectedPartner.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status da Parceria</p>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${selectedPartner.status === 'active' || selectedPartner.status === 'approved' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                            <span className="font-brand font-black text-primary uppercase text-sm tracking-tighter">
                              {selectedPartner.status === 'active' || selectedPartner.status === 'approved' ? 'Parceria Ativa' : selectedPartner.status === 'suspended' ? 'Suspensa' : 'Em Análise'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t">
                      <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-accent" />
                        Gerenciar Descontos
                      </h4>
                      {loadingDiscounts ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
                      ) : partnerDiscounts.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8 border border-dashed rounded-3xl">Este parceiro ainda não cadastrou ofertas.</p>
                      ) : (
                        <div className="space-y-4">
                          {partnerDiscounts.map(discount => (
                            <div key={discount.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border">
                              <div>
                                <p className="font-bold text-primary">{discount.titulo}</p>
                                <p className="text-xs text-accent">-{discount.percentual_desconto}% de desconto</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={discount.ativo ? "text-green-600" : "text-amber-600"}
                                  onClick={() => handleUpdateDiscount(discount.id, { ativo: !discount.ativo })}
                                >
                                  {discount.ativo ? "Ativo" : "Pausado"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-400 hover:text-red-600"
                                  onClick={() => {
                                    askConfirmation(
                                      "Excluir Desconto?",
                                      "Esta oferta será removida imediatamente da vitrine pública.",
                                      async () => {
                                        await supabase.from('partner_discounts' as any).delete().eq('id', discount.id);
                                        loadPartnerDiscounts(selectedPartner.id);
                                      }
                                    );
                                  }}
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-8 flex gap-4">
                      <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsPartnerDialogOpen(false)}>Fechar</Button>
                      <Button
                        variant="hero"
                        className="flex-1 h-14 rounded-2xl shadow-xl shadow-accent/20"
                        onClick={() => {
                          setEditData({ ...selectedPartner });
                          setIsEditing(true);
                        }}
                      >
                        Editar Parceiro
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscriber Details Dialog */}
      <Dialog open={isSubscriberDialogOpen} onOpenChange={setIsSubscriberDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white text-primary">
          {selectedSubscriber && (
            <>
              <div className="bg-primary p-12 text-white relative">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Users size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
                    <UserPlus className="text-white w-10 h-10" />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-brand font-black">{selectedSubscriber.name}</DialogTitle>
                    <DialogDescription className="text-white/70 text-lg">Perfil Completo do Associado</DialogDescription>
                  </div>
                </div>
              </div>

              <div className="p-12 space-y-8 bg-white">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Status da Assinatura</Label>
                        <Select value={editData.status} onValueChange={v => setEditData({ ...editData, status: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Ativo</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="rejected">Rejeitado/Inadimplente</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <Input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF</Label>
                        <Input value={editData.cpf} onChange={e => setEditData({ ...editData, cpf: e.target.value })} />
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-6 flex gap-4">
                      <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      <Button variant="hero" className="flex-1 h-14 rounded-2xl shadow-xl shadow-accent/20" onClick={() => handleUpdateSubscriber(selectedSubscriber.id, editData)}>Salvar Associado</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contatos</p>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold">{selectedSubscriber.email}</span>
                            <button
                              onClick={() => openWhatsApp(selectedSubscriber.phone)}
                              className="text-sm text-left font-medium hover:text-green-600 transition-colors flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4 text-green-500" />
                              {selectedSubscriber.phone}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Documento</p>
                          <span className="font-mono text-xs">{formatCPF(selectedSubscriber.cpf)}</span>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</p>
                          {getStatusBadge(selectedSubscriber.status)}
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-6 border-t flex gap-4">
                      <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsSubscriberDialogOpen(false)}>Fechar</Button>
                      <Button variant="hero" className="flex-1 h-14 rounded-2xl shadow-xl shadow-accent/20" onClick={() => {
                        setEditData({ ...selectedSubscriber });
                        setIsEditing(true);
                      }}>Editar Perfil</Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Lead Details Dialog */}
      <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white text-primary">
          {selectedLead && (
            <>
              <div className="bg-orange-600 p-12 text-white relative">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Target size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
                    <Zap className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-brand font-black">{selectedLead.nome_completo}</DialogTitle>
                    <DialogDescription className="text-white/70">Lead de Marketing Digital</DialogDescription>
                  </div>
                </div>
              </div>

              <div className="p-12 space-y-8 bg-white text-primary">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Nome do Lead</Label>
                      <Input value={editData.nome_completo} onChange={e => setEditData({ ...editData, nome_completo: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Notas do Administrador</Label>
                      <Textarea
                        className="min-h-[150px] rounded-2xl"
                        value={editData.notes || ""}
                        onChange={e => setEditData({ ...editData, notes: e.target.value })}
                        placeholder="Adicione observações sobre o atendimento deste lead..."
                      />
                    </div>
                    <div className="flex items-center gap-2 py-4">
                      <input
                        type="checkbox"
                        id="converted"
                        checked={editData.converted}
                        onChange={e => setEditData({ ...editData, converted: e.target.checked })}
                        className="w-5 h-5 accent-accent"
                      />
                      <Label htmlFor="converted" className="font-bold cursor-pointer">Marcar como Convertido</Label>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      <Button variant="hero" className="flex-1 h-14 rounded-2xl bg-orange-600 shadow-xl shadow-orange-600/20" onClick={() => handleUpdateLead(selectedLead.id, editData)}>Salvar Notas</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">E-mail</p>
                        <p className="font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-orange-600" /> {selectedLead.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">WhatsApp</p>
                        <button
                          onClick={() => openWhatsApp(selectedLead.telefone)}
                          className="font-bold hover:text-green-600 transition-colors flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4 text-green-500" />
                          {selectedLead.telefone}
                        </button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</p>
                        <Badge className={`${selectedLead.converted ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"} border-none uppercase text-[10px] px-3`}>
                          {selectedLead.converted ? "Convertido" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Notas Internas
                      </h4>
                      <p className="text-sm italic leading-relaxed text-muted-foreground">
                        {selectedLead.notes || "Nenhuma observação adicionada."}
                      </p>
                    </div>
                    <div className="pt-6 flex gap-4">
                      <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsLeadDialogOpen(false)}>Fechar</Button>
                      <Button
                        variant="hero"
                        className="flex-1 h-14 rounded-2xl bg-orange-600 shadow-xl shadow-orange-600/20 font-bold"
                        onClick={() => {
                          setEditData({ ...selectedLead });
                          setIsEditing(true);
                        }}
                      >
                        Editar Lead
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Criação Manual */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white text-primary">
          <div className="bg-primary p-8 text-white relative">
            <DialogTitle className="text-2xl font-brand font-black">
              {createType === "subscriber" ? "Novo Associado" :
                createType === "lead" ? "Novo Lead" :
                  createType === "partner" ? "Novo Parceiro" : "Nova Oferta Global"}
            </DialogTitle>
            <DialogDescription className="text-white/70">Inclusão manual de registro no sistema</DialogDescription>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {createType === "subscriber" && (
                <>
                  <div className="space-y-2"><Label>Nome Completo</Label><Input value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>E-mail</Label><Input value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>CPF</Label><Input value={formData.cpf || ""} onChange={e => setFormData({ ...formData, cpf: e.target.value })} /></div>
                  <div className="space-y-2"><Label>WhatsApp</Label><Input value={formData.phone || ""} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                  <div className="md:col-span-2 space-y-2"><Label>Endereço</Label><Input value={formData.address || ""} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                </>
              )}

              {createType === "lead" && (
                <>
                  <div className="space-y-2"><Label>Nome Completo</Label><Input value={formData.nome_completo || ""} onChange={e => setFormData({ ...formData, nome_completo: e.target.value })} /></div>
                  <div className="space-y-2"><Label>E-mail</Label><Input value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Telefone</Label><Input value={formData.telefone || ""} onChange={e => setFormData({ ...formData, telefone: e.target.value })} /></div>
                  <div className="space-y-2">
                    <Label>Atribuir ao Vendedor (Opcional)</Label>
                    <Select value={formData.seller_id} onValueChange={v => setFormData({ ...formData, seller_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione um vendedor" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {sellers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2"><Label>Notas</Label><Textarea value={formData.notes || ""} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>
                </>
              )}

              {createType === "seller" && (
                <>
                  <div className="space-y-2"><Label>Nome do Vendedor</Label><Input placeholder="Ex: João Silva" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>E-mail Profissional</Label><Input placeholder="joao@clubeaquitem.com" value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>WhatsApp</Label><Input placeholder="21999999999" value={formData.phone || ""} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Senha de Acesso</Label><Input type="password" placeholder="Mínimo 6 caracteres" value={formData.password || ""} onChange={e => setFormData({ ...formData, password: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Slug do Link (Opcional)</Label><Input placeholder="joaosilva" value={formData.slug || ""} onChange={e => setFormData({ ...formData, slug: generateSlug(e.target.value) })} /></div>
                  <div className="md:col-span-2 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <p className="text-xs text-purple-700 leading-relaxed font-medium">
                      O sistema gerará automaticamente um link personalizado para este vendedor.
                      Cada venda ou lead originado deste link será atribuído a ele para fins de comissionamento e relatórios.
                    </p>
                  </div>
                </>
              )}

              {createType === "partner" && (
                <>
                  <div className="space-y-2"><Label>Estabelecimento</Label><Input value={formData.nome_estabelecimento || ""} onChange={e => setFormData({ ...formData, nome_estabelecimento: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Responsável</Label><Input value={formData.responsavel || ""} onChange={e => setFormData({ ...formData, responsavel: e.target.value })} /></div>
                  <div className="space-y-2"><Label>E-mail</Label><Input value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Telefone</Label><Input value={formData.telefone || ""} onChange={e => setFormData({ ...formData, telefone: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Senha Inicial</Label><Input type="password" placeholder="Mínimo 6 caracteres" value={formData.password || ""} onChange={e => setFormData({ ...formData, password: e.target.value })} /></div>
                  <div className="space-y-2"><Label>CNPJ</Label><Input value={formData.cnpj || ""} onChange={e => setFormData({ ...formData, cnpj: e.target.value })} /></div>
                  <div className="md:col-span-2 space-y-2"><Label>Endereço</Label><Input value={formData.endereco || ""} onChange={e => setFormData({ ...formData, endereco: e.target.value })} /></div>
                </>
              )}

              {createType === "discount" && (
                <>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Parceiro</Label>
                    <Select value={formData.partner_id} onValueChange={v => setFormData({ ...formData, partner_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione o parceiro" /></SelectTrigger>
                      <SelectContent>
                        {partners.map(p => (<SelectItem key={p.id} value={p.id}>{p.nome_estabelecimento || (p as any).estabelecimento}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Título</Label><Input value={formData.titulo || ""} onChange={e => setFormData({ ...formData, titulo: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Desconto (%)</Label><Input type="number" value={formData.percentual_desconto || ""} onChange={e => setFormData({ ...formData, percentual_desconto: e.target.value })} /></div>
                  <div className="md:col-span-2 space-y-2"><Label>Descrição</Label><Textarea value={formData.descricao || ""} onChange={e => setFormData({ ...formData, descricao: e.target.value })} /></div>
                </>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
              <Button variant="hero" className="flex-1 h-12 rounded-xl" onClick={() => {
                if (createType === "subscriber") handleCreateSubscriber(formData);
                else if (createType === "lead") handleCreateLead(formData);
                else if (createType === "partner") handleCreatePartner(formData);
                else if (createType === "discount") handleCreateGlobalDiscount(formData);
                else if (createType === "seller") handleCreateSeller(formData);
              }}>
                Cadastrar {
                  createType === "subscriber" ? "Associado" :
                    createType === "lead" ? "Lead" :
                      createType === "partner" ? "Parceiro" :
                        createType === "seller" ? "Vendedor" : "Oferta"
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Desconto Global */}
      <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white text-primary">
          {selectedDiscount && (
            <>
              <div className="bg-accent p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Tag size={100} />
                </div>
                <DialogTitle className="text-2xl font-brand font-black relative z-10">Editar Oferta do Parceiro</DialogTitle>
                <DialogDescription className="text-white/70 relative z-10">Ajuste os detalhes da promoção globalmente</DialogDescription>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título da Promoção</Label>
                    <Input value={editData.titulo} onChange={e => setEditData({ ...editData, titulo: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Desconto (%)</Label>
                      <Input type="number" value={editData.percentual_desconto} onChange={e => setEditData({ ...editData, percentual_desconto: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Status de Exibição</Label>
                      <Select value={editData.ativo ? "true" : "false"} onValueChange={v => setEditData({ ...editData, ativo: v === "true" })}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Ativo na Vitrine</SelectItem>
                          <SelectItem value="false">Pausado / Oculto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Código Exclusivo (Opcional)</Label>
                    <Input
                      placeholder="EX: CLUBE10OFF"
                      value={editData.codigo_cupom || ""}
                      onChange={e => setEditData({ ...editData, codigo_cupom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Validade da Promoção</Label>
                    <Input
                      type="date"
                      value={editData.validade_fim ? editData.validade_fim.split('T')[0] : ""}
                      onChange={e => setEditData({ ...editData, validade_fim: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Regras / Descrição</Label>
                    <Textarea
                      className="min-h-[120px] rounded-2xl"
                      value={editData.descricao}
                      onChange={e => setEditData({ ...editData, descricao: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsDiscountDialogOpen(false)}>Cancelar</Button>
                  <Button
                    variant="hero"
                    className="flex-1 h-14 rounded-2xl shadow-xl shadow-accent/20"
                    onClick={async () => {
                      await handleUpdateDiscount(selectedDiscount.id, editData);
                      setIsDiscountDialogOpen(false);
                      fetchData();
                    }}
                  >
                    Salvar Oferta
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação Master (Substitui confirm do navegador) */}
      <Dialog open={confirmConfig.isOpen} onOpenChange={(open) => !open && setConfirmConfig(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white text-primary">
          <div className="bg-red-500 p-8 text-white relative text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-sm">
              <Trash className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-brand font-black">
              {confirmConfig.title}
            </DialogTitle>
            <DialogDescription className="text-white/80 mt-2">
              {confirmConfig.description}
            </DialogDescription>
          </div>

          <div className="p-8 flex gap-4">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl border-border hover:bg-muted font-bold"
              onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20"
              onClick={confirmConfig.onConfirm}
            >
              Sim, Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />

      {/* JSON Viewer Dialog */}
      <Dialog open={isJSONDialogOpen} onOpenChange={setIsJSONDialogOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white text-primary">
          {selectedLog && (
            <>
              <div className="bg-[#009EE3] p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Zap size={100} />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                    <Zap className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-brand font-black">Detalhes do Evento MP</DialogTitle>
                    <DialogDescription className="text-white/70">ID Externo: {selectedLog.payment_id}</DialogDescription>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-muted/30 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Status</p>
                    {getStatusBadge(selectedLog.status)}
                  </div>
                  <div className="bg-muted/30 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Ação</p>
                    <p className="text-xs font-bold truncate">{selectedLog.action || "payment.updated"}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-2xl lg:col-span-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Referência Externa</p>
                    <p className="text-xs font-mono font-bold truncate">{selectedLog.external_reference || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Payload Original (JSON)
                  </h4>
                  <div className="bg-[#1e1e1e] p-6 rounded-2xl overflow-hidden relative group">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar font-mono text-[11px] leading-relaxed text-[#9CDCF0]">
                      <pre>{JSON.stringify(selectedLog.payload, null, 2)}</pre>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-white/50 hover:text-white"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedLog.payload, null, 2));
                        toast({ title: "Copiado!", description: "Dados JSON copiados para a área de transferência." });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Análise do Processamento
                  </h4>
                  <div className="space-y-4 text-sm">
                    <div className="p-4 bg-white rounded-xl border border-primary/10">
                      <p className="font-bold text-primary mb-1">Resumo do Resultado:</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedLog.status === 'approved' ? (
                          "✅ Pagamento Aprovado: O acesso do associado foi liberado e o sistema de assinatura (Assinafy) foi acionado para envio dos documentos."
                        ) : selectedLog.status === 'pending' || selectedLog.status === 'in_process' ? (
                          "⏳ Pagamento Pendente: O associado iniciou o pagamento (PIX ou Boleto). O sistema aguarda a compensação do Mercado Pago para liberar o acesso."
                        ) : selectedLog.status === 'rejected' ? (
                          "❌ Pagamento Rejeitado: A transação foi negada pelo banco ou operadora de cartão. O associado precisará tentar novamente."
                        ) : (
                          "ℹ️ Evento Recebido: O sistema processou a atualização de status (" + selectedLog.status + ") com sucesso."
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="font-bold text-[12px]">Comunicação MP</p>
                          <p className="text-[11px] text-muted-foreground">Notificação recebida e validada.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="font-bold text-[12px]">Registro de Log</p>
                          <p className="text-[11px] text-muted-foreground">Log gerado para auditoria em {new Date(selectedLog.created_at).toLocaleTimeString('pt-BR')}.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-muted/20 border-t flex justify-end">
                <Button variant="hero" onClick={() => setIsJSONDialogOpen(false)} className="rounded-xl h-11 px-8">
                  Fechar Visualização
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default Admin;
