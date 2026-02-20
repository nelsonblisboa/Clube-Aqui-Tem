import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createSignatureRequest, sendOtp, validateOtp, handleWebhook } from './server/controllers/signatureController.js';
import { runScraper, getScraperStatus } from './scripts/scraper.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do React (quando em produção)
app.use(express.static(path.join(__dirname, 'dist')));

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Signature Routes
app.post('/api/signatures/create', upload.single('file'), createSignatureRequest);
app.post('/api/signatures/send-otp', sendOtp);
app.post('/api/signatures/validate-otp', validateOtp);
app.post('/api/signatures/webhook', handleWebhook);

// Endpoint para acionar o scraper
app.post('/api/scrape-coupons', async (req, res) => {
    console.log('📥 Recebendo pedido de atualização de cupons...');
    try {
        const result = await runScraper();
        res.json({ message: 'Atualização concluída com sucesso', data: result });
    } catch (error) {
        console.error('❌ Erro no endpoint de scraper:', error);
        res.status(500).json({ error: 'Falha ao atualizar cupons', details: error.message });
    }
});

// Endpoint para consultar o progresso
app.get('/api/scrape-status', (req, res) => {
    res.json(getScraperStatus());
});

// Qualquer outra rota devolve o index.html (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
    🚀 Servidor rodando em http://localhost:${PORT}
    
    👉 Frontend: http://localhost:${PORT}
    👉 API Scraper: http://localhost:${PORT}/api/scrape-coupons
    `);
});
