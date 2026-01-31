-- Adicionar coluna de logo_url na tabela de parceiros
ALTER TABLE public.partner_accounts ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Garantir que o bucket de logos de parceiros exista
-- Nota: A criação de buckets via SQL requer permissões de admin e geralmente é feita via dashboard ou scripts específicos, 
-- mas deixamos aqui como referência.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket partner-logos
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'partner-logos');
CREATE POLICY "Anyone can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'partner-logos');
