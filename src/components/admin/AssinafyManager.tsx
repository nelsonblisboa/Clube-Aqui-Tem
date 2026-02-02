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
    template_id_subscriber: string;
    template_id_partner: string;
    template_id_seller: string;
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
        template_id_subscriber: "",
        template_id_partner: "",
        template_id_seller: "",
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
            toast({ title: "Configurações salvas!", description: "As credenciais da Assinafy foram atualizadas." });
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
                            <CardTitle className="text-2xl font-brand font-bold text-primary">Configurações Assinafy</CardTitle>
                            <CardDescription>Gerencie as credenciais e modelos de contrato para assinaturas digitais.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                                <Key className="w-5 h-5" /> Acesso à API
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

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                                <FileText className="w-5 h-5" /> IDs dos Templates (Modelos)
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="template_sub">Modelo para Associados</Label>
                                    <Input
                                        id="template_sub"
                                        value={formData.template_id_subscriber}
                                        onChange={e => setFormData({ ...formData, template_id_subscriber: e.target.value })}
                                        placeholder="ID do template no Assinafy"
                                        className="rounded-xl h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="template_part">Modelo para Parceiros</Label>
                                    <Input
                                        id="template_part"
                                        value={formData.template_id_partner}
                                        onChange={e => setFormData({ ...formData, template_id_partner: e.target.value })}
                                        placeholder="ID do template no Assinafy"
                                        className="rounded-xl h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="template_sell">Modelo para Vendedores</Label>
                                    <Input
                                        id="template_sell"
                                        value={formData.template_id_seller}
                                        onChange={e => setFormData({ ...formData, template_id_seller: e.target.value })}
                                        placeholder="ID do template no Assinafy"
                                        className="rounded-xl h-12"
                                    />
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
                        Esta integração automatiza a coleta de assinaturas digitais com validade jurídica via <strong>Assinafy</strong>.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Os contratos são gerados automaticamente a partir dos templates configurados acima.</li>
                        <li>Quando um novo associado, parceiro ou vendedor é cadastrado, uma solicitação de assinatura é enviada por e-mail.</li>
                        <li>O status é atualizado em tempo real via Webhooks configurados na conta Assinafy.</li>
                        <li>URL do Webhook para configurar na Assinafy: <code className="bg-muted px-2 py-1 rounded text-red-500">https://vossa-url.supabase.co/functions/v1/assinafy-webhook</code></li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
