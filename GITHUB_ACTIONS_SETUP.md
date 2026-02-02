# 🤖 Como Ativar Deploy Automático com GitHub Actions

## 📋 O que é GitHub Actions?

GitHub Actions é uma plataforma de CI/CD (Integração Contínua/Deploy Contínuo) integrada ao GitHub que permite automatizar workflows, incluindo builds e deploys.

## ✅ Vantagens sobre Deploy Manual

| Característica | Deploy Manual (FTP) | GitHub Actions |
|----------------|---------------------|----------------|
| Automação | ⚠️ Precisa rodar comando | ✅ Automático no push |
| Build | 💻 Local | ☁️ No GitHub |
| Velocidade | ⚠️ Depende da internet local | ✅ Servidores rápidos |
| Histórico | ⚠️ Limitado | ✅ Completo no GitHub |
| Notificações | ❌ Não | ✅ Email/Slack/etc |
| Rollback | ⚠️ Manual | ✅ Fácil (revert commit) |

## 🚀 Como Ativar (Passo a Passo)

### 1. **Adicionar Senha FTP aos Secrets do GitHub**

#### a) Acesse seu repositório no GitHub:
```
https://github.com/nelsonblisboa/Clube-Aqui-Tem
```

#### b) Vá em **Settings** → **Secrets and variables** → **Actions**

#### c) Clique em **"New repository secret"**

#### d) Adicione o secret:
- **Name**: `FTP_PASSWORD`
- **Value**: `[sua_senha_ftp_aqui]`

#### e) Clique em **"Add secret"**

### 2. **Fazer Commit do Workflow**

O arquivo `.github/workflows/deploy.yml` já foi criado no seu projeto.

Agora basta fazer commit e push:

```bash
git add .github/workflows/deploy.yml
git add GITHUB_UMBLER_DEPLOY.md
git add GITHUB_ACTIONS_SETUP.md
git commit -m "Adiciona workflow GitHub Actions para deploy automático"
git push origin main
```

### 3. **Verificar se Funcionou**

#### a) Acesse a aba **Actions** no GitHub:
```
https://github.com/nelsonblisboa/Clube-Aqui-Tem/actions
```

#### b) Você verá o workflow rodando automaticamente

#### c) Aguarde a conclusão (leva ~2-3 minutos)

#### d) Se tudo estiver verde ✅, o deploy foi bem-sucedido!

## 📊 Como Funciona o Workflow

### Etapas Automáticas:

1. **Checkout** - Baixa o código do repositório
2. **Setup Node.js** - Configura ambiente Node.js 18
3. **Instalar Dependências** - Roda `npm ci`
4. **Build** - Executa `npm run build`
5. **Deploy FTP** - Envia arquivos para Umbler
6. **Notificação** - Confirma sucesso

### Arquivos Enviados:
- ✅ `dist/` - Frontend compilado
- ✅ `scripts/` - Backend scraper
- ✅ `server.js` - Servidor Node.js
- ✅ `package.json` e `package-lock.json`
- ✅ `.env` (se existir)

### Arquivos NÃO Enviados:
- ❌ `node_modules/` - Muito grande
- ❌ `src/` - Código fonte (não precisa)
- ❌ `.git/` - Controle de versão
- ❌ Arquivos de configuração de desenvolvimento
- ❌ Documentação (`.md`)

## 🔄 Workflow Diário

### Antes (Deploy Manual):
```bash
# 1. Fazer alterações no código
# 2. Testar localmente
npm run dev

# 3. Fazer commit
git add .
git commit -m "Minha alteração"
git push origin main

# 4. Fazer deploy manualmente
npm run deploy

# 5. Reiniciar na Umbler (manual)
```

### Depois (GitHub Actions):
```bash
# 1. Fazer alterações no código
# 2. Testar localmente
npm run dev

# 3. Fazer commit e push
git add .
git commit -m "Minha alteração"
git push origin main

# 4. ✨ PRONTO! Deploy automático acontece
# 5. ✨ Reiniciar na Umbler (ainda manual, mas pode automatizar)
```

## ⚙️ Configurações Avançadas

### Adicionar Notificações por Email

Adicione ao final do `deploy.yml`:

```yaml
      - name: Enviar notificação
        if: success()
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 465
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: ✅ Deploy realizado com sucesso!
          body: O deploy do Clube Aqui Tem foi concluído.
          to: seu-email@example.com
          from: GitHub Actions
```

### Deploy Apenas em Horários Específicos

Modificar o `on:` no `deploy.yml`:

```yaml
on:
  push:
    branches:
      - main
  schedule:
    - cron: '0 2 * * *'  # Todo dia às 2h da manhã
```

### Deploy Manual (Quando Quiser)

Adicionar ao `on:`:

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:  # Permite executar manualmente
```

## 🐛 Troubleshooting

### ❌ Erro: "FTP_PASSWORD not found"
**Solução**: Adicione o secret no GitHub (passo 1)

### ❌ Erro: "Build failed"
**Solução**: Verifique se o build funciona localmente (`npm run build`)

### ❌ Erro: "FTP connection failed"
**Solução**: Verifique credenciais FTP e firewall

### ❌ Deploy funcionou mas site não atualizou
**Solução**: Reinicie a aplicação no painel da Umbler

## 📈 Monitoramento

### Ver Histórico de Deploys:
```
https://github.com/nelsonblisboa/Clube-Aqui-Tem/actions
```

### Ver Logs Detalhados:
1. Clique no workflow
2. Clique no job "deploy"
3. Veja cada etapa expandida

### Receber Notificações:
- GitHub envia email automaticamente se falhar
- Configure notificações personalizadas (Slack, Discord, etc.)

## 🎯 Quando Usar GitHub Actions?

### ✅ Use se:
- Você faz deploys frequentes (várias vezes por dia)
- Trabalha em equipe (vários desenvolvedores)
- Quer histórico completo de deploys
- Quer automatização total

### ⚠️ Continue com FTP Manual se:
- Faz deploy raramente (1x por semana)
- Trabalha sozinho
- Prefere controle manual
- Quer simplicidade

## 📝 Checklist de Ativação

- [ ] Adicionar `FTP_PASSWORD` aos Secrets do GitHub
- [ ] Fazer commit do arquivo `deploy.yml`
- [ ] Fazer push para `main`
- [ ] Verificar execução na aba Actions
- [ ] Confirmar deploy bem-sucedido
- [ ] Reiniciar aplicação na Umbler
- [ ] Testar site em produção

## 🔒 Segurança

### ✅ Boas Práticas:
- ✅ Senha FTP em Secret (nunca no código)
- ✅ `.env` no `.gitignore`
- ✅ Secrets criptografados pelo GitHub
- ✅ Logs públicos não mostram senhas

### ⚠️ Cuidados:
- Não compartilhe secrets
- Não faça commit de senhas
- Revise permissões do repositório

## 📚 Recursos Adicionais

- **Documentação GitHub Actions**: https://docs.github.com/en/actions
- **Marketplace de Actions**: https://github.com/marketplace?type=actions
- **FTP Deploy Action**: https://github.com/SamKirkland/FTP-Deploy-Action

---

## 🎯 Decisão Final

### Opção A: Ativar GitHub Actions Agora
```bash
# Siga os passos 1, 2 e 3 acima
```

### Opção B: Continuar com Deploy Manual
```bash
# Continue usando: npm run deploy
# (Funciona perfeitamente!)
```

**Ambas as opções são válidas!** Escolha a que melhor se adequa ao seu workflow.

---

**Dúvidas?** Consulte a documentação ou abra uma issue no GitHub! 😊
