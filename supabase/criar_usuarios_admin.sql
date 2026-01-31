-- =========================================
-- CRIAR USUÁRIOS ADMINISTRADORES
-- Clube Aqui Tem - Painel Administrativo
-- =========================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard: https://supabase.com/dashboard/project/wmivufnnbsvmeyjapjzx

-- =========================================
-- 1. CRIAR USUÁRIO ADMINISTRADOR PADRÃO
-- =========================================
-- Email: admin@clubeaquitem.com
-- Senha: Admin@2026!

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Criar usuário admin no auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@clubeaquitem.com',
    crypt('Admin@2026!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Administrador Principal"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_user_id;

  -- Se o usuário foi criado, adicionar role de admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin');
    
    RAISE NOTICE 'Usuário administrador criado com sucesso! ID: %', admin_user_id;
  ELSE
    -- Se já existe, pegar o ID e garantir que tem role admin
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@clubeaquitem.com';
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Usuário administrador já existe. ID: %', admin_user_id;
  END IF;
END $$;

-- =========================================
-- 2. CRIAR USUÁRIO DE TESTE
-- =========================================
-- Email: teste@clubeaquitem.com
-- Senha: Teste@2026!

DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Criar usuário de teste no auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste@clubeaquitem.com',
    crypt('Teste@2026!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Usuário de Teste"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO test_user_id;

  -- Se o usuário foi criado, adicionar role de admin
  IF test_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (test_user_id, 'admin');
    
    RAISE NOTICE 'Usuário de teste criado com sucesso! ID: %', test_user_id;
  ELSE
    -- Se já existe, pegar o ID e garantir que tem role admin
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'teste@clubeaquitem.com';
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (test_user_id, 'admin')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Usuário de teste já existe. ID: %', test_user_id;
  END IF;
END $$;

-- =========================================
-- 3. VERIFICAR USUÁRIOS CRIADOS
-- =========================================

SELECT 
  u.id,
  u.email,
  u.created_at,
  ur.role,
  u.raw_user_meta_data->>'name' as nome
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('admin@clubeaquitem.com', 'teste@clubeaquitem.com')
ORDER BY u.email;

-- =========================================
-- ✅ USUÁRIOS CRIADOS COM SUCESSO!
-- =========================================
-- 
-- CREDENCIAIS DE ACESSO:
-- 
-- 1. Administrador Principal:
--    Email: admin@clubeaquitem.com
--    Senha: Admin@2026!
-- 
-- 2. Usuário de Teste:
--    Email: teste@clubeaquitem.com
--    Senha: Teste@2026!
-- 
-- Acesse: http://localhost:8080/login
-- =========================================
