/*
  # Fix Marketing Pages RLS Security Vulnerability

  ## Overview
  Removes overly permissive RLS policies that allowed ANY authenticated user to 
  update or delete marketing pages. Replaces with platform admin-only policies.

  ## Changes Made
  
  ### Dropped Policies (Insecure)
  - "Authenticated users can update marketing pages" - Used USING (true)
  - "Authenticated users can delete marketing pages" - Used USING (true)
  
  ### New Policies (Secure)
  - Platform admins can update marketing pages
  - Platform admins can delete marketing pages
  - Both policies verify platform admin status before allowing access
  
  ## Security Impact
  - BEFORE: Any authenticated user could modify/delete About, Terms, Privacy pages
  - AFTER: Only platform administrators can modify/delete marketing pages
  
  ## Notes
  - Public read access remains unchanged (marketing pages should be publicly readable)
  - Created_by and updated_by tracking preserved
*/

-- Drop the insecure policies
DROP POLICY IF EXISTS "Authenticated users can update marketing pages" ON marketing_pages;
DROP POLICY IF EXISTS "Authenticated users can delete marketing pages" ON marketing_pages;

-- Create secure platform-admin-only policies
CREATE POLICY "Platform admins can update marketing pages"
  ON marketing_pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Platform admins can delete marketing pages"
  ON marketing_pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Platform admins can insert marketing pages"
  ON marketing_pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins 
      WHERE user_id = auth.uid()
    )
  );
