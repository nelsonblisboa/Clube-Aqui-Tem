# 📦 GUIA DE UPLOAD MANUAL - Clube Aqui Tem

## ✅ BUILD CONCLUÍDO COM SUCESSO!

**Data**: 02/02/2026 às 15:46  
**Tempo de build**: 25.95 segundos  
**Status**: Pronto para upload

---

## 📁 ARQUIVOS PRONTOS PARA ENVIAR

### 🎯 **LOCALIZAÇÃO DOS ARQUIVOS:**

Todos os arquivos estão em:
```
c:\Users\Nelson\Downloads\clubeaquitem\
```

---

## 📋 **LISTA COMPLETA DE ARQUIVOS PARA UPLOAD:**

### 1️⃣ **PASTA `dist/` (COMPLETA)** ⭐ MAIS IMPORTANTE
```
📁 dist/
├── 📄 index.html                    (2.35 kB)
├── 📄 .htaccess                     (Configuração Apache)
├── 📄 web.config                    (Configuração IIS)
├── 📄 favicon.ico                   (7.48 kB)
├── 📄 favicon.png                   (1.18 MB)
├── 📄 manifest.json                 (856 B)
├── 📄 robots.txt                    (169 B)
├── 📄 placeholder.svg               (3.25 kB)
└── 📁 assets/
    ├── 📄 index-BA1VFfoc.css        (122.53 kB)
    ├── 📄 index-CPx1vWoe.js         (960.34 kB)
    ├── 📄 react-vendor-CA0dLT8Z.js  (161.24 kB)
    ├── 📄 ui-vendor-zBF06GI4.js     (82.75 kB)
    ├── 📄 supabase-CMWJ4fro.js      (129.01 kB)
    ├── 📄 utils-Dz6XCny9.js         (117.43 kB)
    ├── 🖼️ horizon-logo-BGkYBlvN.png  (33.03 kB)
    ├── 🖼️ porto-seguro-logo-CcPkpudG.png (102.54 kB)
    ├── 🖼️ hero-image-CfOo4cDc.jpg    (200.41 kB)
    ├── 🖼️ happy-family-DYX7gC2x.png  (698.11 kB)
    ├── 🖼️ landing_hero_family_shopping_1769204213600-CGBRzBbl.png (704.15 kB)
    ├── 🖼️ happy_savings_celebration-BLWvdj6y.png (727.34 kB)
    ├── 🖼️ happy_members_clube_1769198845511-ByUnJvru.png (822.87 kB)
    └── 🖼️ logo-PIMirHS5.png          (1.18 MB)
```

### 2️⃣ **PASTA `scripts/` (COMPLETA)**
```
📁 scripts/
└── 📄 scraper.js                    (Backend - Robô de cupons)
```

### 3️⃣ **ARQUIVOS RAIZ**
```
📄 server.js                         (Servidor Node.js)
📄 package.json                      (Dependências)
📄 package-lock.json                 (Lock de versões)
📄 .env                              (Variáveis de ambiente)
```

---

## 🚀 **OPÇÕES DE UPLOAD:**

### **OPÇÃO 1: Via Painel Umbler (Recomendado para iniciantes)**

#### Passo a Passo:

1. **Acesse**: https://app.umbler.com/
2. **Faça login** na sua conta
3. **Vá para**: Gerenciador de Arquivos
4. **Faça upload**:
   
   **A) Pasta dist/ completa:**
   - Clique em "Upload de pasta" ou "Upload"
   - Selecione a pasta: `c:\Users\Nelson\Downloads\clubeaquitem\dist`
   - Aguarde upload completo
   
   **B) Pasta scripts/ completa:**
   - Selecione a pasta: `c:\Users\Nelson\Downloads\clubeaquitem\scripts`
   - Aguarde upload completo
   
   **C) Arquivos raiz (um por um ou selecionados):**
   - `c:\Users\Nelson\Downloads\clubeaquitem\server.js`
   - `c:\Users\Nelson\Downloads\clubeaquitem\package.json`
   - `c:\Users\Nelson\Downloads\clubeaquitem\package-lock.json`
   - `c:\Users\Nelson\Downloads\clubeaquitem\.env`

5. **Reinicie a aplicação**:
   - Vá para a seção da aplicação Node.js
   - Clique em "Restart" ou "Reiniciar"
   - Aguarde 1-2 minutos

---

### **OPÇÃO 2: Via Cliente FTP (FileZilla, WinSCP, etc.)**

#### Credenciais FTP:
```
Host: alderaan07.umbler.host
Porta: 21
Usuário: clubeaquitem-com-br
Senha: Y4V@FY)MuV=#+PS
```

#### Passo a Passo:

1. **Abra seu cliente FTP** (FileZilla, WinSCP, etc.)

2. **Conecte ao servidor** usando as credenciais acima

3. **No lado esquerdo** (seu computador):
   - Navegue até: `c:\Users\Nelson\Downloads\clubeaquitem`

4. **No lado direito** (servidor):
   - Certifique-se de estar na raiz (`/`)

5. **Arraste e solte**:
   - Pasta `dist/` → Servidor
   - Pasta `scripts/` → Servidor
   - Arquivo `server.js` → Servidor
   - Arquivo `package.json` → Servidor
   - Arquivo `package-lock.json` → Servidor
   - Arquivo `.env` → Servidor

6. **Aguarde** o upload completo

7. **Reinicie** a aplicação no painel Umbler

---

### **OPÇÃO 3: Via Linha de Comando (Já foi feito!)**

Se preferir, você pode usar o comando que já configuramos:
```bash
npm run deploy
```

Mas como você quer fazer upload manual, use a Opção 1 ou 2.

---

## ⚠️ **IMPORTANTE - NÃO ENVIE:**

### ❌ **Arquivos/Pastas que NÃO devem ser enviados:**

```
❌ src/                  ← Código fonte (não compilado)
❌ node_modules/         ← Dependências (muito grande)
❌ .git/                 ← Controle de versão
❌ .github/              ← Workflows
❌ docs/                 ← Documentação
❌ supabase/             ← Scripts SQL
❌ *.md                  ← Arquivos de documentação
❌ .gitignore
❌ vite.config.ts
❌ tsconfig.*.json
❌ tailwind.config.ts
❌ postcss.config.js
❌ eslint.config.js
❌ components.json
❌ clubeaquitem.code-workspace
❌ deploy-ftp.js         ← Script de deploy (não precisa no servidor)
```

---

## 📊 **RESUMO VISUAL:**

### ✅ **ENVIAR (Total: ~7 MB)**
```
✅ dist/              (~5 MB)
✅ scripts/           (~10 KB)
✅ server.js          (~1.5 KB)
✅ package.json       (~3 KB)
✅ package-lock.json  (~330 KB)
✅ .env               (~800 bytes)
```

### ❌ **NÃO ENVIAR**
```
❌ src/               (código fonte)
❌ node_modules/      (~500 MB!)
❌ Tudo mais          (configurações)
```

---

## 🎯 **CHECKLIST DE UPLOAD:**

### Antes do Upload:
- [x] Build concluído (`npm run build`)
- [x] Pasta `dist/` atualizada
- [x] Arquivos prontos

### Durante o Upload:
- [ ] Pasta `dist/` enviada completa
- [ ] Pasta `scripts/` enviada completa
- [ ] `server.js` enviado
- [ ] `package.json` enviado
- [ ] `package-lock.json` enviado
- [ ] `.env` enviado

### Após o Upload:
- [ ] Reiniciar aplicação na Umbler
- [ ] Aguardar 1-2 minutos
- [ ] Limpar cache do navegador
- [ ] Testar site em produção

---

## 🔍 **VERIFICAÇÃO RÁPIDA:**

### Como saber se deu certo?

1. **No servidor Umbler**, você deve ver:
   ```
   /
   ├── dist/
   ├── scripts/
   ├── server.js
   ├── package.json
   ├── package-lock.json
   └── .env
   ```

2. **Após reiniciar**, acesse seu site e verifique se carrega

---

## 📞 **PRECISA DE AJUDA?**

### Se algo der errado:

1. **Verifique** se todos os arquivos foram enviados
2. **Certifique-se** de ter reiniciado a aplicação
3. **Limpe** o cache do navegador
4. **Aguarde** 2-3 minutos após o restart
5. **Verifique** os logs no painel Umbler

---

## 🎉 **ARQUIVOS PRONTOS!**

**Tudo está compilado e pronto para upload!**

**Localização**: `c:\Users\Nelson\Downloads\clubeaquitem\`

**Escolha** a Opção 1 (Painel Umbler) ou Opção 2 (FTP) e faça o upload!

**Boa sorte!** 🚀

---

**Data do Build**: 02/02/2026 às 15:46  
**Versão**: 2.0 (Otimizado)  
**Status**: ✅ Pronto para produção
