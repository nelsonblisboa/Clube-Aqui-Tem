import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
        const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
        if (!accessToken) throw new Error("Mercado Pago não configurado");

        const { email, external_reference, amount } = await req.json();

        // Mercado Pago Preapproval (Subscription)
        const subscription = {
            reason: "Assinatura Mensal - Clube Aqui Tem",
            auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                transaction_amount: amount || 19.99,
                currency_id: "BRL",
            },
            payer_email: email,
            external_reference: external_reference,
            back_url: "https://clubeaquitem.com.br/pagamento-sucesso",
            status: "pending",
        };

        const response = await fetch("https://api.mercadopago.com/preapproval", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(subscription),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Mercado Pago Subscription Error:", error);
            throw new Error(error.message || "Erro ao criar assinatura");
        }

        const data = await response.json();

        return new Response(
            JSON.stringify({ init_point: data.init_point, id: data.id }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }
});
