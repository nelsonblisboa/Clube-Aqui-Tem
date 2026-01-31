# ⚠️ RESOLVENDO ERRO 422: "The recipients address is empty"

## 🔴 O QUE ACONTECEU?

Você recebeu este erro ao testar o EmailJS:
```
422 - The recipients address is empty
```

Isso significa que você **não configurou o campo "To Email"** no template do EmailJS.

---

## ✅ SOLUÇÃO RÁPIDA - PASSO A PASSO

### 1️⃣ Acesse o Dashboard do EmailJS
- Vá para: https://dashboard.emailjs.com/
- Faça login na sua conta

### 2️⃣ Vá até Email Templates
- No menu lateral, clique em **"Email Templates"**
- Você verá a lista dos seus templates

### 3️⃣ Edite o Template que Criou
- Clique no template que você acabou de criar
- Ou clique em **"Edit"** ao lado dele

### 4️⃣ CONFIGURE O CAMPO "To Email" (CRUCIAL!)

**Localização**: No TOPO do formulário de edição do template

**Você verá um campo chamado: "To Email"**

**ESCOLHA UMA DAS OPÇÕES:**

#### 📌 OPÇÃO 1 (RECOMENDADA) - Email Dinâmico:
No campo "To Email", digite exatamente:
```
{{to_email}}
```

Isso permite que o código PHP/JS defina o destinatário programaticamente.

#### 📌 OPÇÃO 2 - Email Fixo:
No campo "To Email", digite diretamente o email:
```
clubeaquitem.comercial@gmail.com
```

Todos os emails sempre irão para este endereço.

### 5️⃣ Configure o Subject (Assunto)

No campo "Subject", digite:
```
Nova mensagem de {{from_name}} - {{subject}}
```

### 6️⃣ Configure o Content (Conteúdo)

No campo "Content", cole este template:
```
Você recebeu uma nova mensagem através do site Clube Aqui Tem

INFORMAÇÕES DO REMETENTE:
═══════════════════════════════════
Nome: {{from_name}}
Email: {{from_email}}
Telefone: {{phone}}

ASSUNTO:
═══════════════════════════════════
{{subject}}

MENSAGEM:
═══════════════════════════════════
{{message}}

═══════════════════════════════════
Enviado automaticamente via formulário de contato do site
Data/Hora: {{reply_to}}
```

### 7️⃣ Salve as Alterações

- Clique em **"Save Changes"** ou **"Save"**
- Aguarde a confirmação de que o template foi salvo

### 8️⃣ TESTE O TEMPLATE NO DASHBOARD

- Clique no botão **"Test it"** (geralmente no canto superior direito)
- Preencha os campos de teste:
  - `from_name`: Seu Nome
  - `from_email`: seuemail@example.com
  - `phone`: 21999999999
  - `subject`: Teste
  - `message`: Mensagem de teste
  - `to_email`: clubeaquitem.comercial@gmail.com (se usou OPÇÃO 1)

- Clique em **"Send Test Email"**

### 9️⃣ Verifique sua Caixa de Entrada

- Abra o email: **clubeaquitem.comercial@gmail.com**
- Verifique se o email de teste chegou
- **IMPORTANTE**: Verifique também a pasta de SPAM/Lixo Eletrônico!

---

## 🎯 DEPOIS DE CONFIGURAR

### Copie suas credenciais:

1. **Template ID**: Procure no topo da página, algo como `template_xxxxxxx`
2. **Service ID**: Vá em "Email Services" e copie o ID, algo como `service_xxxxxxx`
3. **Public Key**: Vá em "Account" > "General" e copie a Public Key

### Atualize o arquivo .env:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=sua_public_key_aqui
```

### Reinicie o servidor:

```bash
# Pressione Ctrl+C no terminal para parar o servidor
# Depois execute novamente:
npm run dev
```

---

## ❓ AINDA COM PROBLEMAS?

### Erro 422 persiste?
- Verifique se o campo "To Email" está REALMENTE preenchido
- Tente usar a OPÇÃO 2 (email fixo) primeiro
- Certifique-se de que salvou as alterações

### Email não chegou?
- Verifique a pasta de SPAM
- Verifique se o Service está conectado ao email correto
- Tente reenviar o email de verificação do EmailJS

### Quer usar outra solução?
O sistema atual já funciona com WhatsApp e mailto:, então você não precisa do EmailJS se preferir usar essas alternativas!

---

## 📞 RESUMO DA CONFIGURAÇÃO

✅ **To Email**: `{{to_email}}` OU `clubeaquitem.comercial@gmail.com`  
✅ **Subject**: `Nova mensagem de {{from_name}} - {{subject}}`  
✅ **Content**: Template formatado com todos os campos  
✅ **Test it**: Sempre teste antes de usar em produção!  

---

**Última atualização**: 21/01/2026
