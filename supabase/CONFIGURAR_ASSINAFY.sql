-- INSTRUÇÃO:
-- 1. Abra o SQL Editor do Supabase (https://supabase.com/dashboard/project/wmivufnnbsvmeyjapjzx/sql)
-- 2. Copie e cole este comando substituindo 'SUA_API_KEY_AQUI' pela chave real da Assinafy
-- 3. Execute o comando

INSERT INTO public.assinafy_settings (account_id, api_key)
VALUES (
  '10193faa9cfb527bff1fdcb19c32', 
  'LHVJEHhuBDlrXoiU8omyIXp2i2XKGv-fa7sKlVOK4KQfxcJjscMk7eiDkEmPsylh' -- <--- COLE SUA API KEY DENTRO DAS ASPAS
)
ON CONFLICT (id) DO UPDATE 
SET api_key = EXCLUDED.api_key;
