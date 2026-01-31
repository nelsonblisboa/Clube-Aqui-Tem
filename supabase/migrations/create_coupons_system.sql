-- =========================================
-- SISTEMA DE CUPONS COM QR CODE
-- =========================================

-- Tabela de cupons disponíveis
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER CHECK (discount_percentage BETWEEN 1 AND 100),
  discount_value DECIMAL(10,2),
  category TEXT, -- 'restaurante', 'farmacia', 'combustivel', etc
  terms TEXT,
  max_uses_per_subscriber INTEGER DEFAULT 1,
  total_max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  qr_code_data TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de uso de cupons
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  location TEXT,
  validated_by UUID REFERENCES auth.users(id),
  UNIQUE(coupon_id, subscriber_id, DATE(used_at))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_coupons_partner_id ON public.coupons(partner_id);
CREATE INDEX IF NOT EXISTS idx_coupons_category ON public.coupons(category);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(active);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_subscriber_id ON public.coupon_usage(subscriber_id);

-- RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos podem ler cupons ativos
CREATE POLICY "Anyone can read active coupons"
ON public.coupons
FOR SELECT
TO anon, authenticated
USING (active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- Políticas: Apenas admins podem gerenciar cupons
CREATE POLICY "Only admins can manage coupons"
ON public.coupons
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Políticas: Associados podem ver seu histórico
CREATE POLICY "Subscribers can read their usage"
ON public.coupon_usage
FOR SELECT
TO authenticated
USING (subscriber_id IN (
  SELECT id FROM public.subscribers WHERE cpf = current_setting('request.jwt.claims', true)::json->>'cpf'
));

-- Função para validar cupom
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_coupon_id UUID,
  p_subscriber_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_coupon RECORD;
  v_usage_count INTEGER;
BEGIN
  -- Buscar cupom
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE id = p_coupon_id AND active = true;

  IF v_coupon IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Cupom não encontrado ou inativo');
  END IF;

  -- Verificar validade
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < NOW() THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Cupom expirado');
  END IF;

  -- Verificar limite total
  IF v_coupon.total_max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.total_max_uses THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Cupom esgotado');
  END IF;

  -- Verificar uso por associado
  SELECT COUNT(*) INTO v_usage_count
  FROM public.coupon_usage
  WHERE coupon_id = p_coupon_id 
    AND subscriber_id = p_subscriber_id
    AND DATE(used_at) = CURRENT_DATE;

  IF v_usage_count >= v_coupon.max_uses_per_subscriber THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Você já usou este cupom hoje');
  END IF;

  -- Registrar uso
  INSERT INTO public.coupon_usage (coupon_id, subscriber_id)
  VALUES (p_coupon_id, p_subscriber_id);

  -- Incrementar contador
  UPDATE public.coupons
  SET current_uses = current_uses + 1
  WHERE id = p_coupon_id;

  RETURN jsonb_build_object(
    'valid', true,
    'message', 'Cupom validado com sucesso',
    'discount', COALESCE(v_coupon.discount_percentage::TEXT || '%', 'R$ ' || v_coupon.discount_value::TEXT)
  );
END;
$$;

-- =========================================
-- ✅ SISTEMA DE CUPONS CRIADO!
-- =========================================
