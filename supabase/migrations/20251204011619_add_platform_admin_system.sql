/*
  # Platform Admin System

  ## Overview
  Creates a separate admin system for managing the CreatorApp.US platform itself,
  distinct from individual site management.

  ## 1. New Tables
  
  ### `platform_admins`
  Tracks users who have platform-level administrative access.
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `role` (text) - 'super_admin' or 'admin'
  - `permissions` (jsonb) - granular permissions object
  - `created_at` (timestamptz)
  - `created_by` (uuid) - admin who granted access

  ### `platform_metrics`
  Stores aggregated platform-wide metrics over time.
  - `id` (uuid, primary key)
  - `metric_date` (date) - the date for these metrics
  - `total_sites` (integer) - total sites on platform
  - `active_sites` (integer) - sites with activity in last 30 days
  - `total_users` (integer) - total users across all sites
  - `total_revenue` (numeric) - total revenue for the period
  - `new_signups` (integer) - new sites created
  - `churned_sites` (integer) - sites that canceled
  - `metrics_data` (jsonb) - additional metrics
  - `created_at` (timestamptz)

  ### `platform_audit_log`
  Tracks all platform admin actions for accountability.
  - `id` (uuid, primary key)
  - `admin_id` (uuid) - which admin performed the action
  - `action` (text) - what action was performed
  - `resource_type` (text) - what was affected (site, user, etc)
  - `resource_id` (uuid) - ID of affected resource
  - `changes` (jsonb) - what changed
  - `ip_address` (text) - IP of admin
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Only platform admins can access these tables
  - Audit log is append-only (no updates/deletes)

  ## 3. Views
  - Create materialized view for real-time platform statistics
*/

-- Create platform_admins table
CREATE TABLE IF NOT EXISTS platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  permissions jsonb DEFAULT '{"view_sites": true, "manage_sites": false, "view_users": true, "manage_users": false, "view_analytics": true, "manage_billing": false, "manage_platform_settings": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users,
  updated_at timestamptz DEFAULT now()
);

-- Create platform_metrics table
CREATE TABLE IF NOT EXISTS platform_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL UNIQUE,
  total_sites integer DEFAULT 0,
  active_sites integer DEFAULT 0,
  total_users integer DEFAULT 0,
  total_revenue numeric(10,2) DEFAULT 0,
  new_signups integer DEFAULT 0,
  churned_sites integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_products integer DEFAULT 0,
  metrics_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create platform_audit_log table
CREATE TABLE IF NOT EXISTS platform_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  changes jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_admins

-- Platform admins can view all platform admins
CREATE POLICY "Platform admins can view all admins"
  ON platform_admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid()
    )
  );

-- Only super admins can insert new platform admins
CREATE POLICY "Super admins can create platform admins"
  ON platform_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Only super admins can update platform admins
CREATE POLICY "Super admins can update platform admins"
  ON platform_admins FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Only super admins can delete platform admins
CREATE POLICY "Super admins can delete platform admins"
  ON platform_admins FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for platform_metrics

-- Platform admins can view metrics
CREATE POLICY "Platform admins can view metrics"
  ON platform_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid()
    )
  );

-- System can insert metrics (typically via scheduled job)
CREATE POLICY "System can insert metrics"
  ON platform_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for platform_audit_log

-- Platform admins can view audit log
CREATE POLICY "Platform admins can view audit log"
  ON platform_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid()
    )
  );

-- Platform admins can insert audit log entries
CREATE POLICY "Platform admins can create audit entries"
  ON platform_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_platform_admins_user_id ON platform_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_date ON platform_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_platform_audit_log_admin ON platform_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_platform_audit_log_created ON platform_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_audit_log_resource ON platform_audit_log(resource_type, resource_id);

-- Create materialized view for real-time platform statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS platform_stats_summary AS
SELECT
  (SELECT COUNT(*) FROM sites) as total_sites,
  (SELECT COUNT(*) FROM sites WHERE updated_at > now() - interval '30 days') as active_sites_30d,
  (SELECT COUNT(DISTINCT user_id) FROM site_members) as total_users,
  (SELECT COUNT(*) FROM sites WHERE created_at > now() - interval '7 days') as new_sites_7d,
  (SELECT COUNT(*) FROM sites WHERE created_at > now() - interval '30 days') as new_sites_30d,
  (SELECT COALESCE(SUM(amount::numeric), 0) FROM orders WHERE payment_status = 'paid') as total_revenue,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM pages) as total_pages,
  now() as last_updated;

-- Create function to refresh platform stats
CREATE OR REPLACE FUNCTION refresh_platform_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW platform_stats_summary;
END;
$$;

-- Create function to log platform admin actions
CREATE OR REPLACE FUNCTION log_platform_action(
  p_action text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_changes jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO platform_audit_log (
    admin_id,
    action,
    resource_type,
    resource_id,
    changes
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_changes
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;