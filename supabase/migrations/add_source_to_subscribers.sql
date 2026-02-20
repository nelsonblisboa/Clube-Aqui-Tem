-- Migration to add source column to subscribers
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Orgânico';

CREATE INDEX IF NOT EXISTS idx_subscribers_source ON public.subscribers(source);
