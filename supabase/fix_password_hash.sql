-- =========================================
-- VERIFICAR E CORRIGIR HASH DA SENHA
-- =========================================

-- 1. VERIFICAR HASH ATUAL
SELECT 
  email,
  password_hash,
  'parceiro123' as senha_teste,
  'e47184f6857b09c4b19e76d766ae81a2b8fc1b2da5bb91b5c635f4e1a8d15cf0' as hash_correto_sha256,
  CASE 
    WHEN password_hash = 'e47184f6857b09c4b19e76d766ae81a2b8fc1b2da5bb91b5c635f4e1a8d15cf0' 
    THEN '✓ HASH CORRETO' 
    ELSE '✗ HASH INCORRETO - PRECISA CORRIGIR' 
  END as status_hash
FROM public.partner_accounts 
WHERE email = 'parceiro@teste.com';

-- 2. ATUALIZAR COM O HASH CORRETO
-- Hash SHA-256 de "parceiro123": e47184f6857b09c4b19e76d766ae81a2b8fc1b2da5bb91b5c635f4e1a8d15cf0
UPDATE public.partner_accounts 
SET password_hash = 'e47184f6857b09c4b19e76d766ae81a2b8fc1b2da5bb91b5c635f4e1a8d15cf0'
WHERE email = 'parceiro@teste.com';

-- 3. VERIFICAR SE FOI ATUALIZADO
SELECT 
  email,
  nome_estabelecimento,
  password_hash,
  status,
  CASE 
    WHEN password_hash = 'e47184f6857b09c4b19e76d766ae81a2b8fc1b2da5bb91b5c635f4e1a8d15cf0' 
    THEN '✓ Senha pronta para funcionar!' 
    ELSE '✗ Ainda com problema' 
  END as validacao_final
FROM public.partner_accounts 
WHERE email = 'parceiro@teste.com';

-- =========================================
-- REFERÊNCIA: Como gerar hash SHA-256
-- =========================================
-- Você pode verificar o hash em: https://emn178.github.io/online-tools/sha256.html
-- Digite "parceiro123" e confira que o resultado é:
-- e47184f6857b09c4b19e76d766ae81a2b8fc1b2da5bb91b5c635f4e1a8d15cf0
