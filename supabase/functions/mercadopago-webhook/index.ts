import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MercadoPagoNotification {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("APP_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY");

    if (!accessToken || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables:", {
        hasToken: !!accessToken,
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey
      });
      throw new Error("Configuração da API não encontrada");
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const notification: MercadoPagoNotification = await req.json();

    console.log("Received notification:", JSON.stringify(notification));

    // Only process payment notifications
    if (notification.type !== "payment") {
      console.log("Ignoring non-payment notification:", notification.type);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const paymentId = notification.data.id;
    console.log("Processing payment:", paymentId);

    // Fetch payment details from Mercado Pago
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      console.error("Failed to fetch payment details:", await paymentResponse.text());
      throw new Error("Erro ao buscar detalhes do pagamento");
    }

    const paymentData = await paymentResponse.json();
    console.log("Payment data:", JSON.stringify(paymentData));

    const externalReference = paymentData.external_reference;
    const paymentStatus = paymentData.status;

    // Map Mercado Pago status to our status
    let subscriptionStatus: string;
    switch (paymentStatus) {
      case "approved":
        subscriptionStatus = "approved";
        break;
      case "pending":
      case "in_process":
      case "authorized":
        subscriptionStatus = "pending";
        break;
      case "rejected":
      case "cancelled":
        subscriptionStatus = "rejected";
        break;
      case "refunded":
      case "charged_back":
        subscriptionStatus = "refunded";
        break;
      default:
        subscriptionStatus = "pending";
    }

    console.log(`Updating subscriber with reference ${externalReference} to status ${subscriptionStatus}`);

    // Update subscriber status in database
    const { data, error } = await supabase
      .from("subscribers")
      .update({
        status: subscriptionStatus,
        mercadopago_payment_id: paymentId,
        paid_at: subscriptionStatus === "approved" ? new Date().toISOString() : null,
      })
      .eq("external_reference", externalReference);

    if (error) {
      console.error("Database update error:", error);
      throw new Error("Erro ao atualizar status do assinante");
    }

    console.log("Subscriber updated successfully:", data);

    return new Response(
      JSON.stringify({ success: true, status: subscriptionStatus }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in mercadopago-webhook:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro interno do servidor"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
