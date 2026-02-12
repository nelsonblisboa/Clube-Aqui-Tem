import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserOption {
    id: string;
    label: string;
    phone: string;
    name: string;
}

export default function TesteAssinatura() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // State for selection
    const [userType, setUserType] = useState("subscriber");
    const [users, setUsers] = useState<UserOption[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");

    // Form fields (controlled)
    const [signerName, setSignerName] = useState("");
    const [signerPhone, setSignerPhone] = useState("");

    useEffect(() => {
        fetchUsers();
    }, [userType]);

    const fetchUsers = async () => {
        setUsers([]);
        setSelectedUser("");
        setSignerName("");
        setSignerPhone("");

        let query;

        // Map types to tables and columns
        if (userType === "subscriber") {
            query = supabase.from("subscribers").select("id, name, phone").limit(50);
        } else if (userType === "partner") {
            query = supabase.from("partner_accounts").select("id, responsavel, telefone").limit(50);
        } else if (userType === "seller") {
            query = supabase.from("sellers").select("id, name, phone").limit(50);
        }

        if (!query) return;

        const { data, error } = await query;
        if (error) {
            console.error("Erro ao buscar usuários:", error);
            toast.error("Erro ao carregar lista de usuários. Verifique o console.");
            return;
        }

        if (data) {
            const formattedUsers = data.map((u: any) => {
                // Normalize fields based on table
                const name = u.name || u.responsavel || "Sem Nome";
                const phone = u.phone || u.telefone || "";
                return {
                    id: u.id,
                    label: `${name} (${phone || 'Sem Telefone'})`,
                    name,
                    phone
                };
            });
            setUsers(formattedUsers);
        }
    };

    const handleUserSelect = (userId: string) => {
        setSelectedUser(userId);
        const user = users.find(u => u.id === userId);
        if (user) {
            setSignerName(user.name);
            setSignerPhone(user.phone);
        } else {
            setSignerName("");
            setSignerPhone("");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Selecione um arquivo PDF");
            return;
        }

        if (!selectedUser) {
            toast.error("Selecione um usuário da lista");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", selectedUser);
        formData.append("userType", userType);
        formData.append("signerName", signerName);
        formData.append("signerPhone", signerPhone);

        try {
            const response = await fetch("/api/signatures/create", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setResult(data);
                toast.success("Solicitação criada com sucesso!");
            } else {
                toast.error("Erro: " + data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro na requisição");
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!selectedUser) return toast.error("Preencha o ID (Selecione o usuário)");
        if (!signerPhone) return toast.error("Telefone obrigatório");

        try {
            const res = await fetch("/api/signatures/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: selectedUser, userType, phone: signerPhone })
            });
            const data = await res.json();
            if (res.ok) toast.success(data.message);
            else toast.error(data.error);
        } catch (e) {
            toast.error("Erro ao enviar OTP");
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Teste de Fluxo de Assinatura (Dev)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Tipo de Usuário</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                        >
                            <option value="subscriber">Associado (subscriber)</option>
                            <option value="partner">Parceiro (partner_accounts)</option>
                            <option value="seller">Vendedor (sellers)</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Selecione o Usuário</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedUser}
                            onChange={(e) => handleUserSelect(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>ID do Usuário (UUID)</Label>
                        <Input value={selectedUser} readOnly className="bg-gray-100" />
                    </div>

                    <div className="grid gap-2">
                        <Label>Nome do Signatário</Label>
                        <Input
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                            placeholder="Nome Completo"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>WhatsApp (Com DDD)</Label>
                        <Input
                            value={signerPhone}
                            onChange={(e) => setSignerPhone(e.target.value)}
                            placeholder="5511999999999"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Arquivo PDF</Label>
                        <Input type="file" accept=".pdf" onChange={handleFileChange} />
                    </div>

                    <Button onClick={handleUpload} disabled={loading} className="w-full">
                        {loading ? "Enviando para Assinafy..." : "1. Criar Solicitação (Upload)"}
                    </Button>

                    <div className="border-t pt-4">
                        <Label className="block mb-2">Passo 2: Enviar OTP</Label>
                        <Button variant="secondary" onClick={handleSendOtp} className="w-full">
                            2. Enviar Token via WhatsApp (Evolution API)
                        </Button>
                    </div>

                    {result && (
                        <div className="mt-4 p-4 bg-slate-100 rounded text-xs overflow-auto">
                            <p className="font-bold mb-2">Resposta da API:</p>
                            <pre>{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
