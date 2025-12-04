import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-11-20.acacia',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SubscriptionAction {
  action: 'upgrade' | 'downgrade' | 'cancel' | 'resume' | 'update_payment';
  siteId: string;
  newPriceId?: string;
  cancelAtPeriodEnd?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: SubscriptionAction = await req.json();
    const { action, siteId, newPriceId, cancelAtPeriodEnd } = body;

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('platform_stripe_subscription_id, platform_stripe_customer_id, owner_id')
      .eq('id', siteId)
      .maybeSingle();

    if (siteError || !site) {
      return new Response(JSON.stringify({ error: 'Site not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (site.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Not authorized to manage this site' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result;

    switch (action) {
      case 'upgrade':
      case 'downgrade':
        result = await handlePlanChange(site, newPriceId!, siteId);
        break;

      case 'cancel':
        result = await handleCancellation(site, cancelAtPeriodEnd ?? true, siteId);
        break;

      case 'resume':
        result = await handleResume(site, siteId);
        break;

      case 'update_payment':
        result = await createPaymentUpdateSession(site, siteId);
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Subscription management error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handlePlanChange(site: any, newPriceId: string, siteId: string) {
  if (!site.platform_stripe_subscription_id) {
    throw new Error('No active subscription found');
  }

  const subscription = await stripe.subscriptions.retrieve(site.platform_stripe_subscription_id);
  const currentPriceId = subscription.items.data[0].price.id;

  if (currentPriceId === newPriceId) {
    return { success: true, message: 'Already on this plan' };
  }

  const updatedSubscription = await stripe.subscriptions.update(site.platform_stripe_subscription_id, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'always_invoice',
  });

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  await supabaseAdmin.rpc('log_subscription_change', {
    p_site_id: siteId,
    p_stripe_subscription_id: updatedSubscription.id,
    p_change_type: 'updated',
    p_previous_status: subscription.status,
    p_new_status: updatedSubscription.status,
    p_previous_plan: currentPriceId,
    p_new_plan: newPriceId,
    p_change_reason: 'user_initiated_plan_change',
    p_metadata: {
      proration_behavior: 'always_invoice',
    },
  });

  return {
    success: true,
    message: 'Plan updated successfully',
    subscription: {
      id: updatedSubscription.id,
      status: updatedSubscription.status,
      current_period_end: updatedSubscription.current_period_end,
    },
  };
}

async function handleCancellation(site: any, cancelAtPeriodEnd: boolean, siteId: string) {
  if (!site.platform_stripe_subscription_id) {
    throw new Error('No active subscription found');
  }

  const subscription = await stripe.subscriptions.retrieve(site.platform_stripe_subscription_id);

  let updatedSubscription;
  if (cancelAtPeriodEnd) {
    updatedSubscription = await stripe.subscriptions.update(site.platform_stripe_subscription_id, {
      cancel_at_period_end: true,
    });
  } else {
    updatedSubscription = await stripe.subscriptions.cancel(site.platform_stripe_subscription_id);
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  await supabaseAdmin.rpc('log_subscription_change', {
    p_site_id: siteId,
    p_stripe_subscription_id: updatedSubscription.id,
    p_change_type: 'cancelled',
    p_previous_status: subscription.status,
    p_new_status: updatedSubscription.status,
    p_previous_plan: subscription.items.data[0].price.id,
    p_new_plan: null,
    p_change_reason: cancelAtPeriodEnd ? 'cancel_at_period_end' : 'immediate_cancellation',
    p_metadata: {
      cancel_at_period_end: cancelAtPeriodEnd,
      canceled_at: updatedSubscription.canceled_at,
    },
  });

  return {
    success: true,
    message: cancelAtPeriodEnd
      ? 'Subscription will cancel at the end of the billing period'
      : 'Subscription cancelled immediately',
    subscription: {
      id: updatedSubscription.id,
      status: updatedSubscription.status,
      cancel_at_period_end: updatedSubscription.cancel_at_period_end,
      current_period_end: updatedSubscription.current_period_end,
    },
  };
}

async function handleResume(site: any, siteId: string) {
  if (!site.platform_stripe_subscription_id) {
    throw new Error('No subscription found');
  }

  const subscription = await stripe.subscriptions.retrieve(site.platform_stripe_subscription_id);

  if (!subscription.cancel_at_period_end) {
    return { success: true, message: 'Subscription is not scheduled for cancellation' };
  }

  const updatedSubscription = await stripe.subscriptions.update(site.platform_stripe_subscription_id, {
    cancel_at_period_end: false,
  });

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  await supabaseAdmin.rpc('log_subscription_change', {
    p_site_id: siteId,
    p_stripe_subscription_id: updatedSubscription.id,
    p_change_type: 'renewed',
    p_previous_status: subscription.status,
    p_new_status: updatedSubscription.status,
    p_previous_plan: subscription.items.data[0].price.id,
    p_new_plan: updatedSubscription.items.data[0].price.id,
    p_change_reason: 'user_resumed_subscription',
    p_metadata: {},
  });

  return {
    success: true,
    message: 'Subscription resumed successfully',
    subscription: {
      id: updatedSubscription.id,
      status: updatedSubscription.status,
      cancel_at_period_end: false,
      current_period_end: updatedSubscription.current_period_end,
    },
  };
}

async function createPaymentUpdateSession(site: any, siteId: string) {
  if (!site.platform_stripe_customer_id) {
    throw new Error('No customer found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: site.platform_stripe_customer_id,
    return_url: `${Deno.env.get('SUPABASE_URL')}/settings/subscription`,
  });

  return {
    success: true,
    url: session.url,
  };
}