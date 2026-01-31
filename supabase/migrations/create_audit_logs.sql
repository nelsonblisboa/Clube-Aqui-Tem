-- =========================================
-- CRIAR TABELA DE LOGS DE AUDITORIA
-- =========================================
-- Sistema de auditoria para rastrear ações críticas

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'subscriber', 'partner', 'lead', 'user_role', etc
  resource_id UUID,
  details JSONB, -- Detalhes adicionais da ação
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ler logs
CREATE POLICY "Only admins can read audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Política: Sistema pode inserir logs (via service role)
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =========================================
-- FUNÇÃO HELPER PARA CRIAR LOGS
-- =========================================

CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
  v_user_email TEXT;
BEGIN
  -- Pegar email do usuário atual
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Inserir log
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    v_user_email,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- =========================================
-- EXEMPLOS DE USO
-- =========================================

-- Exemplo 1: Log de login admin
-- SELECT create_audit_log('admin_login', 'auth', auth.uid());

-- Exemplo 2: Log de exportação Excel
-- SELECT create_audit_log('export_excel', 'subscribers', NULL, '{"count": 150}'::jsonb);

-- Exemplo 3: Log de atualização de status
-- SELECT create_audit_log('update_status', 'subscriber', 'uuid-aqui', '{"old_status": "pending", "new_status": "approved"}'::jsonb);

-- =========================================
-- VERIFICAR LOGS
-- =========================================

SELECT 
  id,
  user_email,
  action,
  resource_type,
  resource_id,
  details,
  created_at
FROM public.audit_logs
ORDER BY created_at DESC
LIMIT 50;

-- =========================================
-- ✅ TABELA DE AUDITORIA CRIADA!
-- =========================================
