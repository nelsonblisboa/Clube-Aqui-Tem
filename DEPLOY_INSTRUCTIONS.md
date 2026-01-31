# Instruções de Deploy (Servidor Node.js / Umbler)

Seu projeto agora é uma aplicação **Híbrida**: Frontend (React) + Backend (Node.js Scraper) rodando juntos.

## 📂 Arquivos para Subir (Upload)

Copie **apenas** estes arquivos/pastas para o seu servidor (via FTP ou Git):

1. 📁 `dist/` (Esta pasta contém todo o seu site React otimizado)
2. 📁 `scripts/` (Contém o robô de cupons)
3. 📄 `server.js` (O servidor principal)
4. 📄 `package.json`
5. 📄 `package-lock.json` (ou yarn.lock)
6. 📄 `.env` (⚠️ Importante: Contém suas chaves do Supabase. Em alguns servidores, você configura isso no painel, mas via FTP pode subir o arquivo).

**❌ NÃO suba:**
- `node_modules` (Isso deve ser instalado lá)
- `src` (Não é necessário em produção)
- `.git`

## 🚀 Como Iniciar no Servidor

1. Acesse o terminal do servidor (SSH ou Terminal Web da Umbler).
2. Na pasta onde subiu os arquivos, rode:
   ```bash
   npm install --production
   ```
   *(Isso instala as dependências leves necessárias para rodar o servidor)*

3. Inicie o servidor:
   ```bash
   npm start
   ```

## ✅ Verificação

- **Site:** Acesse seu domínio (ex: `seusite.com`). O React deve carregar.
- **Scraper:** No Painel Admin, clique em "Atualizar Cupons". Ele deve funcionar e atualizar a data.

---
**Nota sobre a Umbler:**
Certifique-se de que o "Startup Script" no painel da Umbler está configurado para `npm start` ou apontando para `server.js`.
