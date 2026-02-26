import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UnsubscribeRequest {
  token: string;
  reason?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === "GET") {
      const url = new URL(req.url);
      const token = url.searchParams.get("token");

      if (!token) {
        return new Response(
          JSON.stringify({ error: "Missing unsubscribe token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: contact, error } = await supabase
        .from("contacts")
        .select("id, email, first_name, status, site_id")
        .eq("unsubscribe_token", token)
        .maybeSingle();

      if (error || !contact) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired unsubscribe link" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const maskedEmail = contact.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

      return new Response(
        JSON.stringify({
          valid: true,
          email: maskedEmail,
          firstName: contact.first_name,
          alreadyUnsubscribed: contact.status === "unsubscribed",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      const { token, reason }: UnsubscribeRequest = await req.json();

      if (!token) {
        return new Response(
          JSON.stringify({ error: "Missing unsubscribe token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: contact, error: fetchError } = await supabase
        .from("contacts")
        .select("id, email, site_id, status")
        .eq("unsubscribe_token", token)
        .maybeSingle();

      if (fetchError || !contact) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired unsubscribe link" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (contact.status === "unsubscribed") {
        return new Response(
          JSON.stringify({ success: true, message: "You are already unsubscribed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await supabase
        .from("contacts")
        .update({
          status: "unsubscribed",
          unsubscribed_at: new Date().toISOString(),
          notes: reason ? `Unsubscribe reason: ${reason}` : undefined,
        })
        .eq("id", contact.id);

      if (updateError) {
        console.error("Error updating contact:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to process unsubscribe request" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.from("contact_activities").insert({
        contact_id: contact.id,
        site_id: contact.site_id,
        activity_type: "unsubscribed",
        description: reason ? `Unsubscribed with reason: ${reason}` : "Unsubscribed via email link",
      });

      return new Response(
        JSON.stringify({ success: true, message: "Successfully unsubscribed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
