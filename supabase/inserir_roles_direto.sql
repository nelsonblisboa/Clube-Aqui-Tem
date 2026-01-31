-- =========================================
-- INSERIR ROLES ADMIN - MÉTODO DIRETO
-- =========================================
-- Execute este script DEPOIS de criar os usuários via UI
-- Authentication > Users > Add User

-- =========================================
-- PASSO 1: Verificar se usuários existem
-- =========================================

SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email IN ('admin@clubeaquitem.com', 'teste@clubeaquitem.com');

-- Se a query acima retornar VAZIO, você precisa:
-- 1. Ir em Authentication > Users
-- 2. Clicar em "Add User"
-- 3. Criar os usuários:
--    - admin@clubeaquitem.com / Admin@2026!
--    - teste@clubeaquitem.com / Teste@2026!

-- =========================================
-- PASSO 2: Inserir Roles (execute APENAS se usuários existem)
-- =========================================

-- Limpar roles antigas (se existirem)
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('admin@clubeaquitem.com', 'teste@clubeaquitem.com')
);

-- Inserir roles admin
INSERT INTO public.user_roles (user_id, role)
SELECT 
  u.id,
  'admin'::app_role
FROM auth.users u
WHERE u.email IN ('admin@clubeaquitem.com', 'teste@clubeaquitem.com');

-- =========================================
-- PASSO 3: Verificar resultado
-- =========================================

SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at as role_criada_em
FROM auth.users u
INNER JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('admin@clubeaquitem.com', 'teste@clubeaquitem.com')
ORDER BY u.email;

-- =========================================
-- ✅ RESULTADO ESPERADO
-- =========================================
-- Deve mostrar 2 linhas:
-- admin@clubeaquitem.com | admin
-- teste@clubeaquitem.com | admin
-- =========================================
