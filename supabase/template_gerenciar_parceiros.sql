-- =========================================
-- TEMPLATE PARA ADICIONAR NOVOS PARCEIROS
-- =========================================

-- IMPORTANTE: Antes de usar este template:
-- 1. Gere o hash SHA-256 da senha em: https://emn178.github.io/online-tools/sha256.html
-- 2. Ou use o JavaScript no console do navegador (veja SISTEMA_PARCEIROS_CREDENCIAIS.md)
-- 3. Substitua os valores entre [COLCHETES] pelos dados reais

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
  '[EMAIL_DO_PARCEIRO]',
  '[HASH_SHA256_DA_SENHA]',
  '[NOME_DO_ESTABELECIMENTO]',
  '[NOME_DO_RESPONSAVEL]',
  '[TELEFONE]',
  '[CNPJ]',
  '[ENDERECO_COMPLETO]',
  'active',
  false  -- false = não precisa trocar senha / true = precisa trocar no primeiro login
);

-- =========================================
-- EXEMPLO PRÁTICO
-- =========================================

-- Parceiro: Restaurante Sabor Mineiro
-- Senha: mineiro2024
-- Hash SHA-256: [GERE NO SITE ACIMA]

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
  'contato@sabormineiro.com.br',
  'COLE_O_HASH_AQUI',  -- Hash de "mineiro2024"
  'Restaurante Sabor Mineiro',
  'Maria Santos',
  '(21) 98765-4321',
  '12.345.678/0001-90',
  'Rua das Palmeiras, 456 - Bairro - Cidade - UF',
  'active',
  false
);

-- =========================================
-- VERIFICAR SE FOI INSERIDO
-- =========================================

SELECT 
  email,
  nome_estabelecimento,
  responsavel,
  telefone,
  status,
  created_at
FROM public.partner_accounts
ORDER BY created_at DESC
LIMIT 5;

-- =========================================
-- ALTERAR SENHA DE UM PARCEIRO EXISTENTE
-- =========================================

-- 1. Gere o novo hash SHA-256
-- 2. Execute:

UPDATE public.partner_accounts 
SET password_hash = '[NOVO_HASH_SHA256]'
WHERE email = '[EMAIL_DO_PARCEIRO]';

-- =========================================
-- ATIVAR/DESATIVAR PARCEIRO
-- =========================================

-- ATIVAR
UPDATE public.partner_accounts 
SET status = 'active'
WHERE email = '[EMAIL_DO_PARCEIRO]';

-- DESATIVAR
UPDATE public.partner_accounts 
SET status = 'inactive'
WHERE email = '[EMAIL_DO_PARCEIRO]';

-- PENDENTE (aguardando aprovação)
UPDATE public.partner_accounts 
SET status = 'pending'
WHERE email = '[EMAIL_DO_PARCEIRO]';

-- =========================================
-- LISTAR TODOS OS PARCEIROS
-- =========================================

SELECT 
  id,
  email,
  nome_estabelecimento,
  responsavel,
  telefone,
  status,
  created_at,
  last_login
FROM public.partner_accounts
ORDER BY created_at DESC;

-- =========================================
-- ESTATÍSTICAS
-- =========================================

SELECT 
  status,
  COUNT(*) as total
FROM public.partner_accounts
GROUP BY status;

-- =========================================
-- PARCEIRO DE TESTE (JÁ CONFIGURADO)
-- =========================================

-- Email: parceiro@teste.com
-- Senha: parceiro123
-- Hash: 511e8610d57e12691d9385f21905d43130f8d737bac6f92463f7ee80275514f3
-- Status: ✅ Ativo e funcionando
