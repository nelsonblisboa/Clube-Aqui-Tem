import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
        console.log("📦 Node modules missing. Running npm install...");
        execSync('npm install', { stdio: 'inherit', cwd: __dirname });
        console.log("✅ Installation complete.");
    } else {
        console.log("✅ Node modules already exist.");
    }
} catch (e) {
    console.error("❌ Error during npm install:", e);
}

// Proceed to boot the actual application
import('./server.js').catch(err => {
    console.error("❌ Failed to start server.js:", err);
});
