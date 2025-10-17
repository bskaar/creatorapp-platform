/*
  # Commerce, Webinars, and Analytics Schema

  ## Overview
  This migration adds commerce (orders, subscriptions), webinar management,
  and comprehensive analytics tracking for the Creator CMS.

  ## New Tables Created

  ### 1. Commerce
  - `orders` - Purchase records from all payment sources
    - Supports PayPal, Shopify, and manual orders
    - Links to products and contacts for access provisioning
  - `subscriptions` - Recurring payment tracking
    - Billing cycle management, failed payment tracking, dunning
  - `product_access` - Grants access to purchased products
    - Time-limited and lifetime access support

  ### 2. Webinars
  - `webinars` - Live and automated webinar events
    - Scheduling, streaming URLs, replay settings
  - `webinar_registrations` - Attendee registrations
    - Registration tracking, attendance monitoring

  ### 3. Analytics
  - `analytics_events` - Comprehensive event tracking
    - Page views, clicks, conversions, custom events
  - `funnel_analytics` - Funnel step conversion tracking
  - `contact_activities` - Unified activity timeline
    - Emails, purchases, page visits, lesson completions

  ## Security
  - RLS enabled on all tables
  - Multi-tenant isolation
  - Role-based permissions
  - Payment data encrypted at rest

  ## Performance
  - Time-series indexes for analytics queries
  - Composite indexes for reporting
  - Partitioning ready for high-volume event data
*/

-- =====================================================
-- ORDERS (Purchase records)
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_provider text NOT NULL CHECK (payment_provider IN ('paypal', 'shopify', 'stripe', 'manual')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  external_order_id text,
  external_customer_id text,
  payment_method text,
  billing_email text,
  billing_name text,
  billing_address jsonb,
  tax_amount decimal(10,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  discount_code text,
  metadata jsonb DEFAULT '{}'::jsonb,
  paid_at timestamptz,
  refunded_at timestamptz,
  refund_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_site ON orders(site_id);
CREATE INDEX IF NOT EXISTS idx_orders_contact ON orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(site_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_external ON orders(payment_provider, external_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = orders.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site admins can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = orders.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'support')
    )
  );

-- =====================================================
-- SUBSCRIPTIONS (Recurring payments)
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired', 'past_due')),
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_provider text NOT NULL CHECK (payment_provider IN ('paypal', 'shopify', 'stripe')),
  external_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_billing_date timestamptz,
  trial_end_date timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  failed_payment_count int DEFAULT 0,
  last_payment_attempt timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_site ON subscriptions(site_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_contact ON subscriptions(contact_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_product ON subscriptions(product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(site_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_external ON subscriptions(payment_provider, external_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = subscriptions.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site admins can manage subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = subscriptions.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'support')
    )
  );

-- =====================================================
-- PRODUCT ACCESS (Access grants to products)
-- =====================================================

CREATE TABLE IF NOT EXISTS product_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  access_type text DEFAULT 'purchased' CHECK (access_type IN ('purchased', 'gifted', 'trial', 'manual')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoke_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, contact_id),
  UNIQUE(product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_product_access_site ON product_access(site_id);
CREATE INDEX IF NOT EXISTS idx_product_access_contact ON product_access(contact_id);
CREATE INDEX IF NOT EXISTS idx_product_access_user ON product_access(user_id);
CREATE INDEX IF NOT EXISTS idx_product_access_product ON product_access(product_id);
CREATE INDEX IF NOT EXISTS idx_product_access_status ON product_access(status);
CREATE INDEX IF NOT EXISTS idx_product_access_expires ON product_access(expires_at);

ALTER TABLE product_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access"
  ON product_access FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = product_access.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site admins can manage product access"
  ON product_access FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = product_access.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'support')
    )
  );

-- =====================================================
-- WEBINARS (Live and automated events)
-- =====================================================

CREATE TABLE IF NOT EXISTS webinars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  webinar_type text NOT NULL CHECK (webinar_type IN ('live', 'automated', 'hybrid')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'live', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  duration_minutes int DEFAULT 60,
  timezone text DEFAULT 'UTC',
  registration_page_id uuid REFERENCES pages(id) ON DELETE SET NULL,
  thank_you_page_id uuid REFERENCES pages(id) ON DELETE SET NULL,
  stream_url text,
  replay_url text,
  replay_available boolean DEFAULT false,
  replay_expires_at timestamptz,
  max_attendees int,
  registration_count int DEFAULT 0,
  attendance_count int DEFAULT 0,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webinars_site ON webinars(site_id);
CREATE INDEX IF NOT EXISTS idx_webinars_status ON webinars(site_id, status);
CREATE INDEX IF NOT EXISTS idx_webinars_scheduled ON webinars(scheduled_at);

ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view webinars"
  ON webinars FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = webinars.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage webinars"
  ON webinars FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = webinars.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer', 'creator')
    )
  );

-- =====================================================
-- WEBINAR REGISTRATIONS (Attendee tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS webinar_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id uuid REFERENCES webinars(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  registered_at timestamptz DEFAULT now(),
  attended boolean DEFAULT false,
  attended_at timestamptz,
  watch_duration_minutes int DEFAULT 0,
  left_at timestamptz,
  replay_watched boolean DEFAULT false,
  replay_watched_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(webinar_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_webinar_registrations_webinar ON webinar_registrations(webinar_id);
CREATE INDEX IF NOT EXISTS idx_webinar_registrations_contact ON webinar_registrations(contact_id);
CREATE INDEX IF NOT EXISTS idx_webinar_registrations_attended ON webinar_registrations(webinar_id, attended);

ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view webinar registrations"
  ON webinar_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM webinars w
      JOIN site_members sm ON sm.site_id = w.site_id
      WHERE w.id = webinar_registrations.webinar_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can manage webinar registrations"
  ON webinar_registrations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM webinars w
      JOIN site_members sm ON sm.site_id = w.site_id
      WHERE w.id = webinar_registrations.webinar_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'marketer', 'support')
    )
  );

-- =====================================================
-- ANALYTICS EVENTS (Comprehensive event tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  event_name text,
  event_data jsonb DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  session_id text,
  page_id uuid REFERENCES pages(id) ON DELETE SET NULL,
  page_url text,
  referrer_url text,
  ip_address text,
  user_agent text,
  device_type text,
  browser text,
  os text,
  country text,
  city text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_site ON analytics_events(site_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(site_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_contact ON analytics_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON analytics_events(page_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_data ON analytics_events USING gin(event_data);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = analytics_events.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can insert analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = analytics_events.site_id
      AND site_members.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNNEL ANALYTICS (Step conversion tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS funnel_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id uuid REFERENCES funnels(id) ON DELETE CASCADE NOT NULL,
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE NOT NULL,
  step_order int NOT NULL,
  date date NOT NULL,
  views_count int DEFAULT 0,
  unique_visitors_count int DEFAULT 0,
  conversions_count int DEFAULT 0,
  revenue decimal(10,2) DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(funnel_id, page_id, date)
);

CREATE INDEX IF NOT EXISTS idx_funnel_analytics_funnel ON funnel_analytics(funnel_id);
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_page ON funnel_analytics(page_id);
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_date ON funnel_analytics(date DESC);

ALTER TABLE funnel_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view funnel analytics"
  ON funnel_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM funnels f
      JOIN site_members sm ON sm.site_id = f.site_id
      WHERE f.id = funnel_analytics.funnel_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can manage funnel analytics"
  ON funnel_analytics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM funnels f
      JOIN site_members sm ON sm.site_id = f.site_id
      WHERE f.id = funnel_analytics.funnel_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'marketer')
    )
  );

-- =====================================================
-- CONTACT ACTIVITIES (Unified timeline)
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('email_sent', 'email_opened', 'email_clicked', 'page_visited', 'form_submitted', 'product_purchased', 'lesson_completed', 'webinar_registered', 'webinar_attended', 'tag_added', 'tag_removed', 'note_added', 'custom')),
  activity_title text NOT NULL,
  activity_description text,
  activity_data jsonb DEFAULT '{}'::jsonb,
  related_id uuid,
  related_type text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_activities_site ON contact_activities(site_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact ON contact_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_type ON contact_activities(contact_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_contact_activities_created ON contact_activities(created_at DESC);

ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view contact activities"
  ON contact_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = contact_activities.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can manage contact activities"
  ON contact_activities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = contact_activities.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer', 'support')
    )
  );