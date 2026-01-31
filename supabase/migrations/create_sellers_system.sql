-- =========================================
-- SISTEMA DE VENDEDORES (AFILIADOS)
-- Clube Aqui Tem
-- =========================================

-- 1. CRIAR TABELA DE VENDEDORES
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- Usado para o link: /?ref=slug
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VINCULAR ASSOCIADOS AO VENDEDOR
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL;

-- 3. VINCULAR LEADS AO VENDEDOR
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL;

-- 4. HABILITAR RLS
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS PARA ADMINS
CREATE POLICY "Admins have full access to sellers"
ON public.sellers
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- 6. PERMITIR LEITURA PÚBLICA DO NOME DO VENDEDOR (PARA O LINK)
CREATE POLICY "Allow public read of active sellers"
ON public.sellers
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- 7. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_sellers_slug ON public.sellers(slug);
CREATE INDEX IF NOT EXISTS idx_subscribers_seller_id ON public.subscribers(seller_id);
CREATE INDEX IF NOT EXISTS idx_leads_seller_id ON public.leads(seller_id);

-- 8. TRIGGER PARA UPDATED_AT
CREATE TRIGGER sellers_updated_at
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
