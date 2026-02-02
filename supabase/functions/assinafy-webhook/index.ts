import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-client@2.38.4";

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
                console.log(`Updated status to ${localStatus} in table ${table} for document ${documentId}`);
                break; // found and updated
            }
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error("Webhook Error:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), { status: 500 });
    }
});
