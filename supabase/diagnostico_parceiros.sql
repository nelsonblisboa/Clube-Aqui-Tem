-- =========================================
-- DIAGNÓSTICO COMPLETO - PARTNER ACCOUNTS
-- =========================================

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'partner_accounts'
) as tabela_existe;

-- 2. VERIFICAR QUANTOS REGISTROS EXISTEM
SELECT COUNT(*) as total_parceiros 
FROM public.partner_accounts;

-- 3. LISTAR TODOS OS PARCEIROS
SELECT 
  id,
  email,
  nome_estabelecimento,
  responsavel,
  status,
  first_access,
  created_at
FROM public.partner_accounts
ORDER BY created_at DESC;

-- 4. PROCURAR ESPECIFICAMENTE O PARCEIRO DE TESTE
SELECT * 
FROM public.partner_accounts 
WHERE email = 'parceiro@teste.com';

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'partner_accounts'
ORDER BY policyname;

-- 6. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'partner_accounts';

-- =========================================
-- SE NÃO HOUVER NENHUM PARCEIRO, INSERIR AGORA
-- =========================================

-- DELETAR SE JÁ EXISTE (para garantir que estamos inserindo novo)
DELETE FROM public.partner_accounts WHERE email = 'parceiro@teste.com';

-- INSERIR PARCEIRO DE TESTE
INSERT INTO public.partner_accounts (
  email,
  password_hash,
  nome_estabelecimento,
  responsavel,
  telefone,
  cnpj,
  endereco,
  status,
  first_access
) VALUES (
  'parceiro@teste.com',
  'e47184f6857b09c4b19e76d766ae81a2b8fc1b2da5bb91b5c635f4e1a8d15cf0', -- parceiro123
  'Padaria Pão Quente',
  'João da Silva',
  '(21) 99999-9999',
  '12.345.678/0001-90',
  'Rua das Flores, 123 - Centro, Rio de Janeiro - RJ',
  'active',
  false
);

-- VERIFICAR SE FOI INSERIDO
SELECT 
  email,
  nome_estabelecimento,
  responsavel,
  telefone,
  status,
  first_access,
  password_hash
FROM public.partner_accounts 
WHERE email = 'parceiro@teste.com';

-- =========================================
-- TESTAR AUTENTICAÇÃO MANUAL
-- =========================================

-- Este é o hash SHA-256 de "parceiro123"
-- Você pode verificar em: https://emn178.github.io/online-tools/sha256.html

SELECT 
  'parceiro123' as senha_texto,
  'e47184f6857b09c4b19e76d766ae81a2b8fc1b2da5bb91b5c635f4e1a8d15cf0' as hash_esperado,
  password_hash as hash_no_banco,
  CASE 
    WHEN password_hash = 'e47184f6857b09c4b19e76d766ae81a2b8fc1b2da5bb91b5c635f4e1a8d15cf0' 
    THEN 'Hash CORRETO ✓' 
    ELSE 'Hash INCORRETO ✗' 
  END as validacao
FROM public.partner_accounts 
WHERE email = 'parceiro@teste.com';

-- =========================================
-- RESUMO FINAL
-- =========================================

SELECT 
  'Diagnóstico completo executado!' as status,
  (SELECT COUNT(*) FROM public.partner_accounts) as total_parceiros_cadastrados,
  (SELECT COUNT(*) FROM public.partner_accounts WHERE email = 'parceiro@teste.com') as parceiro_teste_existe,
  (SELECT COUNT(*) FROM public.partner_accounts WHERE status = 'active') as parceiros_ativos;
