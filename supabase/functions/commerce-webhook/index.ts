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
    console.error('RESEND_API_KEY not configured');
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

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Purchase!</h1>
      </div>

      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-top: 0;">Hi ${customerName},</p>

        <p style="font-size: 16px;">Your order has been confirmed and you now have access to your purchase!</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Product:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${product.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Type:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; text-transform: capitalize;">${product.product_type}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Amount:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${orderAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Order ID:</strong></td>
              <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px;">${order.external_order_id}</td>
            </tr>
          </table>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #065f46;"><strong>✓ Access Granted!</strong></p>
          <p style="margin: 5px 0 0 0; color: #065f46;">${accessInfo}</p>
        </div>

        <p style="font-size: 16px;">You can access your purchase by logging in to your account.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://${site.custom_domain || site.name + '.example.com'}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Your Purchase</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 14px; color: #6b7280;">If you have any questions about your order, please reply to this email.</p>

        <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Best regards,<br><strong>${site.name}</strong></p>
      </div>

      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p style="margin: 5px 0;">This is an automated email. Please do not reply directly.</p>
        <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${site.name}. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  try {
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