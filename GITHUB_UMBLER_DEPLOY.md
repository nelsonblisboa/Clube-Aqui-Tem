# 🔄 Configuração de Deploy Automático GitHub → Umbler

## 📋 O que é Deploy Automático?

A Umbler oferece uma funcionalidade de **deploy automático** que conecta seu repositório GitHub diretamente ao servidor. Cada vez que você faz um `git push` para a branch `main` (ou `master`), o código é automaticamente publicado no servidor.

## ✅ Vantagens do Deploy Automático

- ✅ **Sem FTP**: Não precisa mais usar FTP manualmente
- ✅ **Automático**: Push no GitHub = Deploy automático
- ✅ **Rápido**: Publicação em segundos após o push
- ✅ **Seguro**: Sem necessidade de senhas FTP
- ✅ **Rastreável**: Todo deploy fica registrado no Git

## 🔧 Como Configurar (Passo a Passo)

### 1. **Acessar o Painel da Umbler**
   - Acesse: https://app.umbler.com/
   - Faça login na sua conta

### 2. **Conectar sua Conta GitHub**
   - No painel da Umbler, vá para a seção de **Deploy**
   - Clique em **"Conectar com GitHub"**
   - Autorize a Umbler a acessar seu GitHub
   - Selecione o repositório: **nelsonblisboa/Clube-Aqui-Tem**

### 3. **Configurar o Repositório**
   - **Repositório**: `nelsonblisboa/Clube-Aqui-Tem`
   - **Branch**: `main` (ou `master` se for o caso)
   - **Diretório de Destino**: Escolha onde o código será publicado (geralmente `/`)

### 4. **Ativar Deploy Automático**
   - Marque a opção **"Deploy Automático"**
   - Salve as configurações

## ⚠️ IMPORTANTE: Diferenças de Configuração

### 🔴 Problema Atual: Seu Projeto é Node.js + React

O deploy automático da Umbler funciona melhor para projetos **estáticos** (HTML, CSS, JS). 

Seu projeto é **híbrido** (React + Node.js), então precisa de configurações especiais:

#### **Arquivos que DEVEM estar no servidor:**
```
📁 Estrutura no Servidor Umbler:
├── dist/              ← Frontend (React compilado)
├── scripts/           ← Backend (Scraper)
├── server.js          ← Servidor Node.js
├── package.json
├── package-lock.json
└── .env              ← Variáveis de ambiente
```

#### **Problema**: 
O deploy automático do GitHub enviaria **todo o código fonte** (`src/`, `node_modules/`, etc.), mas você precisa apenas do **build de produção** (`dist/`).

## 🎯 Soluções Recomendadas

### **Opção 1: Deploy Manual via FTP (Atual - Recomendado)**

✅ **Vantagens:**
- Controle total sobre o que é enviado
- Envia apenas build de produção
- Limpeza automática de arquivos antigos
- Já está configurado e funcionando

**Como usar:**
```bash
npm run deploy
```

### **Opção 2: Deploy Automático com GitHub Actions**

Criar um workflow GitHub Actions que:
1. Faz build do projeto (`npm run build`)
2. Envia apenas a pasta `dist/` via FTP
3. Reinicia o servidor automaticamente

**Vantagens:**
- Deploy automático a cada push
- Build é feito no GitHub (não localmente)
- Mais profissional

**Desvantagens:**
- Requer configuração de GitHub Actions
- Precisa armazenar credenciais FTP no GitHub Secrets

### **Opção 3: Deploy Automático Umbler + Build Manual**

Configurar deploy automático da Umbler, mas:
1. Fazer build localmente antes do push
2. Commitar a pasta `dist/` no Git
3. Push envia tudo automaticamente

**Vantagens:**
- Simples de configurar
- Usa recurso nativo da Umbler

**Desvantagens:**
- Pasta `dist/` fica no Git (não é ideal)
- Build manual antes de cada deploy

## 📊 Comparação das Opções

| Característica | FTP Manual | GitHub Actions | Umbler Auto |
|----------------|------------|----------------|-------------|
| Automação | ⚠️ Semi | ✅ Total | ⚠️ Semi |
| Configuração | ✅ Fácil | ⚠️ Média | ✅ Fácil |
| Build | Local | GitHub | Local |
| Controle | ✅ Total | ✅ Total | ⚠️ Limitado |
| Limpeza | ✅ Sim | ✅ Sim | ❌ Não |

## 🚀 Recomendação Final

### **Para Agora: Continue com FTP Manual**
Seu script atual (`npm run deploy`) está:
- ✅ Funcionando bem
- ✅ Com limpeza automática
- ✅ Enviando apenas o necessário
- ✅ Fácil de usar

### **Para o Futuro: Migrar para GitHub Actions**
Quando quiser automatizar 100%, implemente GitHub Actions.

## 📝 Checklist de Verificação

### ✅ Seu Projeto Atual:
- ✅ Repositório no GitHub: `nelsonblisboa/Clube-Aqui-Tem`
- ✅ Branch principal: `main`
- ✅ Build otimizado: Sim (960KB + chunks)
- ✅ Script de deploy: Sim (`npm run deploy`)
- ✅ Limpeza automática: Sim
- ✅ Documentação: Completa

### ⚠️ Deploy Automático Umbler:
- ❌ Não configurado (e não é ideal para este projeto)
- ❌ Não recomendado para projetos Node.js híbridos

### ✅ Alternativa Atual:
- ✅ Deploy via FTP funcional
- ✅ Comando simples: `npm run deploy`
- ✅ Controle total do processo

## 🔧 Se Quiser Configurar Deploy Automático Umbler

### Passos:
1. Acesse: https://app.umbler.com/
2. Vá em **Deploy** → **GitHub**
3. Conecte sua conta GitHub
4. Selecione: `nelsonblisboa/Clube-Aqui-Tem`
5. Branch: `main`
6. Diretório: `/`

### ⚠️ Mas lembre-se:
- Você precisará commitar a pasta `dist/` no Git
- Não terá limpeza automática de arquivos antigos
- Pode ter conflitos com arquivos residuais

## 📚 Documentação Relacionada

- **Artigo Umbler**: https://blog.umbler.com/br/do-github-a-umbler-em-apenas-um-push/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Deploy FTP Atual**: Ver `deploy-ftp.js`

## 🎯 Conclusão

**Seu projeto ESTÁ configurado corretamente!** 

Você está usando a melhor abordagem para um projeto Node.js + React:
- ✅ Build local otimizado
- ✅ Deploy via FTP com limpeza
- ✅ Controle total do processo
- ✅ Documentação completa

O deploy automático da Umbler é excelente para **sites estáticos**, mas para **aplicações Node.js híbridas** como a sua, o método atual (FTP com build) é mais adequado.

---

**Quer automatizar 100%?** Considere implementar **GitHub Actions** no futuro.

**Por enquanto?** Continue usando `npm run deploy` - está perfeito! ✅
