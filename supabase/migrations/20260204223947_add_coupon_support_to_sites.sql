/*
  # Add Coupon Support for Subscription Checkout

  1. Changes
    - Add `platform_coupon_code` column to `sites` table for pre-assigned coupons
    - Allows platform admins to assign specific Stripe coupon codes to users
    - Useful for beta users, partnerships, or special promotions

  2. Details
    - Column stores Stripe coupon ID (e.g., "BETA100OFF")
    - NULL means no pre-assigned coupon
    - Coupon will be automatically applied at checkout if present
    - Users can still enter promotion codes at checkout even without pre-assigned coupon
*/

-- Add coupon code column to sites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'platform_coupon_code'
  ) THEN
    ALTER TABLE sites 
    ADD COLUMN platform_coupon_code text;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN sites.platform_coupon_code IS 'Pre-assigned Stripe coupon code to apply at checkout (e.g., BETA100OFF)';
