import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  siteId?: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

interface EmailConfig {
  provider: 'shared' | 'resend' | 'sendgrid' | 'smtp';
  from_name?: string;
  from_email?: string;
  reply_to_email?: string;
  api_key?: string;
  use_custom_domain?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const platformResendKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      userId = user?.id || null;
    }

    const { siteId, to, subject, html, text, from, fromName, replyTo, tags }: EmailRequest = await req.json();

    if (!to || !subject || (!html && !text)) {
      throw new Error("Missing required fields: to, subject, and html or text");
    }

    let emailConfig: EmailConfig = { provider: 'shared' };
    let siteName = 'CreatorApp';
    let siteSubdomain = 'notifications';

    if (siteId) {
      const { data: site } = await serviceClient
        .from("sites")
        .select("name, subdomain, settings")
        .eq("id", siteId)
        .maybeSingle();

      if (site) {
        siteName = site.name || 'CreatorApp';
        siteSubdomain = site.subdomain || site.name?.toLowerCase().replace(/\s+/g, '-') || 'notifications';
        emailConfig = (site.settings as any)?.email_config || { provider: 'shared' };
      }
    } else if (userId) {
      const { data: membership } = await supabaseClient
        .from("site_members")
        .select("site_id, sites(name, subdomain, settings)")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (membership?.sites) {
        const site = membership.sites as any;
        siteName = site.name || 'CreatorApp';
        siteSubdomain = site.subdomain || site.name?.toLowerCase().replace(/\s+/g, '-') || 'notifications';
        emailConfig = site.settings?.email_config || { provider: 'shared' };
      }
    }

    let resendApiKey: string | undefined;
    let fromEmail: string;
    let fromDisplayName: string;
    let replyToEmail: string;

    const useCustomDomain = emailConfig.use_custom_domain &&
                            emailConfig.provider !== 'shared' &&
                            emailConfig.api_key;

    if (useCustomDomain && emailConfig.api_key) {
      resendApiKey = emailConfig.api_key;
      fromEmail = emailConfig.from_email || from || `hello@${siteSubdomain}.com`;
      fromDisplayName = fromName || emailConfig.from_name || siteName;
      replyToEmail = replyTo || emailConfig.reply_to_email || fromEmail;
    } else {
      resendApiKey = platformResendKey;
      fromEmail = `${siteSubdomain}@mail.creatorapp.us`;
      fromDisplayName = fromName || emailConfig.from_name || siteName;
      replyToEmail = replyTo || emailConfig.reply_to_email || `support@creatorapp.us`;
    }

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          error: "Email service is not configured. Platform RESEND_API_KEY is missing.",
          setup_info: "Contact platform administrator to configure email sending.",
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

    const emailData: any = {
      from: `${fromDisplayName} <${fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      reply_to: replyToEmail,
    };

    if (html) emailData.html = html;
    if (text) emailData.text = text;
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
      console.error("Resend API error:", error);
      throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    let logSiteId = siteId;
    if (!logSiteId && userId) {
      const { data: membership } = await supabaseClient
        .from("site_members")
        .select("site_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      logSiteId = membership?.site_id;
    }

    if (logSiteId) {
      await serviceClient.from("email_logs").insert({
        site_id: logSiteId,
        recipient: Array.isArray(to) ? to[0] : to,
        subject,
        status: "sent",
        provider: useCustomDomain ? emailConfig.provider : "shared",
        provider_message_id: result.id,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
        fromEmail,
        provider: useCustomDomain ? 'custom' : 'shared',
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
