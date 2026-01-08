import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PayerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  cpf: string;
}

interface RequestBody {
  payer: PayerInfo;
  discountApplied?: boolean;
  paymentType?: "annual" | "monthly";
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    
    if (!accessToken) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN not configured");
      throw new Error("Configuração de pagamento não encontrada");
    }

    const { payer, discountApplied, paymentType = "annual" }: RequestBody = await req.json();

    // Calculate prices
    const baseMonthlyPrice = 19.99;
    const discountedMonthlyPrice = 18.99;
    const monthlyPrice = discountApplied ? discountedMonthlyPrice : baseMonthlyPrice;
    const annualPrice = monthlyPrice * 12;

    // Generate external reference
    const externalReference = `associado_${Date.now()}_${payer.cpf}`;

    console.log("Creating preference for payer:", payer.email, "paymentType:", paymentType, "discount:", discountApplied);

    // Parse phone number
    const phoneNumbers = payer.phone.replace(/\D/g, "");
    const areaCode = phoneNumbers.slice(0, 2);
    const phoneNumber = phoneNumbers.slice(2);

    // Prepare payer data
    const payerData = {
      name: payer.name.split(" ")[0],
      surname: payer.name.split(" ").slice(1).join(" ") || "",
      email: payer.email,
      phone: {
        area_code: areaCode,
        number: phoneNumber,
      },
      identification: {
        type: "CPF",
        number: payer.cpf,
      },
      address: {
        street_name: payer.address,
      },
    };

    const backUrls = {
      success: `${req.headers.get("origin") || "https://example.com"}/pagamento-sucesso`,
      failure: `${req.headers.get("origin") || "https://example.com"}/pagamento-erro`,
      pending: `${req.headers.get("origin") || "https://example.com"}/pagamento-pendente`,
    };

    // Handle payment type
    if (paymentType === "monthly") {
      // Create subscription preapproval for recurring payment
      console.log("Creating subscription preapproval for monthly recurring payment");

      const preapproval = {
        reason: discountApplied 
          ? "Clube Aqui Tem - Assinatura Mensal (5% OFF)" 
          : "Clube Aqui Tem - Assinatura Mensal",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          repetitions: 12,
          transaction_amount: monthlyPrice,
          currency_id: "BRL",
        },
        payer_email: payer.email,
        back_url: backUrls.success,
        external_reference: externalReference,
      };

      const response = await fetch("https://api.mercadopago.com/preapproval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preapproval),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Mercado Pago API error:", data);
        throw new Error(data.message || "Erro ao criar assinatura recorrente");
      }

      console.log("Preapproval created successfully:", data.id);

      return new Response(
        JSON.stringify({
          id: data.id,
          init_point: data.init_point,
          sandbox_init_point: data.sandbox_init_point,
          external_reference: externalReference,
          type: "subscription",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Create regular preference for annual payment (one-time with installments)
    const preference = {
      items: [
        {
          id: "clube-aqui-tem-anual",
          title: discountApplied 
            ? "Clube Aqui Tem - Plano Anual 12 meses (5% OFF)" 
            : "Clube Aqui Tem - Plano Anual 12 meses",
          description: "Acesso a descontos exclusivos, telemedicina e assistências por 12 meses",
          quantity: 1,
          currency_id: "BRL",
          unit_price: annualPrice,
        },
      ],
      payer: payerData,
      back_urls: backUrls,
      auto_return: "approved",
      statement_descriptor: "CLUBE AQUI TEM",
      external_reference: externalReference,
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
      payment_methods: {
        installments: 12,
      },
    };

    console.log("Sending preference to Mercado Pago API");

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Mercado Pago API error:", data);
      throw new Error(data.message || "Erro ao criar preferência de pagamento");
    }

    console.log("Preference created successfully:", data.id);

    return new Response(
      JSON.stringify({
        id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point,
        external_reference: externalReference,
        type: "preference",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in create-mercadopago-preference:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
