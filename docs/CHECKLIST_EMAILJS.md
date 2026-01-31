# ✅ CHECKLIST - CONFIGURAÇÃO EMAILJS

Use esta checklist para garantir que tudo está configurado corretamente.

## 📋 ANTES DE COMEÇAR

- [ ] Criei uma conta no EmailJS (https://www.emailjs.com)
- [ ] Fiz login no dashboard (https://dashboard.emailjs.com)

---

## 🔧 CONFIGURAÇÃO DO SERVICE

- [ ] Cliquei em "Email Services"
- [ ] Cliquei em "Add New Service"
- [ ] Escolhi o provedor (Gmail, Outlook, etc.)
- [ ] Conectei minha conta de email
- [ ] Salvei e copiei o **Service ID** (exemplo: `service_xxxxxx`)

---

## 📧 CONFIGURAÇÃO DO TEMPLATE

### Campo "To Email" (ESSENCIAL!)
- [ ] Abri "Email Templates"
- [ ] Cliquei em "Create New Template"
- [ ] **Preenchi o campo "To Email"** com:
  - [ ] OPÇÃO 1: `{{to_email}}` (dinâmico - recomendado)
  - [ ] OPÇÃO 2: `clubeaquitem.comercial@gmail.com` (fixo)

### Subject (Assunto)
- [ ] Preenchi o campo "Subject" com:
  ```
  Nova mensagem de {{from_name}} - {{subject}}
  ```

### Content (Corpo do Email)
- [ ] Preenchi o campo "Content" com o template completo (ver ERRO_422_EMAILJS.md)

### Salvamento e Teste
- [ ] Salvei as alterações no template
- [ ] Copiei o **Template ID** (exemplo: `template_xxxxxx`)
- [ ] Cliquei em "Test it" para testar
- [ ] Verifiquei que o email de teste chegou
- [ ] Verifiquei a pasta de SPAM também

---

## 🔑 CONFIGURAÇÃO DA PUBLIC KEY

- [ ] Fui em "Account" → "General"
- [ ] Copiei a **Public Key**

---

## 📝 ATUALIZAÇÃO DO .ENV

- [ ] Abri o arquivo `.env` do projeto
- [ ] Atualizei com as credenciais corretas:

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxx
```

- [ ] Salvei o arquivo `.env`

---

## 🔄 REATIVAÇÃO DO EMAILJS NO CÓDIGO

### Opção 1: Pedir ao assistente
- [ ] Pedi ao assistente para reativar a integração EmailJS em `Contato.tsx`

### Opção 2: Manual
- [ ] Restaurei o código original do EmailJS
- [ ] Removi o código alternativo de WhatsApp/mailto

---

## 🚀 TESTE FINAL

- [ ] Reiniciei o servidor com `npm run dev`
- [ ] Acessei http://localhost:8080/contato
- [ ] Preenchi o formulário de contato
- [ ] Cliquei em "Enviar Mensagem"
- [ ] Verifiquei que o email chegou em clubeaquitem.comercial@gmail.com
- [ ] Verifiquei que não há erros no console do navegador

---

## ⚠️ TROUBLESHOOTING

### Se aparecer erro 422:
- [ ] Voltei ao template e verifiquei o campo "To Email"
- [ ] Tentei usar email fixo em vez de `{{to_email}}`
- [ ] Salvei novamente e testei

### Se o email não chegar:
- [ ] Verifiquei a pasta de SPAM
- [ ] Verifiquei se o Service está conectado
- [ ] Verifiquei os limites do plano (200 emails/mês no gratuito)

### Se aparecer erro 401:
- [ ] Verifiquei se a Public Key está correta
- [ ] Copiei novamente do dashboard

---

## 📊 STATUS ATUAL

**Configuração atual do sistema:**
- ✅ Formulário funcional com WhatsApp/Email alternativo
- ⏳ EmailJS aguardando configuração
- ✅ Servidor rodando em http://localhost:8080/

**Para usar EmailJS:**
1. ✅ Complete todas as etapas acima
2. ✅ Peça ao assistente para reativar
3. ✅ Teste e confirme funcionamento

---

**Última verificação**: ___/___/______
**Status**: [ ] Configurado [ ] Pendente [ ] Testado e Funcionando
