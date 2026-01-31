-- Create table for tracking seller analytics events
CREATE TABLE IF NOT EXISTS public.seller_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('whatsapp_click', 'checkout_intent', 'page_view')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Enable RLS
ALTER TABLE public.seller_events ENABLE ROW LEVEL SECURITY;

-- Allow public insertion (for the public seller pages)
CREATE POLICY "Public can insert events"
ON public.seller_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow admins to view all events
CREATE POLICY "Admins can view all events"
ON public.seller_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_events_seller_id ON public.seller_events(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_events_type ON public.seller_events(event_type);
CREATE INDEX IF NOT EXISTS idx_seller_events_created_at ON public.seller_events(created_at DESC);
