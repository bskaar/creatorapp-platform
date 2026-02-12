import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(origin);
  }

  const corsHeaders = getCorsHeaders(origin);

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { siteId, items, customerEmail, customerName, successUrl, cancelUrl } = await req.json();

    if (!siteId || !items || !customerEmail || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('stripe_account_id')
      .eq('id', siteId)
      .maybeSingle();

    if (siteError || !site?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Site not configured for payments' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const productIds = items.map((item: any) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('site_id', siteId);

    if (productsError || !products || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Products not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    const lineItems = [];
    let mode: 'payment' | 'subscription' = 'payment';

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      if (product.billing_type === 'recurring') {
        mode = 'subscription';
      }

      let priceData: any = {
        currency: product.price_currency.toLowerCase(),
        product_data: {
          name: product.title,
          description: product.description || undefined,
          images: product.thumbnail_url ? [product.thumbnail_url] : undefined,
        },
        unit_amount: Math.round(product.price_amount * 100),
      };

      if (product.billing_type === 'recurring' && product.billing_interval) {
        const intervalMap: Record<string, string> = {
          monthly: 'month',
          quarterly: 'month',
          yearly: 'year',
        };

        priceData.recurring = {
          interval: intervalMap[product.billing_interval] || 'month',
          interval_count: product.billing_interval === 'quarterly' ? 3 : 1,
        };
      }

      lineItems.push({
        price_data: priceData,
        quantity: item.quantity || 1,
      });
    }

    const sessionParams: any = {
      mode,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        site_id: siteId,
        customer_name: customerName,
      },
    };

    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: {
          site_id: siteId,
        },
      };
    } else {
      sessionParams.payment_intent_data = {
        metadata: {
          site_id: siteId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams, {
      stripeAccount: site.stripe_account_id,
    });

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      await supabase.from('orders').insert({
        site_id: siteId,
        product_id: product.id,
        amount: product.price_amount,
        currency: product.price_currency,
        payment_provider: 'stripe',
        payment_status: 'pending',
        external_order_id: session.id,
        billing_email: customerEmail,
        metadata: {
          customer_name: customerName,
          session_id: session.id,
        },
      });
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
