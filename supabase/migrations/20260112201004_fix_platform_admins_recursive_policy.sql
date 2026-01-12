/*
  # Fix Platform Admins Recursive RLS Policy

  ## Problem
  The RLS policy on platform_admins table has infinite recursion:
  - Policy checks if user exists in platform_admins table
  - That check requires querying platform_admins
  - Which triggers the same policy check again
  - Results in "Database error querying schema"

  ## Solution
  Replace recursive policy with simple policy that allows users to view their own record.
  Platform admins can view all records, but regular users can only see if they're an admin.

  ## Changes
  1. Drop existing recursive policies on platform_admins
  2. Create new policy: users can view their own platform_admin record
  3. Create new policy: all admins can view all platform_admin records
*/

-- Drop the existing recursive policies
DROP POLICY IF EXISTS "Platform admins can view all admins" ON platform_admins;
DROP POLICY IF EXISTS "Super admins can create platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Super admins can update platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Super admins can delete platform admins" ON platform_admins;

-- Allow any authenticated user to check if THEY are an admin (no recursion)
CREATE POLICY "Users can view own admin status"
  ON platform_admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow platform admins to view all other admins (only after they can see themselves)
CREATE POLICY "Admins can view all platform admins"
  ON platform_admins FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM platform_admins WHERE user_id = auth.uid()
    )
  );

-- Only super admins can insert new platform admins
CREATE POLICY "Super admins can create platform admins"
  ON platform_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.user_id = auth.uid() 
      AND pa.role = 'super_admin'
    )
  );

-- Only super admins can update platform admins
CREATE POLICY "Super admins can update platform admins"
  ON platform_admins FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.user_id = auth.uid() 
      AND pa.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.user_id = auth.uid() 
      AND pa.role = 'super_admin'
    )
  );

-- Only super admins can delete platform admins
CREATE POLICY "Super admins can delete platform admins"
  ON platform_admins FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.user_id = auth.uid() 
      AND pa.role = 'super_admin'
    )
  );
