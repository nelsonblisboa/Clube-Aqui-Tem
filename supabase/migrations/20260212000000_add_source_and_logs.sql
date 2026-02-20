-- Migration to add source column and mercadopago_logs table
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Orgânico';

CREATE INDEX IF NOT EXISTS idx_subscribers_source ON public.subscribers(source);

-- Create table for Mercado Pago logs
CREATE TABLE IF NOT EXISTS public.mercadopago_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT,
    action TEXT,
    payment_id TEXT,
    external_reference TEXT,
    status TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mercadopago_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view mercadopago_logs"
ON public.mercadopago_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
