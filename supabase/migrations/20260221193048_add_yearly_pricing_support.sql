/*
  # Add Yearly Pricing Support to Subscription Plans

  1. Changes
    - Adds `price_yearly` column to store the annual price (10 months worth)
    - Adds `stripe_price_id_yearly` column to store the Stripe price ID for yearly billing

  2. Data Updates
    - Sets yearly prices to 10x monthly (2 months free)
    - Starter: $490/year ($49 x 10)
    - Growth: $990/year ($99 x 10)
    - Pro: $1990/year ($199 x 10)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'price_yearly'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN price_yearly numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'stripe_price_id_yearly'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN stripe_price_id_yearly text;
  END IF;
END $$;

UPDATE subscription_plans SET price_yearly = 490.00 WHERE name = 'starter';
UPDATE subscription_plans SET price_yearly = 990.00 WHERE name = 'growth';
UPDATE subscription_plans SET price_yearly = 1990.00 WHERE name = 'pro';
UPDATE subscription_plans SET price_yearly = 0.00 WHERE name = 'enterprise';