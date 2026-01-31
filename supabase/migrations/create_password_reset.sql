-- =========================================
-- CRIAR TABELA DE TOKENS DE RESET DE SENHA
-- =========================================

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_subscriber_id ON public.password_reset_tokens(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Habilitar RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode criar tokens
CREATE POLICY "Anyone can create reset tokens"
ON public.password_reset_tokens
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política: Qualquer um pode ler tokens válidos
CREATE POLICY "Anyone can read valid tokens"
ON public.password_reset_tokens
FOR SELECT
TO anon, authenticated
USING (expires_at > NOW() AND used_at IS NULL);

-- Política: Qualquer um pode atualizar tokens (marcar como usado)
CREATE POLICY "Anyone can update tokens"
ON public.password_reset_tokens
FOR UPDATE
TO anon, authenticated
USING (true);

-- =========================================
-- FUNÇÃO PARA CRIAR TOKEN DE RESET
-- =========================================

CREATE OR REPLACE FUNCTION public.create_password_reset_token(
  p_cpf TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_subscriber_id UUID;
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Buscar associado por CPF
  SELECT id INTO v_subscriber_id
  FROM public.subscribers
  WHERE cpf = p_cpf AND status = 'approved';

  IF v_subscriber_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'CPF não encontrado ou não autorizado'
    );
  END IF;

  -- Gerar token único
  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := NOW() + INTERVAL '1 hour';

  -- Inserir token
  INSERT INTO public.password_reset_tokens (subscriber_id, token, expires_at)
  VALUES (v_subscriber_id, v_token, v_expires_at);

  RETURN jsonb_build_object(
    'success', true,
    'token', v_token,
    'expires_at', v_expires_at
  );
END;
$$;

-- =========================================
-- FUNÇÃO PARA VALIDAR E USAR TOKEN
-- =========================================

CREATE OR REPLACE FUNCTION public.validate_reset_token(
  p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- Buscar token
  SELECT * INTO v_record
  FROM public.password_reset_tokens
  WHERE token = p_token
    AND expires_at > NOW()
    AND used_at IS NULL;

  IF v_record IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Token inválido ou expirado'
    );
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'subscriber_id', v_record.subscriber_id
  );
END;
$$;

-- =========================================
-- FUNÇÃO PARA MARCAR TOKEN COMO USADO
-- =========================================

CREATE OR REPLACE FUNCTION public.mark_token_used(
  p_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.password_reset_tokens
  SET used_at = NOW()
  WHERE token = p_token;

  RETURN FOUND;
END;
$$;

-- =========================================
-- LIMPEZA AUTOMÁTICA DE TOKENS EXPIRADOS
-- =========================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- =========================================
-- ✅ SISTEMA DE RESET DE SENHA CRIADO!
-- =========================================
