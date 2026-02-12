-- Migration: Add Assinafy integration fields
-- Tables affected: subscribers, partner_accounts, sellers
-- New table: assinafy_settings

-- 1. Create assinafy_settings table
CREATE TABLE IF NOT EXISTS public.assinafy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id TEXT NOT NULL,
    api_key TEXT NOT NULL,
    account_id_subscriber TEXT,
    account_id_partner TEXT,
    account_id_seller TEXT,
    template_id_subscriber TEXT,
    template_id_partner TEXT,
    template_id_seller TEXT,
    webhook_secret TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure only one row exists in settings
CREATE UNIQUE INDEX IF NOT EXISTS single_settings_row ON public.assinafy_settings ((id IS NOT NULL));

-- Enable RLS for settings
ALTER TABLE public.assinafy_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can see/edit settings
DROP POLICY IF EXISTS admin_access_settings ON public.assinafy_settings;

CREATE POLICY admin_access_settings ON public.assinafy_settings
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    ));

-- 2. Add fields to subscribers
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscribers' AND column_name = 'assinafy_document_id') THEN
        ALTER TABLE public.subscribers 
        ADD COLUMN assinafy_document_id TEXT,
        ADD COLUMN assinafy_assignment_id TEXT,
        ADD COLUMN signature_status TEXT DEFAULT 'pending',
        ADD COLUMN signature_url TEXT,
        ADD COLUMN signed_at TIMESTAMPTZ,
        ADD COLUMN otp_token TEXT,
        ADD COLUMN otp_expires_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Add fields to partner_accounts
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_accounts' AND column_name = 'assinafy_document_id') THEN
        ALTER TABLE public.partner_accounts 
        ADD COLUMN assinafy_document_id TEXT,
        ADD COLUMN assinafy_assignment_id TEXT,
        ADD COLUMN signature_status TEXT DEFAULT 'pending',
        ADD COLUMN signature_url TEXT,
        ADD COLUMN signed_at TIMESTAMPTZ,
        ADD COLUMN otp_token TEXT,
        ADD COLUMN otp_expires_at TIMESTAMPTZ;
    END IF;
END $$;

-- 4. Add fields to sellers
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sellers' AND column_name = 'assinafy_document_id') THEN
        ALTER TABLE public.sellers 
        ADD COLUMN assinafy_document_id TEXT,
        ADD COLUMN assinafy_assignment_id TEXT,
        ADD COLUMN signature_status TEXT DEFAULT 'pending',
        ADD COLUMN signature_url TEXT,
        ADD COLUMN signed_at TIMESTAMPTZ,
        ADD COLUMN otp_token TEXT,
        ADD COLUMN otp_expires_at TIMESTAMPTZ;
    END IF;
END $$;
