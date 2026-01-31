-- Adiciona coluna de senha para vendedores
ALTER TABLE "public"."sellers" 
ADD COLUMN IF NOT EXISTS "password_hash" text;

-- Adiciona coluna de last_login se não existir
ALTER TABLE "public"."sellers" 
ADD COLUMN IF NOT EXISTS "last_login" timestamptz;
