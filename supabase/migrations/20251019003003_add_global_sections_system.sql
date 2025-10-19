/*
  # Global Sections System

  ## Overview
  This migration adds global sections - reusable content sections that can be used
  across multiple pages. When updated, all instances are updated automatically.
  Common use cases: headers, footers, announcement bars, newsletter signups.

  ## New Tables

  ### `global_sections`
  - `id` (uuid, primary key) - Unique section identifier
  - `site_id` (uuid, foreign key) - Links to sites table
  - `name` (text) - User-defined name for the section
  - `description` (text) - Optional description of section purpose
  - `section_type` (text) - Type: header, footer, announcement, newsletter, custom
  - `content` (jsonb) - Section content (blocks or HTML)
  - `styles` (jsonb) - Custom styling for the section
  - `is_active` (boolean) - Enable/disable section globally
  - `usage_count` (integer) - Number of pages using this section
  - `created_by` (uuid, foreign key) - User who created this section
  - `created_at` (timestamptz) - When section was created
  - `updated_at` (timestamptz) - Last modification time
  - `settings` (jsonb) - Additional configuration options

  ### `page_global_sections`
  - `id` (uuid, primary key) - Unique link identifier
  - `page_id` (uuid, foreign key) - Links to pages table
  - `global_section_id` (uuid, foreign key) - Links to global_sections table
  - `position` (text) - Where section appears: top, bottom, custom
  - `order_index` (integer) - Order when multiple sections at same position
  - `is_visible` (boolean) - Override visibility per page
  - `created_at` (timestamptz) - When section was added to page

  ## Indexes
  - Index on `site_id` for fast lookup
  - Index on `section_type` for filtering
  - Index on `is_active` for active sections
  - Index on `page_id` and `global_section_id` for page lookups
  - Index on `position` for ordering

  ## Security
  - Enable RLS on both tables
  - Users can view sections in their sites
  - Editors and above can create and manage sections
  - Site admins can manage all sections

  ## Features
  - Automatic usage count tracking
  - Section versioning support
  - Per-page visibility override
  - Position-based ordering
  - Active/inactive toggle without deletion
*/

-- Create global_sections table
CREATE TABLE IF NOT EXISTS global_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  section_type text NOT NULL CHECK (section_type IN ('header', 'footer', 'announcement', 'newsletter', 'sidebar', 'custom')),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  styles jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  settings jsonb DEFAULT '{}'::jsonb
);

-- Create page_global_sections junction table
CREATE TABLE IF NOT EXISTS page_global_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  global_section_id uuid NOT NULL REFERENCES global_sections(id) ON DELETE CASCADE,
  position text NOT NULL CHECK (position IN ('top', 'bottom', 'before_content', 'after_content', 'custom')),
  order_index integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(page_id, global_section_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_sections_site_id ON global_sections(site_id);
CREATE INDEX IF NOT EXISTS idx_global_sections_type ON global_sections(site_id, section_type);
CREATE INDEX IF NOT EXISTS idx_global_sections_active ON global_sections(site_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_page_global_sections_page ON page_global_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_global_sections_section ON page_global_sections(global_section_id);
CREATE INDEX IF NOT EXISTS idx_page_global_sections_position ON page_global_sections(page_id, position, order_index);

-- Enable RLS on global_sections
ALTER TABLE global_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view global sections in their sites
CREATE POLICY "Users can view global sections in their sites"
  ON global_sections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = global_sections.site_id
      AND site_members.user_id = auth.uid()
    )
  );

-- Policy: Editors can create global sections
CREATE POLICY "Editors can create global sections"
  ON global_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = global_sections.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'editor', 'marketer')
    )
  );

-- Policy: Editors can update global sections
CREATE POLICY "Editors can update global sections"
  ON global_sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = global_sections.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'editor', 'marketer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = global_sections.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'editor', 'marketer')
    )
  );

-- Policy: Admins can delete global sections
CREATE POLICY "Admins can delete global sections"
  ON global_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = global_sections.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

-- Enable RLS on page_global_sections
ALTER TABLE page_global_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view page sections for pages they can access
CREATE POLICY "Users can view page global sections"
  ON page_global_sections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_global_sections.page_id
      AND sm.user_id = auth.uid()
    )
  );

-- Policy: Editors can manage page sections
CREATE POLICY "Editors can insert page global sections"
  ON page_global_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages p
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_global_sections.page_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'editor', 'marketer')
    )
  );

CREATE POLICY "Editors can update page global sections"
  ON page_global_sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_global_sections.page_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'editor', 'marketer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages p
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_global_sections.page_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'editor', 'marketer')
    )
  );

CREATE POLICY "Editors can delete page global sections"
  ON page_global_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_global_sections.page_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'editor', 'marketer')
    )
  );

-- Function to update usage count
CREATE OR REPLACE FUNCTION update_global_section_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE global_sections
    SET usage_count = (
      SELECT COUNT(*) FROM page_global_sections
      WHERE global_section_id = NEW.global_section_id
    )
    WHERE id = NEW.global_section_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE global_sections
    SET usage_count = (
      SELECT COUNT(*) FROM page_global_sections
      WHERE global_section_id = OLD.global_section_id
    )
    WHERE id = OLD.global_section_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update usage count
CREATE TRIGGER update_global_section_usage
  AFTER INSERT OR DELETE ON page_global_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_global_section_usage_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_global_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER global_sections_updated_at
  BEFORE UPDATE ON global_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_global_sections_updated_at();