/*
  # Add Product Pricing Display Fields

  1. New Columns on `products` table
    - `stripe_price_id` (text) - Stripe Price ID for checkout integration
    - `features` (text[]) - Array of feature strings for pricing display
    - `is_highlighted` (boolean) - Whether to show as "Popular" in pricing tables
    - `display_order` (integer) - Order in which to display products in pricing tables

  2. Purpose
    - Enable linking products to Stripe prices for checkout
    - Allow products to be displayed in pricing blocks with feature lists
    - Support highlighting specific products as popular/recommended
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE products ADD COLUMN stripe_price_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'features'
  ) THEN
    ALTER TABLE products ADD COLUMN features text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_highlighted'
  ) THEN
    ALTER TABLE products ADD COLUMN is_highlighted boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE products ADD COLUMN display_order integer DEFAULT 0;
  END IF;
END $$;

COMMENT ON COLUMN products.stripe_price_id IS 'Stripe Price ID for checkout integration';
COMMENT ON COLUMN products.features IS 'Array of feature strings to display in pricing tables';
COMMENT ON COLUMN products.is_highlighted IS 'Whether to highlight this product as Popular in pricing displays';
COMMENT ON COLUMN products.display_order IS 'Display order for pricing tables (lower = first)';