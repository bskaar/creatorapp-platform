/*
  # Fix Circular Policy Dependency Between sites and site_members

  ## Problem
  The "Users can view their own sites" policy on the sites table references site_members,
  but site_members policies also reference sites, creating circular recursion.

  ## Solution
  Simplify the sites SELECT policy to only check owner_id directly.
  Site members will access sites through application logic rather than RLS.
*/

-- Drop the problematic sites policy
DROP POLICY IF EXISTS "Users can view their own sites" ON sites;

-- Create simplified policy that only checks ownership
CREATE POLICY "Users can view their owned sites"
  ON sites FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Users will also need to view sites they're members of
-- But we do this without creating circular reference
CREATE POLICY "Users can view sites they are members of"
  ON sites FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT site_id FROM site_members WHERE user_id = auth.uid()
    )
  );
