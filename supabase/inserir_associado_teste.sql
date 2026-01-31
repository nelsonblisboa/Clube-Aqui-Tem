-- =========================================
-- INSERIR ASSOCIADO DE TESTE PARA VALIDAÇÃO DE CPF
-- =========================================

-- Inserir um associado com status 'approved' para testes
INSERT INTO public.subscribers (
    name,
    email,
    cpf,
    phone,
    address,
    status
) VALUES (
    'João da Silva',
    'joao.silva@teste.com',
    '12345678901', -- CPF sem formatação
    '(11) 98765-4321',
    'Rua Teste, 123 - São Paulo - SP',
    'approved'
) ON CONFLICT (cpf) DO NOTHING;

-- Inserir mais alguns associados para teste
INSERT INTO public.subscribers (
    name,
    email,
    cpf,
    phone,
    address,
    status
) VALUES 
(
    'Maria Oliveira',
    'maria.oliveira@teste.com',
    '98765432100',
    '(21) 99876-5432',
    'Av. Principal, 456 - Rio de Janeiro - RJ',
    'approved'
),
(
    'Carlos Souza',
    'carlos.souza@teste.com',
    '11122233344',
    '(11) 91234-5678',
    'Rua das Flores, 789 - São Paulo - SP',
    'approved'
) ON CONFLICT (cpf) DO NOTHING;

-- Verificar os associados inseridos
SELECT 
    id,
    name,
    email,
    cpf,
    phone,
    status,
    created_at
FROM public.subscribers
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 10;

-- =========================================
-- TESTE DA FUNÇÃO DE VALIDAÇÃO
-- =========================================

-- Testar com um CPF válido
SELECT * FROM public.validate_subscriber_cpf(
    '12345678901',
    (SELECT id FROM public.partner_accounts LIMIT 1)
);

-- =========================================
-- CONSULTAR HISTÓRICO DE VALIDAÇÕES
-- =========================================

SELECT 
    pv.id,
    pv.cpf_consultado,
    pv.associado_valido,
    pv.subscriber_name,
    pv.consulted_at,
    pa.nome_estabelecimento
FROM public.cpf_validations pv
JOIN public.partner_accounts pa ON pv.partner_id = pa.id
ORDER BY pv.consulted_at DESC
LIMIT 10;
