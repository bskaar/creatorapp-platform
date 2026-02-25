import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_CONNECT_WEBHOOK_SECRET') || Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

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

  let eventId: string | null = null;

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

    eventId = event.id;
    console.log(`Received event: ${event.type} (${eventId})`);

    await supabase.rpc('log_webhook_event', {
      p_event_id: event.id,
      p_event_type: event.type,
      p_webhook_type: 'stripe_commerce',
      p_payload: event as any,
    });

    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('processing_status')
      .eq('event_id', event.id)
      .eq('processing_status', 'completed')
      .maybeSingle();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`);
      return new Response(JSON.stringify({ received: true, status: 'already_processed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await supabase
      .from('webhook_events')
      .update({ processing_status: 'processing' })
      .eq('event_id', event.id);

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

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await supabase.rpc('complete_webhook_event', {
      p_event_id: event.id,
      p_error: null,
    });

    return new Response(JSON.stringify({ received: true, status: 'processed' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook error:', error);

    if (eventId) {
      await supabase.rpc('complete_webhook_event', {
        p_event_id: eventId,
        p_error: error.message,
      }).catch(console.error);
    }

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
    throw findError;
  }

  if (!orders || orders.length === 0) {
    console.error(`No orders found for session ${session.id}`);
    return;
  }

  const isPaymentPlan = session.metadata?.is_payment_plan === 'true';
  const paymentPlanInstallments = parseInt(session.metadata?.payment_plan_installments || '0', 10);
  const subscriptionId = session.subscription as string | null;

  for (const order of orders) {
    if (session.payment_status === 'paid' && order.payment_status !== 'paid') {
      const updateData: any = {
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      };

      if (subscriptionId) {
        updateData.metadata = {
          ...order.metadata,
          subscription_id: subscriptionId,
        };
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error updating order ${order.id}:`, updateError);
        throw updateError;
      }

      console.log(`Order ${order.id} marked as paid`);

      if (isPaymentPlan && subscriptionId && paymentPlanInstallments > 0) {
        await createPaymentPlanTracking(
          order,
          subscriptionId,
          paymentPlanInstallments,
          siteId
        );
      }

      await grantProductAccess(order);
      await sendOrderConfirmationEmail(order);
    }
  }
}

async function createPaymentPlanTracking(
  order: any,
  subscriptionId: string,
  totalInstallments: number,
  siteId: string
) {
  console.log(`Creating payment plan tracking for subscription ${subscriptionId}`);

  const { error } = await supabase
    .from('payment_plan_tracking')
    .insert({
      order_id: order.id,
      product_id: order.product_id,
      subscription_id: subscriptionId,
      customer_email: order.billing_email,
      site_id: siteId,
      total_installments: totalInstallments,
      payments_completed: 1,
      is_completed: totalInstallments === 1,
      completed_at: totalInstallments === 1 ? new Date().toISOString() : null,
    });

  if (error) {
    console.error('Error creating payment plan tracking:', error);
    throw error;
  }

  console.log(`Payment plan tracking created: ${totalInstallments} installments`);

  if (totalInstallments === 1) {
    await cancelSubscriptionAfterCompletion(subscriptionId);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Processing invoice.payment_succeeded: ${invoice.id}`);

  const subscriptionId = invoice.subscription as string | null;
  if (!subscriptionId) {
    console.log('Invoice not associated with a subscription');
    return;
  }

  if (invoice.billing_reason === 'subscription_create') {
    console.log('Initial subscription invoice, already handled by checkout.session.completed');
    return;
  }

  const { data: tracking, error: findError } = await supabase
    .from('payment_plan_tracking')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .eq('is_completed', false)
    .maybeSingle();

  if (findError) {
    console.error('Error finding payment plan tracking:', findError);
    return;
  }

  if (!tracking) {
    console.log(`No active payment plan tracking for subscription ${subscriptionId}`);
    return;
  }

  const newPaymentsCompleted = tracking.payments_completed + 1;
  const isCompleted = newPaymentsCompleted >= tracking.total_installments;

  const { error: updateError } = await supabase
    .from('payment_plan_tracking')
    .update({
      payments_completed: newPaymentsCompleted,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tracking.id);

  if (updateError) {
    console.error('Error updating payment plan tracking:', updateError);
    throw updateError;
  }

  console.log(`Payment ${newPaymentsCompleted}/${tracking.total_installments} recorded for subscription ${subscriptionId}`);

  if (isCompleted) {
    console.log(`Payment plan completed for subscription ${subscriptionId}, cancelling subscription`);
    await cancelSubscriptionAfterCompletion(subscriptionId);
  }
}

async function cancelSubscriptionAfterCompletion(subscriptionId: string) {
  try {
    console.log(`Cancelling subscription ${subscriptionId} after payment plan completion`);

    await stripe.subscriptions.cancel(subscriptionId, {
      prorate: false,
    });

    console.log(`Subscription ${subscriptionId} cancelled successfully`);
  } catch (error: any) {
    console.error(`Error cancelling subscription ${subscriptionId}:`, error.message);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing payment_intent.succeeded: ${paymentIntent.id}`);

  const { data: orders, error: findError } = await supabase
    .from('orders')
    .select('*')
    .eq('metadata->>payment_intent_id', paymentIntent.id);

  if (findError) {
    console.error('Error finding orders:', findError);
    throw findError;
  }

  if (!orders || orders.length === 0) {
    console.log(`No orders found for payment intent ${paymentIntent.id}`);
    return;
  }

  for (const order of orders) {
    if (order.payment_status !== 'paid') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error updating order ${order.id}:`, updateError);
        throw updateError;
      }

      console.log(`Order ${order.id} marked as paid via payment intent`);
      await grantProductAccess(order);
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing payment_intent.payment_failed: ${paymentIntent.id}`);

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('metadata->>payment_intent_id', paymentIntent.id);

  const order = orders?.[0];
  const siteId = order?.site_id;
  const customerEmail = paymentIntent.receipt_email || order?.billing_email || 'unknown@example.com';

  await supabase.rpc('log_payment_failure', {
    p_site_id: siteId,
    p_order_id: order?.id || null,
    p_stripe_payment_intent_id: paymentIntent.id,
    p_customer_email: customerEmail,
    p_amount: paymentIntent.amount,
    p_currency: paymentIntent.currency,
    p_failure_code: paymentIntent.last_payment_error?.code || 'unknown',
    p_failure_message: paymentIntent.last_payment_error?.message || 'Payment failed',
    p_failure_type: paymentIntent.last_payment_error?.type || 'unknown',
    p_metadata: {
      decline_code: paymentIntent.last_payment_error?.decline_code,
      payment_method_type: paymentIntent.payment_method_types?.[0],
    },
  });

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('metadata->>payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating failed payment:', error);
    throw error;
  }

  console.log(`Payment failure logged for intent ${paymentIntent.id}`);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`Processing charge.refunded: ${charge.id}`);

  const { data: orders, error: findError } = await supabase
    .from('orders')
    .select('*')
    .eq('metadata->>charge_id', charge.id);

  if (findError) {
    console.error('Error finding orders:', findError);
    throw findError;
  }

  if (!orders || orders.length === 0) {
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
      throw updateError;
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

  const { data: existingOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('metadata->>subscription_id', subscription.id)
    .eq('site_id', siteId)
    .limit(1);

  const previousStatus = existingOrders?.[0]?.payment_status;

  await supabase.rpc('log_subscription_change', {
    p_site_id: siteId,
    p_stripe_subscription_id: subscription.id,
    p_change_type: subscription.created === subscription.current_period_start ? 'created' : 'updated',
    p_previous_status: previousStatus || null,
    p_new_status: subscription.status,
    p_previous_plan: null,
    p_new_plan: subscription.items.data[0]?.price?.id || null,
    p_change_reason: null,
    p_metadata: {
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: subscription.current_period_end,
    },
  });

  const { data: orders, error: findError } = await supabase
    .from('orders')
    .select('*')
    .eq('metadata->>subscription_id', subscription.id)
    .eq('site_id', siteId);

  if (findError) {
    console.error('Error finding orders:', findError);
    throw findError;
  }

  if (!orders || orders.length === 0) {
    console.log(`No orders found for subscription ${subscription.id}`);
    return;
  }

  for (const order of orders) {
    if (subscription.status === 'active' && order.payment_status !== 'paid') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error updating order ${order.id}:`, updateError);
        throw updateError;
      }

      await grantProductAccess(order);
    } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error updating cancelled order ${order.id}:`, updateError);
      }
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Processing subscription deleted: ${subscription.id}`);

  const siteId = subscription.metadata?.site_id;

  const { data: tracking } = await supabase
    .from('payment_plan_tracking')
    .select('*')
    .eq('subscription_id', subscription.id)
    .maybeSingle();

  if (tracking && tracking.is_completed) {
    console.log(`Subscription ${subscription.id} was a completed payment plan, keeping access active`);

    if (siteId) {
      await supabase.rpc('log_subscription_change', {
        p_site_id: siteId,
        p_stripe_subscription_id: subscription.id,
        p_change_type: 'payment_plan_completed',
        p_previous_status: subscription.status,
        p_new_status: 'completed',
        p_previous_plan: subscription.items.data[0]?.price?.id || null,
        p_new_plan: null,
        p_change_reason: 'Payment plan completed successfully',
        p_metadata: {
          total_installments: tracking.total_installments,
          payments_completed: tracking.payments_completed,
        },
      });
    }
    return;
  }

  if (siteId) {
    await supabase.rpc('log_subscription_change', {
      p_site_id: siteId,
      p_stripe_subscription_id: subscription.id,
      p_change_type: 'cancelled',
      p_previous_status: subscription.status,
      p_new_status: 'canceled',
      p_previous_plan: subscription.items.data[0]?.price?.id || null,
      p_new_plan: null,
      p_change_reason: subscription.cancellation_details?.reason || null,
      p_metadata: subscription.cancellation_details as any,
    });
  }

  if (tracking && !tracking.is_completed) {
    await supabase
      .from('payment_plan_tracking')
      .update({
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tracking.id);
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('metadata->>subscription_id', subscription.id);

  if (orders) {
    for (const order of orders) {
      if (!tracking?.is_completed) {
        await revokeProductAccess(order);
      }

      await supabase
        .from('orders')
        .update({
          payment_status: tracking?.is_completed ? 'paid' : 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);
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
    throw accessError;
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
    throw error;
  }

  console.log(`Access revoked for order ${order.id}`);
}

async function sendOrderConfirmationEmail(order: any) {
  console.log(`Sending confirmation email for order ${order.id}`);

  try {
    const { data: product } = await supabase
      .from('products')
      .select('title, product_type, access_duration_days')
      .eq('id', order.product_id)
      .maybeSingle();

    const { data: site } = await supabase
      .from('sites')
      .select('name, custom_domain')
      .eq('id', order.site_id)
      .maybeSingle();

    if (!product || !site) {
      console.error('Product or site not found for email');
      return;
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, skipping email');
      return;
    }

    const customerName = order.metadata?.customer_name || 'Customer';
    const orderAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.currency || 'USD',
    }).format(order.amount);

    const accessInfo = product.access_duration_days
      ? `You have ${product.access_duration_days} days of access to this ${product.product_type}.`
      : `You have lifetime access to this ${product.product_type}.`;

    const emailHtml = `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif;"><h1>Thank You for Your Purchase!</h1><p>Hi ${customerName},</p><p>Your order has been confirmed.</p><p><strong>Product:</strong> ${product.title}</p><p><strong>Amount:</strong> ${orderAmount}</p><p>${accessInfo}</p></body></html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${site.name} <orders@resend.dev>`,
        to: [order.billing_email],
        subject: `Order Confirmation - ${product.title}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send email:', error);
      return;
    }

    const result = await response.json();
    console.log(`Email sent successfully: ${result.id}`);
  } catch (error: any) {
    console.error('Error sending email:', error.message);
  }
}
