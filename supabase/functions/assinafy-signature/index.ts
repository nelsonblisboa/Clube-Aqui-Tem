import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-client@2.38.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { type, id } = await req.json();

        if (!type || !id) {
            throw new Error("Tipo e ID são obrigatórios");
        }

        // 1. Get Assinafy Settings
        const { data: settings, error: settingsError } = await supabase
            .from("assinafy_settings")
            .select("*")
            .maybeSingle();

        if (settingsError || !settings) {
            throw new Error("Configurações da Assinafy não encontradas no banco de dados.");
        }

        const { account_id, api_key } = settings;
        let template_id = "";
        let table = "";
        let nameField = "name";

        if (type === "subscriber") {
            template_id = settings.template_id_subscriber;
            table = "subscribers";
        } else if (type === "partner") {
            template_id = settings.template_id_partner;
            table = "partner_accounts";
            nameField = "nome_estabelecimento";
        } else if (type === "seller") {
            template_id = settings.template_id_seller;
            table = "sellers";
        } else {
            throw new Error("Tipo inválido");
        }

        if (!template_id) {
            throw new Error(`Template ID para ${type} não configurado.`);
        }

        // 2. Get target data
        const { data: targetRecord, error: targetError } = await supabase
            .from(table)
            .select("*")
            .eq("id", id)
            .single();

        if (targetError || !targetRecord) {
            throw new Error(`Registro não encontrado: ${targetError?.message}`);
        }

        // 3. Create Document from Template in Assinafy
        const signerEmail = targetRecord.email;
        const signerName = targetRecord[nameField];

        const assinafyPayload = {
            name: `Contrato - ${signerName} - ${new Date().toLocaleDateString()}`,
            message: "Por favor, assine o contrato do Clube Aqui Tem.",
            signers: [
                {
                    role_id: "fa8c14f32d732271e071998246e", // NOTE: This should ideally be configurable or fetched. For now using a placeholder or common role.
                    email: signerEmail,
                    name: signerName
                }
            ],
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        };

        console.log("Creating Assinafy document from template...", { template_id, signerEmail });

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
            throw new Error(`Erro na Assinafy API: ${errorText}`);
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

    } catch (error) {
        console.error("Assinafy Function Error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    }
});
