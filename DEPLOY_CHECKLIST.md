# 📋 Checklist de Deploy - Clube Aqui Tem

## ✅ Pré-Deploy (Antes de Enviar)

### 1. Verificações Locais
- [ ] Testar o sistema localmente (`npm run dev`)
- [ ] Verificar se todas as funcionalidades estão funcionando
- [ ] Testar formulários e integrações (EmailJS, Mercado Pago, etc.)
- [ ] Verificar se o scraper de cupons está funcionando
- [ ] Revisar console do navegador para erros

### 2. Variáveis de Ambiente
- [ ] Verificar se o arquivo `.env` está atualizado
- [ ] Confirmar credenciais do Supabase
- [ ] Confirmar credenciais do EmailJS
- [ ] Confirmar credenciais do Mercado Pago
- [ ] Verificar senha FTP no `.env` (`FTP_PASSWORD`)

### 3. Build de Produção
- [ ] Executar `npm run build` localmente
- [ ] Verificar se a pasta `dist` foi criada
- [ ] Verificar tamanho dos bundles (não devem ser muito grandes)
- [ ] Testar o build localmente com `npm start`

## 🚀 Deploy (Envio para Servidor)

### 4. Executar Deploy
```bash
npm run deploy
```

### 5. Verificações Pós-Upload
- [ ] Confirmar que todos os arquivos foram enviados (verificar logs)
- [ ] Verificar se não houve erros de FTP
- [ ] Confirmar mensagem de sucesso no terminal

## 🔄 Pós-Deploy (No Servidor Umbler)

### 6. Configurações no Painel Umbler
- [ ] Acessar painel da Umbler
- [ ] Verificar se as variáveis de ambiente estão configuradas
- [ ] **IMPORTANTE**: Clicar em **"Restart"** na aplicação Node.js
- [ ] Aguardar reinicialização (pode levar 1-2 minutos)

### 7. Testes em Produção
- [ ] Acessar o site em produção
- [ ] Limpar cache do navegador (`Ctrl + Shift + Delete`)
- [ ] Ou testar em modo anônimo (`Ctrl + Shift + N`)
- [ ] Verificar se a página inicial carrega corretamente
- [ ] Testar navegação entre páginas
- [ ] Testar formulário de contato
- [ ] Testar área de membros (login)
- [ ] Testar painel administrativo
- [ ] Testar atualização de cupons (scraper)

### 8. Verificações de Performance
- [ ] Verificar tempo de carregamento da página
- [ ] Testar em dispositivos móveis
- [ ] Verificar se imagens estão carregando
- [ ] Verificar se não há erros no console do navegador

## 🐛 Troubleshooting

### Se o site não atualizar:
1. Limpar cache do navegador
2. Verificar se o restart foi feito na Umbler
3. Aguardar 2-3 minutos (propagação)
4. Verificar logs de erro no painel Umbler

### Se houver erro 404 em rotas:
1. Verificar se o arquivo `.htaccess` ou `web.config` está no servidor
2. Verificar se o `server.js` está com a rota SPA habilitada
3. Reiniciar aplicação na Umbler

### Se o scraper não funcionar:
1. Verificar credenciais do Supabase no `.env` do servidor
2. Verificar se a pasta `scripts` foi enviada corretamente
3. Verificar logs de erro no painel Umbler

## 📝 Notas Importantes

- **Sempre faça backup** antes de deploy em produção
- **Teste localmente** antes de fazer deploy
- **Documente mudanças** importantes no Git
- **Comunique a equipe** sobre deploys em produção
- **Monitore erros** após o deploy por pelo menos 30 minutos

## 🔗 Links Úteis

- **Repositório GitHub**: https://github.com/nelsonblisboa/Clube-Aqui-Tem
- **Painel Umbler**: https://app.umbler.com/
- **Documentação Deploy**: Ver `DEPLOY_INSTRUCTIONS.md`
