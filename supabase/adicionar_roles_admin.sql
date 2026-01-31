-- =========================================
-- ADICIONAR ROLES DE ADMIN - MÉTODO SIMPLIFICADO
-- Clube Aqui Tem - Painel Administrativo
-- =========================================
-- Execute este script DEPOIS de criar os usuários manualmente
-- Dashboard: https://supabase.com/dashboard/project/wmivufnnbsvmeyjapjzx

-- =========================================
-- IMPORTANTE: CRIAR USUÁRIOS MANUALMENTE PRIMEIRO
-- =========================================
-- 
-- 1. Vá em: Authentication > Users > Add User
-- 2. Crie os seguintes usuários:
--    - Email: admin@clubeaquitem.com | Senha: Admin@2026!
--    - Email: teste@clubeaquitem.com | Senha: Teste@2026!
-- 3. Depois execute este script para adicionar as roles
--
-- =========================================

-- =========================================
-- ADICIONAR ROLE ADMIN PARA OS USUÁRIOS
-- =========================================

-- Adicionar role admin para admin@clubeaquitem.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'admin@clubeaquitem.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.users.id 
    AND ur.role = 'admin'::app_role
  );

-- Adicionar role admin para teste@clubeaquitem.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'teste@clubeaquitem.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.users.id 
    AND ur.role = 'admin'::app_role
  );

-- =========================================
-- VERIFICAR ROLES CRIADAS
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
-- ✅ VERIFICAÇÃO
-- =========================================
-- 
-- Se a query acima mostrar:
-- - email: admin@clubeaquitem.com | role: admin ✓
-- - email: teste@clubeaquitem.com | role: admin ✓
-- 
-- Então está tudo certo!
-- 
-- Se a coluna 'role' estiver NULL, significa que:
-- 1. O usuário não foi criado ainda OU
-- 2. Há um problema com a constraint da tabela
-- 
-- =========================================
