import ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const FTP_CONFIG = {
    host: "alderaan07.umbler.host",
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
            secure: true // Umbler often uses plain FTP or explicit TLS. Defaulting to false for compatibility, standard FTP usually port 21. Use true if explicit TLS needed.
        });

        console.log("✅ Conectado!");

        const filesToUpload = [
            { local: "bootstrap.js", remote: "bootstrap.js" },
            { local: "bootstrap.js", remote: "app.js" }, // Passenger compatibility map
            { local: "server.js", remote: "server.js" },
            { local: "package.json", remote: "package.json" },
            { local: "package-lock.json", remote: "package-lock.json" },
            { local: ".env", remote: ".env" }
        ];

        // 1. Limpar pastas antigas
        console.log("�️ Limpando pasta 'public' antiga no servidor (Frontend)...");
        try { await client.removeDir("public"); } catch (err) { }
        console.log("🗑️ Limpando pasta 'scripts' antiga no servidor...");
        try { await client.removeDir("scripts"); } catch (err) { }
        try { await client.removeDir("dist"); } catch (err) { }

        // 2. Enviar frontend
        console.log("⬆️ Enviando pasta 'dist' local para 'public' (Frontend Build)...");
        await client.uploadFromDir(path.join(__dirname, "dist"), "public");
        console.log("✅ Frontend enviado com sucesso!");

        // 3. Enviar root files
        console.log("� Operando no diretório raiz e enviando arquivos de backend");
        for (const file of filesToUpload) {
            console.log(`⬆️ Enviando ${file.local}...`);
            await client.uploadFrom(path.join(__dirname, file.local), file.remote);
            try {
                // garante que se a Umbler usou /public como raiz, o backend também inicie por lá
                await client.uploadFrom(path.join(__dirname, file.local), `public/${file.remote}`);
            } catch (e) { }
        }

        // 4. Enviar scripts do backend
        console.log("🗑️ Limpando pasta 'server' antiga no servidor...");
        try { await client.removeDir("server"); } catch (err) { }

        console.log("⬆️ Enviando pasta 'scripts' (Backend Scraper)...");
        await client.uploadFromDir(path.join(__dirname, "scripts"), "scripts");
        try {
            await client.uploadFromDir(path.join(__dirname, "scripts"), "public/scripts");
        } catch (e) { }

        console.log("⬆️ Enviando pasta 'server' (Controllers)...");
        await client.uploadFromDir(path.join(__dirname, "server"), "server");
        try {
            await client.uploadFromDir(path.join(__dirname, "server"), "public/server");
        } catch (e) { }

        console.log("✅ Scripts enviados com sucesso!");

        console.log("\n🔄 Reiniciando a aplicação Node.js na Umbler...");
        try {
            await client.ensureDir("tmp");
            const fs = await import('fs');
            fs.writeFileSync('restart.txt', new Date().getTime().toString());
            await client.uploadFrom('restart.txt', 'tmp/restart.txt');
            console.log("✅ Sinal de reinício (tmp/restart.txt) enviado!");
        } catch (err) {
            console.log("⚠️ Não foi possível enviar o sinal automático de reinício.");
        }

        console.log("\n✨ Deploy de arquivos concluído com sucesso!");
        console.log("🚀 Lembrete: Na Umbler, o primeiro carregamento baixa os pacotes via NPM Install automático que criamos. Aguarde 30s-1min.");

    } catch (err) {
        console.error("❌ Erro no FTP:", err);
    } finally {
        client.close();
    }
}

deploy();
