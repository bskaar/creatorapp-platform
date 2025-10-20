/*
  # Setup Supabase Storage Buckets

  1. New Storage Buckets
    - `site-assets` - Public bucket for website images, videos, and media
    - `user-uploads` - Private bucket for user documents and files
    - `page-exports` - Private bucket for exported page HTML/assets

  2. Security
    - Enable RLS on storage.objects
    - Add policies for authenticated users to upload to their site's folders
    - Add policies for public access to published site assets
    - Add policies for users to manage their own uploads

  3. Important Notes
    - Files in site-assets are publicly accessible when published
    - User uploads are private by default
    - Page exports are only accessible to site owners
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('site-assets', 'site-assets', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('user-uploads', 'user-uploads', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/zip'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('page-exports', 'page-exports', false, 104857600, ARRAY['text/html', 'application/zip', 'application/json'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload to site-assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'site-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can update their site-assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'site-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can delete their site-assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'site-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view public site-assets"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'site-assets');

CREATE POLICY "Authenticated users can upload to user-uploads"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own uploads"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own uploads"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own uploads"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can upload page exports"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'page-exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own page exports"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'page-exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own page exports"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'page-exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );