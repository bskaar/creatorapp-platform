/*
  # Fix Infinite Recursion in site_members RLS Policy

  ## Problem
  The policy "Users can view site members where they are members" has infinite recursion
  because it checks site_members.user_id within a policy on site_members itself.

  ## Solution
  Replace the recursive policy with simpler, direct checks:
  1. Users can see memberships where they are the user
  2. Site owners can see all members of their sites
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view site members where they are members" ON site_members;

-- Drop the overly broad "manage members" policy
DROP POLICY IF EXISTS "Site owners and admins can manage members" ON site_members;

-- Create new non-recursive policies
CREATE POLICY "Users can view their own memberships"
  ON site_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Site owners can view all members"
  ON site_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_members.site_id
      AND sites.owner_id = auth.uid()
    )
  );

CREATE POLICY "Site owners can insert members"
  ON site_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_members.site_id
      AND sites.owner_id = auth.uid()
    )
  );

CREATE POLICY "Site owners can update members"
  ON site_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_members.site_id
      AND sites.owner_id = auth.uid()
    )
  );

CREATE POLICY "Site owners can delete members"
  ON site_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_members.site_id
      AND sites.owner_id = auth.uid()
    )
  );
