/*
  # Add Onboarding Tracking System

  1. Changes
    - Add `onboarding_completed` boolean to sites table
    - Add `onboarding_data` JSONB field to store onboarding selections
    - Add `show_tour` boolean to track if user has seen the tour
    - Add default values for new sites

  2. Purpose
    - Track user onboarding progress
    - Store user preferences from onboarding wizard
    - Enable personalized dashboard experience
*/

-- Add onboarding fields to sites table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE sites ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'onboarding_data'
  ) THEN
    ALTER TABLE sites ADD COLUMN onboarding_data jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'show_tour'
  ) THEN
    ALTER TABLE sites ADD COLUMN show_tour boolean DEFAULT true;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sites_onboarding_completed ON sites(onboarding_completed);
