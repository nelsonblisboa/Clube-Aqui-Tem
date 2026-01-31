-- Cria um vendedor de teste ou atualiza a senha se já existir
-- Senha: "123456" (Hash SHA-256)

INSERT INTO "public"."sellers" ("name", "email", "phone", "slug", "status", "password_hash")
VALUES (
    'Vendedor Teste',
    'vendedor@teste.com',
    '11999999999',
    'vendedor-teste',
    'active',
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' -- Hash para '123456'
)
ON CONFLICT ("email") 
DO UPDATE SET 
    "password_hash" = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    "status" = 'active';

-- Confirmação
SELECT name, email, slug FROM "public"."sellers" WHERE email = 'vendedor@teste.com';
