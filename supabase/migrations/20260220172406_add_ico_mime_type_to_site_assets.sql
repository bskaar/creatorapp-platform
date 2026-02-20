/*
  # Add ICO mime type to site-assets bucket
  
  1. Changes
    - Updates the allowed_mime_types for site-assets bucket to include ICO format
    - ICO is commonly used for favicons
    
  2. Notes
    - ICO files have multiple possible mime types: image/x-icon, image/vnd.microsoft.icon
    - Both are added to ensure compatibility across browsers
*/

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'image/jpeg', 
  'image/png', 
  'image/gif', 
  'image/webp', 
  'image/svg+xml', 
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'video/mp4', 
  'video/webm'
]
WHERE id = 'site-assets';