-- =========================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA TESTE
-- =========================================

-- DESABILITAR RLS na tabela partner_accounts
ALTER TABLE public.partner_accounts DISABLE ROW LEVEL SECURITY;

-- VERIFICAR SE FOI DESABILITADO
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'partner_accounts';

-- TESTAR LEITURA DIRETA
SELECT 
  email,
  nome_estabelecimento,
  status,
  password_hash
FROM public.partner_accounts 
WHERE email = 'parceiro@teste.com';
