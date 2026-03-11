/*
  # Site Context Documents System
  
  This migration adds the infrastructure for storing and managing business context documents
  that enhance AI responses for Growth+ tier users.
  
  1. New Tables
    - `site_context_documents`
      - `id` (uuid, primary key) - Unique identifier
      - `site_id` (uuid, foreign key) - References the site this document belongs to
      - `document_type` (text) - Type: 'branding', 'business_plan', 'html_reference'
      - `name` (text) - User-friendly document name
      - `raw_content_preview` (text) - First 500 chars of original content for reference
      - `extracted_context` (jsonb) - AI-extracted structured summary
      - `extraction_model` (text) - Which AI model performed extraction
      - `version` (integer) - Version number for this document type
      - `status` (text) - Processing status: 'processing', 'ready', 'failed', 'archived'
      - `error_message` (text) - Error details if extraction failed
      - `created_at` (timestamptz) - When document was uploaded
      - `updated_at` (timestamptz) - Last modification time
      - `archived_at` (timestamptz) - When document was archived (soft delete)
  
  2. Security
    - Enable RLS on `site_context_documents` table
    - Add policies for site owners/admins to manage their documents
    - Authenticated users can only access documents for sites they own/admin
  
  3. Indexes
    - Index on site_id for fast lookups
    - Composite index on (site_id, document_type, version) for version queries
    - Index on status for filtering active documents
  
  4. Notes
    - Documents are soft-deleted via archived_at timestamp
    - Version control: new uploads increment version, keep last 3 active
    - Growth+ feature only (enforced at application level)
*/

-- Create the site_context_documents table
CREATE TABLE IF NOT EXISTS site_context_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('branding', 'business_plan', 'html_reference')),
  name text NOT NULL DEFAULT '',
  raw_content_preview text,
  extracted_context jsonb,
  extraction_model text,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed', 'archived')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  
  CONSTRAINT unique_active_version UNIQUE (site_id, document_type, version)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_context_documents_site_id 
  ON site_context_documents(site_id);

CREATE INDEX IF NOT EXISTS idx_site_context_documents_lookup 
  ON site_context_documents(site_id, document_type, status) 
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_site_context_documents_status 
  ON site_context_documents(status) 
  WHERE status = 'ready';

-- Enable Row Level Security
ALTER TABLE site_context_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Site owners can view their documents
CREATE POLICY "Site owners can view context documents"
  ON site_context_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_context_documents.site_id
      AND sites.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = site_context_documents.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

-- Policy: Site owners can insert documents
CREATE POLICY "Site owners can insert context documents"
  ON site_context_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_context_documents.site_id
      AND sites.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = site_context_documents.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

-- Policy: Site owners can update their documents
CREATE POLICY "Site owners can update context documents"
  ON site_context_documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_context_documents.site_id
      AND sites.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = site_context_documents.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_context_documents.site_id
      AND sites.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = site_context_documents.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

-- Policy: Site owners can delete their documents
CREATE POLICY "Site owners can delete context documents"
  ON site_context_documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_context_documents.site_id
      AND sites.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = site_context_documents.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

-- Function to auto-archive old versions (keep last 3)
CREATE OR REPLACE FUNCTION archive_old_context_document_versions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Archive versions beyond the 3 most recent for this site and document type
  UPDATE site_context_documents
  SET 
    status = 'archived',
    archived_at = now(),
    updated_at = now()
  WHERE site_id = NEW.site_id
    AND document_type = NEW.document_type
    AND id != NEW.id
    AND archived_at IS NULL
    AND version NOT IN (
      SELECT version FROM site_context_documents
      WHERE site_id = NEW.site_id
        AND document_type = NEW.document_type
        AND archived_at IS NULL
      ORDER BY version DESC
      LIMIT 3
    );
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-archive old versions when new document is ready
CREATE TRIGGER trigger_archive_old_context_versions
  AFTER UPDATE OF status ON site_context_documents
  FOR EACH ROW
  WHEN (NEW.status = 'ready')
  EXECUTE FUNCTION archive_old_context_document_versions();

-- Function to get next version number
CREATE OR REPLACE FUNCTION get_next_context_document_version(
  p_site_id uuid,
  p_document_type text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_version integer;
BEGIN
  SELECT COALESCE(MAX(version), 0) INTO v_max_version
  FROM site_context_documents
  WHERE site_id = p_site_id
    AND document_type = p_document_type;
  
  RETURN v_max_version + 1;
END;
$$;

-- Grant execute permission on functions
GRANT EXECUTE ON FUNCTION get_next_context_document_version(uuid, text) TO authenticated;
