/*
  # Webhook Reliability and Payment Failure System

  ## Overview
  Adds infrastructure for reliable webhook processing, idempotency,
  event logging, and comprehensive payment failure handling.

  ## New Tables

  ### webhook_events
  Logs all webhook events for debugging and idempotency
  - id (uuid, primary key)
  - event_id (text, unique) - Stripe event ID
  - event_type (text) - Event type (checkout.session.completed, etc.)
  - webhook_type (text) - 'stripe_platform' or 'stripe_commerce'
  - payload (jsonb) - Full event payload
  - processing_status (text) - 'pending', 'processing', 'completed', 'failed'
  - processing_attempts (integer) - Number of processing attempts
  - processing_error (text, nullable) - Error message if failed
  - processed_at (timestamptz, nullable) - When successfully processed
  - created_at (timestamptz)

  ### payment_failures
  Tracks payment failures for analysis and recovery
  - id (uuid, primary key)
  - site_id (uuid) - Related site
  - order_id (uuid, nullable) - Related order if exists
  - stripe_payment_intent_id (text) - Stripe payment intent ID
  - customer_email (text) - Customer email
  - amount (integer) - Amount in cents
  - currency (text) - Currency code
  - failure_code (text) - Stripe failure code
  - failure_message (text) - Human-readable failure message
  - failure_type (text) - 'card_declined', 'insufficient_funds', etc.
  - retry_count (integer) - Number of retry attempts
  - last_retry_at (timestamptz, nullable) - Last retry attempt
  - resolution_status (text) - 'unresolved', 'retrying', 'resolved', 'abandoned'
  - resolved_at (timestamptz, nullable) - When resolved
  - metadata (jsonb) - Additional context
  - created_at (timestamptz)

  ### subscription_changes
  Tracks all subscription lifecycle events
  - id (uuid, primary key)
  - site_id (uuid) - Related site
  - stripe_subscription_id (text) - Stripe subscription ID
  - change_type (text) - 'created', 'updated', 'cancelled', 'expired', 'upgraded', 'downgraded'
  - previous_status (text, nullable) - Previous subscription status
  - new_status (text) - New subscription status
  - previous_plan (text, nullable) - Previous plan name
  - new_plan (text, nullable) - New plan name
  - change_reason (text, nullable) - Reason for change
  - metadata (jsonb) - Additional context
  - created_at (timestamptz)

  ## Indexes
  - Fast webhook event lookups by event_id
  - Payment failure queries by status and site
  - Subscription change history queries

  ## Security
  - RLS enabled on all tables
  - Site owners can view their events
  - Webhook processing uses service role
*/

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  webhook_type text NOT NULL CHECK (webhook_type IN ('stripe_platform', 'stripe_commerce')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processing_status text NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_attempts integer NOT NULL DEFAULT 0,
  processing_error text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for webhook_events
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(processing_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type, created_at DESC);

-- Create payment_failures table
CREATE TABLE IF NOT EXISTS payment_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  stripe_payment_intent_id text NOT NULL,
  customer_email text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  failure_code text,
  failure_message text NOT NULL,
  failure_type text,
  retry_count integer NOT NULL DEFAULT 0,
  last_retry_at timestamptz,
  resolution_status text NOT NULL DEFAULT 'unresolved' CHECK (resolution_status IN ('unresolved', 'retrying', 'resolved', 'abandoned')),
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for payment_failures
CREATE INDEX IF NOT EXISTS idx_payment_failures_site_id ON payment_failures(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_failures_status ON payment_failures(resolution_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_failures_intent ON payment_failures(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_failures_email ON payment_failures(customer_email, created_at DESC);

-- Create subscription_changes table
CREATE TABLE IF NOT EXISTS subscription_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text NOT NULL,
  change_type text NOT NULL CHECK (change_type IN ('created', 'updated', 'cancelled', 'expired', 'upgraded', 'downgraded', 'renewed')),
  previous_status text,
  new_status text NOT NULL,
  previous_plan text,
  new_plan text,
  change_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for subscription_changes
CREATE INDEX IF NOT EXISTS idx_subscription_changes_site ON subscription_changes(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_subscription ON subscription_changes(stripe_subscription_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_type ON subscription_changes(change_type, created_at DESC);

-- Enable RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_events
CREATE POLICY "Service role can manage webhook events"
  ON webhook_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for payment_failures
CREATE POLICY "Site owners can view payment failures"
  ON payment_failures FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage payment failures"
  ON payment_failures FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for subscription_changes
CREATE POLICY "Site owners can view subscription changes"
  ON subscription_changes FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage subscription changes"
  ON subscription_changes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to log webhook event
CREATE OR REPLACE FUNCTION log_webhook_event(
  p_event_id text,
  p_event_type text,
  p_webhook_type text,
  p_payload jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO webhook_events (
    event_id,
    event_type,
    webhook_type,
    payload,
    processing_status
  ) VALUES (
    p_event_id,
    p_event_type,
    p_webhook_type,
    p_payload,
    'pending'
  )
  ON CONFLICT (event_id) DO UPDATE
  SET processing_attempts = webhook_events.processing_attempts + 1
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function to mark webhook event as completed
CREATE OR REPLACE FUNCTION complete_webhook_event(
  p_event_id text,
  p_error text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE webhook_events
  SET 
    processing_status = CASE WHEN p_error IS NULL THEN 'completed' ELSE 'failed' END,
    processing_error = p_error,
    processed_at = CASE WHEN p_error IS NULL THEN now() ELSE NULL END
  WHERE event_id = p_event_id;
END;
$$;

-- Function to log payment failure
CREATE OR REPLACE FUNCTION log_payment_failure(
  p_site_id uuid,
  p_order_id uuid,
  p_stripe_payment_intent_id text,
  p_customer_email text,
  p_amount integer,
  p_currency text,
  p_failure_code text,
  p_failure_message text,
  p_failure_type text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_failure_id uuid;
BEGIN
  INSERT INTO payment_failures (
    site_id,
    order_id,
    stripe_payment_intent_id,
    customer_email,
    amount,
    currency,
    failure_code,
    failure_message,
    failure_type,
    metadata
  ) VALUES (
    p_site_id,
    p_order_id,
    p_stripe_payment_intent_id,
    p_customer_email,
    p_amount,
    p_currency,
    p_failure_code,
    p_failure_message,
    p_failure_type,
    p_metadata
  )
  RETURNING id INTO v_failure_id;
  
  RETURN v_failure_id;
END;
$$;

-- Function to log subscription change
CREATE OR REPLACE FUNCTION log_subscription_change(
  p_site_id uuid,
  p_stripe_subscription_id text,
  p_change_type text,
  p_previous_status text,
  p_new_status text,
  p_previous_plan text DEFAULT NULL,
  p_new_plan text DEFAULT NULL,
  p_change_reason text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_change_id uuid;
BEGIN
  INSERT INTO subscription_changes (
    site_id,
    stripe_subscription_id,
    change_type,
    previous_status,
    new_status,
    previous_plan,
    new_plan,
    change_reason,
    metadata
  ) VALUES (
    p_site_id,
    p_stripe_subscription_id,
    p_change_type,
    p_previous_status,
    p_new_status,
    p_previous_plan,
    p_new_plan,
    p_change_reason,
    p_metadata
  )
  RETURNING id INTO v_change_id;
  
  RETURN v_change_id;
END;
$$;

-- Function to get unresolved payment failures
CREATE OR REPLACE FUNCTION get_unresolved_payment_failures(
  p_site_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  site_id uuid,
  customer_email text,
  amount integer,
  currency text,
  failure_message text,
  retry_count integer,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pf.id,
    pf.site_id,
    pf.customer_email,
    pf.amount,
    pf.currency,
    pf.failure_message,
    pf.retry_count,
    pf.created_at
  FROM payment_failures pf
  WHERE pf.resolution_status = 'unresolved'
    AND (p_site_id IS NULL OR pf.site_id = p_site_id)
  ORDER BY pf.created_at DESC
  LIMIT p_limit;
END;
$$;
