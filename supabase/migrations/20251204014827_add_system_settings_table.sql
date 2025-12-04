/*
  # Add System Settings Table

  1. New Table
    - `system_settings`
      - `key` (text, primary key) - Setting name/key
      - `value` (text) - Setting value
      - `description` (text) - Description of what this setting does
      - `is_secret` (boolean) - Whether this is a sensitive value
      - `created_at` (timestamptz) - When the setting was created
      - `updated_at` (timestamptz) - When the setting was last updated

  2. Security
    - Enable RLS on the table
    - Only platform admins can read/write system settings
    - Regular users cannot access this table

  3. Initial Data
    - Insert FRONTEND_URL setting with default value
*/

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  is_secret boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view system settings
CREATE POLICY "Platform admins can view system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE platform_admins.user_id = auth.uid()
    )
  );

-- Only platform admins can insert system settings
CREATE POLICY "Platform admins can insert system settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE platform_admins.user_id = auth.uid()
    )
  );

-- Only platform admins can update system settings
CREATE POLICY "Platform admins can update system settings"
  ON system_settings FOR UPDATE
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

-- Only platform admins can delete system settings
CREATE POLICY "Platform admins can delete system settings"
  ON system_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE platform_admins.user_id = auth.uid()
    )
  );

-- Insert initial FRONTEND_URL setting
INSERT INTO system_settings (key, value, description, is_secret)
VALUES (
  'FRONTEND_URL',
  'http://localhost:5173',
  'The frontend application URL used for redirects and webhooks',
  false
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();