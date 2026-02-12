/*
  # Fix Rate Limiting Security Bypass

  ## Overview
  Removes overly permissive RLS policy that allowed ANY authenticated user to 
  manage rate limits, enabling users to bypass rate limiting entirely.

  ## Security Issue
  - BEFORE: "USING (true)" and "WITH CHECK (true)" meant users could modify their own rate limits
  - Users could reset their request counts or increase their limits
  - Completely defeats the purpose of rate limiting
  
  ## Changes Made
  
  ### Dropped Policies (Mixed)
  - "Users can view own rate limits" - Was okay, but recreating for consistency
  - "System can manage rate limits" - INSECURE, used USING (true) WITH CHECK (true)
  
  ### New Policies (Secure)
  1. Service role can manage all rate limit records (for system enforcement)
  2. Users can VIEW their own rate limit status (read-only for transparency)
  3. Platform admins can view all rate limits (for monitoring/debugging)
  
  ## Security Impact
  - Users can no longer manipulate rate limits
  - Rate limiting enforcement restored
  - Users retain visibility into their own limits (transparency)
  - Admins can monitor for abuse
  
  ## Notes
  - Edge functions should use service role for rate limit enforcement
  - Frontend can display user's current rate limit status (read-only)
  - Table uses identifier + identifier_type pattern (not direct user_id)
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own rate limits" ON api_rate_limits;
DROP POLICY IF EXISTS "System can manage rate limits" ON api_rate_limits;

-- Allow service role full access (for system enforcement)
CREATE POLICY "Service role can manage rate limits"
  ON api_rate_limits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own rate limit status (read-only)
CREATE POLICY "Users can view own rate limits"
  ON api_rate_limits FOR SELECT
  TO authenticated
  USING (
    identifier_type = 'user_id' 
    AND identifier = auth.uid()::text
  );

-- Platform admins can view all rate limits (for monitoring)
CREATE POLICY "Platform admins can view all rate limits"
  ON api_rate_limits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid()
    )
  );
