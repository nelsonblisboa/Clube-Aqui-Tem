-- SCRIPT DE CORREÇÃO COMPLETA PARA MÓDULO B2B

-- 1. Garante que a tabela de empresas existe
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    responsible_name TEXT,
    agreed_unit_value NUMERIC(10,2) DEFAULT 19.99,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Garante que a tabela subscribers tem as colunas necessárias
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- 3. Garante índices para performance
CREATE INDEX IF NOT EXISTS idx_subscribers_company_id ON public.subscribers(company_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_birth_date ON public.subscribers(birth_date);
CREATE INDEX IF NOT EXISTS idx_subscribers_cpf ON public.subscribers(cpf);

-- 4. Permissões de RLS (Row Level Security)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Política permissiva para administradores (ajuste conforme sua auth)
-- Se não houver users com role 'admin', isso pode bloquear.
-- Para debug seguro, vamos permitir ALL para authenticated users por enquanto, ou service_role.
create policy "Enable all access for authenticated users" on public.companies
for all using (auth.role() = 'authenticated');

-- Atualiza permissões em subscribers se necessário
-- (Assumindo que subscribers já tem policies, apenas garantindo acesso ao update)

-- 5. Tratamento de CPFs duplicados (opcional, apenas limpeza)
-- DELETE FROM public.subscribers a USING public.subscribers b WHERE a.id < b.id AND a.cpf = b.cpf;
