/*
  # Add Vercel Domain Tracking Fields

  1. New Columns
    - `vercel_domain_added` (boolean) - Whether the domain has been added to Vercel
    - `vercel_domain_verified` (boolean) - Whether Vercel has verified the domain

  2. Purpose
    - Track which custom domains have been programmatically added to Vercel
    - Enable scalable custom domain management for hundreds/thousands of customers
    - Allow automatic domain provisioning when DNS verification passes

  3. Notes
    - These fields work alongside existing domain_verification_status
    - vercel_domain_added = true means API call to Vercel succeeded
    - vercel_domain_verified = true means Vercel confirmed SSL/routing is ready
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'vercel_domain_added'
  ) THEN
    ALTER TABLE sites ADD COLUMN vercel_domain_added boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'vercel_domain_verified'
  ) THEN
    ALTER TABLE sites ADD COLUMN vercel_domain_verified boolean DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sites_vercel_domain_status 
  ON sites(vercel_domain_added, vercel_domain_verified) 
  WHERE custom_domain IS NOT NULL;
