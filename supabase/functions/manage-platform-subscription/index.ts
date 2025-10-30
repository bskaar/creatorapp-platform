import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SubscriptionRequest {
  action: "create" | "upgrade" | "downgrade" | "cancel" | "reactivate";
  planName?: string;
  siteId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      return new Response(
        JSON.stringify({
          error: "Stripe is not configured. Please add your STRIPE_SECRET_KEY.",
          setup_url: "https://bolt.new/setup/stripe",
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

    const { action, planName, siteId }: SubscriptionRequest = await req.json();

    if (!siteId) {
      throw new Error("Site ID is required");
    }

    const { data: site, error: siteError } = await supabaseClient
      .from("sites")
      .select("*")
      .eq("id", siteId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (siteError || !site) {
      throw new Error("Site not found or access denied");
    }

    if (action === "create") {
      if (!planName) {
        throw new Error("Plan name is required for creating subscription");
      }

      const { data: plan, error: planError } = await supabaseClient
        .from("subscription_plans")
        .select("*")
        .eq("name", planName)
        .eq("is_active", true)
        .maybeSingle();

      if (planError || !plan) {
        throw new Error("Invalid subscription plan");
      }

      if (plan.price_monthly === 0) {
        await supabaseClient
          .from("sites")
          .update({
            platform_subscription_plan_id: plan.id,
            platform_subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", siteId);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Free plan activated",
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      let customerId = site.platform_stripe_customer_id;

      if (!customerId) {
        const customerParams = new URLSearchParams({
          email: user.email || "",
          "metadata[user_id]": user.id,
          "metadata[site_id]": siteId,
        });

        const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: customerParams.toString(),
        });

        if (!customerResponse.ok) {
          const error = await customerResponse.text();
          throw new Error(`Stripe API error: ${error}`);
        }

        const customer = await customerResponse.json();
        customerId = customer.id;

        await supabaseClient
          .from("sites")
          .update({ platform_stripe_customer_id: customerId })
          .eq("id", siteId);
      }

      const params = new URLSearchParams({
        "mode": "subscription",
        "customer": customerId,
        "success_url": `${req.headers.get("origin")}/dashboard?subscription=success`,
        "cancel_url": `${req.headers.get("origin")}/pricing?subscription=canceled`,
        "line_items[0][price]": plan.stripe_price_id || "",
        "line_items[0][quantity]": "1",
        "payment_method_collection": "always",
        "subscription_data[metadata][site_id]": siteId,
        "subscription_data[metadata][plan_name]": planName,
      });

      console.log('Creating checkout session with params:', {
        mode: 'subscription',
        customer: customerId,
        price: plan.stripe_price_id,
        payment_method_collection: 'always'
      });

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stripe checkout session error:', errorText);
        throw new Error(`Stripe API error: ${errorText}`);
      }

      const session = await response.json();
      console.log('Created checkout session:', { id: session.id, url: session.url, mode: session.mode });

      return new Response(
        JSON.stringify({
          sessionId: session.id,
          url: session.url,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "cancel") {
      if (!site.platform_stripe_subscription_id) {
        throw new Error("No active subscription to cancel");
      }

      const response = await fetch(
        `https://api.stripe.com/v1/subscriptions/${site.platform_stripe_subscription_id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${stripeKey}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Stripe API error: ${error}`);
      }

      await supabaseClient
        .from("sites")
        .update({
          platform_subscription_status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", siteId);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Subscription canceled successfully",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "upgrade" || action === "downgrade") {
      if (!planName) {
        throw new Error("Plan name is required for upgrade/downgrade");
      }

      if (!site.platform_stripe_subscription_id) {
        throw new Error("No active subscription to modify");
      }

      const { data: newPlan, error: planError } = await supabaseClient
        .from("subscription_plans")
        .select("*")
        .eq("name", planName)
        .eq("is_active", true)
        .maybeSingle();

      if (planError || !newPlan) {
        throw new Error("Invalid subscription plan");
      }

      const subscriptionResponse = await fetch(
        `https://api.stripe.com/v1/subscriptions/${site.platform_stripe_subscription_id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${stripeKey}`,
          },
        }
      );

      if (!subscriptionResponse.ok) {
        throw new Error("Failed to fetch subscription");
      }

      const subscription = await subscriptionResponse.json();
      const subscriptionItemId = subscription.items.data[0].id;

      const updateParams = new URLSearchParams({
        "items[0][id]": subscriptionItemId,
        "items[0][price]": newPlan.stripe_price_id || "",
        "proration_behavior": "always_invoice",
      });

      const updateResponse = await fetch(
        `https://api.stripe.com/v1/subscriptions/${site.platform_stripe_subscription_id}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: updateParams.toString(),
        }
      );

      if (!updateResponse.ok) {
        const error = await updateResponse.text();
        throw new Error(`Stripe API error: ${error}`);
      }

      await supabaseClient
        .from("sites")
        .update({
          platform_subscription_plan_id: newPlan.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", siteId);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully ${action}d to ${newPlan.display_name}`,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Subscription management error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to manage subscription",
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
