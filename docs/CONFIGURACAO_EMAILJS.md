# Como Configurar o EmailJS

## ❌ Problema Atual
O erro `404 - Account not found` ocorre porque as credenciais do EmailJS no arquivo `.env` não estão válidas ou a conta não foi configurada corretamente.

## ✅ Solução Temporária Implementada
O formulário de contato agora redireciona para:
- **WhatsApp** (opção padrão recomendada)
- **Cliente de Email** (Outlook, Gmail, etc.)

A mensagem é formatada automaticamente e o usuário pode escolher o método preferido.

## 🔧 Para Configurar o EmailJS Corretamente

### Passo 1: Criar uma Conta no EmailJS
1. Acesse: https://www.emailjs.com/
2. Clique em "Sign Up" (ou "Get Started")
3. Crie uma conta gratuita (permite 200 emails/mês)

### Passo 2: Criar um Service
1. No Dashboard, vá em **Email Services**
2. Clique em **Add New Service**
3. Escolha o provedor de email (Gmail, Outlook, etc.)
4. Configure com suas credenciais de email
5. Copie o **Service ID** (exemplo: `service_xxxxxx`)

### Passo 3: Criar um Email Template

⚠️ **IMPORTANTE**: Configure o destinatário corretamente para evitar o erro "recipients address is empty"

1. No Dashboard, vá em **Email Templates**
2. Clique em **Create New Template**
3. **Configure o campo "To Email" (ESSENCIAL)**:
   - No topo do formulário, você verá o campo **"To Email"**
   - **OPÇÃO 1 (Recomendada)**: Use uma variável dinâmica
     - Digite: `{{to_email}}`
     - Isso permite que o código envie para o email configurado
   - **OPÇÃO 2**: Use um email fixo
     - Digite diretamente: `clubeaquitem.comercial@gmail.com`
     - Menos flexível, mas funciona

4. Configure o **Subject** (Assunto):
```
Nova mensagem de {{from_name}} - {{subject}}
```

5. Configure o **Body** (Corpo do email):
```
Você recebeu uma nova mensagem através do site Clube Aqui Tem

INFORMAÇÕES DO REMETENTE:
--------------------
Nome: {{from_name}}
Email: {{from_email}}
Telefone: {{phone}}

ASSUNTO:
--------------------
{{subject}}

MENSAGEM:
--------------------
{{message}}

--------------------
Enviado via formulário de contato do site
```

6. **Teste o template**:
   - Clique no botão "Test it" no dashboard
   - Preencha os campos de teste
   - Verifique se o email chegou corretamente

7. Copie o **Template ID** (exemplo: `template_xxxxxx`)

**🔴 Erro Comum**: Se você receber `422 - recipients address is empty`, significa que o campo "To Email" não foi preenchido. Volte e configure conforme o passo 3.

### Passo 4: Obter a Public Key
1. No Dashboard, vá em **Account** → **General**
2. Encontre a **Public Key** (exemplo: `xxxxxxxxxxxxxxxx`)

### Passo 5: Atualizar o .env
Edite o arquivo `.env` com as novas credenciais:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=seu_service_id_aqui
VITE_EMAILJS_TEMPLATE_ID=seu_template_id_aqui
VITE_EMAILJS_PUBLIC_KEY=sua_public_key_aqui
```

### Passo 6: Reativar o EmailJS no Código
1. Abra o arquivo `src/pages/Contato.tsx`
2. Restaure o código original com EmailJS
3. Ou solicite ao assistente para reativar a integração

## 📝 Observações Importantes

- **Plano Gratuito**: 200 emails/mês
- **Plano Pessoal**: A partir de $15/mês para 500 emails/mês
- **Verificação de Email**: Pode ser necessário verificar o email usado no Service

## 🔄 Alternativas ao EmailJS

Se preferir não usar EmailJS, outras opções incluem:

1. **Email direto via mailto:** (já implementado como fallback)
2. **SendGrid**: API mais robusta
3. **Nodemailer**: Requer backend próprio
4. **Resend**: Moderna e fácil de usar
5. **Formspree**: Simples e direto

## ✨ Status Atual

✅ Formulário funcional com redirecionamento para WhatsApp/Email
❌ EmailJS desabilitado (aguardando credenciais válidas)
✅ Backup no localStorage para recuperação de dados
