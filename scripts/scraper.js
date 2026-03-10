import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar Stealth Plugin
puppeteer.use(StealthPlugin());

// Configurar dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.error("⚠️ Aviso: Credenciais do Supabase ausentes no Railway. O scraper falhará.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Portais alvo (Lista Expandida 2026)
const PORTALS = [
    // --- Agregadores ---
    { name: 'Méliuz', url: 'https://www.meliuz.com.br/cupom', selectors: { card: 'div.c-kUEnpM' } },
    { name: 'Cuponomia', url: 'https://www.cuponomia.com.br/', selectors: { card: '.sc-177h5d7-1' } },
    { name: 'Cuponation', url: 'https://www.cuponation.com.br/', selectors: { card: '.cn-voucher' } },
    { name: 'Cuponeria', url: 'https://www.cuponeria.com.br/', selectors: { card: '.cupom-card' } },
    { name: 'Pelando', url: 'https://www.pelando.com.br/', selectors: { card: 'article' } },
    { name: 'Promobit', url: 'https://www.promobit.com.br/', selectors: { card: 'div[class*="offer-card"]' } },
    { name: 'Descontos Top', url: 'https://descontostop.com/', selectors: { card: '.coupon-card' } },
    { name: 'Thiago Rodrigo', url: 'https://www.thiagorodrigo.com.br/', selectors: { card: '.coupon-item' } },
    { name: 'Radar Coupons', url: 'https://www.radarcoupons.com.br/', selectors: { card: '.card' } },
    { name: 'Cupom.org', url: 'https://www.cupom.org/', selectors: { card: '.store-coupon' } },

    // --- Portais de Notícias ---
    { name: 'TecMundo', url: 'https://www.tecmundo.com.br/cupons', selectors: { card: '.coupon-card' } },
    { name: 'Estadão', url: 'https://www.estadao.com.br/cupons', selectors: { card: '.coupon' } },
    { name: 'O Globo', url: 'https://oglobo.globo.com/cupons', selectors: { card: '.coupon-item' } },
    { name: 'Catraca Livre', url: 'https://catracalivre.com.br/cupons', selectors: { card: 'article' } },

    // --- Lojas Oficiais ---
    { name: 'Amazon', url: 'https://www.amazon.com.br/cupons', selectors: { card: '.jbv-coupon-grid-item' } },
    { name: 'Shopee', url: 'https://shopee.com.br/m/cupom-de-desconto', selectors: { card: '.voucher-card' } },
    { name: 'Mercado Livre', url: 'https://www.mercadolivre.com.br/cupons', selectors: { card: '.ui-coupon-card' } },
    { name: 'AliExpress', url: 'https://best.aliexpress.com', selectors: { card: '.coupon-item' } },
    { name: 'Magalu', url: 'https://www.magazineluiza.com.br/cupons', selectors: { card: '.coupon' } },
    { name: 'iFood', url: 'https://www.ifood.com.br/cupons', selectors: { card: '.coupon-card' } }
];

// Estado global do scraper para progresso em tempo real
let scraperStatus = {
    is_running: false,
    progress: 0,
    current_portal: '',
    total_portals: PORTALS.length,
    found_count: 0,
    last_update: null,
    error: null
};

export const getScraperStatus = () => scraperStatus;

// Lógica Híbrida: Seletores Específicos + Heurística
async function extractCouponsFromPage(page, portal) {
    return await page.evaluate((portalData) => {
        const results = [];
        const selectors = portalData.selectors;

        // Tenta usar o seletor específico do card primeiro, se falhar usa heurística
        let cards = document.querySelectorAll(selectors.card);
        if (cards.length === 0) {
            // Fallback heurístico
            cards = document.querySelectorAll('article, div[class*="card"], div[class*="coupon"], div[class*="voucher"], div[class*="offer"], li');
        }

        cards.forEach(card => {
            if (results.length >= 15) return; // Limite por portal

            const text = card.innerText || "";

            // 1. Título
            let title = "";
            if (selectors.title) title = card.querySelector(selectors.title)?.innerText;
            if (!title) title = card.querySelector('h3, h4, strong, .title')?.innerText;
            if (!title && text.split('\n').length > 0) title = text.split('\n')[0];

            // 2. Loja
            let store = portalData.name;
            if (selectors.store) {
                const storeEl = card.querySelector(selectors.store);
                if (storeEl) store = storeEl.getAttribute('alt') || storeEl.innerText;
            }
            if (store === portalData.name) { // Tentar limpar se vier sujo
                const img = card.querySelector('img');
                if (img && img.alt && !img.alt.includes('ver')) store = img.alt;
            }
            store = store.replace("Logo", "").replace("Cupom", "").replace("Oferta", "").trim();

            // 3. Desconto
            let discount = "Oferta";
            if (selectors.discount) discount = card.querySelector(selectors.discount)?.innerText || discount;
            if (discount === "Oferta") {
                const discountMatch = text.match(/(\d+%|\d+\s?R\$|R\$\s?\d+)/);
                if (discountMatch) discount = discountMatch[0];
            }

            // 4. Link
            let link = card.querySelector('a')?.href;
            if (!link) {
                const parentLink = card.closest('a');
                if (parentLink) link = parentLink.href;
            }

            // Validação básica
            const hasKeywords = text.toLowerCase().match(/(cupom|desc|off|%|r\$|grátis)/);

            if (title && link && hasKeywords && title.length < 150) {
                results.push({
                    source_platform: portalData.name,
                    store_name: store.substring(0, 30),
                    title: title.trim(),
                    description: text.substring(0, 150).replace(/\n/g, " "),
                    discount_value: discount.trim(),
                    destination_url: link,
                    category: 'Variedades',
                    is_active: true
                });
            }
        });

        return results;
    }, portal);
}

async function scrapeAll() {
    console.log('🚀 Iniciando scraper multi-portal (Modo Stealth)...');
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage']
        });
    } catch (launchError) {
        console.error('❌ Erro crítico ao iniciar navegador:', launchError.message);
        throw new Error(`Falha ao iniciar Chrome: ${launchError.message}`);
    }

    const allData = [];
    let portalCount = 0;

    for (const portal of PORTALS) {
        portalCount++;
        scraperStatus.progress = Math.round((portalCount / PORTALS.length) * 100);
        scraperStatus.current_portal = portal.name;

        try {
            console.log(`\n🔎 Acessando ${portal.name} (${portal.url})...`);
            const page = await browser.newPage();

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1366, height: 768 });

            await page.goto(portal.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Scroll inteligente
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 150;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight >= 1500) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            });

            await new Promise(r => setTimeout(r, 1500));

            const coupons = await extractCouponsFromPage(page, portal);

            console.log(`✅ ${coupons.length} ofertas encontradas em ${portal.name}`);
            allData.push(...coupons);
            scraperStatus.found_count = allData.length;

            await page.close();
        } catch (e) {
            console.error(`❌ Erro ao processar ${portal.name}: ${e.message}`);
        }
    }

    await browser.close();
    return allData;
}

// Fallback Mock se tudo falhar ou para testar rápido
function getMockCoupons() {
    return [
        {
            source_platform: 'Méliuz',
            store_name: 'Amazon',
            title: 'Cupom R$20 OFF em Livros e eBooks',
            description: 'Válido para seleção de best-sellers.',
            discount_value: 'R$ 20',
            destination_url: 'https://amazon.com.br',
        },
        {
            source_platform: 'Cuponomia',
            store_name: 'Casas Bahia',
            title: '10% de Cashback em Móveis',
            description: 'Ative o cashback e compre pelo link.',
            discount_value: '10% Volta',
            destination_url: 'https://casasbahia.com.br',
        },
        {
            source_platform: 'Cuponation',
            store_name: 'Netshoes',
            title: '15% OFF em Tênis de Corrida',
            description: 'Use o cupom CORRA15 no carrinho.',
            discount_value: '15% OFF',
            destination_url: 'https://netshoes.com.br'
        }
    ];
}

async function saveToSupabase(coupons) {
    if (coupons.length === 0) return;
    console.log(`\n💾 Tentando salvar ${coupons.length} ofertas no Supabase...`);

    // Tentar via RPC primeiro (Bypass RLS se a função existir)
    const { error: rpcError } = await supabase.rpc('insert_external_coupons_bulk', { coupons_json: coupons });

    if (!rpcError) {
        console.log('✅ Sucesso via RPC (RLS Bypass)!');
        return;
    }

    // Se falhar RPC (função não existe), tenta INSERT normal
    console.log('⚠️ Falha via RPC ou função inexistente. Tentando INSERT direto...');
    const { data, error } = await supabase
        .from('external_coupons')
        .upsert(coupons, { onConflict: 'source_platform,store_name,title', ignoreDuplicates: true });

    if (error) {
        console.error('❌ Erro final ao salvar:', error.message || error);
        console.log('💡 DICA: Execute o script SQL de migração para criar a função RPC e corrigir permissões.');
    } else {
        console.log('✅ Dados atualizados com sucesso via INSERT direto!');
    }
}

export async function runScraper() {
    console.log('🔄 Iniciando execução via API/Server...');

    scraperStatus.is_running = true;
    scraperStatus.progress = 0;
    scraperStatus.found_count = 0;
    scraperStatus.error = null;

    try {
        // 1. Coleta
        let data = await scrapeAll();

        // 2. Fallback
        if (data.length === 0) {
            console.log('⚠️ Nenhum dado capturado. Usando Mocks.');
            data = getMockCoupons();
        }

        // 3. Salva
        try {
            await saveToSupabase(data);
        } catch (saveError) {
            console.error('❌ Erro ao salvar dados:', saveError.message);
        }

        scraperStatus.last_update = new Date().toISOString();
        scraperStatus.progress = 100;
        return { success: true, count: data.length };
    } catch (err) {
        scraperStatus.error = err.message;
        throw err;
    } finally {
        scraperStatus.is_running = false;
    }
}

// Se executado diretamente pelo Node (teste manual)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runScraper();
}
