/*
  # Re-enable RLS on platform_admins with simple policies

  ## Context
  RLS was temporarily disabled to troubleshoot auth issues.
  The real issue was missing authenticator role grants (now fixed).

  ## Security
  Re-enable RLS with simple, non-recursive policies:
  - Users can view their own admin record
  - Admin operations require app-level checks (not RLS)

  ## Changes
  1. Enable RLS on platform_admins
  2. Create simple SELECT policy for own record only
*/

-- Enable RLS
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Simple policy: users can view their own admin record only
CREATE POLICY "Users can view own admin record"
  ON platform_admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Note: INSERT, UPDATE, DELETE for platform_admins should be done via
-- service_role or through application logic, not via RLS policies
