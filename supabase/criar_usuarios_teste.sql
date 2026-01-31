-- =========================================
-- CRIAR USUÁRIOS DE TESTE
-- Clube Aqui Tem - Usuários para Testes
-- =========================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard: https://supabase.com/dashboard/project/wmivufnnbsvmeyjapjzx

-- =========================================
-- 1. CRIAR ASSOCIADO DE TESTE
-- =========================================
-- CPF: 123.456.789-00
-- Senha: teste123 (será criada no primeiro acesso)

DO $$
DECLARE
  test_subscriber_id UUID;
BEGIN
  -- Criar associado de teste na tabela subscribers
  INSERT INTO public.subscribers (
    name,
    email,
    phone,
    cpf,
    address,
    status,
    discount_applied,
    paid_at,
    first_access,
    password_hash
  ) VALUES (
    'João da Silva Teste',
    'joao.teste@clubeaquitem.com',
    '(11) 98765-4321',
    '12345678900',
    'Rua Teste, 123 - Centro - São Paulo/SP',
    'approved',
    false,
    NOW(),
    true,
    NULL  -- Senha será criada no primeiro acesso
  )
  ON CONFLICT (cpf) DO UPDATE
  SET 
    status = 'approved',
    paid_at = NOW(),
    first_access = true,
    password_hash = NULL
  RETURNING id INTO test_subscriber_id;

  RAISE NOTICE 'Associado de teste criado/atualizado! ID: %', test_subscriber_id;
END $$;

-- =========================================
-- 2. CRIAR SEGUNDO ASSOCIADO DE TESTE
-- =========================================
-- CPF: 987.654.321-00
-- Senha: maria123 (será criada no primeiro acesso)

DO $$
DECLARE
  test_subscriber_id UUID;
BEGIN
  -- Criar segundo associado de teste
  INSERT INTO public.subscribers (
    name,
    email,
    phone,
    cpf,
    address,
    status,
    discount_applied,
    paid_at,
    first_access,
    password_hash
  ) VALUES (
    'Maria Santos Teste',
    'maria.teste@clubeaquitem.com',
    '(11) 91234-5678',
    '98765432100',
    'Av. Teste, 456 - Jardim Teste - São Paulo/SP',
    'approved',
    true,  -- Com desconto aplicado
    NOW(),
    true,
    NULL  -- Senha será criada no primeiro acesso
  )
  ON CONFLICT (cpf) DO UPDATE
  SET 
    status = 'approved',
    paid_at = NOW(),
    first_access = true,
    password_hash = NULL,
    discount_applied = true
  RETURNING id INTO test_subscriber_id;

  RAISE NOTICE 'Segundo associado de teste criado/atualizado! ID: %', test_subscriber_id;
END $$;

-- =========================================
-- 3. VERIFICAR ASSOCIADOS CRIADOS
-- =========================================

SELECT 
  id,
  name,
  cpf,
  email,
  phone,
  status,
  discount_applied,
  first_access,
  paid_at,
  created_at
FROM public.subscribers
WHERE cpf IN ('12345678900', '98765432100')
ORDER BY name;

-- =========================================
-- ✅ ASSOCIADOS DE TESTE CRIADOS!
-- =========================================
-- 
-- CREDENCIAIS DE ACESSO - ÁREA DO ASSOCIADO:
-- 
-- 1. João da Silva Teste:
--    CPF: 123.456.789-00
--    Senha: (criar no primeiro acesso)
--    Status: Aprovado
--    Desconto: Não aplicado
-- 
-- 2. Maria Santos Teste:
--    CPF: 987.654.321-00
--    Senha: (criar no primeiro acesso)
--    Status: Aprovado
--    Desconto: 5% aplicado
-- 
-- Acesse: http://localhost:8080/minha-conta
-- 
-- IMPORTANTE: No primeiro acesso, digite apenas o CPF
-- e deixe a senha em branco. O sistema irá solicitar
-- a criação de uma nova senha.
-- =========================================
