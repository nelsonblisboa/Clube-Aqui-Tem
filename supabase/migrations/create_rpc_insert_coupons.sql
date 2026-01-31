-- Função RPC para inserir cupons em massa ignorando RLS (SECURITY DEFINER)
-- Isso permite que o script Node.js insira dados mesmo sem a chave service_role, desde que autenticado como anon

CREATE OR REPLACE FUNCTION insert_external_coupons_bulk(coupons_json JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios de admin/criador da função
AS $$
DECLARE
  coupon RECORD;
BEGIN
  FOR coupon IN SELECT * FROM jsonb_to_recordset(coupons_json) AS x(
    source_platform TEXT,
    store_name TEXT,
    title TEXT,
    description TEXT,
    discount_value TEXT,
    category TEXT,
    destination_url TEXT,
    expiration_date DATE,
    is_active BOOLEAN
  )
  LOOP
    -- Tenta inserir ou ignorar se já existir (com base na constraint UNIQUE)
    INSERT INTO public.external_coupons (
      source_platform, store_name, title, description, discount_value, category, destination_url, expiration_date, is_active
    ) VALUES (
      coupon.source_platform,
      coupon.store_name,
      coupon.title,
      coupon.description,
      coupon.discount_value,
      coupon.category,
      coupon.destination_url,
      coupon.expiration_date,
      coupon.is_active
    )
    ON CONFLICT (source_platform, store_name, title) 
    DO UPDATE SET 
      last_checked_at = NOW(),
      is_active = TRUE; -- Reativa se foi encontrado novamente
  END LOOP;
END;
$$;

-- Garante permissão para 'anon' chamar essa função (necessário para o script local funcionar)
GRANT EXECUTE ON FUNCTION insert_external_coupons_bulk(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION insert_external_coupons_bulk(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_external_coupons_bulk(JSONB) TO service_role;

SELECT 'Função RPC criada com sucesso. Agora o script scraper funcionará sem erros de RLS!' as status;
