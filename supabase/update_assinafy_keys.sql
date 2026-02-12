-- Atualizando as credenciais da Assinafy na tabela de configurações
UPDATE assinafy_settings
SET 
    account_id = '101aaabd4905ac9ceeeca3cdcead',
    api_key = 'HUBNLG1ksZNSwp7OSLu2HN7MhmygK0a3EfunRnrQlizCjqL6UyJV_sXNfangqITR',
    template_id_partner = '101ad9795752f6159793ec1551ee'
WHERE id = (SELECT id FROM assinafy_settings LIMIT 1);

-- Caso a tabela esteja vazia, insere o primeiro registro
INSERT INTO assinafy_settings (account_id, api_key, template_id_partner)
SELECT '101aaabd4905ac9ceeeca3cdcead', 'HUBNLG1ksZNSwp7OSLu2HN7MhmygK0a3EfunRnrQlizCjqL6UyJV_sXNfangqITR', '101ad9795752f6159793ec1551ee'
WHERE NOT EXISTS (SELECT 1 FROM assinafy_settings);

