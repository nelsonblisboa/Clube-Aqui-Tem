-- =========================================
-- POLÍTICAS RLS PARA ÁREA DE ASSOCIADOS
-- =========================================
-- Execute este script no SQL Editor do Supabase
-- para permitir que associados acessem seus dados

-- =========================================
-- PERMITIR LEITURA DE ASSOCIADOS APROVADOS
-- =========================================

-- Política para permitir que qualquer um leia associados aprovados (necessário para login)
CREATE POLICY "Allow anonymous read approved subscribers for login"
ON public.subscribers
FOR SELECT
TO anon, authenticated
USING (status = 'approved');

-- =========================================
-- PERMITIR ATUALIZAÇÃO DE SENHA
-- =========================================

-- Política para permitir que qualquer um atualize a senha de associados aprovados
-- (necessário porque não temos autenticação Supabase para associados)
CREATE POLICY "Allow update password for approved subscribers"
ON public.subscribers
FOR UPDATE
TO anon, authenticated
USING (status = 'approved')
WITH CHECK (status = 'approved');

-- =========================================
-- VERIFICAR POLÍTICAS CRIADAS
-- =========================================

SELECT 
  schemaname, 
  tablename, 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'subscribers'
ORDER BY policyname;

-- =========================================
-- ✅ POLÍTICAS CRIADAS COM SUCESSO!
-- =========================================
-- 
-- Agora os associados podem:
-- 1. Fazer login (ler seus dados por CPF)
-- 2. Criar/atualizar senha
-- 
-- Teste em: http://localhost:8080/minha-conta
-- =========================================
