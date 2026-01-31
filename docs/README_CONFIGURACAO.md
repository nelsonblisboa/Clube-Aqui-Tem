# Configuração do Projeto Clube Aqui Tem

## ⚠️ Configurações Obrigatórias

### 1. Variáveis de Ambiente do Supabase Edge Functions

Para que o sistema de pagamento funcione, você precisa configurar as seguintes variáveis de ambiente nas Edge Functions do Supabase:

#### Como configurar:

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **Edge Functions** > **Secrets**
4. Adicione as seguintes variáveis:

```bash
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_aqui
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

#### Onde obter o token do Mercado Pago:

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Faça login na sua conta
3. Vá em **Suas integrações** > **Credenciais**
4. Copie o **Access Token** (use o de produção quando for publicar)

⚠️ **IMPORTANTE**: 
- Para testes, use o **Access Token de Teste**
- Para produção, use o **Access Token de Produção**
- NUNCA compartilhe suas credenciais publicamente

---

## 🔧 Correções de Segurança Necessárias

### Políticas RLS do Supabase

Execute os seguintes comandos SQL no editor SQL do Supabase para corrigir as políticas de segurança:

```sql
-- 1. Remover políticas inseguras
DROP POLICY IF EXISTS "Subscribers can view own data by CPF" ON public.subscribers;
DROP POLICY IF EXISTS "Allow password update on first access" ON public.subscribers;

-- 2. Adicionar constraint única no CPF
ALTER TABLE public.subscribers 
ADD CONSTRAINT IF NOT EXISTS subscribers_cpf_unique UNIQUE (cpf);

-- 3. Criar índice para external_reference
CREATE INDEX IF NOT EXISTS idx_subscribers_external_reference 
ON public.subscribers(external_reference);

-- 4. Criar política segura para service role
CREATE POLICY "Service role can manage subscribers"
ON public.subscribers
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- 5. Permitir que usuários autenticados vejam apenas seus próprios dados
CREATE POLICY "Users can view own subscriber data"
ON public.subscribers
FOR SELECT
USING (auth.uid()::text = id::text);
```

---

## 🚀 Iniciar o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente locais
# Criar arquivo .env na raiz do projeto
cp .env.example .env

# 3. Editar .env com suas credenciais
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

---

## ✅ Verificar Configuração

Para verificar se tudo está configurado corretamente:

1. Acesse http://localhost:8080
2. Clique em "Quero ser Associado"
3. Preencha o formulário
4. Clique em "Pagamento"

**Resultado esperado**: Você deve ser redirecionado para a página de pagamento do Mercado Pago.

**Se aparecer erro**: Verifique se todas as variáveis de ambiente foram configuradas corretamente no Supabase.

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs das Edge Functions no Supabase
2. Verifique o console do navegador (F12)
3. Confirme que todas as variáveis de ambiente estão configuradas
4. Verifique se o Access Token do Mercado Pago é válido

---

## 🔐 Segurança

- ✅ Nunca commite o arquivo `.env` no Git
- ✅ Use tokens de teste durante o desenvolvimento
- ✅ Rotacione as credenciais periodicamente
- ✅ Mantenha as políticas RLS atualizadas
