import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
    Building2, Users, Upload, DollarSign, Plus, Download,
    FileText, Loader2, Trash2, Edit2, Search, UserCog, Save, X
} from "lucide-react";
import * as XLSX from "xlsx";

interface Company {
    id: string;
    name: string;
    cnpj: string;
    address: string;
    phone: string;
    email: string;
    responsible_name: string;
    agreed_unit_value: number;
    status: 'active' | 'inactive';
    created_at: string;
}

interface CompaniesManagerProps {
    subscribers: any[];
    onUpdate: () => void;
}

export default function CompaniesManager({ subscribers, onUpdate }: CompaniesManagerProps) {
    const { toast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isManageEmployeesOpen, setIsManageEmployeesOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    // Employee Management State
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [editingEmployee, setEditingEmployee] = useState<any>(null);

    // Confirmation Dialog State
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { }
    });

    // Form Data (Company)
    const [formData, setFormData] = useState<Partial<Company>>({
        status: 'active',
        agreed_unit_value: 19.99
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('companies').select('*').order('name');
        if (!error) {
            setCompanies(data as Company[]);
        }
        setLoading(false);
    };

    const askConfirmation = (title: string, description: string, onConfirm: () => void) => {
        setConfirmConfig({
            isOpen: true,
            title,
            description,
            onConfirm: () => {
                onConfirm();
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleSaveCompany = async () => {
        try {
            if (!formData.name || !formData.cnpj) {
                toast({ title: "Dados incompletos", description: "Nome e CNPJ são obrigatórios.", variant: "destructive" });
                return;
            }

            const payload = {
                name: formData.name,
                cnpj: formData.cnpj,
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                responsible_name: formData.responsible_name,
                agreed_unit_value: Number(formData.agreed_unit_value),
                status: formData.status
            };

            if (isEditing && selectedCompany) {
                const { error } = await supabase.from('companies').update(payload).eq('id', selectedCompany.id);
                if (error) throw error;
                toast({ title: "Atualizado", description: "Empresa atualizada com sucesso." });
            } else {
                const { error } = await supabase.from('companies').insert([payload]);
                if (error) throw error;
                toast({ title: "Criado", description: "Empresa cadastrada com sucesso." });
            }

            fetchCompanies();
            setIsCreateOpen(false);
            setFormData({ status: 'active', agreed_unit_value: 19.99 });
            setIsEditing(false);
            setSelectedCompany(null);
        } catch (error: any) {
            toast({ title: "Erro", description: error.message || "Falha ao salvar empresa.", variant: "destructive" });
        }
    };

    const handleDeleteCompany = async (id: string) => {
        askConfirmation(
            "Excluir Empresa?",
            "Esta ação excluirá a empresa. Certifique-se de que não há pendências.",
            async () => {
                try {
                    const { error } = await supabase.from('companies').delete().eq('id', id);
                    if (error) throw error;
                    toast({ title: "Removido", description: "Empresa removida." });
                    fetchCompanies();
                } catch (error) {
                    toast({ title: "Erro", description: "Falha ao remover.", variant: "destructive" });
                }
            }
        );
    };

    const handleUpdateEmployee = async (employee: any) => {
        try {
            const { error } = await supabase.from('subscribers').update({
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                cpf: employee.cpf,
                birth_date: employee.birth_date
            }).eq('id', employee.id);

            if (error) throw error;

            toast({ title: "Sucesso", description: "Dados do associado atualizados." });
            setEditingEmployee(null);
            onUpdate(); // Refresh parent data (Admin.tsx fetch)
        } catch (error: any) {
            toast({ title: "Erro", description: "Falha ao atualizar associado.", variant: "destructive" });
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        askConfirmation(
            "Remover Associado?",
            "Esta ação removerá permanentemente este funcionário da lista de benefícios da empresa.",
            async () => {
                try {
                    const { error } = await supabase.from('subscribers').delete().eq('id', id);
                    if (error) throw error;
                    toast({ title: "Removido", description: "Associado removido com sucesso." });
                    onUpdate(); // Refresh parent data
                } catch (error) {
                    toast({ title: "Erro", description: "Falha ao remover associado.", variant: "destructive" });
                }
            }
        );
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedCompany) return;

        setImportLoading(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const bstr = event.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const subscribersToInsert: any[] = [];
                const seenCpfs = new Set();

                // Helper seguro para datas para evitar crash no new Date()
                const parseDateSafe = (val: any) => {
                    if (!val) return null;
                    try {
                        let date: Date | null = null;
                        if (typeof val === 'number') {
                            // Excel serial date bug fix: - (25567 + 2) is common for Unix epoch, but let's trust library usually handles, here we do manual
                            date = new Date((val - (25567 + 2)) * 86400 * 1000);
                        } else {
                            const str = String(val).trim();
                            if (str.includes('/')) {
                                // Assume DD/MM/YYYY
                                const parts = str.split('/');
                                if (parts.length === 3) date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                            } else {
                                date = new Date(str);
                            }
                        }

                        if (date && !isNaN(date.getTime())) {
                            return date.toISOString().split('T')[0];
                        }
                    } catch (e) {
                        // Silently fail invalid dates
                        return null;
                    }
                    return null;
                };

                data.forEach((row: any) => {
                    const cpfRaw = row['CPF'] || row['cpf'];
                    if (!cpfRaw) return;

                    const cpf = String(cpfRaw).replace(/\D/g, '');
                    const rawDate = row['Data de Nascimento'] || row['Nascimento'] || row['birth_date']; // Supports 'Data de Nascimento' header
                    const birthDate = parseDateSafe(rawDate);

                    if (cpf && cpf.length >= 11 && !seenCpfs.has(cpf)) {
                        seenCpfs.add(cpf);
                        subscribersToInsert.push({
                            name: row['Nome Completo'] || row['Nome'] || row['name'] || `Associado ${cpf}`,
                            email: row['Email'] || row['email'] || null,
                            phone: row['Telefone'] || row['phone'] || null,
                            cpf: cpf,
                            birth_date: birthDate,
                            address: row['Endereço'] || row['address'] || '',
                            company_id: selectedCompany.id,
                            status: 'approved',
                            discount_applied: true,
                            created_at: new Date().toISOString()
                        });
                    }
                });

                if (subscribersToInsert.length === 0) throw new Error("Nenhum dado válido encontrado. Verifique se a coluna CPF existe.");

                const { error } = await supabase.from('subscribers').upsert(subscribersToInsert, { onConflict: 'cpf' });
                if (error) throw error;

                toast({ title: "Importação Concluída", description: `${subscribersToInsert.length} associados processados.` });
                onUpdate();
                setIsImportOpen(false);
            } catch (error: any) {
                console.error("Import Error:", error);
                toast({ title: "Erro na Importação", description: error.message || "Erro desconhecido.", variant: "destructive" });
            } finally {
                setImportLoading(false);
                if (e.target) e.target.value = ''; // Reset input
            }
        };

        reader.onerror = () => {
            toast({ title: "Erro de Leitura", description: "Falha ao ler o arquivo.", variant: "destructive" });
            setImportLoading(false);
        };

        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { "Nome Completo": "João Silva", "Email": "joao@empresa.com", "Telefone": "11999999999", "CPF": "12345678900", "Data de Nascimento": "01/01/1990", "Endereço": "Rua Exemplo, 123" }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Modelo");
        XLSX.writeFile(wb, "modelo_importacao_rh.xlsx");
    };

    const filteredCompanies = useMemo(() => {
        return companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.cnpj.includes(searchTerm));
    }, [companies, searchTerm]);

    const companyEmployees = useMemo(() => {
        if (!selectedCompany) return [];
        return subscribers
            .filter((s: any) => s.company_id === selectedCompany.id)
            .filter((s: any) =>
                (s.name || '').toLowerCase().includes(employeeSearch.toLowerCase()) ||
                (s.cpf || '').includes(employeeSearch)
            );
    }, [subscribers, selectedCompany, employeeSearch]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar empresa por nome ou CNPJ..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => {
                    setFormData({ status: 'active', agreed_unit_value: 19.99 });
                    setIsEditing(false);
                    setIsCreateOpen(true);
                }} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Nova Empresa B2B
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map(company => {
                    const employeeCount = subscribers.filter((s: any) => s.company_id === company.id).length;
                    const monthlyRevenue = employeeCount * Number(company.agreed_unit_value || 0);

                    return (
                        <Card key={company.id} className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-500 flex flex-col justify-between">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                            {company.name}
                                        </CardTitle>
                                        <CardDescription className="text-xs font-mono mt-1">{company.cnpj}</CardDescription>
                                    </div>
                                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                                        {company.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4 flex-grow">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground block uppercase font-bold">Vidas Ativas</span>
                                        <div className="flex items-center gap-2 text-2xl font-black text-slate-700">
                                            <Users className="w-5 h-5 text-slate-400" />
                                            {employeeCount}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground block uppercase font-bold">Faturamento</span>
                                        <div className="flex items-center gap-2 text-2xl font-black text-green-600">
                                            <DollarSign className="w-5 h-5 text-green-400" />
                                            {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            (R$ {Number(company.agreed_unit_value).toFixed(2)} / vida)
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-1">
                                    <p className="flex items-center gap-2 text-slate-600"><span className="font-bold">Resp:</span> {company.responsible_name || '-'}</p>
                                    <p className="flex items-center gap-2 text-slate-600"><span className="font-bold">Email:</span> {company.email || '-'}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2 border-t pt-4 bg-slate-50/50">
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => {
                                        setSelectedCompany(company);
                                        setIsManageEmployeesOpen(true);
                                    }}
                                >
                                    <UserCog className="w-4 h-4 mr-2" /> Gerenciar Vidas
                                </Button>
                                <div className="flex justify-between w-full gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 border-blue-200 hover:bg-blue-50 text-blue-700" onClick={() => {
                                        setFormData(company);
                                        setSelectedCompany(company);
                                        setIsEditing(true);
                                        setIsCreateOpen(true);
                                    }}>
                                        <Edit2 className="w-4 h-4 mr-2" /> Editar
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 border-green-200 hover:bg-green-50 text-green-700" onClick={() => {
                                        setSelectedCompany(company);
                                        setIsImportOpen(true);
                                    }}>
                                        <Upload className="w-4 h-4 mr-2" /> Importar
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteCompany(company.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Empresa' : 'Nova Empresa Parceira (B2B)'}</DialogTitle>
                        <DialogDescription>Cadastre os dados contratuais da empresa.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome da Empresa *</Label>
                            <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Razão Social" />
                        </div>
                        <div className="space-y-2">
                            <Label>CNPJ *</Label>
                            <Input value={formData.cnpj || ''} onChange={e => setFormData({ ...formData, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Responsável Cobrança</Label>
                            <Input value={formData.responsible_name || ''} onChange={e => setFormData({ ...formData, responsible_name: e.target.value })} placeholder="Nome completo" />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 0000-0000" />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Email Corporativo</Label>
                            <Input value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="financeiro@empresa.com" />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Endereço Completo</Label>
                            <Input value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Rua, Número, Bairro, Cidade - UF" />
                        </div>
                        <div className="space-y-2">
                            <Label>Valor Unitário (Acordo) *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                                <Input type="number" step="0.01" className="pl-9" value={formData.agreed_unit_value} onChange={e => setFormData({ ...formData, agreed_unit_value: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveCompany}>Salvar Empresa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Modal */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Importar Associados em Massa</DialogTitle>
                        <DialogDescription>
                            Importar funcionários para {selectedCompany?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300 text-center">
                            <Download className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                            <Button variant="outline" size="sm" onClick={downloadTemplate}>
                                Baixar Planilha Modelo (Inclui Nascimento)
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label>Selecione o arquivo Excel (.xlsx)</Label>
                            <Input type="file" accept=".xlsx, .xls" onChange={handleImportFile} disabled={importLoading} />
                        </div>
                    </div>

                    <DialogFooter>
                        {importLoading && <div className="flex items-center gap-2 text-sm text-blue-600"><Loader2 className="animate-spin w-4 h-4" /> Processando...</div>}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Employees Modal */}
            <Dialog open={isManageEmployeesOpen} onOpenChange={setIsManageEmployeesOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Gestão de Vidas - {selectedCompany?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Gerencie os funcionários vinculados a este contrato. Total de vidas: {companyEmployees.length}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4 flex-grow overflow-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar funcionário..."
                                className="pl-9"
                                value={employeeSearch}
                                onChange={e => setEmployeeSearch(e.target.value)}
                            />
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>CPF</TableHead>
                                        <TableHead>Nascimento</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {companyEmployees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                Nenhum funcionário encontrado. Você pode importar via planilha.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        companyEmployees.map((emp: any) => (
                                            <TableRow key={emp.id}>
                                                <TableCell>
                                                    {editingEmployee?.id === emp.id ? (
                                                        <Input
                                                            value={editingEmployee.name}
                                                            onChange={e => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                                                            className="h-8"
                                                        />
                                                    ) : (
                                                        <span className="font-medium">{emp.name}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {editingEmployee?.id === emp.id ? (
                                                        <Input
                                                            value={editingEmployee.cpf}
                                                            onChange={e => setEditingEmployee({ ...editingEmployee, cpf: e.target.value })}
                                                            className="h-8"
                                                        />
                                                    ) : (
                                                        <span className="font-mono text-xs">{emp.cpf}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {editingEmployee?.id === emp.id ? (
                                                        <Input
                                                            type="date"
                                                            value={editingEmployee.birth_date || ''}
                                                            onChange={e => setEditingEmployee({ ...editingEmployee, birth_date: e.target.value })}
                                                            className="h-8"
                                                        />
                                                    ) : (
                                                        <span className="text-sm">
                                                            {emp.birth_date ? new Date(emp.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {editingEmployee?.id === emp.id ? (
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdateEmployee(editingEmployee)}>
                                                                <Save className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => setEditingEmployee(null)}>
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingEmployee(emp)}>
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDeleteEmployee(emp.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmConfig.isOpen} onOpenChange={open => !open && setConfirmConfig({ ...confirmConfig, isOpen: false })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{confirmConfig.title}</DialogTitle>
                        <DialogDescription>{confirmConfig.description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmConfig.onConfirm}>Confirmar Exclusão</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
