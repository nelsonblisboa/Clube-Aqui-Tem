# 🏪 Sistema de Parceiros - Clube Aqui Tem

## ✅ Status da Implementação

| Funcionalidade | Status |
|---------------|--------|
| Login de Parceiros | ✅ Funcionando |
| Dashboard | ✅ Implementado |
| Cadastro de Parceiros | ✅ Formulário pronto |
| Gestão de Descontos | ✅ Interface criada |
| Perfil do Parceiro | ✅ Implementado |
| Integração Supabase | ✅ Configurada |
| Autenticação SHA-256 | ✅ Funcionando |

---

## 🚀 Início Rápido

### 1. Credenciais de Teste
```
Email: parceiro@teste.com
Senha: parceiro123
```

### 2. URLs Importantes
- **Login**: http://localhost:8080/login-parceiro
- **Dashboard**: http://localhost:8080/dashboard-parceiro
- **Cadastro**: http://localhost:8080/seja-parceiro

### 3. Executar o Projeto
```bash
npm run dev
```

---

## 📁 Arquivos Importantes

### Documentação
- `SISTEMA_PARCEIROS_CREDENCIAIS.md` - Credenciais e guia completo
- `SISTEMA_PARCEIROS.md` - Documentação técnica original
- `SISTEMA_PARCEIROS_COMPLETO.md` - Documentação detalhada

### SQL
- `supabase/migrations/create_partners_system.sql` - Criação das tabelas
- `supabase/template_gerenciar_parceiros.sql` - Templates para gerenciar parceiros

### Código
- `src/pages/LoginParceiro.tsx` - Página de login
- `src/pages/DashboardParceiro.tsx` - Dashboard principal
- `src/pages/SejaParceiro.tsx` - Formulário de cadastro

---

## 🔑 Como Adicionar Novos Parceiros

### Opção 1: Via SQL
1. Gere o hash SHA-256 da senha em: https://emn178.github.io/online-tools/sha256.html
2. Use o template em `supabase/template_gerenciar_parceiros.sql`

### Opção 2: Via Formulário
1. Acesse: http://localhost:8080/seja-parceiro
2. Preencha o formulário
3. No Supabase, altere o status de 'pending' para 'active'

---

## 🛠️ Supabase - Comandos Úteis

### Verificar Parceiros
```sql
SELECT email, nome_estabelecimento, status FROM partner_accounts;
```

### Ativar Parceiro
```sql
UPDATE partner_accounts SET status = 'active' WHERE email = 'email@parceiro.com';
```

### Resetar Senha
```sql
UPDATE partner_accounts 
SET password_hash = 'NOVO_HASH_SHA256' 
WHERE email = 'email@parceiro.com';
```

---

## 📞 Suporte
**Email**: clubeaquitem.comercial@gmail.com

---

## 🎯 Próximas Funcionalidades
- [ ] Sistema de recuperação de senha via email
- [ ] Upload de logo do estabelecimento
- [ ] Relatórios de descontos utilizados
- [ ] Notificações push
- [ ] Dashboard administrativo

---

**Versão**: 1.0.0  
**Última atualização**: 23/01/2026
