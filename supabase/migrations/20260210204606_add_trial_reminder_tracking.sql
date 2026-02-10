/*
  # Add Trial Reminder Email Tracking

  ## Overview
  This migration adds tracking for trial expiration reminder emails to prevent duplicate notifications
  and ensure users receive a reminder 5 days before their trial ends.

  ## Changes
  1. Add `trial_reminder_sent_at` column to sites table
     - Tracks when the trial expiration reminder email was sent
     - NULL if no reminder has been sent yet
     - Prevents duplicate reminder emails

  2. Create index for efficient querying
     - Index on trial end date for the scheduled email job
     - Index on reminder sent status for filtering

  ## Usage
  - When trial reminder is sent, update `trial_reminder_sent_at` to current timestamp
  - Query for sites where `platform_trial_ends_at` is 5 days away and `trial_reminder_sent_at` IS NULL
*/

-- Add trial reminder tracking column to sites table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'trial_reminder_sent_at'
  ) THEN
    ALTER TABLE sites ADD COLUMN trial_reminder_sent_at timestamptz DEFAULT NULL;
  END IF;
END $$;

-- Create index for efficient trial reminder queries
CREATE INDEX IF NOT EXISTS idx_sites_trial_ends_at ON sites(platform_trial_ends_at)
  WHERE platform_trial_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sites_trial_reminder_pending ON sites(platform_subscription_status, platform_trial_ends_at, trial_reminder_sent_at)
  WHERE platform_subscription_status = 'trialing' AND trial_reminder_sent_at IS NULL;

-- Add helpful comment
COMMENT ON COLUMN sites.trial_reminder_sent_at IS 'Timestamp when the 5-day trial expiration reminder email was sent. NULL if not sent yet.';
