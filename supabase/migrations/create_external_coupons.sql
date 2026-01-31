-- ==============================================================================
-- ATENÇÃO: EXECUTE ESTE SCRIPT NO EDITOR SQL DO SUPABASE PARA CORRIGIR O ERRO
-- "new row violates row-level security policy"
-- ==============================================================================

-- 1. Garante que a tabela existe
CREATE TABLE IF NOT EXISTS public.external_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_platform TEXT NOT NULL, 
  store_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_value TEXT,
  category TEXT,
  destination_url TEXT,
  expiration_date DATE,
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_platform, store_name, title)
);

-- 2. Habilita RLS (caso não esteja)
ALTER TABLE public.external_coupons ENABLE ROW LEVEL SECURITY;

-- 3. Limpa políticas antigas para evitar conflitos/erros
DROP POLICY IF EXISTS "Public read access for external coupons" ON public.external_coupons;
DROP POLICY IF EXISTS "Service role write access" ON public.external_coupons;
DROP POLICY IF EXISTS "Anon insert access for crawler" ON public.external_coupons;
DROP POLICY IF EXISTS "Anon update access for crawler" ON public.external_coupons;

-- 4. Recria as políticas corretas

-- Leitura: Todos podem ver (público do site)
CREATE POLICY "Public read access for external coupons"
  ON public.external_coupons FOR SELECT
  USING (true);

-- Escrita: Permite INSERT/UPDATE para o script rodando localmente (anon key)
-- Nota: Em produção, recomenda-se usar a SERVICE_KEY no backend e remover estas permissões de anon.
CREATE POLICY "Anon insert access for crawler"
  ON public.external_coupons FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

CREATE POLICY "Anon update access for crawler"
  ON public.external_coupons FOR UPDATE
  TO anon, authenticated, service_role
  USING (true);

-- 5. Confirmação
SELECT 'Políticas RLS atualizadas com sucesso! Agora o script funcionará.' as status;
