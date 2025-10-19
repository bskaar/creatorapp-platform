/*
  # Analytics and Insights System

  ## Overview
  This migration creates comprehensive analytics tracking with:
  - Real-time visitor tracking
  - Event tracking (views, clicks, conversions)
  - Funnel analytics
  - Revenue tracking
  - User journey mapping

  ## New Tables

  ### `analytics_sessions`
  - `id` (uuid, primary key)
  - `site_id` (uuid, foreign key)
  - `visitor_id` (text) - Anonymous visitor identifier
  - `contact_id` (uuid, foreign key) - If identified
  - `started_at` (timestamptz) - Session start
  - `last_activity_at` (timestamptz) - Last activity
  - `ended_at` (timestamptz) - Session end
  - `page_views` (integer) - Number of pages viewed
  - `utm_source` (text) - Traffic source
  - `utm_medium` (text)
  - `utm_campaign` (text)
  - `utm_term` (text)
  - `utm_content` (text)
  - `referrer` (text) - Referring URL
  - `landing_page` (text) - First page visited
  - `device_type` (text) - desktop, mobile, tablet
  - `browser` (text)
  - `os` (text)
  - `country` (text)
  - `city` (text)
  - `ip_address` (text)

  ### `analytics_page_views`
  - `id` (uuid, primary key)
  - `site_id` (uuid, foreign key)
  - `session_id` (uuid, foreign key)
  - `page_id` (uuid, foreign key)
  - `page_url` (text)
  - `page_title` (text)
  - `viewed_at` (timestamptz)
  - `time_on_page` (integer) - Seconds
  - `scroll_depth` (integer) - Percentage

  ### `analytics_conversions`
  - `id` (uuid, primary key)
  - `site_id` (uuid, foreign key)
  - `session_id` (uuid, foreign key)
  - `contact_id` (uuid, foreign key)
  - `conversion_type` (text) - lead, sale, signup, download
  - `conversion_value` (decimal) - Revenue value
  - `page_id` (uuid, foreign key)
  - `funnel_id` (uuid, foreign key)
  - `order_id` (uuid, foreign key)
  - `converted_at` (timestamptz)

  ### `analytics_revenue_summary`
  - `id` (uuid, primary key)
  - `site_id` (uuid, foreign key)
  - `date` (date) - Summary date
  - `revenue` (decimal)
  - `order_count` (integer)
  - `average_order_value` (decimal)
  - `refund_amount` (decimal)
  - `new_customers` (integer)
  - `returning_customers` (integer)

  ## Indexes
  - Time-based queries for dashboards
  - Session and visitor lookups
  - Conversion tracking
  - Revenue reporting

  ## Security
  - RLS enabled
  - Site-based isolation
  - Aggregated data accessible to site members
*/

-- Create analytics_sessions table
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  started_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  page_views integer DEFAULT 0,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  landing_page text,
  device_type text CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser text,
  os text,
  country text,
  city text,
  ip_address text
);

-- Create analytics_page_views table
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  session_id uuid REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  page_id uuid REFERENCES pages(id) ON DELETE SET NULL,
  page_url text NOT NULL,
  page_title text,
  viewed_at timestamptz DEFAULT now(),
  time_on_page integer,
  scroll_depth integer CHECK (scroll_depth >= 0 AND scroll_depth <= 100)
);

-- Create analytics_conversions table
CREATE TABLE IF NOT EXISTS analytics_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  session_id uuid REFERENCES analytics_sessions(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  conversion_type text NOT NULL CHECK (conversion_type IN ('lead', 'sale', 'signup', 'download', 'registration', 'custom')),
  conversion_value decimal(10,2) DEFAULT 0,
  page_id uuid REFERENCES pages(id) ON DELETE SET NULL,
  funnel_id uuid REFERENCES funnels(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  converted_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create analytics_revenue_summary table
CREATE TABLE IF NOT EXISTS analytics_revenue_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  date date NOT NULL,
  revenue decimal(10,2) DEFAULT 0,
  order_count integer DEFAULT 0,
  average_order_value decimal(10,2) DEFAULT 0,
  refund_amount decimal(10,2) DEFAULT 0,
  new_customers integer DEFAULT 0,
  returning_customers integer DEFAULT 0,
  UNIQUE(site_id, date)
);

-- Create indexes for analytics_sessions
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_site ON analytics_sessions(site_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor ON analytics_sessions(site_id, visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_contact ON analytics_sessions(contact_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_active ON analytics_sessions(site_id) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_utm ON analytics_sessions(site_id, utm_source, utm_medium, utm_campaign);

-- Create indexes for analytics_page_views
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_site ON analytics_page_views(site_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session ON analytics_page_views(session_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_page ON analytics_page_views(page_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_url ON analytics_page_views(site_id, page_url);

-- Create indexes for analytics_conversions
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_site ON analytics_conversions(site_id, converted_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_type ON analytics_conversions(site_id, conversion_type, converted_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_session ON analytics_conversions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_contact ON analytics_conversions(contact_id);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_funnel ON analytics_conversions(funnel_id, converted_at DESC);

-- Create indexes for analytics_revenue_summary
CREATE INDEX IF NOT EXISTS idx_analytics_revenue_summary_site ON analytics_revenue_summary(site_id, date DESC);

-- Enable RLS
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_revenue_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_sessions
CREATE POLICY "Site members can view sessions"
  ON analytics_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = analytics_sessions.site_id
      AND site_members.user_id = auth.uid()
    )
  );

-- RLS Policies for analytics_page_views
CREATE POLICY "Site members can view page views"
  ON analytics_page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = analytics_page_views.site_id
      AND site_members.user_id = auth.uid()
    )
  );

-- RLS Policies for analytics_conversions
CREATE POLICY "Site members can view conversions"
  ON analytics_conversions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = analytics_conversions.site_id
      AND site_members.user_id = auth.uid()
    )
  );

-- RLS Policies for analytics_revenue_summary
CREATE POLICY "Site members can view revenue"
  ON analytics_revenue_summary FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = analytics_revenue_summary.site_id
      AND site_members.user_id = auth.uid()
    )
  );

-- Function to update session page view count
CREATE OR REPLACE FUNCTION update_session_page_views()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE analytics_sessions
    SET 
      page_views = page_views + 1,
      last_activity_at = NEW.viewed_at
    WHERE id = NEW.session_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_page_view_update
  AFTER INSERT ON analytics_page_views
  FOR EACH ROW
  EXECUTE FUNCTION update_session_page_views();

-- Function to calculate daily revenue summary
CREATE OR REPLACE FUNCTION calculate_daily_revenue_summary(
  p_site_id uuid,
  p_date date
)
RETURNS void AS $$
BEGIN
  INSERT INTO analytics_revenue_summary (
    site_id,
    date,
    revenue,
    order_count,
    average_order_value,
    refund_amount,
    new_customers,
    returning_customers
  )
  SELECT
    p_site_id,
    p_date,
    COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0) as revenue,
    COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as order_count,
    COALESCE(AVG(CASE WHEN payment_status = 'completed' THEN amount END), 0) as average_order_value,
    COALESCE(SUM(CASE WHEN payment_status = 'refunded' THEN amount ELSE 0 END), 0) as refund_amount,
    COUNT(DISTINCT CASE 
      WHEN payment_status = 'completed' 
      AND NOT EXISTS (
        SELECT 1 FROM orders o2 
        WHERE o2.contact_id = orders.contact_id 
        AND o2.paid_at < orders.paid_at
        AND o2.payment_status = 'completed'
      )
      THEN orders.contact_id 
    END) as new_customers,
    COUNT(DISTINCT CASE 
      WHEN payment_status = 'completed' 
      AND EXISTS (
        SELECT 1 FROM orders o2 
        WHERE o2.contact_id = orders.contact_id 
        AND o2.paid_at < orders.paid_at
        AND o2.payment_status = 'completed'
      )
      THEN orders.contact_id 
    END) as returning_customers
  FROM orders
  WHERE site_id = p_site_id
  AND paid_at::date = p_date
  ON CONFLICT (site_id, date) 
  DO UPDATE SET
    revenue = EXCLUDED.revenue,
    order_count = EXCLUDED.order_count,
    average_order_value = EXCLUDED.average_order_value,
    refund_amount = EXCLUDED.refund_amount,
    new_customers = EXCLUDED.new_customers,
    returning_customers = EXCLUDED.returning_customers;
END;
$$ LANGUAGE plpgsql;