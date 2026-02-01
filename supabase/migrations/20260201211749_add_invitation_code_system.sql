/*
  # Add Invitation Code System

  1. New Tables
    - `invitation_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique) - The invitation code itself
      - `max_uses` (integer) - Maximum number of times code can be used (null = unlimited)
      - `uses_count` (integer) - Current number of uses
      - `expires_at` (timestamptz) - When code expires (null = never)
      - `is_active` (boolean) - Whether code is active
      - `created_by` (uuid) - Platform admin who created it
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `notes` (text) - Admin notes about the code

    - `invitation_code_uses`
      - `id` (uuid, primary key)
      - `code_id` (uuid) - Reference to invitation_codes
      - `user_id` (uuid) - User who used the code
      - `used_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Only platform admins can create/view/manage codes
    - Public can validate codes during signup (via edge function)
    - Track all code usage for audit purposes

  3. Notes
    - Codes are case-insensitive
    - Codes can be single-use or multi-use
    - Expired codes are automatically invalid
    - Inactive codes cannot be used
    - Full audit trail of code usage
*/

-- Create invitation_codes table
CREATE TABLE IF NOT EXISTS invitation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  max_uses integer DEFAULT NULL,
  uses_count integer DEFAULT 0 NOT NULL,
  expires_at timestamptz DEFAULT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  notes text DEFAULT ''
);

-- Create invitation_code_uses table
CREATE TABLE IF NOT EXISTS invitation_code_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid REFERENCES invitation_codes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  used_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invitation_codes_code ON invitation_codes(code);
CREATE INDEX IF NOT EXISTS idx_invitation_codes_active ON invitation_codes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_invitation_code_uses_code_id ON invitation_code_uses(code_id);
CREATE INDEX IF NOT EXISTS idx_invitation_code_uses_user_id ON invitation_code_uses(user_id);

-- Enable RLS
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_code_uses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitation_codes

-- Platform admins can view all codes
CREATE POLICY "Platform admins can view all invitation codes"
  ON invitation_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE platform_admins.user_id = auth.uid()
    )
  );

-- Platform admins can create codes
CREATE POLICY "Platform admins can create invitation codes"
  ON invitation_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE platform_admins.user_id = auth.uid()
    )
  );

-- Platform admins can update codes
CREATE POLICY "Platform admins can update invitation codes"
  ON invitation_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE platform_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE platform_admins.user_id = auth.uid()
    )
  );

-- Platform admins can delete codes
CREATE POLICY "Platform admins can delete invitation codes"
  ON invitation_codes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE platform_admins.user_id = auth.uid()
    )
  );

-- RLS Policies for invitation_code_uses

-- Platform admins can view all code uses
CREATE POLICY "Platform admins can view all code uses"
  ON invitation_code_uses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE platform_admins.user_id = auth.uid()
    )
  );

-- System can track code uses (via edge function)
CREATE POLICY "System can create code use records"
  ON invitation_code_uses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to validate and use invitation code
CREATE OR REPLACE FUNCTION validate_invitation_code(code_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_record invitation_codes%ROWTYPE;
  result jsonb;
BEGIN
  -- Find the code (case-insensitive)
  SELECT * INTO code_record
  FROM invitation_codes
  WHERE LOWER(code) = LOWER(code_text)
  AND is_active = true;

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid invitation code'
    );
  END IF;

  -- Check if code has expired
  IF code_record.expires_at IS NOT NULL AND code_record.expires_at < now() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This invitation code has expired'
    );
  END IF;

  -- Check if code has reached max uses
  IF code_record.max_uses IS NOT NULL AND code_record.uses_count >= code_record.max_uses THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This invitation code has been fully used'
    );
  END IF;

  -- Code is valid
  RETURN jsonb_build_object(
    'valid', true,
    'code_id', code_record.id,
    'message', 'Invitation code is valid'
  );
END;
$$;

-- Function to increment code usage
CREATE OR REPLACE FUNCTION use_invitation_code(code_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Increment usage count
  UPDATE invitation_codes
  SET uses_count = uses_count + 1,
      updated_at = now()
  WHERE id = code_id_param;

  -- Record the usage
  INSERT INTO invitation_code_uses (code_id, user_id, used_at)
  VALUES (code_id_param, user_id_param, now());

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Insert some starter codes for testing
INSERT INTO invitation_codes (code, max_uses, notes, created_by)
VALUES 
  ('ADMIN2025', 1, 'Admin access code for initial setup', NULL),
  ('BETA100', 100, 'Beta tester access - 100 uses', NULL),
  ('LAUNCH', NULL, 'Public launch code - unlimited uses', NULL)
ON CONFLICT (code) DO NOTHING;