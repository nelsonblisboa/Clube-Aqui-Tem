import { supabase } from '../supabase.js';

export const sendWhatsAppMessage = async (number, message) => {
    // Try to get settings from Database first
    let baseUrl = process.env.EVOLUTION_API_URL;
    let apiKey = process.env.EVOLUTION_API_KEY;
    let instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'default';

    try {
        const { data: settings } = await supabase
            .from('assinafy_settings')
            .select('evolution_api_url, evolution_api_key, evolution_instance')
            .maybeSingle();

        if (settings) {
            if (settings.evolution_api_url) baseUrl = settings.evolution_api_url;
            if (settings.evolution_api_key) apiKey = settings.evolution_api_key;
            if (settings.evolution_instance) instanceName = settings.evolution_instance;
        }
    } catch (error) {
        console.warn('Could not fetch Evolution settings from DB, using env fallback:', error.message);
    }

    if (!baseUrl || !apiKey) {
        console.warn('Evolution API not configured (URL or Key missing). Skipping WhatsApp send.');
        return { success: false, error: 'Configuration missing' };
    }

    // Format number: ensure it has country code (55) if Brazil, remove non-digits
    const cleanNumber = number.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;

    const url = `${baseUrl}/message/sendText/${instanceName}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify({
                number: formattedNumber,
                options: {
                    delay: 1200,
                    presence: 'composing',
                    linkPreview: false
                },
                textMessage: {
                    text: message
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Evolution API Error: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        throw error;
    }
};
