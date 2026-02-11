import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSite } from '../contexts/SiteContext';
import { useAuth } from '../contexts/AuthContext';

interface UsageLimits {
  maxRequestsPerDay: number;
  requestsUsedToday: number;
  remainingRequests: number;
  isLimitReached: boolean;
  planName: string;
}

export function useAIUsage() {
  const { currentSite } = useSite();
  const { user } = useAuth();
  const [limits, setLimits] = useState<UsageLimits>({
    maxRequestsPerDay: 50,
    requestsUsedToday: 0,
    remainingRequests: 50,
    isLimitReached: false,
    planName: 'Launch',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentSite && user) {
      checkUsage();
    }
  }, [currentSite, user]);

  const checkUsage = async () => {
    if (!currentSite || !user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: usageData, error: usageError } = await supabase
      .from('ai_usage_tracking')
      .select('id')
      .eq('site_id', currentSite.id)
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    const requestsToday = usageData?.length || 0;

    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('display_name, limits')
      .eq('id', currentSite.platform_subscription_plan_id)
      .maybeSingle();

    let maxRequests = 50;
    let planName = 'Launch';

    if (planData) {
      planName = planData.display_name;
      const limits = planData.limits as any;

      if (planName === 'Launch') {
        maxRequests = 50;
      } else if (planName === 'Pro') {
        maxRequests = 500;
      } else if (planName === 'Scale') {
        maxRequests = 999999;
      }
    }

    const remaining = Math.max(0, maxRequests - requestsToday);

    setLimits({
      maxRequestsPerDay: maxRequests,
      requestsUsedToday: requestsToday,
      remainingRequests: remaining,
      isLimitReached: remaining === 0,
      planName,
    });

    setLoading(false);
  };

  return { limits, loading, refreshUsage: checkUsage };
}
