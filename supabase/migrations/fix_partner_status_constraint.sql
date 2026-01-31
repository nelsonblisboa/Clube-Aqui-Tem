-- =========================================
-- FIX: Adicionar 'pending' ao check constraint de status
-- =========================================

-- Remover constraint antiga
ALTER TABLE public.partner_accounts 
DROP CONSTRAINT IF EXISTS partner_accounts_status_check;

-- Adicionar nova constraint com 'pending'
ALTER TABLE public.partner_accounts
ADD CONSTRAINT partner_accounts_status_check 
CHECK (status IN ('active', 'inactive', 'suspended', 'pending'));

-- Verificar constraint atualizada
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.partner_accounts'::regclass
  AND conname = 'partner_accounts_status_check';

SELECT '✅ Constraint atualizada com sucesso! Agora aceita: active, inactive, suspended, pending' AS status;
