import { useState } from 'react';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  limits: {
    max_products: number | null;
    max_funnels: number | null;
    max_contacts: number;
    max_emails_per_month: number;
    max_team_members: number;
    ai_features: string[];
    features: string[];
  };
}

export function useSubscription() {
  const { currentSite } = useSite();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribeToPlan = async (planName: string) => {
    if (!currentSite) {
      throw new Error('No site selected');
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-platform-subscription`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create',
            planName,
            siteId: currentSite.id,
          }),
        }
      );

      const data = await response.json();

      console.log('Subscription response:', { status: response.status, data });

      if (!response.ok) {
        if (data.setup_url) {
          setError(`Stripe is not configured. Please set up Stripe first: ${data.setup_url}`);
          throw new Error(data.error || 'Failed to create subscription');
        }
        throw new Error(data.error || 'Failed to create subscription');
      }

      if (data.url) {
        console.log('Redirecting to Stripe Checkout:', data.url);

        // Validate URL before redirecting
        try {
          new URL(data.url);
        } catch (e) {
          throw new Error('Invalid checkout URL received from server');
        }

        // Use form submission which is never blocked by browsers
        // This is the most reliable way to navigate to external URLs
        console.log('Submitting form redirect to Stripe...');
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = data.url;
        document.body.appendChild(form);
        form.submit();

        // Keep loading true and return a never-resolving promise
        return new Promise(() => {});
      } else if (data.success) {
        console.log('No redirect URL - free plan activated');
        setLoading(false);
        return data;
      } else {
        console.error('Unexpected response:', data);
        throw new Error('Unexpected response from subscription service');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setLoading(false);
      throw err;
    }
  };

  const upgradePlan = async (planName: string) => {
    if (!currentSite) {
      throw new Error('No site selected');
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-platform-subscription`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'upgrade',
            planName,
            siteId: currentSite.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade subscription');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downgradePlan = async (planName: string) => {
    if (!currentSite) {
      throw new Error('No site selected');
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-platform-subscription`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'downgrade',
            planName,
            siteId: currentSite.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to downgrade subscription');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!currentSite) {
      throw new Error('No site selected');
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-platform-subscription`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'cancel',
            siteId: currentSite.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkUsageLimits = (resource: 'products' | 'funnels' | 'contacts' | 'emails' | 'team_members'): {
    canCreate: boolean;
    currentUsage: number;
    limit: number | null;
    percentage: number;
  } => {
    if (!currentSite || !currentSite.usage_counts) {
      return {
        canCreate: false,
        currentUsage: 0,
        limit: null,
        percentage: 0,
      };
    }

    const usageCounts = currentSite.usage_counts as any;
    const currentUsage = usageCounts[`${resource}_count`] || usageCounts.emails_sent_this_month || 0;

    let limit: number | null = null;
    const planLimits = currentSite.platform_subscription_plan_id
      ? null
      : { max_products: 1, max_funnels: 1, max_contacts: 2500, max_emails_per_month: 5000, max_team_members: 1 };

    if (planLimits) {
      switch (resource) {
        case 'products':
          limit = planLimits.max_products;
          break;
        case 'funnels':
          limit = planLimits.max_funnels;
          break;
        case 'contacts':
          limit = planLimits.max_contacts;
          break;
        case 'emails':
          limit = planLimits.max_emails_per_month;
          break;
        case 'team_members':
          limit = planLimits.max_team_members;
          break;
      }
    }

    const canCreate = limit === null || currentUsage < limit;
    const percentage = limit ? (currentUsage / limit) * 100 : 0;

    return {
      canCreate,
      currentUsage,
      limit,
      percentage,
    };
  };

  return {
    subscribeToPlan,
    upgradePlan,
    downgradePlan,
    cancelSubscription,
    checkUsageLimits,
    loading,
    error,
  };
}
