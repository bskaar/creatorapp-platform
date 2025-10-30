import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  console.info(`Processing webhook event: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = stripeData as Stripe.Checkout.Session;
    const customerId = session.customer as string;

    if (!customerId) {
      console.error('No customer ID in checkout session');
      return;
    }

    // Check if this is a platform subscription (has site_id in metadata)
    const siteId = session.subscription_data?.metadata?.site_id;

    if (siteId && session.mode === 'subscription') {
      console.info(`Processing platform subscription for site: ${siteId}`);
      await syncPlatformSubscription(customerId, siteId);
      return;
    }

    // Otherwise handle as generic subscription/payment
    if (session.mode === 'subscription') {
      console.info(`Processing generic subscription for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    } else if (session.mode === 'payment' && session.payment_status === 'paid') {
      await handleOneTimePayment(session);
    }
    return;
  }

  // Handle subscription updates
  if (event.type.startsWith('customer.subscription.')) {
    const subscription = stripeData as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // Check if this is a platform subscription
    const siteId = subscription.metadata?.site_id;

    if (siteId) {
      console.info(`Updating platform subscription for site: ${siteId}`);
      await syncPlatformSubscription(customerId, siteId);
    } else {
      console.info(`Updating generic subscription for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    }
    return;
  }

  // Handle one-time payment success
  if (event.type === 'payment_intent.succeeded' && stripeData.invoice === null) {
    return;
  }
}

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  try {
    const {
      id: checkout_session_id,
      payment_intent,
      amount_subtotal,
      amount_total,
      currency,
      payment_status,
      customer: customerId,
    } = session;

    const { error: orderError } = await supabase.from('stripe_orders').insert({
      checkout_session_id,
      payment_intent_id: payment_intent as string,
      customer_id: customerId as string,
      amount_subtotal: amount_subtotal || 0,
      amount_total: amount_total || 0,
      currency: currency || 'usd',
      payment_status: payment_status || 'unpaid',
      status: 'completed',
    });

    if (orderError) {
      console.error('Error inserting order:', orderError);
      return;
    }
    console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
  } catch (error) {
    console.error('Error processing one-time payment:', error);
  }
}

async function syncPlatformSubscription(customerId: string, siteId: string) {
  try {
    console.info(`Syncing platform subscription for site ${siteId}, customer ${customerId}`);

    // Fetch the latest subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
    });

    if (subscriptions.data.length === 0) {
      console.error(`No subscription found for customer: ${customerId}`);
      return;
    }

    const subscription = subscriptions.data[0];
    console.info(`Found subscription: ${subscription.id}, status: ${subscription.status}`);

    // Get the plan name from metadata or lookup by price_id
    const planName = subscription.metadata?.plan_name;
    let planId = null;

    if (planName) {
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', planName)
        .maybeSingle();

      planId = plan?.id;
    }

    // Update the sites table with subscription info
    const { error: updateError } = await supabase
      .from('sites')
      .update({
        platform_stripe_customer_id: customerId,
        platform_stripe_subscription_id: subscription.id,
        platform_subscription_status: subscription.status as any,
        platform_subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        ...(planId && { platform_subscription_plan_id: planId }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteId);

    if (updateError) {
      console.error('Error updating site with subscription:', updateError);
      throw updateError;
    }

    console.info(`Successfully synced platform subscription for site: ${siteId}`);
  } catch (error) {
    console.error(`Failed to sync platform subscription:`, error);
    throw error;
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // TODO verify if needed
    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];

    // store subscription state
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}
