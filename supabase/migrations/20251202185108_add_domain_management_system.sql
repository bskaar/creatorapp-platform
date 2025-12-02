/*
  # Domain Management System

  1. Updates to Sites Table
    - Add domain verification status tracking
    - Add domain verification token
    - Add domain verified timestamp
    - Add DNS records for verification

  2. Security
    - RLS policies remain unchanged
    - Ensures only site owners can manage domains

  3. Features
    - Custom domain support
    - Domain verification workflow
    - DNS configuration tracking
    - SSL certificate status
*/

-- Add domain management columns to sites table
DO $$
BEGIN
  -- Domain verification status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'domain_verification_status'
  ) THEN
    ALTER TABLE sites ADD COLUMN domain_verification_status text DEFAULT 'not_verified' 
      CHECK (domain_verification_status IN ('not_verified', 'pending', 'verified', 'failed'));
  END IF;

  -- Domain verification token
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'domain_verification_token'
  ) THEN
    ALTER TABLE sites ADD COLUMN domain_verification_token text;
  END IF;

  -- Domain verified timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'domain_verified_at'
  ) THEN
    ALTER TABLE sites ADD COLUMN domain_verified_at timestamptz;
  END IF;

  -- DNS configuration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'dns_records'
  ) THEN
    ALTER TABLE sites ADD COLUMN dns_records jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- SSL certificate status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'ssl_status'
  ) THEN
    ALTER TABLE sites ADD COLUMN ssl_status text DEFAULT 'not_provisioned'
      CHECK (ssl_status IN ('not_provisioned', 'provisioning', 'active', 'failed'));
  END IF;
END $$;

-- Create index for custom domain lookups
CREATE INDEX IF NOT EXISTS idx_sites_custom_domain ON sites(custom_domain) WHERE custom_domain IS NOT NULL;

-- Create function to generate verification token
CREATE OR REPLACE FUNCTION generate_domain_verification_token()
RETURNS text AS $$
BEGIN
  RETURN 'crtr_verify_' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;
