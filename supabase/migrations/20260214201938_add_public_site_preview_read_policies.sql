/*
  # Add public read access for site preview

  This migration adds RLS policies so that anonymous (unauthenticated) visitors
  can view published public sites, their published pages, and published products.
  This is required for the public site preview feature (`/s/:slug` route).

  1. Security Changes
    - `sites` table: Allow anonymous SELECT for active sites only
    - `pages` table: Allow anonymous SELECT for published pages belonging to active sites
    - `products` table: Allow anonymous SELECT for published products belonging to active sites

  2. Important Notes
    - These policies only grant READ access, never write
    - Only active sites and published content is visible
    - The policies use subqueries to verify the parent site is active
    - Existing authenticated policies remain unchanged
*/

CREATE POLICY "Public can view active sites"
  ON sites
  FOR SELECT
  TO anon
  USING (status = 'active');

CREATE POLICY "Public can view published pages of active sites"
  ON pages
  FOR SELECT
  TO anon
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = pages.site_id
      AND sites.status = 'active'
    )
  );

CREATE POLICY "Public can view published products of active sites"
  ON products
  FOR SELECT
  TO anon
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = products.site_id
      AND sites.status = 'active'
    )
  );
