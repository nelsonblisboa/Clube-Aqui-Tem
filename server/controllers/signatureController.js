import { uploadDocument } from '../services/assinafy.js';
import { sendWhatsAppMessage } from '../services/evolution.js';
import { supabase } from '../supabase.js';
import { getSignedDocument } from '../services/assinafy.js';

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

const getTableForType = (type) => {
    // Defines which table to update based on the user type
    switch (type) {
        case 'subscriber': return 'subscribers';
        case 'partner': return 'partner_accounts';
        case 'seller': return 'sellers';
        default: throw new Error(`Invalid user type: ${type}`);
    }
};

export const createSignatureRequest = async (req, res) => {
    try {
        const { userId, userType, signerName, signerEmail, signerPhone } = req.body;
        const file = req.file; // Expecting file from multer

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!userId || !userType) {
            return res.status(400).json({ error: 'userId and userType are required' });
        }

        console.log(`Creating signature request for ${userType} ${userId}`);

        // Upload to Assinafy
        // Note: Assinafy API response structure needs to be verified. 
        // Assuming it returns { id: '...', sign_url: '...' }
        const result = await uploadDocument(file.buffer, file.originalname, [{
            name: signerName,
            email: signerEmail || 'placeholder@email.com', // Email is often required by signature APIs even if not used for delivery
            phone: signerPhone
        }]);

        const { id: assinafyId, sign_url } = result;

        if (!sign_url) {
            throw new Error('Assinafy did not return a signature URL');
        }

        // Update Database
        const table = getTableForType(userType);
        const { error } = await supabase
            .from(table)
            .update({
                assinafy_document_id: assinafyId,
                signature_url: sign_url,
                signature_status: 'pending',
                otp_token: null, // Clear any previous OTP
                signed_at: null // Reset signed date
            })
            .eq('id', userId);

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        res.json({ success: true, assinafyId });

    } catch (error) {
        console.error('Error in createSignatureRequest:', error);
        res.status(500).json({ error: error.message });
    }
};

export const sendOtp = async (req, res) => {
    try {
        const { userId, userType, phone } = req.body;

        if (!userId || !userType || !phone) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const otp = generateOtp();
        // OTP valid for 15 minutes
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        const table = getTableForType(userType);

        // Save OTP to Database
        const { error } = await supabase
            .from(table)
            .update({
                otp_token: otp,
                otp_expires_at: expiresAt
            })
            .eq('id', userId);

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        // Send via WhatsApp
        const message = `Olá! Para acessar o seu documento e assinar com segurança no Clube Aqui Tem, utilize o código: *${otp}*`;
        await sendWhatsAppMessage(phone, message);

        res.json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Error in sendOtp:', error);
        res.status(500).json({ error: error.message });
    }
};

export const validateOtp = async (req, res) => {
    try {
        const { userId, userType, otp, phone } = req.body;

        if (!userId || !userType || !otp) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const table = getTableForType(userType);

        // Fetch stored OTP
        const { data, error } = await supabase
            .from(table)
            .select('otp_token, otp_expires_at, signature_url')
            .eq('id', userId)
            .single();

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        if (!data || !data.otp_token) {
            return res.status(400).json({ error: 'No OTP found for this user' });
        }

        if (data.otp_token !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (new Date(data.otp_expires_at) < new Date()) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        // OTP Valid

        // 1. Clear OTP to prevent reuse
        await supabase
            .from(table)
            .update({ otp_token: null })
            .eq('id', userId);

        // 2. Send Link via WhatsApp
        if (phone && data.signature_url) {
            const linkMsg = `Código validado com sucesso! Clique no link abaixo para realizar a sua assinatura eletrônica:\n\n${data.signature_url}`;
            await sendWhatsAppMessage(phone, linkMsg);
        }

        res.json({ success: true, link: data.signature_url });

    } catch (error) {
        console.error('Error in validateOtp:', error);
        res.status(500).json({ error: error.message });
    }
};



// Placeholder for email service
const sendBackupEmail = async (pdfBuffer, metadata) => {
    // TODO: Implement email sending logic (e.g., using Nodemailer)
    // Destination: comercialclubeaquitem@gmail.com
    // Attachments: PDF + Log
    console.log(`[Email Service] Sending backup email to comercialclubeaquitem@gmail.com for ${metadata.signerName}`);
    console.log(`[Email Service] PDF Size: ${pdfBuffer.byteLength} bytes`);
};

export const handleWebhook = async (req, res) => {
    try {
        const payload = req.body;
        console.log('Webhook Received:', JSON.stringify(payload, null, 2));

        // Adjust identifying fields based on Assinafy real webhook structure
        // Assuming: { event: 'document.signed', document: { id: '...', ... } }
        const eventType = payload.event || payload.status;
        const documentId = payload.document?.id || payload.document_id;

        if (!documentId) {
            console.warn('Webhook received without document ID');
            return res.status(200).send('OK (Ignored)');
        }

        if (eventType === 'signed' || eventType === 'document.signed') {
            const signedAt = new Date().toISOString();

            // 1. Update Database
            // We need to find which table supports this documentId.
            // Ideally, we search all 3 or have a signature_requests table.
            // For now, try all 3 or rely on Assinafy metadata if we sent it.
            // Let's try updating all tables where assinafy_document_id matches.

            const tables = ['subscribers', 'partner_accounts', 'sellers'];
            let updated = false;
            let userData = null;

            for (const table of tables) {
                const { data, error } = await supabase
                    .from(table)
                    .update({
                        signature_status: 'signed',
                        signed_at: signedAt
                    })
                    .eq('assinafy_document_id', documentId)
                    .select()
                    .single(); // Assuming unique document_id

                if (data) {
                    updated = true;
                    userData = data;
                    console.log(`Updated ${table} status to signed for doc ${documentId}`);
                    break;
                }
            }

            if (updated && userData) {
                // 2. Fetch Signed PDF
                const pdfBuffer = await getSignedDocument(documentId);

                // 3. Send Backup Email
                await sendBackupEmail(pdfBuffer, {
                    signerName: userData.name || userData.full_name || 'Desconhecido',
                    signerPhone: userData.phone || userData.whatsapp || userData.otp_token_phone || 'N/D', // We usually store phone
                    signedAt: signedAt
                });
            }
        }

        res.status(200).send('OK');

    } catch (error) {
        console.error('Webhook Error:', error);
        // Important: Webhooks usually expect 200 OK even if we fail processing to avoid retries? 
        // Or 500 to retry? 
        // Let's send 500 so Assinafy retries if it's a transient error.
        res.status(500).send('Error processing webhook');
    }
};
