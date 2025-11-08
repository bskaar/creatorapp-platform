/*
  # Create Product Access Table

  1. New Table
    - `product_access` - Track customer access to purchased products
      - Grants access to courses, memberships, digital products
      - Supports time-limited and lifetime access
      - Tracks active/revoked status

  2. Columns
    - `id` (uuid, primary key)
    - `order_id` (uuid, references orders) - Links to purchase
    - `product_id` (uuid, references products) - Product purchased
    - `customer_email` (text) - Customer's email
    - `site_id` (uuid, references sites) - Site that owns the product
    - `access_granted_at` (timestamptz) - When access was granted
    - `access_expires_at` (timestamptz, nullable) - When access expires (null = lifetime)
    - `access_revoked_at` (timestamptz, nullable) - When access was revoked
    - `is_active` (boolean) - Whether access is currently active
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  3. Security
    - Enable RLS
    - Site members can view their site's access records
    - Customers can view their own access (by email)

  4. Indexes
    - Index on order_id for fast lookups
    - Index on product_id for access checks
    - Index on customer_email for customer portal
    - Index on site_id for site queries
    - Index on is_active for active access queries
*/

CREATE TABLE IF NOT EXISTS product_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  access_granted_at timestamptz DEFAULT now(),
  access_expires_at timestamptz,
  access_revoked_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_access ENABLE ROW LEVEL SECURITY;

-- Site members can view and manage their site's product access records
CREATE POLICY "Site members can view site product access"
  ON product_access
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = product_access.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can insert product access"
  ON product_access
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = product_access.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can update product access"
  ON product_access
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = product_access.site_id
      AND site_members.user_id = auth.uid()
    )
  );

-- Customers can view their own access (useful for customer portal)
CREATE POLICY "Customers can view own access"
  ON product_access
  FOR SELECT
  TO authenticated
  USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_access_order_id ON product_access(order_id);
CREATE INDEX IF NOT EXISTS idx_product_access_product_id ON product_access(product_id);
CREATE INDEX IF NOT EXISTS idx_product_access_customer_email ON product_access(customer_email);
CREATE INDEX IF NOT EXISTS idx_product_access_site_id ON product_access(site_id);
CREATE INDEX IF NOT EXISTS idx_product_access_is_active ON product_access(is_active);
CREATE INDEX IF NOT EXISTS idx_product_access_expires_at ON product_access(access_expires_at) WHERE access_expires_at IS NOT NULL;

-- Unique constraint: one access record per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_access_order_unique ON product_access(order_id);
