# 🔐 GUIA DE DEPLOY VIA SSH - Clube Aqui Tem

## 📋 INFORMAÇÕES DE CONEXÃO SSH

### **Credenciais SSH:**
```
Host: alderaan.ssh.umbler.com
Porta: 50676
Usuário: ssh-user
Senha: [Você precisa da senha SSH da Umbler]
```

**⚠️ IMPORTANTE**: A senha SSH é diferente da senha FTP!

---

## 🔑 ONDE ENCONTRAR A SENHA SSH?

### **Opção 1: Painel da Umbler**
1. Acesse: https://app.umbler.com/
2. Vá para **Configurações** → **SSH**
3. A senha SSH estará lá (ou você pode redefinir)

### **Opção 2: Email de Boas-Vindas**
Verifique o email que a Umbler enviou quando você criou a conta

---

## 🚀 DEPLOY VIA SSH (Método Avançado)

### **OPÇÃO A: Upload via SCP (Recomendado)**

#### 1. **Enviar pasta dist/**
```bash
scp -P 50676 -r dist/ ssh-user@alderaan.ssh.umbler.com:/caminho/do/projeto/
```

#### 2. **Enviar pasta scripts/**
```bash
scp -P 50676 -r scripts/ ssh-user@alderaan.ssh.umbler.com:/caminho/do/projeto/
```

#### 3. **Enviar arquivos raiz**
```bash
scp -P 50676 server.js package.json package-lock.json .env ssh-user@alderaan.ssh.umbler.com:/caminho/do/projeto/
```

---

### **OPÇÃO B: Conectar via SSH e fazer upload**

#### 1. **Conectar ao servidor**
```bash
ssh ssh-user@alderaan.ssh.umbler.com -p 50676
```

#### 2. **Navegar até o diretório do projeto**
```bash
cd /caminho/do/projeto
```

#### 3. **Verificar arquivos atuais**
```bash
ls -la
```

#### 4. **Fazer backup (opcional)**
```bash
cp -r dist dist.backup
```

#### 5. **Sair do SSH**
```bash
exit
```

#### 6. **Enviar arquivos do seu computador**
```bash
# No seu computador (PowerShell/CMD)
scp -P 50676 -r c:\Users\Nelson\Downloads\clubeaquitem\dist ssh-user@alderaan.ssh.umbler.com:/caminho/do/projeto/
```

---

### **OPÇÃO C: Git Pull (Se configurado)**

Se você configurou Git no servidor:

```bash
# 1. Conectar via SSH
ssh ssh-user@alderaan.ssh.umbler.com -p 50676

# 2. Navegar até o projeto
cd /caminho/do/projeto

# 3. Fazer pull do GitHub
git pull origin main

# 4. Fazer build no servidor
npm install
npm run build

# 5. Reiniciar aplicação
pm2 restart app
# ou
npm start
```

---

## 🎯 MÉTODO MAIS SIMPLES (RECOMENDADO)

Como você já tem acesso SSH, a forma mais eficiente é:

### **1. Usar RSYNC (Sincronização)**

```bash
# Sincronizar pasta dist/
rsync -avz -e "ssh -p 50676" c:\Users\Nelson\Downloads\clubeaquitem\dist/ ssh-user@alderaan.ssh.umbler.com:/caminho/do/projeto/dist/

# Sincronizar pasta scripts/
rsync -avz -e "ssh -p 50676" c:\Users\Nelson\Downloads\clubeaquitem\scripts/ ssh-user@alderaan.ssh.umbler.com:/caminho/do/projeto/scripts/

# Sincronizar arquivos raiz
rsync -avz -e "ssh -p 50676" c:\Users\Nelson\Downloads\clubeaquitem\server.js ssh-user@alderaan.ssh.umbler.com:/caminho/do/projeto/
rsync -avz -e "ssh -p 50676" c:\Users\Nelson\Downloads\clubeaquitem\package.json ssh-user@alderaan.ssh.umbler.com:/caminho/do/projeto/
rsync -avz -e "ssh -p 50676" c:\Users\Nelson\Downloads\clubeaquitem\.env ssh-user@alderaan.ssh.umbler.com:/caminho/do/projeto/
```

**Vantagem**: Só envia arquivos modificados (mais rápido)

---

## 📝 PASSO A PASSO COMPLETO

### **1. Obter Senha SSH**
- Acesse painel Umbler
- Vá em Configurações → SSH
- Copie ou redefina a senha

### **2. Descobrir Caminho do Projeto no Servidor**
```bash
# Conectar via SSH
ssh ssh-user@alderaan.ssh.umbler.com -p 50676

# Listar diretórios
ls -la

# Navegar até encontrar seu projeto
cd clubeaquitem  # ou outro nome
pwd  # Ver caminho completo
```

### **3. Fazer Upload**
Escolha um dos métodos acima (SCP, RSYNC, ou Git)

### **4. Reiniciar Aplicação**
```bash
# Via SSH no servidor
pm2 restart clubeaquitem
# ou
systemctl restart clubeaquitem
# ou via painel Umbler
```

---

## 🔧 TROUBLESHOOTING

### **Erro: "Permission denied"**
- Verifique se a senha SSH está correta
- Tente redefinir a senha no painel Umbler

### **Erro: "Connection refused"**
- Verifique se a porta 50676 está correta
- Verifique se o firewall não está bloqueando

### **Erro: "No such file or directory"**
- Verifique o caminho do projeto no servidor
- Use `pwd` para ver onde você está

---

## 💡 ALTERNATIVA MAIS FÁCIL

Se SSH está complicado, você pode usar:

### **1. FTP (Já configurado)**
```bash
npm run deploy
```

### **2. Painel Umbler**
- Upload manual via interface web
- Mais simples, mas mais lento

### **3. GitHub + Webhook**
- Push para GitHub
- Umbler faz pull automático
- Requer configuração inicial

---

## 🎯 RECOMENDAÇÃO

### **Para Agora:**
Use o **FTP** que já está funcionando:
```bash
npm run deploy
```

### **Para o Futuro:**
Configure **GitHub Actions** para deploy automático (já está pronto em `.github/workflows/deploy.yml`)

---

## 📊 COMPARAÇÃO DE MÉTODOS

| Método | Velocidade | Facilidade | Automação |
|--------|------------|------------|-----------|
| **FTP** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **SSH/SCP** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **RSYNC** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Git Pull** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **GitHub Actions** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🔐 SEGURANÇA

### **Boas Práticas:**
- ✅ Nunca compartilhe senhas SSH
- ✅ Use chaves SSH em vez de senhas (mais seguro)
- ✅ Mantenha `.env` fora do Git
- ✅ Use conexões seguras (SSH, SFTP)

---

## 📚 RECURSOS ADICIONAIS

- **Documentação Umbler SSH**: https://help.umbler.com/
- **Guia SCP**: https://linux.die.net/man/1/scp
- **Guia RSYNC**: https://linux.die.net/man/1/rsync

---

## 🎯 DECISÃO RÁPIDA

### **Você tem a senha SSH?**

**SIM** → Use SCP ou RSYNC (mais rápido)

**NÃO** → Use FTP (`npm run deploy`) ou Painel Umbler

---

## ✅ PRÓXIMO PASSO

1. **Obtenha a senha SSH** no painel Umbler
2. **Descubra o caminho** do projeto no servidor
3. **Escolha um método** de upload (SCP, RSYNC, ou FTP)
4. **Faça o upload**
5. **Reinicie** a aplicação

---

**Precisa da senha SSH?** Acesse o painel da Umbler! 🔑

**Quer usar FTP?** Execute `npm run deploy`! 🚀

**Quer automatizar?** Configure GitHub Actions! ⚙️
