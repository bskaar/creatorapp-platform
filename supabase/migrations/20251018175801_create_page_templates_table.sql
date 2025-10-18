/*
  # Create Page Templates System

  1. New Tables
    - `page_templates`
      - `id` (uuid, primary key)
      - `name` (text) - Template name (e.g., "SaaS Landing Page")
      - `description` (text) - Brief description of template
      - `category` (text) - Category (landing, sales, course, etc.)
      - `thumbnail_url` (text) - Preview image URL
      - `blocks` (jsonb) - Array of block configurations
      - `theme` (jsonb) - Default theme settings
      - `is_active` (boolean) - Whether template is available
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `page_templates` table
    - Add policy for all authenticated users to read templates
    - Only system can insert/update/delete templates

  3. Notes
    - Templates are system-wide (not per site)
    - Users select templates when creating pages
    - Templates contain pre-configured blocks with placeholder content
*/

CREATE TABLE IF NOT EXISTS page_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'landing',
  thumbnail_url text,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  theme jsonb DEFAULT '{
    "primaryColor": "#3B82F6",
    "secondaryColor": "#10B981",
    "fontFamily": "Inter, sans-serif",
    "borderRadius": "medium"
  }'::jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates"
  ON page_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);
