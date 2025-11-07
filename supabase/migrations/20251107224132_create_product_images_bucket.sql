/*
  # Create Product Images Storage Bucket

  ## Overview
  Creates a public storage bucket for product images with appropriate RLS policies.

  ## New Buckets
  - `product-images` - Public bucket for product photos

  ## Security
  - Site members can upload images for their products
  - Public read access for all product images
  - Only owners/admins can delete images

  ## Configuration
  - 50MB file size limit per image
  - Allowed types: JPEG, PNG, GIF, WebP
*/

-- Create product-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload product images to their site folders
CREATE POLICY "Site members can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM site_members sm
      INNER JOIN sites s ON s.id = sm.site_id
      WHERE sm.user_id = auth.uid()
      AND (storage.foldername(name))[1] = s.id::text
    )
  );

-- Allow authenticated users to update their product images
CREATE POLICY "Site members can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM site_members sm
      INNER JOIN sites s ON s.id = sm.site_id
      WHERE sm.user_id = auth.uid()
      AND (storage.foldername(name))[1] = s.id::text
    )
  );

-- Allow site admins to delete product images
CREATE POLICY "Site admins can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM site_members sm
      INNER JOIN sites s ON s.id = sm.site_id
      WHERE sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin')
      AND (storage.foldername(name))[1] = s.id::text
    )
  );

-- Allow public read access to all product images
CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');
