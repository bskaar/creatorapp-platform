import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    const signature = req.headers.get("stripe-signature");
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !stripeWebhookSecret) {
      throw new Error("Missing webhook signature or secret");
    }

    const body = await req.text();

    const response = await fetch("https://api.stripe.com/v1/events", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "type": "checkout.session.completed",
      }).toString(),
    });

    const event = JSON.parse(body);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.mode === "subscription") {
        const siteId = session.subscription_data?.metadata?.site_id || session.metadata?.site_id;
        const subscriptionId = session.subscription;

        if (siteId && subscriptionId) {
          const { error } = await supabaseClient
            .from("sites")
            .update({
              platform_stripe_subscription_id: subscriptionId,
              platform_subscription_status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("id", siteId);

          if (error) {
            console.error("Failed to update site subscription:", error);
          } else {
            console.log(`Platform subscription activated for site: ${siteId}`);
          }
        }
      } else {
        const { error } = await supabaseClient
          .from("orders")
          .update({
            payment_status: "completed",
            metadata: { payment_intent: session.payment_intent },
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("external_order_id", session.id);

        if (error) {
          console.error("Failed to update order:", error);
          throw error;
        }

        console.log(`Order updated for session: ${session.id}`);
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const subscription = event.data.object;
      const siteId = subscription.metadata?.site_id;

      if (siteId) {
        const { error } = await supabaseClient
          .from("sites")
          .update({
            platform_subscription_status: subscription.status,
            platform_subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            platform_trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", siteId);

        if (error) {
          console.error("Failed to update subscription status:", error);
        } else {
          console.log(`Subscription status updated for site: ${siteId}`);
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const siteId = subscription.metadata?.site_id;

      if (siteId) {
        const { error } = await supabaseClient
          .from("sites")
          .update({
            platform_subscription_status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", siteId);

        if (error) {
          console.error("Failed to update subscription cancellation:", error);
        } else {
          console.log(`Subscription canceled for site: ${siteId}`);
        }
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        const { error } = await supabaseClient
          .from("sites")
          .update({
            platform_subscription_status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("platform_stripe_subscription_id", subscriptionId);

        if (error) {
          console.error("Failed to update subscription payment failure:", error);
        } else {
          console.log(`Subscription marked past_due: ${subscriptionId}`);
        }
      }
    }

    if (event.type === "account.updated") {
      const account = event.data.object;

      const { error } = await supabaseClient
        .from("sites")
        .update({
          stripe_connect_onboarding_complete: account.details_submitted,
          stripe_connect_charges_enabled: account.charges_enabled,
          stripe_connect_payouts_enabled: account.payouts_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_connect_account_id", account.id);

      if (error) {
        console.error("Failed to update Connect account:", error);
      } else {
        console.log(`Connect account updated: ${account.id}`);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Webhook processing failed",
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
});
