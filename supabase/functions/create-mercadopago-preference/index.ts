import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");

    if (!accessToken) {
      throw new Error("Mercado Pago não configurado");
    }

    const { amount, description, email, external_reference } = await req.json();

    // Validate and format amount
    if (!amount || isNaN(amount)) {
      throw new Error("Valor inválido");
    }

    // Round to 2 decimal places and ensure it's a valid number
    const unitPrice = Math.round(parseFloat(amount) * 100) / 100;

    console.log("Creating preference with:", {
      amount: unitPrice,
      description,
      email,
      external_reference,
    });

    // Criar preferência no Mercado Pago
    const preference = {
      items: [{
        title: description || "Clube Aqui Tem - Assinatura Anual",
        quantity: 1,
        currency_id: "BRL",
        unit_price: unitPrice,
      }],
      payer: {
        email: email,
      },
      external_reference: external_reference,
      back_urls: {
        success: `${req.headers.get("origin") || "http://localhost:8080"}/pagamento-sucesso`,
        failure: `${req.headers.get("origin") || "http://localhost:8080"}/pagamento-erro`,
        pending: `${req.headers.get("origin") || "http://localhost:8080"}/pagamento-pendente`,
      },
      statement_descriptor: "CLUBE AQUI TEM",
    };

    console.log("Sending preference to Mercado Pago:", JSON.stringify(preference, null, 2));

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Mercado Pago error:", error);
      throw new Error(error.message || "Erro ao criar preferência");
    }

    const data = await response.json();

    console.log("Preference created successfully:", data.id);

    return new Response(
      JSON.stringify({
        init_point: data.init_point,
        id: data.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro interno"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
