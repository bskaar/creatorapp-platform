/*
  # Add Stripe Product Integration Fields

  ## Overview
  Adds Stripe product and price ID fields to the products table to enable
  proper Stripe product integration for checkout sessions.

  ## Changes
  1. Add `stripe_product_id` column to store Stripe product IDs
  2. Add `stripe_price_id` column to store Stripe price IDs

  ## Notes
  - These fields enable direct Stripe product integration
  - Products can now be linked to Stripe products for checkout
*/

-- Add Stripe product integration fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE products ADD COLUMN stripe_product_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE products ADD COLUMN stripe_price_id text;
  END IF;
END $$;