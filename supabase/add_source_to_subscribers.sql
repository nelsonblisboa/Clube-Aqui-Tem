-- Adiciona coluna 'source' na tabela subscribers se não existir
ALTER TABLE "public"."subscribers" 
ADD COLUMN IF NOT EXISTS "source" text;

-- Garante que 'seller_id' existe (embora provavelmente já exista)
ALTER TABLE "public"."subscribers" 
ADD COLUMN IF NOT EXISTS "seller_id" uuid REFERENCES "public"."sellers"("id");

-- Opcional: Indexar para melhorar performance de filtros futuros
CREATE INDEX IF NOT EXISTS "subscribers_source_idx" ON "public"."subscribers" ("source");
