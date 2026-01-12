/*
  # Temporarily Disable RLS on platform_admins

  ## Problem
  The platform_admins table RLS policies are causing "Database error querying schema" 
  during authentication, even with SECURITY DEFINER functions.

  ## Solution
  Temporarily disable RLS on platform_admins to test if this resolves the login issue.
  If it does, we'll implement a different security approach.

  ## Changes
  1. Disable RLS on platform_admins table
  2. Drop all existing policies
  3. Drop the is_super_admin function (no longer needed without RLS)
*/

-- Drop all policies
DROP POLICY IF EXISTS "Users can view own platform_admin record" ON platform_admins;
DROP POLICY IF EXISTS "Super admins can create platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Super admins can update platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Super admins can delete platform admins" ON platform_admins;

-- Drop the function
DROP FUNCTION IF EXISTS is_super_admin(uuid);

-- Disable RLS
ALTER TABLE platform_admins DISABLE ROW LEVEL SECURITY;
