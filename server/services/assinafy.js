import { supabase } from '../supabase.js';

// Base URL for Assinafy API - This should be confirmed with documentation
const ASSINAFY_API_URL = process.env.ASSINAFY_API_URL || 'https://api.assinafy.com.br/v1';

const getSettings = async () => {
    // Tenta buscar do banco
    const { data, error } = await supabase.from('assinafy_settings').select('api_key').single();

    if (error || !data) {
        console.warn('⚠️ Could not fetch settings from DB (RLS or Empty). Using hardcoded fallback for testing.');
        // Fallback temporário com as credenciais fornecidas pelo usuário
        return {
            api_key: 'LHVJEHhuBDlrXoiU8omyIXp2i2XKGv-fa7sKlVOK4KQfxcJjscMk7eiDkEmPsylh',
            account_id: '10193faa9cfb527bff1fdcb19c32'
        };
    }
    return data;
};

import FormData from 'form-data';
import { Readable } from 'stream';

export const uploadDocument = async (fileBuffer, fileName, signers) => {
    const { api_key } = await getSettings();

    const form = new FormData();
    // Convert buffer to stream for form-data
    const stream = Readable.from(fileBuffer);
    form.append('file', stream, { filename: fileName });

    // Pass signers as JSON string
    form.append('signers', JSON.stringify(signers));

    // Vital: Do not send email automatically as per requirements
    form.append('send_email', 'false');

    try {
        const response = await fetch(`${ASSINAFY_API_URL}/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${api_key}`,
                ...form.getHeaders() // Important: form-data generates correct boundaries
            },
            body: form
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Assinafy Upload Error: ${response.status || 'Unknown'} ${err}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error calling Assinafy API:', error);
        throw error;
    }
};

export const getDocumentStatus = async (documentId) => {
    const { api_key } = await getSettings();

    const response = await fetch(`${ASSINAFY_API_URL}/documents/${documentId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${api_key}`
        }
    });

    if (!response.ok) {
        throw new Error(`Assinafy Status Error: ${response.status}`);
    }

    return await response.json();
};

export const getSignedDocument = async (documentId) => {
    const { api_key } = await getSettings();

    // Endpoint to download the signed document. Verify URL with docs.
    // Usually /documents/:id/download or similar.
    const response = await fetch(`${ASSINAFY_API_URL}/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${api_key}`
        }
    });

    if (!response.ok) {
        throw new Error(`Assinafy Download Error: ${response.status}`);
    }

    return await response.arrayBuffer();
};
