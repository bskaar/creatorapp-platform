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
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe is not configured");
    }

    if (action === "create") {
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

      const { siteId } = await req.json();

      if (!siteId) {
        throw new Error("Site ID is required");
      }

      const { data: site } = await supabaseClient
        .from("sites")
        .select("id")
        .eq("id", siteId)
        .maybeSingle();

      if (!site) {
        throw new Error("Site not found");
      }

      const accountResponse = await fetch("https://api.stripe.com/v1/accounts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "type": "express",
          "country": "US",
          "capabilities[card_payments][requested]": "true",
          "capabilities[transfers][requested]": "true",
          "metadata[site_id]": siteId,
          "metadata[user_id]": user.id,
        }).toString(),
      });

      if (!accountResponse.ok) {
        const error = await accountResponse.text();
        throw new Error(`Stripe API error: ${error}`);
      }

      const account = await accountResponse.json();

      await supabaseClient
        .from("sites")
        .update({
          stripe_connect_account_id: account.id,
          stripe_connect_created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", siteId);

      const onboardingResponse = await fetch("https://api.stripe.com/v1/account_links", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "account": account.id,
          "refresh_url": `${url.origin}/settings?stripe_refresh=true`,
          "return_url": `${url.origin}/settings?stripe_success=true`,
          "type": "account_onboarding",
        }).toString(),
      });

      if (!onboardingResponse.ok) {
        const error = await onboardingResponse.text();
        throw new Error(`Stripe onboarding error: ${error}`);
      }

      const accountLink = await onboardingResponse.json();

      return new Response(
        JSON.stringify({
          accountId: account.id,
          onboardingUrl: accountLink.url,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "refresh") {
      const { siteId } = await req.json();

      if (!siteId) {
        throw new Error("Site ID is required");
      }

      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { data: site } = await supabaseClient
        .from("sites")
        .select("stripe_connect_account_id")
        .eq("id", siteId)
        .maybeSingle();

      if (!site?.stripe_connect_account_id) {
        throw new Error("No connected account found");
      }

      const accountResponse = await fetch(
        `https://api.stripe.com/v1/accounts/${site.stripe_connect_account_id}`,
        {
          headers: {
            "Authorization": `Bearer ${stripeKey}`,
          },
        }
      );

      if (!accountResponse.ok) {
        const error = await accountResponse.text();
        throw new Error(`Stripe API error: ${error}`);
      }

      const account = await accountResponse.json();

      await supabaseClient
        .from("sites")
        .update({
          stripe_connect_onboarding_complete: account.details_submitted,
          stripe_connect_charges_enabled: account.charges_enabled,
          stripe_connect_payouts_enabled: account.payouts_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", siteId);

      return new Response(
        JSON.stringify({
          accountId: account.id,
          onboardingComplete: account.details_submitted,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
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
    console.error("Stripe Connect error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process Stripe Connect request",
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
