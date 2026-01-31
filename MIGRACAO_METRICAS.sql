-- =========================================
-- ATUALIZAÇÃO DO SISTEMA DE VENDAS E MÉTRICAS
-- Copie e cole este código no SQL Editor do seu Supabase
-- =========================================

-- 1. CRIAR TABELA DE EVENTOS (MÉTRICAS)
CREATE TABLE IF NOT EXISTS public.seller_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('whatsapp_click', 'checkout_intent')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- 2. HABILITAR SEGURANÇA (RLS)
ALTER TABLE public.seller_events ENABLE ROW LEVEL SECURITY;

-- 3. PERMITIR QUE QUALQUER PESSOA (MESMO NÃO LOGADA) REGISTRE CLIQUES
-- Isso é necessário pois os clientes nas páginas de venda não estão logados
CREATE POLICY "Public insert events"
ON public.seller_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. PERMITIR QUE ADMINS VEJAM OS DADOS
CREATE POLICY "Admins read events"
ON public.seller_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- 5. ÍNDICES PARA PERFORMANCE DO DASHBOARD
CREATE INDEX IF NOT EXISTS idx_seller_events_seller ON public.seller_events(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_events_type ON public.seller_events(event_type);
