/*
  # Fix Platform Admins RLS Policies - Remove ALL Recursion

  ## Problem
  The policy "Admins can view all platform admins" still causes recursion:
  - It queries platform_admins table to check if user can view platform_admins
  - This creates infinite recursion
  - Causes "Database error querying schema" during auth

  ## Solution
  Remove the recursive "Admins can view all platform admins" policy entirely.
  Keep only the simple "Users can view own admin status" policy for SELECT.
  This allows authentication to work without recursion.

  ## Changes
  1. Drop ALL existing policies on platform_admins
  2. Create single SELECT policy: users can view ONLY their own record
  3. Keep non-recursive INSERT, UPDATE, DELETE policies
*/

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own admin status" ON platform_admins;
DROP POLICY IF EXISTS "Admins can view all platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can view all admins" ON platform_admins;
DROP POLICY IF EXISTS "Super admins can create platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Super admins can update platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Super admins can delete platform admins" ON platform_admins;

-- Simple policy: users can ONLY view their own admin record (NO recursion)
CREATE POLICY "Users can view own platform_admin record"
  ON platform_admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- For INSERT/UPDATE/DELETE: we need to check if user is a super_admin
-- We can't use platform_admins table in the check without causing recursion
-- Solution: Create a security definer function that bypasses RLS
CREATE OR REPLACE FUNCTION is_super_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM platform_admins 
    WHERE user_id = check_user_id 
    AND role = 'super_admin'
  );
$$;

-- Only super admins can insert new platform admins
CREATE POLICY "Super admins can create platform admins"
  ON platform_admins FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin(auth.uid()));

-- Only super admins can update platform admins
CREATE POLICY "Super admins can update platform admins"
  ON platform_admins FOR UPDATE
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Only super admins can delete platform admins
CREATE POLICY "Super admins can delete platform admins"
  ON platform_admins FOR DELETE
  TO authenticated
  USING (is_super_admin(auth.uid()));
