import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSite } from '../contexts/SiteContext';
import { useAuth } from '../contexts/AuthContext';

interface AIUsageLimits {
  maxSessions: number | null;
  softMaxSessions: number | null;
  sessionsUsed: number;
  remainingBeforeWarning: number;
  remainingBeforeHardStop: number;
  isOverBase: boolean;
  isOverSoftLimit: boolean;
  cycleStartDate: Date | null;
  cycleEndDate: Date | null;
  planName: string;
  isUnlimited: boolean;
}

const SOFT_LIMIT_OVERAGE = 0.1;

export function useAIUsage() {
  const { currentSite } = useSite();
  const { user } = useAuth();
  const [limits, setLimits] = useState<AIUsageLimits>({
    maxSessions: 200,
    softMaxSessions: 220,
    sessionsUsed: 0,
    remainingBeforeWarning: 200,
    remainingBeforeHardStop: 220,
    isOverBase: false,
    isOverSoftLimit: false,
    cycleStartDate: null,
    cycleEndDate: null,
    planName: 'Starter',
    isUnlimited: false,
  });
  const [loading, setLoading] = useState(true);

  const checkUsage = useCallback(async () => {
    if (!currentSite || !user) return;

    try {
      const [cycleResult, usageResult, planResult] = await Promise.all([
        supabase.rpc('get_ai_usage_cycle_bounds', { site_uuid: currentSite.id }),
        supabase.rpc('get_ai_usage_in_current_cycle', { site_uuid: currentSite.id }),
        supabase
          .from('subscription_plans')
          .select('display_name, limits')
          .eq('id', currentSite.platform_subscription_plan_id)
          .maybeSingle(),
      ]);

      let cycleStart: Date | null = null;
      let cycleEnd: Date | null = null;

      if (cycleResult.data && cycleResult.data.length > 0) {
        cycleStart = new Date(cycleResult.data[0].cycle_start);
        cycleEnd = new Date(cycleResult.data[0].cycle_end);
      }

      const sessionsUsed = usageResult.data ?? 0;

      let maxSessions: number | null = 200;
      let planName = 'Starter';

      if (planResult.data) {
        planName = planResult.data.display_name;
        const planLimits = planResult.data.limits as Record<string, unknown>;
        if (planLimits && 'max_ai_sessions_per_month' in planLimits) {
          maxSessions = planLimits.max_ai_sessions_per_month as number | null;
        }
      }

      const isUnlimited = maxSessions === null;
      const effectiveMax = maxSessions ?? 999999;
      const softMax = isUnlimited ? null : Math.ceil(effectiveMax * (1 + SOFT_LIMIT_OVERAGE));
      const effectiveSoftMax = softMax ?? 999999;

      const remainingBeforeWarning = Math.max(0, effectiveMax - sessionsUsed);
      const remainingBeforeHardStop = Math.max(0, effectiveSoftMax - sessionsUsed);
      const isOverBase = sessionsUsed >= effectiveMax;
      const isOverSoftLimit = sessionsUsed >= effectiveSoftMax;

      setLimits({
        maxSessions,
        softMaxSessions: softMax,
        sessionsUsed,
        remainingBeforeWarning,
        remainingBeforeHardStop,
        isOverBase,
        isOverSoftLimit,
        cycleStartDate: cycleStart,
        cycleEndDate: cycleEnd,
        planName,
        isUnlimited,
      });
    } catch (err) {
      console.error('Error checking AI usage:', err);
    } finally {
      setLoading(false);
    }
  }, [currentSite, user]);

  useEffect(() => {
    if (currentSite && user) {
      checkUsage();
    }
  }, [currentSite, user, checkUsage]);

  const usagePercentage = limits.isUnlimited
    ? 0
    : limits.maxSessions
      ? Math.min(100, (limits.sessionsUsed / limits.maxSessions) * 100)
      : 0;

  const getUsageStatus = (): 'normal' | 'warning' | 'critical' | 'blocked' => {
    if (limits.isUnlimited) return 'normal';
    if (limits.isOverSoftLimit) return 'blocked';
    if (limits.isOverBase) return 'critical';
    if (usagePercentage >= 80) return 'warning';
    return 'normal';
  };

  return {
    limits,
    loading,
    refreshUsage: checkUsage,
    usagePercentage,
    usageStatus: getUsageStatus(),
  };
}
