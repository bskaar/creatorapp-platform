/*
  # Fix All Infinite Recursion Issues and Add Subscription Plans

  ## Problem
  1. Sites table policy queries site_members
  2. Site_members table policy queries sites
  3. This creates circular dependency causing infinite recursion
  4. subscription_plans table doesn't exist

  ## Solution
  1. Simplify sites policies to only check owner_id directly
  2. Keep site_members policies checking sites table (one-way dependency)
  3. Create subscription_plans table with platform pricing tiers
  4. Add RLS policies for subscription_plans

  ## Changes
  1. Drop and recreate sites policies without circular dependency
  2. Create subscription_plans table
  3. Insert plan data
  4. Add RLS policies
*/

-- Fix sites table policies (remove circular dependency)
DROP POLICY IF EXISTS "Users can view their own sites" ON sites;

CREATE POLICY "Users can view owned sites"
  ON sites
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  price_monthly integer NOT NULL DEFAULT 0,
  stripe_price_id text,
  stripe_product_id text,
  is_active boolean DEFAULT true,
  limits jsonb DEFAULT '{}'::jsonb,
  features text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans
  FOR SELECT
  USING (is_active = true);

-- Insert platform subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, limits, features)
VALUES
  (
    'starter',
    'Starter',
    'Perfect for solo creators',
    29,
    '{"max_products": 1, "max_funnels": 1, "max_contacts": 2500, "max_emails_per_month": 5000, "max_team_members": 1}'::jsonb,
    ARRAY['1 product, 1 funnel', 'Up to 2,500 contacts', '5,000 emails/month', 'AI Page Builder (basic)', 'Stripe & PayPal integration']
  ),
  (
    'growth',
    'Growth',
    'Best for growing creators',
    99,
    '{"max_products": null, "max_funnels": 5, "max_contacts": 10000, "max_emails_per_month": 50000, "max_team_members": 3}'::jsonb,
    ARRAY['Unlimited products, 5 funnels', 'Up to 10,000 contacts', '50,000 emails/month', 'AI Copywriter', 'Affiliate program']
  ),
  (
    'pro',
    'Pro',
    'For scaling businesses',
    199,
    '{"max_products": null, "max_funnels": null, "max_contacts": 50000, "max_emails_per_month": 250000, "max_team_members": 10}'::jsonb,
    ARRAY['Unlimited products & funnels', 'Up to 50,000 contacts', '250,000 emails/month', 'AI Analytics', '10 team members']
  )
ON CONFLICT (name) DO NOTHING;