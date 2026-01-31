-- =========================================
-- SETUP COMPLETO DO BANCO DE DADOS
-- Clube Aqui Tem - Novo Projeto Supabase
-- =========================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard: https://supabase.com/dashboard/project/wmivufnnbsvmeyjapjzx

-- =========================================
-- 1. CRIAR TABELAS
-- =========================================

-- Tabela de Parceiros
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  endereco TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Perfis de Usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enum para status de assinatura
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM (
            'pending',
            'approved', 
            'rejected',
            'cancelled',
            'refunded'
        );
    END IF;
END $$;

-- Tabela de Associados
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  status subscription_status DEFAULT 'pending',
  discount_applied BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  external_reference TEXT,
  mercadopago_preference_id TEXT,
  mercadopago_payment_id TEXT,
  password_hash TEXT,
  first_access BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Leads (Meta Ads)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'meta_ads',
  converted BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enum para roles de usuário
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('admin', 'user');
    END IF;
END $$;

-- Tabela de Roles de Usuário
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 2. CRIAR ÍNDICES
-- =========================================

CREATE INDEX IF NOT EXISTS partners_email_idx ON public.partners(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_cpf ON public.subscribers(cpf);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_external_reference ON public.subscribers(external_reference);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- =========================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- =========================================

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 4. CRIAR POLÍTICAS RLS
-- =========================================

-- PARTNERS
CREATE POLICY "Anyone can insert partners"
  ON public.partners FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view partners"
  ON public.partners FOR SELECT
  TO authenticated
  USING (true);

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- SUBSCRIBERS
CREATE POLICY "Anyone can insert subscribers"
  ON public.subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can manage subscribers"
  ON public.subscribers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- LEADS
CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view leads"
  ON public.leads FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update leads"
  ON public.leads FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete leads"
  ON public.leads FOR DELETE
  USING (auth.role() = 'authenticated');

-- USER_ROLES
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- =========================================
-- 5. CRIAR FUNCTIONS E TRIGGERS
-- =========================================

-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function para criar profile ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger para criar profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Function para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 6. VERIFICAÇÃO FINAL
-- =========================================

-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('partners', 'profiles', 'subscribers', 'leads', 'user_roles')
ORDER BY table_name;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar índices
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =========================================
-- ✅ SETUP COMPLETO!
-- =========================================
-- Próximos passos:
-- 1. Deploy das Edge Functions
-- 2. Configurar variáveis de ambiente
-- 3. Testar a aplicação
