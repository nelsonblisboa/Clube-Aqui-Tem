
-- Add photo_url to subscribers if it doesn't exist
ALTER TABLE "public"."subscribers" 
ADD COLUMN IF NOT EXISTS "photo_url" text;

-- Add created_at if it doesn't exist (it likely does, but ensuring)
ALTER TABLE "public"."subscribers" 
ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now();

-- Create a storage bucket for member photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow subscribers to upload their own photos
-- Note: This assumes authenticated users (which are subscribers in this context if we use auth)
-- But currently our AreaMembros uses a custom login flow, not Supabase Auth directly (it sets localStorage).
-- This is a bit tricky for Storage RLS if we rely on supabase.auth.user().
-- Since the user logs in via a custom flow (checking table password_hash), they are NOT authenticated in `auth.users`.
-- So standard Storage RLS won't work easily unless we sign them in anonymously or use a public bucket for read/write (less secure) or use a workaround.
-- However, for this demo, we might have to make the bucket public or allow generic public uploads (risky but functional for this prototype).
-- OR, better, we can assume the frontend client is initialized with a key that allows upload, or we make the bucket public.
-- Let's make the bucket public for reads. For writes, if we are not using Supabase Auth, we might need to use the service role key or just allow public inserts for now (simplest for "prototype").

-- Drop existing policies if they exist to prevent errors on re-run
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;

-- Allow public access to read member photos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'member-photos' );

-- Allow public access to insert member photos (for the custom auth flow)
CREATE POLICY "Public Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'member-photos' );

-- Allow update
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'member-photos' );
