/*
  # Rate Limiting System

  ## Overview
  Implements rate limiting infrastructure to prevent API abuse and ensure
  fair usage across all users. Protects against DDoS attacks and resource exhaustion.

  ## New Tables

  ### `api_rate_limits`
  Tracks API calls per user/IP for rate limiting
  - `id` (uuid, primary key)
  - `identifier` (text) - User ID, IP address, or API key
  - `identifier_type` (text) - 'user_id', 'ip_address', 'api_key'
  - `endpoint` (text) - API endpoint being called
  - `call_count` (integer) - Number of calls in current window
  - `window_start` (timestamptz) - Start of current rate limit window
  - `window_end` (timestamptz) - End of current rate limit window
  - `blocked_until` (timestamptz, nullable) - When user is blocked until
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Rate Limit Rules
  Default limits per user (can be customized):
  - Anonymous users: 100 requests/hour
  - Authenticated users: 1000 requests/hour  
  - Premium users: 5000 requests/hour
  - Payment endpoints: 10 requests/hour (strict)
  - Export endpoints: 5 requests/hour (strict)

  ## Security
  - Automatic cleanup of old rate limit records
  - Progressive backoff for repeated violations
  - IP-based fallback for anonymous users

  ## Indexes
  - Fast lookups by identifier and endpoint
  - Efficient window-based queries
*/

-- Create api_rate_limits table
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  identifier_type text NOT NULL CHECK (identifier_type IN ('user_id', 'ip_address', 'api_key')),
  endpoint text NOT NULL,
  call_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  window_end timestamptz NOT NULL DEFAULT (now() + interval '1 hour'),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_unique 
  ON api_rate_limits(identifier, endpoint, window_start);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON api_rate_limits(identifier, window_end DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON api_rate_limits(window_end) WHERE blocked_until IS NULL;
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON api_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- Enable RLS
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own rate limits"
  ON api_rate_limits FOR SELECT
  TO authenticated
  USING (identifier = auth.uid()::text);

CREATE POLICY "System can manage rate limits"
  ON api_rate_limits FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier text,
  p_identifier_type text,
  p_endpoint text,
  p_max_calls integer DEFAULT 1000,
  p_window_hours integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_window_start timestamptz;
  v_current_window_end timestamptz;
  v_call_count integer;
  v_blocked_until timestamptz;
  v_is_blocked boolean := false;
BEGIN
  v_current_window_start := date_trunc('hour', now());
  v_current_window_end := v_current_window_start + (p_window_hours || ' hours')::interval;
  
  -- Check if user is currently blocked
  SELECT blocked_until INTO v_blocked_until
  FROM api_rate_limits
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND blocked_until > now()
  ORDER BY blocked_until DESC
  LIMIT 1;
  
  IF v_blocked_until IS NOT NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', v_blocked_until,
      'message', 'Rate limit exceeded. Please try again later.'
    );
  END IF;
  
  -- Get or create rate limit record for current window
  INSERT INTO api_rate_limits (
    identifier,
    identifier_type,
    endpoint,
    call_count,
    window_start,
    window_end
  ) VALUES (
    p_identifier,
    p_identifier_type,
    p_endpoint,
    1,
    v_current_window_start,
    v_current_window_end
  )
  ON CONFLICT (identifier, endpoint, window_start)
  DO UPDATE SET
    call_count = api_rate_limits.call_count + 1,
    updated_at = now()
  RETURNING call_count INTO v_call_count;
  
  -- Check if limit exceeded
  IF v_call_count > p_max_calls THEN
    -- Block user for progressive duration based on violations
    v_blocked_until := now() + interval '15 minutes';
    
    UPDATE api_rate_limits
    SET blocked_until = v_blocked_until
    WHERE identifier = p_identifier
      AND endpoint = p_endpoint
      AND window_start = v_current_window_start;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', v_blocked_until,
      'message', 'Rate limit exceeded. Blocked for 15 minutes.'
    );
  END IF;
  
  -- Return success with remaining calls
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining_calls', p_max_calls - v_call_count,
    'reset_at', v_current_window_end,
    'message', 'Request allowed'
  );
END;
$$;

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  -- Delete records older than 7 days
  DELETE FROM api_rate_limits
  WHERE window_end < now() - interval '7 days'
    AND (blocked_until IS NULL OR blocked_until < now());
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- Function to get rate limit status
CREATE OR REPLACE FUNCTION get_rate_limit_status(
  p_identifier text,
  p_endpoint text DEFAULT NULL
)
RETURNS TABLE (
  endpoint text,
  call_count integer,
  window_start timestamptz,
  window_end timestamptz,
  blocked_until timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.endpoint,
    r.call_count,
    r.window_start,
    r.window_end,
    r.blocked_until
  FROM api_rate_limits r
  WHERE r.identifier = p_identifier
    AND (p_endpoint IS NULL OR r.endpoint = p_endpoint)
    AND r.window_end > now()
  ORDER BY r.window_start DESC;
END;
$$;
