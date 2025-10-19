/*
  # Custom Blocks Library System

  ## Overview
  This migration adds functionality for users to save frequently used block combinations
  and reuse them across pages. This improves productivity by reducing repetitive work.

  ## New Tables

  ### `custom_blocks`
  - `id` (uuid, primary key) - Unique block identifier
  - `site_id` (uuid, foreign key) - Links to sites table
  - `name` (text) - User-defined name for the block
  - `description` (text) - Optional description of the block's purpose
  - `category` (text) - Category for organization (hero, cta, features, etc.)
  - `block_data` (jsonb) - Complete block configuration including type, content, and styles
  - `thumbnail_url` (text) - Optional preview image
  - `usage_count` (integer) - Track how often block is used
  - `is_favorite` (boolean) - User can mark frequently used blocks
  - `created_by` (uuid, foreign key) - User who created this block
  - `created_at` (timestamptz) - When block was created
  - `updated_at` (timestamptz) - Last modification time
  - `tags` (text[]) - Array of tags for searchability

  ## Indexes
  - Index on `site_id` for fast lookup
  - Index on `category` for filtering
  - Index on `created_by` for personal library view
  - Index on `usage_count` for popular blocks
  - GIN index on `tags` for tag searching

  ## Security
  - Enable RLS on `custom_blocks` table
  - Users can view blocks in their sites
  - Users can create their own blocks
  - Users can update and delete their own blocks
  - Site admins can manage all blocks in their site

  ## Features
  - Tag-based organization and search
  - Usage tracking for analytics
  - Favorite marking for quick access
  - Full block data preservation including styles
*/

-- Create custom_blocks table
CREATE TABLE IF NOT EXISTS custom_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('hero', 'text', 'image', 'cta', 'features', 'testimonial', 'form', 'pricing', 'video', 'gallery', 'stats', 'custom')),
  block_data jsonb NOT NULL,
  thumbnail_url text,
  usage_count integer DEFAULT 0,
  is_favorite boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  tags text[] DEFAULT '{}'::text[]
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_blocks_site_id ON custom_blocks(site_id);
CREATE INDEX IF NOT EXISTS idx_custom_blocks_category ON custom_blocks(site_id, category);
CREATE INDEX IF NOT EXISTS idx_custom_blocks_created_by ON custom_blocks(created_by);
CREATE INDEX IF NOT EXISTS idx_custom_blocks_usage_count ON custom_blocks(site_id, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_custom_blocks_is_favorite ON custom_blocks(site_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_custom_blocks_tags ON custom_blocks USING gin(tags);

-- Enable RLS
ALTER TABLE custom_blocks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view custom blocks in their sites
CREATE POLICY "Users can view custom blocks in their sites"
  ON custom_blocks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = custom_blocks.site_id
      AND site_members.user_id = auth.uid()
    )
  );

-- Policy: Users can create custom blocks in their sites
CREATE POLICY "Users can create custom blocks in their sites"
  ON custom_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = custom_blocks.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'editor', 'marketer')
    )
  );

-- Policy: Users can update their own blocks or site admins can update all
CREATE POLICY "Users can update their own custom blocks"
  ON custom_blocks
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = custom_blocks.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = custom_blocks.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

-- Policy: Users can delete their own blocks or site admins can delete all
CREATE POLICY "Users can delete their own custom blocks"
  ON custom_blocks
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = custom_blocks.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_block_usage(block_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE custom_blocks
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = block_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER custom_blocks_updated_at
  BEFORE UPDATE ON custom_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_blocks_updated_at();