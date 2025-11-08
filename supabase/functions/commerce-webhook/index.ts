import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_COMMERCE_WEBHOOK_SECRET')!;

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature found', {
        status: 400,
        headers: corsHeaders,
      });
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook Error: ${error.message}`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log(`Received event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`Processing checkout.session.completed: ${session.id}`);

  const siteId = session.metadata?.site_id;
  if (!siteId) {
    console.error('No site_id in session metadata');
    return;
  }

  const { data: orders, error: findError } = await supabase
    .from('orders')
    .select('*')
    .eq('external_order_id', session.id)
    .eq('site_id', siteId);

  if (findError) {
    console.error('Error finding orders:', findError);
    return;
  }

  if (!orders || orders.length === 0) {
    console.error(`No orders found for session ${session.id}`);
    return;
  }

  for (const order of orders) {
    if (session.payment_status === 'paid') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error updating order ${order.id}:`, updateError);
        continue;
      }

      console.log(`Order ${order.id} marked as paid`);

      await grantProductAccess(order);
      await sendOrderConfirmationEmail(order);
    }
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing payment_intent.succeeded: ${paymentIntent.id}`);

  const { data: orders, error: findError } = await supabase
    .from('orders')
    .select('*')
    .eq('metadata->>payment_intent_id', paymentIntent.id);

  if (findError || !orders || orders.length === 0) {
    console.log(`No orders found for payment intent ${paymentIntent.id}`);
    return;
  }

  for (const order of orders) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error(`Error updating order ${order.id}:`, updateError);
      continue;
    }

    console.log(`Order ${order.id} marked as paid via payment intent`);
    await grantProductAccess(order);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing payment_intent.payment_failed: ${paymentIntent.id}`);

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('metadata->>payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating failed payment:', error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`Processing charge.refunded: ${charge.id}`);

  const { data: orders, error: findError } = await supabase
    .from('orders')
    .select('*')
    .eq('metadata->>charge_id', charge.id);

  if (findError || !orders || orders.length === 0) {
    console.log(`No orders found for charge ${charge.id}`);
    return;
  }

  for (const order of orders) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error(`Error updating refunded order ${order.id}:`, updateError);
      continue;
    }

    console.log(`Order ${order.id} marked as refunded`);
    await revokeProductAccess(order);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log(`Processing subscription update: ${subscription.id}`);

  const siteId = subscription.metadata?.site_id;
  if (!siteId) {
    console.log('No site_id in subscription metadata');
    return;
  }

  const { data: orders, error: findError } = await supabase
    .from('orders')
    .select('*')
    .eq('metadata->>subscription_id', subscription.id)
    .eq('site_id', siteId);

  if (findError || !orders || orders.length === 0) {
    console.log(`No orders found for subscription ${subscription.id}`);
    return;
  }

  for (const order of orders) {
    if (subscription.status === 'active' && order.payment_status !== 'paid') {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      await grantProductAccess(order);
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Processing subscription deleted: ${subscription.id}`);

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('metadata->>subscription_id', subscription.id);

  if (orders) {
    for (const order of orders) {
      await revokeProductAccess(order);
    }
  }
}

async function grantProductAccess(order: any) {
  console.log(`Granting access for order ${order.id}, product ${order.product_id}`);

  const { data: product } = await supabase
    .from('products')
    .select('product_type, access_duration_days')
    .eq('id', order.product_id)
    .maybeSingle();

  if (!product) {
    console.error(`Product ${order.product_id} not found`);
    return;
  }

  let expiresAt = null;
  if (product.access_duration_days) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + product.access_duration_days);
    expiresAt = expirationDate.toISOString();
  }

  const { error: accessError } = await supabase
    .from('product_access')
    .upsert({
      order_id: order.id,
      product_id: order.product_id,
      customer_email: order.billing_email,
      site_id: order.site_id,
      access_granted_at: new Date().toISOString(),
      access_expires_at: expiresAt,
      is_active: true,
    }, {
      onConflict: 'order_id',
    });

  if (accessError) {
    console.error('Error granting product access:', accessError);
    return;
  }

  console.log(`Access granted for order ${order.id}`);
}

async function revokeProductAccess(order: any) {
  console.log(`Revoking access for order ${order.id}`);

  const { error } = await supabase
    .from('product_access')
    .update({
      is_active: false,
      access_revoked_at: new Date().toISOString(),
    })
    .eq('order_id', order.id);

  if (error) {
    console.error('Error revoking access:', error);
    return;
  }

  console.log(`Access revoked for order ${order.id}`);
}

async function sendOrderConfirmationEmail(order: any) {
  console.log(`Sending confirmation email for order ${order.id}`);

  const { data: product } = await supabase
    .from('products')
    .select('title')
    .eq('id', order.product_id)
    .maybeSingle();

  const { data: site } = await supabase
    .from('sites')
    .select('name')
    .eq('id', order.site_id)
    .maybeSingle();

  console.log(`Would send email to ${order.billing_email}`);
  console.log(`Product: ${product?.title}`);
  console.log(`Site: ${site?.name}`);
}
