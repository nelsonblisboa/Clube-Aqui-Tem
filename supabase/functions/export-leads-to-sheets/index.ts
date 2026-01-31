import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("APP_SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header to verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all leads
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (leadsError) {
      throw leadsError;
    }

    // Format data for export
    const formattedLeads = leads.map((lead) => ({
      "Nome Completo": lead.nome_completo,
      "Telefone": lead.telefone,
      "Email": lead.email,
      "Fonte": lead.source || "meta_ads",
      "Convertido": lead.converted ? "Sim" : "Não",
      "Data Cadastro": new Date(lead.created_at).toLocaleString("pt-BR"),
      "Observações": lead.notes || "",
    }));

    // Return CSV format for easy import to Google Sheets
    const headers = Object.keys(formattedLeads[0] || {});
    const csvRows = [
      headers.join(","),
      ...formattedLeads.map(row =>
        headers.map(h => `"${(row[h as keyof typeof row] || "").toString().replace(/"/g, '""')}"`).join(",")
      )
    ];
    const csvContent = csvRows.join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error exporting leads:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
