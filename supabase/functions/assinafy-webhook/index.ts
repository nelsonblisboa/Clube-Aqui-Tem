import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request): Promise<Response> => {
    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const payload = await req.json();
        console.log("Assinafy Webhook received:", JSON.stringify(payload, null, 2));

        // Common Assinafy webhook fields (adjust based on actual payload)
        const documentId = payload.document_id || payload.data?.document_id || payload.id;
        const status = payload.status || payload.event || payload.data?.status;

        if (!documentId) {
            return new Response(JSON.stringify({ error: "No document ID found in payload" }), { status: 400 });
        }

        // Map Assinafy status to our status
        let localStatus = "pending";
        if (status === "signed" || status === "document_signed") localStatus = "signed";
        if (status === "declined" || status === "document_declined") localStatus = "declined";
        if (status === "cancelled") localStatus = "cancelled";

        // Update in all 3 tables just in case (or we could fetch where documentId matches)
        const tables = ["subscribers", "partner_accounts", "sellers"];
        let updatedUser = null;

        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .update({
                    signature_status: localStatus,
                    signed_at: localStatus === "signed" ? new Date().toISOString() : null
                })
                .eq("assinafy_document_id", documentId)
                .select();

            if (data && data.length > 0) {
                updatedUser = data[0];
                console.log(`Updated status to ${localStatus} in table ${table} for document ${documentId}`);
                break; // found and updated
            }
        }

        // WhatsApp notification on signature success
        if (localStatus === "signed" && updatedUser) {
            const { data: settings } = await supabase.from("assinafy_settings").select("*").maybeSingle();

            if (settings && settings.evolution_api_url && settings.evolution_api_key) {
                try {
                    const phone = updatedUser.phone || updatedUser.telefone;
                    if (phone) {
                        const cleanNumber = phone.replace(/\D/g, "");
                        const formattedNumber = cleanNumber.startsWith("55") ? cleanNumber : `55${cleanNumber}`;

                        const signerName = updatedUser.name || updatedUser.nome_estabelecimento || updatedUser.responsavel || "Associado";
                        const message = `Parabéns ${signerName.split(' ')[0]}! 🎉 Seu contrato foi assinado com sucesso.

Seu acesso ao Clube Aqui Tem já está ativo. Você pode acessar sua conta utilizando seu CPF e a senha cadastrada.

Seja muito bem-vindo!`;

                        const evolutionUrl = `${settings.evolution_api_url}/message/sendText/${settings.evolution_instance || 'default'}`;
                        await fetch(evolutionUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "apikey": settings.evolution_api_key
                            },
                            body: JSON.stringify({
                                number: formattedNumber,
                                options: { delay: 1000 },
                                textMessage: { text: message }
                            })
                        });
                    }
                } catch (waError) {
                    console.error("Error sending success WhatsApp:", waError);
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error("Webhook Error:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), { status: 500 });
    }
});
