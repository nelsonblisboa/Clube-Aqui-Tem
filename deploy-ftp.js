import ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const FTP_CONFIG = {
    host: "geonosis01.umbler.host",
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

        // 1. Upload root files
        for (const file of filesToUpload) {
            console.log(`⬆️ Enviando ${file.local}...`);
            await client.uploadFrom(path.join(__dirname, file.local), file.remote);
        }

        // 2. Upload directories
        console.log("⬆️ Enviando pasta 'scripts'...");
        await client.ensureDir("scripts");
        await client.uploadFromDir(path.join(__dirname, "scripts"), "scripts");

        console.log("🗑️ Limpando pasta 'dist' antiga no servidor...");
        try {
            await client.removeDir("dist");
            console.log("✅ Pasta antiga removida!");
        } catch (err) {
            console.log("⚠️ Pasta dist não existia ou erro ao remover (isso é normal na primeira vez)");
        }

        console.log("⬆️ Enviando pasta 'dist' (Frontend Build)...");
        await client.ensureDir("dist");
        await client.uploadFromDir(path.join(__dirname, "dist"), "dist");

        console.log("\n✨ Deploy de arquivos concluído com sucesso!");
        console.log("👉 Agora acesse o painel da Umbler e reinicie a aplicação Node.js.");

    } catch (err) {
        console.error("❌ Erro no FTP:", err);
    } finally {
        client.close();
    }
}

deploy();
