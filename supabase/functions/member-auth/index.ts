import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple hash function for password (in production, use bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface RequestBody {
  action: 'login' | 'create-password';
  cpf?: string;
  password?: string;
  subscriberId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("APP_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: RequestBody = await req.json();

    if (body.action === 'login') {
      const { cpf, password } = body;

      if (!cpf) {
        return new Response(
          JSON.stringify({ success: false, message: 'CPF é obrigatório' }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Find subscriber by CPF with approved status
      const { data: subscriber, error } = await supabase
        .from('subscribers')
        .select('id, name, email, cpf, password_hash, first_access')
        .eq('cpf', cpf)
        .eq('status', 'approved')
        .single();

      if (error || !subscriber) {
        console.log('Subscriber not found or not approved:', error);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'CPF não encontrado ou pagamento não confirmado. Verifique seus dados.'
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if first access (no password set)
      if (subscriber.first_access || !subscriber.password_hash) {
        // First access - allow login without password to create one
        if (!password || password === '') {
          return new Response(
            JSON.stringify({
              success: true,
              firstAccess: true,
              subscriber: {
                id: subscriber.id,
                name: subscriber.name,
                email: subscriber.email,
                cpf: subscriber.cpf,
                first_access: true
              }
            }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      // Verify password
      if (!password) {
        return new Response(
          JSON.stringify({ success: false, message: 'Senha é obrigatória' }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const hashedPassword = await hashPassword(password);

      if (hashedPassword !== subscriber.password_hash) {
        return new Response(
          JSON.stringify({ success: false, message: 'Senha incorreta' }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          subscriber: {
            id: subscriber.id,
            name: subscriber.name,
            email: subscriber.email,
            cpf: subscriber.cpf,
            first_access: false
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } else if (body.action === 'create-password') {
      const { subscriberId, password } = body;

      if (!subscriberId || !password) {
        return new Response(
          JSON.stringify({ success: false, message: 'Dados incompletos' }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (password.length < 6) {
        return new Response(
          JSON.stringify({ success: false, message: 'A senha deve ter pelo menos 6 caracteres' }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const hashedPassword = await hashPassword(password);

      const { error } = await supabase
        .from('subscribers')
        .update({
          password_hash: hashedPassword,
          first_access: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriberId);

      if (error) {
        console.error('Error updating password:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Erro ao criar senha' }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Ação inválida' }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in member-auth function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
