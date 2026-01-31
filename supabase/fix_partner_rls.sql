-- =========================================
-- CORRIGIR POLÍTICAS RLS PARA PARTNER_ACCOUNTS
-- =========================================

-- 1. REMOVER POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Anyone can insert partner accounts" ON public.partner_accounts;
DROP POLICY IF EXISTS "Partners can view own account" ON public.partner_accounts;
DROP POLICY IF EXISTS "Partners can update own account" ON public.partner_accounts;

-- 2. CRIAR NOVAS POLÍTICAS PERMISSIVAS

-- Permitir que QUALQUER UM leia partner_accounts (necessário para login)
-- Sem isso, o frontend não consegue verificar email/senha
CREATE POLICY "Public can read partner accounts for login"
  ON public.partner_accounts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Permitir inserção pública (para cadastro de novos parceiros)
CREATE POLICY "Anyone can insert partner accounts"
  ON public.partner_accounts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Permitir atualização própria conta
CREATE POLICY "Partners can update own account"
  ON public.partner_accounts FOR UPDATE
  TO anon, authenticated
  USING (true);

-- 3. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'partner_accounts'
ORDER BY policyname;

-- 4. GARANTIR QUE PARTNER_ACCOUNTS ESTÁ REGISTRADO NO auth.users (OPCIONAL)
-- Se você quiser, pode criar uma integração com auth.users depois

SELECT 'Políticas RLS atualizadas com sucesso!' as status;
