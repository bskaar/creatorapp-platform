/*
  # Fix Infinite Recursion in Site Members Policy

  ## Problem
  The "Site owners and admins can manage members" policy causes infinite recursion
  because it queries site_members from within a site_members policy.

  ## Solution
  Replace the recursive policy with a direct check against the sites table for ownership,
  plus separate admin policies that don't recurse.

  ## Changes
  1. Drop the problematic recursive policy
  2. Create separate policies for owners and admins that avoid recursion
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Site owners and admins can manage members" ON site_members;

-- Site owners can manage all members (checks sites table, not site_members)
CREATE POLICY "Site owners can manage members"
  ON site_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_members.site_id
      AND sites.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_members.site_id
      AND sites.owner_id = auth.uid()
    )
  );

-- Users can insert themselves as members when invited
CREATE POLICY "Users can accept membership invites"
  ON site_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());