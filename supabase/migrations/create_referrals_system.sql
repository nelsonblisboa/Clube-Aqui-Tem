-- =========================================
-- SISTEMA DE INDICAÇÕES (REFERRAL)
-- =========================================

-- Tabela de indicações
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.subscribers(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referred_email TEXT,
  referred_cpf TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  reward_given BOOLEAN DEFAULT false,
  reward_type TEXT, -- 'discount', 'free_month', 'cashback'
  reward_value DECIMAL(10,2),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Política: Associados podem ver suas indicações
CREATE POLICY "Subscribers can read their referrals"
ON public.referrals
FOR SELECT
TO authenticated
USING (referrer_id IN (
  SELECT id FROM public.subscribers 
  WHERE id = auth.uid() OR cpf = current_setting('request.jwt.claims', true)::json->>'cpf'
));

-- Política: Qualquer um pode criar indicação
CREATE POLICY "Anyone can create referrals"
ON public.referrals
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Função para gerar código de indicação
CREATE OR REPLACE FUNCTION public.generate_referral_code(
  p_subscriber_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Gerar código aleatório de 8 caracteres
    v_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_code;
END;
$$;

-- Função para criar indicação
CREATE OR REPLACE FUNCTION public.create_referral(
  p_referrer_id UUID,
  p_referred_email TEXT DEFAULT NULL,
  p_referred_cpf TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_referral_id UUID;
BEGIN
  -- Gerar código
  v_code := generate_referral_code(p_referrer_id);

  -- Criar indicação
  INSERT INTO public.referrals (
    referrer_id,
    referral_code,
    referred_email,
    referred_cpf
  ) VALUES (
    p_referrer_id,
    v_code,
    p_referred_email,
    p_referred_cpf
  )
  RETURNING id INTO v_referral_id;

  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral_id,
    'referral_code', v_code
  );
END;
$$;

-- Função para completar indicação
CREATE OR REPLACE FUNCTION public.complete_referral(
  p_referral_code TEXT,
  p_referred_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_referral RECORD;
BEGIN
  -- Buscar indicação
  SELECT * INTO v_referral
  FROM public.referrals
  WHERE referral_code = p_referral_code
    AND status = 'pending';

  IF v_referral IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código de indicação inválido');
  END IF;

  -- Atualizar indicação
  UPDATE public.referrals
  SET 
    referred_id = p_referred_id,
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_referral.id;

  -- Aplicar recompensa (5% desconto para ambos)
  UPDATE public.subscribers
  SET discount_applied = true
  WHERE id IN (v_referral.referrer_id, p_referred_id);

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Indicação completada! Ambos receberam 5% de desconto'
  );
END;
$$;

-- =========================================
-- ✅ SISTEMA DE INDICAÇÕES CRIADO!
-- =========================================
