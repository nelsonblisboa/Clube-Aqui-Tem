-- 1. Garante que as colunas necessárias Existem
ALTER TABLE "public"."sellers" 
ADD COLUMN IF NOT EXISTS "password_hash" text;

ALTER TABLE "public"."sellers" 
ADD COLUMN IF NOT EXISTS "last_login" timestamptz;

-- 2. Cria ou Atualiza o Vendedor de Teste
-- Senha: "123456" (Hash SHA-256: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92)

INSERT INTO "public"."sellers" ("name", "email", "phone", "slug", "status", "password_hash")
VALUES (
    'Vendedor Teste',
    'vendedor@teste.com',
    '11999999999',
    'vendedor-teste',
    'active',
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
)
ON CONFLICT ("email") 
DO UPDATE SET 
    "password_hash" = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    "status" = 'active',
    "slug" = 'vendedor-teste'; -- Garante que o slug esteja correto também

-- 3. Verifica o resultado
SELECT name, email, slug, password_hash FROM "public"."sellers" WHERE email = 'vendedor@teste.com';
