/*
  # Create Database Backups Storage Bucket

  1. New Storage Bucket
    - `database-backups` - Private bucket for storing automated database exports
  
  2. Security
    - Bucket is private (not publicly accessible)
    - Only service role can access (used by edge function)
    - No public policies - all access via signed URLs

  3. Notes
    - Backups stored as JSON files
    - Metadata files track backup info
    - Recommend setting up lifecycle rules to auto-delete old backups
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'database-backups',
  'database-backups',
  false,
  104857600,
  ARRAY['application/json']
)
ON CONFLICT (id) DO NOTHING;
