-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'refunded');

-- Create subscribers table
CREATE TABLE public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    status subscription_status NOT NULL DEFAULT 'pending',
    mercadopago_payment_id TEXT,
    mercadopago_preference_id TEXT,
    external_reference TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    discount_applied BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Policy for public insert (when user fills form)
CREATE POLICY "Anyone can insert subscribers"
ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Policy for service role to update (webhook)
CREATE POLICY "Service role can update subscribers"
ON public.subscribers
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy for admins to view all subscribers
CREATE POLICY "Admins can view all subscribers"
ON public.subscribers
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_subscribers_external_reference ON public.subscribers(external_reference);
CREATE INDEX idx_subscribers_cpf ON public.subscribers(cpf);
CREATE INDEX idx_subscribers_email ON public.subscribers(email);