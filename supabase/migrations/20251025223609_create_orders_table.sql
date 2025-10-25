/*
  # Create Orders Table

  1. New Table
    - `orders` - Track product purchases and payment status
      - Compatible with Stripe checkout integration
      - Supports multiple payment providers
      - Tracks payment and fulfillment status

  2. Columns
    - `id` (uuid, primary key)
    - `site_id` (uuid, references sites)
    - `product_id` (uuid, references products)
    - `amount` (numeric) - Order amount
    - `currency` (text) - Currency code
    - `payment_provider` (text) - stripe, paypal, etc.
    - `payment_status` (text) - pending, paid, failed, refunded
    - `external_order_id` (text) - Provider's order/session ID
    - `billing_email` (text) - Customer email
    - `metadata` (jsonb) - Additional order data

  3. Security
    - Enable RLS
    - Site members can view and manage their site's orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  amount numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  payment_provider text NOT NULL DEFAULT 'stripe',
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  external_order_id text,
  billing_email text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view site orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = orders.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = orders.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = orders.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_orders_site_id ON orders(site_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_external_id ON orders(external_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);