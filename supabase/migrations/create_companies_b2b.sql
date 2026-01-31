-- CRIAR TABELA DE EMPRESAS (B2B)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    address TEXT,
    phone TEXT,
    email TEXT,
    responsible_name TEXT,
    agreed_unit_value NUMERIC(10, 2) DEFAULT 19.99, -- Valor negociado por vida
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- ADICIONAR REFERÊNCIA NA TABELA DE ASSOCIADOS
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- HABILITAR RLS PARA EMPRESAS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO (Apenas Admins podem ver e editar empresas)
CREATE POLICY "Admins manage companies" 
ON public.companies 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_subscribers_company ON public.subscribers(company_id);
