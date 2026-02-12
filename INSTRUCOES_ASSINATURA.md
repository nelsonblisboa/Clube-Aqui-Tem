# Instruções para o Sistema de Assinatura Eletrônica

O sistema de assinatura eletrônica com validação via WhatsApp foi implementado. Abaixo estão os passos para configuração final e uso.

## 1. Configuração de Variáveis de Ambiente (.env)

Adicione as seguintes variáveis ao seu arquivo `.env` para que o servidor possa se comunicar com os serviços externos:

```env
# Chave de Serviço do Supabase (Necessária para o backend acessar configurações protegidas)
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# Configuração da Evolution API (WhatsApp)
EVOLUTION_API_URL=https://api.evolution.com # ou seu servidor VPS
EVOLUTION_API_KEY=sua_chave_api_evolution
EVOLUTION_INSTANCE_NAME=default # Nome da instância configurada na Evolution

# (Opcional) URL da Assinafy se diferente do padrão
ASSINAFY_API_URL=https://api.assinafy.com/v1

# (Para envio de e-mail de backup se configurado no futuro)
EMAILJS_PRIVATE_KEY=sua_chave_privada_emailjs
```

## 2. Configuração do Banco de Dados

A tabela `assinafy_settings` foi criada. Você deve inserir suas credenciais da Assinafy nela:

1. Acesse o Painel do Supabase -> SQL Editor.
2. Execute o seguinte comando (substituindo pela sua API Key):

```sql
INSERT INTO public.assinafy_settings (account_id, api_key)
VALUES ('seu_account_id', 'sua_api_key_assinafy')
ON CONFLICT DO NOTHING;
```

## 3. Fluxo Implementado

### A. Criação da Solicitação (Backend)
Quando um documento precisa ser assinado, o backend deve chamar:
`POST /api/signatures/create`
Form-Data: `file` (PDF), `userId`, `userType` ('subscriber', 'partner', 'seller'), `signerName`, `signerPhone`.
Isso fará o upload para a Assinafy e salvará o link no banco (**sem enviar email**).

### B. Envio do Token (WhatsApp)
Para iniciar a validação, chame:
`POST /api/signatures/send-otp`
JSON: `{ "userId": "...", "userType": "...", "phone": "55..." }`
Isso gera um código de 4 dígitos e envia via WhatsApp.

### C. Validação (Frontend)
O usuário acessa a página `/validar-assinatura` (ex: via link enviado ou navegação).
Insere o código. O sistema valida e:
1. Libera o acesso.
2. Envia o link final de assinatura via WhatsApp.
3. Exibe o botão para assinar na tela.

### D. Webhook e Finalização
Configure o Webhook na Assinafy para apontar para:
`https://seu-dominio.com/api/signatures/webhook`

Quando o documento for assinado, o sistema receberá a notificação, atualizará o status no banco e tentará enviar o e-mail de backup (requer configuração de serviço de e-mail backend).

## 4. Próximos Passos (Infraestrutura)

- **Evolution API**: Confirme com a VIBECODE a hospedagem da Evolution API e obtenha a URL e API Key.
- **WhatsApp**: Defina o número que será conectado à instância da Evolution API.
- **E-mail**: Para o envio automático do PDF assinado por e-mail, é recomendável configurar um serviço SMTP (Nodemailer) no `server.js` ou utilizar o envio da própria Assinafy se permitido futuramente. O código atual possui um "placeholder" para essa função.
