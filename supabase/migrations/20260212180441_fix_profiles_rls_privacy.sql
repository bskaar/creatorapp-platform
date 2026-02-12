/*
  # Fix Profiles Table Privacy Violation

  ## Overview
  Removes overly permissive RLS policy that allowed ANY authenticated user to 
  view ALL user profiles. Replaces with privacy-respecting policy.

  ## Security Issue
  - BEFORE: "USING (true)" meant any logged-in user could enumerate and view all users
  - This violates user privacy and GDPR data minimization principles
  
  ## Changes Made
  
  ### Dropped Policy (Insecure)
  - "Users can view all profiles" - Used USING (true)
  
  ### New Policy (Secure)
  Users can now ONLY view profiles of:
  1. Themselves
  2. Other members of sites they belong to (colleagues/collaborators)
  3. Platform admins (for support purposes)
  
  ## Security Impact
  - User enumeration prevented
  - Privacy protected - users only see relevant profiles
  - Maintains necessary functionality for collaboration
  
  ## Notes
  - Users can still view their own profile
  - Team collaboration still works (site members can see each other)
  - Platform admins visible to all (for support contact)
*/

-- Drop the insecure policy
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create privacy-respecting policy
CREATE POLICY "Users can view relevant profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    -- Users can always see their own profile
    id = auth.uid()
    OR
    -- Users can see profiles of people they share sites with
    EXISTS (
      SELECT 1 FROM site_members sm1
      JOIN site_members sm2 ON sm1.site_id = sm2.site_id
      WHERE sm1.user_id = auth.uid()
      AND sm2.user_id = profiles.id
    )
    OR
    -- Users can see platform admin profiles (for support)
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = profiles.id
    )
  );
