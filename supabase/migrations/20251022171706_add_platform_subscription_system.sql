/*
  # Platform Subscription System

  ## Overview
  This migration creates the infrastructure for platform subscriptions (Starter, Growth, Pro, Enterprise plans)
  that site owners pay to use CreatorApp. This is separate from customer subscriptions.

  ## New Tables

  ### `subscription_plans`
  Defines the available subscription tiers with pricing and limits.
  - `id` (uuid, primary key)
  - `name` (text) - Internal name: 'starter', 'growth', 'pro', 'enterprise'
  - `display_name` (text) - Display name shown to users
  - `price_monthly` (numeric) - Monthly price in USD
  - `stripe_product_id` (text) - Platform Stripe product ID
  - `stripe_price_id` (text) - Platform Stripe price ID
  - `limits` (jsonb) - Plan limits and features
  - `is_active` (boolean) - Whether plan is available for signup
  - `sort_order` (integer) - Display order
  - `created_at`, `updated_at` (timestamptz)

  ## Modified Tables

  ### `sites`
  Added columns to track platform subscription status:
  - `platform_subscription_plan_id` - FK to subscription_plans
  - `platform_subscription_status` - Subscription status
  - `platform_stripe_customer_id` - Platform Stripe customer ID
  - `platform_stripe_subscription_id` - Platform Stripe subscription ID
  - `platform_subscription_current_period_end` - When current billing period ends
  - `platform_trial_ends_at` - When trial period ends
  - `usage_counts` - JSON tracking current usage vs limits

  ## Security
  - Enable RLS on subscription_plans
  - Add policies for reading plan information
  - Update sites policies for new columns

  ## Important Notes
  1. This is for PLATFORM subscriptions (site owners paying for CreatorApp access)
  2. The existing `subscriptions` table is for CUSTOMER subscriptions (end-users paying site owners)
  3. Stripe integration uses YOUR platform's Stripe account, not Stripe Connect
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text DEFAULT '',
  price_monthly numeric(10, 2) NOT NULL DEFAULT 0,
  stripe_product_id text,
  stripe_price_id text,
  limits jsonb DEFAULT '{
    "max_products": null,
    "max_funnels": null,
    "max_contacts": 2500,
    "max_emails_per_month": 5000,
    "max_team_members": 1,
    "ai_features": [],
    "features": []
  }'::jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add platform subscription columns to sites table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'platform_subscription_plan_id'
  ) THEN
    ALTER TABLE sites ADD COLUMN platform_subscription_plan_id uuid REFERENCES subscription_plans(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'platform_subscription_status'
  ) THEN
    ALTER TABLE sites ADD COLUMN platform_subscription_status text DEFAULT 'active' CHECK (
      platform_subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'platform_stripe_customer_id'
  ) THEN
    ALTER TABLE sites ADD COLUMN platform_stripe_customer_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'platform_stripe_subscription_id'
  ) THEN
    ALTER TABLE sites ADD COLUMN platform_stripe_subscription_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'platform_subscription_current_period_end'
  ) THEN
    ALTER TABLE sites ADD COLUMN platform_subscription_current_period_end timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'platform_trial_ends_at'
  ) THEN
    ALTER TABLE sites ADD COLUMN platform_trial_ends_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'usage_counts'
  ) THEN
    ALTER TABLE sites ADD COLUMN usage_counts jsonb DEFAULT '{
      "products_count": 0,
      "funnels_count": 0,
      "contacts_count": 0,
      "emails_sent_this_month": 0,
      "team_members_count": 1
    }'::jsonb;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sites_platform_subscription_plan ON sites(platform_subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_sites_platform_stripe_customer ON sites(platform_stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_sites_platform_stripe_subscription ON sites(platform_stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active, sort_order);

-- Enable RLS on subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active subscription plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, limits, sort_order, is_active)
VALUES
  (
    'starter',
    'Starter',
    'For solo creators and side hustlers',
    0,
    '{
      "max_products": 1,
      "max_funnels": 1,
      "max_contacts": 2500,
      "max_emails_per_month": 5000,
      "max_team_members": 1,
      "ai_features": ["basic"],
      "features": ["stripe_integration", "paypal_integration", "email_support"]
    }'::jsonb,
    1,
    true
  ),
  (
    'growth',
    'Growth',
    'Best for growing creators with multiple offers',
    99,
    '{
      "max_products": null,
      "max_funnels": 5,
      "max_contacts": 10000,
      "max_emails_per_month": 50000,
      "max_team_members": 3,
      "ai_features": ["basic", "copywriter"],
      "features": ["stripe_integration", "paypal_integration", "affiliate_program", "priority_support"]
    }'::jsonb,
    2,
    true
  ),
  (
    'pro',
    'Pro',
    'For scaling businesses and teams',
    199,
    '{
      "max_products": null,
      "max_funnels": null,
      "max_contacts": 50000,
      "max_emails_per_month": 250000,
      "max_team_members": 10,
      "ai_features": ["basic", "copywriter", "analytics"],
      "features": ["stripe_integration", "paypal_integration", "affiliate_program", "white_label", "account_manager"]
    }'::jsonb,
    3,
    true
  ),
  (
    'enterprise',
    'Enterprise',
    'For agencies and high-volume enterprises',
    0,
    '{
      "max_products": null,
      "max_funnels": null,
      "max_contacts": null,
      "max_emails_per_month": null,
      "max_team_members": null,
      "ai_features": ["basic", "copywriter", "analytics", "custom"],
      "features": ["stripe_integration", "paypal_integration", "affiliate_program", "white_label", "dedicated_csm", "sla_support", "custom_domain"]
    }'::jsonb,
    4,
    true
  )
ON CONFLICT (name) DO NOTHING;
