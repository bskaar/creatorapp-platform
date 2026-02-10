import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          error: "RESEND_API_KEY not configured",
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

    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    fiveDaysFromNow.setHours(23, 59, 59, 999);

    const startOfDay = new Date(fiveDaysFromNow);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(fiveDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: sitesNeedingReminder, error: queryError } = await supabaseClient
      .from("sites")
      .select(`
        id,
        name,
        owner_id,
        platform_trial_ends_at,
        trial_reminder_sent_at
      `)
      .eq("platform_subscription_status", "trialing")
      .is("trial_reminder_sent_at", null)
      .gte("platform_trial_ends_at", startOfDay.toISOString())
      .lte("platform_trial_ends_at", endOfDay.toISOString());

    if (queryError) {
      throw new Error(`Database query error: ${queryError.message}`);
    }

    if (!sitesNeedingReminder || sitesNeedingReminder.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No trial reminders to send",
          processed: 0,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const emailsSent = [];
    const emailsFailed = [];

    for (const site of sitesNeedingReminder) {
      try {
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(
          site.owner_id
        );

        if (userError || !userData.user) {
          console.error(`Failed to get user data for site ${site.id}:`, userError);
          emailsFailed.push({ siteId: site.id, reason: "User not found" });
          continue;
        }

        const userEmail = userData.user.email;
        const userName = userData.user.user_metadata?.full_name || "there";

        const trialEndsAt = new Date(site.platform_trial_ends_at);
        const daysRemaining = Math.ceil(
          (trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Your Trial is Almost Over</h1>
            <p>Hi ${userName},</p>
            <p>Your 14-day free trial for <strong>${site.name}</strong> ends in <strong>${daysRemaining} days</strong>.</p>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">Important:</p>
              <p style="margin: 8px 0 0 0; color: #92400e;">
                To avoid being charged, you must cancel before your trial ends. If you don't cancel, your subscription will automatically convert to a paid plan.
              </p>
            </div>

            <h2 style="color: #1f2937; font-size: 18px;">What happens next?</h2>
            <ul style="color: #4b5563; line-height: 1.6;">
              <li>If you do nothing, you'll be charged on the trial end date</li>
              <li>If you subscribe now, you'll keep all your work and continue building</li>
              <li>If you cancel, you'll lose access but won't be charged</li>
            </ul>

            <div style="margin: 30px 0; text-align: center;">
              <a href="https://creatorapp.us/subscription-select"
                 style="display: inline-block; background: #2563eb; color: white;
                        padding: 14px 28px; text-decoration: none; border-radius: 6px;
                        font-weight: bold; margin-right: 10px;">
                Choose a Plan
              </a>
              <a href="https://creatorapp.us/settings?tab=subscription"
                 style="display: inline-block; background: #6b7280; color: white;
                        padding: 14px 28px; text-decoration: none; border-radius: 6px;
                        font-weight: bold;">
                Manage Trial
              </a>
            </div>

            <h2 style="color: #1f2937; font-size: 18px;">What you get with a paid plan:</h2>
            <ul style="color: #4b5563; line-height: 1.6;">
              <li>Keep all your sites, pages, and content</li>
              <li>Access to premium templates and AI features</li>
              <li>E-commerce and email marketing tools</li>
              <li>Priority customer support</li>
            </ul>

            <p style="color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Questions? Reply to this email or contact us at <a href="mailto:support@creatorapp.us" style="color: #2563eb;">support@creatorapp.us</a>
            </p>
          </div>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "CreatorApp <notifications@creatorapp.us>",
            to: [userEmail],
            subject: `Your CreatorApp Trial Ends in ${daysRemaining} Days`,
            html: emailHtml,
            reply_to: "support@creatorapp.us",
            tags: [
              { name: "type", value: "trial_reminder" },
              { name: "site_id", value: site.id },
            ],
          }),
        });

        if (!emailResponse.ok) {
          const error = await emailResponse.json();
          console.error(`Failed to send email for site ${site.id}:`, error);
          emailsFailed.push({ siteId: site.id, reason: error.message || "Email send failed" });
          continue;
        }

        const { data: updateData, error: updateError } = await supabaseClient
          .from("sites")
          .update({ trial_reminder_sent_at: new Date().toISOString() })
          .eq("id", site.id);

        if (updateError) {
          console.error(`Failed to update site ${site.id}:`, updateError);
        }

        emailsSent.push({
          siteId: site.id,
          siteName: site.name,
          email: userEmail,
          daysRemaining,
        });
      } catch (error) {
        console.error(`Error processing site ${site.id}:`, error);
        emailsFailed.push({
          siteId: site.id,
          reason: error.message || "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Trial reminder emails processed",
        processed: sitesNeedingReminder.length,
        emailsSent: emailsSent.length,
        emailsFailed: emailsFailed.length,
        details: {
          sent: emailsSent,
          failed: emailsFailed,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Trial reminder error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process trial reminders",
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
