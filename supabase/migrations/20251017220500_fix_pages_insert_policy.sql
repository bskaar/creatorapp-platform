/*
  # Fix Pages Table INSERT Policy

  ## Overview
  This migration fixes the RLS policy for the pages table to allow INSERT operations.
  The existing "FOR ALL" policy only had a USING clause, which doesn't cover INSERT.

  ## Changes
  1. Drop the existing "FOR ALL" policy
  2. Create separate policies for SELECT, INSERT, UPDATE, and DELETE
  3. Each policy properly checks site membership and role permissions

  ## Security
  - Maintains existing security model
  - Ensures marketers, admins, and owners can create pages
  - Proper WITH CHECK clause for INSERT operations
*/

-- Drop the existing policy that doesn't handle INSERT properly
DROP POLICY IF EXISTS "Site marketers can manage pages" ON pages;

-- Create separate policies for each operation

-- SELECT policy
CREATE POLICY "Site members can select pages"
  ON pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = pages.site_id
      AND site_members.user_id = auth.uid()
    )
  );

-- INSERT policy
CREATE POLICY "Site marketers can insert pages"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = pages.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  );

-- UPDATE policy
CREATE POLICY "Site marketers can update pages"
  ON pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = pages.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = pages.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  );

-- DELETE policy
CREATE POLICY "Site marketers can delete pages"
  ON pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = pages.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  );
