---
description: Atualizar o projeto no servidor (Deploy)
---
Siga estes passos sempre que fizer alterações no código e quiser enviar para o site ao ar:

1. **Abra o terminal** no VS Code.

2. **Execute o comando de deploy**:
   Este comando vai reconstruir o site (build), sincronizar as alterações com o **GitHub** e enviar os arquivos automaticamente via **FTP** para a Umbler.
   ```bash
   npm run deploy
   ```
   // turbo

3. **Confira o upload**:
   O script mostrará o progresso de cada arquivo e uma mensagem de sucesso ao final.

4. **Reinicie na Umbler**:
   Após o upload, acesse o painel da Umbler e clique em **"Restart"** (ou Reiniciar) na aplicação Node.js para que as alterações tenham efeito imediato.
