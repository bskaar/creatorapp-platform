import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          error: "Email service is not configured. Please add your RESEND_API_KEY environment variable.",
          setup_info: "Get your API key from https://resend.com/api-keys",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { to, subject, html, text, from, replyTo, tags }: EmailRequest = await req.json();

    if (!to || !subject || (!html && !text)) {
      throw new Error("Missing required fields: to, subject, and html or text");
    }

    const emailData: any = {
      from: from || "onboarding@resend.dev",
      to: Array.isArray(to) ? to : [to],
      subject,
    };

    if (html) emailData.html = html;
    if (text) emailData.text = text;
    if (replyTo) emailData.reply_to = replyTo;
    if (tags) emailData.tags = tags;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    const { data: sites } = await supabaseClient
      .from("site_members")
      .select("site_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (sites?.site_id) {
      await supabaseClient.from("email_logs").insert({
        site_id: sites.site_id,
        recipient: Array.isArray(to) ? to[0] : to,
        subject,
        status: "sent",
        provider: "resend",
        provider_message_id: result.id,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send email",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
