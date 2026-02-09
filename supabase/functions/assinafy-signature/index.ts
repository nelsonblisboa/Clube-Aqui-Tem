import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept, prefer",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VERSION = "1.1.0 - Multi-Role Support";

serve(async (req: Request): Promise<Response> => {
    console.log(`[EXECUTION] Running version: ${VERSION}`);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const testId = url.searchParams.get("test_id");
    const testType = url.searchParams.get("test_type");

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { status: 200, headers: corsHeaders });
    }

    // Diagnostic Mode (GET)
    if (req.method === "GET") {
        const { data: settings } = await supabase.from("assinafy_settings").select("*").maybeSingle();
        const response: any = {
            status: "Online",
            version: VERSION,
            settings_found: !!settings,
            account_id: settings?.account_id ? "Configured" : "Missing",
            template_partner: settings?.template_id_partner || "Not Set"
        };

        if (testId && testType && settings) {
            try {
                const table = testType === "partner" ? "partner_accounts" : (testType === "subscriber" ? "subscribers" : "sellers");
                const nameField = testType === "partner" ? "nome_estabelecimento" : "name";
                const template_id = testType === "partner" ? settings.template_id_partner : (testType === "subscriber" ? settings.template_id_subscriber : settings.template_id_seller);

                const { data: targetRecord, error: targetError } = await supabase.from(table).select("*").eq("id", testId).single();
                response.step3_target = targetError ? `Error: ${targetError.message}` : `Success: ${targetRecord[nameField]}`;

                if (targetRecord && template_id) {
                    const templateResponse = await fetch(`https://api.assinafy.com.br/v1/accounts/${settings.account_id}/templates/${template_id}`, {
                        method: "GET",
                        headers: { "X-Api-Key": settings.api_key || "" }
                    });
                    response.step4_template = templateResponse.ok ? "Success" : `Error ${templateResponse.status}`;
                    if (templateResponse.ok) {
                        const tData = await templateResponse.json();
                        response.roles = (tData.data?.roles || tData.roles || []).map((r: any) => r.name);
                    }
                }
            } catch (e: any) {
                response.test_error = e.message;
            }
        }

        return new Response(JSON.stringify(response, null, 2), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    console.log(`[Version ${VERSION}] Starting POST request...`);
    let rawBody = "";

    try {
        let body: any = {};
        try {
            rawBody = await req.text();
            console.log(`[Step 1] Raw body received: "${rawBody}"`);

            if (!rawBody || rawBody.trim() === "") {
                throw new Error("Corpo da requisição vazio.");
            }
            body = JSON.parse(rawBody);
        } catch (e: any) {
            console.error("[Step 1] Erro ao ler/parsear corpo:", e.message);
            throw new Error(`[Step 1] Falha no corpo: ${e.message}`);
        }

        const { type, id } = body;

        if (!type || !id) {
            throw new Error(`[Step 1] Tipo e ID são obrigatórios. Recebido: ${JSON.stringify(body)}`);
        }

        // 1. Get Assinafy Settings
        console.log(`[Step 2] Fetching settings for ${type}...`);
        const { data: settings, error: settingsError } = await supabase
            .from("assinafy_settings")
            .select("*")
            .maybeSingle();

        if (settingsError || !settings) {
            throw new Error(`[Step 2] Configurações não encontradas: ${settingsError?.message || "Tabela vazia"}`);
        }

        const account_id = settings.account_id?.trim();
        const api_key = settings.api_key?.trim();
        let template_id = "";
        let table = "";
        let nameField = "name";

        if (type === "subscriber") {
            template_id = settings.template_id_subscriber?.trim();
            table = "subscribers";
        } else if (type === "partner") {
            template_id = settings.template_id_partner?.trim();
            table = "partner_accounts";
            nameField = "nome_estabelecimento";
        } else if (type === "seller") {
            template_id = settings.template_id_seller?.trim();
            table = "sellers";
        } else {
            throw new Error("[Step 2] Tipo inválido");
        }

        if (!template_id) {
            throw new Error(`[Step 2] Template ID para ${type} não configurado.`);
        }

        // 2. Get target data
        console.log(`[Step 3] Fetching target ${id} from ${table}...`);
        const { data: targetRecord, error: targetError } = await supabase
            .from(table)
            .select("*")
            .eq("id", id)
            .single();

        if (targetError || !targetRecord) {
            throw new Error(`[Step 3] Registro ID ${id} não encontrado na tabela ${table}: ${targetError?.message}`);
        }

        const signerEmail = targetRecord.email;
        const signerName = targetRecord[nameField];

        // 4. Fetch Template Details to get Role IDs
        console.log(`[Step 4] Fetching template details for ${template_id}...`);
        const templateResponse = await fetch(`https://api.assinafy.com.br/v1/accounts/${account_id}/templates/${template_id}`, {
            method: "GET",
            headers: {
                "X-Api-Key": api_key,
            }
        });

        if (!templateResponse.ok) {
            const errorText = await templateResponse.text();
            throw new Error(`[Step 4] Erro Assinafy (HTTP ${templateResponse.status}): ${errorText}`);
        }

        const templateData = await templateResponse.json();
        const roles = templateData.data?.roles || templateData.roles || [];
        const roleNames = roles.map((r: any) => r.name).join(", ");
        console.log(`[Step 4] Roles found in template: ${roleNames}`);

        if (roles.length === 0) {
            throw new Error("[Step 4] O template selecionado não possui papéis (roles) configurados na Assinafy.");
        }

        // Multi-Role Signer Mapping
        const signers = roles.map((role: any) => {
            const roleName = role.name.toLowerCase();

            // Se for o papel do Clube/Empresa/Admin
            if (roleName.includes("clube") || roleName.includes("empresa") || roleName.includes("admin")) {
                return {
                    role_id: role.id,
                    email: "clubeaquitem.comercial@gmail.com",
                    name: "Clube Aqui Tem"
                };
            }

            // Senão, assume que é o papel do Parceiro/Assinante/Cliente
            return {
                role_id: role.id,
                email: signerEmail,
                name: signerName
            };
        });

        console.log(`[Step 4] Mapped ${signers.length} signers: ${JSON.stringify(signers.map((s: any) => s.name))}`);

        // 5. Create Document from Template in Assinafy
        console.log(`[Step 5] Creating document in Assinafy with ${signers.length} signers...`);
        const assinafyPayload = {
            name: `Contrato - ${signerName}`,
            message: "Por favor, assine o contrato do Clube Aqui Tem.",
            signers: signers,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        const response = await fetch(`https://api.assinafy.com.br/v1/accounts/${account_id}/templates/${template_id}/documents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": api_key,
            },
            body: JSON.stringify(assinafyPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Assinafy API Error:", errorText);
            throw new Error(`Erro na Assinafy API ao criar documento: ${errorText}`);
        }

        const assinafyData = await response.json();
        const documentId = assinafyData.data.id;
        const assignmentId = assinafyData.data.assignment?.id;
        const signingUrl = assinafyData.data.assignment?.signing_urls?.[0]?.url;

        // 4. Update local DB
        const { error: updateError } = await supabase
            .from(table)
            .update({
                assinafy_document_id: documentId,
                assinafy_assignment_id: assignmentId,
                signature_status: "pending",
                signature_url: signingUrl,
            })
            .eq("id", id);

        if (updateError) {
            console.error("DB Update Error:", updateError);
        }

        // 5. Send WhatsApp notification via Evolution API
        if (settings.evolution_api_url && settings.evolution_api_key) {
            try {
                const phone = targetRecord.phone || targetRecord.telefone;
                if (phone) {
                    const cleanNumber = phone.replace(/\D/g, "");
                    const formattedNumber = cleanNumber.startsWith("55") ? cleanNumber : `55${cleanNumber}`;
                    const baseUrl = Deno.env.get("APP_URL") || "https://clubeaquitem.com.br";
                    const validationUrl = `${baseUrl}/validar-assinatura?userId=${id}&userType=${type}`;

                    const message = `Olá ${signerName.split(' ')[0]}! Para concluir seu acesso ao Clube Aqui Tem, você precisa realizar a assinatura digital do seu contrato. 

Acesse o link abaixo para validar sua identidade com o código que será enviado em seguida:
${validationUrl}`;

                    console.log(`Sending WhatsApp to ${formattedNumber}...`);

                    const evolutionUrl = `${settings.evolution_api_url}/message/sendText/${settings.evolution_instance || 'default'}`;
                    const evolutionRes = await fetch(evolutionUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "apikey": settings.evolution_api_key
                        },
                        body: JSON.stringify({
                            number: formattedNumber,
                            options: {
                                delay: 1200,
                                presence: "composing",
                                linkPreview: false
                            },
                            textMessage: {
                                text: message
                            }
                        })
                    });

                    if (!evolutionRes.ok) {
                        const errorMsg = await evolutionRes.text();
                        console.error("Evolution API Error:", errorMsg);
                    } else {
                        console.log("WhatsApp message sent successfully!");
                    }
                }
            } catch (waError) {
                console.error("Error sending WhatsApp notification:", waError);
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                document_id: documentId,
                signing_url: signingUrl
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );

    } catch (error: any) {
        const errorMsg = error.message || "Erro desconhecido";
        console.error(`[Version ${VERSION}] Final Catch Error:`, errorMsg);

        // We return 200 here to avoid browser hiding the context of 500 errors
        return new Response(
            JSON.stringify({
                success: false,
                error: errorMsg,
                version: VERSION,
                debug_body: rawBody,
                details: "Este erro foi retornado como 200 para fins de diagnóstico."
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    }
});
