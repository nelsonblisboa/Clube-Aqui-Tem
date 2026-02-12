-- Add Evolution API fields to assinafy_settings
ALTER TABLE public.assinafy_settings 
ADD COLUMN IF NOT EXISTS evolution_api_url TEXT,
ADD COLUMN IF NOT EXISTS evolution_api_key TEXT,
ADD COLUMN IF NOT EXISTS evolution_instance TEXT DEFAULT 'default';
