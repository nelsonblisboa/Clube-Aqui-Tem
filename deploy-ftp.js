import ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const FTP_CONFIG = {
    host: "alderaan08.umbler.host",
    user: "clubeaquitem-com-br",
    port: 21,
    password: process.env.FTP_PASSWORD // Tenta ler do .env
};

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    try {
        console.log("🚀 Iniciando Script de Deploy Automático para Umbler");
        console.log(`📡 Host: ${FTP_CONFIG.host}`);
        console.log(`👤 User: ${FTP_CONFIG.user}`);

        let password = FTP_CONFIG.password;

        if (!password) {
            password = await question('🔑 Digite a senha do FTP (e aperte Enter): ');
        } else {
            console.log("🔑 Senha carregada do arquivo .env");
        }

        rl.close();

        if (!password) {
            console.error("❌ Senha não fornecida.");
            return;
        }

        console.log("\n🔄 Conectando ao FTP...");

        await client.access({
            host: FTP_CONFIG.host,
            user: FTP_CONFIG.user,
            password: password,
            port: FTP_CONFIG.port,
            secure: false // Umbler often uses plain FTP or explicit TLS. Defaulting to false for compatibility, standard FTP usually port 21. Use true if explicit TLS needed.
        });

        console.log("✅ Conectado!");

        // Upload List
        const filesToUpload = [
            { local: "server.js", remote: "server.js" },
            { local: "package.json", remote: "package.json" },
            { local: "package-lock.json", remote: "package-lock.json" },
            // Note: .env is risky to upload automatically but often necessary. Let's include it.
            { local: ".env", remote: ".env" }
        ];

        // Removido o login na pasta public (pois o Umbler deste cliente está com / como diretório de publicação)
        console.log("📂 Operando no diretório raiz (/)");

        // 1. Upload root files
        for (const file of filesToUpload) {
            console.log(`⬆️ Enviando ${file.local}...`);
            await client.uploadFrom(path.join(__dirname, file.local), file.remote);
        }

        // 2. Limpar e enviar pasta scripts
        console.log("🗑️ Limpando pasta 'scripts' antiga no servidor...");
        try {
            await client.removeDir("scripts");
            console.log("✅ Pasta scripts antiga removida!");
        } catch (err) {
            console.log("⚠️ Pasta scripts não existia (isso é normal na primeira vez)");
        }

        console.log("⬆️ Enviando pasta 'scripts' (Backend Scraper)...");
        // Não usar ensureDir antes do uploadFromDir para evitar diretório aninhado (ex: /scripts/scripts/)
        await client.uploadFromDir(path.join(__dirname, "scripts"), "scripts");
        console.log("✅ Scripts enviados com sucesso!");

        console.log("🗑️ Limpando pasta 'public' antiga no servidor (Frontend)...");
        try {
            await client.removeDir("public");
            console.log("✅ Pasta antiga removida!");
        } catch (err) {
            console.log("⚠️ Pasta public não existia ou erro ao remover");
        }

        // Cleanup: remove old dist folder
        try {
            await client.removeDir("dist");
        } catch (err) { }

        console.log("⬆️ Enviando pasta 'dist' local para 'public' (Frontend Build)...");
        // O cliente envia direto do local 'dist' para o remoto 'public' estando na raiz
        await client.uploadFromDir(path.join(__dirname, "dist"), "public");
        console.log("✅ Frontend enviado com sucesso!");

        console.log("\n✨ Deploy de arquivos concluído com sucesso!");
        console.log("👉 Agora acesse o painel da Umbler e reinicie a aplicação Node.js.");

    } catch (err) {
        console.error("❌ Erro no FTP:", err);
    } finally {
        client.close();
    }
}

deploy();
