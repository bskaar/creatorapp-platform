/*
  # Fix Critical RLS Security Issues

  ## Overview
  Addresses critical RLS security vulnerabilities identified in security audit:
  1. Enable RLS on platform_admins table
  2. Fix RLS policies with always-true conditions (security bypass)
  3. Hide materialized view from public API access

  ## Changes Made
  
  ### 1. Enable RLS on platform_admins
  - Table had policies but RLS was disabled
  - This left the table completely unprotected
  
  ### 2. Fix Always-True RLS Policies
  These policies allowed ANY authenticated user to insert records:
  - audit_logs: "System can insert audit logs"
  - error_logs: "Authenticated users can log errors"
  - invitation_code_uses: "System can create code use records"
  - system_health_metrics: "System can insert health metrics"
  
  ### 3. Hide Materialized View
  - platform_stats_summary should not be accessible via API
  
  ## Security Impact
  - BEFORE: platform_admins completely unprotected despite having policies
  - BEFORE: Any authenticated user could insert audit logs, error logs, etc.
  - AFTER: Proper RLS enforcement, service role only for system operations
*/

-- 1. Enable RLS on platform_admins table
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- 2. Fix always-true policies - Replace with service role policies

-- audit_logs: Only service role should insert system audit logs
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- error_logs: Only service role should insert error logs
DROP POLICY IF EXISTS "Authenticated users can log errors" ON error_logs;
CREATE POLICY "Service role can insert error logs"
  ON error_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- invitation_code_uses: Only service role should track code uses
DROP POLICY IF EXISTS "System can create code use records" ON invitation_code_uses;
CREATE POLICY "Service role can create code use records"
  ON invitation_code_uses FOR INSERT
  TO service_role
  WITH CHECK (true);

-- system_health_metrics: Only service role should insert metrics
DROP POLICY IF EXISTS "System can insert health metrics" ON system_health_metrics;
CREATE POLICY "Service role can insert health metrics"
  ON system_health_metrics FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 3. Revoke API access from materialized view
REVOKE SELECT ON platform_stats_summary FROM anon, authenticated;
