/*
  # Add Orders and Email Logs Tables

  1. New Tables
    - `orders` - Track product purchases and payment status
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `total_amount` (numeric)
      - `status` (text: pending, completed, failed, refunded)
      - `stripe_session_id` (text)
      - `stripe_payment_intent` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `email_logs` - Track all sent emails
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `recipient` (text)
      - `subject` (text)
      - `status` (text: sent, failed, bounced)
      - `provider` (text: resend, sendgrid)
      - `provider_message_id` (text)
      - `error_message` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can view their own orders
    - Users can view their own email logs
    - Only authenticated users can create records

  3. Indexes
    - Index on user_id for fast lookups
    - Index on stripe_session_id for webhook processing
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  customer_email text NOT NULL,
  customer_name text,
  quantity integer NOT NULL DEFAULT 1,
  total_amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_session_id text,
  stripe_payment_intent text,
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

CREATE POLICY "System can update orders"
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
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  provider text NOT NULL DEFAULT 'resend' CHECK (provider IN ('resend', 'sendgrid')),
  provider_message_id text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view site email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = email_logs.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can create email logs"
  ON email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = email_logs.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_email_logs_site_id ON email_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
