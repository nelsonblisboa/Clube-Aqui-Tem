# Deploy da Evolution API

Esta pasta contém a configuração necessária para rodar a Evolution API (servidor de WhatsApp) em um VPS (como DigitalOcean, AWS ou o servidor da VIBECODE).

## 1. Pré-requisitos
- Servidor com Docker e Docker Compose instalados.

## 2. Instalação

1. Copie esta pasta `infra/evolution-api` para o servidor.
2. Renomeie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edite o `.env` e defina:
   - `AUTHENTICATION_API_KEY`: Crie uma senha forte (letras e números).
   - `SERVER_URL`: A URL onde esta API estará acessível (ex: https://wa.clubeaquitem.com.br).
   - `POSTGRES_PASSWORD`: Defina uma senha segura para o banco de dados.

## 3. Rodar o Servidor

Na pasta onde está o `docker-compose.yml`, execute:

```bash
docker-compose up -d
```

O sistema iniciará dois serviços principais:
- **API**: Porta 8080 (backend)
- **Manager (Interface Visual)**: Porta 8081 (interface para gerenciar instâncias)

## 4. Criar Instância e Conectar (Via Interface Visual)

A maneira mais fácil de conectar é usando o Manager:

1. Acesse `http://seu-servidor:8081`.
2. Use a URL da API (`http://seu-servidor:8080` ou o domínio configurado) e a `AUTHENTICATION_API_KEY`.
3. Na interface, clique em "Create Instance", dê o nome `clubeaquitem` e marque a opção para gerar QR Code.
4. Leia o QR Code com o celular.

Se preferir via linha de comando:

1. Faça uma requisição POST para criar a instância:
   (Você pode usar o Postman ou curl)

   ```bash
   curl -X POST https://seu-endpoint.com/instance/create \
   -H "apikey: SUA_API_KEY" \
   -H "Content-Type: application/json" \
   -d '{
     "instanceName": "clubeaquitem",
     "token": "token_opcional_da_instancia",
     "qrcode": true
   }'
   ```

2. O retorno terá um QR Code (base64 ou link). Leia este QR Code com o WhatsApp do número que enviará as mensagens.

3. Uma vez conectado, configure a variável `EVOLUTION_INSTANCE_NAME=clubeaquitem` no `.env` do projeto principal.
