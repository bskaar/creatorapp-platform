/*
  # Page Versioning System

  ## Overview
  This migration adds a comprehensive version control system for pages, allowing users to:
  - Automatically track all changes to pages
  - View version history with timestamps and authors
  - Compare different versions
  - Restore previous versions
  - Add version notes/comments

  ## New Tables
  
  ### `page_versions`
  - `id` (uuid, primary key) - Unique version identifier
  - `page_id` (uuid, foreign key) - Links to pages table
  - `version_number` (integer) - Sequential version number
  - `content` (jsonb) - Complete page content snapshot
  - `metadata` (jsonb) - SEO and page metadata snapshot
  - `change_summary` (text) - Optional description of changes
  - `created_by` (uuid, foreign key) - User who created this version
  - `created_at` (timestamptz) - When version was created
  - `is_published` (boolean) - Whether this version is/was published
  - `word_count` (integer) - Approximate word count for quick reference
  - `block_count` (integer) - Number of blocks in this version

  ## Indexes
  - Index on `page_id` for fast version lookup
  - Index on `created_at` for chronological queries
  - Composite index on `page_id, version_number` for version retrieval

  ## Security
  - Enable RLS on `page_versions` table
  - Users can view versions of pages they have access to
  - Only authenticated users can create versions
  - Versions inherit access controls from their parent page

  ## Triggers
  - Automatic version creation trigger when pages are updated
  - Auto-increment version numbers per page
*/

-- Create page_versions table
CREATE TABLE IF NOT EXISTS page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  change_summary text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT false,
  word_count integer DEFAULT 0,
  block_count integer DEFAULT 0,
  UNIQUE(page_id, version_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_created_at ON page_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_version ON page_versions(page_id, version_number DESC);

-- Enable RLS
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view versions of pages in their sites
CREATE POLICY "Users can view page versions in their sites"
  ON page_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_versions.page_id
      AND sm.user_id = auth.uid()
    )
  );

-- Policy: Users can create versions for pages they can edit
CREATE POLICY "Users can create versions for pages they can edit"
  ON page_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages p
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_versions.page_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'editor', 'marketer')
    )
  );

-- Policy: Users can update versions (for adding notes)
CREATE POLICY "Users can update versions in their sites"
  ON page_versions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_versions.page_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'editor', 'marketer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages p
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_versions.page_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'editor', 'marketer')
    )
  );

-- Function to count blocks in content
CREATE OR REPLACE FUNCTION count_blocks(content_obj jsonb)
RETURNS integer AS $$
BEGIN
  IF content_obj ? 'blocks' THEN
    RETURN jsonb_array_length(content_obj->'blocks');
  END IF;
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to automatically create version on page update
CREATE OR REPLACE FUNCTION create_page_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version integer;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM page_versions
  WHERE page_id = NEW.id;

  -- Create new version record
  INSERT INTO page_versions (
    page_id,
    version_number,
    content,
    metadata,
    created_by,
    is_published,
    block_count
  ) VALUES (
    NEW.id,
    next_version,
    NEW.content,
    jsonb_build_object(
      'title', NEW.title,
      'slug', NEW.slug,
      'seo_title', NEW.seo_title,
      'seo_description', NEW.seo_description,
      'seo_image_url', NEW.seo_image_url
    ),
    auth.uid(),
    NEW.status = 'published',
    count_blocks(NEW.content)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic versioning
DROP TRIGGER IF EXISTS page_version_trigger ON pages;
CREATE TRIGGER page_version_trigger
  AFTER UPDATE OF content, title, slug, seo_title, seo_description, seo_image_url
  ON pages
  FOR EACH ROW
  EXECUTE FUNCTION create_page_version();

-- Function to create initial version for existing pages
CREATE OR REPLACE FUNCTION create_initial_versions()
RETURNS void AS $$
BEGIN
  INSERT INTO page_versions (
    page_id,
    version_number,
    content,
    metadata,
    created_by,
    is_published,
    block_count,
    created_at
  )
  SELECT 
    p.id,
    1,
    p.content,
    jsonb_build_object(
      'title', p.title,
      'slug', p.slug,
      'seo_title', p.seo_title,
      'seo_description', p.seo_description,
      'seo_image_url', p.seo_image_url
    ),
    (SELECT user_id FROM site_members WHERE site_id = p.site_id LIMIT 1),
    p.status = 'published',
    count_blocks(p.content),
    p.created_at
  FROM pages p
  WHERE NOT EXISTS (
    SELECT 1 FROM page_versions pv WHERE pv.page_id = p.id
  );
END;
$$ LANGUAGE plpgsql;

-- Create initial versions for existing pages
SELECT create_initial_versions();