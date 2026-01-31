-- =========================================
-- CORREÇÕES DE SEGURANÇA - CLUBE AQUI TEM
-- =========================================
-- Execute este script no SQL Editor do Supabase
-- para corrigir as políticas RLS inseguras

-- 1. REMOVER POLÍTICAS INSEGURAS
-- =========================================

DROP POLICY IF EXISTS "Subscribers can view own data by CPF" ON public.subscribers;
DROP POLICY IF EXISTS "Allow password update on first access" ON public.subscribers;

-- 2. ADICIONAR CONSTRAINTS E ÍNDICES
-- =========================================

-- Garantir que CPF seja único
ALTER TABLE public.subscribers 
ADD CONSTRAINT IF NOT EXISTS subscribers_cpf_unique UNIQUE (cpf);

-- Criar índice para external_reference (usado no webhook)
CREATE INDEX IF NOT EXISTS idx_subscribers_external_reference 
ON public.subscribers(external_reference);

-- Criar índice para email (usado em buscas)
CREATE INDEX IF NOT EXISTS idx_subscribers_email 
ON public.subscribers(email);

-- 3. CRIAR POLÍTICAS SEGURAS
-- =========================================

-- Permitir que service role (Edge Functions) gerencie subscribers
CREATE POLICY "Service role can manage subscribers"
ON public.subscribers
FOR ALL
USING (
  auth.jwt()->>'role' = 'service_role' OR
  auth.role() = 'service_role'
);

-- Permitir inserção anônima (para cadastro inicial)
CREATE POLICY "Anyone can insert subscribers"
ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- 4. VERIFICAR POLÍTICAS EXISTENTES
-- =========================================

-- Execute esta query para ver todas as políticas atuais:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'subscribers';

-- 5. ADICIONAR ENUM PARA STATUS (se não existir)
-- =========================================

-- Verificar se o enum existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM (
            'pending',
            'approved', 
            'rejected',
            'cancelled',
            'refunded'
        );
    END IF;
END $$;

-- 6. GARANTIR QUE COLUNA STATUS USE O ENUM
-- =========================================

-- Se a coluna status não estiver usando o enum, execute:
-- ALTER TABLE public.subscribers 
-- ALTER COLUMN status TYPE subscription_status 
-- USING status::subscription_status;

-- 7. ADICIONAR TRIGGER PARA UPDATED_AT
-- =========================================

-- Criar função de trigger se não existir
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar trigger se não existir
DROP TRIGGER IF EXISTS subscribers_updated_at ON public.subscribers;
CREATE TRIGGER subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =========================================
-- VERIFICAÇÕES PÓS-EXECUÇÃO
-- =========================================

-- Execute estas queries para verificar se tudo foi aplicado corretamente:

-- 1. Verificar constraints
-- SELECT conname, contype FROM pg_constraint WHERE conrelid = 'public.subscribers'::regclass;

-- 2. Verificar índices
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'subscribers';

-- 3. Verificar políticas RLS
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'subscribers';

-- 4. Verificar se RLS está habilitado
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'subscribers';
