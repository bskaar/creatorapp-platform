/*
  # Add Settings Infrastructure Tables

  1. New Tables
    - `billing`
      - Manages subscription and billing information for each site
      - Links to Stripe customer and subscription IDs
      - Tracks plan status and billing periods
    
    - `api_keys`
      - Stores API keys for programmatic access
      - Includes key hash for security
      - Tracks permissions, usage, and expiration
    
    - `webhooks`
      - Manages webhook endpoints for event notifications
      - Supports multiple events per webhook
      - Includes secret for signature verification

  2. Security
    - Enable RLS on all tables
    - Add policies for site owners and admins only
    - Ensure proper access control for sensitive data
*/

-- Billing table
CREATE TABLE IF NOT EXISTS billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_id text,
  status text DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  permissions jsonb DEFAULT '[]',
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  secret text,
  enabled boolean DEFAULT true,
  last_triggered_at timestamptz,
  failure_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_billing_site_id ON billing(site_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_site_id ON api_keys(site_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_site_id ON webhooks(site_id);

-- Enable RLS
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Billing policies
CREATE POLICY "Site owners can view billing"
  ON billing FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = billing.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Site owners can insert billing"
  ON billing FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = billing.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role = 'owner'
    )
  );

CREATE POLICY "Site owners can update billing"
  ON billing FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = billing.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = billing.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role = 'owner'
    )
  );

-- API Keys policies
CREATE POLICY "Site admins can view api keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = api_keys.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Site admins can create api keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = api_keys.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Site admins can update api keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = api_keys.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = api_keys.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Site admins can delete api keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = api_keys.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

-- Webhooks policies
CREATE POLICY "Site admins can view webhooks"
  ON webhooks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = webhooks.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Site admins can create webhooks"
  ON webhooks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = webhooks.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Site admins can update webhooks"
  ON webhooks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = webhooks.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = webhooks.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Site admins can delete webhooks"
  ON webhooks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = webhooks.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );