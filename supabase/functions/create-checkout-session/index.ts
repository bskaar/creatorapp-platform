import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  productId: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
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

    const { productId, quantity = 1, successUrl, cancelUrl }: CheckoutRequest = await req.json();

    if (!productId) {
      throw new Error("Product ID is required");
    }

    const { data: product, error: productError } = await supabaseClient
      .from("products")
      .select(`
        *,
        site:sites(
          stripe_connect_account_id,
          stripe_connect_charges_enabled
        )
      `)
      .eq("id", productId)
      .maybeSingle();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    const site = product.site as any;
    if (!site?.stripe_connect_account_id) {
      throw new Error("Stripe Connect not configured for this site");
    }

    if (!site?.stripe_connect_charges_enabled) {
      throw new Error("Stripe Connect account not ready to accept charges");
    }

    const platformFeePercent = 10;
    const applicationFeeAmount = Math.round(product.price_amount * quantity * 100 * (platformFeePercent / 100));

    const params = new URLSearchParams({
      "mode": "payment",
      "success_url": successUrl || `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      "cancel_url": cancelUrl || `${req.headers.get("origin")}/cancel`,
      "line_items[0][price_data][currency]": product.price_currency || "usd",
      "line_items[0][price_data][product_data][name]": product.title,
      "line_items[0][price_data][product_data][description]": product.description || "",
      "line_items[0][price_data][unit_amount]": Math.round(product.price_amount * 100).toString(),
      "line_items[0][quantity]": quantity.toString(),
      "payment_intent_data[application_fee_amount]": applicationFeeAmount.toString(),
      "payment_intent_data[transfer_data][destination]": site.stripe_connect_account_id,
      "metadata[product_id]": productId,
      "metadata[site_id]": product.site_id,
      "metadata[user_id]": user.id,
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
      const error = await response.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    const session = await response.json();

    await supabaseClient.from("orders").insert({
      site_id: product.site_id,
      product_id: productId,
      amount: product.price_amount * quantity,
      currency: product.price_currency || "usd",
      payment_provider: "stripe",
      payment_status: "pending",
      external_order_id: session.id,
      billing_email: user.email,
      metadata: { quantity, session_id: session.id },
    });

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
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create checkout session",
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
