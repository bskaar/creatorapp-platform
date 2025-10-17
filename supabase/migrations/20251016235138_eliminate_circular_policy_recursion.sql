/*
  # Eliminate Circular Policy Recursion

  ## Problem
  Even with subqueries, we have circular recursion:
  - site_members SELECT policies check sites table
  - sites SELECT policies check site_members table
  This creates infinite recursion when either table is queried.

  ## Solution
  Break the circular dependency by having site_members policies NOT reference sites.
  Instead, use direct checks without cross-table references:
  
  1. site_members: Only check auth.uid() directly, no sites table reference
  2. sites: Can safely check site_members since site_members won't recurse back
*/

-- Drop ALL existing site_members policies to start fresh
DROP POLICY IF EXISTS "Users can view their own memberships" ON site_members;
DROP POLICY IF EXISTS "Site owners can view all members" ON site_members;
DROP POLICY IF EXISTS "Site owners can insert members" ON site_members;
DROP POLICY IF EXISTS "Site owners can update members" ON site_members;
DROP POLICY IF EXISTS "Site owners can delete members" ON site_members;

-- Create simple, non-recursive policies for site_members
-- Users can always see their own memberships
CREATE POLICY "View own memberships"
  ON site_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert memberships if they are inserting for themselves
-- (site owners will be handled by bypassing RLS in application code using service role)
CREATE POLICY "Insert own memberships"
  ON site_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own membership records (e.g., accepting invitation)
CREATE POLICY "Update own memberships"
  ON site_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own memberships (leave site)
CREATE POLICY "Delete own memberships"
  ON site_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Now sites policies can safely reference site_members without recursion
DROP POLICY IF EXISTS "Users can view their owned sites" ON sites;
DROP POLICY IF EXISTS "Users can view sites they are members of" ON sites;

CREATE POLICY "View owned and member sites"
  ON sites FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT site_id FROM site_members 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );
