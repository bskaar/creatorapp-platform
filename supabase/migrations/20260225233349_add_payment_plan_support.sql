/*
  # Add Payment Plan Support for Products

  1. Overview
    This migration adds support for payment plans on products, allowing creators
    to offer both a one-time full price and a subscription-based payment plan.

  2. New Columns on `products` Table
    - `stripe_payment_plan_price_id` (text) - Stripe Price ID for the payment plan subscription
    - `payment_plan_installments` (integer) - Number of payments before auto-cancellation
    - `payment_plan_enabled` (boolean) - Whether payment plan option is active

  3. New Table: `payment_plan_tracking`
    Tracks subscription payments to auto-cancel after X installments
    - `id` (uuid, primary key)
    - `order_id` (uuid) - References the order
    - `product_id` (uuid) - References the product
    - `subscription_id` (text) - Stripe subscription ID
    - `customer_email` (text) - Customer's email
    - `site_id` (uuid) - References the site
    - `total_installments` (integer) - Total payments required
    - `payments_completed` (integer) - Payments made so far
    - `is_completed` (boolean) - True when all payments made
    - `completed_at` (timestamptz) - When plan was completed
    - `cancelled_at` (timestamptz) - If cancelled early

  4. Security
    - RLS enabled on payment_plan_tracking
    - Site owners can view their payment plan tracking
*/

-- Add payment plan fields to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stripe_payment_plan_price_id'
  ) THEN
    ALTER TABLE products ADD COLUMN stripe_payment_plan_price_id text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'payment_plan_installments'
  ) THEN
    ALTER TABLE products ADD COLUMN payment_plan_installments integer DEFAULT 3;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'payment_plan_enabled'
  ) THEN
    ALTER TABLE products ADD COLUMN payment_plan_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Create payment plan tracking table
CREATE TABLE IF NOT EXISTS payment_plan_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  subscription_id text NOT NULL,
  customer_email text NOT NULL,
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  total_installments integer NOT NULL,
  payments_completed integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payment_plan_tracking_subscription_id 
  ON payment_plan_tracking(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_tracking_site_id 
  ON payment_plan_tracking(site_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_tracking_order_id 
  ON payment_plan_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_tracking_customer_email 
  ON payment_plan_tracking(customer_email);

-- Enable RLS
ALTER TABLE payment_plan_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_plan_tracking
CREATE POLICY "Site owners can view their payment plan tracking"
  ON payment_plan_tracking
  FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Site owners can insert payment plan tracking"
  ON payment_plan_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (
    site_id IN (
      SELECT site_id FROM site_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Site owners can update their payment plan tracking"
  ON payment_plan_tracking
  FOR UPDATE
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    site_id IN (
      SELECT site_id FROM site_members 
      WHERE user_id = auth.uid()
    )
  );

-- Service role policy for webhook operations
CREATE POLICY "Service role can manage all payment plan tracking"
  ON payment_plan_tracking
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
