/*
  # Add Monthly AI Usage Limits System
  
  1. Schema Changes
    - Add `ai_usage_cycle_start` to sites table for billing cycle tracking
    - Update subscription_plans limits JSONB to include `max_ai_sessions_per_month`
    - Create function to calculate current cycle AI usage
    
  2. New Limits by Plan
    - Starter: 200 sessions/month (soft limit: 220)
    - Growth: 400 sessions/month (soft limit: 440)
    - Pro: 800 sessions/month (soft limit: 880)
    - Enterprise: null (unlimited)
    
  3. Important Notes
    - ai_usage_cycle_start tracks billing anniversary
    - 10% soft overage allows graceful degradation before hard block
    - Enterprise unlimited but still tracked for analytics
*/

-- Add ai_usage_cycle_start to sites table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'ai_usage_cycle_start'
  ) THEN
    ALTER TABLE sites ADD COLUMN ai_usage_cycle_start timestamptz DEFAULT now();
  END IF;
END $$;

-- Update subscription_plans to include AI session limits in limits JSONB
UPDATE subscription_plans
SET limits = limits || '{"max_ai_sessions_per_month": 200}'::jsonb
WHERE name = 'starter' AND NOT (limits ? 'max_ai_sessions_per_month');

UPDATE subscription_plans
SET limits = limits || '{"max_ai_sessions_per_month": 400}'::jsonb
WHERE name = 'growth' AND NOT (limits ? 'max_ai_sessions_per_month');

UPDATE subscription_plans
SET limits = limits || '{"max_ai_sessions_per_month": 800}'::jsonb
WHERE name = 'pro' AND NOT (limits ? 'max_ai_sessions_per_month');

UPDATE subscription_plans
SET limits = limits || '{"max_ai_sessions_per_month": null}'::jsonb
WHERE name = 'enterprise' AND NOT (limits ? 'max_ai_sessions_per_month');

-- Create function to get current billing cycle boundaries
CREATE OR REPLACE FUNCTION get_ai_usage_cycle_bounds(site_uuid uuid)
RETURNS TABLE (cycle_start timestamptz, cycle_end timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  site_cycle_start timestamptz;
  cycle_day integer;
  current_cycle_start timestamptz;
  current_cycle_end timestamptz;
  now_ts timestamptz := now();
BEGIN
  -- Get the site's billing cycle start date
  SELECT ai_usage_cycle_start INTO site_cycle_start
  FROM sites WHERE id = site_uuid;
  
  -- If not set, use site creation date or now
  IF site_cycle_start IS NULL THEN
    site_cycle_start := now_ts;
    UPDATE sites SET ai_usage_cycle_start = now_ts WHERE id = site_uuid;
  END IF;
  
  -- Get the day of month from the original cycle start
  cycle_day := EXTRACT(DAY FROM site_cycle_start);
  
  -- Calculate the current cycle start (most recent occurrence of cycle_day)
  IF EXTRACT(DAY FROM now_ts) >= cycle_day THEN
    -- We're past the cycle day this month, so cycle started this month
    current_cycle_start := date_trunc('month', now_ts) + ((cycle_day - 1) || ' days')::interval;
  ELSE
    -- We're before the cycle day, so cycle started last month
    current_cycle_start := date_trunc('month', now_ts - interval '1 month') + ((cycle_day - 1) || ' days')::interval;
  END IF;
  
  -- Handle edge case where cycle_day > days in month
  IF EXTRACT(DAY FROM current_cycle_start) != cycle_day THEN
    -- Day doesn't exist in this month, use last day of month
    current_cycle_start := date_trunc('month', current_cycle_start) + interval '1 month' - interval '1 day';
  END IF;
  
  -- Cycle end is one month after start
  current_cycle_end := current_cycle_start + interval '1 month';
  
  RETURN QUERY SELECT current_cycle_start, current_cycle_end;
END;
$$;

-- Create function to count AI usage in current billing cycle
CREATE OR REPLACE FUNCTION get_ai_usage_in_current_cycle(site_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cycle_start_ts timestamptz;
  cycle_end_ts timestamptz;
  usage_count integer;
BEGIN
  -- Get cycle bounds
  SELECT cycle_start, cycle_end INTO cycle_start_ts, cycle_end_ts
  FROM get_ai_usage_cycle_bounds(site_uuid);
  
  -- Count AI usage records in this cycle
  SELECT COUNT(*)::integer INTO usage_count
  FROM ai_usage_tracking
  WHERE site_id = site_uuid
    AND created_at >= cycle_start_ts
    AND created_at < cycle_end_ts;
  
  RETURN usage_count;
END;
$$;

-- Create function to get site's AI limit from their plan
CREATE OR REPLACE FUNCTION get_site_ai_session_limit(site_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ai_limit integer;
BEGIN
  SELECT (sp.limits->>'max_ai_sessions_per_month')::integer INTO ai_limit
  FROM sites s
  JOIN subscription_plans sp ON sp.id = s.platform_subscription_plan_id
  WHERE s.id = site_uuid;
  
  -- Return null for unlimited (enterprise)
  RETURN ai_limit;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_ai_usage_cycle_bounds(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_usage_in_current_cycle(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_site_ai_session_limit(uuid) TO authenticated;

-- Add index for efficient AI usage queries within billing cycles
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_site_created 
ON ai_usage_tracking(site_id, created_at DESC);

-- Comment on new column
COMMENT ON COLUMN sites.ai_usage_cycle_start IS 'The date when the site''s AI usage billing cycle starts. Resets monthly on this day.';
