-- =========================================
-- DIAGNÓSTICO: Verificar Usuários e Roles
-- =========================================

-- 1. Verificar se os usuários existem no auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
WHERE email IN ('admin@clubeaquitem.com', 'teste@clubeaquitem.com')
ORDER BY email;

-- 2. Verificar todas as roles existentes
SELECT * FROM public.user_roles;

-- 3. Verificar se a tabela user_roles existe e sua estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 4. Verificar o tipo enum app_role
SELECT 
  enumlabel 
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'app_role';

-- =========================================
-- SOLUÇÃO ALTERNATIVA: Inserir Diretamente
-- =========================================
-- Execute APENAS se os usuários existem mas não têm roles

-- IMPORTANTE: Substitua os UUIDs pelos IDs reais dos usuários
-- Você pode pegar os IDs da primeira query acima

-- Exemplo (SUBSTITUA OS UUIDs):
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES 
--   ('UUID_DO_ADMIN_AQUI', 'admin'),
--   ('UUID_DO_TESTE_AQUI', 'admin');

-- =========================================
-- VERIFICAÇÃO FINAL
-- =========================================
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at as role_created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('admin@clubeaquitem.com', 'teste@clubeaquitem.com')
ORDER BY u.email;
