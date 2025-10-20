/*
  # Add Stripe Connect Integration Fields

  1. Changes to sites table
    - Add `stripe_connect_account_id` to store the connected Stripe account
    - Add `stripe_connect_onboarding_complete` to track onboarding status
    - Add `stripe_connect_charges_enabled` to track if account can accept charges
    - Add `stripe_connect_payouts_enabled` to track if account can receive payouts
    - Add `stripe_connect_created_at` to track when connection was established

  2. Purpose
    - Enable Stripe Connect so content creators can receive payments directly
    - Platform facilitates payments but money goes to content creator's Stripe account
    - Track connection status and capabilities for each site

  3. Security
    - Only site owners can view their Stripe Connect status
    - Connection data stored securely in site settings
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'stripe_connect_account_id'
  ) THEN
    ALTER TABLE sites ADD COLUMN stripe_connect_account_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'stripe_connect_onboarding_complete'
  ) THEN
    ALTER TABLE sites ADD COLUMN stripe_connect_onboarding_complete boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'stripe_connect_charges_enabled'
  ) THEN
    ALTER TABLE sites ADD COLUMN stripe_connect_charges_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'stripe_connect_payouts_enabled'
  ) THEN
    ALTER TABLE sites ADD COLUMN stripe_connect_payouts_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'stripe_connect_created_at'
  ) THEN
    ALTER TABLE sites ADD COLUMN stripe_connect_created_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sites_stripe_connect_account_id ON sites(stripe_connect_account_id);