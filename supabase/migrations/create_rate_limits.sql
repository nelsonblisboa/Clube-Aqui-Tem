-- =========================================
-- CRIAR TABELA DE RATE LIMITING
-- =========================================
-- Sistema para prevenir ataques de força bruta

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- CPF, email ou IP
  action TEXT NOT NULL, -- 'login_admin', 'login_member', etc
  attempts INTEGER DEFAULT 1,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, action)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until ON public.rate_limits(blocked_until);

-- Habilitar RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode ler/escrever (necessário para login)
CREATE POLICY "Anyone can manage rate limits"
ON public.rate_limits
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- =========================================
-- FUNÇÃO PARA VERIFICAR RATE LIMIT
-- =========================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_record RECORD;
  v_is_blocked BOOLEAN;
  v_remaining_attempts INTEGER;
BEGIN
  -- Buscar registro existente
  SELECT * INTO v_record
  FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;

  -- Se não existe, criar
  IF v_record IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action, attempts)
    VALUES (p_identifier, p_action, 1);
    
    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', p_max_attempts - 1,
      'blocked_until', NULL
    );
  END IF;

  -- Verificar se está bloqueado
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > NOW() THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'blocked_until', v_record.blocked_until
    );
  END IF;

  -- Se passou o tempo de bloqueio, resetar
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until <= NOW() THEN
    UPDATE public.rate_limits
    SET attempts = 1, blocked_until = NULL, updated_at = NOW()
    WHERE id = v_record.id;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', p_max_attempts - 1,
      'blocked_until', NULL
    );
  END IF;

  -- Incrementar tentativas
  UPDATE public.rate_limits
  SET attempts = attempts + 1, updated_at = NOW()
  WHERE id = v_record.id;

  v_remaining_attempts := p_max_attempts - (v_record.attempts + 1);

  -- Se atingiu o limite, bloquear
  IF v_record.attempts + 1 >= p_max_attempts THEN
    UPDATE public.rate_limits
    SET blocked_until = NOW() + (p_window_minutes || ' minutes')::INTERVAL
    WHERE id = v_record.id;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'blocked_until', NOW() + (p_window_minutes || ' minutes')::INTERVAL
    );
  END IF;

  -- Ainda tem tentativas
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', v_remaining_attempts,
    'blocked_until', NULL
  );
END;
$$;

-- =========================================
-- FUNÇÃO PARA RESETAR RATE LIMIT
-- =========================================

CREATE OR REPLACE FUNCTION public.reset_rate_limit(
  p_identifier TEXT,
  p_action TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  RETURN true;
END;
$$;

-- =========================================
-- LIMPEZA AUTOMÁTICA (executar periodicamente)
-- =========================================

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE updated_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- =========================================
-- EXEMPLOS DE USO
-- =========================================

-- Verificar rate limit
-- SELECT check_rate_limit('123.456.789-00', 'login_member', 5, 15);

-- Resetar rate limit (após sucesso)
-- SELECT reset_rate_limit('123.456.789-00', 'login_member');

-- Limpar registros antigos
-- SELECT cleanup_old_rate_limits();

-- =========================================
-- ✅ RATE LIMITING CRIADO!
-- =========================================
