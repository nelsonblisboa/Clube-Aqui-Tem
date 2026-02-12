import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, RefreshCw, Save, FileText, Key, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

interface AssinafySettings {
    id: string;
    account_id: string;
    api_key: string;
    account_id_subscriber?: string;
    account_id_partner?: string;
    account_id_seller?: string;
    template_id_subscriber: string;
    template_id_partner: string;
    template_id_seller: string;
    evolution_api_url?: string;
    evolution_api_key?: string;
    evolution_instance?: string;
}

interface AssinafyManagerProps {
    settings: AssinafySettings | null;
    onUpdate: () => void;
}

export default function AssinafyManager({ settings, onUpdate }: AssinafyManagerProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<AssinafySettings>>(settings || {
        account_id: "",
        api_key: "",
        account_id_subscriber: "",
        account_id_partner: "",
        account_id_seller: "",
        template_id_subscriber: "",
        template_id_partner: "",
        template_id_seller: "",
        evolution_api_url: "",
        evolution_api_key: "",
        evolution_instance: "default",
    });

    const handleSave = async () => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('assinafy_settings' as any)
                .upsert({
                    id: settings?.id,
                    ...formData
                });

            if (error) throw error;
            toast({ title: "Configurações salvas!", description: "As credenciais foram atualizadas com sucesso." });
            onUpdate();
        } catch (error: any) {
            toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                <CardHeader className="bg-primary/5 p-8 border-b border-border">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-brand font-bold text-primary">Configurações de Assinatura e WhatsApp</CardTitle>
                            <CardDescription>Gerencie as credenciais da Assinafy e Evolution API para notificações automatizadas.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-10">
                            {/* Assinafy API section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-primary border-b pb-2">
                                    <Key className="w-5 h-5" /> Assinafy API
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="account_id">Workspace Account ID</Label>
                                        <Input
                                            id="account_id"
                                            value={formData.account_id}
                                            onChange={e => setFormData({ ...formData, account_id: e.target.value })}
                                            placeholder="Ex: 615601fab04c0a31"
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="api_key">API Key (X-Api-Key)</Label>
                                        <Input
                                            id="api_key"
                                            type="password"
                                            value={formData.api_key}
                                            onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                                            placeholder="Sua chave de API secreta"
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Evolution API section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-[#25D366] border-b pb-2">
                                    <Shield className="w-5 h-5" /> WhatsApp (Evolution API)
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="evo_url">Instância URL</Label>
                                        <Input
                                            id="evo_url"
                                            value={formData.evolution_api_url}
                                            onChange={e => setFormData({ ...formData, evolution_api_url: e.target.value })}
                                            placeholder="https://api.evolution.com"
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="evo_key">API Key (Apikey)</Label>
                                        <Input
                                            id="evo_key"
                                            type="password"
                                            value={formData.evolution_api_key}
                                            onChange={e => setFormData({ ...formData, evolution_api_key: e.target.value })}
                                            placeholder="Sua chave de API da Evolution"
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="evo_instance">Nome da Instância</Label>
                                        <Input
                                            id="evo_instance"
                                            value={formData.evolution_instance}
                                            onChange={e => setFormData({ ...formData, evolution_instance: e.target.value })}
                                            placeholder="Ex: default"
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-primary border-b pb-2">
                                <FileText className="w-5 h-5" /> Templates & Contas (Assinafy)
                            </h3>
                            <div className="space-y-8">
                                {/* Associados */}
                                <div className="p-4 bg-blue-50/50 rounded-2xl space-y-4 border border-blue-100">
                                    <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider">Fluxo de Associados</h4>
                                    <div className="space-y-2">
                                        <Label htmlFor="acc_sub">Workspace Account ID (Associados)</Label>
                                        <Input
                                            id="acc_sub"
                                            value={formData.account_id_subscriber}
                                            onChange={e => setFormData({ ...formData, account_id_subscriber: e.target.value })}
                                            placeholder="Se vazio, usa o ID Global"
                                            className="rounded-xl h-10 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="template_sub">ID do Modelo (Associados)</Label>
                                        <Input
                                            id="template_sub"
                                            value={formData.template_id_subscriber}
                                            onChange={e => setFormData({ ...formData, template_id_subscriber: e.target.value })}
                                            placeholder="ID do template no Assinafy"
                                            className="rounded-xl h-10 bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Parceiros */}
                                <div className="p-4 bg-indigo-50/50 rounded-2xl space-y-4 border border-indigo-100">
                                    <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wider">Fluxo de Parceiros</h4>
                                    <div className="space-y-2">
                                        <Label htmlFor="acc_part">Workspace Account ID (Parceiros)</Label>
                                        <Input
                                            id="acc_part"
                                            value={formData.account_id_partner}
                                            onChange={e => setFormData({ ...formData, account_id_partner: e.target.value })}
                                            placeholder="Se vazio, usa o ID Global"
                                            className="rounded-xl h-10 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="template_part">ID do Modelo (Parceiros)</Label>
                                        <Input
                                            id="template_part"
                                            value={formData.template_id_partner}
                                            onChange={e => setFormData({ ...formData, template_id_partner: e.target.value })}
                                            placeholder="ID do template no Assinafy"
                                            className="rounded-xl h-10 bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Vendedores */}
                                <div className="p-4 bg-purple-50/50 rounded-2xl space-y-4 border border-purple-100">
                                    <h4 className="text-sm font-bold text-purple-800 uppercase tracking-wider">Fluxo de Vendedores</h4>
                                    <div className="space-y-2">
                                        <Label htmlFor="acc_sell">Workspace Account ID (Vendedores)</Label>
                                        <Input
                                            id="acc_sell"
                                            value={formData.account_id_seller}
                                            onChange={e => setFormData({ ...formData, account_id_seller: e.target.value })}
                                            placeholder="Se vazio, usa o ID Global"
                                            className="rounded-xl h-10 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="template_sell">ID do Modelo (Vendedores)</Label>
                                        <Input
                                            id="template_sell"
                                            value={formData.template_id_seller}
                                            onChange={e => setFormData({ ...formData, template_id_seller: e.target.value })}
                                            placeholder="ID do template no Assinafy"
                                            className="rounded-xl h-10 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-primary text-white hover:bg-primary/90 h-14 px-10 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Salvar Configurações
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-border">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <User className="w-5 h-5 text-accent" /> Sobre a Integração
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 text-muted-foreground space-y-4">
                    <p>
                        Esta integração automatiza a coleta de assinaturas digitais com validade jurídica e notificações via <strong>WhatsApp</strong>.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Os contratos são gerados automaticamente a partir dos templates da Assinafy.</li>
                        <li>Notificações são enviadas via Evolution API com links de validação seguros.</li>
                        <li>Quando um novo cadastro é aprovado, o sistema envia o link para o WhatsApp do usuário.</li>
                        <li>O status é atualizado em tempo real via Webhooks configurados na conta Assinafy.</li>
                        <li>URL do Webhook: <code className="bg-muted px-2 py-1 rounded text-red-500">https://wmivufnnbsvmeyjapjzx.supabase.co/functions/v1/assinafy-webhook</code></li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
