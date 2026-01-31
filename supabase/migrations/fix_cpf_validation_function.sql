-- =========================================
-- FIX: Corrigir função validate_subscriber_cpf
-- =========================================

-- Remover função antiga
DROP FUNCTION IF EXISTS public.validate_subscriber_cpf(TEXT, UUID);

-- Criar função corrigida (sem ambiguidade de colunas)
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
  SELECT 
    s.id, 
    s.name, 
    s.email, 
    s.status
  INTO v_subscriber
  FROM public.subscribers s
  WHERE s.cpf = p_cpf AND s.status = 'approved';

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

-- =========================================
-- TESTE DA FUNÇÃO CORRIGIDA
-- =========================================

-- Primeiro, inserir um associado de teste se não existir
INSERT INTO public.subscribers (
    name,
    email,
    cpf,
    phone,
    address,
    status
) VALUES (
    'João da Silva',
    'joao.silva@teste.com',
    '12345678901',
    '(11) 98765-4321',
    'Rua Teste, 123 - São Paulo - SP',
    'approved'
) ON CONFLICT (cpf) DO UPDATE 
SET status = EXCLUDED.status,
    email = EXCLUDED.email,
    name = EXCLUDED.name;

-- Inserir mais associados de teste
INSERT INTO public.subscribers (
    name,
    email,
    cpf,
    phone,
    address,
    status
) VALUES 
(
    'Maria Oliveira',
    'maria.oliveira@teste.com',
    '98765432100',
    '(21) 99876-5432',
    'Av. Principal, 456 - Rio de Janeiro - RJ',
    'approved'
),
(
    'Carlos Souza',
    'carlos.souza@teste.com',
    '11122233344',
    '(11) 91234-5678',
    'Rua das Flores, 789 - São Paulo - SP',
    'approved'
)
ON CONFLICT (cpf) DO UPDATE 
SET status = EXCLUDED.status;

-- Testar a função com CPF válido
SELECT * FROM public.validate_subscriber_cpf(
    '12345678901',
    (SELECT id FROM public.partner_accounts LIMIT 1)
);

-- Testar a função com CPF inválido
SELECT * FROM public.validate_subscriber_cpf(
    '99999999999',
    (SELECT id FROM public.partner_accounts LIMIT 1)
);

SELECT '✅ Função validate_subscriber_cpf corrigida e testada!' AS status;
