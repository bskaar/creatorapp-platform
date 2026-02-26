import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RegisterRequest {
  webinarId: string;
  email: string;
  name?: string;
  source?: string;
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
      const webinarId = url.searchParams.get("id");
      const slug = url.searchParams.get("slug");

      if (!webinarId && !slug) {
        return new Response(
          JSON.stringify({ error: "Missing webinar ID or slug" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let query = supabase
        .from("webinars")
        .select(`
          id,
          title,
          description,
          scheduled_at,
          duration_minutes,
          timezone,
          max_attendees,
          type,
          status,
          replay_enabled,
          replay_delay_hours,
          site_id,
          sites (
            name,
            logo_url,
            primary_color
          )
        `);

      if (webinarId) {
        query = query.eq("id", webinarId);
      } else if (slug) {
        query = query.eq("slug", slug);
      }

      const { data: webinar, error } = await query.maybeSingle();

      if (error || !webinar) {
        return new Response(
          JSON.stringify({ error: "Webinar not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { count } = await supabase
        .from("webinar_attendance")
        .select("*", { count: "exact", head: true })
        .eq("webinar_id", webinar.id);

      const spotsRemaining = webinar.max_attendees
        ? webinar.max_attendees - (count || 0)
        : null;

      return new Response(
        JSON.stringify({
          webinar: {
            ...webinar,
            spots_remaining: spotsRemaining,
            is_full: spotsRemaining !== null && spotsRemaining <= 0,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      const { webinarId, email, name, source }: RegisterRequest = await req.json();

      if (!webinarId || !email) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ error: "Invalid email address" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: webinar, error: webinarError } = await supabase
        .from("webinars")
        .select("id, site_id, title, max_attendees, status, scheduled_at")
        .eq("id", webinarId)
        .maybeSingle();

      if (webinarError || !webinar) {
        return new Response(
          JSON.stringify({ error: "Webinar not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (webinar.status === "cancelled") {
        return new Response(
          JSON.stringify({ error: "This webinar has been cancelled" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (webinar.max_attendees) {
        const { count } = await supabase
          .from("webinar_attendance")
          .select("*", { count: "exact", head: true })
          .eq("webinar_id", webinarId);

        if ((count || 0) >= webinar.max_attendees) {
          return new Response(
            JSON.stringify({ error: "This webinar is full" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const { data: existingRegistration } = await supabase
        .from("webinar_attendance")
        .select("id")
        .eq("webinar_id", webinarId)
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (existingRegistration) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "You are already registered for this webinar",
            alreadyRegistered: true,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: existingContact } = await supabase
        .from("contacts")
        .select("id")
        .eq("site_id", webinar.site_id)
        .eq("email", email.toLowerCase())
        .maybeSingle();

      let contactId = existingContact?.id;

      if (!contactId) {
        const { data: newContact } = await supabase
          .from("contacts")
          .insert({
            site_id: webinar.site_id,
            email: email.toLowerCase(),
            first_name: name?.split(" ")[0] || null,
            last_name: name?.split(" ").slice(1).join(" ") || null,
            source: "webinar",
            status: "active",
          })
          .select("id")
          .single();

        contactId = newContact?.id;
      }

      const { error: registrationError } = await supabase
        .from("webinar_attendance")
        .insert({
          webinar_id: webinarId,
          site_id: webinar.site_id,
          contact_id: contactId,
          email: email.toLowerCase(),
          name: name || null,
          source: source || "direct",
          registered_at: new Date().toISOString(),
        });

      if (registrationError) {
        console.error("Registration error:", registrationError);
        return new Response(
          JSON.stringify({ error: "Failed to register. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Successfully registered for the webinar",
          webinarTitle: webinar.title,
          scheduledAt: webinar.scheduled_at,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webinar registration error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
