/*
  # Site Brand Theme System

  1. Overview
    - Adds comprehensive brand theme to sites table
    - Adds funnel-level theme override capability
    - Enables site pages to inherit from site theme
    - Enables funnels to optionally override site theme

  2. Changes to Sites Table
    - `brand_theme` (jsonb) - Complete brand theme object containing:
      - primaryColor, secondaryColor, accentColor, neutralColor, backgroundColor
      - textColor, headingFont, bodyFont, borderRadius

  3. Changes to Funnels Table
    - `use_site_branding` (boolean) - Whether to inherit site theme (default true)
    - `custom_theme` (jsonb) - Optional custom theme when not using site branding

  4. Notes
    - Site pages will always use site brand_theme
    - Funnels default to site branding but can override
    - Existing pages will continue to work (backward compatible)
*/

-- Add brand_theme to sites table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sites' AND column_name = 'brand_theme'
  ) THEN
    ALTER TABLE sites ADD COLUMN brand_theme jsonb DEFAULT jsonb_build_object(
      'primaryColor', '#3B82F6',
      'secondaryColor', '#10B981',
      'accentColor', '#F59E0B',
      'neutralColor', '#1F2937',
      'backgroundColor', '#FFFFFF',
      'textColor', '#1F2937',
      'headingFont', 'Inter',
      'bodyFont', 'Inter',
      'borderRadius', '8px'
    );
  END IF;
END $$;

-- Add theme override fields to funnels table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'funnels' AND column_name = 'use_site_branding'
  ) THEN
    ALTER TABLE funnels ADD COLUMN use_site_branding boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'funnels' AND column_name = 'custom_theme'
  ) THEN
    ALTER TABLE funnels ADD COLUMN custom_theme jsonb;
  END IF;
END $$;

-- Migrate existing site primary_color to brand_theme if brand_theme is still default
UPDATE sites
SET brand_theme = jsonb_set(
  brand_theme,
  '{primaryColor}',
  to_jsonb(primary_color)
)
WHERE primary_color IS NOT NULL 
  AND primary_color != '#3B82F6'
  AND brand_theme->>'primaryColor' = '#3B82F6';

-- Add index for faster funnel theme queries
CREATE INDEX IF NOT EXISTS idx_funnels_use_site_branding ON funnels(use_site_branding) WHERE use_site_branding = false;
