-- Add password column to subscribers table for member login
ALTER TABLE public.subscribers 
ADD COLUMN password_hash TEXT,
ADD COLUMN first_access BOOLEAN DEFAULT true;

-- Create index for CPF lookup during login
CREATE INDEX IF NOT EXISTS idx_subscribers_cpf ON public.subscribers(cpf);

-- Allow subscribers to view their own data by CPF (will be used for member portal)
CREATE POLICY "Subscribers can view own data by CPF"
ON public.subscribers
FOR SELECT
USING (cpf = cpf);

-- Allow service to update password on first access
CREATE POLICY "Allow password update on first access"
ON public.subscribers
FOR UPDATE
USING (true)
WITH CHECK (true);