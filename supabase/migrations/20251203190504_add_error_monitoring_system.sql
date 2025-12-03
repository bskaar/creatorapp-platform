/*
  # Error Monitoring and Logging System

  ## Overview
  Creates infrastructure for tracking application errors, monitoring system health,
  and debugging production issues. Essential for launch readiness.

  ## New Tables

  ### `error_logs`
  Tracks frontend and backend errors with full context
  - `id` (uuid, primary key)
  - `user_id` (uuid, nullable) - User who encountered the error
  - `site_id` (uuid, nullable) - Related site if applicable
  - `error_type` (text) - Category: 'javascript', 'api', 'auth', 'payment', etc.
  - `error_message` (text) - Error message
  - `error_stack` (text) - Stack trace for debugging
  - `error_code` (text) - Error code if available
  - `url` (text) - Page where error occurred
  - `user_agent` (text) - Browser information
  - `severity` (text) - 'low', 'medium', 'high', 'critical'
  - `context` (jsonb) - Additional context (component, action, payload)
  - `resolved` (boolean) - Whether error has been addressed
  - `resolved_at` (timestamptz) - When error was resolved
  - `created_at` (timestamptz) - When error occurred

  ### `system_health_metrics`
  Tracks system performance and health indicators
  - `id` (uuid, primary key)
  - `metric_type` (text) - Type: 'api_latency', 'error_rate', 'uptime', etc.
  - `metric_value` (numeric) - Measured value
  - `site_id` (uuid, nullable) - Related site if applicable
  - `metadata` (jsonb) - Additional metric context
  - `created_at` (timestamptz) - Timestamp

  ## Security
  - RLS enabled on all tables
  - Users can view errors from their own sites
  - Anonymous error logging supported for critical issues
  - Automatic PII scrubbing in error messages

  ## Indexes
  - Fast lookups by user, site, timestamp
  - Error type filtering
  - Severity-based queries
*/

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  error_type text NOT NULL CHECK (error_type IN (
    'javascript', 'api', 'auth', 'payment', 'database', 'network', 'validation', 'other'
  )),
  error_message text NOT NULL,
  error_stack text,
  error_code text,
  url text,
  user_agent text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  context jsonb DEFAULT '{}'::jsonb,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for error_logs
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_site_id ON error_logs(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_unresolved ON error_logs(resolved, created_at DESC) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);

-- Create system_health_metrics table
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for system_health_metrics
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON system_health_metrics(metric_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_metrics_site_id ON system_health_metrics(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_metrics_created_at ON system_health_metrics(created_at DESC);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for error_logs

CREATE POLICY "Users can view errors from their sites"
  ON error_logs FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Authenticated users can log errors"
  ON error_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anonymous users can log critical errors"
  ON error_logs FOR INSERT
  TO anon
  WITH CHECK (severity IN ('high', 'critical'));

CREATE POLICY "Site owners can resolve errors"
  ON error_logs FOR UPDATE
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for system_health_metrics

CREATE POLICY "Users can view metrics from their sites"
  ON system_health_metrics FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
    OR site_id IS NULL
  );

CREATE POLICY "System can insert health metrics"
  ON system_health_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to log errors
CREATE OR REPLACE FUNCTION log_error(
  p_error_type text,
  p_error_message text,
  p_error_stack text DEFAULT NULL,
  p_error_code text DEFAULT NULL,
  p_url text DEFAULT NULL,
  p_severity text DEFAULT 'medium',
  p_context jsonb DEFAULT '{}'::jsonb,
  p_site_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_error_id uuid;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  -- Scrub potential PII from error message
  p_error_message := regexp_replace(p_error_message, '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', 'g');
  p_error_message := regexp_replace(p_error_message, '\b\d{3}-\d{2}-\d{4}\b', '[SSN]', 'g');
  
  INSERT INTO error_logs (
    user_id,
    site_id,
    error_type,
    error_message,
    error_stack,
    error_code,
    url,
    severity,
    context
  ) VALUES (
    v_user_id,
    p_site_id,
    p_error_type,
    p_error_message,
    p_error_stack,
    p_error_code,
    p_url,
    p_severity,
    p_context
  )
  RETURNING id INTO v_error_id;
  
  RETURN v_error_id;
END;
$$;

-- Create function to record health metrics
CREATE OR REPLACE FUNCTION record_health_metric(
  p_metric_type text,
  p_metric_value numeric,
  p_site_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_metric_id uuid;
BEGIN
  INSERT INTO system_health_metrics (
    metric_type,
    metric_value,
    site_id,
    metadata
  ) VALUES (
    p_metric_type,
    p_metric_value,
    p_site_id,
    p_metadata
  )
  RETURNING id INTO v_metric_id;
  
  RETURN v_metric_id;
END;
$$;

-- Create function to get error statistics
CREATE OR REPLACE FUNCTION get_error_stats(
  p_site_id uuid DEFAULT NULL,
  p_hours integer DEFAULT 24
)
RETURNS TABLE (
  total_errors bigint,
  critical_errors bigint,
  error_rate numeric,
  most_common_type text,
  most_common_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH error_data AS (
    SELECT *
    FROM error_logs
    WHERE created_at > now() - (p_hours || ' hours')::interval
      AND (p_site_id IS NULL OR site_id = p_site_id)
  )
  SELECT
    COUNT(*)::bigint as total_errors,
    COUNT(*) FILTER (WHERE severity = 'critical')::bigint as critical_errors,
    ROUND((COUNT(*)::numeric / NULLIF(p_hours, 0)), 2) as error_rate,
    (SELECT error_type FROM error_data GROUP BY error_type ORDER BY COUNT(*) DESC LIMIT 1) as most_common_type,
    (SELECT url FROM error_data WHERE url IS NOT NULL GROUP BY url ORDER BY COUNT(*) DESC LIMIT 1) as most_common_url
  FROM error_data;
END;
$$;
