-- =========================================
-- INSERIR PARCEIRO DE TESTE DIRETAMENTE
-- =========================================
-- Execute este SQL no Supabase SQL Editor

-- Senha: parceiro123 (hash SHA-256)
INSERT INTO public.partner_accounts (
  email,
  password_hash,
  nome_estabelecimento,
  responsavel,
  telefone,
  endereco,
  status,
  first_access
) VALUES (
  'parceiro@teste.com',
  'e47184f6857b09c4b19e76d766ae81a2b8fc1b2da5bb91b5c635f4e1a8d15cf0',
  'Padaria Pão Quente',
  'João da Silva',
  '(21) 99999-9999',
  'Rua das Flores, 123 - Centro, Rio de Janeiro',
  'active',
  false
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  nome_estabelecimento = EXCLUDED.nome_estabelecimento,
  updated_at = NOW();

-- Verificar se foi inserido
SELECT email, nome_estabelecimento, responsavel, status 
FROM public.partner_accounts 
WHERE email = 'parceiro@teste.com';
