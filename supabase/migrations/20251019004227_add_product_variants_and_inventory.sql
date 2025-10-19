/*
  # Product Variants and Inventory Management

  ## Overview
  This migration enhances the e-commerce system with:
  - Product variants (size, color, etc.)
  - Inventory tracking per variant
  - Low stock alerts
  - Stock history for analytics

  ## New Tables

  ### `product_variants`
  - `id` (uuid, primary key) - Unique variant identifier
  - `product_id` (uuid, foreign key) - Links to products table
  - `sku` (text) - Stock Keeping Unit, unique identifier
  - `name` (text) - Variant name (e.g., "Large / Red")
  - `options` (jsonb) - Variant options like {size: "L", color: "Red"}
  - `price` (decimal) - Variant-specific price override
  - `compare_at_price` (decimal) - Original price for showing discounts
  - `cost_per_item` (decimal) - Cost for profit calculations
  - `stock_quantity` (integer) - Current inventory count
  - `low_stock_threshold` (integer) - Alert threshold
  - `track_inventory` (boolean) - Enable/disable inventory tracking
  - `allow_backorder` (boolean) - Allow orders when out of stock
  - `weight` (decimal) - For shipping calculations
  - `weight_unit` (text) - kg, lb, oz
  - `requires_shipping` (boolean) - Digital vs physical
  - `is_active` (boolean) - Enable/disable variant
  - `sort_order` (integer) - Display order
  - `image_url` (text) - Variant-specific image
  - `barcode` (text) - For scanning systems

  ### `inventory_transactions`
  - Track all inventory changes with full audit trail
  - Support multiple transaction types
  - Reference linking to orders and other entities

  ### `discount_codes`
  - Flexible discount system
  - Usage limits and tracking
  - Time-based validity
  - Product/category targeting

  ## Security
  - Enable RLS on all tables
  - Public can view active variants
  - Site members manage inventory
  - Admins control discounts
*/

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text UNIQUE,
  name text NOT NULL,
  options jsonb DEFAULT '{}'::jsonb,
  price decimal(10,2),
  compare_at_price decimal(10,2),
  cost_per_item decimal(10,2),
  stock_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  track_inventory boolean DEFAULT true,
  allow_backorder boolean DEFAULT false,
  weight decimal(10,2),
  weight_unit text CHECK (weight_unit IN ('kg', 'lb', 'oz', 'g')),
  requires_shipping boolean DEFAULT true,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  image_url text,
  barcode text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('sale', 'restock', 'adjustment', 'return', 'damage', 'loss')),
  quantity_change integer NOT NULL,
  quantity_after integer NOT NULL,
  reference_type text CHECK (reference_type IN ('order', 'manual', 'system', 'refund')),
  reference_id uuid,
  reason text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  code text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value decimal(10,2) NOT NULL,
  minimum_purchase decimal(10,2) DEFAULT 0,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  customer_usage_limit integer DEFAULT 1,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  applies_to jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(site_id, code)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(product_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_variant ON inventory_transactions(variant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created ON inventory_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_discount_codes_site ON discount_codes(site_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(site_id, code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(site_id, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_variants
CREATE POLICY "Anyone can view active product variants"
  ON product_variants
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Site members can view all variants"
  ON product_variants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = product_variants.product_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Site admins can manage variants"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = product_variants.product_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for inventory_transactions
CREATE POLICY "Site members can view inventory transactions"
  ON inventory_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_variants pv
      INNER JOIN products p ON p.id = pv.product_id
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE pv.id = inventory_transactions.variant_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Site admins can manage inventory"
  ON inventory_transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_variants pv
      INNER JOIN products p ON p.id = pv.product_id
      INNER JOIN site_members sm ON sm.site_id = p.site_id
      WHERE pv.id = inventory_transactions.variant_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for discount_codes
CREATE POLICY "Site members can view discount codes"
  ON discount_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = discount_codes.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site admins can manage discount codes"
  ON discount_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = discount_codes.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin')
    )
  );

-- Function to update inventory on transaction
CREATE OR REPLACE FUNCTION update_variant_inventory()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_variants
  SET 
    stock_quantity = stock_quantity + NEW.quantity_change,
    updated_at = now()
  WHERE id = NEW.variant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for inventory updates
CREATE TRIGGER inventory_transaction_update
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_variant_inventory();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_variants_updated_at();

CREATE TRIGGER discount_codes_updated_at
  BEFORE UPDATE ON discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_variants_updated_at();