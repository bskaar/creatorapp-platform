/*
  # Add Favicon URL to Sites

  1. Changes
    - Adds `favicon_url` column to `sites` table
    - Allows each site to have its own custom favicon
    - Users can upload or link to their own favicon images

  2. Notes
    - Column is nullable to maintain backwards compatibility
    - Sites without a favicon will show the default platform favicon
*/

ALTER TABLE sites ADD COLUMN IF NOT EXISTS favicon_url text;