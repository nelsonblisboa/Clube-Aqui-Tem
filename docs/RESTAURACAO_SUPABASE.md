# Restauração de Projeto Supabase Pausado (90+ dias)

## 📋 Situação Atual

Seu projeto Supabase está pausado há mais de 90 dias e **não pode ser reativado diretamente**.

**Projeto Identificado**:
- Nome: douglas288@gmail.com's Project
- ID: `csgrmsjgbjfldktukgnb`
- Organização: Clube Aqui tem
- Status: Pausado há 90+ dias

---

## 🔄 Processo de Restauração

### Opção 1: Fazer Download do Backup (Recomendado)

#### Passo 1: Acessar o Projeto Pausado

1. Acesse: https://app.supabase.com
2. Faça login
3. Vá para a organização "Clube Aqui tem"
4. Clique no projeto pausado

#### Passo 2: Baixar Backups

No painel do projeto pausado, você verá a opção:

**"Download backups"** ou **"Export data"**

Clique e baixe:
- ✅ **Database backup** (arquivo .sql)
- ✅ **Storage files** (se houver arquivos)

#### Passo 3: Criar Novo Projeto

1. No dashboard, clique em **"New project"**
2. Escolha:
   - **Organization**: Clube Aqui tem
   - **Name**: Clube Aqui Tem (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte
   - **Region**: South America (São Paulo) - para melhor performance
   - **Pricing Plan**: Free (ou Pro se preferir)
3. Clique em **"Create new project"**
4. Aguarde 2-3 minutos para o projeto ser criado

#### Passo 4: Restaurar o Backup

##### 4.1. Obter String de Conexão

No novo projeto:
1. Vá em **Settings** > **Database**
2. Copie a **Connection string** (modo URI)
3. Substitua `[YOUR-PASSWORD]` pela senha que você criou

Exemplo:
```
postgresql://postgres:[SUA-SENHA]@db.xxxxx.supabase.co:5432/postgres
```

##### 4.2. Restaurar via psql (Linha de Comando)

**No Windows (PowerShell)**:

```powershell
# Instalar PostgreSQL client (se não tiver)
# Download: https://www.postgresql.org/download/windows/

# Restaurar o backup
psql "postgresql://postgres:[SUA-SENHA]@db.xxxxx.supabase.co:5432/postgres" < caminho\para\backup.sql
```

**Ou usar o SQL Editor do Supabase**:

1. No novo projeto, vá em **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo backup.sql em um editor de texto
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em **Run**

⚠️ **Atenção**: Backups grandes podem dar timeout no SQL Editor. Nesse caso, use psql.

#### Passo 5: Recriar Edge Functions

As Edge Functions não são incluídas no backup. Você precisa recriar:

1. No novo projeto, vá em **Edge Functions**
2. Para cada função, clique em **Deploy new function**
3. Use os arquivos do seu projeto local:

```bash
# No terminal, na pasta do projeto
cd c:\Users\Nelson\Downloads\clubeaquitem

# Deploy das functions
npx supabase functions deploy create-mercadopago-preference
npx supabase functions deploy mercadopago-webhook
npx supabase functions deploy member-auth
npx supabase functions deploy export-leads-to-sheets
```

#### Passo 6: Reconfigurar Variáveis de Ambiente

No novo projeto:
1. Vá em **Settings** > **Edge Functions** > **Secrets**
2. Adicione novamente:
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `SUPABASE_URL` (use a URL do novo projeto)
   - `SUPABASE_SERVICE_ROLE_KEY`

#### Passo 7: Atualizar Projeto Local

Atualize o arquivo `.env` local com as novas credenciais:

```env
VITE_SUPABASE_PROJECT_ID=novo_id_do_projeto
VITE_SUPABASE_PUBLISHABLE_KEY=nova_chave_publica
VITE_SUPABASE_URL=https://novo_id.supabase.co
```

---

### Opção 2: Criar Projeto do Zero

Se você não precisa dos dados antigos ou prefere começar limpo:

1. Crie um novo projeto (Passo 3 acima)
2. Execute as migrações SQL do projeto:

```bash
cd c:\Users\Nelson\Downloads\clubeaquitem

# Execute cada migration na ordem
# No SQL Editor do Supabase, execute os arquivos em:
# supabase/migrations/
```

3. Reconfigure tudo conforme o `README_CONFIGURACAO.md`

---

## ✅ Checklist Pós-Restauração

Após restaurar, verifique:

- [ ] Banco de dados restaurado com sucesso
- [ ] Tabelas existem: `partners`, `subscribers`, `leads`, `profiles`, `user_roles`
- [ ] Edge Functions deployadas
- [ ] Variáveis de ambiente configuradas
- [ ] Projeto local atualizado com novas credenciais
- [ ] Aplicação funcionando: `npm run dev`
- [ ] Teste de cadastro funcionando
- [ ] Integração Mercado Pago funcionando

---

## 🔐 Executar Correções de Segurança

Após restaurar, execute o script de segurança:

```sql
-- No SQL Editor do novo projeto
-- Cole e execute: supabase/migrations/fix_security_policies.sql
```

---

## 📊 Comparação de IDs

| Item | ID Antigo | ID Novo |
|------|-----------|---------|
| Projeto Pausado | `csgrmsjgbjfldktukgnb` | - |
| Projeto Mencionado | `wgfdedefbxljcpbcgbai` | Não encontrado |
| Novo Projeto | - | (será gerado) |

---

## ⚠️ Importante

1. **Não delete o projeto pausado** até confirmar que tudo foi restaurado
2. **Salve os backups** em local seguro
3. **Documente as novas credenciais**
4. **Configure prevenção de pausas** (veja walkthrough principal)

---

## 🆘 Precisa de Ajuda?

Se tiver dificuldades:
1. Verifique os logs de erro
2. Consulte: https://supabase.com/docs/guides/platform/migrating-within-supabase
3. Contate suporte: support@supabase.com

---

## 📝 Próximos Passos

1. ✅ Fazer download do backup do projeto pausado
2. ✅ Criar novo projeto Supabase
3. ✅ Restaurar backup no novo projeto
4. ✅ Redeployar Edge Functions
5. ✅ Reconfigurar variáveis de ambiente
6. ✅ Atualizar projeto local
7. ✅ Testar aplicação
8. ✅ Configurar prevenção de pausas futuras
