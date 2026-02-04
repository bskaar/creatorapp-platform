/*
  # Add Trial Period Configuration to Subscription Plans

  1. Changes
    - Add `trial_days` column to `subscription_plans` table to store trial period per plan
    - Set default trial period of 14 days for all existing paid plans
    - Update all existing plans with trial configuration

  2. Details
    - Starter, Growth, and Pro plans: 14 days trial
    - Enterprise plan: No trial (0 days) - typically requires sales consultation
    - Column is NOT NULL with default value for data integrity
*/

-- Add trial_days column to subscription_plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'trial_days'
  ) THEN
    ALTER TABLE subscription_plans 
    ADD COLUMN trial_days integer NOT NULL DEFAULT 14;
  END IF;
END $$;

-- Update existing plans with appropriate trial periods
UPDATE subscription_plans 
SET trial_days = 14 
WHERE name IN ('starter', 'growth', 'pro') AND price_monthly > 0;

UPDATE subscription_plans 
SET trial_days = 0 
WHERE name = 'enterprise' OR price_monthly = 0;

-- Add comment for documentation
COMMENT ON COLUMN subscription_plans.trial_days IS 'Number of days for free trial period before payment is charged';
