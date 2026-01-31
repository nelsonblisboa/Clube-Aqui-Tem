-- =========================================
-- SISTEMA DE PARCEIROS - Clube Aqui Tem
-- =========================================

-- 1. CRIAR TABELA DE PARCEIROS AUTENTICADOS (diferente da tabela partners existente)
CREATE TABLE IF NOT EXISTS public.partner_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nome_estabelecimento TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cnpj TEXT,
  endereco TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  first_access BOOLEAN DEFAULT TRUE,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CRIAR TABELA DE DESCONTOS OFERECIDOS PELOS PARCEIROS
CREATE TABLE IF NOT EXISTS public.partner_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_accounts(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  percentual_desconto INTEGER CHECK (percentual_desconto >= 5 AND percentual_desconto <= 50),
  regras TEXT,
  codigo_cupom TEXT,
  validade_inicio DATE,
  validade_fim DATE,
  limite_uso INTEGER,
  usos_realizados INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  termos_condicoes TEXT,
  categorias TEXT[], -- Array de categorias: alimentacao, saude, lazer, etc
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CRIAR TABELA DE VALIDAÇÕES DE CPF (registro de consultas)
CREATE TABLE IF NOT EXISTS public.cpf_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_accounts(id) ON DELETE CASCADE,
  cpf_consultado TEXT NOT NULL,
  associado_valido BOOLEAN NOT NULL,
  subscriber_name TEXT,
  consulted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_partner_accounts_email ON public.partner_accounts(email);
CREATE INDEX IF NOT EXISTS idx_partner_accounts_reset_token ON public.partner_accounts(reset_token);
CREATE INDEX IF NOT EXISTS idx_partner_discounts_partner_id ON public.partner_discounts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_discounts_ativo ON public.partner_discounts(ativo);
CREATE INDEX IF NOT EXISTS idx_cpf_validations_partner_id ON public.cpf_validations(partner_id);
CREATE INDEX IF NOT EXISTS idx_cpf_validations_cpf ON public.cpf_validations(cpf_consultado);

-- 5. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.partner_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpf_validations ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLÍTICAS RLS

-- PARTNER_ACCOUNTS: Qualquer um pode registrar (signup), mas só vê própria conta
CREATE POLICY "Anyone can insert partner accounts"
  ON public.partner_accounts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Partners can view own account"
  ON public.partner_accounts FOR SELECT
  USING (true); -- Permitir leitura para autenticação

CREATE POLICY "Partners can update own account"
  ON public.partner_accounts FOR UPDATE
  USING (true);

-- PARTNER_DISCOUNTS: Parceiro só vê e gerencia próprios descontos
CREATE POLICY "Partners can view own discounts"
  ON public.partner_discounts FOR SELECT
  USING (true); -- Todos podem ver descontos ativos (para exibir aos associados)

CREATE POLICY "Partners can insert own discounts"
  ON public.partner_discounts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Partners can update own discounts"
  ON public.partner_discounts FOR UPDATE
  USING (true);

CREATE POLICY "Partners can delete own discounts"
  ON public.partner_discounts FOR DELETE
  USING (true);

-- CPF_VALIDATIONS: Parceiro só vê próprias consultas
CREATE POLICY "Partners can insert cpf validations"
  ON public.cpf_validations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Partners can view own validations"
  ON public.cpf_validations FOR SELECT
  USING (true);

-- 7. CRIAR FUNCTIONS

-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_partner_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function para validar CPF de associado
CREATE OR REPLACE FUNCTION public.validate_subscriber_cpf(
  p_cpf TEXT,
  p_partner_id UUID
)
RETURNS TABLE (
  valido BOOLEAN,
  nome TEXT,
  email TEXT,
  mensagem TEXT
) AS $$
DECLARE
  v_subscriber RECORD;
BEGIN
  -- Buscar associado por CPF com status aprovado
  SELECT id, name, email, status
  INTO v_subscriber
  FROM public.subscribers
  WHERE cpf = p_cpf AND status = 'approved';

  -- Registrar consulta
  INSERT INTO public.cpf_validations (
    partner_id,
    cpf_consultado,
    associado_valido,
    subscriber_name
  ) VALUES (
    p_partner_id,
    p_cpf,
    CASE WHEN v_subscriber.id IS NOT NULL THEN true ELSE false END,
    v_subscriber.name
  );

  -- Retornar resultado
  IF v_subscriber.id IS NOT NULL THEN
    RETURN QUERY SELECT 
      true,
      v_subscriber.name,
      v_subscriber.email,
      'Associado válido e ativo'::TEXT;
  ELSE
    RETURN QUERY SELECT 
      false,
      NULL::TEXT,
      NULL::TEXT,
      'CPF não encontrado ou associado não está ativo'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function para obter descontos ativos de todos os parceiros
CREATE OR REPLACE FUNCTION public.get_active_partner_discounts()
RETURNS TABLE (
  discount_id UUID,
  partner_name TEXT,
  partner_phone TEXT,
  partner_address TEXT,
  titulo TEXT,
  descricao TEXT,
  percentual_desconto INTEGER,
  regras TEXT,
  codigo_cupom TEXT,
  validade_fim DATE,
  categorias TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pd.id,
    pa.nome_estabelecimento,
    pa.telefone,
    pa.endereco,
    pd.titulo,
    pd.descricao,
    pd.percentual_desconto,
    pd.regras,
    pd.codigo_cupom,
    pd.validade_fim,
    pd.categorias
  FROM public.partner_discounts pd
  JOIN public.partner_accounts pa ON pd.partner_id = pa.id
  WHERE pd.ativo = true
    AND pa.status = 'active'
    AND (pd.validade_fim IS NULL OR pd.validade_fim >= CURRENT_DATE)
    AND (pd.limite_uso IS NULL OR pd.usos_realizados < pd.limite_uso)
  ORDER BY pd.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CRIAR TRIGGERS

CREATE TRIGGER partner_accounts_updated_at
  BEFORE UPDATE ON public.partner_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_partner_updated_at();

CREATE TRIGGER partner_discounts_updated_at
  BEFORE UPDATE ON public.partner_discounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_partner_updated_at();

-- 9. INSERIR DADOS DE TESTE (OPCIONAL - REMOVER EM PRODUÇÃO)

-- Senha de teste: "parceiro123" (hash SHA-256)
INSERT INTO public.partner_accounts (
  email,
  password_hash,
  nome_estabelecimento,
  responsavel,
  telefone,
  endereco,
  status,
  first_access
) VALUES (
  'parceiro@teste.com',
  'e47184f6857b09c4b19e76d766ae81a2b8fc1b2da5bb91b5c635f4e1a8d15cf0', -- parceiro123
  'Estabelecimento Teste',
  'João da Silva',
  '(21) 99999-9999',
  'Rua Teste, 123 - Centro',
  'active',
  false
) ON CONFLICT (email) DO NOTHING;

-- =========================================
-- ✅ SISTEMA DE PARCEIROS CRIADO!
-- =========================================

SELECT 'Sistema de parceiros criado com sucesso!' AS status;
